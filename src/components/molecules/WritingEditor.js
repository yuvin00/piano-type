(function (PT) {
  'use strict';
  PT.molecules.WritingEditor = function ({ onTyping, onActivate, onChange }) {
    const el = PT.utils.element;
    const input = el('textarea', { id: 'writing', attributes: { placeholder: '여기에 당신의 이야기를 적어주세요…', spellcheck: false } });
    const status = el('span', { id: 'status', text: '글을 입력하면 그랜드피아노 연주가 시작돼요', attributes: { role: 'status' } });
    const count = el('span', { id: 'count', text: '0자' });
    const label = el('label', { className: 'sr-only', text: '글쓰기', attributes: { for: 'writing' } });
    const footer = el('div', { className: 'paper-footer' }, [status, count]);
    const element = el('div', { className: 'paper' }, [label, input, footer]);
    const updateCount = () => { count.textContent = `${Array.from(input.value).length.toLocaleString('ko-KR')}자`; };
    input.addEventListener('keydown', (event) => { if (PT.utils.isTypingKey(event)) onTyping(); });
    input.addEventListener('pointerdown', onActivate);
    input.addEventListener('input', () => { updateCount(); onChange(input.value); });
    return {
      element, focus: () => input.focus(),
      setText(value) { input.value = value; updateCount(); },
      setStatus(text) { status.textContent = text; }
    };
  };
})(window.PianoType);
