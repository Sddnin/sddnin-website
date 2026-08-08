/* ==========================================================================
   pcm-worklet.js — AudioWorkletProcessor chạy trong audio thread riêng
   (tách biệt khỏi main thread) để capture mic cho Voice AI.

   Google khuyến nghị dùng AudioWorklet thay vì ScriptProcessorNode (đã
   deprecated) để tránh giật/lag khi convert audio real-time — xử lý trong
   main thread sẽ bị chặn bởi mọi thao tác DOM/UI khác, còn AudioWorklet
   chạy độc lập, ổn định hơn nhiều cho streaming liên tục.

   Nhiệm vụ duy nhất của processor này: nhận block audio Float32 (-1.0 đến
   1.0, chuẩn Web Audio API) từ mic ở sample rate gốc của thiết bị (thường
   44100Hz hoặc 48000Hz), convert sang Int16 PCM little-endian theo đúng
   định dạng Gemini Live API yêu cầu (audio/pcm;rate=16000), rồi gửi buffer
   đó về main thread qua port.postMessage để main thread base64-encode và
   gửi qua WebSocket.

   Việc resample về đúng 16000Hz được thực hiện bằng linear interpolation
   đơn giản ngay trong worklet — Gemini Live API có tự resample phía server
   nếu client gửi sample rate khác, nhưng gửi đúng sẵn 16kHz giúp giảm
   băng thông và tránh mọi nhầm lẫn phía server.
   ========================================================================== */

class PCMCaptureProcessor extends AudioWorkletProcessor {
    constructor(options) {
        super();
        // sampleRate là biến global có sẵn trong AudioWorkletGlobalScope,
        // phản ánh đúng sample rate thực tế của AudioContext cha.
        this.inputSampleRate = sampleRate;
        this.targetSampleRate = 16000;
        this.resampleRatio = this.inputSampleRate / this.targetSampleRate;

        // Vị trí phân số (fractional) trong quá trình resample liên tục
        // qua nhiều block audio — audio đến theo từng block rời rạc
        // (thường 128 sample/block), nhưng resample cần liên tục.
        this.resamplePosition = 0;
    }

    /**
     * Được Web Audio API gọi tự động, liên tục, mỗi khi có 1 block audio
     * mới sẵn sàng (thường 128 sample ở sample rate gốc thiết bị).
     * inputs[0][0] là kênh mono (mic thường chỉ có 1 kênh).
     */
    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || input.length === 0 || !input[0] || input[0].length === 0) {
            // Chưa có dữ liệu audio (ví dụ mic vừa mới khởi tạo) — vẫn phải
            // return true để worklet tiếp tục sống, không được return false
            // ở đây vì đó sẽ dừng hẳn worklet dù mic vẫn đang mở.
            return true;
        }

        const channelData = input[0]; // Float32Array, giá trị -1.0..1.0

        // Resample về 16kHz bằng linear interpolation, đồng thời convert
        // sang Int16 PCM little-endian trong cùng 1 lượt duyệt.
        const outputSamples = [];
        while (this.resamplePosition < channelData.length) {
            const idx = Math.floor(this.resamplePosition);
            const frac = this.resamplePosition - idx;
            const s0 = channelData[idx] || 0;
            const s1 = channelData[idx + 1] !== undefined ? channelData[idx + 1] : s0;
            const interpolated = s0 + (s1 - s0) * frac;

            // Clamp về [-1, 1] rồi convert sang Int16 (-32768..32767)
            const clamped = Math.max(-1, Math.min(1, interpolated));
            const int16 = clamped < 0 ? clamped * 32768 : clamped * 32767;
            outputSamples.push(Math.round(int16));

            this.resamplePosition += this.resampleRatio;
        }
        // Trừ lại độ dài block hiện tại để phần dư (fractional) được giữ
        // nguyên cho block audio tiếp theo, tránh cộng dồn sai lệch theo
        // thời gian giữa các block liên tiếp.
        this.resamplePosition -= channelData.length;

        if (outputSamples.length > 0) {
            const pcmBuffer = new Int16Array(outputSamples);
            // Gửi buffer về main thread. Dùng transferable object (buffer)
            // để tránh copy dữ liệu, giữ hiệu năng cao cho stream liên tục.
            this.port.postMessage(pcmBuffer.buffer, [pcmBuffer.buffer]);
        }

        // Luôn return true để Web Audio API tiếp tục gọi process() cho
        // block tiếp theo — return false sẽ dừng hẳn worklet vĩnh viễn.
        return true;
    }
}

registerProcessor('pcm-capture-processor', PCMCaptureProcessor);
