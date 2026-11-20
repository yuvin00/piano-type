(function (PT) {
  'use strict';
  PT.layout.PageIntro = function () {
    const el = PT.utils.element;
    return el('div', { className: 'intro' }, [
      el('p', { className: 'eyebrow', text: 'WORDS BECOME MUSIC' }),
      el('h1', {}, [document.createTextNode('당신의 문장이,'), el('br'), document.createTextNode('하나의 선율이 되는 순간.')]),
      el('p', { text: '떠오르는 생각을 적어보세요. 손끝을 따라 음악이 흐릅니다.' })
    ]);
  };
})(window.PianoType);
