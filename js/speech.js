const Speech = (() => {
  function speak(text, lang = 'en-US') {
    if (!window.speechSynthesis) {
      UI_Toast.show('Trình duyệt không hỗ trợ phát âm.', 'err');
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
