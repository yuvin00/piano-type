(function (PT) {
  'use strict';
  // Audio decoding and playback are independent of the page's DOM components.
  PT.services.createGrandPiano = function ({ volume = 45, onStatus = () => {} } = {}) {
    let context, master, ready;
    const buffers = new Map();
    const voices = new Set();

    function preload() {
      if (ready) return ready;
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) throw new Error('Web Audio is unavailable');
      context = new Audio();
      master = context.createGain();
      master.gain.value = volume / 100 * 0.65;
      const compressor = context.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.knee.value = 12;
      compressor.ratio.value = 3;
      master.connect(compressor);
      compressor.connect(context.destination);
      onStatus('그랜드피아노 음색을 준비하고 있어요…');
      ready = Promise.all(Object.entries(PT.data.pianoSamples).map(async ([name, url]) => {
        const binary = atob(url.slice(url.indexOf(',') + 1));
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        buffers.set(PT.utils.notes.sampleMidi(name), await context.decodeAudioData(bytes.buffer));
      })).then(() => onStatus('글을 입력하면 그랜드피아노 연주가 시작돼요'));
      return ready;
    }

    async function activate() {
      const loaded = preload();
      await context.resume(); // Called directly from the user's click/typing event.
      await loaded;
      onStatus('연주 중 · 자유롭게 글을 써보세요');
    }

    function play(midi) {
      if (!context) return;
      const sampleMidi = Math.max(21, Math.min(108, midi));
      const buffer = buffers.get(sampleMidi);
      if (!buffer) return;
      while (voices.size >= 64) {
        const oldest = voices.values().next().value;
        oldest.stop();
        voices.delete(oldest);
      }
      const now = context.currentTime;
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = 2 ** ((midi - sampleMidi) / 12);
      const envelope = context.createGain();
      // Cap each note at 0.7 seconds, with a 20 ms release.
      const duration = Math.min(buffer.duration / source.playbackRate.value, 0.7);
      const release = 0.02;
      envelope.gain.setValueAtTime(0.72, now);
      envelope.gain.setValueAtTime(0.72, now + Math.max(0, duration - release));
      envelope.gain.linearRampToValueAtTime(0, now + duration);
      source.connect(envelope);
      envelope.connect(master);
      voices.add(source);
      source.onended = () => { voices.delete(source); source.disconnect(); envelope.disconnect(); };
      source.start(now);
      source.stop(now + duration);
    }

    function stopAll() {
      for (const voice of voices) voice.stop();
      voices.clear();
    }

    function setVolume(value) {
      volume = Number(value);
      if (master) master.gain.setTargetAtTime(volume / 100 * 0.65, context.currentTime, 0.02);
    }

    return { preload, activate, play, stopAll, setVolume };
  };
})(window.PianoType);
