class AddWordManager {
  init() {
    document.getElementById('add-word-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const word = {
        korean: document.getElementById('korean').value,
        romanization: document.getElementById('romanization').value,
        meaning: document.getElementById('meaning').value,
        example: document.getElementById('example').value,
        level: document.getElementById('level').value
      };
      StorageManager.addCustomWord(word);
      this.renderList();
      e.target.reset();
    });

    document.getElementById('export-btn')?.addEventListener('click', () => {
      const data = StorageManager.exportAll();
      const blob = new Blob([data], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'backup.json'; a.click();
    });

    document.getElementById('import-btn')?.addEventListener('click', () => {
      const file = document.getElementById('import-file').files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (StorageManager.importAll(e.target.result)) alert('Nhập thành công!');
        else alert('File lỗi');
        location.reload();
      };
      reader.readAsText(file);
    });

    this.renderList();
  }

  renderList() {
    const list = document.getElementById('custom-word-list');
    const words = StorageManager.getCustomVocab();
    list.innerHTML = words.map(w => `
      <div class="custom-word-item">
        <span>${w.korean} - ${w.meaning}</span>
        <button onclick="StorageManager.removeCustomWord(${w.id});location.reload()">✕</button>
      </div>
    `).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => new AddWordManager().init());
