(function (PT) {
  'use strict';
  PT.services.createMelodyPlayer = function ({ song, audio, onProgress, onNote }) {
    let selectedSong = song;
    let step = 0;
    let version = 0;
    let preparing = false;
    const snapshot = () => ({ song: selectedSong, step, total: selectedSong.notes.length });
    const notify = () => onProgress(snapshot());

    async function advance() {
      if (preparing) return;
      preparing = true;
      const currentVersion = version;
      try {
        await audio.activate();
        if (currentVersion !== version) return;
        if (step >= selectedSong.notes.length) step = 0;
        for (const midi of selectedSong.notes[step++]) {
          audio.play(midi);
          onNote(midi);
        }
        notify();
      } finally { preparing = false; }
    }

    function select(nextSong) {
      selectedSong = nextSong;
      step = 0;
      version++;
      audio.stopAll();
      notify();
    }

    function restart() { step = 0; version++; notify(); }
    return { advance, select, restart, snapshot };
  };
})(window.PianoType);
