(function (PT) {
  'use strict';
  PT.atoms.VolumeSlider = function ({ onChange }) {
    const el = PT.utils.element;
    const slider = el('input', { id: 'volume', attributes: { type: 'range', min: 0, max: 100, value: 45 } });
    slider.addEventListener('input', () => onChange(Number(slider.value)));
    const label = el('label', { className: 'volume' }, [el('span', { text: '음량' }), slider]);
    return { element: label, input: slider };
  };
})(window.PianoType);
