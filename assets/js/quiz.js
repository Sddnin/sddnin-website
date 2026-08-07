class QuizManager {
  constructor() {
    this.questions = [];
    this.current = 0;
    this.score = 0;
  }
  async init() {
    await this.loadWords();
    this.generateQuiz();
    this.renderQuestion();
    document.getElementById('next-question').addEventListener('click', () => this.nextQuestion());
  }
  async loadWords() {
    try {
      const res = await fetch('../assets/data/vocabulary.json');
      this.vocab = await res.json();
      this.vocab = [...this.vocab, ...StorageManager.getCustomVocab()];
    } catch(e) { /* fallback */ }
  }
  generateQuiz() {
    const shuffled = [...this.vocab].sort(()=>Math.random()-0.5).slice(0,10);
    this.questions = shuffled.map(word => {
      const options = [word.meaning];
      while (options.length < 4) {
        const randomWord = this.vocab[Math.floor(Math.random()*this.vocab.length)];
        if (!options.includes(randomWord.meaning)) options.push(randomWord.meaning);
      }
      return { korean: word.korean, correct: word.meaning, options: options.sort(()=>Math.random()-0.5) };
    });
  }
  renderQuestion() {
    if (this.current >= this.questions.length) return this.showResult();
    const q = this.questions[this.current];
    document.getElementById('quiz-question').textContent = q.korean;
    const optionsDiv = document.getElementById('quiz-options');
    optionsDiv.innerHTML = '';
    q.options.forEach(opt => {
      const btn = document.createElement('div');
      btn.className = 'quiz-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => this.checkAnswer(opt, btn));
      optionsDiv.appendChild(btn);
    });
    document.getElementById('next-question').style.display = 'none';
  }
  checkAnswer(selected, btn) {
    const q = this.questions[this.current];
    const allOptions = document.querySelectorAll('.quiz-option');
    allOptions.forEach(opt => opt.style.pointerEvents = 'none');
    if (selected === q.correct) {
      btn.classList.add('correct');
      this.score++;
    } else {
      btn.classList.add('wrong');
      allOptions.forEach(opt => { if (opt.textContent === q.correct) opt.classList.add('correct'); });
    }
    document.getElementById('next-question').style.display = 'block';
  }
  nextQuestion() {
    this.current++;
    if (this.current < this.questions.length) this.renderQuestion();
    else this.showResult();
  }
  showResult() {
    document.getElementById('quiz-container').innerHTML = '';
    document.getElementById('quiz-result').classList.remove('hidden');
    document.getElementById('quiz-result').innerHTML = `<h2>Kết quả: ${this.score}/${this.questions.length}</h2>`;
  }
}
document.addEventListener('DOMContentLoaded', () => new QuizManager().init());