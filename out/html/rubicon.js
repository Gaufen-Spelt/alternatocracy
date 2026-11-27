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

// Hitler rubicon: grey, sapped, apathetic, depressed.
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

// KPD rubicon: saturated red, alert, paranoid, distrustful.
window.PARANOID_THEME = {
  light: {
    '--bg-color': '#9c5a5a', '--border-color': '#2a0000', '--content-bg-color': '#d9b8b2',
    '--text-color': '#2a0808', '--link-color': '#8a0000', '--tab-bg-color': '#b86a68',
    '--tab-color': '#a85e5c', '--tab-hover-color': '#cc8280', '--card-border-color': '#7a1f1f',
    '--card-bg-color': '#c48a86', '--em-color': '#600000', '--frame-color': '#7a0000'
  },
  dark: {
    '--bg-color': '#0d0000', '--border-color': '#ff2a2a', '--content-bg-color': '#1c0505',
    '--text-color': '#f0d0cc', '--link-color': '#ff4a3d', '--tab-bg-color': '#4a0d0d',
    '--tab-color': '#3d0a0a', '--tab-hover-color': '#5c1414', '--card-border-color': '#a01818',
    '--card-bg-color': '#3a0c0c', '--em-color': '#ff7a6e', '--frame-color': '#b01c1c'
  }
};

// One entry per rubicon. If several qualities are set, the first one listed wins.
// quality: dendry quality that switches it on
// cls:     class added to <body> (the CSS hooks onto this)
// level:   quality (0..1) controlling intensity; missing = full strength
window.RUBICON_THEMES = [
  { quality: 'hitler_rubicon', cls: 'ominous',  palette: window.OMINOUS_THEME,  level: 'ominous_level' },
  { quality: 'kpd_rubicon',    cls: 'paranoid', palette: window.PARANOID_THEME, level: 'ominous_level' }
];

function _hexToRgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
  var n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function _mixColors(a, b, t) {
  var A = _hexToRgb(a), B = _hexToRgb(b);
  return 'rgb(' + A.map(function (v, i) { return Math.round(v + (B[i] - v) * t); }).join(',') + ')';
}

window.applyOminousTheme = function (force) {
  var Q = dendryUI.dendryEngine.state.qualities;
  var mode = document.body.classList.contains('dark-mode') ? 'dark' : 'light';

  var theme = null;
  for (var i = 0; i < window.RUBICON_THEMES.length; i++) {
    if (Q[window.RUBICON_THEMES[i].quality] == 1) { theme = window.RUBICON_THEMES[i]; break; }
  }
  var lvl = theme ? Q[theme.level] : 0;
  var x = theme ? Math.min(1, Math.max(0, lvl === undefined ? 1 : lvl)) : 0;

  var key = mode + ':' + (theme ? theme.cls : '') + ':' + x;
  if (!force && key === window.__themeKey) return;   // nothing changed
  window.__themeKey = key;

  window.RUBICON_THEMES.forEach(function (t) {
    document.body.classList.toggle(t.cls, t === theme);
  });

  var style = document.body.style;
  var base = window.THEME_DEFAULTS[mode];
  var target = theme && theme.palette[mode];
  for (var v in base) {
    if (!target) {
      style.removeProperty(v);                        // reset to CSS defaults
    } else {
      style.setProperty(v, _mixColors(base[v], target[v], x));
    }
  }
};
