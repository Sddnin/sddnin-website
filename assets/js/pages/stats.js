class StatsPage {
  async init() {
    const progress = StorageManager.getProgress();
    document.getElementById('streak').textContent = progress.streak;

    let vocab = [];
    try {
      const res = await fetch('../assets/data/vocabulary.json');
      vocab = await res.json();
    } catch(e) {}
    vocab = [...vocab, ...StorageManager.getCustomVocab()];
    document.getElementById('total-words').textContent = vocab.length;
    document.getElementById('learned-count').textContent = StorageManager.getKnownWords().length;

    this.drawChart(progress.streak);
  }

  drawChart(streak) {
    const canvas = document.getElementById('streakChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#4A90D9';
    ctx.fillRect(60, 150 - streak*12, 40, streak*12);
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--color-text');
    ctx.font = '16px sans-serif';
    ctx.fillText('Streak: '+streak, 70, 140);
  }
}

document.addEventListener('DOMContentLoaded', () => new StatsPage().init());
