(function (PT) {
  'use strict';
  const names = ['도', '도♯', '레', '레♯', '미', '파', '파♯', '솔', '솔♯', '라', '라♯', '시'];
  PT.utils.notes = {
    isBlack: (midi) => [1, 3, 6, 8, 10].includes(midi % 12),
    label: (midi) => `${names[midi % 12]} · ${Math.floor(midi / 12) - 1}`,
    sampleMidi(name) {
      const [, letter, accidental, octave] = /^([A-G])([b#]?)(-?\d+)$/.exec(name);
      const semitone = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[letter];
      return (Number(octave) + 1) * 12 + semitone + (accidental === 'b' ? -1 : accidental === '#' ? 1 : 0);
    }
  };
})(window.PianoType);
