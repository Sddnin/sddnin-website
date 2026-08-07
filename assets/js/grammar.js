document.addEventListener("DOMContentLoaded", () => {
    let grammarData = [];
    const container = document.getElementById("grammar-list");
    const searchInput = document.getElementById("grammar-search");

    fetch("../assets/data/grammar.json")
        .then(res => res.json())
        .then(data => {
            grammarData = data;
            renderGrammarList(grammarData);
        })
        .catch(err => console.error("Lỗi khi tải grammar.json:", err));

    function renderGrammarList(items) {
        if (!container) return;
        container.innerHTML = "";

        if (items.length === 0) {
            container.innerHTML = "<p>Không tìm thấy ngữ pháp phù hợp.</p>";
            return;
        }

        items.forEach(item => {
            const card = document.createElement("div");
            card.className = "card-item";
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3>${item.structure || item.title}</h3>
                    <span style="font-size:0.8rem; background:var(--border-color); padding:0.2rem 0.5rem; border-radius:4px;">${item.level || 'TOPIK 1'}</span>
                </div>
                <p style="margin: 0.5rem 0; font-weight:600; color:var(--primary-color);">${item.meaning}</p>
                <p style="color: var(--text-muted); font-size:0.9rem;">${item.explanation || ''}</p>
                <div style="margin-top: 1rem; padding-top: 0.5rem; border-top: 1px dashed var(--border-color);">
                    <small><b>Ví dụ:</b> ${item.example || ''}</small>
                </div>
            `;
            container.appendChild(card);
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const keyword = e.target.value.toLowerCase();
            const filtered = grammarData.filter(item => 
                (item.structure && item.structure.toLowerCase().includes(keyword)) ||
                (item.meaning && item.meaning.toLowerCase().includes(keyword))
            );
            renderGrammarList(filtered);
        });
    }
});
