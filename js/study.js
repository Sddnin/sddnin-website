const Study = (() => {
  let currentDeck = null;
  let studyCards = [];
  let currentIndex = 0;
  let direction = 'en-vi';

  function startStudy(deck, dir) {
    currentDeck = deck;
    direction = dir;
    const now = Date.now();
    // Lấy thẻ đến hạn ôn tập (nextReview <= now) hoặc thẻ mới chưa học
    studyCards = deck.cards.filter(c => c.nextReview <= now);
    if (studyCards.length === 0) {
      studyCards = [...deck.cards]; // Nếu không có thẻ đến hạn thì lấy tất cả
    }
    // Xáo trộn nhẹ để không bị nhàm
    studyCards.sort(() => Math.random() - 0.5);
    currentIndex = 0;
    return studyCards;
  }

  function getCurrentCard() {
    return studyCards.length > 0 ? studyCards[currentIndex] : null;
  }

  function nextCard() {
    currentIndex++;
    if (currentIndex >= studyCards.length) {
      // Hết lượt — không quay vòng nữa, để lời gọi hiển thị được
      // thông báo "đã hoàn thành" đúng lúc.
      return null;
    }
    return getCurrentCard();
  }

  // Lùi lại thẻ trước đó để xem lại — CHỈ di chuyển con trỏ, không
  // đụng tới level/nextReview/reviewCount của bất kỳ thẻ nào (khác
  // hẳn nextCard() sau rateCard(), vốn đại diện cho 1 lượt học thật).
  // Không lùi được quá thẻ đầu tiên của phiên.
  function prevCard() {
    if (currentIndex <= 0) return null;
    currentIndex--;
    return getCurrentCard();
  }

  function hasPrevCard() {
    return currentIndex > 0;
  }

  // Xáo lại thứ tự các thẻ TỪ VỊ TRÍ HIỆN TẠI trở đi — giữ nguyên thẻ
  // đang xem (currentIndex không đổi) và mọi thẻ đã xem trước đó,
  // chỉ trộn phần "chưa tới lượt" để không ảnh hưởng thẻ đang hiện
  // trên màn hình ngay lúc người dùng bấm xáo.
  function reshuffleRemaining() {
    const upcoming = studyCards.slice(currentIndex + 1);
    upcoming.sort(() => Math.random() - 0.5);
    studyCards = studyCards.slice(0, currentIndex + 1).concat(upcoming);
  }

  function rateCard(card, rating) {
    const now = Date.now();
    let intervalMinutes;
    let newLevel;
    switch (rating) {
      case 1: // again
        newLevel = 0;
        intervalMinutes = 1;
        break;
      case 2: // hard
        newLevel = Math.max(card.level - 1, 1);
        intervalMinutes = 10;
        break;
      case 3: // good
        newLevel = card.level + 1;
        intervalMinutes = newLevel >= 2 ? 1440 : 240; // 1 ngày hoặc 4 giờ
        break;
      case 4: // easy
        newLevel = card.level + 2;
        intervalMinutes = 4320; // 3 ngày
        break;
      default:
        newLevel = card.level;
        intervalMinutes = 60;
    }
    card.level = newLevel;
    card.nextReview = now + intervalMinutes * 60 * 1000;
    card.reviewCount = (card.reviewCount || 0) + 1;

    // Cập nhật vào deck gốc trong bộ nhớ (để getCurrentCard() sau đó
    // trong cùng phiên vẫn thấy giá trị mới nếu cần).
    if (currentDeck) {
      const idx = currentDeck.cards.findIndex(c => c.id === card.id);
      if (idx !== -1) {
        currentDeck.cards[idx] = { ...card };
      }

      // Lưu xuống storage: CHỈ patch đúng thẻ vừa rate vào dữ liệu MỚI
      // NHẤT đọc từ storage, không ghi đè cả deck bằng currentDeck (snapshot
      // cũ từ lúc startStudy()). Nếu deck này bị sửa ở nơi khác (thêm/xoá/
      // sửa thẻ khác qua modal Cài đặt) trong lúc đang học, ghi đè cả deck
      // sẽ xoá mất thay đổi đó — Storage.updateCard() tránh được vì nó đọc
      // fresh rồi chỉ patch đúng 1 thẻ, giữ nguyên mọi thẻ khác.
      Storage.updateCard(currentDeck.id, card.id, {
        level: card.level,
        nextReview: card.nextReview,
        reviewCount: card.reviewCount,
      });
    }
  }

  function getProgress() {
    return {
      current: currentIndex + 1,
      total: studyCards.length
    };
  }

  return { startStudy, getCurrentCard, nextCard, prevCard, hasPrevCard, reshuffleRemaining, rateCard, getProgress };
})();
