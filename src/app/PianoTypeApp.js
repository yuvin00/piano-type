(function (PT) {
  'use strict';
  // Connect UI callbacks to services. Components never own the audio engine.
  PT.mount = function (root) {
    const storage = PT.services.storage;
    const songs = PT.data.songs;
    const savedSong = storage.read('piano-type-song').value;
    const initialSong = songs.find((song) => song.id === savedSong) || songs.find((song) => song.id === 'turkish');
    let studio, audio, player;
    const reportError = () => studio.editor.setStatus('소리를 준비하지 못했어요. 페이지를 새로고침한 뒤 다시 입력해주세요.');
    const reportStorageError = () => studio.editor.setStatus('이 브라우저에서는 글 자동 저장을 사용할 수 없어요');

    studio = PT.organisms.PianoStudio({
      songs, selectedSong: initialSong,
      onTyping: () => { player.advance().catch(reportError); },
      onActivate: () => { audio.activate().catch(reportError); },
      onPianoPress: async (midi) => {
        try { await audio.activate(); audio.play(midi); studio.showNote(midi); }
        catch { reportError(); }
      },
      onChange(value) { if (!storage.write('piano-type-draft', value)) reportStorageError(); },
      onVolume: (value) => audio.setVolume(value),
      onSelect(song) {
        player.select(song);
        studio.setSong(song);
        studio.editor.setStatus(`${song.title}${song.detail ? ` (${song.detail})` : ''} · 첫 음부터 시작해요`);
        storage.write('piano-type-song', song.id);
        studio.editor.focus();
      },
      onRestart() {
        player.restart();
        studio.editor.setStatus('멜로디를 처음부터 시작해요');
        studio.editor.focus();
      }
    });
    audio = PT.services.createGrandPiano({ onStatus: studio.editor.setStatus });
    player = PT.services.createMelodyPlayer({
      song: initialSong, audio, onProgress: studio.showProgress, onNote: studio.showNote
    });
    const main = PT.utils.element('main', {}, [
      PT.layout.PageIntro(), studio.element,
      PT.utils.element('p', { className: 'footnote', text: '이 페이지 안에서 입력한 타자에만 반응해요. 글은 이 브라우저에 자동 저장됩니다.' })
    ]);
    root.replaceChildren(PT.layout.AppHeader(), main);
    const draft = storage.read('piano-type-draft');
    studio.editor.setText(draft.value);
    studio.showProgress(player.snapshot());
    try { audio.preload().catch(reportError).finally(() => { if (!draft.available) reportStorageError(); }); }
    catch { reportError(); }
    return { audio, player, studio };
  };
})(window.PianoType);
