window.THEME_DEFAULTS = {
  light: {
    '--bg-color': '#f3f3e3', '--border-color': '#000000', '--content-bg-color': '#f3f3f3',
    '--text-color': '#443311', '--link-color': '#990000', '--tab-bg-color': '#dedede',
    '--tab-color': '#dddddd', '--tab-hover-color': '#ececec', '--card-border-color': '#cccccc',
    '--card-bg-color': '#dddddd', '--em-color': '#4A0000', '--frame-color': '#888888'
  },
  dark: {
    '--bg-color': '#000000', '--border-color': '#ffffff', '--content-bg-color': '#242424',
    '--text-color': '#efefef', '--link-color': '#ff8080', '--tab-bg-color': '#555555',
    '--tab-color': '#505050', '--tab-hover-color': '#242424', '--card-border-color': '#4c4c4c',
    '--card-bg-color': '#3f3f3f', '--em-color': '#e08080', '--frame-color': '#888888'
  }
};

window.OMINOUS_THEME = {
  light: {
    '--bg-color': '#8f8a7a', '--border-color': '#1a0a0a', '--content-bg-color': '#b9b4a6',
    '--text-color': '#1c1410', '--link-color': '#5a0000', '--tab-bg-color': '#8a8474',
    '--tab-color': '#7d7768', '--tab-hover-color': '#a39d8c', '--card-border-color': '#5c564a',
    '--card-bg-color': '#9a9486', '--em-color': '#3a0000', '--frame-color': '#3a2a2a'
  },
  dark: {
    '--bg-color': '#050000', '--border-color': '#8a2a2a', '--content-bg-color': '#130b0b',
    '--text-color': '#cdbfb8', '--link-color': '#c0392b', '--tab-bg-color': '#2a1414',
    '--tab-color': '#231010', '--tab-hover-color': '#331a1a', '--card-border-color': '#4a2020',
    '--card-bg-color': '#2a1717', '--em-color': '#d46a5a', '--frame-color': '#5a1a1a'
  }
};

function _hexToRgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map(function(c) { return c + c; }).join('');
  var n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function _mixColors(a, b, t) {
  var A = _hexToRgb(a), B = _hexToRgb(b);
  return 'rgb(' + A.map(function(v, i) { return Math.round(v + (B[i] - v) * t); }).join(',') + ')';
}

window.applyOminousTheme = function(force) {
  var Q = dendryUI.dendryEngine.state.qualities;
  var active = (Q.hitler_rubicon == 1);
  var mode = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  var x = active ? Math.min(1, Math.max(0, Q.ominous_level === undefined ? 1 : Q.ominous_level)) : 0;

  var key = mode + ':' + x;
  if (!force && key === window.__themeKey) return;   // nothing changed
  window.__themeKey = key;
  document.body.classList.toggle('ominous', active);

  var style = document.body.style;
  var target = window.OMINOUS_THEME[mode];
  var base = window.THEME_DEFAULTS[mode];
  for (var v in target) {
    if (!active) {
      style.removeProperty(v);                        // reset to CSS defaults
    } else {
      style.setProperty(v, _mixColors(base[v], target[v], x));
    }
  }
};
