(function (PT) {
  'use strict';
  PT.utils.isTypingKey = (event) => !event.ctrlKey && !event.metaKey && !event.altKey && !event.repeat &&
    /^(Key[A-Z]|Digit[0-9]|Space|Enter|Comma|Period|Slash|Semicolon|Quote|BracketLeft|BracketRight|Backslash|Backquote|Minus|Equal)$/.test(event.code);
})(window.PianoType);
