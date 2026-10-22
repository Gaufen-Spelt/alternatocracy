(function () {
  'use strict';

  // Optional: folder with base-game icons named <achievement_id>.png,
  // e.g. 'img/achievements/base/'. Leave '' to use the star glyph.
  var BASE_ICON_DIR = '';

  // Folder for mod/horizon icons. Icons containing a "/" are used as-is.
  var ICON_DIR = 'img/achievements/';

  // ========================================================================
  // DATA
  // ========================================================================

  // BASE: [achievement id (without "achievement_" prefix), title, description]
  var BASE_ACHIEVEMENTS = [
    ["eiserne_front", "Eiserne Front", "Form the Iron Front."],
    ["civil_war", "Bürgerkrieg", "Enter a long civil war."],
    ["einigkeit", "Einigkeit", "Reach the end of the game without a civil war on easy."],
    ["einigkeit_und_recht", "Einigkeit und Recht", "Reach the end of the game without a civil war on normal."],
    ["einigkeit_und_recht_und_freiheit", "Einigkeit und Recht und Freiheit", "Reach the end of the game without a civil war on hard."],
    ["schwarz_rot_gold", "Schwarz-Rot-Gold", "Reach the end of the game without a civil war on historical mode."],
    ["in_kummernis_und_dunkelheit", "In Kümmernis und Dunkelheit", "Reach the end of the game without a civil war on the hardest possible custom difficulty."],
    ["victory_for_the_republic", "Sieg für die Republik", "Win the civil war."],
    ["bollwerk_der_demokratie", "Bollwerk der Demokratie", "Resist the Prussian Coup and win."],
    ["red_tzar_of_prussia", "Roter Zar von Preußen", "Otto Braun is President, Chancellor, and Minister-President."],
    ["einheitsfront", "Einheitsfront", "Form a government consisting of the SPD and KPD."],
    ["einheitsfront_2", "Sieg für die Einheitsfront", "Form a Left Front that survives the KPD demands."],
    ["volksfront", "Volksfront", "Form a government consisting of the SPD, KPD, Z, and DDP."],
    ["grosse_volksfront", "Große Volksfront", "With Joos leading the Center Party and the Conciliators leading the KPD, form a government consisting of the SPD, KPD, Z, and DDP."],
    ["volksfront_2", "Sieg für die Volksfront", "Form a Popular Front that survives the KPD demands."],
    ["constitutional_coalition", "Verfassungskoalition", "Form a “constitutional coalition”."],
    ["weimar_coalition", "Weimarer Koalition", "Form a Weimar coalition."],
    ["majority_party", "Mehrheitspartei", "Form an SPD-only majority government."],
    ["minderheitsregierung", "Minderheitsregierung", "Form an SPD minority government."],
    ["volkspartei", "Volkspartei", "The SPD is a People's Party."],
    ["sohn_seiner_klasse", "Sohn seiner Klasse", "Ernst Thälmann is either president or chancellor."],
    ["rote_millionar", "Der rote Millionär", "Willi Münzenberg is president."],
    ["versohnler", "Versöhnler", "The Conciliators lead the KPD."],
    ["deport_hitler", "Der österreichische Gefreite", "Deported Hitler."],
    ["wirtschaftspolitik", "Wirtschaftspolitik", "Enact an economic plan."],
    ["wirtschaftswunder", "Wirtschaftswunder", "After 1932, have unemployment less than in 1928, inflation below 5%, and a budget surplus."],
    ["wirtschaftsexperiment", "Wirtschaftsexperiment", "Enact two different economic plans."],
    ["freie_marktwirtschaft", "Freie Marktwirtschaft", "Survive to the end of the game without adopting an economic plan."],
    ["equality", "Gleichheit", "Pass reforms for women's rights."],
    ["hirschfeld", "Hirschfeld", "Pass reforms for homosexual rights."],
    ["women_reichsbanner", "Mädchen in Uniform", "A woman's place is in the Reichsbanner."],
    ["anders_als_die_andern", "Anders als die Andern", "Sexual minorities will defend the Republic."],
    ["bruder_zur_sonne", "Brüder, zur Sonne, zur Freiheit", "Reduce unemployment, pause reparations, increase women's rights, elect an SPD president, and deport Hitler in one playthrough on at least normal difficulty."],
    ["die_rote_fahne", "Die Rote Fahne", "Join the KPD in their May Day march."],
    ["panik_im_mittelstand", "Panik im Mittelstand", "SPD new middle class support is at least 50%."],
    ["bauernrevolution", "Bauernrevolution", "SPD rural support is at least 50%."],
    ["katholischer_sozialismus", "Katholischer Sozialismus", "SPD Catholic support is at least 50%."],
    ["grosse_volkspartei", "Große Volkspartei", "All classes have at least 40% SPD support."],
    ["klassenkampf", "Klassenkampf", "SPD worker support is at least 80%, while middle-class and rural supports are less than 20%."],
    ["raterepublik", "Räterepublik", "Begin the transformation to a socialist economy."],
    ["polykrise", "Polykrise", "Survive a capital strike and a fascist coup."],
    ["syndikalismus", "Syndikalismus", "Support factory takeovers by the workers."],
    ["drei_pfeile", "Drei Pfeile", "Defeat a coup without a civil war."],
    ["ausnahmezustand", "Ausnahmezustand", "Use emergency powers to cancel elections."],
    ["eu", "Vereinigte Staaten von Europa", "Form a “European Union”."],
    ["heidelberger_programm", "Heidelberger Programm", "Achieve the goals of the SPD's Heidelberg Program: social welfare, judicial reform, women's rights in the workplace and family, progressive taxation, works councils, and the formation of a European Union."],
    ["verfassungsreform", "Verfassungsreform", "Pass a constitutional amendment."],
    ["zeppelin_kapitan", "Zeppelinkapitän", "Hugo Eckener has been elected president."],
    ["wahlrechts", "Wahlrechts für Frauen", "Marie Juchacz has been elected president."],
    ["bundesrepublik", "Bundesrepublik", "Konrad Adenauer or Kurt Schumacher has been elected president, and constitutional reforms have reduced presidential power."],
    ["republik_der_wissenschaft", "Republik der Wissenschaft", "Albert Einstein has been elected president."],
    ["arbeiter_von_wien", "Arbeiter von Wien", "SDAPÖ victory in Austria."],
    ["stolperstein", "Stolperstein", "We lost, but history might memorialize us..."]
  ];

  // MOD / HORIZON fields:
  //   id, title, desc, icon, section (mod only)
  //   cls     extra CSS class(es) on the card, e.g. 'ach-red'
  //   bg      inline background for the card (unlocked only)
  //   iconBg  inline background for the icon box (unlocked only)
  //   shadow  inline box-shadow (unlocked only)
  //   locked  overrides when locked: {title, desc, icon, cls}
  var MOD_ACHIEVEMENTS = [
    // ---- Grand achievements ----
    { section: 'Grand achievements', id: 'winterschwelen', title: 'Winterschwelen',
      desc: 'The cold and despairly winter envelops the landvolk...',
      icon: 'winterschwelen.png',
      bg: 'rgba(140,200,235,0.15)', iconBg: 'rgba(140,200,235,0.35)' },
    { section: 'Grand achievements', id: 'landlicher_zorn', title: 'Ländlicher Zorn',
      desc: 'Rural wrath engulfes Germany...',
      icon: 'landlicher_zorn.png',
      bg: 'rgba(46,79,46,0.15)', iconBg: 'rgba(20,20,20,0.35)' },
    { section: 'Grand achievements', id: 'karl_hepp_rlb', title: 'Landpopulistenurteil',
      desc: 'Karl Hepp has been elected as president of the Reichslandbund (RLB).',
      icon: 'karlhepprlb.png',
      bg: 'rgba(88,112,48,0.20)', iconBg: 'rgba(88,112,48,0.45)' },
    { section: 'Grand achievements', id: 'gesamtlandliche_vertretung', title: 'Gesamtlandliche Vertretung',
      desc: 'The Green Front encompasses the maximum amount of members possible.',
      icon: 'gesamtlandliche_vertretung.png',
      bg: 'linear-gradient(90deg,rgba(20,20,20,0.15) 0%,rgba(120,180,120,0.15) 33%,rgba(30,90,30,0.15) 66%,rgba(10,40,10,0.15) 100%)',
      iconBg: 'rgba(90,90,90,0.3)' },
    { section: 'Grand achievements', id: 'annahmeerklarung', title: 'Annahmeerklärung',
      desc: 'Republicans by the dishonority, not of the reason.',
      icon: 'annahmeerklarung.png',
      bg: 'rgba(15,35,70,0.15)', iconBg: 'rgba(15,35,70,0.35)' },
    { section: 'Grand achievements', id: 'herbstingwer', title: 'Herbstingwer',
      desc: 'Ernst Niekisch and his national socialists have survived the test of the time.',
      icon: 'herbstingwer.png',
      bg: 'rgba(225,135,25,0.15)', iconBg: 'rgba(225,135,25,0.35)' },
    { section: 'Grand achievements', id: 'schachtmatt', title: 'Schachtmatt',
      desc: "Survive Hjalmar Schacht's siege successfully.",
      icon: 'schachtmatt.png',
      bg: 'rgba(15,15,15,0.4)', iconBg: 'rgba(15,15,15,0.7)' },
    { section: 'Grand achievements', id: 'im_staub_der_zeit', title: 'Im Staub der Zeit',
      desc: 'Ultimate failure of the fortunes.',
      icon: 'im_staub_der_zeit.png',
      bg: 'rgba(128,0,0,0.94)', iconBg: 'rgba(225,135,25,0.35)' },
    { section: 'Grand achievements', id: 'die_uhr_bremst', title: 'Die Uhr Bremst',
      desc: 'Time slows down...',
      icon: 'hitler.png',
      cls: 'ach-uhrbremst',
      locked: { cls: 'ach-locked-hitler' } },
    { section: 'Grand achievements', id: 'liberalismus', title: 'United Liberalism',
      desc: 'Liberal movement has been unified.',
      icon: 'img/liberalismus.png',
      bg: 'linear-gradient(90deg,rgba(0,0,0,0.06),rgba(0,60,120,0.06))' },
    { section: 'Grand achievements', id: 'lambachreich', title: 'Großer Korporatismus',
      desc: 'Walther Lambach has managed to consolidate power under himself.',
      icon: 'lambachreich.jpg',
      bg: 'rgba(40,40,40,0.15)', iconBg: 'rgba(40,40,40,0.3)' },

    // ---- Minor achievements ----
    { section: 'Minor achievements', id: 'strelitz', title: 'Erste Welle',
      desc: 'Secure majority in Mecklenburg - Strelitz.',
      icon: 'strelitz.png',
      bg: 'rgba(200,0,0,0.1)', iconBg: 'rgba(200,0,0,0.25)' },
    { section: 'Minor achievements', id: 'ruhrland', title: 'Rheinland in Flammen',
      desc: 'Young Plan goes horribly wrong...',
      icon: 'ruhrland.png', cls: 'ach-red' },
    { section: 'Minor achievements', id: 'tyrole_danubia', title: 'Tirol-Donau-Pakt',
      desc: 'Italy and Germany have signed a non aggression treaty.',
      icon: 'tyrole_danubia.png',
      bg: 'rgba(0,146,70,0.1)', iconBg: 'rgba(0,146,70,0.25)' },
    { section: 'Minor achievements', id: 'new_axis', title: 'Achsenmächte',
      desc: 'New European counterweight.',
      icon: 'new_axis.jpg', cls: 'ach-red' },
    { section: 'Minor achievements', id: 'revolution_own', title: 'Revolution der drei Speere',
      desc: 'SPD has launched the revolution.',
      icon: 'revolution_own.png', cls: 'ach-red' },
    { section: 'Minor achievements', id: 'popular_frontier', title: 'Volksfront',
      desc: 'The Popular Front theses has been established.',
      icon: 'popular_frontier.png', cls: 'ach-red' },

    // ---- Unfinished / Unobtainable ----
    { section: 'Unfinished / Unobtainable achievements', id: 'jugendrevolution', title: 'Jugendrevolution',
      desc: 'Grandmaster Mahraun ascends the nationalist movement.',
      icon: 'jugendrevolution.png',
      bg: 'rgba(60,60,60,0.15)', iconBg: 'rgba(60,60,60,0.35)' },
    { section: 'Unfinished / Unobtainable achievements', id: 'neue_generation', title: 'Neue Generation',
      desc: 'Passing the mantle.',
      icon: 'neue_generation.png',
      bg: 'rgba(60,60,60,0.15)', iconBg: 'rgba(60,60,60,0.35)' },
    { section: 'Unfinished / Unobtainable achievements', id: 'zwei_patrioten', title: 'Zwei Patrioten – einer zu viel',
      desc: 'Only one shall lead the way.',
      icon: 'zwei_patrioten.png',
      bg: 'rgba(60,60,60,0.15)', iconBg: 'rgba(60,60,60,0.35)' },
    { section: 'Unfinished / Unobtainable achievements', id: 'volksgemeinschaft', title: 'Volksgemeinschaft',
      desc: 'All differences are none before Germany.',
      icon: 'volksgemeinschaft.png',
      bg: 'rgba(0,91,150,0.12)', iconBg: 'rgba(0,91,150,0.25)' },
    { section: 'Unfinished / Unobtainable achievements', id: 'christian_revolution', title: 'Kreuz und Arbeit',
      desc: 'Overcoming the German odds.',
      icon: 'christian_revolution.png',
      bg: 'rgba(212,175,55,0.12)', iconBg: 'rgba(212,175,55,0.3)' },
    { section: 'Unfinished / Unobtainable achievements', id: 'national_rejuvenation', title: 'Nationale Erneuerung',
      desc: 'Three pillars, two faiths, one nation - elevated above all differences.',
      icon: 'national_rejuvenation.png',
      bg: 'rgba(255,215,0,0.15)', iconBg: 'rgba(255,215,0,0.3)',
      shadow: 'inset 0 0 10px rgba(255,215,0,0.3)' },

    // ---- For future plans ----
    { section: 'For future plans', id: 'morgengrauen', title: 'Morgengrauen',
      desc: 'Across the western horizon, a dark dawn looms...',
      icon: 'francais.jpg',
      bg: 'rgba(45,12,18,0.5)', iconBg: 'rgba(85,20,30,0.65)' }
  ];

  var HORIZON_ACHIEVEMENTS = [
    { id: 'end', title: 'End', desc: 'Merely first page...',
      icon: 'end.png', cls: 'ach-end',
      locked: { desc: 'Is like opening the new chapter.' } },
    { id: 'spatialanomaly', title: 'Anomaly', desc: 'New divergence.',
      icon: 'stren2.png', cls: 'ach-glitch',
      locked: { desc: 'Anomaly in time.', icon: 'stren.png' } },
    { id: 'fatamorgana', title: 'Fata Morgana',
      desc: 'Far away somewhere, you might wanna ask your questions.',
      icon: 'fatamorgana.png', cls: 'ach-fatamorgana',
      locked: { desc: 'Insidiousness.' } },
    { id: 'firstwessel', title: 'Nocturnal', desc: 'New wessel.',
      icon: 'nocturnal.png', cls: 'ach-wessel',
      locked: { title: 'Breakthrough', desc: 'First gate of this world.', icon: 'firstwessel.png' } },
    { id: 'sanctuary', title: 'Zuflucht', desc: 'Take a close look again.',
      icon: 'psychosis.png', cls: 'ach-sanctuary',
      locked: { desc: 'Come back, when you find the true meaning behind this...', icon: 'sanctuary.png' } }
  ];

  var LISTS = { mod: MOD_ACHIEVEMENTS, horizon: HORIZON_ACHIEVEMENTS };

  window.BASE_ACHIEVEMENTS = BASE_ACHIEVEMENTS;
  window.MOD_ACHIEVEMENTS = MOD_ACHIEVEMENTS;
  window.HORIZON_ACHIEVEMENTS = HORIZON_ACHIEVEMENTS;

  // ========================================================================
  // 1. Tab navigation
  // ========================================================================

  function resolveSceneId(name) {
    var scenes = window.dendryUI.dendryEngine.game.scenes;
    if (scenes[name]) { return name; }
    var suffix = '.' + name;
    for (var id in scenes) {
      if (id.length > suffix.length &&
          id.slice(-suffix.length) === suffix) {
        return id;
      }
    }
    return null;
  }

  window.achGoTo = function (name) {
    var engine = window.dendryUI && window.dendryUI.dendryEngine;
    if (!engine) { return; }
    var id = resolveSceneId(name);
    if (!id) {
      console.log('achGoTo: no scene found matching "' + name + '"');
      return;
    }
    delete engine.choiceCache;
    engine.goToScene(id);
  };

  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-ach-goto]') : null;
    if (!btn) { return; }
    e.preventDefault();
    e.stopPropagation();
    window.achGoTo(btn.getAttribute('data-ach-goto'));
  });

  // ========================================================================
  // 2. Rendering
  // ========================================================================

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function iconPath(icon) {
    if (!icon) { return ''; }
    return icon.indexOf('/') >= 0 ? icon : ICON_DIR + icon;
  }

  // ---- Base (.bach) ----
  function renderBase(container) {
    var engine = window.dendryUI && window.dendryUI.dendryEngine;
    if (!engine || !engine.state) { return; }
    var Q = engine.state.qualities;
    var unlocked = 0;

    var cards = BASE_ACHIEVEMENTS.map(function (a) {
      var id = a[0];
      var got = !!Q['achievement_' + id];
      var isNew = !!Q['game_achievement_' + id];
      if (got) { unlocked++; }

      var icon = BASE_ICON_DIR
        ? '<img class="bach-icon" alt="" src="' + esc(BASE_ICON_DIR + id + '.png') +
          '" onerror="this.remove()">'
        : '';

      return '<div class="bach ' + (got ? 'bach-unlocked' : 'bach-locked') + '">' +
               '<div class="bach-icon-box">' + icon + '</div>' +
               '<div class="bach-body">' +
                 '<div class="bach-title"><strong>' + esc(a[1]) + '</strong>' +
                   (got && isNew ? '<span class="bach-new">New!</span>' : '') +
                 '</div>' +
                 '<div class="bach-subtitle">' + esc(a[2]) + '</div>' +
               '</div>' +
             '</div>';
    }).join('');

    container.innerHTML =
      '<div class="bach-summary">' + unlocked + ' / ' + BASE_ACHIEVEMENTS.length +
      ' unlocked</div>' + cards;
  }

  // ---- Mod / Horizon (.ach) ----
  function modCardHtml(a, Q) {
    var got = !!Q['achievement_' + a.id];
    var isNew = !!Q['game_achievement_' + a.id];
    var L = (!got && a.locked) ? a.locked : {};

    var title = L.title || a.title;
    var desc = L.desc || a.desc;
    var icon = iconPath(L.icon || a.icon);

    var cls = 'ach';
    if (a.cls) { cls += ' ' + a.cls; }
    if (!got) {
      cls += ' ach-locked';
      if (L.cls) { cls += ' ' + L.cls; }
    }

    var cardStyle = '';
    var iconStyle = '';
    if (got) {
      if (a.bg) { cardStyle += 'background:' + a.bg + ';'; }
      if (a.shadow) { cardStyle += 'box-shadow:' + a.shadow + ';'; }
      if (a.iconBg) { iconStyle += 'background:' + a.iconBg + ';'; }
    }

    return '<div class="' + esc(cls) + '"' +
             (cardStyle ? ' style="' + esc(cardStyle) + '"' : '') + '>' +
             '<div class="ach-icon-box"' +
               (iconStyle ? ' style="' + esc(iconStyle) + '"' : '') + '>' +
               '<img class="ach-icon" src="' + esc(icon) + '" alt="">' +
             '</div>' +
             '<div class="ach-body">' +
               '<div class="ach-title"><strong>' + esc(title) + '</strong>' +
                 (got && isNew ? '<span class="ach-new">New!</span>' : '') +
               '</div>' +
               '<div class="ach-subtitle">' + esc(desc) + '</div>' +
             '</div>' +
           '</div>';
  }

  function renderModList(container, kind) {
    var engine = window.dendryUI && window.dendryUI.dendryEngine;
    if (!engine || !engine.state) { return; }
    var Q = engine.state.qualities;
    var list = LISTS[kind];
    if (!list) { return; }

    var html = '';
    var lastSection = null;
    var unlocked = 0;
    list.forEach(function (a) {
      if (Q['achievement_' + a.id]) { unlocked++; }
      if (a.section && a.section !== lastSection) {
        html += '<h2 style="margin:20px 0 12px 0;">' + esc(a.section) + '</h2>';
        lastSection = a.section;
      }
      html += modCardHtml(a, Q);
    });

    container.innerHTML =
      '<div class="bach-summary">' + unlocked + ' / ' + list.length + ' unlocked</div>' + html;
  }

  // ========================================================================
  // 3. Popup registry (game.js Achievements.registry) from the same data
  // ========================================================================

  function mergeRegistry() {
    var A = window.Achievements;
    if (!A || !A.registry) { return; }

    BASE_ACHIEVEMENTS.forEach(function (b) {
      A.registry[b[0]] = {
        title: b[1],
        description: b[2],
        icon: BASE_ICON_DIR ? BASE_ICON_DIR + b[0] + '.png' : null
      };
    });
    MOD_ACHIEVEMENTS.concat(HORIZON_ACHIEVEMENTS).forEach(function (a) {
      A.registry[a.id] = {
        title: a.title,
        description: a.desc,
        icon: iconPath(a.icon)
      };
    });
  }

  // ========================================================================
  // 4. Scan + start
  // ========================================================================

  function scan() {
    var base = document.querySelectorAll('[data-ach-list="base"]:not([data-rendered])');
    for (var i = 0; i < base.length; i++) {
      base[i].setAttribute('data-rendered', '1');
      renderBase(base[i]);
    }
    ['mod', 'horizon'].forEach(function (kind) {
      var lists = document.querySelectorAll(
        '[data-ach-list="' + kind + '"]:not([data-rendered])');
      for (var j = 0; j < lists.length; j++) {
        lists[j].setAttribute('data-rendered', '1');
        renderModList(lists[j], kind);
      }
    });
  }

  function start() {
    mergeRegistry();
    var content = document.getElementById('content');
    if (!content) { return; }
    new MutationObserver(scan).observe(content, { childList: true, subtree: true });
    scan();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
