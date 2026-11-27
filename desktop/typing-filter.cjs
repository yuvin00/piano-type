'use strict';

// Keep only a pressed-key set in memory. No text, key history, or key codes cross IPC.
function createTypingFilter(keys) {
  const pressed = new Set();
  const names = 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z 0 1 2 3 4 5 6 7 8 9 Space Enter NumpadEnter Minus Equal BracketLeft BracketRight Backslash Semicolon Quote Backquote Comma Period Slash Numpad0 Numpad1 Numpad2 Numpad3 Numpad4 Numpad5 Numpad6 Numpad7 Numpad8 Numpad9 NumpadMultiply NumpadAdd NumpadSubtract NumpadDecimal NumpadDivide'.split(' ');
  const allowed = new Set(names.map(name => keys[name]).filter(Number.isInteger));
  return {
    keydown(event) {
      if (pressed.has(event.keycode)) return false;
      pressed.add(event.keycode);
      return allowed.has(event.keycode) && !event.ctrlKey && !event.altKey && !event.metaKey;
    },
    keyup(event) { pressed.delete(event.keycode); },
    clear() { pressed.clear(); }
  };
}
module.exports = { createTypingFilter };
