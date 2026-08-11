'use strict';

const C = {
  progressBar(opts) {
    const { value, max, color, label, showPercent, size } =
      Object.assign({ max: 100, color: 'accent', showPercent: true, size: 'medium' }, opts);
    const pct = Math.min(Math.round((value / max) * 100), 100);
    return (
      '<div class="progress-bar-container ' + size + '">' +
        (label
          ? '<div class="progress-label"><span>' + label + '</span>' +
            (showPercent ? '<span>' + pct + '%</span>' : '') + '</div>'
          : '') +
        '<div class="progress-bar-track">' +
          '<div class="progress-bar-fill color-' + color + '" style="width:' + pct + '%"></div>' +
        '</div>' +
      '</div>'
    );
  },

  levelBadge(level) {
    return '<span class="level-badge" style="background:' + (CEFR_COLORS[level] || '#6b7280') + '">' + level + '</span>';
  },

  xpIndicator(xp) {
    return '<span class="xp-indicator"><span class="xp-icon">⚡</span>' + (xp || 0).toLocaleString() + ' XP</span>';
  },

  streakDisplay(streak) {
    return '<span class="streak-display"><span class="streak-icon">🔥</span>' + (streak || 0) + ' day' + ((streak || 0) !== 1 ? 's' : '') + '</span>';
  },

  avatar(name, size, url) {
    size = size || 'medium';
    const initial = (name || 'G').charAt(0).toUpperCase();
    if (url) return '<div class="avatar avatar-' + size + '"><img src="' + url + '" alt="' + name + '"></div>';
    return '<div class="avatar avatar-' + size + '"><span>' + initial + '</span></div>';
  },

  statCard(opts) {
    const { icon, label, value, color } = Object.assign({ color: 'var(--accent)' }, opts);
    return (
      '<div class="stat-card animate-in">' +
        '<div class="stat-icon" style="color:' + color + '">' + icon + '</div>' +
        '<div class="stat-info">' +
          '<div class="stat-value">' + value + '</div>' +
          '<div class="stat-label">' + label + '</div>' +
        '</div>' +
      '</div>'
    );
  },

  sectionHeader(title, actionHtml) {
    return (
      '<div class="section-header">' +
        '<h2 class="section-title">' + title + '</h2>' +
        (actionHtml ? '<div class="section-action">' + actionHtml + '</div>' : '') +
      '</div>'
    );
  },

  emptyState(opts) {
    const { icon, title, message, action } = opts;
    return (
      '<div class="empty-state">' +
        '<div class="empty-icon">' + icon + '</div>' +
        '<h3 class="empty-title">' + title + '</h3>' +
        '<p class="empty-message">' + message + '</p>' +
        (action ? '<div class="empty-action">' + action + '</div>' : '') +
      '</div>'
    );
  },

  loading(msg) {
    msg = msg || 'Đang tải...';
    return (
      '<div class="loading-container">' +
        '<div class="loading-spinner"></div>' +
        '<p class="loading-text">' + msg + '</p>' +
      '</div>'
    );
  },

  button(opts) {
    const { text, type, icon, onClick, className, disabled } =
      Object.assign({ type: 'primary', className: '' }, opts);
    return (
      '<button class="btn btn-' + type + ' ' + className + '"' +
      (onClick ? ' onclick="' + onClick + '"' : '') +
      (disabled ? ' disabled' : '') + '>' +
        (icon ? '<span class="btn-icon">' + icon + '</span>' : '') +
        '<span>' + text + '</span>' +
      '</button>'
    );
  },

  input(opts) {
    const { type, name, label, placeholder, value, required, error } =
      Object.assign({ type: 'text', placeholder: '', value: '', required: false }, opts);
    return (
      '<div class="form-group' + (error ? ' has-error' : '') + '">' +
        (label ? '<label class="form-label" for="' + name + '">' + label + '</label>' : '') +
        '<input class="form-input" type="' + type + '" id="' + name + '" name="' + name + '"' +
        ' placeholder="' + placeholder + '" value="' + value + '"' +
        (required ? ' required' : '') + '>' +
        (error ? '<span class="form-error">' + error + '</span>' : '') +
      '</div>'
    );
  },

  select(opts) {
    const { name, label, options, value, required } = Object.assign({ required: false }, opts);
    const optsHtml = options.map(function(o) {
      return '<option value="' + o.value + '"' + (o.value === value ? ' selected' : '') + '>' + o.label + '</option>';
    }).join('');
    return (
      '<div class="form-group">' +
        (label ? '<label class="form-label" for="' + name + '">' + label + '</label>' : '') +
        '<select class="form-select" id="' + name + '" name="' + name + '"' +
        (required ? ' required' : '') + '>' + optsHtml + '</select>' +
      '</div>'
    );
  },

  navItem(item) {
    return (
      '<a class="nav-link" data-route="' + item.route + '" onclick="Router.navigate(\'' + item.route + '\')" tabindex="0">' +
        '<span class="nav-icon">' + item.icon + '</span>' +
        '<span class="nav-label">' + item.label + '</span>' +
      '</a>'
    );
  },

  getGreeting() {
    const h = new Date().getHours();
    if (h < 5) return 'Chào buổi đêm';
    if (h < 12) return 'Chào buổi sáng';
    if (h < 17) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  },

  getCefrDesc(level) {
    return CEFR_DESCRIPTIONS[level] || '';
  },

  toggleSwitch(id, active) {
    return '<div class="toggle' + (active ? ' active' : '') + '" id="' + id + '" role="switch" aria-checked="' + active + '" tabindex="0"></div>';
  }
};