/**
 * Học Tiếng Hàn 2.0 — Gemini 3.x
 * ==================================
 */

// ===================== SAMPLE DATA =====================
const SAMPLE = [
  {id:1,front:"안녕하세요",back:"Xin chào",roman:"annyeonghaseyo",category:"greetings",level:"beginner",topik:"topik1",partOfSpeech:"Cảm từ",example:"안녕하세요, 만나서 반갑습니다.",exampleMeaning:"Xin chào, rất vui được gặp bạn.",hanViet:"安宁哈塞哟"},
  {id:2,front:"감사합니다",back:"Cảm ơn",roman:"gamsahamnida",category:"greetings",level:"beginner",topik:"topik1",partOfSpeech:"Cảm từ",example:"도와주셔서 감사합니다.",exampleMeaning:"Cảm ơn bạn đã giúp đỡ.",hanViet:"感谢합니다"},
  {id:3,front:"죄송합니다",back:"Xin lỗi",roman:"joesonghamnida",category:"greetings",level:"beginner",topik:"topik1",partOfSpeech:"Cảm từ",example:"늦어서 죄송합니다.",exampleMeaning:"Xin lỗi vì đến muộn.",hanViet:"罪悚합니다"},
  {id:4,front:"안녕히 가세요",back:"Tạm biệt (người đi)",roman:"annyeonghi gaseyo",category:"greetings",level:"beginner",topik:"topik1",partOfSpeech:"Cụm từ",example:"안녕히 가세요, 내일 봐요.",exampleMeaning:"Tạm biệt, hẹn gặp lại.",hanViet:""},
  {id:5,front:"네",back:"Vâng",roman:"ne",category:"greetings",level:"beginner",topik:"topik1",partOfSpeech:"Cảm từ",example:"네, 알겠습니다.",exampleMeaning:"Vâng, tôi hiểu rồi.",hanViet:""},
  {id:6,front:"아니요",back:"Không",roman:"aniyo",category:"greetings",level:"beginner",topik:"topik1",partOfSpeech:"Cảm từ",example:"아니요, 괜찮아요.",exampleMeaning:"Không, không sao.",hanViet:""},
  {id:7,front:"하나",back:"Một",roman:"hana",category:"numbers",level:"beginner",topik:"topik1",partOfSpeech:"Số đếm",example:"하나, 둘, 셋!",exampleMeaning:"Một, hai, ba!",hanViet:"一"},
  {id:8,front:"둘",back:"Hai",roman:"dul",category:"numbers",level:"beginner",topik:"topik1",partOfSpeech:"Số đếm",example:"사과 두 개 주세요.",exampleMeaning:"Cho tôi hai quả táo.",hanViet:"二"},
  {id:9,front:"셋",back:"Ba",roman:"set",category:"numbers",level:"beginner",topik:"topik1",partOfSpeech:"Số đếm",example:"셋까지 세어 보세요.",exampleMeaning:"Đếm đến ba.",hanViet:"三"},
  {id:10,front:"열",back:"Mười",roman:"yeol",category:"numbers",level:"beginner",topik:"topik1",partOfSpeech:"Số đếm",example:"열 번 연습했어요.",exampleMeaning:"Luyện mười lần.",hanViet:"十"},
  {id:11,front:"엄마",back:"Mẹ",roman:"eomma",category:"family",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"엄마가 요리해요.",exampleMeaning:"Mẹ đang nấu ăn.",hanViet:""},
  {id:12,front:"아빠",back:"Bố",roman:"appa",category:"family",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"아빠는 회사에 있어요.",exampleMeaning:"Bố ở công ty.",hanViet:""},
  {id:13,front:"형",back:"Anh trai (nam gọi)",roman:"hyeong",category:"family",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"형이 학생이에요.",exampleMeaning:"Anh trai là học sinh.",hanViet:"兄"},
  {id:14,front:"누나",back:"Chị gái (nam gọi)",roman:"nuna",category:"family",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"누나는 대학생이에요.",exampleMeaning:"Chị là sinh viên.",hanViet:""},
  {id:15,front:"오빠",back:"Anh trai (nữ gọi)",roman:"oppa",category:"family",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"오빠, 어디 가요?",exampleMeaning:"Anh ơi, đi đâu vậy?",hanViet:""},
  {id:16,front:"언니",back:"Chị gái (nữ gọi)",roman:"eonni",category:"family",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"언니랑 같이 가요.",exampleMeaning:"Đi cùng chị gái.",hanViet:""},
  {id:17,front:"밥",back:"Cơm",roman:"bap",category:"food",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"밥 먹었어요?",exampleMeaning:"Ăn cơm chưa?",hanViet:"飯"},
  {id:18,front:"물",back:"Nước",roman:"mul",category:"food",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"물 한 잔 주세요.",exampleMeaning:"Cho tôi cốc nước.",hanViet:""},
  {id:19,front:"김치",back:"Kim chi",roman:"gimchi",category:"food",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"김치가 맛있어요.",exampleMeaning:"Kim chi ngon.",hanViet:""},
  {id:20,front:"고기",back:"Thịt",roman:"gogi",category:"food",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"고기를 구워요.",exampleMeaning:"Nướng thịt.",hanViet:"肉"},
  {id:21,front:"커피",back:"Cà phê",roman:"keopi",category:"food",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"커피 한 잔 할까요?",exampleMeaning:"Uống cà phê nhé?",hanViet:""},
  {id:22,front:"빵",back:"Bánh mì",roman:"ppang",category:"food",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"빵을 사요.",exampleMeaning:"Mua bánh mì.",hanViet:""},
  {id:23,front:"맥주",back:"Bia",roman:"maekju",category:"food",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"맥주 두 병 주세요.",exampleMeaning:"Hai chai bia.",hanViet:"麥酒"},
  {id:24,front:"학교",back:"Trường học",roman:"hakgyo",category:"places",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"학교에 가요.",exampleMeaning:"Đi đến trường.",hanViet:"學校"},
  {id:25,front:"집",back:"Nhà",roman:"jip",category:"places",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"집에 가고 싶어요.",exampleMeaning:"Muốn về nhà.",hanViet:""},
  {id:26,front:"회사",back:"Công ty",roman:"hoesa",category:"places",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"회사에서 일해요.",exampleMeaning:"Làm ở công ty.",hanViet:"會社"},
  {id:27,front:"병원",back:"Bệnh viện",roman:"byeongwon",category:"places",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"병원에 가야 해요.",exampleMeaning:"Phải đi bệnh viện.",hanViet:"病院"},
  {id:28,front:"공항",back:"Sân bay",roman:"gonghang",category:"places",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"공항에서 만나요.",exampleMeaning:"Gặp ở sân bay.",hanViet:"空港"},
  {id:29,front:"은행",back:"Ngân hàng",roman:"eunhaeng",category:"places",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"은행에 돈을 찾아요.",exampleMeaning:"Rút tiền ở ngân hàng.",hanViet:"銀行"},
  {id:30,front:"좋다",back:"Tốt, hay",roman:"jota",category:"adjectives",level:"beginner",topik:"topik1",partOfSpeech:"Tính từ",example:"날씨가 좋아요.",exampleMeaning:"Thời tiết đẹp.",hanViet:""},
  {id:31,front:"크다",back:"Lớn",roman:"keuda",category:"adjectives",level:"beginner",topik:"topik1",partOfSpeech:"Tính từ",example:"이 집은 커요.",exampleMeaning:"Ngôi nhà to.",hanViet:"巨"},
  {id:32,front:"작다",back:"Nhỏ",roman:"jakda",category:"adjectives",level:"beginner",topik:"topik1",partOfSpeech:"Tính từ",example:"고양이가 작아요.",exampleMeaning:"Mèo nhỏ.",hanViet:"小"},
  {id:33,front:"예쁘다",back:"Đẹp, xinh",roman:"yeppeuda",category:"adjectives",level:"beginner",topik:"topik1",partOfSpeech:"Tính từ",example:"꽃이 예뻐요.",exampleMeaning:"Hoa đẹp.",hanViet:""},
  {id:34,front:"맛있다",back:"Ngon",roman:"masitda",category:"adjectives",level:"beginner",topik:"topik1",partOfSpeech:"Tính từ",example:"이 음식이 맛있어요.",exampleMeaning:"Món ăn ngon.",hanViet:""},
  {id:35,front:"비싸다",back:"Đắt",roman:"bissada",category:"adjectives",level:"beginner",topik:"topik1",partOfSpeech:"Tính từ",example:"이 가방이 비싸요.",exampleMeaning:"Túi này đắt.",hanViet:""},
  {id:36,front:"싸다",back:"Rẻ",roman:"ssada",category:"adjectives",level:"beginner",topik:"topik1",partOfSpeech:"Tính từ",example:"여기 싸고 맛있어요.",exampleMeaning:"Rẻ mà ngon.",hanViet:""},
  {id:37,front:"가다",back:"Đi",roman:"gada",category:"verbs",level:"beginner",topik:"topik1",partOfSpeech:"Động từ",example:"학교에 가요.",exampleMeaning:"Đi đến trường.",hanViet:""},
  {id:38,front:"오다",back:"Đến",roman:"oda",category:"verbs",level:"beginner",topik:"topik1",partOfSpeech:"Động từ",example:"친구가 집에 와요.",exampleMeaning:"Bạn đến nhà.",hanViet:""},
  {id:39,front:"먹다",back:"Ăn",roman:"meokda",category:"verbs",level:"beginner",topik:"topik1",partOfSpeech:"Động từ",example:"점심을 먹어요.",exampleMeaning:"Ăn trưa.",hanViet:"吃"},
  {id:40,front:"마시다",back:"Uống",roman:"masida",category:"verbs",level:"beginner",topik:"topik1",partOfSpeech:"Động từ",example:"물을 마셔요.",exampleMeaning:"Uống nước.",hanViet:""},
  {id:41,front:"보다",back:"Xem",roman:"boda",category:"verbs",level:"beginner",topik:"topik1",partOfSpeech:"Động từ",example:"영화를 봐요.",exampleMeaning:"Xem phim.",hanViet:""},
  {id:42,front:"읽다",back:"Đọc",roman:"ikda",category:"verbs",level:"beginner",topik:"topik1",partOfSpeech:"Động từ",example:"책을 읽어요.",exampleMeaning:"Đọc sách.",hanViet:"讀"},
  {id:43,front:"쓰다",back:"Viết",roman:"sseuda",category:"verbs",level:"beginner",topik:"topik1",partOfSpeech:"Động từ",example:"편지를 써요.",exampleMeaning:"Viết thư.",hanViet:""},
  {id:44,front:"듣다",back:"Nghe",roman:"deutda",category:"verbs",level:"beginner",topik:"topik1",partOfSpeech:"Động từ",example:"음악을 들어요.",exampleMeaning:"Nghe nhạc.",hanViet:""},
  {id:45,front:"말하다",back:"Nói",roman:"malhada",category:"verbs",level:"beginner",topik:"topik1",partOfSpeech:"Động từ",example:"한국어로 말해요.",exampleMeaning:"Nói bằng tiếng Hàn.",hanViet:""},
  {id:46,front:"하다",back:"Làm",roman:"hada",category:"verbs",level:"beginner",topik:"topik1",partOfSpeech:"Động từ",example:"숙제를 해요.",exampleMeaning:"Làm bài tập.",hanViet:""},
  {id:47,front:"사다",back:"Mua",roman:"sada",category:"verbs",level:"beginner",topik:"topik1",partOfSpeech:"Động từ",example:"옷을 사요.",exampleMeaning:"Mua quần áo.",hanViet:""},
  {id:48,front:"만나다",back:"Gặp",roman:"mannada",category:"verbs",level:"beginner",topik:"topik1",partOfSpeech:"Động từ",example:"친구를 만나요.",exampleMeaning:"Gặp bạn.",hanViet:""},
  {id:49,front:"오늘",back:"Hôm nay",roman:"oneul",category:"time",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"오늘 날씨가 좋아요.",exampleMeaning:"Hôm nay trời đẹp.",hanViet:""},
  {id:50,front:"내일",back:"Ngày mai",roman:"naeil",category:"time",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"내일 만나요.",exampleMeaning:"Ngày mai gặp nhé.",hanViet:""},
  {id:51,front:"어제",back:"Hôm qua",roman:"eoje",category:"time",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"어제 비가 왔어요.",exampleMeaning:"Hôm qua trời mưa.",hanViet:""},
  {id:52,front:"지금",back:"Bây giờ",roman:"jigeum",category:"time",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"지금 뭐 해요?",exampleMeaning:"Bây giờ làm gì?",hanViet:"只今"},
  {id:53,front:"친구",back:"Bạn bè",roman:"chingu",category:"daily",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"친구가 많아요.",exampleMeaning:"Có nhiều bạn.",hanViet:"親舊"},
  {id:54,front:"선생님",back:"Giáo viên",roman:"seonsaengnim",category:"education",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"선생님께 질문해요.",exampleMeaning:"Hỏi giáo viên.",hanViet:"先生"},
  {id:55,front:"학생",back:"Học sinh",roman:"haksaeng",category:"education",level:"beginner",topik:"topik1",partOfSpeech:"Danh từ",example:"저는 학생이에요.",exampleMeaning:"Tôi là học sinh.",hanViet:"學生"},
  {id:56,front:"여행",back:"Du lịch",roman:"yeohaeng",category:"travel",level:"intermediate",topik:"topik2",partOfSpeech:"Danh từ",example:"한국으로 여행 가고 싶어요.",exampleMeaning:"Muốn đi du lịch Hàn Quốc.",hanViet:"旅行"},
  {id:57,front:"문화",back:"Văn hóa",roman:"munhwa",category:"culture",level:"intermediate",topik:"topik2",partOfSpeech:"Danh từ",example:"한국 문화가 좋아요.",exampleMeaning:"Văn hóa Hàn hay.",hanViet:"文化"},
  {id:58,front:"시험",back:"Kỳ thi",roman:"siheom",category:"education",level:"intermediate",topik:"topik2",partOfSpeech:"Danh từ",example:"내일 시험이 있어요.",exampleMeaning:"Mai có thi.",hanViet:"試驗"},
  {id:59,front:"취미",back:"Sở thích",roman:"chwimi",category:"daily",level:"intermediate",topik:"topik2",partOfSpeech:"Danh từ",example:"취미가 뭐예요?",exampleMeaning:"Sở thích là gì?",hanViet:"趣味"},
  {id:60,front:"약속",back:"Hẹn",roman:"yaksok",category:"daily",level:"intermediate",topik:"topik2",partOfSpeech:"Danh từ",example:"약속이 있어요.",exampleMeaning:"Có hẹn.",hanViet:"約束"},
  {id:61,front:"날씨",back:"Thời tiết",roman:"nalssi",category:"daily",level:"intermediate",topik:"topik2",partOfSpeech:"Danh từ",example:"날씨가 추워요.",exampleMeaning:"Trời lạnh.",hanViet:""},
  {id:62,front:"생각하다",back:"Nghĩ",roman:"saenggakada",category:"verbs",level:"intermediate",topik:"topik2",partOfSpeech:"Động từ",example:"좋은 생각이에요.",exampleMeaning:"Ý hay đấy.",hanViet:"生覺"},
  {id:63,front:"중요하다",back:"Quan trọng",roman:"jungyohada",category:"adjectives",level:"intermediate",topik:"topik2",partOfSpeech:"Tính từ",example:"이것이 중요해요.",exampleMeaning:"Điều này quan trọng.",hanViet:"重要"},
  {id:64,front:"어렵다",back:"Khó",roman:"eoryeopda",category:"adjectives",level:"intermediate",topik:"topik2",partOfSpeech:"Tính từ",example:"한국어가 어려워요.",exampleMeaning:"Tiếng Hàn khó.",hanViet:""},
  {id:65,front:"쉽다",back:"Dễ",roman:"swipda",category:"adjectives",level:"intermediate",topik:"topik2",partOfSpeech:"Tính từ",example:"이 문제는 쉬워요.",exampleMeaning:"Bài này dễ.",hanViet:""},
  {id:66,front:"행복하다",back:"Hạnh phúc",roman:"haengbokada",category:"adjectives",level:"advanced",topik:"topik2",partOfSpeech:"Tính từ",example:"행복하세요!",exampleMeaning:"Chúc hạnh phúc!",hanViet:"幸福"},
  {id:67,front:"경험",back:"Kinh nghiệm",roman:"gyeongheom",category:"daily",level:"advanced",topik:"topik2",partOfSpeech:"Danh từ",example:"좋은 경험이었어요.",exampleMeaning:"Trải nghiệm tốt.",hanViet:"經驗"},
  {id:68,front:"발전",back:"Phát triển",roman:"baljeon",category:"daily",level:"advanced",topik:"topik2",partOfSpeech:"Danh từ",example:"많이 발전했어요.",exampleMeaning:"Phát triển nhiều.",hanViet:"發展"},
  {id:69,front:"기억하다",back:"Nhớ",roman:"gieokada",category:"verbs",level:"advanced",topik:"topik2",partOfSpeech:"Động từ",example:"이름을 기억해요.",exampleMeaning:"Nhớ tên.",hanViet:"記憶"},
  {id:70,front:"미래",back:"Tương lai",roman:"mirae",category:"daily",level:"advanced",topik:"topik2",partOfSpeech:"Danh từ",example:"미래가 밝아요.",exampleMeaning:"Tương lai tươi sáng.",hanViet:"未來"}
];

