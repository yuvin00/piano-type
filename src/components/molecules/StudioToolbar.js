(function (PT) {
  'use strict';
  PT.molecules.StudioToolbar = function ({ songs, selectedSong, onSelect, onVolume }) {
    const picker = PT.molecules.SongPicker({ songs, selectedSong, onSelect });
    const volume = PT.atoms.VolumeSlider({ onChange: onVolume });
    return {
      element: PT.utils.element('div', { className: 'toolbar' }, [picker.element, volume.element]),
      setSong: picker.setSong
    };
  };
})(window.PianoType);
