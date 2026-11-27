'use strict';
const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, globalShortcut, systemPreferences } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createTypingFilter } = require('./typing-filter.cjs');
let window, tray, hook, filter;
let enabled = false, quitting = false, error = '', compact = false, fullBounds, wasMaximized = false;
const page = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
const state = () => ({ enabled, error, compact, shortcut: process.platform === 'darwin' ? '⌘+Option+P' : 'Ctrl+Alt+P' });
function setCompact(value) {
  if (value === compact) return state();
  compact = value;
  if (compact) {
    wasMaximized = window.isMaximized();
    fullBounds = window.getNormalBounds();
    if (wasMaximized) window.unmaximize();
    window.setMinimumSize(720, 270);
    window.setSize(940, 300);
    window.setAlwaysOnTop(true);
  } else {
    window.setAlwaysOnTop(false);
    window.setMinimumSize(720, 600);
    if (fullBounds) window.setBounds(fullBounds);
    if (wasMaximized) window.maximize();
  }
  publishState();
  return state();
}
function showFullWindow() { setCompact(false); window.show(); window.focus(); }

function publishState() {
  if (window && !window.isDestroyed()) window.webContents.send('piano:state', state());
  if (tray) {
    tray.setToolTip(`Piano Type · ${enabled ? '전체 타자 소리 켜짐' : '일시정지'}`);
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Piano Type 열기', click: showFullWindow },
      { label: '전체 타자 소리', type: 'checkbox', checked: enabled, click: item => setEnabled(item.checked) },
      { type: 'separator' },
      { label: '종료', click: () => app.quit() }
    ]));
  }
}
function setEnabled(value) {
  error = '';
  if (value && !enabled) {
    // Check before starting the native hook: macOS may reject it without Accessibility permission.
    if (process.platform === 'darwin' && !systemPreferences.isTrustedAccessibilityClient(true)) {
      error = '시스템 설정 → 개인정보 보호 및 보안 → 손쉬운 사용에서 Piano Type을 허용한 뒤 다시 눌러주세요. 입력 모니터링 권한도 요청되면 허용해주세요.';
      publishState();
      return state();
    }
    try {
      if (!hook) {
        const { uIOhook, UiohookKey } = require('uiohook-napi');
        hook = uIOhook;
        filter = createTypingFilter(UiohookKey);
        hook.on('keydown', event => {
          if (filter.keydown(event) && enabled && !window.isDestroyed() && !window.isFocused()) {
            window.webContents.send('piano:typing');
          }
        });
        hook.on('keyup', event => filter.keyup(event));
      }
      filter.clear();
      hook.start();
      enabled = true;
    } catch (cause) {
      enabled = false;
      error = '전체 키보드를 연결하지 못했어요. 앱을 종료한 뒤 다시 실행해주세요.';
      console.error('Keyboard hook failed:', cause.message);
    }
  } else if (!value && enabled) {
    enabled = false;
    hook.stop();
    filter.clear();
  }
  publishState();
  return state();
}
function trusted(event) { return event.sender === window.webContents && event.senderFrame?.url === page; }

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('activate', () => { if (window && !window.isDestroyed()) showFullWindow(); });
  app.on('second-instance', () => { if (window) { window.show(); window.focus(); } });
  app.whenReady().then(() => {
    window = new BrowserWindow({
      width: 1200, height: 900, minWidth: 720, minHeight: 600,
      autoHideMenuBar: true,
      icon: path.join(__dirname, '..', 'assets', 'icons', process.platform === 'darwin' ? 'piano.png' : 'piano.ico'),
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        contextIsolation: true, nodeIntegration: false, sandbox: true,
        backgroundThrottling: false, autoplayPolicy: 'no-user-gesture-required'
      }
    });
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    window.webContents.on('will-navigate', event => event.preventDefault());
    window.webContents.session.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
    ipcMain.handle('piano:state', event => { if (trusted(event)) return state(); });
    ipcMain.handle('piano:enable', (event, value) => { if (trusted(event)) return setEnabled(value === true); });
    ipcMain.handle('piano:compact', (event, value) => { if (trusted(event)) return setCompact(value === true); });
    tray = new Tray(nativeImage.createFromPath(path.join(__dirname, '..', 'assets', 'icons', 'piano.png')).resize({ width: 32, height: 32 }));
    tray.on('double-click', showFullWindow);
    publishState();
    globalShortcut.register('CommandOrControl+Alt+P', () => setEnabled(!enabled));
    window.on('close', event => { if (!quitting) { event.preventDefault(); window.hide(); } });
    window.webContents.on('render-process-gone', () => { setEnabled(false); window.show(); });
    window.loadURL(page);
  });
  app.on('before-quit', () => {
    quitting = true;
    if (enabled) setEnabled(false);
    globalShortcut.unregisterAll();
    if (tray) tray.destroy();
  });
}