// ===================== NORMALIZER =====================
function normWord(w) {
  return {fav:false,hard:false,learned:false,correctCount:0,wrongCount:0,lastReviewed:null,nextReview:null,createdAt:Date.now(),srBox:1,...w};
}

// ===================== APP =====================
const A = {
  s: {
    words:[], cat:'all', view:'dict', streak:0, lastStudy:null, daily:{},
    settings: {
      theme:'light', ttsSpeed:'0.8', autoTTS:false,
      sessionSize:20, priorHard:false,
      apiKey:'', chatModel:'gemini-3.6-flash',
      voiceModel:'gemini-3.1-flash-live-preview'
    }
  },

  // ==================== INIT ====================
  init() {
    this.load(); this.renderCatBar(); this.renderChatModels();
    this.renderChatScenes(); this.updateHeader(); this.renderDict();
    this.fc.init(); this.stats.render(); this.settingsUI(); this.applyTheme();
    document.getElementById('searchInput').addEventListener('input', this.debounce(()=>this.renderDict(), 200));
    document.getElementById('chatInput').addEventListener('keydown', e=>{if(e.key==='Enter')this.chat.send()});
    document.addEventListener('keydown', e=>this.hotkey(e));
    if('speechSynthesis' in window){speechSynthesis.getVoices();speechSynthesis.onvoiceschanged=()=>speechSynthesis.getVoices()}
  },

  // ==================== STORAGE ====================
  load() {
    try {
      const d = localStorage.getItem('krApp2');
      if(d) {
        const p = JSON.parse(d);
        this.s.words = (p.words||[]).map(w=>({...normWord({}),...w}));
        this.s.streak = p.streak||0; this.s.lastStudy = p.lastStudy||null;
        this.s.daily = p.daily||{};
        if(p.settings) this.s.settings = {...this.s.settings, ...p.settings};
      }
      if(!this.s.words.length) { this.s.words = SAMPLE.map(w=>normWord(w)); this.save(); }
    } catch(e) { console.error('Load err:',e); this.s.words = SAMPLE.map(w=>normWord(w)); }
  },

  save() {
    try { localStorage.setItem('krApp2', JSON.stringify({words:this.s.words,streak:this.s.streak,lastStudy:this.s.lastStudy,daily:this.s.daily,settings:this.s.settings})); }
    catch(e) { console.error('Save err:',e); }
  },

  // ==================== STREAK ====================
  checkStreak() {
    const t = new Date().toDateString();
    if(this.s.lastStudy) { const d=Math.floor((new Date(t)-new Date(this.s.lastStudy))/864e5); if(d>1) this.s.streak=0; }
    document.getElementById('hStreak').textContent = this.s.streak;
  },

  recordActivity() {
    const t=new Date().toISOString().slice(0,10), ts=new Date().toDateString();
    if(this.s.lastStudy!==ts) {
      if(this.s.lastStudy) { const d=Math.floor((new Date(ts)-new Date(this.s.lastStudy))/864e5); this.s.streak=d<=1?this.s.streak+1:1; }
      else this.s.streak=1;
      this.s.lastStudy=ts;
    }
    this.s.daily[t]=(this.s.daily[t]||0)+1;
    document.getElementById('hStreak').textContent=this.s.streak; this.save();
  },

  // ==================== NAV ====================
  nav(v) {
    this.s.view=v;
    document.querySelectorAll('.view').forEach(el=>el.classList.remove('active'));
    const tgt=document.getElementById('v-'+v); if(tgt) tgt.classList.add('active');
    document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.v===v));
    if(v==='stats') this.stats.render();
    if(v==='flashcard') this.fc.init();
  },

  // ==================== THEME ====================
  applyTheme() {
    const t=this.s.settings.theme; document.documentElement.dataset.theme=t;
    document.getElementById('themeBtn').textContent=t==='dark'?'☀️':'🌙';
    this.setToggle('tDark',t==='dark');
  },
  toggleTheme() { this.s.settings.theme=this.s.settings.theme==='dark'?'light':'dark'; this.applyTheme(); this.save(); },

  // ==================== CATEGORY ====================
  renderCatBar() {
    const cs=[{id:'all',l:'Tất cả',i:'📚'},{id:'topik1',l:'TOPIK I',i:'📗'},{id:'topik2',l:'TOPIK II',i:'📕'},
      {id:'beginner',l:'Sơ cấp',i:'🌱'},{id:'intermediate',l:'Trung cấp',i:'🌿'},{id:'advanced',l:'Cao cấp',i:'🌳'},
      {id:'fav',l:'Yêu thích',i:'❤️'},{id:'hard',l:'Từ khó',i:'⚠️'},{id:'new',l:'Từ mới',i:'✨'}];
    document.getElementById('catBar').innerHTML=cs.map(c=>
      `<button data-c="${c.id}" class="${c.id==='all'?'active':''}" onclick="A.setCat('${c.id}')">${c.i} ${c.l}</button>`).join('');
  },
  setCat(c) {
    this.s.cat=c;
    document.querySelectorAll('.cat-bar button').forEach(b=>b.classList.toggle('active',b.dataset.c===c));
    this.renderDict(); this.fc.init();
  },
  filtered() {
    const c=this.s.cat, w=this.s.words;
    if(c==='all') return w;
    if(c==='fav') return w.filter(x=>x.fav);
    if(c==='hard') return w.filter(x=>x.hard);
    if(c==='new') return w.filter(x=>!x.learned);
    if(c==='topik1') return w.filter(x=>x.topik==='topik1');
    if(c==='topik2') return w.filter(x=>x.topik==='topik2');
    return w.filter(x=>x.level===c);
  },

  // ==================== DICTIONARY ====================
  renderDict() {
    const q=document.getElementById('searchInput').value.toLowerCase().trim();
    let ws=this.filtered();
    if(q) {
      ws=ws.filter(w=>w.front.includes(q)||w.back.toLowerCase().includes(q)||(w.roman&&w.roman.toLowerCase().includes(q))||(w.hanViet&&w.hanViet.includes(q)));
      document.getElementById('searchClear').classList.add('show');
    } else document.getElementById('searchClear').classList.remove('show');
    document.getElementById('resultCount').textContent=ws.length?`${ws.length} từ`:'';
    const el=document.getElementById('wordList');
    if(!ws.length) { el.innerHTML='<div class="empty"><div class="e-icon">📭</div><p>Không tìm thấy từ nào</p></div>'; return; }
    el.innerHTML=ws.map(w=>`<div class="word-item" onclick="A.showWord(${w.id})">
      <div class="w-main"><div class="w-kr">${w.front} <span class="badge ${w.level}">${w.level==='beginner'?'Sơ cấp':w.level==='intermediate'?'Trung cấp':'Cao cấp'}</span></div>
      <div class="w-vi">${w.back}</div><div class="w-roman">${w.roman||''}</div></div>
      <div class="w-actions"><button class="btn-icon" onclick="event.stopPropagation();A.tts('${w.front}')" title="Phát âm">🔊</button>
      <button class="btn-icon" onclick="event.stopPropagation();A.toggleFav(${w.id})" title="Yêu thích">${w.fav?'❤️':'🤍'}</button></div></div>`).join('');
    document.getElementById('hTotal').textContent=this.s.words.length;
  },
  clearSearch() { document.getElementById('searchInput').value=''; this.renderDict(); },
  showWord(id) {
    const w=this.s.words.find(x=>x.id===id); if(!w) return;
    const srInfo=w.srBox>=4?'✅ Đã thuộc':w.srBox>=2?'📖 Đang học':'✨ Mới';
    document.getElementById('modalBody').innerHTML=`
      <h2>${w.front}</h2><div class="d-roman">${w.roman||''}</div>
      <div class="d-row"><span class="d-label">Nghĩa</span><span class="d-val">${w.back}</span></div>
      <div class="d-row"><span class="d-label">Loại từ</span><span class="d-val">${w.partOfSpeech||'-'}</span></div>
      <div class="d-row"><span class="d-label">Cấp độ</span><span class="d-val"><span class="badge ${w.level}">${w.level}</span></span></div>
      <div class="d-row"><span class="d-label">Trạng thái</span><span class="d-val">${srInfo} (Box ${w.srBox||1})</span></div>
      ${w.hanViet?`<div class="d-row"><span class="d-label">Hán Việt</span><span class="d-val">${w.hanViet}</span></div>`:''}
      ${w.example?`<div class="d-row"><span class="d-label">Ví dụ</span><span class="d-val">${w.example}<br><em style="color:var(--text3)">${w.exampleMeaning||''}</em></span></div>`:''}
      <div class="d-actions">
        <button class="btn btn-primary btn-sm" onclick="A.tts('${w.front}')">🔊 Nghe</button>
        <button class="btn btn-outline btn-sm" onclick="A.toggleFav(${w.id});A.showWord(${w.id})">${w.fav?'❤️ Bỏ thích':'🤍 Thích'}</button>
        <button class="btn btn-outline btn-sm" onclick="A.toggleHard(${w.id});A.showWord(${w.id})">${w.hard?'⚑ Bỏ khó':'⚑ Khó'}</button>
        <button class="btn btn-outline btn-sm" onclick="A.copyWord(${w.id})">📋 Copy</button>
        <button class="btn btn-outline btn-sm" onclick="A.explainAI(${w.id})">🤖 AI giải thích</button>
      </div><div id="aiExplain" class="mt-8"></div>`;
    document.getElementById('wordModal').classList.add('show');
  },
  closeModal() { document.getElementById('wordModal').classList.remove('show'); },
  closeAddModal() { document.getElementById('addModal').classList.remove('show'); },
  toggleFav(id) { const w=this.s.words.find(x=>x.id===id); if(w){w.fav=!w.fav;this.save();this.renderDict();this.toast(w.fav?'Đã thích':'Bỏ thích','success');} },
  toggleHard(id) { const w=this.s.words.find(x=>x.id===id); if(w){w.hard=!w.hard;this.save();this.renderDict();this.toast(w.hard?'Đã đánh dấu khó':'Bỏ đánh dấu','info');} },
  copyWord(id) { const w=this.s.words.find(x=>x.id===id); if(w) navigator.clipboard.writeText(`${w.front} (${w.roman||''}) - ${w.back}`).then(()=>this.toast('Đã copy!','success')); },
  async explainAI(id) {
    const w=this.s.words.find(x=>x.id===id); if(!w) return;
    const k=this.s.settings.apiKey; if(!k){this.toast('Nhập API Key trong Cài đặt','warning');return;}
    const el=document.getElementById('aiExplain'); el.innerHTML='<div style="color:var(--text3)">🤖 Đang giải thích...</div>';
    try {
      const r=await this.gemini([{role:'user',parts:[{text:`Giải thích từ tiếng Hàn "${w.front}" (${w.roman}) cho người Việt. Gồm: nghĩa chi tiết, cách dùng, ngữ pháp, từ đồng nghĩa, mẹo ghi nhớ. Ngắn gọn, tiếng Việt.`}]}],k,'gemini-3.6-flash');
      el.innerHTML=`<div class="card" style="font-size:.88rem;line-height:1.7">${this.esc(r).replace(/\n/g,'<br>')}</div>`;
    } catch(e) { el.innerHTML=`<div style="color:var(--error)">⚠️ ${e.message}</div>`; }
  },

  // ==================== ADD WORD ====================
  dict: {
    showAddWord() {
      document.getElementById('addBody').innerHTML=`<div class="add-form">
        <input id="addKr" placeholder="Tiếng Hàn * (예: 사과)" required>
        <input id="addVi" placeholder="Nghĩa tiếng Việt * (예: quả táo)" required>
        <input id="addRoman" placeholder="Romanization (예: sagwa)">
        <div class="form-row">
          <select id="addLevel"><option value="beginner">Sơ cấp</option><option value="intermediate">Trung cấp</option><option value="advanced">Cao cấp</option></select>
          <select id="addCat"><option value="custom">Tùy chỉnh</option><option value="greetings">Chào hỏi</option><option value="food">Đồ ăn</option><option value="family">Gia đình</option><option value="places">Địa điểm</option><option value="verbs">Động từ</option><option value="adjectives">Tính từ</option><option value="daily">Hàng ngày</option><option value="education">Giáo dục</option></select>
        </div>
        <input id="addPos" placeholder="Loại từ (예: Danh từ)">
        <textarea id="addEx" placeholder="Ví dụ tiếng Hàn"></textarea>
        <input id="addExVi" placeholder="Nghĩa ví dụ">
        <button class="btn btn-primary" onclick="A.dict.addWord()" style="width:100%">➕ Thêm từ</button></div>`;
      document.getElementById('addModal').classList.add('show');
    },
    addWord() {
      const kr=document.getElementById('addKr').value.trim(), vi=document.getElementById('addVi').value.trim();
      if(!kr||!vi){A.toast('Nhập từ và nghĩa!','error');return;}
      A.s.words.push(normWord({id:Date.now(),front:kr,back:vi,roman:document.getElementById('addRoman').value.trim(),
        level:document.getElementById('addLevel').value,category:document.getElementById('addCat').value,
        partOfSpeech:document.getElementById('addPos').value.trim(),example:document.getElementById('addEx').value.trim(),
        exampleMeaning:document.getElementById('addExVi').value.trim(),topik:'custom',hanViet:''}));
      A.save(); A.renderDict(); A.closeAddModal(); A.toast(`Đã thêm "${kr}"!`,'success');
    }
  },

  // ==================== TTS ====================
  tts(text) {
    if(!text||!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text); u.lang='ko-KR'; u.rate=parseFloat(this.s.settings.ttsSpeed)||0.8;
    const v=speechSynthesis.getVoices().find(x=>x.lang.startsWith('ko')); if(v) u.voice=v;
    speechSynthesis.speak(u);
  },

  // ==================== FLASHCARD ====================
  fc: {
    idx:0, words:[], flipped:false, mode:'all',
    init() { this.loadWords(); this.idx=0; this.flipped=false; this.render(); this.setupSwipe(); },
    loadWords() {
      const ws=A.filtered();
      if(this.mode==='due') { const now=Date.now(); this.words=ws.filter(w=>!w.nextReview||w.nextReview<=now); }
      else this.words=[...ws];
      this.renderModeBar();
    },
    renderModeBar() {
      const due=A.filtered().filter(w=>!w.nextReview||w.nextReview<=Date.now()).length;
      document.getElementById('fcModeBar').innerHTML=`
        <button class="${this.mode==='all'?'active':''}" onclick="A.fc.setMode('all')">Tất cả</button>
        <button class="${this.mode==='due'?'active':''}" onclick="A.fc.setMode('due')">Ôn tập ${due?`<span class="fc-due-badge">${due}</span>`:''}</button>`;
    },
    setMode(m) { this.mode=m; this.init(); },
    cur() { return this.words[this.idx]; },
    render() {
      const w=this.cur();
      if(!w) { document.getElementById('fcFront').textContent='Không có từ'; document.getElementById('fcBack').textContent=''; document.getElementById('fcRoman').textContent=''; document.getElementById('fcPos').textContent=''; document.getElementById('fcProg').textContent='0/0'; return; }
      document.getElementById('fcFront').textContent=w.front;
      document.getElementById('fcBack').textContent=w.back;
      document.getElementById('fcRoman').textContent=w.roman||'';
      document.getElementById('fcPos').textContent=w.partOfSpeech||'';
      document.getElementById('fcProg').textContent=`${this.idx+1} / ${this.words.length}`;
      document.getElementById('fcFill').style.width=`${((this.idx+1)/this.words.length)*100}%`;
      document.getElementById('fcFav').textContent=w.fav?'❤️':'🤍';
      document.getElementById('fcHard').style.opacity=w.hard?1:.4;
      document.getElementById('flashcard').classList.toggle('flipped',this.flipped);
      if(this.flipped&&A.s.settings.autoTTS) A.tts(w.front);
    },
    flip() {
      this.flipped=!this.flipped;
      document.getElementById('flashcard').classList.toggle('flipped',this.flipped);
      if(this.flipped) { const w=this.cur(); if(w){w.lastReviewed=Date.now();A.save();} }
    },
    next() { if(!this.words.length)return; this.idx=(this.idx+1)%this.words.length; this.flipped=false; this.render(); A.recordActivity(); },
    prev() { if(!this.words.length)return; this.idx=(this.idx-1+this.words.length)%this.words.length; this.flipped=false; this.render(); },
    toggleFav() { const w=this.cur(); if(w){const o=A.s.words.find(x=>x.id===w.id);if(o){o.fav=!o.fav;w.fav=o.fav;A.save();this.render();A.renderDict();}} },
    markHard() { const w=this.cur(); if(w){const o=A.s.words.find(x=>x.id===w.id);if(o){o.hard=!o.hard;w.hard=o.hard;A.save();this.render();}} },
    markCorrect() {
      const w=this.cur(); if(!w)return; const o=A.s.words.find(x=>x.id===w.id);
      if(o){o.srBox=Math.min((o.srBox||1)+1,5);const days=[0,1,3,7,14];o.nextReview=Date.now()+(days[o.srBox-1]||14)*864e5;o.correctCount++;o.lastReviewed=Date.now();if(o.srBox>=4)o.learned=true;A.save();}
      this.next();
    },
    markWrong() {
      const w=this.cur(); if(!w)return; const o=A.s.words.find(x=>x.id===w.id);
      if(o){o.srBox=1;o.nextReview=Date.now();o.wrongCount++;o.lastReviewed=Date.now();A.save();}
      this.next();
    },
    setupSwipe() {
      const el=document.getElementById('fcContainer'), fc=document.getElementById('flashcard');
      const lh=document.querySelector('.fc-swipe-hint.left'), rh=document.querySelector('.fc-swipe-hint.right');
      let startX=0, startY=0, dx=0, moving=false;
      el.addEventListener('touchstart', e=>{startX=e.touches[0].clientX;startY=e.touches[0].clientY;moving=false;fc.style.transition='none';},{passive:true});
      el.addEventListener('touchmove', e=>{
        dx=e.touches[0].clientX-startX; const dy=e.touches[0].clientY-startY;
        if(Math.abs(dx)>15&&Math.abs(dx)>Math.abs(dy)){
          moving=true; fc.style.transform=`translateX(${dx*.7}px) rotate(${dx*.04}deg)`;
          if(dx>40) rh.style.opacity=Math.min((dx-40)/40,1); else rh.style.opacity=0;
          if(dx<-40) lh.style.opacity=Math.min((-dx-40)/40,1); else lh.style.opacity=0;
        }
      },{passive:true});
      el.addEventListener('touchend', ()=>{
        fc.style.transition='transform .35s var(--ease)';
        if(moving&&Math.abs(dx)>70){dx>0?this.prev():this.next();}
        fc.style.transform=this.flipped?'rotateY(180deg)':'';
        lh.style.opacity=0; rh.style.opacity=0;
        if(!moving&&Math.abs(dx)<10) this.flip();
        dx=0;
      });
    }
  },

  // ==================== GAMES ====================
  game: {
    score:0, streak:0, type:'', _c:[],
    start(t) {
      this.type=t;this.score=0;this.streak=0;this.cleanup();
      document.getElementById('gameSelect').style.display='none';
      document.getElementById('gameArea').classList.add('active'); this.updScore();
      if(t==='quiz') this.initQuiz(); else if(t==='match') this.initMatch();
      else if(t==='typing') this.initTyping(); else if(t==='speak') this.initSpeak();
    },
    back() { this.cleanup();document.getElementById('gameSelect').style.display='';document.getElementById('gameArea').classList.remove('active');document.getElementById('gameContent').innerHTML=''; },
    cleanup() { this._c.forEach(f=>f());this._c=[];try{if(A._sr)A._sr.stop();}catch(e){} },
    updScore() { document.getElementById('gScore').textContent=`🎯 ${this.score}`;document.getElementById('gStreak').textContent=`🔥 ${this.streak}`; },
    shuffle(a) { for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; },
    sim(a,b) { if(!a||!b)return 0;a=a.toLowerCase().trim();b=b.toLowerCase().trim();if(a===b)return 1;const l=a.length>b.length?a:b,s=a.length>b.length?b:a;if(!l.length)return 1;let m=0;for(let i=0;i<s.length;i++)if(l.includes(s[i]))m++;return m/l.length; },
    initQuiz() { const ws=A.filtered();if(ws.length<4){A.toast('Cần ít nhất 4 từ','warning');this.back();return;} this._qw=this.shuffle([...ws]).slice(0,20);this._qi=0;this.nextQ(); },
    nextQ() {
      if(this._qi>=this._qw.length){this.showResult();return;}
      const w=this._qw[this._qi],all=A.s.words,opts=[w];
      while(opts.length<4){const r=all[Math.floor(Math.random()*all.length)];if(!opts.find(o=>o.id===r.id))opts.push(r);}
      const sh=this.shuffle(opts);
      document.getElementById('gameContent').innerHTML=`<div class="quiz-q">${w.front}</div><div class="quiz-sub">${w.roman||''}</div>
        ${sh.map((o,i)=>`<button class="quiz-opt" data-id="${o.id}" onclick="A.game.ansQuiz(${o.id},${w.id},this)">${String.fromCharCode(65+i)}. ${o.back}</button>`).join('')}`;
    },
    ansQuiz(sid,cid,btn) {
      document.querySelectorAll('.quiz-opt').forEach(o=>{o.classList.add('done');if(+o.dataset.id===cid)o.classList.add('correct');});
      if(sid===cid){btn.classList.add('correct');this.score+=10;this.streak++;const w=A.s.words.find(x=>x.id===cid);if(w){w.correctCount++;w.learned=true;w.lastReviewed=Date.now();}}
      else{btn.classList.add('wrong');this.streak=0;const w=A.s.words.find(x=>x.id===cid);if(w)w.wrongCount++;}
      A.save();this.updScore();A.recordActivity();this._qi++;setTimeout(()=>this.nextQ(),1100);
    },
    initMatch() {
      const ws=A.filtered();if(ws.length<4){A.toast('Cần ít nhất 4 từ','warning');this.back();return;}
      const sel=this.shuffle([...ws]).slice(0,6);this._msel=null;this._mc=0;this._mt=sel.length;
      const kr=this.shuffle([...sel]),vi=this.shuffle([...sel]);
      document.getElementById('gameContent').innerHTML=`<div class="match-grid">
        <div class="match-col">${kr.map(w=>`<div class="match-item" data-id="${w.id}" data-col="k" onclick="A.game.matchClk(this)">${w.front}</div>`).join('')}</div>
        <div class="match-col">${vi.map(w=>`<div class="match-item" data-id="${w.id}" data-col="v" onclick="A.game.matchClk(this)">${w.back}</div>`).join('')}</div></div>`;
    },
    matchClk(el) {
      if(el.classList.contains('matched'))return; const col=el.dataset.col;
      if(this._msel&&this._msel.dataset.col===col){document.querySelectorAll('.match-item.sel').forEach(e=>e.classList.remove('sel'));this._msel=el;el.classList.add('sel');return;}
      el.classList.add('sel'); if(!this._msel){this._msel=el;return;}
      const f=this._msel,s=el;
      if(f.dataset.id===s.dataset.id){
        f.classList.add('matched');s.classList.add('matched');f.classList.remove('sel');s.classList.remove('sel');
        this._mc++;this.score+=15;this.streak++;this.updScore();A.recordActivity();
        if(this._mc>=this._mt)setTimeout(()=>{document.getElementById('gameContent').innerHTML+=`<div class="game-result"><div class="r-icon">🎉</div><div class="r-score">${this.score} điểm</div><button class="btn btn-primary" onclick="A.game.initMatch()">Chơi lại</button></div>`;},400);
      } else {
        f.classList.add('wrong-anim');s.classList.add('wrong-anim');this.streak=0;this.updScore();
        setTimeout(()=>{f.classList.remove('sel','wrong-anim');s.classList.remove('sel','wrong-anim');},400);
      }
      this._msel=null;
    },
    initTyping() { const ws=A.filtered();if(!ws.length){A.toast('Không có từ','warning');this.back();return;} this._tw=this.shuffle([...ws]).slice(0,15);this._ti=0;this.nextTyping(); },
    nextTyping() {
      if(this._ti>=this._tw.length){this.showResult();return;}
      const w=this._tw[this._ti];
      document.getElementById('gameContent').innerHTML=`<div class="quiz-q">${w.back}</div><div class="quiz-sub">${w.roman||''}</div>
        <input type="text" class="type-input" id="typeIn" placeholder="Nhập tiếng Hàn..." autocomplete="off">
        <button class="btn btn-primary" style="width:100%" onclick="A.game.chkType()">Kiểm tra ▶</button><div id="typeRes"></div>`;
      const inp=document.getElementById('typeIn');inp.focus();inp.addEventListener('keydown',e=>{if(e.key==='Enter')A.game.chkType();});
    },
    chkType() {
      const inp=document.getElementById('typeIn'),w=this._tw[this._ti],ans=inp.value.trim(),el=document.getElementById('typeRes');
      if(!ans)return;
      if(ans===w.front){el.innerHTML='<div class="type-result" style="background:var(--success-light);color:#065f46">✅ Chính xác!</div>';this.score+=20;this.streak++;const o=A.s.words.find(x=>x.id===w.id);if(o){o.correctCount++;o.learned=true;}}
      else{const s=this.sim(ans,w.front);if(s>.6){el.innerHTML=`<div class="type-result" style="background:var(--warn-light);color:#92400e">⚠️ Gần đúng! → ${w.front}</div>`;this.score+=5;}else{el.innerHTML=`<div class="type-result" style="background:var(--error-light);color:#991b1b">❌ Sai! → ${w.front}</div>`;this.streak=0;const o=A.s.words.find(x=>x.id===w.id);if(o)o.wrongCount++;}}
      A.save();this.updScore();A.recordActivity();this._ti++;setTimeout(()=>this.nextTyping(),1400);
    },
    initSpeak() {
      const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
      if(!SR){document.getElementById('gameContent').innerHTML='<div class="empty"><div class="e-icon">🎤</div><p>Không hỗ trợ.<br>Dùng Chrome.</p></div>';return;}
      const ws=A.filtered();if(!ws.length){A.toast('Không có từ','warning');this.back();return;}
      this._sw=this.shuffle([...ws]).slice(0,10);this._si=0;this.nextSpeak();
    },
    nextSpeak() {
      if(this._si>=this._sw.length){this.showResult();return;}
      const w=this._sw[this._si];
      document.getElementById('gameContent').innerHTML=`<div class="quiz-q">${w.front}</div><div class="quiz-sub">${w.back} (${w.roman||''})</div>
        <div class="text-center"><button class="btn-icon" onclick="A.tts('${w.front}')" style="font-size:1.4rem">🔊 Nghe mẫu</button></div>
        <div class="text-center"><button class="speak-mic" id="sMic" onclick="A.game.startListen()">🎤</button></div>
        <div id="speakRes" class="text-center mt-16"></div>`;
    },
    startListen() {
      const SR=window.SpeechRecognition||window.webkitSpeechRecognition,rec=new SR();
      rec.lang='ko-KR';rec.interimResults=false;rec.maxAlternatives=3;
      const btn=document.getElementById('sMic'),res=document.getElementById('speakRes');
      btn.classList.add('rec');res.innerHTML='<div style="color:var(--text3)">🎤 Đang nghe...</div>';
      rec.onresult=e=>{
        const said=e.results[0][0].transcript,conf=Math.round(e.results[0][0].confidence*100);
        const w=this._sw[this._si],s=this.sim(said,w.front),sc=Math.round(s*60+conf*.4);
        if(s>=.8){this.score+=Math.round(sc/5);this.streak++;res.innerHTML=`<div class="card"><div style="color:var(--text3);font-size:.78rem">Bạn nói</div><div style="font-size:1.1rem;margin:6px 0">${said}</div><div style="font-size:2rem;font-weight:700;color:var(--success)">🎯 ${sc}/100</div><div style="color:var(--success)">Tuyệt vời!</div></div>`;}
        else if(s>=.5){this.score+=Math.round(sc/10);res.innerHTML=`<div class="card"><div style="color:var(--text3);font-size:.78rem">Bạn nói</div><div style="font-size:1.1rem;margin:6px 0">${said}</div><div style="font-size:2rem;font-weight:700;color:var(--warn)">🎯 ${sc}/100</div><div style="color:var(--warn)">Khá tốt!</div></div>`;}
        else{this.streak=0;res.innerHTML=`<div class="card"><div style="color:var(--text3);font-size:.78rem">Bạn nói</div><div style="font-size:1.1rem;margin:6px 0">${said||'?'}</div><div style="font-size:2rem;font-weight:700;color:var(--error)">🎯 ${sc}/100</div><div style="color:var(--error)">Thử lại!</div></div>`;}
        const o=A.s.words.find(x=>x.id===w.id);if(o){if(s>=.8)o.correctCount++;else o.wrongCount++;}
        A.save();this.updScore();A.recordActivity();this._si++;setTimeout(()=>this.nextSpeak(),2200);
      };
      rec.onerror=e=>{res.innerHTML=`<div style="color:var(--error)">⚠️ ${e.error}</div>`;};
      rec.onend=()=>btn.classList.remove('rec');rec.start();A._sr=rec;
    },
    showResult() { document.getElementById('gameContent').innerHTML=`<div class="game-result"><div class="r-icon">🎉</div><div class="r-score">${this.score} điểm</div><p style="color:var(--text2);margin:8px 0">Streak: ${this.streak}</p><button class="btn btn-primary" onclick="A.game.start('${this.type}')">Chơi lại</button></div>`; }
  },

  // ==================== AI CHAT ====================
  chat: {
    hist:[], scene:'free', loading:false,
    scenes:[
      {id:'free',l:'💬 Free Talk',sys:'Bạn là giáo viên tiếng Hàn thân thiện. Nói tiếng Hàn đơn giản, giải thích tiếng Việt khi cần. Sửa lỗi nhẹ nhàng.'},
      {id:'cafe',l:'☕ Cafe',sys:'Bạn là nhân viên quán cafe Hàn Quốc. Luyện gọi đồ uống bằng tiếng Hàn.'},
      {id:'school',l:'🏫 School',sys:'Bạn là bạn học Hàn Quốc. Luyện hội thoại trường học, bài tập.'},
      {id:'travel',l:'✈️ Travel',sys:'Bạn là hướng dẫn viên du lịch. Luyện hội thoại du lịch Hàn Quốc.'},
      {id:'topik',l:'📝 TOPIK',sys:'Bạn là giáo viên luyện thi TOPIK. Đưa câu hỏi TOPIK, chấm bài, giải thích.'}
    ],
    render() { document.getElementById('chatScenes').innerHTML=this.scenes.map(s=>`<button class="${s.id===this.scene?'active':''}" onclick="A.chat.setScene('${s.id}')">${s.l}</button>`).join(''); },
    setScene(id) { this.scene=id;this.hist=[];this.render();document.getElementById('chatMsgs').innerHTML='';this.hist.push({role:'user',parts:[{text:'Xin chào! Hãy bắt đầu.'}]});this.sendToAI(true); },
    async send() {
      const inp=document.getElementById('chatInput'),t=inp.value.trim();if(!t||this.loading)return;inp.value='';
      document.getElementById('chatMsgs').innerHTML+=`<div class="c-msg user">${this.esc(t)}</div>`;
      this.hist.push({role:'user',parts:[{text:t}]});this.sendToAI(false);
    },
    async sendToAI(greet) {
      const k=A.s.settings.apiKey;if(!k){document.getElementById('chatMsgs').innerHTML+=`<div class="c-msg ai"><span class="c-err">⚠️ Nhập API Key trong Cài đặt</span></div>`;return;}
      this.loading=true;const el=document.getElementById('chatMsgs');
      if(!greet) el.innerHTML+=`<div class="c-msg ai" id="aiTmp">🤖 Đang suy nghĩ...</div>`;
      try {
        const sc=this.scenes.find(s=>s.id===this.scene);
        const r=await A.gemini(this.hist,k,A.s.settings.chatModel,sc.sys);
        this.hist.push({role:'model',parts:[{text:r}]});
        const tmp=document.getElementById('aiTmp');if(tmp){tmp.innerHTML=this.fmtResp(r);tmp.removeAttribute('id');}
      } catch(e) { const tmp=document.getElementById('aiTmp');if(tmp){tmp.innerHTML=`<span class="c-err">⚠️ ${e.message}</span>`;tmp.removeAttribute('id');} }
      this.loading=false;el.scrollTop=el.scrollHeight;
    },
    fmtResp(t) { return t.split('\n').map(l=>{if(l.match(/^[✔✅✓]/))return`<div style="color:var(--success)">${this.esc(l)}</div>`;if(l.match(/^[💡]/))return`<div style="color:var(--warn)">${this.esc(l)}</div>`;return this.esc(l);}).join('<br>'); },
    clear() { this.hist=[];document.getElementById('chatMsgs').innerHTML='';A.toast('Đã xóa chat','info'); },
    esc(s) { const d=document.createElement('div');d.textContent=s;return d.innerHTML; }
  },

  renderChatModels() {
    const ms=[{id:'gemini-3.6-flash',l:'3.6 Flash'},{id:'gemini-3.5-flash-lite',l:'3.5 Lite'},{id:'gemini-3.1-flash-lite',l:'3.1 Lite'}];
    document.getElementById('chatModels').innerHTML=ms.map(m=>
      `<button class="${m.id===this.s.settings.chatModel?'active':''}" onclick="A.s.settings.chatModel='${m.id}';A.settings.save();A.renderChatModels()">${m.l}</button>`).join('');
  },
  renderChatScenes() { this.chat.render(); },

  // ==================== GEMINI API ====================
  async gemini(contents,key,model,sys) {
    const url=`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const body={contents:contents.map(c=>({role:c.role==='model'?'model':'user',parts:c.parts})),generationConfig:{temperature:0.8,maxOutputTokens:1024}};
    if(sys) body.systemInstruction={parts:[{text:sys}]};
    const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e?.error?.message||`API ${r.status}`);}
    const d=await r.json();return d.candidates?.[0]?.content?.parts?.[0]?.text||'(Không có phản hồi)';
  },

  // ==================== VOICE CALL ====================
  voice: {
    ws:null, actx:null, stream:null, worklet:null,
    state:'off', playCtx:null, queue:[], playing:false,
    muted:false, speakerOn:true, timer:null, secs:0,

    async startCall() {
      const k=A.s.settings.apiKey;if(!k){A.toast('Nhập API Key trong Cài đặt','warning');return;}
      if(this.state!=='off')return;
      this.state='connecting';this.showOverlay();this.setStatus('connecting','Đang kết nối...');
      this.secs=0;this.updateTimer();document.getElementById('vcTranscript').innerHTML='';
      this.addTC('sys','Đang kết nối AI...');
      try {
        this.stream=await navigator.mediaDevices.getUserMedia({audio:{sampleRate:16000,channelCount:1,echoCancellation:true,noiseSuppression:true}});
        this.actx=new AudioContext({sampleRate:16000});
        const blob=new Blob([`class P extends AudioWorkletProcessor{constructor(){super();this._b=[];this._r=sampleRate/16000;this._a=0;this._n=0}process(i){const x=i[0]?.[0];if(!x)return true;for(let j=0;j<x.length;j++){this._a+=x[j];this._n++;if(this._n>=this._r){let s=this._a/this._n;s=Math.max(-1,Math.min(1,s));this._b.push(s<0?s*0x8000:s*0x7FFF);this._a=0;this._n=0}}while(this._b.length>=512){const c=new Int16Array(this._b.splice(0,512));this.port.postMessage(c.buffer,[c.buffer])}return true}}registerProcessor('pcm-processor',P);`],{type:'application/javascript'});
        const u=URL.createObjectURL(blob);await this.actx.audioWorklet.addModule(u);URL.revokeObjectURL(u);
        const src=this.actx.createMediaStreamSource(this.stream);
        this.worklet=new AudioWorkletNode(this.actx,'pcm-processor');
        this.worklet.port.onmessage=e=>{
          if(this.ws&&this.ws.readyState===1&&!this.muted){
            this.ws.send(JSON.stringify({realtimeInput:{mediaChunks:[{mimeType:'audio/pcm;rate=16000',data:this.b64(e.data)}]}}));
          }
        };
        src.connect(this.worklet);
        const gain=this.actx.createGain();gain.gain.value=0;this.worklet.connect(gain);gain.connect(this.actx.destination);
        const model=A.s.settings.voiceModel;
        this.ws=new WebSocket(`wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${k}`);
        this.ws.onopen=()=>{
          this.ws.send(JSON.stringify({setup:{
            model:`models/${model}`,
            generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:'Aoede'}}}},
            systemInstruction:{parts:[{text:'Bạn là giáo viên tiếng Hàn thân thiện. Nói tiếng Hàn đơn giản, giải thích tiếng Việt khi cần. Giúp học viên luyện nghe nói. Sửa lỗi nhẹ nhàng.'}]}
          }}));
        };
        this.ws.onmessage=e=>{
          try {
            const m=JSON.parse(e.data);
            if(m.setupComplete){this.state='connected';this.setStatus('connected','Đang nói chuyện');this.startTimer();document.getElementById('vcRing').classList.add('active');document.getElementById('vcWave').classList.add('active');this.addTC('sys','🟢 Đã kết nối! Hãy nói tiếng Hàn.');A.toast('Đã kết nối!','success');return;}
            if(m.serverContent){
              const parts=m.serverContent.modelTurn?.parts||[];
              for(const p of parts){if(p.inlineData)this.playAudio(p.inlineData.data,p.inlineData.mimeType);if(p.text)this.addTC('ai',p.text);}
            }
          } catch(err){console.error('WS msg err:',err);}
        };
        this.ws.onerror=()=>{A.toast('Lỗi kết nối','error');this.endCall();};
        this.ws.onclose=()=>{if(this.state!=='off')this.endCall();};
      } catch(e){console.error('Voice err:',e);A.toast(`Lỗi: ${e.message}`,'error');this.endCall();}
    },
    endCall() {
      this.state='off';this.stopTimer();this.hideOverlay();
      if(this.ws){try{this.ws.close();}catch(e){}this.ws=null;}
      if(this.stream){this.stream.getTracks().forEach(t=>t.stop());this.stream=null;}
      if(this.actx){try{this.actx.close();}catch(e){}this.actx=null;}
      if(this.playCtx){try{this.playCtx.close();}catch(e){}this.playCtx=null;}
      this.worklet=null;this.queue=[];this.playing=false;
    },
    toggleMute() { this.muted=!this.muted;const btn=document.getElementById('vcMute');btn.classList.toggle('on',this.muted);btn.textContent=this.muted?'🔇':'🎤';if(this.stream)this.stream.getAudioTracks().forEach(t=>t.enabled=!this.muted); },
    toggleSpeaker() { this.speakerOn=!this.speakerOn;document.getElementById('vcSpeaker').classList.toggle('on',!this.speakerOn); },
    showOverlay() { document.getElementById('vcOverlay').classList.add('show'); },
    hideOverlay() { document.getElementById('vcOverlay').classList.remove('show');document.getElementById('vcRing').classList.remove('active');document.getElementById('vcWave').classList.remove('active'); },
    setStatus(cls,txt) { document.getElementById('vcDot').className='vc-dot '+cls;document.getElementById('vcStatusText').textContent=txt; },
    startTimer() { this.timer=setInterval(()=>{this.secs++;this.updateTimer();},1000); },
    stopTimer() { if(this.timer){clearInterval(this.timer);this.timer=null;} },
    updateTimer() { const m=Math.floor(this.secs/60),s=this.secs%60;document.getElementById('vcTimer').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; },
    addTC(role,txt) {
      const el=document.getElementById('vcTranscript');
      const cls=role==='ai'?'tc-ai':role==='sys'?'tc-sys':'tc-user';
      const prefix=role==='ai'?'🇰🇷 AI: ':role==='user'?'🇻🇳 Bạn: ':'';
      el.innerHTML+=`<div class="${cls}">${prefix}${txt}</div>`;el.scrollTop=el.scrollHeight;
    },
    playAudio(b64,mime) { if(!this.speakerOn)return;this.queue.push({b64,mime});if(!this.playing)this._playNext(); },
    async _playNext() {
      if(!this.queue.length){this.playing=false;return;}
      this.playing=true;const{b64,mime}=this.queue.shift();
      try {
        const rate=parseInt(mime.match(/rate=(\d+)/)?.[1]||'24000');
        const raw=atob(b64);const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
        const i16=new Int16Array(bytes.buffer);const f32=new Float32Array(i16.length);for(let i=0;i<i16.length;i++)f32[i]=i16[i]/32768;
        if(!this.playCtx||this.playCtx.state==='closed')this.playCtx=new(window.AudioContext||window.webkitAudioContext)({sampleRate:rate});
        const buf=this.playCtx.createBuffer(1,f32.length,rate);buf.getChannelData(0).set(f32);
        const src=this.playCtx.createBufferSource();src.buffer=buf;src.connect(this.playCtx.destination);
        src.onended=()=>this._playNext();src.start();
      } catch(e){console.error('Play err:',e);this._playNext();}
    },
    b64(buf) { const b=new Uint8Array(buf);let s='';for(let i=0;i<b.length;i++)s+=String.fromCharCode(b[i]);return btoa(s); }
  },

  // ==================== WRITING ====================
  writing: {
    gen() {
      const ws=A.filtered();if(!ws.length){A.toast('Không có từ','warning');return;}
      const n=parseInt(document.getElementById('wrLines').value)||10;
      const trace=document.getElementById('wrTrace').checked,roman=document.getElementById('wrRoman').checked,meaning=document.getElementById('wrMeaning').checked;
      const sel=[];for(let i=0;i<n;i++)sel.push(ws[Math.floor(Math.random()*ws.length)]);
      document.getElementById('wrPreview').innerHTML=sel.map(w=>`<div class="wr-line">
        ${trace?`<div class="kr-w">${w.front}</div>`:''}
        <div class="guide">${roman?`<div class="roman">${w.roman||''}</div>`:''}${meaning?`<div class="meaning">${w.back}</div>`:''}</div>
        <div class="practice">${trace?w.front:''}</div></div>`).join('');
    },
    print() { window.print(); }
  },

  // ==================== STATISTICS ====================
  stats: {
    render() {
      const ws=A.s.words,learned=ws.filter(w=>w.learned).length,hard=ws.filter(w=>w.hard).length;
      const tc=ws.reduce((s,w)=>s+(w.correctCount||0),0),tw=ws.reduce((s,w)=>s+(w.wrongCount||0),0);
      const acc=tc+tw>0?Math.round(tc/(tc+tw)*100):0;
      document.getElementById('statsGrid').innerHTML=`
        <div class="st-card blue"><div class="st-icon">📚</div><div class="st-val">${ws.length}</div><div class="st-lbl">Tổng từ</div></div>
        <div class="st-card green"><div class="st-icon">🧠</div><div class="st-val">${learned}</div><div class="st-lbl">Đã thuộc</div></div>
        <div class="st-card yellow"><div class="st-icon">🎯</div><div class="st-val">${acc}%</div><div class="st-lbl">Chính xác</div></div>
        <div class="st-card red"><div class="st-icon">⚠️</div><div class="st-val">${hard}</div><div class="st-lbl">Từ khó</div></div>
        <div class="st-card purple"><div class="st-icon">🔥</div><div class="st-val">${A.s.streak}</div><div class="st-lbl">Streak</div></div>`;
      const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=d.toISOString().slice(0,10);days.push({l:d.toLocaleDateString('vi',{weekday:'short'}),v:A.s.daily[k]||0});}
      const mx=Math.max(...days.map(d=>d.v),1);
      document.getElementById('actChart').innerHTML=days.map(d=>`<div class="b" style="height:${Math.max(d.v/mx*100,4)}%" data-v="${d.v}"></div>`).join('');
      const cal=document.getElementById('streakCal');let html='';
      for(let i=27;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=d.toISOString().slice(0,10);const active=A.s.daily[k]>0;const today=i===0;html+=`<div class="sc-day${active?' active':''}${today?' today':''}" title="${k}">${d.getDate()}</div>`;}
      cal.innerHTML=html;
      const lv={beginner:0,intermediate:0,advanced:0};ws.forEach(w=>{if(lv[w.level]!==undefined)lv[w.level]++;});
      const ml=Math.max(...Object.values(lv),1);const cl={beginner:'var(--primary)',intermediate:'var(--warn)',advanced:'var(--error)'};
      document.getElementById('lvlChart').innerHTML=Object.entries(lv).map(([k,v])=>`<div style="flex:1;text-align:center"><div class="b" style="height:${Math.max(v/ml*100,4)}%;background:${cl[k]}" data-v="${v}"></div><div style="font-size:.6rem;margin-top:4px;color:var(--text3)">${k==='beginner'?'Sơ cấp':k==='intermediate'?'Trung cấp':'Cao cấp'}</div></div>`).join('');
    }
  },

  // ==================== SETTINGS ====================
  settingsUI() {
    const s=this.s.settings;
    document.getElementById('sSpeed').value=s.ttsSpeed;document.getElementById('sSession').value=s.sessionSize;
    document.getElementById('sApiKey').value=s.apiKey;document.getElementById('sChatModel').value=s.chatModel;
    document.getElementById('sVoiceModel').value=s.voiceModel;
    this.setToggle('tAutoTTS',s.autoTTS);this.setToggle('tPriorHard',s.priorHard);this.setToggle('tDark',s.theme==='dark');
  },
  settings: {
    save() {
      const s=A.s.settings;s.ttsSpeed=document.getElementById('sSpeed').value;s.sessionSize=document.getElementById('sSession').value;
      s.apiKey=document.getElementById('sApiKey').value.trim();s.chatModel=document.getElementById('sChatModel').value;s.voiceModel=document.getElementById('sVoiceModel').value;
      A.save();A.renderChatModels();
    },
    toggleDark() { A.toggleTheme(); },
    toggle(k) { A.s.settings[k]=!A.s.settings[k];A.setToggle('t'+k.charAt(0).toUpperCase()+k.slice(1),A.s.settings[k]);A.save(); }
  },

  // ==================== IMPORT/EXPORT ====================
  data: {
    export() {
      const d={version:2,exportDate:new Date().toISOString(),words:A.s.words,streak:A.s.streak,lastStudy:A.s.lastStudy,daily:A.s.daily,settings:A.s.settings};
      const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});
      const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=`korean-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(u);A.toast('Đã xuất file!','success');
    },
    import(e) {
      const f=e.target.files[0];if(!f)return;
      const r=new FileReader();r.onload=ev=>{
        try {
          const d=JSON.parse(ev.target.result);if(!d.words||!Array.isArray(d.words))throw new Error('File không hợp lệ');
          let ok=0,skip=0;
          d.words.forEach(w=>{if(!w.front||!w.back){skip++;return;}const ex=A.s.words.find(x=>x.front===w.front);if(ex)Object.assign(ex,normWord({}),ex,w);else A.s.words.push(normWord(w));ok++;});
          if(d.streak)A.s.streak=d.streak;if(d.daily)A.s.daily={...A.s.daily,...d.daily};if(d.settings)A.s.settings={...A.s.settings,...d.settings};
          A.save();A.renderDict();A.updateHeader();A.settingsUI();A.applyTheme();A.fc.init();A.stats.render();
          A.toast(`Đã import ${ok} từ${skip?`, bỏ qua ${skip}`:''}`,'success');
        } catch(err){A.toast(`Lỗi: ${err.message}`,'error');}
      };r.readAsText(f);e.target.value='';
    },
    reset() { if(!confirm('Xóa TẤT CẢ dữ liệu?'))return;if(!confirm('Xác nhận lần 2?'))return;localStorage.removeItem('krApp2');location.reload(); }
  },

  // ==================== HELPERS ====================
  updateHeader() { document.getElementById('hTotal').textContent=this.s.words.length;document.getElementById('hStreak').textContent=this.s.streak;this.checkStreak(); },
  toast(m,t='info') { const c=document.getElementById('toastBox'),el=document.createElement('div');el.className='toast '+t;el.textContent=m;c.appendChild(el);setTimeout(()=>el.remove(),3200); },
  esc(s) { const d=document.createElement('div');d.textContent=s;return d.innerHTML; },
  debounce(fn,ms) { let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms);}; },
  setToggle(id,on) { const el=document.getElementById(id);if(el)el.classList.toggle('on',on); },
  hotkey(e) {
    if(this.s.view==='flashcard'){
      if(e.key==='ArrowLeft'){e.preventDefault();this.fc.prev();}
      if(e.key==='ArrowRight'){e.preventDefault();this.fc.next();}
      if(e.key===' '){e.preventDefault();this.fc.flip();}
      if(e.key==='f')this.fc.toggleFav();
      if(e.key==='ArrowUp'){e.preventDefault();this.fc.markCorrect();}
      if(e.key==='ArrowDown'){e.preventDefault();this.fc.markWrong();}
    }
  }
};

// ==================== START ====================
document.addEventListener('DOMContentLoaded',()=>{
  A.init();
  document.getElementById('themeBtn').addEventListener('click',()=>A.toggleTheme());
});