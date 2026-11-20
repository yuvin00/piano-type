(function (PT) {
  'use strict';
  PT.layout.AppHeader = function () {
    const el = PT.utils.element;
    return el('header', {}, [
      el('a', { className: 'brand', text: '♩ Piano Type', attributes: { href: './index.html' } }),
      el('span', { text: '작은 타이핑 음악실' })
    ]);
  };
})(window.PianoType);
