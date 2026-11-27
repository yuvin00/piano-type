'use strict';
// Real Electron/preload/audio/native-hook smoke test, without generating OS keystrokes.
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const logPath = path.join(__dirname, '..', 'desktop-smoke.log');
fs.writeFileSync(logPath, 'Starting desktop smoke\n');
function log(message) { fs.appendFileSync(logPath, `${message}\n`); console.log(message); }
app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'piano-type-smoke-')));
const timeout = setTimeout(() => { log('FAIL: Desktop smoke timed out'); app.exit(1); }, 45000);
app.on('browser-window-created', (_event, window) => {
  window.webContents.on('console-message', (_event, details) => {
    if (details.level === 'error') console.error('Renderer:', details.message);
  });
  window.webContents.once('did-finish-load', async () => {
    try {
      const originalBounds = window.getBounds();
      await new Promise(resolve => setTimeout(resolve, 200));
      fs.writeFileSync(path.join(__dirname, '..', 'desktop-full.png'), (await window.webContents.capturePage()).toPNG());
      await window.webContents.executeJavaScript(`(async () => {
        const app = window.PianoType.mount;
        if (typeof app !== 'function' || !window.pianoDesktop) throw Error('App/preload missing');
        const control = document.querySelector('.desktop-controls button');
        if (!control) throw Error('Desktop controls missing');
        control.click();
        for (let i = 0; i < 150; i++) {
          const state = await window.pianoDesktop.getState();
          if (state.enabled && state.compact) return;
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        throw Error('Hook/audio activation failed');
      })()`);
      await new Promise(resolve => setTimeout(resolve, 250));
      const layout = await window.webContents.executeJavaScript(`({
        compact: document.body.classList.contains('compact-mode'),
        pianoVisible: getComputedStyle(document.querySelector('.instrument')).display !== 'none',
        editorHidden: getComputedStyle(document.querySelector('.paper')).display === 'none',
        bottom: document.querySelector('.studio').getBoundingClientRect().bottom,
        height: innerHeight
      })`);
      if (!layout.compact || !layout.pianoVisible || !layout.editorHidden || layout.bottom > layout.height) throw Error('Mini layout failed: ' + JSON.stringify(layout));
      if (window.getBounds().height !== 300 || !window.isAlwaysOnTop()) throw Error('Mini window bounds failed');
      fs.writeFileSync(path.join(__dirname, '..', 'desktop-mini.png'), (await window.webContents.capturePage()).toPNG());
      const before = await window.webContents.executeJavaScript("document.getElementById('progress').textContent");
      window.hide();
      window.webContents.send('piano:typing');
      await new Promise(resolve => setTimeout(resolve, 400));
      const after = await window.webContents.executeJavaScript("document.getElementById('progress').textContent");
      if (before === after) throw Error(`Background playback failed: ${before} -> ${after}`);
      const stopped = await window.webContents.executeJavaScript('window.pianoDesktop.setEnabled(false)');
      if (stopped.enabled || stopped.error) throw Error('Hook stop failed');
      window.webContents.send('piano:typing');
      await new Promise(resolve => setTimeout(resolve, 100));
      const paused = await window.webContents.executeJavaScript("document.getElementById('progress').textContent");
      if (paused !== after) throw Error('Paused app advanced');
      const restarted = await window.webContents.executeJavaScript('window.pianoDesktop.setEnabled(true)');
      if (!restarted.enabled) throw Error('Hook restart failed');
      await window.webContents.executeJavaScript('window.pianoDesktop.setEnabled(false)');
      await window.webContents.executeJavaScript('window.pianoDesktop.setCompact(false)');
      if (window.getBounds().height !== originalBounds.height || window.isAlwaysOnTop()) throw Error('Full window restore failed');
      log('PASS: real Electron renderer, sandboxed preload, 88-sample audio activation, native hook start/stop, hidden-window playback');
      clearTimeout(timeout);
      app.quit();
    } catch (error) { log(`FAIL: ${error.stack}`); app.exit(1); }
  });
});
require('../desktop/main.cjs');
