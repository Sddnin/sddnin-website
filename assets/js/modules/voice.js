// voice.js - Voice Flip module
export function initVoiceFlip(flipCallback) {
  if (!('webkitSpeechRecognition' in window)) return null;
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const said = event.results[0][0].transcript.trim();
    flipCallback(said);
  };

  recognition.onerror = () => {}; 
  return recognition;
}
