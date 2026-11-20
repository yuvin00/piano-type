(function (PT) {
  'use strict';
  PT.atoms.SongOption = function ({ song, selected, onSelect }) {
    const el = PT.utils.element;
    const row = PT.atoms.Button({
      id: `song-${song.id}`, className: 'song-option',
      attributes: { role: 'menuitemradio', 'aria-checked': selected, tabindex: selected ? 0 : -1 },
      onClick: () => onSelect(song)
    });
    if (song.detail) row.title = song.detail;
    row.append(
      el('span', { className: 'song-check', text: selected ? '✓' : '', attributes: { 'aria-hidden': true } }),
      el('span', { className: 'option-title', text: song.title }),
      el('span', { className: 'option-speed', text: song.speed })
    );
    return row;
  };
})(window.PianoType);
