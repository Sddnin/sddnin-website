const GlobalSearch = {
    async searchAll(query) {
        if (!query || query.trim() === '') return { vocab: [], grammar: [], hanja: [] };
        
        const q = query.toLowerCase().trim();

        const [vocab, grammar, hanja] = await Promise.all([
            fetch("../assets/data/vocabulary.json").then(r => r.json()).catch(() => []),
            fetch("../assets/data/grammar.json").then(r => r.json()).catch(() => []),
            fetch("../assets/data/hanja.json").then(r => r.json()).catch(() => [])
        ]);

        return {
            vocab: vocab.filter(i => i.korean.includes(q) || i.meaning.toLowerCase().includes(q)),
            grammar: grammar.filter(i => (i.structure && i.structure.includes(q)) || i.meaning.toLowerCase().includes(q)),
            hanja: hanja.filter(i => i.korean.includes(q) || i.meaning.toLowerCase().includes(q))
        };
    }
};
