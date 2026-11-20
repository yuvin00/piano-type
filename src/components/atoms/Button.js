(function (PT) {
  'use strict';
  PT.atoms.Button = function ({ text, id, className, attributes = {}, onClick } = {}) {
    const button = PT.utils.element('button', { text, id, className, attributes: { type: 'button', ...attributes } });
    if (onClick) button.addEventListener('click', onClick);
    return button;
  };
})(window.PianoType);
