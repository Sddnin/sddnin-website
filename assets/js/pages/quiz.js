class QuizManager {
  constructor() {
    this.vocab = [];
    this.questions = [];
    this.current = 0;
    this.score = 0;
  }

  async init() {
    await this.loadWords();
    this.generate();
    this.showQuestion();
    document.getElementById('next-question')?.addEventListener('click', () => this.next());
  }

  async loadWords() {
    try {
      const res = await fetch('../assets/data/vocabulary.json');
      this.vocab = await res.json();
    } catch(e) {}
    this.vocab = [...this.vocab, ...StorageManager.getCustomVocab()];
  }

  generate() {
    const shuffled = [...this.vocab].sort(() => Math.random() - 0.5).slice(0, 10);
    this.questions = shuffled.map(word => {
      const options = [word.meaning];
      while (options.length < 4) {
        const rand = this.vocab[Math.floor(Math.random() * this.vocab.length)];
        if (!options.includes(rand.meaning)) options.push(rand.meaning);
      }
      return { korean: word.korean, correct: word.meaning, options: options.sort(() => Math.random() - 0.5) };
    });
  }

  showQuestion() {
    if (this.current >= this.questions.length) return this.showResult();
    const q = this.questions[this.current];
    document.getElementById('quiz-question').textContent = q.korean;
    const opts = document.getElementById('quiz-options');
    opts.innerHTML = '';
    q.options.forEach(opt => {
      const btn = document.createElement('div');
      btn.className = 'quiz-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => this.checkAnswer(opt, btn));
      opts.appendChild(btn);
    });
    document.getElementById('next-question').style.display = 'none';
  }

  checkAnswer(selected, btn) {
    const q = this.questions[this.current];
    const allOpts = document.querySelectorAll('.quiz-option');
    allOpts.forEach(o => o.style.pointerEvents = 'none');
    if (selected === q.correct) {
      btn.classList.add('correct');
      this.score++;
    } else {
      btn.classList.add('wrong');
      allOpts.forEach(o => { if (o.textContent === q.correct) o.classList.add('correct'); });
    }
    document.getElementById('next-question').style.display = 'block';
  }

  next() {
    this.current++;
    if (this.current < this.questions.length) this.showQuestion();
    else this.showResult();
  }

  showResult() {
    document.getElementById('quiz-container').innerHTML = `<h2>Kết quả: ${this.score}/${this.questions.length}</h2>`;
  }
}

document.addEventListener('DOMContentLoaded', () => new QuizManager().init());
