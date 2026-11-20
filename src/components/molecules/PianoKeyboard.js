(function (PT) {
  'use strict';
  PT.molecules.PianoKeyboard = function ({ onPress }) {
    const element = PT.utils.element('div', { id: 'piano', className: 'piano', attributes: { 'aria-label': '마우스로도 연주할 수 있는 피아노' } });
    const keys = new Map();
    const timers = new Map();
    let whiteIndex = 0;
    for (let midi = 21; midi <= 108; midi++) {
      const key = PT.atoms.PianoKey({ midi, whiteIndex, onPress });
      if (!PT.utils.notes.isBlack(midi)) whiteIndex++;
      keys.set(midi, key);
      element.append(key);
    }
    function highlight(midi) {
      const key = keys.get(midi);
      if (!key) return;
      clearTimeout(timers.get(midi));
      key.classList.add('active');
      timers.set(midi, setTimeout(() => key.classList.remove('active'), 220));
    }
    return { element, highlight };
  };
})(window.PianoType);
