(function (PT) {
  'use strict';
  PT.services.storage = {
    read(key, fallback = '') {
      try { return { value: localStorage.getItem(key) || fallback, available: true }; }
      catch { return { value: fallback, available: false }; }
    },
    write(key, value) {
      try { localStorage.setItem(key, value); return true; }
      catch { return false; }
    }
  };
})(window.PianoType);
