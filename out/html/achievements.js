(function () {
  'use strict';

  // Optional: folder with base-game icons named <achievement_id>.png,
  // e.g. 'img/achievements/base/'. Leave '' to use the star glyph.
  var BASE_ICON_DIR = '';

  // [achievement id (without "achievement_" prefix), title, description]
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

  // ------------------------------------------------------------------------
  // 1. Tab navigation

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

  // ------------------------------------------------------------------------
  // 2. Base game achievements

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderBaseAchievements(container) {
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

  // ------------------------------------------------------------------------
  // 3. Mod cards: split "<strong>Title</strong> - description" into
  //    .ach-title / .ach-subtitle (idempotent).

  function restructureModCards() {
    document.querySelectorAll('.ach').forEach(function (div) {
      var body = div.querySelector('.ach-body');
      if (!body || body.querySelector('.ach-title')) { return; }
      var strongEl = body.querySelector('strong');
      if (!strongEl) { return; }
      var badgeEl = body.querySelector('.ach-new');
      var subtitleText = '';
      var passedStrong = false;
      Array.from(body.childNodes).forEach(function (node) {
        if (node === strongEl) { passedStrong = true; return; }
        if (badgeEl && node === badgeEl) { return; }
        if (passedStrong) { subtitleText += node.textContent; }
      });
      subtitleText = subtitleText.replace(/^[\s\u2013\u2014-]+/, '').trim();
      body.innerHTML = '';
      var titleDiv = document.createElement('div');
      titleDiv.className = 'ach-title';
      titleDiv.appendChild(strongEl);
      if (badgeEl) { titleDiv.appendChild(badgeEl); }
      var subDiv = document.createElement('div');
      subDiv.className = 'ach-subtitle';
      subDiv.textContent = subtitleText;
      body.appendChild(titleDiv);
      body.appendChild(subDiv);
    });
  }

  // ------------------------------------------------------------------------
  
  function scan() {
    var lists = document.querySelectorAll('[data-ach-list="base"]:not([data-rendered])');
    for (var i = 0; i < lists.length; i++) {
      lists[i].setAttribute('data-rendered', '1');
      renderBaseAchievements(lists[i]);
    }
    restructureModCards();
  }

  function start() {
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
