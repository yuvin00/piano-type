(function (PT) {
  'use strict';
  PT.organisms.PianoStudio = function (props) {
    const el = PT.utils.element;
    const toolbar = PT.molecules.StudioToolbar(props);
    const editor = PT.molecules.WritingEditor(props);
    const keyboard = PT.molecules.PianoKeyboard({ onPress: props.onPianoPress });
    const note = el('span', { id: 'note', text: '—', attributes: { 'aria-live': 'off' } });
    const progress = el('span', { id: 'progress' });
    const restart = PT.atoms.Button({ id: 'restart', text: '멜로디 처음부터', onClick: props.onRestart });
    const instrument = el('div', { className: 'instrument' }, [
      el('div', { className: 'instrument-meta' }, [el('span', { text: 'YOUR LITTLE PIANO' }), note]),
      keyboard.element,
      el('div', { className: 'instrument-bottom' }, [progress, restart])
    ]);
    return {
      element: el('section', { className: 'studio', attributes: { 'aria-label': '피아노 타이핑' } }, [toolbar.element, editor.element, instrument]),
      editor,
      setSong: toolbar.setSong,
      showNote(midi) { keyboard.highlight(midi); note.textContent = PT.utils.notes.label(midi); },
      showProgress({ song, step, total }) { progress.textContent = `${song.title} · ${step.toLocaleString()} / ${total.toLocaleString()}`; }
    };
  };
})(window.PianoType);
