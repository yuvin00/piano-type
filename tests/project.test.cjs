const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)" defer><\/script>/g)].map(match => match[1]);
const flush = () => new Promise(resolve => setImmediate(resolve));

function createBrowser({ storageDisabled = false } = {}) {
  const nodes = new Map();
  const events = {};
  const stats = { decodes: 0, resumes: 0, plays: 0, stops: 0, gain: null };
  const storage = new Map([['piano-type-song', 'battle'], ['piano-type-draft', '안녕🎹']]);
  const document = {
    activeElement: null,
    createElement: (tag) => new Element(tag),
    createTextNode: (value) => ({ textContent: value }),
    getElementById: (id) => nodes.get(id)
  };
  class Element {
    constructor(tag) {
      this.tagName = tag;
      this.listeners = {};
      this.children = [];
      this.attrs = {};
      this.style = {};
      this.value = '';
      this.textContent = '';
      this.activeClasses = new Set();
      this.classList = { add: name => this.activeClasses.add(name), remove: name => this.activeClasses.delete(name) };
    }
    set id(value) { this._id = value; nodes.set(value, this); }
    get id() { return this._id; }
    addEventListener(name, fn) { (this.listeners[name] ||= []).push(fn); }
    async fire(name, event = {}) { for (const fn of this.listeners[name] || []) await fn(event); await flush(); }
    setAttribute(name, value) { this.attrs[name] = value; if(name === 'value') this.value = String(value); }
    append(...items) { this.children.push(...items); }
    replaceChildren(...items) { this.children = items; }
    focus() { document.activeElement = this; }
    hidePopover() { this.open = false; }
    matches() { return this.open; }
    getBoundingClientRect() { return { left: 100, top: 150, bottom: 200 }; }
  }
  class Audio {
    constructor() { this.currentTime = 0; this.state = 'suspended'; }
    resume() { stats.resumes++; this.state = 'running'; return Promise.resolve(); }
    decodeAudioData(buffer) { assert.ok(buffer.byteLength > 100); stats.decodes++; return Promise.resolve({ duration: 3 }); }
    createGain() {
      const node = { gain: { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, setTargetAtTime(value) { this.value = value; } }, connect() {}, disconnect() {} };
      stats.gain ||= node;
      return node;
    }
    createDynamicsCompressor() { return { threshold: {}, knee: {}, ratio: {}, connect() {} }; }
    createBufferSource() { return { playbackRate: { value: 1 }, connect() {}, disconnect() {}, start() { stats.plays++; }, stop() { stats.stops++; } }; }
  }
  const window = { AudioContext: Audio, addEventListener(name, fn) { (events[name] ||= []).push(fn); } };
  const context = { window, document, atob, innerWidth: 1200, innerHeight: 900,
    localStorage: {
      getItem(key) { if (storageDisabled) throw Error('disabled'); return storage.get(key); },
      setItem(key, value) { if (storageDisabled) throw Error('disabled'); storage.set(key, value); }
    }, setTimeout: () => 0, clearTimeout() {}
  };
  const appRoot = new Element('div'); appRoot.id = 'app';
  vm.createContext(context);
  for (const file of scripts) {
    if (file === 'src/app/main.js') {
      vm.runInContext('const mount = window.PianoType.mount; window.PianoType.mount = (...args) => { window.appInstance = mount(...args); return window.appInstance; };', context);
    }
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
  }
  return { PT: window.PianoType, app: window.appInstance, nodes, document, stats, storage, events };
}

