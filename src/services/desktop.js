(function (PT) {
  'use strict';
  PT.services.connectDesktop = function ({ audio, player, studio }) {
    const bridge = window.pianoDesktop;
    if (!bridge) {
      const el = PT.utils.element;
      return el('div', { className: 'desktop-download' }, [
        el('a', { text: 'Windows 앱 다운로드', attributes: {
          href: 'https://github.com/yuvin00/piano-type/releases/latest/download/Piano-Type-Windows.exe'
        } }),
        el('p', { text: 'Windows 10/11 · 다른 프로그램에서도 타자 소리와 미니 피아노를 사용해보세요.' })
      ]);
    }
    const el = PT.utils.element;
    const button = el('button', { text: '미니 피아노 열기', attributes: { type: 'button', title: '전체 타자 소리를 켜고 작은 피아노 창 열기' } });
    const toggle = el('button', { text: '일시정지', attributes: { type: 'button', 'aria-pressed': 'false' } });
    const restore = el('button', { text: '전체 화면으로', attributes: { type: 'button' } });
    const status = el('span', { text: '꺼짐 · Ctrl+Alt+P로 전환', attributes: { role: 'status' } });
    const element = el('div', { className: 'desktop-controls' }, [button, toggle, restore, status]);
    let enabled = false, busy = false;
    function render(state) {
      enabled = state.enabled;
      document.body.classList.toggle('compact-mode', Boolean(state.compact));
      toggle.hidden = !enabled && !state.compact;
      restore.hidden = !state.compact;
      button.hidden = Boolean(state.compact);
      toggle.textContent = enabled ? '일시정지' : '소리 켜기';
      toggle.setAttribute('aria-pressed', String(enabled));
      status.textContent = state.error || (enabled ? '전체 타자 소리 켜짐 · Ctrl+Alt+P' : '다른 프로그램에서도 타자로 연주해요');
      if (!enabled) audio.stopAll();
    }
    button.addEventListener('click', async () => {
      if (busy) return;
      busy = true;
      button.disabled = true;
      try {
        await audio.activate();
        const state = await bridge.setEnabled(true);
        render(state);
        if (state.enabled) render(await bridge.setCompact(true));
      } catch {
        status.textContent = '소리를 준비하지 못했어요. 다시 눌러주세요.';
      } finally { busy = false; button.disabled = false; }
    });
    toggle.addEventListener('click', async () => {
      try {
        if (!enabled) await audio.activate();
        render(await bridge.setEnabled(!enabled));
      } catch { status.textContent = '소리를 준비하지 못했어요. 다시 눌러주세요.'; }
    });
    restore.addEventListener('click', async () => render(await bridge.setCompact(false)));
    bridge.onState(render);
    bridge.onTyping(() => {
      if (enabled) player.advance().catch(() => studio.editor.setStatus('소리를 재생하지 못했어요. 앱을 다시 열어주세요.'));
    });
    // Focused editor has its own IME/mobile handling. Listen only outside it here.
    document.addEventListener('keydown', event => {
      if (enabled && event.target?.id !== 'writing' && PT.utils.isTypingKey(event)) {
        player.advance().catch(() => {});
      }
    });
    bridge.getState().then(render).catch(() => { status.textContent = 'PC 앱 연결을 확인해주세요.'; });
    return element;
  };
})(window.PianoType);
