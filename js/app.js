'use strict';

const App = {
  init() {
    State.init();
    Toast.init();
    Modal.init();

    this._registerRoutes();

    Router.beforeEach(function(route) {
      var pub = ['/login', '/register'];
      if (!Auth.isLoggedIn() && pub.indexOf(route) === -1) return '/login';
      if (Auth.isLoggedIn() && pub.indexOf(route) !== -1) return '/home';
      return null;
    });

    Router.init();
    this._renderNav();
    this._applyTheme();
    this._addThemeToggle();
  },

  /* ── ROUTES ─────────────────────────── */

  _registerRoutes() {
    Router.register('/login',    (app) => this._pageLogin(app));
    Router.register('/register', (app) => this._pageRegister(app));
    Router.register('/home',     (app) => this._pageDashboard(app));
    Router.register('/vocabulary', (app) => this._pageVocabulary(app));
    Router.register('/grammar',  (app) => this._pageGrammar(app));
    Router.register('/reading',  (app) => this._pageReading(app));
    Router.register('/listening', (app) => this._pageListening(app));
    Router.register('/speaking', (app) => this._pageSpeaking(app));
    Router.register('/writing',  (app) => this._pageWriting(app));
    Router.register('/practice', (app) => this._pagePractice(app));
    Router.register('/flashcards', (app) => this._pageFlashcards(app));
    Router.register('/ai-tutor', (app) => this._pageAITutor(app));
    Router.register('/progress', (app) => this._pageProgress(app));
    Router.register('/profile',  (app) => this._pageProfile(app));
    Router.register('/settings', (app) => this._pageSettings(app));
  },

  /* ── NAV ─────────────────────────────── */

  _renderNav() {
    var sb = document.getElementById('sidebar');
    var mn = document.getElementById('mobile-nav');

    sb.innerHTML =
      '<div class="sidebar-header">' +
        '<div class="sidebar-logo"><span class="logo-icon">🌐</span><span class="logo-text">EnglishFlow</span></div>' +
      '</div>' +
      '<div class="sidebar-nav">' +
        NAV_ITEMS.map(function(i) { return C.navItem(i); }).join('') +
      '</div>' +
      '<div class="sidebar-footer" id="sidebar-user"></div>';

    mn.innerHTML = MOBILE_NAV_ITEMS.map(function(i) {
      return '<a class="mobile-nav-link" data-route="' + i.route + '" onclick="Router.navigate(\'' + i.route + '\')">' +
        '<span class="mobile-nav-icon">' + i.icon + '</span>' +
        '<span class="mobile-nav-label">' + i.label + '</span></a>';
    }).join('');

    this._updateNavUser();
    this._updateNavVisibility();
  },

  _updateNavUser() {
    var el = document.getElementById('sidebar-user');
    if (!el) return;
    var user = Auth.getUser();
    if (user) {
      el.innerHTML =
        '<div class="sidebar-user" onclick="Router.navigate(\'/profile\')">' +
          C.avatar(user.name, 'small') +
          '<div class="sidebar-user-info">' +
            '<span class="sidebar-user-name">' + user.name + '</span>' +
            C.levelBadge(user.cefrLevel) +
          '</div>' +
        '</div>';
    } else {
      el.innerHTML = '';
    }
  },

  _updateNavVisibility() {
    var sb = document.getElementById('sidebar');
    var mn = document.getElementById('mobile-nav');
    var in_ = Auth.isLoggedIn();
    if (sb) sb.style.display = in_ ? '' : 'none';
    if (mn) mn.style.display = in_ ? '' : 'none';
    document.getElementById('app').classList.toggle('full-width', !in_);
  },

  /* ── THEME ───────────────────────────── */

  _applyTheme() {
    var theme = State.get('settings.theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  },

  _addThemeToggle() {
    var existing = document.querySelector('.theme-toggle');
    if (existing) existing.remove();
    var btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Toggle theme');
    btn.textContent = (State.get('settings.theme') || 'dark') === 'dark' ? '☀️' : '🌙';
    btn.onclick = function() {
      var current = State.get('settings.theme') || 'dark';
      var next = current === 'dark' ? 'light' : 'dark';
      State.set('settings.theme', next);
      document.documentElement.setAttribute('data-theme', next);
      btn.textContent = next === 'dark' ? '☀️' : '🌙';
    };
    document.body.appendChild(btn);
  },

  /* ── LOGIN PAGE ──────────────────────── */

  _pageLogin(app) {
    app.innerHTML =
      '<div class="auth-page">' +
        '<div class="auth-container">' +
          '<div class="auth-header">' +
            '<span class="auth-logo">🌐</span>' +
            '<h1>Chào mừng trở lại 👋</h1>' +
            '<p>Đăng nhập để tiếp tục học tập</p>' +
          '</div>' +
          '<form id="login-form" class="auth-form">' +
            C.input({ type: 'email', name: 'email', label: 'Email', placeholder: 'your@email.com', required: true }) +
            C.input({ type: 'password', name: 'password', label: 'Mật khẩu', placeholder: 'Nhập mật khẩu', required: true }) +
            '<button type="submit" class="btn btn-primary btn-full btn-lg">ĐĂNG NHẬP</button>' +
            '<div class="auth-divider"><span>hoặc</span></div>' +
            '<button type="button" class="btn btn-ghost btn-full" id="guest-btn">Tiếp tục không đăng nhập</button>' +
          '</form>' +
          '<div class="auth-footer"><p>Chưa có tài khoản? <a href="#/register">Tạo tài khoản</a></p></div>' +
        '</div>' +
      '</div>';

    document.getElementById('login-form').onsubmit = function(e) {
      e.preventDefault();
      var email = e.target.email.value.trim();
      var pwd = e.target.password.value;
      if (!email || !pwd) { Toast.error('Vui lòng nhập đầy đủ.'); return; }
      var r = Auth.login(email, pwd);
      if (r.success) {
        Toast.success('Đăng nhập thành công!');
        App._renderNav();
        Router.navigate('/home');
      } else {
        Toast.error(r.error);
      }
    };

    document.getElementById('guest-btn').onclick = function() {
      Auth.guestLogin();
      Toast.info('Đang dùng chế độ khách...');
      App._renderNav();
      Router.navigate('/home');
    };
  },

  /* ── REGISTER PAGE ───────────────────── */

  _pageRegister(app) {
    var levelOpts = CEFR_LEVELS.map(function(l) {
      return { value: l, label: l + ' — ' + (CEFR_DESCRIPTIONS[l] || '') };
    });

    app.innerHTML =
      '<div class="auth-page">' +
        '<div class="auth-container">' +
          '<div class="auth-header">' +
            '<span class="auth-logo">🌐</span>' +
            '<h1>Tạo tài khoản mới</h1>' +
            '<p>Bắt đầu hành trình học tiếng Anh của bạn</p>' +
          '</div>' +
          '<form id="register-form" class="auth-form">' +
            C.input({ type: 'text', name: 'name', label: 'Tên hiển thị', placeholder: 'Tên của bạn', required: true }) +
            C.input({ type: 'email', name: 'email', label: 'Email', placeholder: 'your@email.com', required: true }) +
            C.input({ type: 'password', name: 'password', label: 'Mật khẩu', placeholder: 'Tối thiểu 6 ký tự', required: true }) +
            C.input({ type: 'password', name: 'confirm', label: 'Xác nhận mật khẩu', placeholder: 'Nhập lại mật khẩu', required: true }) +
            C.select({ name: 'level', label: 'Trình độ hiện tại', options: levelOpts, value: 'A1', required: true }) +
            '<button type="submit" class="btn btn-primary btn-full btn-lg">TẠO TÀI KHOẢN</button>' +
          '</form>' +
          '<div class="auth-footer"><p>Đã có tài khoản? <a href="#/login">Đăng nhập</a></p></div>' +
        '</div>' +
      '</div>';

    document.getElementById('register-form').onsubmit = function(e) {
      e.preventDefault();
      var f = e.target;
      var name = f.name.value.trim();
      var email = f.email.value.trim();
      var pwd = f.password.value;
      var confirm = f.confirm.value;
      var level = f.level.value;

      if (!name || !email || !pwd) { Toast.error('Vui lòng nhập đầy đủ.'); return; }
      if (pwd.length < 6) { Toast.error('Mật khẩu tối thiểu 6 ký tự.'); return; }
      if (pwd !== confirm) { Toast.error('Mật khẩu xác nhận không khớp.'); return; }

      var r = Auth.register({ name: name, email: email, password: pwd, level: level });
      if (r.success) {
        Toast.success('Tạo tài khoản thành công! Chào ' + name + '!');
        App._renderNav();
        Router.navigate('/home');
      } else {
        Toast.error(r.error);
      }
    };
  },

  /* ── DASHBOARD ───────────────────────── */

  _pageDashboard(app) {
    var user = Auth.getUser();
    var prog = State.get('progress');
    var goal = prog.dailyGoal;
    var greeting = C.getGreeting();
    var dailyPct = State.getDailyGoalProgress();
    var lvlProg = State.getLevelProgress();
    var xpNext = State.getXPForNextLevel();

    app.innerHTML =
      '<div class="dashboard">' +
        /* Header */
        '<div class="dashboard-header">' +
          '<div class="dashboard-greeting">' +
            '<h1>' + greeting + ' 👋</h1>' +
            '<p>Sẵn sàng cải thiện tiếng Anh hôm nay?</p>' +
          '</div>' +
          '<div class="dashboard-header-right">' +
            '<div class="dashboard-streak">' + C.streakDisplay(prog.streak) + '</div>' +
            '<div class="dashboard-avatar" onclick="Router.navigate(\'/profile\')">' + C.avatar(user.name) + '</div>' +
          '</div>' +
        '</div>' +

        /* Stats */
        '<div class="stats-grid">' +
          C.statCard({ icon: '⚡', label: 'XP', value: prog.xp.toLocaleString(), color: 'var(--accent-warm)' }) +
          C.statCard({ icon: '🏆', label: 'Level', value: prog.level, color: 'var(--accent)' }) +
          C.statCard({ icon: '🎯', label: 'CEFR', value: user.cefrLevel, color: CEFR_COLORS[user.cefrLevel] }) +
          C.statCard({ icon: '🔥', label: 'Streak', value: prog.streak + 'd', color: 'var(--error)' }) +
        '</div>' +

        /* Level Progress */
        '<div class="card card-elevated animate-in">' +
          '<div class="card-content">' +
            '<div class="level-progress-header">' +
              '<span>Level ' + prog.level + '</span>' +
              '<span>Level ' + (prog.level + 1) + '</span>' +
            '</div>' +
            C.progressBar({ value: lvlProg, color: 'accent', showPercent: false, size: 'large' }) +
            '<div class="level-progress-detail">' +
              '<span>' + prog.xp + ' XP</span>' +
              '<span>' + (xpNext > 0 ? xpNext + ' XP để lên level' : 'Đã đạt tối đa') + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +

        /* Daily Goals */
        '<div class="card card-elevated animate-in">' +
          '<div class="card-header">' +
            '<h3>Mục tiêu hôm nay</h3>' +
            '<span class="daily-goal-percent" style="color:var(--accent);font-weight:700">' + dailyPct + '%</span>' +
          '</div>' +
          '<div class="daily-goals-list">' +
            this._dailyGoalRow('📚', goal.vocabulary) +
            this._dailyGoalRow('📖', goal.grammar) +
            this._dailyGoalRow('🎧', goal.listening) +
            this._dailyGoalRow('🗣️', goal.speaking) +
          '</div>' +
        '</div>' +

        /* Quick Actions */
        C.sectionHeader('Bắt đầu học', '') +
        '<div class="quick-actions-grid">' +
          this._actionCard('📚', 'Vocabulary', 'Học từ mới', '/vocabulary') +
          this._actionCard('🃏', 'Flashcards', 'Ôn tập', '/flashcards') +
          this._actionCard('📖', 'Grammar', 'Ngữ pháp', '/grammar') +
          this._actionCard('🎧', 'Listening', 'Luyện nghe', '/listening') +
          this._actionCard('📰', 'Reading', 'Luyện đọc', '/reading') +
          this._actionCard('🎮', 'Practice', 'Luyện tập', '/practice') +
          this._actionCard('🗣️', 'Speaking', 'Luyện nói', '/speaking') +
          this._actionCard('✍️', 'Writing', 'Luyện viết', '/writing') +
          this._actionCard('🤖', 'AI Tutor', 'Gia sư AI', '/ai-tutor') +
        '</div>' +

        /* Continue Learning placeholder */
        '<div class="animate-in" style="margin-top:var(--space-6)">' +
          C.emptyState({
            icon: '🚀',
            title: 'Bắt đầu hành trình!',
            message: 'Chọn một hoạt động phía trên để bắt đầu học tiếng Anh ngay hôm nay.',
            action: C.button({ text: 'Học Vocabulary', type: 'primary', onClick: "Router.navigate('/vocabulary')" })
          }) +
        '</div>' +
      '</div>';
  },

  _dailyGoalRow(icon, g) {
    var today = new Date().toISOString().split('T')[0];
    var done = g.date === today ? g.completed : 0;
    var complete = done >= g.target;
    return (
      '<div class="daily-goal-item' + (complete ? ' completed' : '') + '">' +
        '<span class="daily-goal-icon">' + icon + '</span>' +
        '<div class="daily-goal-info">' +
          '<div class="daily-goal-label">' + g.label + '</div>' +
          C.progressBar({ value: done, max: g.target, color: complete ? 'success' : 'accent', showPercent: false, size: 'small' }) +
        '</div>' +
        '<span class="daily-goal-count">' + done + '/' + g.target + ' ' + g.unit + '</span>' +
      '</div>'
    );
  },

  _actionCard(icon, label, sub, route) {
    return (
      '<div class="action-card" onclick="Router.navigate(\'' + route + '\')" tabindex="0">' +
        '<span class="action-icon">' + icon + '</span>' +
        '<span class="action-label">' + label + '</span>' +
        '<span class="action-sublabel">' + sub + '</span>' +
      '</div>'
    );
  },

  /* ── VOCABULARY PAGE ─────────────────── */

  _pageVocabulary(app) {
    var user = Auth.getUser();
    var level = user.cefrLevel;

    app.innerHTML =
      '<div class="page">' +
        '<div class="page-header">' +
          '<h1>📚 Vocabulary</h1>' +
          '<p>Học từ vựng theo cấp độ CEFR</p>' +
        '</div>' +
        '<div class="cefr-selector" id="vocab-cefr">' +
          CEFR_LEVELS.map(function(l) {
            return '<button class="cefr-tab' + (l === level ? ' active' : '') + '" data-level="' + l + '">' + l + '</button>';
          }).join('') +
        '</div>' +
        '<div id="vocab-content"></div>' +
      '</div>';

    document.getElementById('vocab-cefr').onclick = function(e) {
      var btn = e.target.closest('.cefr-tab');
      if (!btn) return;
      document.querySelectorAll('#vocab-cefr .cefr-tab').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      App._loadVocabLevel(btn.getAttribute('data-level'));
    };

    this._loadVocabLevel(level);
  },

  _loadVocabLevel(level) {
    var content = document.getElementById('vocab-content');
    if (!content) return;
    content.innerHTML = C.loading('Đang tải từ vựng ' + level + '...');

    /* Phase 2 sẽ load data thực từ file JSON.
       Hiện tại hiển thị placeholder có cấu trúc. */
    setTimeout(function() {
      content.innerHTML =
        '<div class="card card-elevated">' +
          C.emptyState({
            icon: '📚',
            title: 'Từ vựng ' + level,
            message: 'Module Vocabulary ' + level + ' với 100+ từ sẽ được nạp từ file data/' + level.toLowerCase() + '.json trong Phase 2.',
            action: C.button({ text: 'Học Flashcards', type: 'primary', onClick: "Router.navigate('/flashcards')" })
          }) +
        '</div>';
    }, 300);
  },

  /* ── GRAMMAR PAGE ────────────────────── */

  _pageGrammar(app) {
    app.innerHTML =
      '<div class="page">' +
        '<div class="page-header"><h1>📖 Grammar</h1><p>Học ngữ pháp theo cấp độ</p></div>' +
        '<div class="cefr-selector">' +
          CEFR_LEVELS.map(function(l) {
            return '<button class="cefr-tab' + (l === 'A1' ? ' active' : '') + '">' + l + '</button>';
          }).join('') +
        '</div>' +
        '<div class="card card-elevated">' +
          C.emptyState({
            icon: '📖',
            title: 'Grammar Roadmap',
            message: 'Module Grammar với 65+ bài học từ A1 đến C1 sẽ sẵn sàng trong Phase 3.',
            action: C.button({ text: 'Quay về', type: 'ghost', onClick: "Router.navigate('/home')" })
          }) +
        '</div>' +
      '</div>';
  },

  /* ── READING PAGE ────────────────────── */

  _pageReading(app) {
    app.innerHTML =
      '<div class="page">' +
        '<div class="page-header"><h1>📰 Reading</h1><p>Thư viện bài đọc theo cấp độ</p></div>' +
        '<div class="card card-elevated">' +
          C.emptyState({
            icon: '📰',
            title: 'Reading Library',
            message: 'Thư viện Reading với 25+ bài đọc sẽ sẵn sàng trong Phase 3.',
            action: C.button({ text: 'Quay về', type: 'ghost', onClick: "Router.navigate('/home')" })
          }) +
        '</div>' +
      '</div>';
  },

  /* ── LISTENING PAGE ──────────────────── */

  _pageListening(app) {
    app.innerHTML =
      '<div class="page">' +
        '<div class="page-header"><h1>🎧 Listening</h1><p>Luyện nghe theo cấp độ</p></div>' +
        '<div class="card card-elevated">' +
          C.emptyState({
            icon: '🎧',
            title: 'Listening Library',
            message: 'Module Listening với 25+ bài nghe sẽ sẵn sàng trong Phase 3.',
            action: C.button({ text: 'Quay về', type: 'ghost', onClick: "Router.navigate('/home')" })
          }) +
        '</div>' +
      '</div>';
  },

  /* ── SPEAKING PAGE ───────────────────── */

  _pageSpeaking(app) {
    app.innerHTML =
      '<div class="page">' +
        '<div class="page-header"><h1>🗣️ Speaking</h1><p>Luyện nói với AI</p></div>' +
        '<div class="card card-elevated">' +
          C.emptyState({
            icon: '🗣️',
            title: 'AI Speaking Tutor',
            message: 'Module Speaking với 10 scenarios sẽ sẵn sàng trong Phase 4.',
            action: C.button({ text: 'Thử AI Tutor', type: 'primary', onClick: "Router.navigate('/ai-tutor')" })
          }) +
        '</div>' +
      '</div>';
  },

  /* ── WRITING PAGE ────────────────────── */

  _pageWriting(app) {
    app.innerHTML =
      '<div class="page">' +
        '<div class="page-header"><h1>✍️ Writing</h1><p>Luyện viết với AI chấm bài</p></div>' +
        '<div class="card card-elevated">' +
          C.emptyState({
            icon: '✍️',
            title: 'AI Writing Coach',
            message: 'Module Writing sẽ sẵn sàng trong Phase 4.',
            action: C.button({ text: 'Quay về', type: 'ghost', onClick: "Router.navigate('/home')" })
          }) +
        '</div>' +
      '</div>';
  },

  /* ── PRACTICE PAGE ───────────────────── */

  _pagePractice(app) {
    var games = [
      { icon: '🎯', name: 'Multiple Choice', desc: 'Chọn đáp án đúng', route: '/practice' },
      { icon: '🔗', name: 'Word Matching', desc: 'Ghép từ với nghĩa', route: '/practice' },
      { icon: '✏️', name: 'Spelling', desc: 'Đánh vần từ', route: '/practice' },
      { icon: '🧩', name: 'Sentence Builder', desc: 'Xây dựng câu', route: '/practice' },
      { icon: '🎧', name: 'Listening Quiz', desc: 'Câu hỏi nghe', route: '/practice' },
      { icon: '📝', name: 'Fill in Blank', desc: 'Điền vào chỗ trống', route: '/practice' },
      { icon: '🔀', name: 'Word Scramble', desc: 'Sắp xếp chữ cái', route: '/practice' },
      { icon: '⚡', name: 'Speed Challenge', desc: 'Thách thức tốc độ', route: '/practice' }
    ];

    app.innerHTML =
      '<div class="page">' +
        '<div class="page-header"><h1>🎮 Practice</h1><p>Luyện tập qua trò chơi</p></div>' +
        '<div class="quick-actions-grid">' +
          games.map(function(g) {
            return App._actionCard(g.icon, g.name, g.desc, g.route);
          }).join('') +
        '</div>' +
        '<div class="card card-elevated" style="margin-top:var(--space-6)">' +
          C.emptyState({
            icon: '🎮',
            title: 'Games sắp ra mắt',
            message: '8 trò chơi luyện tập sẽ sẵn sàng trong Phase 4. Mỗi game sẽ có XP, score và accuracy tracking.',
          }) +
        '</div>' +
      '</div>';
  },

  /* ── FLASHCARDS PAGE ─────────────────── */

  _pageFlashcards(app) {
    app.innerHTML =
      '<div class="page">' +
        '<div class="page-header"><h1>🃏 Flashcards</h1><p>Ôn tập từ vựng với spaced repetition</p></div>' +
        '<div class="card card-elevated">' +
          C.emptyState({
            icon: '🃏',
            title: 'Flashcard System',
            message: 'Hệ thống flashcard 4 chế độ (EN→VI, VI→EN, Listen→Answer, Fill in blank) sẽ sẵn sàng trong Phase 2.',
            action: C.button({ text: 'Học Vocabulary', type: 'primary', onClick: "Router.navigate('/vocabulary')" })
          }) +
        '</div>' +
      '</div>';
  },

  /* ── AI TUTOR PAGE ───────────────────── */

  _pageAITutor(app) {
    var modes = [
      { icon: '💬', name: 'General Conversation', desc: 'Trò chuyện tổng quát' },
      { icon: '📚', name: 'Vocabulary Tutor', desc: 'Học từ vựng với AI' },
      { icon: '📖', name: 'Grammar Tutor', desc: 'Học ngữ pháp với AI' },
      { icon: '🗣️', name: 'Speaking Practice', desc: 'Luyện nói với AI' },
      { icon: '✍️', name: 'Writing Coach', desc: 'AI chấm bài viết' },
      { icon: '🎓', name: 'Exam Practice', desc: 'Luyện thi với AI' }
    ];

    app.innerHTML =
      '<div class="page">' +
        '<div class="page-header"><h1>🤖 AI English Tutor</h1><p>Gia sư AI cá nhân hóa theo trình độ</p></div>' +
        '<div class="quick-actions-grid">' +
          modes.map(function(m) {
            return (
              '<div class="action-card" tabindex="0">' +
                '<span class="action-icon">' + m.icon + '</span>' +
                '<span class="action-label">' + m.name + '</span>' +
                '<span class="action-sublabel">' + m.desc + '</span>' +
              '</div>'
            );
          }).join('') +
        '</div>' +
        '<div class="card card-elevated" style="margin-top:var(--space-6)">' +
          C.emptyState({
            icon: '🤖',
            title: 'AI Tutor sắp ra mắt',
            message: 'Module AI Tutor sẽ yêu cầu API key (OpenAI / equivalent). Sẽ sẵn sàng trong Phase 5. AI sẽ tự điều chỉnh độ khó theo CEFR level của bạn.',
          }) +
        '</div>' +
      '</div>';
  },

  /* ── PROGRESS PAGE ───────────────────── */

  _pageProgress(app) {
    var prog = State.get('progress');
    var user = Auth.getUser();

    app.innerHTML =
      '<div class="page">' +
        '<div class="page-header"><h1>📊 Progress</h1><p>Theo dõi quá trình học tập</p></div>' +

        /* CEFR Progress */
        '<div class="card card-elevated">' +
          '<div class="card-header"><h3>English Progress — CEFR</h3></div>' +
          CEFR_LEVELS.map(function(l) {
            var active = CEFR_LEVELS.indexOf(l) <= CEFR_LEVELS.indexOf(user.cefrLevel);
            var pct = active ? (l === user.cefrLevel ? 50 : 100) : 0;
            return C.progressBar({ value: pct, label: l + ' — ' + (CEFR_DESCRIPTIONS[l] || ''), color: 'accent', size: 'medium' });
          }).join('') +
        '</div>' +

        /* Stats Overview */
        '<div class="card card-elevated" style="margin-top:var(--space-4)">' +
          '<div class="card-header"><h3>Tổng quan</h3></div>' +
          '<div class="stats-grid">' +
            C.statCard({ icon: '📚', label: 'Words learned', value: Object.keys(State.get('vocabulary.learned') || {}).length, color: 'var(--accent)' }) +
            C.statCard({ icon: '📖', label: 'Grammar', value: (State.get('grammar.completed') || []).length, color: '#8b5cf6' }) +
            C.statCard({ icon: '⚡', label: 'Total XP', value: prog.xp.toLocaleString(), color: 'var(--accent-warm)' }) +
            C.statCard({ icon: '🏆', label: 'Best Streak', value: prog.longestStreak + 'd', color: 'var(--error)' }) +
          '</div>' +
        '</div>' +

        /* Achievements */
        '<div class="card card-elevated" style="margin-top:var(--space-4)">' +
          '<div class="card-header"><h3>Thành tích</h3></div>' +
          '<div class="quick-actions-grid">' +
            ACHIEVEMENTS_DEF.map(function(a) {
              var unlocked = (State.get('achievements') || []).indexOf(a.id) !== -1;
              return (
                '<div class="action-card' + (unlocked ? '' : '" style="opacity:0.4') + '" tabindex="0">' +
                  '<span class="action-icon">' + a.icon + '</span>' +
                  '<span class="action-label">' + a.title + '</span>' +
                  '<span class="action-sublabel">' + a.desc + '</span>' +
                '</div>'
              );
            }).join('') +
          '</div>' +
        '</div>' +
      '</div>';
  },

  /* ── PROFILE PAGE ────────────────────── */

  _pageProfile(app) {
    var user = Auth.getUser();
    var prog = State.get('progress');

    app.innerHTML =
      '<div class="page profile-page">' +
        '<div class="page-header"><h1>👤 Profile</h1></div>' +

        '<div class="card card-elevated">' +
          '<div class="profile-header-card">' +
            C.avatar(user.name, 'large') +
            '<div class="profile-info">' +
              '<h2>' + user.name + '</h2>' +
              '<p>' + (user.email || 'Guest') + '</p>' +
              '<div style="display:flex;gap:8px;align-items:center;margin-top:8px">' +
                C.levelBadge(user.cefrLevel) +
                C.xpIndicator(prog.xp) +
                C.streakDisplay(prog.streak) +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="card card-elevated" style="margin-top:var(--space-4)">' +
          '<div class="profile-section">' +
            '<h3>Thông tin cá nhân</h3>' +
            '<form id="profile-form">' +
              C.input({ type: 'text', name: 'name', label: 'Tên hiển thị', value: user.name }) +
              C.select({
                name: 'level',
                label: 'Trình độ hiện tại',
                options: CEFR_LEVELS.map(function(l) { return { value: l, label: l + ' — ' + (CEFR_DESCRIPTIONS[l] || '') }; }),
                value: user.cefrLevel
              }) +
              '<button type="submit" class="btn btn-primary">Lưu thay đổi</button>' +
            '</form>' +
          '</div>' +
        '</div>' +

        '<div class="card card-elevated" style="margin-top:var(--space-4)">' +
          '<div class="profile-section">' +
            '<h3>Dữ liệu</h3>' +
            '<div style="display:flex;gap:var(--space-3);flex-wrap:wrap">' +
              C.button({ text: 'Export Backup', type: 'ghost', icon: '📤', onClick: 'App._exportData()' }) +
              C.button({ text: 'Import Backup', type: 'ghost', icon: '📥', onClick: 'App._importData()' }) +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div style="margin-top:var(--space-6);text-align:center">' +
          '<button class="btn btn-danger btn-full" onclick="App._confirmLogout()">Đăng xuất</button>' +
        '</div>' +
      '</div>';

    document.getElementById('profile-form').onsubmit = function(e) {
      e.preventDefault();
      var name = e.target.name.value.trim();
      var level = e.target.level.value;
      if (!name) { Toast.error('Tên không được trống.'); return; }
      Auth.updateProfile({ name: name, cefrLevel: level });
      App._updateNavUser();
      Toast.success('Đã cập nhật profile!');
    };
  },

  /* ── SETTINGS PAGE ───────────────────── */

  _pageSettings(app) {
    var s = State.get('settings');

    app.innerHTML =
      '<div class="page" style="max-width:640px">' +
        '<div class="page-header"><h1>⚙️ Settings</h1></div>' +
        '<div class="card card-elevated">' +
          '<div class="settings-item">' +
            '<div class="settings-item-info"><h4>Giao diện tối</h4><p>Chế độ dark/light mode</p></div>' +
            '<div id="theme-toggle-setting">' + C.toggleSwitch('setting-theme', s.theme === 'dark') + '</div>' +
          '</div>' +
          '<div class="settings-item">' +
            '<div class="settings-item-info"><h4>Âm thanh</h4><p>Bật/tắt âm thanh trong bài học</p></div>' +
            '<div id="sound-toggle-setting">' + C.toggleSwitch('setting-sound', s.soundEnabled) + '</div>' +
          '</div>' +
          '<div class="settings-item">' +
            '<div class="settings-item-info"><h4>Phiên âm</h4><p>Hiển thị phiên âm IPA</p></div>' +
            '<div id="ipa-toggle-setting">' + C.toggleSwitch('setting-ipa', s.showRomanization) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="card card-elevated" style="margin-top:var(--space-4)">' +
          '<div class="settings-item">' +
            '<div class="settings-item-info"><h4>Phiên bản</h4><p>' + APP.name + ' v' + APP.version + '</p></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.getElementById('setting-theme').onclick = function() {
      var current = State.get('settings.theme');
      var next = current === 'dark' ? 'light' : 'dark';
      State.set('settings.theme', next);
      document.documentElement.setAttribute('data-theme', next);
      this.classList.toggle('active', next === 'dark');
      var toggleBtn = document.querySelector('.theme-toggle');
      if (toggleBtn) toggleBtn.textContent = next === 'dark' ? '☀️' : '🌙';
    };

    document.getElementById('setting-sound').onclick = function() {
      var v = !State.get('settings.soundEnabled');
      State.set('settings.soundEnabled', v);
      this.classList.toggle('active', v);
      Toast.info(v ? 'Đã bật âm thanh' : 'Đã tắt âm thanh');
    };

    document.getElementById('setting-ipa').onclick = function() {
      var v = !State.get('settings.showRomanization');
      State.set('settings.showRomanization', v);
      this.classList.toggle('active', v);
    };
  },

  /* ── HELPERS ─────────────────────────── */

  _confirmLogout() {
    Modal.confirm({
      title: 'Đăng xuất',
      message: 'Bạn có chắc muốn đăng xuất? Dữ liệu đã lưu sẽ không mất.',
      confirmText: 'Đăng xuất',
      cancelText: 'Hủy',
      onConfirm: function() { Auth.logout(); }
    });
  },

  _exportData() {
    var json = Storage.exportAll();
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'englishflow-backup-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
    Toast.success('Đã xuất dữ liệu thành công!');
  },

  _importData() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        Modal.confirm({
          title: 'Nhập dữ liệu',
          message: 'Import sẽ merge dữ liệu với dữ liệu hiện tại. Tiếp tục?',
          confirmText: 'Import',
          onConfirm: function() {
            var result = Storage.importAll(ev.target.result);
            if (result.success) {
              State.init();
              Toast.success('Import thành công! Đang tải lại...');
              setTimeout(function() { location.reload(); }, 1000);
            } else {
              Toast.error('Import thất bại: ' + result.error);
            }
          }
        });
      };
      reader.readAsText(file);
    };
    input.click();
  }
};

/* ── BOOT ─────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  App.init();
});