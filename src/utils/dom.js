(function (PT) {
  'use strict';
  PT.utils.element = function (tag, options = {}, children = []) {
    const node = document.createElement(tag);
    if (options.id) node.id = options.id;
    if (options.className) node.className = options.className;
    if (options.text !== undefined) node.textContent = options.text;
    for (const [key, value] of Object.entries(options.attributes || {})) {
      node.setAttribute(key, String(value));
    }
    node.append(...children);
    return node;
  };
})(window.PianoType);
