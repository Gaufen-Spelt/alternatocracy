(function() {
  var game;
  var ui;

  var DateOptions = {hour: 'numeric',
                 minute: 'numeric',
                 second: 'numeric',
                 year: 'numeric',
                 month: 'short',
                 day: 'numeric' };

var main = function(dendryUI) {
    ui = dendryUI;
    game = ui.game;

    var originalDisplayContent = ui.displayContent;
    ui.displayContent = function(paragraphs, faceImage) {
      var before = this.$content.children().length;
      var result = originalDisplayContent.call(this, paragraphs, faceImage);
      var sceneId = this.dendryEngine.state.sceneId;
      this.$content.children().slice(before)
        .addClass('live-content')
        .attr('data-live-scene', sceneId);
      return result;
    };


    // Flatten [+ Q.x +] content (arrays) into plain text for cards.
    function flat(x) {
      if (x === undefined || x === null) { return x; }
      if (typeof x === 'string') { return x; }
      var html = ui.contentToHTML.convertLine(x);
      return $('<span>').html(html).text();
    }

    function fixCards(cards) {
      if (!Array.isArray(cards)) { return cards; }
      return cards.map(function(c) {
        if (!c) { return c; }
        var copy = Object.assign({}, c);
        copy.title = flat(c.title);
        copy.subtitle = flat(c.subtitle);
        if (copy.unavailableSubtitle !== undefined) {
          copy.unavailableSubtitle = flat(c.unavailableSubtitle);
        }
        return copy;
      });
    }

    ['displayHand', 'displayDecks', 'displayPinnedCards', 'displayMyNewRow']
      .forEach(function(name) {
        var original = ui[name];
        ui[name] = function(cards, extra) {
          var r = original.call(ui, fixCards(cards), extra);
          $('#content > hr').not('#read-marker, .live-content').addClass('ui-divider');
          window.tagCards();
          if (name === 'displayPinnedCards') { window.buildLeadershipBoard(); }
          return r;
        };
      });


    var originalDisplayChoices = ui.displayChoices;
    ui.displayChoices = function(choices) {
      var clean = choices.map(function(c) {
        var copy = Object.assign({}, c);
        delete copy.image;
        return copy;
      });
      return originalDisplayChoices.call(ui, clean);
    };



// Frequency-based card draws.
    var DRAW_MODE = 'seeded';    // 'weighted' = random, weighted by frequency
                                 // 'highest'  = highest frequency always first
                                 // 'lowest'   = lowest frequency always first
                                 // 'seeded'   = weighted by frequency, but the dice
                                 //              come from Q.seed (repeatable)
    var SHARPEN = 1;             // weighted/seeded: 2-4 favours high frequency more

    // Small seeded PRNG (mulberry32): same input -> same number in [0,1)
    function seededRandom(seed) {
      var t = (seed >>> 0) + 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    function hashString(s) {
      var h = 2166136261;
      for (var i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    }

    var engineProto = Object.getPrototypeOf(ui.dendryEngine);
    engineProto._drawFromDeck = function(deckId) {
      var deck = this.game.scenes[deckId];
      var viewable = this._compileChoices(deck);
      if (!viewable) { return null; }

      var handCards = this.state.currentHands[this.state.sceneId] || [];
      var hand = handCards.map(function(c) { return c.id; });
      var game = this.game;
      var self = this;

      var pool = viewable.filter(function(c) {
        var s = game.scenes[c.id];
        return c.canChoose && s && s.isCard && hand.indexOf(c.id) < 0;
      });
      if (pool.length === 0) { return null; }

      function freq(c) {
        var s = game.scenes[c.id];
        var f = s.frequency;
        if (s.frequencyVar) { f = self._runExpression(s.frequencyVar); }
        if (f === null) { return Infinity; }
        if (f === undefined || isNaN(f)) { return 100; }
        return Math.max(0, f);
      }

      if (DRAW_MODE === 'highest' || DRAW_MODE === 'lowest') {
        var pick = pool[0], pickF = freq(pool[0]);
        for (var i = 1; i < pool.length; i++) {
          var f = freq(pool[i]);
          if ((DRAW_MODE === 'highest' && f > pickF) ||
              (DRAW_MODE === 'lowest' && f < pickF)) {
            pick = pool[i]; pickF = f;
          }
        }
        return pick;
      }

      var inf = pool.filter(function(c) { return freq(c) === Infinity; });
      if (inf.length) { return inf[0]; }

      var weights = pool.map(function(c) { return Math.pow(freq(c), SHARPEN); });
      var total = weights.reduce(function(a, b) { return a + b; }, 0);

      // the dice roll: from Q.seed (seeded) or the engine RNG (weighted)
      var roll;
      if (DRAW_MODE === 'seeded') {
        var seed = Number(this.state.qualities.seed) || 0;
        roll = seededRandom(seed + hashString(deckId) + handCards.length * 7919);
      } else {
        roll = this.random.random();
      }

      if (total <= 0) { return pool[Math.floor(roll * pool.length)]; }
      var r = roll * total;
      for (var j = 0; j < pool.length; j++) {
        r -= weights[j];
        if (r < 0) { return pool[j]; }
      }
      return pool[pool.length - 1];
    };



  
  };

  var TITLE = "Weimar History: An Alternate Perspective" + '_' + "GaufenSpelt";


  window.showStats = function() {
    if (window.dendryUI.dendryEngine.state.sceneId.startsWith('library')) {
        window.dendryUI.dendryEngine.goToScene('backSpecialScene');
    } else {
        window.dendryUI.dendryEngine.goToScene('library');
    }
  };

  window.showCredits = function() {
    if (window.dendryUI.dendryEngine.state.sceneId.startsWith('credits')) {
        window.dendryUI.dendryEngine.goToScene('backSpecialScene');
    } else {
        window.dendryUI.dendryEngine.goToScene('credits');
    }
  };
  
    window.updateSandboxLink = function() {
    var sandboxLink = document.getElementById('sandbox-link');
    if (!sandboxLink) return;
    var sandbox = window.dendryUI.dendryEngine.state.qualities.sandbox;
    sandboxLink.style.display = (sandbox === 1) ? 'inline' : 'none';
  };

  window.showSandbox = function() {
      if (window.dendryUI.dendryEngine.state.sceneId.startsWith('sandbox')) {
          window.dendryUI.dendryEngine.goToScene('backSpecialScene');
      } else {
          window.dendryUI.dendryEngine.goToScene('sandbox');
      }
  };

  // TODO: update audio displays
  window.updateAudio = function(song) {
      var now_playing = document.getElementById('currently_playing');
      if (song) {
          var a = song.split('/');
          now_playing.textContent = a[a.length-1];
      } else {
          var s = window.dendryUI.currentAudioURL;
          var a = s.split('/');
          now_playing.textContent = a[a.length-1];
      }
  };

  // sets the volume
  window.setVolume = function(volume) {
      if (window.dendryUI.currentAudio) {
          window.dendryUI.volume = volume/100;
          window.dendryUI.currentAudio.volume = volume/100;
      }
  };

  // go to the next song - this just sets the time to 9999 lol.
  window.shuffle = function() {
      if (window.dendryUI.currentAudio) {
          window.dendryUI.currentAudio.currentTime = 9999;
      }
  };

  // toggles pause or play of music
  window.togglePausePlay = function() {
      if (window.dendryUI.currentAudio) {
          if (window.dendryUI.currentAudio.paused) {
            window.dendryUI.currentAudio.play();
            document.getElementById('pause-button-image').style.display = "inline";
            document.getElementById('play-button-image').style.display = "none";
            document.getElementById('pause-button');
            document.getElementById('pause-button-text').textContent = "Pause";
          } else {
            window.dendryUI.currentAudio.pause();
            document.getElementById('play-button-image').style.display = "inline";
            document.getElementById('pause-button-image').style.display = "none";
            document.getElementById('pause-button-text').textContent = "Play";
          }
      }
  };
  
  window.showOptions = function() {
      var save_element = document.getElementById('options');
      window.populateOptions();
      save_element.style.display = "block";
      if (!save_element.onclick) {
          save_element.onclick = function(evt) {
              var target = evt.target;
              var save_element = document.getElementById('options');
              if (target == save_element) {
                  window.hideOptions();
              }
          };
      }
  };

  window.hideOptions = function() {
      var save_element = document.getElementById('options');
      save_element.style.display = "none";
  };

  window.disableBg = function() {
      window.dendryUI.disable_bg = true;
      document.body.style.backgroundImage = 'none';
      window.dendryUI.saveSettings();
  };

  window.enableBg = function() {
      window.dendryUI.disable_bg = false;
      window.dendryUI.setBg(window.dendryUI.dendryEngine.state.bg);
      window.dendryUI.saveSettings();
  };

  window.disableAnimate = function() {
      window.dendryUI.animate = false;
      window.dendryUI.saveSettings();
  };

  window.enableAnimate = function() {
      window.dendryUI.animate = true;
      window.dendryUI.saveSettings();
  };

  window.disableAnimateBg = function() {
      window.dendryUI.animate_bg = false;
      window.dendryUI.saveSettings();
  };

  window.enableAnimateBg = function() {
      window.dendryUI.animate_bg = true;
      window.dendryUI.saveSettings();
  };

  window.disableAudio = function() {
      window.dendryUI.toggle_audio(false);
      window.dendryUI.saveSettings();
  };

  window.enableAudio = function() {
      window.dendryUI.toggle_audio(true);
      window.dendryUI.saveSettings();
  };

  window.enableImages = function() {
      window.dendryUI.show_portraits = true;
      window.dendryUI.saveSettings();
  };

  window.disableImages = function() {
      window.dendryUI.show_portraits = false;
      window.dendryUI.saveSettings();
  };

  window.enableLightMode = function() {
      window.dendryUI.dark_mode = false;
      document.body.classList.remove('dark-mode');
      window.dendryUI.saveSettings();
      window.applyOminousTheme();
  };
  window.enableDarkMode = function() {
      window.dendryUI.dark_mode = true;
      document.body.classList.add('dark-mode');
      window.dendryUI.saveSettings();
      window.applyOminousTheme();
  };

  // populates the checkboxes in the options view
  window.populateOptions = function() {
    var disable_bg = window.dendryUI.disable_bg;
    var animate = window.dendryUI.animate;
    var disable_audio = window.dendryUI.disable_audio;
    var show_portraits = window.dendryUI.show_portraits;
    if (disable_bg) {
        $('#backgrounds_no')[0].checked = true;
    } else {
        $('#backgrounds_yes')[0].checked = true;
    }
    if (animate) {
        $('#animate_yes')[0].checked = true;
    } else {
        $('#animate_no')[0].checked = true;
    }
    if (disable_audio) {
        $('#audio_no')[0].checked = true;
    } else {
        $('#audio_yes')[0].checked = true;
    }
    if (show_portraits) {
        $('#images_yes')[0].checked = true;
    } else {
        $('#images_no')[0].checked = true;
    }
    if (window.dendryUI.dark_mode) {
        $('#dark_mode')[0].checked = true;
    } else {
        $('#light_mode')[0].checked = true;
    }
  };


  // Party name -> color mapping.

window.partyColors = {
  'SPD': '#E3000F',
  'DNVP': '#003366',
  'Zentrum': '#000000',
  'Z': '#000000',
  'KPD': '#8B0000',
  'DVP': '#B8860B',
  'DDP': '#FFD700',
  'WP': '#8B4513',
  'BVP': '#4682B4',
  'NSDAP': '#8B5A00',
  'CNBLP': '#556B2F',
  'DBP': '#A0522D',
  'VRP': '#2F4F4F',
  'SRPD': '#7A3E9D',
  'SD': '#E8707E',
  'VSRPD': '#B04A8F'
};

// Tooltip content for each party.

window.partyInfo = {
  'SPD': 'Social Democratic Party of Germany',
  'DNVP': 'German National People\'s Party',
  'Zentrum': 'Centre Party',
  'Z': 'Centre Party',
  'KPD': 'Communist Party of Germany',
  'DVP': 'German People\'s Party',
  'DDP': 'German Democratic Party',
  'WP': 'Reich Party of the German Middle Class',
  'BVP': 'Bavarian People\'s Party',
  'NSDAP': 'National Socialist German Workers\' Party',
  'CNBLP': 'Christian-National Peasants\' and Farmers\' Party',
  'DBP': 'German Farmers\' Party',
  'VRP': 'Reich Party for Civil Rights and Deflation',
  'SRPD': 'Social Republican Party of Germany. A breakaway party of the SPD\'s neorevisionists, committed to the militant defense of the republic.',
  'SD': 'Social Party of Germany. A breakaway party of the SPD\'s reformists, favoring gradual reform and governing beyond the working class.',
  'VSRPD': 'United Social-Republican Party of Germany. A merger of the reformists and neorevisionists who left the SPD.'
};

// Wraps recognized party abbreviations in colored, tooltip-triggering spans.
window.colorizePartyNames = function(text) {
    var parties = Object.keys(window.partyColors);
    // Sort longest-first so e.g. "DVP" doesn't clip inside "DDVP"-like edge cases
    parties.sort(function(a, b) { return b.length - a.length; });

    parties.forEach(function(party) {
        var color = window.partyColors[party];
        // \b word boundaries so we don't match inside other words
        var regex = new RegExp('\\b(' + party.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')\\b', 'g');
        text = text.replace(regex, function(match) {
            return '<span class="party-highlight" style="color:' + color +
                   ';font-weight:bold;cursor:pointer;" ' +
                   'onclick="window.showPartyTooltip(event, \'' + party + '\')">' +
                   match + '</span>';
        });
    });
    return text;
};

  window.showPartyTooltip = function(evt, party) {
    evt.stopPropagation();
    window.hidePartyTooltip(); // remove any existing one first

    var info = window.partyInfo[party] || 'No details available.';
    var color = window.partyColors[party] || '#333';

    var tooltip = document.createElement('div');
    tooltip.id = 'party-tooltip';
    tooltip.style.position = 'fixed';
    tooltip.style.width = '220px';
    tooltip.style.minHeight = '220px';
    tooltip.style.backgroundColor = '#fff';
    tooltip.style.border = '3px solid ' + color;
    tooltip.style.borderRadius = '4px';
    tooltip.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    tooltip.style.padding = '12px';
    tooltip.style.zIndex = '10000';
    tooltip.style.fontSize = '0.9em';
    tooltip.style.color = '#111';
    tooltip.style.overflowY = 'auto';

    // Position near the click, keeping it on-screen
    var x = evt.clientX;
    var y = evt.clientY;
    var maxX = window.innerWidth - 240;
    var maxY = window.innerHeight - 240;
    tooltip.style.left = Math.min(x, maxX) + 'px';
    tooltip.style.top = Math.min(y, maxY) + 'px';

    var title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.style.color = color;
    title.style.marginBottom = '8px';
    title.style.borderBottom = '1px solid #ccc';
    title.style.paddingBottom = '4px';
    title.textContent = party;

    var body = document.createElement('div');
    body.textContent = info;

    var closeBtn = document.createElement('div');
    closeBtn.textContent = '✕';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '6px';
    closeBtn.style.right = '10px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.onclick = window.hidePartyTooltip;

    tooltip.appendChild(closeBtn);
    tooltip.appendChild(title);
    tooltip.appendChild(body);
    document.body.appendChild(tooltip);

    // Close if clicking anywhere else
    setTimeout(function() {
        document.addEventListener('click', window.hidePartyTooltip, { once: true });
    }, 0);
};

window.hidePartyTooltip = function() {
    var existing = document.getElementById('party-tooltip');
    if (existing) {
        existing.parentNode.removeChild(existing);
    }
};






  

  window.change_var = function(variable, amount, min, max) {
    var q = dendryUI.dendryEngine.state.qualities;
    var newVal = (q[variable] || 0) + amount;
    if (min !== undefined) newVal = Math.max(min, newVal);
    if (max !== undefined) newVal = Math.min(max, newVal);
    q[variable] = newVal;
    window.updateSidebar();
};


  window.SidebarRemoval = function() {
  var page = document.getElementById('page');
  var wrapper = document.getElementById('tools_wrapper');
  var bottom = document.getElementById('bottom_panel');
  if (!page || !wrapper) return;
  wrapper.style.display = 'none';
  if (bottom) bottom.style.display = 'none';
  page.style.gridTemplateColumns = '1fr';
  page.style.gridTemplateAreas = '"main"';
};

window.SidebarAdd = function() {
  var page = document.getElementById('page');
  var wrapper = document.getElementById('tools_wrapper');
  var bottom = document.getElementById('bottom_panel');
  if (!page || !wrapper) return;
  wrapper.style.removeProperty('display');
  if (bottom) bottom.style.removeProperty('display');
  page.style.removeProperty('grid-template-columns');
  page.style.removeProperty('grid-template-areas');
};





  
  
  // This function allows you to modify the text before it's displayed.
  // E.g. wrapping chat-like messages in spans.
  window.displayText = function(text) {
    return window.colorizePartyNames(text);
  };

  // This function allows you to do something in response to signals.
  window.handleSignal = function(signal, event, scene_id) {
  if (signal === 'scene-arrival') window.updateBottomPanel();
};
  
  // This function runs on a new page. Right now, this auto-saves.
  window.onNewPage = function() {
    var scene = window.dendryUI.dendryEngine.state.sceneId;
    if (scene != 'root' && scene != "sandbox" && !window.justLoaded) {
        window.dendryUI.autosave();
    }
    if (window.justLoaded) {
        window.justLoaded = false;
    }
    window.updateBottomPanel();
  };

  window.refreshLiveContent = function() {
  var engine = dendryUI.dendryEngine;
  var sceneId = engine.state.sceneId;
  var scene = dendryUI.game.scenes[sceneId];
  if (!scene || scene.content === undefined) return;

  var $old = $('#content > .live-content[data-live-scene="' + sceneId + '"]')
               .not('.face-figure');
  if (!$old.length) return;

  var dc = engine._makeDisplayContent(scene.content, true);
  var $new = $(dendryUI.contentToHTML.convert(dc))
               .filter(function() { return this.nodeType === 1; });

  var oldText = $old.map(function() { return $(this).text(); }).get().join('|');
  var newText = $new.map(function() { return $(this).text(); }).get().join('|');
  if (oldText === newText) return;

  $new.addClass('live-content').attr('data-live-scene', sceneId);
  $old.first().before($new);
  $old.remove();
};




  



  window.scenesWithTag = function(tag) {
  return Object.keys((dendryUI.game.tagLookup || {})[tag] || {});
};

window.getTags = function(sceneId) {
  if (!window.__tagsByScene) {
    var lookup = dendryUI.game.tagLookup || {};
    var byScene = {};
    Object.keys(lookup).forEach(function(tag) {
      Object.keys(lookup[tag]).forEach(function(id) {
        (byScene[id] = byScene[id] || []).push(tag);
      });
    });
    window.__tagsByScene = byScene;
  }
  return window.__tagsByScene[sceneId] || [];
};

window.hasTag = function(id, tag) { return window.getTags(id).indexOf(tag) >= 0; };

window.tagCards = function() {
  $('#content a.card[card-id]').each(function() {
    var $li = $(this).closest('li');
    var tags = window.getTags($(this).attr('card-id'));
    tags.forEach(function(t) { $li.addClass('tag-' + t); });
    if (!tags.length) $li.addClass('tag-other');
  });
};








  window.updateLeaderImages = function() {
  var Q = dendryUI.dendryEngine.state.qualities;
  var name = Q.spd_party_leader;
  var img = name
    ? 'img/portraits/' + name.toString().toLowerCase().replace(/\s+/g, '_') + '.jpg'
    : null;
  var ids = Object.keys((dendryUI.game.tagLookup || {}).leader || {});
  ids.forEach(function(id) {
    var scene = dendryUI.game.scenes[id];
    if (scene) { scene.cardImage = img; scene.faceImage = img; }
  });
};




window.computePinnedDescription = function() {
  var Qs = dendryUI.dendryEngine.state.qualities;
  var a = Qs.advisor_action_timer, f = Qs.fundraiser_timer;
  var adv = a <= 0 ? 'Advisors - an action is available.'
    : 'Advisors - next action available in ' + a + (a == 1 ? ' turn.' : ' turns.');
  var fund = 'Next fundraiser in ' + f + (f == 1 ? ' turn.' : ' turns.');

  Qs.pinnedCardsDescription = fund;               // bottom row text
  $('.pinned-text-description').text(fund);
  $('.advisor-text-description').text(adv);       // advisor row heading
};

window.buildLeadershipBoard = function() {
  $('#content .leadership-board').remove();
  var $pinned = $('#content ul.pinned-cards');
  if (!$pinned.length) return;

  var $leader   = $pinned.find('li.tag-leader');
  var $advisors = $pinned.find('li.tag-advisor');
  if (!$leader.length && !$advisors.length) return;

  var lname = dendryUI.dendryEngine.state.qualities.spd_party_leader;
  if (lname && $leader.length) {
    $leader.find('img.card-img').attr('src',
      'img/portraits/' + lname.toString().toLowerCase().replace(/\s+/g, '_') + '.jpg');
  }

  var $desc = $('#content .pinned-text-description').first();
  var $board = $('<div>').addClass('leadership-board');
  $board.append('<hr>');

  if ($leader.length) {
    $board.append($('<ul>').addClass('pinned-cards leader-row').append($leader));
  }
  if ($advisors.length) {
    $board.append(
      $('<p>').attr('class', $desc.attr('class') || '')
        .removeClass('pinned-text-description')
        .addClass('advisor-text-description')
    );
    $board.append($('<ul>').addClass('pinned-cards advisor-row').append($advisors));
  }

  ($desc.length ? $desc : $pinned.first()).before($board);

  if (!$pinned.children().length) {
    $pinned.hide();
    $desc.hide();
  }

  window.computePinnedDescription();
};










  

  

  var BOTTOM_PANEL_SCENE = 'news';
window.newsTab = BOTTOM_PANEL_SCENE;

window.changeNewsTab = function(newTab, tabId) {
  document.querySelectorAll('#news_tab_container .tab_button').forEach(function(b) {
    b.className = b.className.replace(' active', '');
  });
  var btn = document.getElementById(tabId);
  if (btn) btn.className += ' active';
  window.newsTab = newTab;
  window.updateBottomPanel();
};

window.updateBottomPanel = function() {
  var panel = $('#bottom_panel_content');
  if (!panel.length) return;
  var scene = dendryUI.game.scenes[window.newsTab || BOTTOM_PANEL_SCENE];
  if (!scene) return;
  panel.empty();
  dendryUI.dendryEngine._runActions(scene.onArrival);
  var dc = dendryUI.dendryEngine._makeDisplayContent(scene.content, true);
  panel.append(dendryUI.contentToHTML.convert(dc));
  if (scene.onDisplay) dendryUI.dendryEngine._runActions(scene.onDisplay);
};

  // TODO: have some code for tabbed sidebar browsing.
window.updateSidebar = function() {
  $('#qualities').empty();
  var scene = dendryUI.game.scenes[window.statusTab];
  dendryUI.dendryEngine._runActions(scene.onArrival);
  var displayContent = dendryUI.dendryEngine._makeDisplayContent(scene.content, true);
  $('#qualities').append(dendryUI.contentToHTML.convert(displayContent));

  if (scene.onDisplay) {
      dendryUI.dendryEngine._runActions(scene.onDisplay);
  }

  if (window.statusTab === 'status' || window.statusTab === 'status.politics') {
      var Q = dendryUI.dendryEngine.state.qualities;
      var qualitiesEl = document.getElementById('qualities');
      var paragraphs = qualitiesEl.querySelectorAll('p');

      function attachPortrait(name, textPrefix, rowClass, imgClass) {
          if (!name) return;
          var para = Array.prototype.find.call(paragraphs, function(p) {
              return p.textContent.trim().indexOf(textPrefix) === 0;
          });
          if (!para) return;

          para.classList.add(rowClass);
          var slug = name.toString().toLowerCase().replace(/\s+/g, '_');
          var portrait = document.createElement('img');
          portrait.className = imgClass;
          portrait.onerror = function() { portrait.src = 'img/portraits/default.jpg'; };
          portrait.src = 'img/portraits/' + slug + '.jpg';
          para.appendChild(portrait);
      }

      var _lastFlagSlug = null;

      function attachFlag(slug, textPrefix, rowClass, imgClass) {
          if (!slug) return;
          var para = Array.prototype.find.call(paragraphs, function(p) {
              return p.textContent.trim().indexOf(textPrefix) === 0;
          });
          if (!para) return;

          para.classList.add(rowClass);

          if (slug === _lastFlagSlug) {
              var existing = para.querySelector('.' + imgClass);
              if (existing) return;
          }
          _lastFlagSlug = slug;

          var existing = para.querySelector('.' + imgClass);
          if (existing) existing.remove();

          var flagImg = document.createElement('img');
          flagImg.className = imgClass;
          flagImg.onerror = function() { flagImg.src = 'img/flags/weimar.jpg'; };
          flagImg.src = 'img/flags/' + slug + '.png';
          para.appendChild(flagImg);
      }

      attachFlag(Q.flag_slug, 'Flag:', 'country-name-row', 'status-flag');
      attachPortrait(Q.president, 'President:', 'president-row', 'status-portrait');
      attachPortrait(Q.chancellor, 'Chancellor:', 'chancellor-row', 'chancellor-portrait');
      attachPortrait(Q.spd_party_leader, 'SPD Leadership:', 'spdleader-row', 'spdleader-portrait');
      Array.prototype.forEach.call(qualitiesEl.querySelectorAll('.partyleader-row'), function(row) {
          if (row.querySelector('img')) { return; }
          var parts = row.textContent.split('Leadership:');
          var name = parts[1] && parts[1].trim();
          if (!name) { return; }

          var slug = name.toLowerCase().replace(/\s+/g, '_');
          var portrait = document.createElement('img');
          portrait.className = 'spdleader-portrait';
          portrait.onerror = function() { portrait.src = 'img/portraits/default.jpg'; };
          portrait.src = 'img/portraits/' + slug + '.jpg';
          row.appendChild(portrait);
      });
  }
};

  window.changeTab = function(newTab, tabId) {
      if (tabId == 'poll_tab' && dendryUI.dendryEngine.state.qualities.historical_mode) {
          window.alert('Polls are not available in historical mode.');
          return;
      }
      var tabButton = document.getElementById(tabId);
      var tabButtons = tabButton.closest('.tab_container').getElementsByClassName('tab_button');
      for (i = 0; i < tabButtons.length; i++) {
        tabButtons[i].className = tabButtons[i].className.replace(' active', '');
      }
      tabButton.className += ' active';
      window.statusTab = newTab;
      window.updateSidebar();
  };

  window.onDisplayContent = function() {
    window.updateSidebar();
    window.updateSandboxLink();
    window.updateBottomPanel();
    window.applyOminousTheme();
};

  /*
   * This function copied from the code for Infinite Space Battle Simulator
   *
   * quality - a number between max and min
   * qualityName - the name of the quality
   * max and min - numbers
   * colors - if true/1, will use some color scheme - green to yellow to red for high to low
   * */
  window.generateBar = function(quality, qualityName, max, min, colors) {
      var bar = document.createElement('div');
      bar.className = 'bar';
      var value = document.createElement('div');
      value.className = 'barValue';
      var width = (quality - min)/(max - min);
      if (width > 1) {
          width = 1;
      } else if (width < 0) {
          width = 0;
      }
      value.style.width = Math.round(width*100) + '%';
      if (colors) {
          value.style.backgroundColor = window.probToColor(width*100);
      }
      bar.textContent = qualityName + ': ' + quality;
      if (colors) {
          bar.textContent += '/' + max;
      }
      bar.appendChild(value);
      return bar;
  };

  


  window.justLoaded = true;
  window.statusTab = "status";
  window.dendryModifyUI = main;
  console.log("Modifying stats: see dendryUI.dendryEngine.state.qualities");

  window.increaseFontSize = function() {
        window.dendryUI.font_size += 0.1;
        var fs = window.dendryUI.font_size;
        var sidebar_fs = fs - 0.1;
        document.getElementById("content").setAttribute("style", "font-size: " + fs + "em;");
        document.getElementById("stats_sidebar").setAttribute("style", "font-size: " + sidebar_fs + "em;");
        document.getElementById('font_size_value').textContent = window.dendryUI.font_size.toFixed(1) + "em";
        window.dendryUI.saveSettings();
  }

  window.decreaseFontSize = function() {
        window.dendryUI.font_size -= 0.1;
        var fs = window.dendryUI.font_size;
        var sidebar_fs = fs - 0.1;
        document.getElementById("content").setAttribute("style", "font-size: " + fs + "em;");
        document.getElementById("stats_sidebar").setAttribute("style", "font-size: " + sidebar_fs + "em;");
        document.getElementById('font_size_value').textContent = window.dendryUI.font_size.toFixed(1) + "em";
        window.dendryUI.saveSettings();
  }

  window.onload = function() {
    window.dendryUI.loadSettings({show_portraits: true});
    window.updateSandboxLink();
    if (window.dendryUI.dark_mode) {
        document.body.classList.add('dark-mode');
    }
    if (window.dendryUI.font_size != 1.1) {
        var fs = window.dendryUI.font_size;
        var sidebar_fs = fs - 0.1;
        document.getElementById("content").setAttribute("style", "font-size: " + fs + "em;");
        document.getElementById("stats_sidebar").setAttribute("style", "font-size: " + sidebar_fs + "em;");
    }
    document.getElementById('font_size_value').textContent = window.dendryUI.font_size.toFixed(1) + "em";
    window.pinnedCardsDescription = "Advisor cards - actions are only usable once per 6 months.";
    window.applyOminousTheme();
  };

}());







window.Achievements = (function () {

  // ── Registry: ─────────────────────────
  // key: id, value: {title, description, icon}
    var REGISTRY = {
    ruhrland: {
      title: 'Rheinland in Fire',
      description: 'French reoccupy the Rheinland following catastrophe of Young Plan.',
      icon: 'img/achievements/ruhrland.png'
    },
    tyrole_danubia: {
      title: 'Tyrol - Danubian Pact',
      description: 'Italy and Germany has signed non aggression treaty.',
      icon: 'img/achievements/tyrole_danubia.png'
    },
    revolution_own: {
      title: 'Revolution of Three Spears',
      description: 'SPD has launched the revolution.',
      icon: 'img/achievements/revolution_own.png'
    },
    popular_frontier: {
      title: 'Popular Front',
      description: 'Popular Front theses has been established.',
      icon: 'img/achievements/popular_frontier.png'
    },
    winterschwelen: {
      title: 'Winterschwelen',
      description: 'The cold and despairly winter envelops the landvolk...',
      icon: 'img/achievements/winterschwelen.png'
    },
    landlicher_zorn: {
      title: 'Ländlicher Zorn',
      description: 'Rural wrath engulfes the Germany...',
      icon: 'img/achievements/landlicher_zorn.png'
    },
    karl_hepp_rlb: {
      title: 'Landpopulistenurteil',
      description: 'Karl Hepp has been elected as the Reichslandbund (RLB) president.',
      icon: 'img/achievements/karlhepprlb.png'
    },
    gesamtlandliche_vertretung: {
      title: 'Gesamtlandliche Vertretung',
      description: 'Green Front encompasses maximal amount of members possible.',
      icon: 'img/achievements/gesamtlandliche_vertretung.png'
    },
    annahmeerklarung: {
      title: 'Annahmeerklärung',
      description: 'Republicans by the dishonority, not of the reason.',
      icon: 'img/achievements/annahmeerklarung.png'
    },
    herbstingwer: {
      title: 'Herbstingwer',
      description: 'Ernst Niekisch and his national socialists have survived the test of the time.',
      icon: 'img/achievements/herbstingwer.png'
    },
    im_staub_der_zeit: {
      title: 'Im Staub der Zeit',
      description: 'Ultimate failure of the fortunes.',
      icon: 'img/achievements/im_staub_der_zeit.png'
    },
    liberalismus: {
      title: 'United Liberalism',
      description: 'Liberal movement has been unified.',
      icon: 'img/achievements/liberalismus.png'
    },
    lambachreich: {
      title: 'Großer Korporatismus',
      description: 'Walther Lambach consolidates all power under himself.',
      icon: 'img/achievements/lambachreich.png'
    },
    jugendrevolution: {
      title: 'Jugendrevolution',
      description: 'Grandmaster Mahraun ascends the nationalist movement.',
      icon: 'img/achievements/jugendrevolution.png'
    },
    neue_generation: {
      title: 'Neue Generation',
      description: 'Passing the mantle.',
      icon: 'img/achievements/neue_generation.png'
    },
    volksgemeinschaft: {
      title: 'Volksgemeinschaft',
      description: 'All differences are none before Germany.',
      icon: 'img/achievements/volksgemeinschaft.png'
    },
    christian_revolution: {
      title: 'Kreuz und Arbeit',
      description: 'Overcoming the German odds.',
      icon: 'img/achievements/christian_revolution.png'
    },
    national_rejuvenation: {
      title: 'Nationale Erneuerung',
      description: 'Three pillars, two faiths, one nation - elevated above all differences.',
      icon: 'img/achievements/national_rejuvenation.png'
    },
    sanctuary: {
      title: 'Zuflucht',
      description: 'Come back, when you find the true meaning behind this...',
      icon: 'img/achievements/sanctuary.png'
    }
  };


  var _queue = [];
  var _showing = false;
  var _container = null;

  function _init() {
  if (!_container) {
    _container = document.createElement('div');
    _container.id = 'achievement-popup-container';
  }
  if (_container.parentNode !== document.body) document.body.appendChild(_container);

  if (typeof _container.showPopover === 'function') {
    if (!_container.hasAttribute('popover')) _container.setAttribute('popover', 'manual');
    try {
      if (!_container.matches(':popover-open')) _container.showPopover();
    } catch (e) {}
  }
}

  function _getUnlocked() {
    var engine = window.dendryUI && window.dendryUI.dendryEngine;
    if (!engine) return {};
    if (!engine.state.achievementsUnlocked) {
      engine.state.achievementsUnlocked = {};
    }
    return engine.state.achievementsUnlocked;
  }

  function isUnlocked(id) {
    return !!_getUnlocked()[id];
  }

  function getAll() {
    return REGISTRY;
  }

  function getUnlockedList() {
    var unlocked = _getUnlocked();
    return Object.keys(REGISTRY).filter(function (id) { return unlocked[id]; });
  }

  // ── Unlock + queue a popup ────────────────────────────────────────
  function unlock(id, opts) {
    opts = opts || {};
    var def = REGISTRY[id] || {};
    var title = opts.title || def.title || id;
    var description = opts.description || def.description || '';
    var icon = opts.icon || def.icon || null;
    var allowRepeat = opts.allowRepeat === true;
    var duration = opts.duration != null ? opts.duration : 5000;

    var unlocked = _getUnlocked();
    if (unlocked[id] && !allowRepeat) {
      return false; // already unlocked, don't re-notify
    }
    unlocked[id] = true;

    _queue.push({ title: title, description: description, icon: icon, duration: duration });
    _runQueue();
    return true;
  }

  function _runQueue() {
    if (_showing || _queue.length === 0) return;
    _showing = true;
    var item = _queue.shift();
    _show(item, function () {
      _showing = false;
      _runQueue();
    });
  }

  function _show(item, onDone) {
    _init();

    var el = document.createElement('div');
    el.className = 'achievement-popup';

    var iconHtml = item.icon
      ? '<img class="achievement-popup-icon" src="' + item.icon + '" alt="">'
      : '<div class="achievement-popup-icon achievement-popup-icon-default">&#9733;</div>';

    el.innerHTML =
      iconHtml +
      '<div class="achievement-popup-text">' +
        '<div class="achievement-popup-label">Achievement Unlocked</div>' +
        '<div class="achievement-popup-title"></div>' +
        (item.description ? '<div class="achievement-popup-desc"></div>' : '') +
      '</div>';

    el.querySelector('.achievement-popup-title').textContent = item.title;
    if (item.description) {
      el.querySelector('.achievement-popup-desc').textContent = item.description;
    }

    _container.appendChild(el);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('active');
      });
    });

    var closeTimer = setTimeout(function () { _hide(el, onDone); }, item.duration);

    el.addEventListener('click', function () {
      clearTimeout(closeTimer);
      _hide(el, onDone);
    });
  }

  function _hide(el, onDone) {
    el.classList.remove('active');
    el.classList.add('leaving');
    setTimeout(function () {
      el.remove();
      if (onDone) onDone();
    }, 400);
  }

  return {
    unlock: unlock,
    isUnlocked: isUnlocked,
    getAll: getAll,
    getUnlockedList: getUnlockedList,
    registry: REGISTRY
  };

})();

var _achievePatchInterval = setInterval(function() {
  if (!window.dendryUI || !window.dendryUI.dendryEngine) return;
  clearInterval(_achievePatchInterval);

  var engine = window.dendryUI.dendryEngine;
  if (typeof engine.achieve !== 'function') {
    console.warn('Achievements: engine.achieve() not found — check dendry version.');
    return;
  }

  var _originalAchieve = engine.achieve.bind(engine);
  engine.achieve = function(name) {
    var alreadyHad = !!(this.state.achievements && this.state.achievements[name]);
    var result = _originalAchieve(name);

    if (!alreadyHad) {
      var def = Achievements.registry[name] || {};
      Achievements.unlock(name, {
        title: def.title || name,
        description: def.description || '',
        icon: def.icon || null
      });
    }
    return result;
  };
}, 100);
