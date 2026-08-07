const StorageManager = {
    KEYS: {
        LEARNED: 'sddnin_learned_items',
        BOOKMARKS: 'sddnin_bookmarks',
        STATS: 'sddnin_user_stats',
        SETTINGS: 'sddnin_settings'
    },

    // Lấy dữ liệu mảng từ LocalStorage
    getData(key) {
        return JSON.parse(localStorage.getItem(key)) || [];
    },

    // Lưu dữ liệu vào LocalStorage
    setData(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    // Đánh dấu đã học / chưa học
    toggleLearned(type, id) {
        const learned = this.getData(this.KEYS.LEARNED);
        const itemKey = `${type}_${id}`;
        const index = learned.indexOf(itemKey);
        
        if (index > -1) {
            learned.splice(index, 1);
        } else {
            learned.push(itemKey);
            this.updateStreak();
        }
        
        this.setData(this.KEYS.LEARNED, learned);
        return index === -1; // trả về true nếu vừa đánh dấu thuộc
    },

    isLearned(type, id) {
        const learned = this.getData(this.KEYS.LEARNED);
        return learned.includes(`${type}_${id}`);
    },

    // Đánh dấu Bookmark
    toggleBookmark(type, id) {
        const bookmarks = this.getData(this.KEYS.BOOKMARKS);
        const itemKey = `${type}_${id}`;
        const index = bookmarks.indexOf(itemKey);

        if (index > -1) {
            bookmarks.splice(index, 1);
        } else {
            bookmarks.push(itemKey);
        }

        this.setData(this.KEYS.BOOKMARKS, bookmarks);
        return index === -1;
    },

    isBookmarked(type, id) {
        return this.getData(this.KEYS.BOOKMARKS).includes(`${type}_${id}`);
    },

    // Cập nhật Chuỗi ngày học (Streak)
    updateStreak() {
        const stats = JSON.parse(localStorage.getItem(this.KEYS.STATS)) || { streak: 0, lastActive: null, totalLearned: 0 };
        const today = new Date().toDateString();

        if (stats.lastActive !== today) {
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            if (stats.lastActive === yesterday) {
                stats.streak += 1;
            } else if (stats.lastActive !== today) {
                stats.streak = 1;
            }
            stats.lastActive = today;
        }
        stats.totalLearned = this.getData(this.KEYS.LEARNED).length;
        localStorage.setItem(this.KEYS.STATS, JSON.stringify(stats));
    },

    getStats() {
        return JSON.parse(localStorage.getItem(this.KEYS.STATS)) || { streak: 0, lastActive: null, totalLearned: 0 };
    }
};
