class HostStore {
  constructor(expire_after) {
    this.expire_after = expire_after;
    this.sessions = {};
    // TODO: inactive session removal
  }

  newSession(session, cookie) {
    this.sessions[session] = { [cookie]: Date.now() + this.expire_after };
  }

  bump(session, cookie) {
    if (this.sessions[session] && this.sessions[session][cookie]) {
      this.sessions[session][cookie] = Date.now() + this.expire_after;
    }
  }

  isHost(session, cookie) {
    return Boolean(this.sessions[session] && this.sessions[session][cookie]);
  }

  handoff(session, oldCookie, newCookie) {
    this.sessions[session][newCookie] = this.sessions[session][oldCookie];
    delete this.sessions[session][oldCookie];
  }

  removeInactive() {
    const now = Date.now();
    Object.keys(this.sessions).forEach((item) => {
      Object.keys(item).forEach((host) => {
        if (now > item[host]) {
          delete item[host];
        }
      });
      if (!Object.keys(item).length) {
        delete this.sessions[item];
      }
    });
  }

  isActive(session) {
    return Boolean(this.sessions[session]);
  }
  remove(cookie) {
    delete this.sessions[cookie];
  }
}

module.exports = HostStore;
