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
  'DBP': '#1fe955',
  'VRP': '#2F4F4F',
  'SRPD': '#7A3E9D',
  'SD': '#E8707E',
  'VSRPD': '#B04A8F',
  'SAPD': '#A52A2A'
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
  'DBP': 'German Farmers\' Party (Deutsches Bauernpartei). A center-right agrarian party advocating for rural interests, agricultural protectionism, and cooperation with democratic coalition governments.',
  'VRP': 'Reich Party for Civil Rights and Deflation',
  'SRPD': 'Social Republican Party of Germany. A breakaway party of the SPD\'s neorevisionists, committed to the militant defense of the republic.',
  'SD': 'Social Party of Germany. A breakaway party of the SPD\'s reformists, favoring gradual reform and governing beyond the working class.',
  'VSRPD': 'United Social-Republican Party of Germany. A merger of the reformists and neorevisionists who left the SPD.',
  'SAPD': 'Socialist Workers\' Party of Germany (Sozialistische Arbeiterpartei Deutschlands). A left-wing socialist centrist party formed by a merger of the Left USPD and right-wing KPD opposition, advocating for a united working-class front against fascism.'
};

// Tooltip content for political ideologies.

window.ideologyInfo = {
  'Social Democracy': 'One of the two mainstream pillars of the Marxist movement, standing on the right of the movement and advocating for the radical transformation of the economy through peaceful means.',
  'Social Democracy (Revolutionary)': 'Leftist Social Democracy representing anti-Bolshevik radical socialists and democratic socialists who advocate for immediate revolutionary acts and class war against the bourgeois establishment.',
  'Social Democracy (Center Marxist)': 'Kautskist Social Democracy representing center-aligned Marxists who believe that systemic transition may happen only under revolutionary conditions without adventurism or capitalist concessions.',
  'Laborism': 'Defenders of workers and their trade union gains against capitalism\'s invasive nature, organized largely through the ADGB umbrella without an active agenda for socialist economic transformation.',
  'Social Democracy (Reformist)': 'Bernsteinian Social Democrats standing on the right of the party, supporting reconciliation with the bourgeois establishment to advance socialist policies through gradual legislative reforms.',
  'Social Republicanism': 'A branch of the social democratic movement rejecting orthodox socialism in favor of a militant commitment to the republican order, state economic intervention, welfare expansion, and breaking up Junker estates.',
  'Ethical Socialism': 'A moral and philosophical approach to socialism rooted in ethical, humanitarian, and democratic principles rather than strict historical materialism.',
  'Socialist Patriotism': 'A break-off from the social republican movement emphasizing national-statist language, antimaterialism, patriotism, youth expansion, and the Volksgemeinschaft concept of cross-class German unity.'
};

window.colorizePartyNames = function(text) {
    var parties = Object.keys(window.partyColors);
    var ideologies = Object.keys(window.ideologyInfo);

    parties.sort(function(a, b) { return b.length - a.length; });
    ideologies.sort(function(a, b) { return b.length - a.length; });

    var esc = function(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };

    // Single pass over all party names (longest first)
    var partyRegex = new RegExp('\\b(' + parties.map(esc).join('|') + ')\\b', 'g');
    text = text.replace(partyRegex, function(match) {
        var color = window.partyColors[match];
        return '<span class="party-highlight" style="color:' + color +
               ';font-weight:bold;cursor:pointer;" ' +
               'onclick="window.showPartyTooltip(event, \'' + match + '\')">' +
               '<img class="party-icon" src="img/logo/' + encodeURIComponent(match.toLowerCase()) + '.jpg" alt="" ' +
               'style="height:1em;width:auto;vertical-align:-0.15em;margin-right:0.25em;" ' +
               'onerror="this.style.display=\'none\'">' +
               match + '</span>';
    });

    ideologies.forEach(function(ideology) {
        var regex = new RegExp('\\b(' + esc(ideology) + ')\\b', 'g');
        text = text.replace(regex, function(match) {
            return '<span class="ideology-highlight" style="color:#2E8B57;font-weight:bold;cursor:pointer;border-bottom: 1px dotted #2E8B57;" ' +
                   'onclick="window.showIdeologyTooltip(event, \'' + ideology + '\')">' +
                   match + '</span>';
        });
    });

    return text;
};

window.showPartyTooltip = function(evt, party) {
    evt.stopPropagation();
    window.hidePartyTooltip();

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

    setTimeout(function() {
        document.addEventListener('click', window.hidePartyTooltip, { once: true });
    }, 0);
};

window.showIdeologyTooltip = function(evt, ideology) {
    evt.stopPropagation();
    window.hidePartyTooltip();

    var info = window.ideologyInfo[ideology] || 'No details available.';

    var tooltip = document.createElement('div');
    tooltip.id = 'party-tooltip';
    tooltip.style.position = 'fixed';
    tooltip.style.width = '220px';
    tooltip.style.minHeight = '220px';
    tooltip.style.backgroundColor = '#fff';
    tooltip.style.border = '3px solid #2E8B57';
    tooltip.style.borderRadius = '4px';
    tooltip.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    tooltip.style.padding = '12px';
    tooltip.style.zIndex = '10000';
    tooltip.style.fontSize = '0.9em';
    tooltip.style.color = '#111';
    tooltip.style.overflowY = 'auto';

    var x = evt.clientX;
    var y = evt.clientY;
    var maxX = window.innerWidth - 240;
    var maxY = window.innerHeight - 240;
    tooltip.style.left = Math.min(x, maxX) + 'px';
    tooltip.style.top = Math.min(y, maxY) + 'px';

    var title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.style.color = '#2E8B57';
    title.style.marginBottom = '8px';
    title.style.borderBottom = '1px solid #ccc';
    title.style.paddingBottom = '4px';
    title.textContent = ideology;

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
