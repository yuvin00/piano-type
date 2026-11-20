(function (PT) {
  'use strict';
  PT.molecules.SongPicker = function ({ songs, selectedSong, onSelect }) {
    const el = PT.utils.element;
    const title = el('span', { id: 'song-title' });
    const speed = el('span', { id: 'song-speed', className: 'song-speed' });
    const trigger = PT.atoms.Button({ id: 'song-trigger', attributes: {
      'aria-labelledby': 'melody-label song-title', 'aria-haspopup': 'menu', 'aria-expanded': false, popovertarget: 'song-popup'
    } });
    trigger.append(title, speed, el('span', { className: 'chevron', attributes: { 'aria-hidden': true } }));
    const options = el('div', { id: 'song-options' });
    const popup = el('div', { id: 'song-popup', attributes: { popover: 'auto', role: 'menu', 'aria-label': '멜로디 선택' } }, [
      el('p', { className: 'popup-heading', text: '오늘은 어떤 곡을 연주할까요?' }), options,
      el('div', { className: 'popup-footer', text: '타자를 칠 때마다 다음 음 · 화음으로 이어져요' })
    ]);
    const element = el('div', { className: 'song-picker' }, [el('span', { id: 'melody-label', className: 'picker-label', text: '멜로디' }), trigger, popup]);
    let selectedRow;

    function setSong(song) {
      title.textContent = song.title;
      speed.textContent = song.speed;
      options.replaceChildren();
      for (const item of songs) {
        const row = PT.atoms.SongOption({ song: item, selected: item.id === song.id,
          onSelect(nextSong) { popup.hidePopover(); onSelect(nextSong); }
        });
        if (item.id === song.id) selectedRow = row;
        options.append(row);
      }
    }

    function position() {
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(430, innerWidth - 24);
      popup.style.width = `${width}px`;
      popup.style.left = `${Math.max(12, Math.min(rect.left, innerWidth - width - 12))}px`;
      const below = innerHeight - rect.bottom - 20;
      const above = rect.top - 20;
      const useBelow = below >= 280 || below >= above;
      popup.style.maxHeight = `${Math.max(100, useBelow ? below : above)}px`;
      popup.style.top = useBelow ? `${rect.bottom + 12}px` : 'auto';
      popup.style.bottom = useBelow ? 'auto' : `${innerHeight - rect.top + 12}px`;
    }
    popup.addEventListener('beforetoggle', (event) => {
      trigger.setAttribute('aria-expanded', String(event.newState === 'open'));
      if (event.newState === 'open') position();
    });
    popup.addEventListener('toggle', (event) => { if (event.newState === 'open') selectedRow.focus(); });
    popup.addEventListener('keydown', (event) => {
      const rows = [...options.children];
      const index = rows.indexOf(document.activeElement);
      let next;
      if (event.key === 'ArrowDown') next = (index + 1) % rows.length;
      if (event.key === 'ArrowUp') next = (index + rows.length - 1) % rows.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = rows.length - 1;
      if (next !== undefined) { event.preventDefault(); rows[next].focus(); }
      if (event.key === 'Tab') popup.hidePopover();
    });
    const reposition = () => { if (popup.matches(':popover-open')) position(); };
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    setSong(selectedSong);
    return { element, setSong };
  };
})(window.PianoType);
