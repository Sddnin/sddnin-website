document.addEventListener("DOMContentLoaded", () => {
    let hanjaData = [];
    const container = document.getElementById("hanja-list");
    const searchInput = document.getElementById("hanja-search");

    fetch("../assets/data/hanja.json")
        .then(res => res.json())
        .then(data => {
            hanjaData = data;
            renderHanjaList(hanjaData);
        })
        .catch(err => console.error("Lỗi khi tải hanja.json:", err));

    function renderHanjaList(items) {
        if (!container) return;
        container.innerHTML = "";

        if (items.length === 0) {
            container.innerHTML = "<p>Không tìm thấy Hán tự phù hợp.</p>";
            return;
        }

        items.forEach(item => {
            const card = document.createElement("div");
            card.className = "card-item";
            card.innerHTML = `
                <div style="display:flex; align-items:center; gap:1rem;">
                    <span style="font-size:2rem; font-weight:bold; color:var(--primary-color);">${item.hanja || item.korean}</span>
                    <div>
                        <h4>${item.korean} (${item.hanviet || item.meaning})</h4>
                        <p style="color:var(--text-muted); font-size:0.9rem;">${item.explanation || item.meaning}</p>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const keyword = e.target.value.toLowerCase();
            const filtered = hanjaData.filter(item => 
                item.korean.toLowerCase().includes(keyword) ||
                (item.hanviet && item.hanviet.toLowerCase().includes(keyword)) ||
                item.meaning.toLowerCase().includes(keyword)
            );
            renderHanjaList(filtered);
        });
    }
});
