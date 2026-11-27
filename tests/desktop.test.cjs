const test = require('node:test');
const assert = require('node:assert/strict');
const { createTypingFilter } = require('../desktop/typing-filter.cjs');
const keys = { A: 30, Space: 57, Enter: 28 };
test('one note per physical press, including keyup and restart', () => {
  const filter = createTypingFilter(keys);
  assert.equal(filter.keydown({ keycode: 30 }), true);
  assert.equal(filter.keydown({ keycode: 30 }), false);
  filter.keyup({ keycode: 30 });
  assert.equal(filter.keydown({ keycode: 30 }), true);
  filter.clear();
  assert.equal(filter.keydown({ keycode: 30 }), true);
});
test('shortcuts, modifiers, navigation and unknown keys do not advance melody', () => {
  const filter = createTypingFilter(keys);
  for (const modifier of ['ctrlKey', 'altKey', 'metaKey']) {
    assert.equal(filter.keydown({ keycode: 30, [modifier]: true }), false);
    filter.keyup({ keycode: 30 });
  }
  assert.equal(filter.keydown({ keycode: 30, shiftKey: true }), true);
  assert.equal(filter.keydown({ keycode: 999 }), false);
  assert.equal(filter.keydown({ keycode: 57 }), true);
  assert.equal(filter.keydown({ keycode: 28 }), true);
});
