(function (PT) {
  'use strict';
  PT.atoms.PianoKey = function ({ midi, whiteIndex, onPress }) {
    const black = PT.utils.notes.isBlack(midi);
    const button = PT.atoms.Button({ className: `key${black ? ' black' : ''}`, attributes: { 'aria-label': PT.utils.notes.label(midi) } });
    if (black) button.style.left = `${whiteIndex / 52 * 100 - 0.6}%`;
    button.addEventListener('pointerdown', (event) => { event.preventDefault(); onPress(midi); });
    return button;
  };
})(window.PianoType);
