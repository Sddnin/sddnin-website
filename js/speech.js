const Speech = (() => {
  function speak(text, lang = 'en-US') {
    if (!window.speechSynthesis) {
      alert('Trình duyệt không hỗ trợ phát âm.');
      return;
    }
    window.speechSynthesis.cancel(); // Tránh chồng lấp
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
  return { speak };
})();