test('all scripts and CSS imports resolve; no modules/server required', () => {
  assert.equal(new Set(scripts).size, scripts.length);
  for (const script of scripts) new vm.Script(fs.readFileSync(path.join(root, script), 'utf8'));
  const entry = path.join(root, 'src/styles/index.css');
  const imports = [...fs.readFileSync(entry, 'utf8').matchAll(/url\("([^"]+)"\)/g)];
  assert.ok(imports.length >= 8);
  for (const [, file] of imports) assert.ok(fs.existsSync(path.resolve(path.dirname(entry), file)), file);
  assert.ok(!html.includes('type="module"'));
});

test('page mounts atomic components with 9 songs and all 88 acoustic samples', async () => {
  const { PT, app, nodes, stats } = createBrowser();
  await flush();
  assert.equal(nodes.get('piano').children.length, 88);
  assert.equal(nodes.get('song-options').children.length, 9);
  assert.equal(stats.decodes, 88);
  assert.equal(stats.resumes, 0);
  assert.equal(app.player.snapshot().song.id, 'turkish');
  assert.equal(nodes.get('writing').value, '안녕🎹');
  assert.equal(nodes.get('count').textContent, '3자');
  assert.equal(nodes.has('sound'), false);
  for (const song of PT.data.songs) {
    assert.ok(song.notes.length > 0);
    assert.ok(song.notes.every(chord => chord.length && chord.every(note => Number.isInteger(note) && note >= 0 && note <= 127)));
  }
});

test('first typing starts audio, IME plays once, shortcuts and repeats do not advance', async () => {
  const { app, nodes, stats } = createBrowser();
  await nodes.get('writing').fire('keydown', { code: 'KeyA' });
  assert.equal(app.player.snapshot().step, 1);
  assert.ok(stats.plays > 0);
  await nodes.get('writing').fire('keydown', { code: 'KeyR', isComposing: true, keyCode: 229 });
  assert.equal(app.player.snapshot().step, 2);
  for (const event of [{ code: 'KeyA', ctrlKey: true }, { code: 'KeyA', metaKey: true }, { code: 'KeyA', repeat: true }, { code: 'Backspace' }]) {
    await nodes.get('writing').fire('keydown', event);
  }
  assert.equal(app.player.snapshot().step, 2);
});

test('song selection, every song ending, restart, volume and click piano work', async () => {
  const { PT, app, nodes, stats, storage } = createBrowser();
  await flush();
  for (const song of PT.data.songs) {
    await nodes.get(`song-${song.id}`).fire('click');
    assert.equal(nodes.get('song-title').textContent, song.title);
    assert.equal(storage.get('piano-type-song'), song.id);
    for (let i = 0; i < song.notes.length; i++) await app.player.advance();
    assert.equal(app.player.snapshot().step, song.notes.length);
    await app.player.advance();
    assert.equal(app.player.snapshot().step, 1);
    await nodes.get('restart').fire('click');
    assert.equal(app.player.snapshot().step, 0);
  }
  nodes.get('volume').value = '25';
  await nodes.get('volume').fire('input');
  assert.equal(stats.gain.gain.value, 0.25 * 0.65);
  const before = stats.plays;
  await nodes.get('piano').children[0].fire('pointerdown', { preventDefault() {} });
  assert.equal(stats.plays, before + 1);
});

test('popup keyboard navigation, selection focus and responsive placement', async () => {
  const { nodes, document } = createBrowser();
  const popup = nodes.get('song-popup');
  await popup.fire('beforetoggle', { newState: 'open' });
  await popup.fire('toggle', { newState: 'open' });
  assert.equal(document.activeElement.id, 'song-turkish');
  assert.equal(nodes.get('song-trigger').attrs['aria-expanded'], 'true');
  assert.equal(popup.style.left, '100px');
  await popup.fire('keydown', { key: 'Home', preventDefault() {} });
  assert.equal(document.activeElement.id, 'song-jingle');
  await popup.fire('keydown', { key: 'End', preventDefault() {} });
  assert.equal(document.activeElement.id, 'song-elise');
  await nodes.get('song-jingle').fire('click');
  assert.equal(document.activeElement.id, 'writing');
  assert.equal(nodes.get('song-jingle').attrs['aria-checked'], 'true');
});

test('draft saves and storage failure keeps typing playable', async () => {
  const browser = createBrowser();
  browser.nodes.get('writing').value = '안녕하세요';
  await browser.nodes.get('writing').fire('input');
  assert.equal(browser.storage.get('piano-type-draft'), '안녕하세요');
  assert.equal(browser.nodes.get('count').textContent, '5자');
  const disabled = createBrowser({ storageDisabled: true });
  await flush();
  disabled.nodes.get('writing').value = '글';
  await disabled.nodes.get('writing').fire('input');
  assert.ok(disabled.nodes.get('status').textContent.includes('자동 저장'));
  await disabled.nodes.get('writing').fire('keydown', { code: 'KeyA' });
  assert.equal(disabled.app.player.snapshot().step, 1);
});

test('a pending audio activation does not advance a song after selection changes', async () => {
  const { PT } = createBrowser();
  let ready;
  const promise = new Promise(resolve => { ready = resolve; });
  const player = PT.services.createMelodyPlayer({ song: PT.data.songs[0],
    audio: { activate: () => promise, play() { assert.fail('stale note'); }, stopAll() {} },
    onProgress() {}, onNote() {}
  });
  const pending = player.advance();
  player.select(PT.data.songs[1]);
  ready();
  await pending;
  assert.equal(player.snapshot().step, 0);
});

test('mobile software keyboard plays Latin, Korean composition and line breaks', async () => {
  const { app, nodes, stats } = createBrowser();
  const input = nodes.get('writing');
  await input.fire('touchend');
  assert.ok(stats.resumes > 0);
  await input.fire('keydown', { code: '', key: 'Unidentified', keyCode: 229 });
  input.value += 'a';
  await input.fire('input', { inputType: 'insertText', data: 'a' });
  assert.equal(app.player.snapshot().step, 1);
  input.value += 'ㄱ';
  await input.fire('input', { inputType: 'insertCompositionText', data: 'ㄱ', isComposing: true });
  input.value = input.value.slice(0, -1) + '가';
  await input.fire('input', { inputType: 'insertCompositionText', data: '가', isComposing: true });
  assert.equal(app.player.snapshot().step, 3);
  await input.fire('input', { inputType: 'insertText', data: '가' });
  assert.equal(app.player.snapshot().step, 3, 'same-value composition commit is not replayed');
  input.value += '\n';
  await input.fire('input', { inputType: 'insertLineBreak', data: null });
  assert.equal(app.player.snapshot().step, 4);
});

test('desktop keydown/input plays once; paste, deletion, undo and repeated keys stay silent', async () => {
  const { app, nodes } = createBrowser();
  const input = nodes.get('writing');
  await input.fire('keydown', { code: 'KeyA' });
  input.value += 'a';
  await input.fire('input', { inputType: 'insertText', data: 'a' });
  await input.fire('keyup');
  assert.equal(app.player.snapshot().step, 1);
  await input.fire('keydown', { code: 'KeyA', repeat: true });
  input.value += 'a';
  await input.fire('input', { inputType: 'insertText', data: 'a' });
  await input.fire('keyup');
  input.value += 'paste';
  await input.fire('input', { inputType: 'insertFromPaste', data: 'paste' });
  input.value = input.value.slice(0, -1);
  await input.fire('input', { inputType: 'deleteContentBackward', data: null });
  input.value = 'undo';
  await input.fire('input', { inputType: 'historyUndo' });
  assert.equal(app.player.snapshot().step, 1);
  input.value += 'b';
  await input.fire('input', { inputType: 'insertText', data: 'b' });
  assert.equal(app.player.snapshot().step, 2);
});
