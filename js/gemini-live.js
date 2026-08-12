/**
 * GeminiLive — tính năng gọi thoại (voice call) dùng Gemini Live API qua WebSocket.
 * Model cố định: gemini-3.1-flash-live-preview (theo yêu cầu, không cho người dùng đổi).
 *
 * Luồng hoạt động:
 *  1. Mở WebSocket tới Live API, gửi message "setup" đầu tiên.
 *  2. Xin quyền micro, capture audio qua AudioWorklet, resample về PCM16 16kHz,
 *     encode base64, gửi liên tục qua "realtimeInput".
 *  3. Nhận audio PCM 24kHz từ server (base64 trong serverContent.modelTurn.parts),
 *     giải mã và phát tuần tự qua hàng đợi AudioBufferSourceNode để không giật/chồng tiếng.
 *  4. Hiển thị transcript (input/output) nếu server trả về, cập nhật trạng thái UI.
 */
const GeminiLive = (() => {
  const WS_URL_BASE = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';
  const SEND_SAMPLE_RATE = 16000;   // tần số audio gửi lên Gemini
  const RECEIVE_SAMPLE_RATE = 24000; // tần số audio Gemini trả về

  // AudioWorklet xử lý capture mic: nhận Float32 từ input, gửi từng block ra main thread
  // qua port.postMessage để main thread tự resample + encode (worklet chỉ làm việc nhẹ).
  const CAPTURE_WORKLET_CODE = `
    class CaptureProcessor extends AudioWorkletProcessor {
      constructor() {
        super();
        this._buffer = [];
      }
      process(inputs) {
        const input = inputs[0];
        if (input && input[0]) {
          // input[0] là Float32Array mono (đã downmix bởi Web Audio nếu cần)
          this.port.postMessage(input[0].slice());
        }
        return true;
      }
    }
    registerProcessor('capture-processor', CaptureProcessor);
  `;

  let ws = null;
  let audioCtxIn = null;   // AudioContext cho capture (sample rate gốc của thiết bị, thường 44100/48000)
  let audioCtxOut = null;  // AudioContext cho playback (24000 Hz)
  let micStream = null;
  let workletNode = null;
  let sourceNode = null;

  let playHeadTime = 0;    // thời điểm (audioCtxOut.currentTime) tiếp theo sẽ phát audio
  let playingSources = [];

  let isMuted = false;
  let isSessionActive = false;
  let isConnecting = false;
  let sessionSetupDone = false;

  let currentOutputTranscript = '';

  // DOM refs
  let overlay, statusDot, statusText, transcriptText, orb, muteBtn, endBtn, openBtn;

  function init() {
    overlay = document.getElementById('voice-overlay');
    statusDot = document.getElementById('voice-status-dot');
    statusText = document.getElementById('voice-status-text');
    transcriptText = document.getElementById('voice-transcript-text');
    orb = document.getElementById('voice-orb');
    muteBtn = document.getElementById('btn-mute-voice');
    endBtn = document.getElementById('btn-end-voice');
    openBtn = document.getElementById('btn-open-voice');

    openBtn.addEventListener('click', startCall);
    endBtn.addEventListener('click', endCall);
    muteBtn.addEventListener('click', toggleMute);
  }

  // ================== Bắt đầu / kết thúc cuộc gọi ==================
  async function startCall() {
    if (isSessionActive || isConnecting) return;

    if (!AISettings.hasApiKey()) {
      UI_Toast.show('⚠️ Bạn chưa nhập API key Gemini. Nhấn biểu tượng 🔑 để cài đặt.', 'err');
      return;
    }

    overlay.classList.add('active');
    setStatus('connecting', 'Đang kết nối...');
    isConnecting = true;
    resetTranscript();

    try {
      await setupAudioContexts();
      await connectWebSocket();
    } catch (err) {
      console.error('GeminiLive startCall error:', err);
      setStatus('error', 'Không thể kết nối');
      showTranscriptLine('Lỗi: ' + describeError(err));
      isConnecting = false;
      // Đóng overlay sau một chút để người dùng đọc được lỗi
      setTimeout(() => {
        if (!isSessionActive) cleanupAndCloseOverlay();
      }, 2500);
    }
  }

  function endCall() {
    cleanupAndCloseOverlay();
  }

  function cleanupAndCloseOverlay() {
    teardownSession();
    overlay.classList.remove('active');
  }

  function teardownSession() {
    isSessionActive = false;
    isConnecting = false;
    sessionSetupDone = false;

    if (ws) {
      try { ws.close(); } catch (e) { /* ignore */ }
      ws = null;
    }

    if (workletNode) {
      try { workletNode.disconnect(); } catch (e) { /* ignore */ }
      workletNode = null;
    }
    if (sourceNode) {
      try { sourceNode.disconnect(); } catch (e) { /* ignore */ }
      sourceNode = null;
    }
    if (micStream) {
      micStream.getTracks().forEach(t => t.stop());
      micStream = null;
    }
    if (audioCtxIn) {
      try { audioCtxIn.close(); } catch (e) { /* ignore */ }
      audioCtxIn = null;
    }
    stopAllPlayback();
    if (audioCtxOut) {
      try { audioCtxOut.close(); } catch (e) { /* ignore */ }
      audioCtxOut = null;
    }

    isMuted = false;
    muteBtn.classList.remove('muted');
    muteBtn.textContent = '🎤';
    orb.style.transform = 'scale(1)';
  }

  // ================== Audio setup ==================
  async function setupAudioContexts() {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    audioCtxIn = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxOut = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: RECEIVE_SAMPLE_RATE });
    playHeadTime = audioCtxOut.currentTime;

    const workletBlob = new Blob([CAPTURE_WORKLET_CODE], { type: 'application/javascript' });
    const workletUrl = URL.createObjectURL(workletBlob);
    await audioCtxIn.audioWorklet.addModule(workletUrl);
    URL.revokeObjectURL(workletUrl);

    sourceNode = audioCtxIn.createMediaStreamSource(micStream);
    workletNode = new AudioWorkletNode(audioCtxIn, 'capture-processor');

    workletNode.port.onmessage = (event) => {
      if (isMuted || !isSessionActive || !sessionSetupDone) return;
      const float32Block = event.data; // Float32Array tại sample rate của audioCtxIn
      const resampled = resampleFloat32(float32Block, audioCtxIn.sampleRate, SEND_SAMPLE_RATE);
      const pcm16 = floatTo16BitPCM(resampled);
      sendAudioChunk(pcm16);
      updateOrbFromAudio(resampled);
    };

    sourceNode.connect(workletNode);
    // Không cần connect workletNode ra destination (không phát lại mic của chính mình)
  }

  function resampleFloat32(input, inputRate, outputRate) {
    if (inputRate === outputRate) return input;
    const ratio = inputRate / outputRate;
    const outputLength = Math.round(input.length / ratio);
    const output = new Float32Array(outputLength);
    for (let i = 0; i < outputLength; i++) {
      const srcIndex = i * ratio;
      const idxLow = Math.floor(srcIndex);
      const idxHigh = Math.min(idxLow + 1, input.length - 1);
      const frac = srcIndex - idxLow;
      output[i] = input[idxLow] * (1 - frac) + input[idxHigh] * frac;
    }
    return output;
  }

  function floatTo16BitPCM(float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      s = s < 0 ? s * 0x8000 : s * 0x7fff;
      view.setInt16(offset, s, true); // little-endian
    }
    return buffer;
  }

  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  }

  function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }

  function updateOrbFromAudio(floatSamples) {
    let sum = 0;
    for (let i = 0; i < floatSamples.length; i++) sum += floatSamples[i] * floatSamples[i];
    const rms = Math.sqrt(sum / floatSamples.length);
    const scale = 1 + Math.min(rms * 6, 0.35);
    orb.style.transform = `scale(${scale.toFixed(3)})`;
  }

  // ================== WebSocket ==================
  function connectWebSocket() {
    return new Promise((resolve, reject) => {
      const apiKey = AISettings.getApiKey();
      const model = AISettings.getLiveModel();
      const url = `${WS_URL_BASE}?key=${encodeURIComponent(apiKey)}`;

      let settled = false;
      ws = new WebSocket(url);

      const connectTimeout = setTimeout(() => {
        if (!settled) {
          settled = true;
          reject(new Error('Kết nối quá thời gian chờ (timeout).'));
        }
      }, 12000);

      ws.onopen = () => {
        const setupMessage = {
          setup: {
            model: `models/${model}`,
            generationConfig: {
              responseModalities: ['AUDIO']
            },
            outputAudioTranscription: {},
            inputAudioTranscription: {},
            systemInstruction: {
              parts: [{
                text: 'Bạn là một gia sư tiếng Anh AI, đang nói chuyện trực tiếp (voice call) với một người Việt Nam đang học tiếng Anh qua ứng dụng flashcard. ' +
                  'Hãy nói chuyện tự nhiên, thân thiện, kiên nhẫn. Nói câu ngắn, rõ ràng, tốc độ vừa phải để người học dễ theo kịp. ' +
                  'Bạn có thể trò chuyện bằng tiếng Anh đơn giản để người dùng luyện nghe/nói, hoặc chuyển sang tiếng Việt khi người dùng cần giải thích. ' +
                  'Chủ động sửa lỗi phát âm/ngữ pháp nhẹ nhàng nếu nghe thấy, và khuyến khích người học.'
              }]
            }
          }
        };
        ws.send(JSON.stringify(setupMessage));
      };

      ws.onmessage = async (event) => {
        try {
          const raw = event.data instanceof Blob ? await event.data.text() : event.data;
          const msg = JSON.parse(raw);
          handleServerMessage(msg);

          if (!settled && msg.setupComplete) {
            settled = true;
            clearTimeout(connectTimeout);
            sessionSetupDone = true;
            isSessionActive = true;
            isConnecting = false;
            setStatus('live', 'Đang nghe...');
            resolve();
          }
        } catch (e) {
          console.error('GeminiLive: lỗi parse message', e);
        }
      };

      ws.onerror = (err) => {
        console.error('GeminiLive WebSocket error:', err);
        if (!settled) {
          settled = true;
          clearTimeout(connectTimeout);
          reject(new Error('Lỗi kết nối WebSocket. Kiểm tra API key hoặc mạng.'));
        }
      };

      ws.onclose = (event) => {
        clearTimeout(connectTimeout);
        if (!settled) {
          settled = true;
          reject(new Error(describeCloseEvent(event)));
          return;
        }
        if (isSessionActive) {
          // Kết nối đóng ngoài ý muốn trong khi đang gọi
          setStatus('error', 'Mất kết nối');
          showTranscriptLine('Cuộc gọi đã kết thúc: ' + describeCloseEvent(event));
          setTimeout(() => cleanupAndCloseOverlay(), 1800);
        }
      };
    });
  }

  function describeCloseEvent(event) {
    if (event && event.code === 1000) return 'Đóng kết nối bình thường.';
    if (event && event.reason) return event.reason;
    if (event && event.code === 1006) return 'Mất kết nối bất thường (có thể do API key sai hoặc model không khả dụng).';
    return `Mã đóng kết nối: ${event ? event.code : 'không rõ'}`;
  }

  function describeError(err) {
    return err && err.message ? err.message : 'Lỗi không xác định.';
  }

  function sendAudioChunk(pcmBuffer) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const base64 = arrayBufferToBase64(pcmBuffer);
    const message = {
      realtimeInput: {
        audio: {
          data: base64,
          mimeType: `audio/pcm;rate=${SEND_SAMPLE_RATE}`
        }
      }
    };
    ws.send(JSON.stringify(message));
  }

  // ================== Xử lý message từ server ==================
  function handleServerMessage(msg) {
    if (msg.serverContent) {
      const sc = msg.serverContent;

      if (sc.modelTurn && sc.modelTurn.parts) {
        for (const part of sc.modelTurn.parts) {
          if (part.inlineData && part.inlineData.data) {
            playAudioChunk(part.inlineData.data);
          }
        }
      }

      if (sc.inputTranscription && sc.inputTranscription.text) {
        showTranscriptLine('Bạn: ' + sc.inputTranscription.text);
      }

      if (sc.outputTranscription && sc.outputTranscription.text) {
        currentOutputTranscript += sc.outputTranscription.text;
        showTranscriptLine('Gia sư: ' + currentOutputTranscript);
      }

      if (sc.turnComplete) {
        currentOutputTranscript = '';
      }

      if (sc.interrupted) {
        // Người dùng ngắt lời AI (barge-in) -> dừng phát audio đang xếp hàng
        stopAllPlayback();
        currentOutputTranscript = '';
      }
    }

    if (msg.toolCall) {
      // App này không đăng ký function/tool nào, nhưng để tránh treo session
      // nếu Gemini vẫn thử gọi, trả lời rỗng cho mọi function call.
      const responses = (msg.toolCall.functionCalls || []).map(fc => ({
        name: fc.name,
        id: fc.id,
        response: { result: 'not_supported' }
      }));
      if (responses.length && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ toolResponse: { functionResponses: responses } }));
      }
    }
  }

  // ================== Phát audio nhận về (hàng đợi, tránh giật/chồng) ==================
  function playAudioChunk(base64Data) {
    if (!audioCtxOut) return;
    const arrayBuffer = base64ToArrayBuffer(base64Data);
    const int16 = new Int16Array(arrayBuffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7fff);
    }

    const audioBuffer = audioCtxOut.createBuffer(1, float32.length, RECEIVE_SAMPLE_RATE);
    audioBuffer.copyToChannel(float32, 0);

    const source = audioCtxOut.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtxOut.destination);

    const now = audioCtxOut.currentTime;
    if (playHeadTime < now) playHeadTime = now;
    source.start(playHeadTime);
    playHeadTime += audioBuffer.duration;

    playingSources.push(source);
    source.onended = () => {
      const idx = playingSources.indexOf(source);
      if (idx !== -1) playingSources.splice(idx, 1);
    };
  }

  function stopAllPlayback() {
    playingSources.forEach(src => {
      try { src.stop(); } catch (e) { /* đã dừng rồi thì bỏ qua */ }
    });
    playingSources = [];
    if (audioCtxOut) playHeadTime = audioCtxOut.currentTime;
  }

  // ================== Mute ==================
  function toggleMute() {
    isMuted = !isMuted;
    muteBtn.classList.toggle('muted', isMuted);
    muteBtn.textContent = isMuted ? '🔇' : '🎤';
    setStatus(isSessionActive ? 'live' : 'connecting', isMuted ? 'Đã tắt mic' : 'Đang nghe...');
  }

  // ================== UI helpers ==================
  function setStatus(kind, text) {
    statusDot.className = 'voice-status-dot ' + kind;
    statusText.textContent = text;
  }

  function resetTranscript() {
    currentOutputTranscript = '';
    transcriptText.textContent = 'Đang kết nối tới gia sư AI...';
  }

  function showTranscriptLine(text) {
    transcriptText.textContent = text;
  }

  return { init };
})();
