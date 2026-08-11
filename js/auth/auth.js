'use strict';

const Auth = {
  isLoggedIn() {
    return State.get('user') !== null && State.get('user') !== undefined;
  },

  getUser() {
    return State.get('user');
  },

  login(email, password) {
    const users = JSON.parse(localStorage.getItem(APP.usersKey) || '{}');
    const user = users[email];
    if (!user) return { success: false, error: 'Email không tồn tại.' };
    if (user.passwordHash !== this._hash(password)) {
      return { success: false, error: 'Mật khẩu không đúng.' };
    }
    const safe = Object.assign({}, user);
    delete safe.passwordHash;
    State.set('user', safe);
    return { success: true, user: safe };
  },

  register(data) {
    var name = data.name, email = data.email, password = data.password, level = data.level;
    var users = JSON.parse(localStorage.getItem(APP.usersKey) || '{}');
    if (users[email]) return { success: false, error: 'Email đã được sử dụng.' };

    var userId = 'u_' + Date.now();
    var userData = {
      id: userId,
      name: name,
      email: email,
      avatar: null,
      cefrLevel: level || 'A1',
      targetLevel: (level === 'A1' || level === 'A2') ? 'B1' : 'C1',
      createdAt: new Date().toISOString(),
      isGuest: false
    };

    users[email] = Object.assign({}, userData, { passwordHash: this._hash(password) });
    localStorage.setItem(APP.usersKey, JSON.stringify(users));

    State.set('user', userData);
    return { success: true, user: userData };
  },

  guestLogin() {
    var guest = {
      id: 'guest_' + Date.now(),
      name: 'Guest',
      email: null,
      avatar: null,
      cefrLevel: 'A1',
      targetLevel: 'B1',
      createdAt: new Date().toISOString(),
      isGuest: true
    };
    State.set('user', guest);
    return { success: true, user: guest };
  },

  logout() {
    Storage.save(State.get());
    State.set('user', null);
    Router.navigate('/login');
  },

  updateProfile(updates) {
    var user = State.get('user');
    if (!user) return { success: false };
    var updated = Object.assign({}, user, updates);
    State.set('user', updated);
    if (!user.isGuest && user.email) {
      var users = JSON.parse(localStorage.getItem(APP.usersKey) || '{}');
      if (users[user.email]) {
        Object.assign(users[user.email], updates);
        localStorage.setItem(APP.usersKey, JSON.stringify(users));
      }
    }
    return { success: true, user: updated };
  },

  _hash(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(36);
  }
};
