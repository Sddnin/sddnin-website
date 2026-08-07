class Stats {
  async init() {
    const progress = StorageManager.getProgress();
    document.getElementById('streak').textContent = progress.streak;
    const vocab = [...(await this.loadDefaultVocab()), ...StorageManager.getCustomVocab()];
    document.getElementById('total-words').textContent = vocab.length;
    document.getElementById('learned-count').textContent = StorageManager.getKnownWords().length;
    this.drawChart(progress.streak);
  }
  async loadDefaultVocab() {
    try {
      const res = await fetch('../assets/data/vocabulary.json');
      return await res.json();
    } catch(e) { return []; }
  }
  drawChart(streak) {
    const canvas = document.getElementById('streakChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // Vẽ cột đơn giản
    ctx.fillStyle = '#4A90D9';
    ctx.fillRect(50, 150 - streak*10, 50, streak*10);
    ctx.fillStyle = '#333';
    ctx.font = '16px sans-serif';
    ctx.fillText('Streak: '+streak, 60, 140);
  }
}
document.addEventListener('DOMContentLoaded', () => new Stats().init());