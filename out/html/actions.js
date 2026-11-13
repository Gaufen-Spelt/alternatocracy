// ---- Shared helpers --------------------------------------------------------
 
function isParty(party, targetParties) {
    if (!party || !targetParties) return false;
    var targets = Array.isArray(targetParties) ? targetParties : [targetParties];
    return targets.some(t => t && party.toLowerCase() === t.toLowerCase());
}
 
function PickHighest(list, prop) {
    var bestKey = null;
    var bestVal = -Infinity;
    for (var key in list) {
        if (!list[key].eligible) continue;
        var val = list[key][prop];
        if (typeof val !== 'number' || Number.isNaN(val)) continue;
        if (val > bestVal) {
            bestVal = val;
            bestKey = key;
        }
    }
    return bestKey;
}
 
function scaledWeight(baseWeight, currentValue, baseValue, maxMultiplier = 5) {
    var ratio = Math.min(baseValue / Math.max(currentValue, 1), maxMultiplier);
    return baseWeight * ratio;
}
 
function linearWeight(baseWeight, currentValue, baseValue, maxMultiplier = 5) {
    var ratio = Math.min(Math.max(currentValue, 0) / baseValue, maxMultiplier);
    return baseWeight * ratio;
}
 
function inIdeoRange(party, min, max) {
    var score = Q[party + '_ideo_score'];
    if (score === undefined) return false;
    return score >= min && score <= max;
}
 
function weakestClass(party) {
    var best = null, lowest = Infinity;
    for (const c of Q.classes) {
        var v = Q[c + '_' + party] || 0;
        if (v < lowest) { lowest = v; best = c; }
    }
    return best;
}
 
function addSupport(party, deltas) {
    for (var c in deltas) {
        var key = c + '_' + party;
        Q[key] = (Q[key] || 0) + deltas[c];
    }
}
 
Q.PARTY_DISPLAY_NAMES = {
    dnvp: 'The DNVP',   dvp: 'The DVP',     kpo: 'The KPO',     sl: 'The SL',
    sapd: 'The SAPD',   srpd: 'The SRPD',   ddp: Q.ddp_name,    z: 'The Zentrum',
    bvp: 'The BVP',     csrp: 'The CSRP',   wp: 'The WP',       cnbl: 'The CNBL',
    csvd: 'The CSVD',   vrp: 'The VRP',     kvp: 'The KVP',     dhp: 'The DHP',
    bb: 'The BB',       dvfp: 'The DVFP',   aspd: 'The ASPD',   vnr: 'The VNR',
    hl: 'The HL',       lb: 'The LB',       rdp: 'The RDP',     cvp: 'The CVP',
    sls: 'The SLS',     dtsp: 'The DTSP',   dbp: 'The DBP',     dsbp: 'The DSBP',
    dnf: 'The DNF',     rlb: 'The RLB',     faud: 'The FAUD',   kapd: 'The KAPD',
    pp: 'The PP',       gsrn: 'The GSRN',   uspd: 'The USPD'
};
 
function partyLabel(party) {
    return Q.PARTY_DISPLAY_NAMES[party] || party.toUpperCase();
}
 
Q.CLASS_TO_CAMPAIGN_FOCUS = {
    workers:     'workers',
    unemployed:  'unemployed',
    old_middle:  'old_middle',
    new_middle:  'new_middle',
    rural:       'rural',
    catholics:   'catholics',
};
 
function inReichGovernment(party) {
    return Q[party + '_in_government'] >= 1 || isChancellorParty(party) || holdsAnyMinistry(party);
}
 
function lobbyPressure() {
    return Math.max(0, Q.upper_tax_rates || 0) * 1.0
        + Math.max(0, Q.working_hours || 0) * 0.6
        + Math.max(0, Q.workers_safety || 0) * 0.5
        + (Q.ruhr_labor > 0 ? 2.0 : 0)
        + (Q.works_councils || 0) * 0.8
        + (Q.socialization || 0) * 1.2
        + (Q.cooperatives || 0) * 0.8
        + (Q.capital_strike_progress || 0) * 0.5;
}
 
// ---- Party actions ---------------------------------------------------------
 
Q.GLOBAL_PARTY_ACTIONS = {
 
    stahlhelm_recruitment: {
        ideoMin: 17, ideoMax: 20,
        weight: () => scaledWeight(1.30, Q.stahlhelm_strength, 1300),
        description: (party) => partyLabel(party) + ' has overseen Der Stahlhelm recruiting some of the disgruntled mittelstand and outclasses into their paramilitary, receiving some anonymous fundings alongside.',
        eligible: (party) => Q.sh_banned < 1 && isParty(party, 'dnvp'),
        timer: 10,
        apply: () => {
            Q.sh_strength += 50;
            Q.sh_militancy += 0.01;
        }
    },
 
    rfb_recruitment: {
        ideoMin: 1, ideoMax: 4,
        weight: () => scaledWeight(1.30, Q.rfb_strength, 1000),
        description: (party) => partyLabel(party) + ' has overseen the Roter Frontkämpferbund recruiting some of the disgruntled workers and unemployed into their paramilitary, receiving some anonymous fundings alongside.',
        eligible: (party) => Q.rfb_banned < 1 && isParty(party, 'kpd'),
        timer: 10,
        apply: () => {
            Q.rfb_strength += 50;
            Q.rfb_militancy += 0.01;
        }
    },
 
    nationalist_campaign: {
        ideoMin: 14, ideoMax: 20,
        weight: () => scaledWeight(0.75, Q.nationalism, 5),
        description: (party) => partyLabel(party) + ' has initiated a rally for nationalism and opposition against the republican order.',
        eligible: () => true,
        timer: 8,
        apply: () => { Q.nationalism += 2; }
    },
 
    socialist_campaign: {
        ideoMin: 1, ideoMax: 6,
        weight: () => scaledWeight(0.75, Q.socialism, 5),
        description: (party) => partyLabel(party) + ' has initiated a rally for socialism and opposition against the republican order.',
        eligible: () => true,
        timer: 8,
        apply: () => { Q.socialism += 3; }
    },
 
    democratic_campaign: {
        ideoMin: 7, ideoMax: 14,
        weight: () => scaledWeight(0.75, Q.pro_republic, 5),
        description: (party) => partyLabel(party) + ' has initiated a rally for republic and opposition against the extremist forces.',
        eligible: () => true,
        timer: 8,
        apply: () => { Q.pro_republic += 2; }
    },
 
    prussian_counter_prussia: {
        ideoMin: 16, ideoMax: 20,
        weight: () => linearWeight(4.00, Q.prussian_republicanization, 30),
        description: (party) => partyLabel(party) + ' has replaced republican and socialist officials in Prussia with nationalist judges and civil servants, steering the state police away from democratic values.',
        eligible: (party) => Q[party + '_in_government_prussia'] > 0,
        timer: 10,
        apply: () => {
            Q.prussian_republicanization -= 5;
            Q.prussian_police_loyalty -= 0.08;
            Q.prussian_police_strength += 30;
            Q.nationalism += 1;
        }
    },
 
    prussian_rfb_ban: {
        ideoMin: 14, ideoMax: 20,
        weight: () => scaledWeight(4.00, Q.rfb_strength * Q.rfb_militancy, 500),
        description: (party) => partyLabel(party) + ' has prohibited the communist RFB paramilitary across Prussia, dealing a severe blow to left-wing militant organization in the state.',
        eligible: (party) => Q[party + '_in_government_prussia'] > 0 && Q.rfb_banned < 1,
        timer: 12,
        apply: () => {
            Q.rfb_banned = 1;
            Q.rfb_strength -= 50;
            Q.rfb_militancy *= 0.95;
        }
    },
 
    prussian_rb_ban: {
        ideoMin: 17, ideoMax: 20,
        weight: () => scaledWeight(4.00, Q.rb_strength * Q.rb_militancy, 500),
        description: (party) => partyLabel(party) + ' has issued a total ban on the Reichsbanner, citing the pro-republican paramilitary as too dangerous to permit its public activities.',
        eligible: (party) => Q[party + '_in_government_prussia'] > 0 && Q.rb_banned < 1,
        timer: 12,
        apply: () => {
            Q.rb_banned = 1;
            Q.rb_strength -= 100;
            Q.rb_militancy *= 0.90;
        }
    },
 
    prussian_stahlhelm_ban: {
        ideoMin: 1, ideoMax: 5,
        weight: () => scaledWeight(4.00, Q.stahlhelm_strength * Q.stahlhelm_militancy, 500),
        description: (party) => partyLabel(party) + ' has banned Der Stahlhelm across Prussia, moving to suppress the nationalist paramilitary\'s activities in the state.',
        eligible: (party) => Q[party + '_in_government_prussia'] > 0 && Q.sh_banned < 1,
        timer: 12,
        apply: () => {
            Q.sh_banned = 1;
            Q.stahlhelm_strength -= 50;
            Q.stahlhelm_militancy *= 0.95;
        }
    },
 
    prussian_sa_ban: {
        ideoMin: 1, ideoMax: 11,
        weight: () => scaledWeight(4.00, Q.sa_strength * Q.sa_militancy, 500),
        description: (party) => partyLabel(party) + ' has banned the SA across Prussia, striking at the Nazi paramilitary\'s ability to organize in the state.',
        eligible: (party) => Q[party + '_in_government_prussia'] > 0 && Q.sa_banned < 1,
        timer: 12,
        apply: () => {
            Q.sa_banned = 1;
            Q.sa_strength -= 100;
            Q.sa_militancy *= 0.90;
        }
    },
 
    campaigning: {
        ideoMin: 1, ideoMax: 20,
        weight: (party) => {
            var oldR = Q['old_' + party + '_r'];
            var pct  = Q[party + '_votes'];
            if (!oldR || oldR <= 0) return 0;
            return Math.max(0, oldR - pct) / oldR * 5;
        },
        description: (party) => {
            var focusClass = weakestClass(party);
            var focusLabel = {
                workers: 'the industrial working class',
                unemployed: 'the unemployed',
                old_middle: 'shopkeepers and artisans',
                new_middle: 'white-collar workers and civil servants',
                rural: 'the countryside',
                catholics: 'the catholics',
            }[focusClass] || 'the electorate';
            return partyLabel(party) + ' has launched a campaign push targeting ' + focusLabel + ', trailing its last Reichstag result.';
        },
        eligible: (party) => {
            var oldR = Q['old_' + party + '_r'];
            var pct  = Q[party + '_votes'];
            return !!oldR && oldR > 0 && pct < oldR;
        },
        timer: 8,
        apply: (party) => {
            var oldR  = Q['old_' + party + '_r'];
            var pct   = Q[party + '_votes'];
            var range = Math.max(0, oldR - pct);
            var bonus = 10 * range / (range + 10);
 
            var bestClass = weakestClass(party);
            if (!bestClass) return;
 
            Q[party + '_campaign_target_class'] = bestClass;
            Q[bestClass + '_' + party] = (Q[bestClass + '_' + party] || 0) + bonus;
        }
    },
 
    // DVP
    dvp_capital_strike: {
        ideoMin: 1, ideoMax: 20,
        weight: () => scaledWeight(1.50, Q.capital_strike_progress, 20),
        description: (party) => partyLabel(party) + ' has protested against the presence of a socialist party in government, calling industrialists and financiers to strike against them.',
        eligible: (party) => {
            if (!isParty(party, 'dvp')) return false;
            return Q.parties.some(p => inReichGovernment(p) && Q[p + '_ideo_score'] < 8);
        },
        timer: 18,
        apply: () => {
            Q.capital_strike_progress += 2;
            Q.dvp_right += 20;
            Q.nationalism += 5;
        }
    },
 
    dvp_industrial_lobby: {
        ideoMin: 16, ideoMax: 20,
        weight: () => scaledWeight(1.00, lobbyPressure(), 10),
        description: (party) => {
            var reasons = [];
            if ((Q.socialization || 0) > 0)   reasons.push({ label: 'creeping socialization',          weight: Q.socialization * 1.2 });
            if ((Q.works_councils || 0) > 0)  reasons.push({ label: 'expanded works councils',         weight: Q.works_councils * 0.8 });
            if ((Q.workers_safety || 0) > 0)  reasons.push({ label: 'new workplace safety mandates',   weight: Q.workers_safety * 0.5 });
            if ((Q.working_hours || 0) > 0)   reasons.push({ label: 'shortened working hours',         weight: Q.working_hours * 0.6 });
            if (Q.ruhr_labor > 0)             reasons.push({ label: 'the Ruhr arbitration award',      weight: 2.0 });
            if ((Q.upper_tax_rates || 0) > 0) reasons.push({ label: 'rising upper tax rates',          weight: Q.upper_tax_rates * 1.0 });
            if ((Q.cooperatives || 0) > 0)    reasons.push({ label: 'the spread of cooperatives',      weight: Q.cooperatives * 0.8 });
 
            reasons.sort((a, b) => b.weight - a.weight);
 
            var cause;
            if (reasons.length === 0)      cause = 'mounting regulatory pressure';
            else if (reasons.length === 1) cause = reasons[0].label;
            else                           cause = reasons[0].label + ' and ' + reasons[1].label;
 
            return partyLabel(party) + ' has coordinated with major industrial associations to lobby against ' + cause + ', pressing for a friendlier business climate.';
        },
        eligible: (party) => isParty(party, 'dvp'),
        timer: 10,
        apply: () => {
            Q.dvp_right += Math.min(10, 3 + lobbyPressure() * 0.3);
            Q.capital_strike_progress = (Q.capital_strike_progress || 0) + 1;
        }
    },
};
 
function runPartyActions(party) {
    var timerKey = party + '_action_timer';
    var descKey = party + '_action_description';
 
    if (Q[timerKey] > 0 || Q[party + '_banned']) return;
 
    var pool = {};
    for (var key in Q.GLOBAL_PARTY_ACTIONS) {
        var action = Q.GLOBAL_PARTY_ACTIONS[key];
        if (!inIdeoRange(party, action.ideoMin, action.ideoMax)) continue;
 
        pool[key] = {
            weight: action.weight(party),
            eligible: action.eligible ? action.eligible(party) : true,
            timer: action.timer,
            description: action.description(party)
        };
    }
 
    var chosen = PickHighest(pool, 'weight');
 
    if (chosen === null) {
        Q[timerKey] = 6;
        Q[descKey] = partyLabel(party) + ' remains quiet for the time being, lacking viable options to act on.';
        return;
    }
 
    Q[timerKey] = pool[chosen].timer;
    Q[descKey] = pool[chosen].description;
    Q.GLOBAL_PARTY_ACTIONS[chosen].apply(party);
    Q[party + '_flavor_action_timer'] = 3;
}
 
// GOVT
 
Q.MINISTRIES = [
    'transport_minister', 'agriculture_minister', 'finance_minister',
    'economic_minister', 'labor_minister', 'justice_minister',
    'foreign_minister', 'interior_minister'
];
 
function holdsMinistry(party, ministry) {
    return Q[ministry + '_party'] && Q[ministry + '_party'].toLowerCase() === party.toLowerCase();
}
 
function holdsAnyMinistry(party) {
    return Q.MINISTRIES.some(m => holdsMinistry(party, m));
}
 
function isChancellorParty(party) {
    return Q.chancellor_party && Q.chancellor_party.toLowerCase() === party.toLowerCase();
}
 
// Generic builder: gate is (party) => bool.
// o: { ideoMin, ideoMax, weight, desc, eligible, timer, effects, support, extra }
// effects are applied as static additive deltas; anything conditional on live
// state belongs in extra(), which runs when the action fires.
function portfolioAction(gate, o) {
    return {
        ideoMin: o.ideoMin, ideoMax: o.ideoMax,
        weight: o.weight,
        description: (party) => partyLabel(party) + o.desc,
        eligible: (party) => gate(party) && (!o.eligible || o.eligible(party)),
        timer: o.timer || 10,
        apply: (party) => {
            for (var k in (o.effects || {})) Q[k] = (Q[k] || 0) + o.effects[k];
            addSupport(party, o.support || {});
            Q.government_stability += 0.5;
            if (o.extra) o.extra(party);
        }
    };
}
 
// One builder for every ministry-gated action.
function govAction(ministry, o) {
    return portfolioAction((party) => holdsMinistry(party, ministry), o);
}
 
function financeAction(o)     { return govAction('finance_minister', o); }
function interiorAction(o)    { return govAction('interior_minister', o); }
function foreignAction(o)     { return govAction('foreign_minister', o); }
function justiceAction(o)     { return govAction('justice_minister', o); }
function agricultureAction(o) { return govAction('agriculture_minister', o); }
 
// Science funding needs the Economic Ministry
function scienceAction(o)     { return govAction('economic_minister', o); }
 
// Education structure/curriculum need the Chancellery
function educationAction(o)   { return portfolioAction((party) => isChancellorParty(party), o); }
 
function clampLoyalty() {
    Q.interior_police_loyalty = Math.min(1, Math.max(0, Q.interior_police_loyalty || 0));
}
 
Q.GLOBAL_PARTY_GOVERNMENT_ACTIONS = {
 
    chancellery_agenda_push: {
        ideoMin: 1, ideoMax: 20,
        weight: () => 1.00,
        description: (party) => partyLabel(party) + ', holding the Chancellery, has pushed its legislative agenda through the cabinet.',
        eligible: (party) => isChancellorParty(party),
        timer: 8,
        apply: () => { Q.government_stability += 1; }
    },
 
    // Fallback for any minister with nothing better to do.
    ministry_routine: {
        ideoMin: 1, ideoMax: 20,
        weight: () => 0.30,
        description: (party) => partyLabel(party) + ' has kept its ministries running and the coalition cabinet aligned.',
        eligible: (party) => holdsAnyMinistry(party),
        timer: 8,
        apply: () => { Q.government_stability += 0.5; }
    },
 
    // ---- FINANCE: taxes -----------------------------------------------------
 
    fin_tax_rich: financeAction({
        ideoMin: 1, ideoMax: 8,
        weight: () => scaledWeight(2.50, Q.budget, 5),
        desc: ', at the Finance Ministry, has pushed through higher income and property taxes on the wealthy.',
        eligible: () => Q.upper_tax_rates <= 5,
        effects: { upper_tax_rates: 1, budget: 2, capital_strike_progress: 1, inflation: -0.6, economic_growth: -0.4, unemployed: 1 },
        support: { workers: 3, old_middle: -3, new_middle: -3 }
    }),
 
    fin_tax_consumption: financeAction({
        ideoMin: 9, ideoMax: 17,
        weight: () => scaledWeight(2.20, Q.budget, 5),
        desc: ', at the Finance Ministry, has raised consumption taxes to plug the budget hole, a burden that falls hardest on workers.',
        eligible: () => Q.lower_tax_rates <= 5,
        effects: { lower_tax_rates: 1, budget: 2, inflation: -0.4 },
        support: { workers: -4, unemployed: -3 }
    }),
 
    fin_shared_sacrifice: financeAction({
        ideoMin: 7, ideoMax: 13,
        weight: () => scaledWeight(2.30, Q.budget, 4),
        desc: ', at the Finance Ministry, has called for "shared sacrifice" and raised taxes across the board.',
        eligible: () => Q.upper_tax_rates <= 5 && Q.lower_tax_rates <= 5,
        effects: { upper_tax_rates: 1, lower_tax_rates: 1, budget: 3, unemployed: 2, inflation: -1.1, economic_growth: -0.6 },
        support: { workers: -3, old_middle: -3, new_middle: -3 }
    }),
 
    // ---- FINANCE: cuts ------------------------------------------------------
 
    fin_cut_rich: financeAction({
        ideoMin: 14, ideoMax: 20,
        weight: () => linearWeight(2.40, Q.budget, 8),
        desc: ', at the Finance Ministry, has cut income and property taxes on business and the propertied classes.',
        eligible: () => Q.budget >= 2 && Q.upper_tax_rates >= -5,
        effects: { upper_tax_rates: -1, budget: -2, inflation: 0.6, economic_growth: 0.4, dvp_right: 5 },
        support: { old_middle: 4, new_middle: 4, workers: -2 }
    }),
 
    fin_cut_overall: financeAction({
        ideoMin: 9, ideoMax: 16,
        weight: () => linearWeight(2.30, Q.budget, 10),
        desc: ', at the Finance Ministry, has delivered a broad tax cut, drawing applause from business and the middle classes.',
        eligible: () => Q.budget >= 3 && Q.upper_tax_rates >= -5 && Q.lower_tax_rates >= -5,
        effects: { upper_tax_rates: -1, lower_tax_rates: -1, budget: -3, inflation: 1, economic_growth: 0.6 },
        support: { new_middle: 4, old_middle: 4, workers: 3 }
    }),
 
    fin_cut_poor: financeAction({
        ideoMin: 1, ideoMax: 8,
        weight: () => linearWeight(2.20, Q.budget, 8),
        desc: ', at the Finance Ministry, has trimmed consumption taxes to relieve working-class households.',
        eligible: () => Q.budget >= 2 && Q.lower_tax_rates >= -5,
        effects: { lower_tax_rates: -1, budget: -2, inflation: 0.6, economic_growth: 0.4 },
        support: { workers: 5, unemployed: 3 }
    }),
 
    // ---- FINANCE: budget-neutral rebalancing --------------------------------
 
    fin_progressive_shift: financeAction({
        ideoMin: 1, ideoMax: 6,
        weight: () => 1.20,
        desc: ', at the Finance Ministry, has shifted the tax burden upward, raising levies on the rich while easing them for the poor.',
        eligible: () => Q.upper_tax_rates <= 5 && Q.lower_tax_rates >= -5,
        effects: { upper_tax_rates: 1, lower_tax_rates: -1, capital_strike_progress: 1 },
        support: { workers: 5, old_middle: -3, new_middle: -3 }
    }),
 
    fin_regressive_shift: financeAction({
        ideoMin: 15, ideoMax: 20,
        weight: () => 1.20,
        desc: ', at the Finance Ministry, has lowered taxes on the rich while raising consumption taxes, shifting the burden onto workers.',
        eligible: () => Q.upper_tax_rates >= -5 && Q.lower_tax_rates <= 5,
        effects: { upper_tax_rates: -1, lower_tax_rates: 1, dvp_right: 5 },
        support: { old_middle: 4, new_middle: 4, workers: -5 }
    }),
 
    // ---- FINANCE: tariffs ---------------------------------------------------
 
    fin_raise_tariffs: financeAction({
        ideoMin: 14, ideoMax: 20,
        weight: () => scaledWeight(2.00, Q.budget, 5) + linearWeight(0.30, Q.unemployed, 5, 3),
        desc: ', at the Finance Ministry, has raised import duties, shielding farmers and small producers while prices climb.',
        eligible: () => Q.tariffs < 5,
        effects: { tariffs: 1, budget: 2, inflation: 0.7, unemployed: 1.5, economic_growth: -0.4, west_relation: -1, east_relation: -1, reparations_negotiation: -2 },
        support: { rural: 4, old_middle: 3, workers: -4, unemployed: -4 }
    }),
 
    fin_lower_tariffs: financeAction({
        ideoMin: 1, ideoMax: 13,
        weight: () => linearWeight(1.80, Q.budget, 8) + linearWeight(0.30, Q.inflation, 3, 3),
        desc: ', at the Finance Ministry, has lowered import duties, cheapening basic goods and improving ties with trading partners.',
        eligible: () => Q.budget >= 2 && Q.tariffs > -5,
        effects: { tariffs: -1, budget: -2, inflation: -0.5, economic_growth: 0.4, west_relation: 1, east_relation: 1 },
        support: { workers: 4, unemployed: 4, rural: -5, old_middle: -3 }
    }),
 
    // ---- INTERIOR -----------------------------------------------------------
    // Weights: scaledWeight = bigger when the value is LOW, linearWeight = bigger when HIGH.
 
    int_strengthen_loyalty: interiorAction({
        ideoMin: 1, ideoMax: 12,
        weight: () => scaledWeight(1.80, Q.interior_police_loyalty * 10, 5),
        desc: ', at the Interior Ministry, has reformed police recruitment and training and removed known anti-republicans from the ranks.',
        eligible: () => Q.interior_police_loyalty < 0.95,
        effects: { interior_police_loyalty: 0.05, pro_republic: 0.5 },
        extra: clampLoyalty
    }),
 
    int_reactionary_purge: interiorAction({
        ideoMin: 16, ideoMax: 20,
        weight: () => linearWeight(1.60, Q.interior_police_loyalty * 10, 5),
        desc: ', at the Interior Ministry, has purged republican officials from the security services and promoted nationalist officers.',
        eligible: () => Q.interior_police_loyalty > 0.2,
        effects: { interior_police_loyalty: -0.06, nationalism: 1 },
        extra: clampLoyalty
    }),
 
    int_investigate_far_right: interiorAction({
        ideoMin: 1, ideoMax: 12,
        weight: () => linearWeight(1.50, Q.sa_strength, 500, 3) + linearWeight(0.50, Q.coup_progress, 5, 3),
        desc: ', at the Interior Ministry, has opened investigations into SA arms caches and plots against the constitution.',
        eligible: () => Q.interior_police_loyalty >= 0.5,
        effects: { sa_strength: -15, coup_progress: -0.5 },
        support: { workers: 1 }
    }),
 
    int_look_away: interiorAction({
        ideoMin: 17, ideoMax: 20,
        weight: () => 1.40,
        desc: ', at the Interior Ministry, has quietly shelved investigations into far-right paramilitaries.',
        effects: { sa_strength: 15, sh_strength: 10, coup_progress: 0.3 }
    }),
 
    int_ban_sa: interiorAction({
        ideoMin: 1, ideoMax: 11,
        weight: () => linearWeight(3.50, Q.sa_strength * Q.sa_militancy, 500),
        desc: ', at the Interior Ministry, has banned the SA nationwide.',
        eligible: () => Q.sa_banned < 1 && Q.interior_police_loyalty >= 0.5,
        effects: { sa_strength: -150, nationalism: -1 },
        extra: () => { Q.sa_banned = 1; Q.sa_militancy *= 0.85; }
    }),
 
    int_ban_rfb: interiorAction({
        ideoMin: 8, ideoMax: 20,
        weight: () => linearWeight(3.50, Q.rfb_strength * Q.rfb_militancy, 500),
        desc: ', at the Interior Ministry, has banned the Roter Frontkämpferbund nationwide.',
        eligible: () => Q.rfb_banned < 1,
        effects: { rfb_strength: -100 },
        extra: () => { Q.rfb_banned = 1; Q.rfb_militancy *= 0.90; }
    }),
 
    int_ban_rb: interiorAction({
        ideoMin: 17, ideoMax: 20,
        weight: () => linearWeight(3.00, Q.rb_strength * Q.rb_militancy, 500),
        desc: ', at the Interior Ministry, has banned the Reichsbanner, citing public order.',
        eligible: () => Q.rb_banned < 1,
        effects: { rb_strength: -100 },
        extra: () => { Q.rb_banned = 1; Q.rb_militancy *= 0.90; }
    }),
 
    // ---- AGRICULTURE --------------------------------------------------------
 
    ag_land_reform: agricultureAction({
        ideoMin: 1, ideoMax: 6,
        weight: () => linearWeight(1.80, Q.budget, 6),
        desc: ', at the Agriculture Ministry, has expropriated large estates and handed the land to farmworkers and smallholders.',
        eligible: () => Q.junker_land_reform_enabled == 1 && Q.judicial_reform >= 8 && Q.budget > 0 && Q.land_reform < 10,
        effects: { budget: -1, land_reform: 1, rural_policy: 1, rural_nsdap: -4, coup_progress: 1 },
        support: { rural: 5 }
    }),
 
    ag_finance: agricultureAction({
        ideoMin: 5, ideoMax: 16,
        weight: (party) => scaledWeight(1.00, Q['rural_' + party + '_normalized'], 20, 2) + linearWeight(0.30, Q.budget, 6, 2),
        desc: ', at the Agriculture Ministry, has expanded agricultural credit and crop insurance for small farmers.',
        eligible: () => Q.budget >= 1 && Q.agricultural_finance < 10,
        effects: { budget: -1, agricultural_finance: 1, rural_policy: 1, rural_nsdap: -3, economic_growth: 0.2 },
        support: { rural: 5 }
    }),
 
    ag_food_procurement: agricultureAction({
        ideoMin: 1, ideoMax: 8,
        weight: (party) => scaledWeight(1.00, Q['workers_' + party + '_normalized'], 25, 2) + linearWeight(0.30, Q.budget, 6, 2),
        desc: ', at the Agriculture Ministry, has bought up food staples and sold them cheaply to urban workers and the poor.',
        eligible: () => Q.budget >= 1 && Q.pro_consumer < 10,
        effects: { budget: -1, pro_consumer: 1, economic_growth: 0.2 },
        support: { workers: 4, unemployed: 4 }
    }),
 
    ag_state_buyer: agricultureAction({
        ideoMin: 1, ideoMax: 8,
        weight: () => 1.30,
        desc: ', at the Agriculture Ministry, has created a state grain monopoly, guaranteeing prices for farmers and stable bread prices for consumers.',
        eligible: () => Q.state_buyer < 1 && Q.budget >= 2 && Q.judicial_reform >= 4 && Q.junker_land_reform_enabled == 1,
        effects: { budget: -2, state_buyer: 1, rural_policy: 2, rural_nsdap: -3, capital_strike_progress: 1, economic_growth: 0.4 },
        support: { rural: 5, workers: 4, unemployed: 5 }
    }),
 
    // Right-wing counterpart: relief for the big estates (Osthilfe-style)
    ag_estate_relief: agricultureAction({
        ideoMin: 14, ideoMax: 20,
        weight: (party) => scaledWeight(1.00, Q['rural_' + party + '_normalized'], 20, 2) + linearWeight(0.40, Q.budget, 6, 2),
        desc: ', at the Agriculture Ministry, has channeled debt relief and subsidies to the large estates, to the delight of the agrarian lobby.',
        eligible: () => Q.budget >= 2,
        effects: { budget: -2, nationalism: 0.5 },
        support: { rural: 6, workers: -2 }
    }),
 
    // ---- FOREIGN ------------------------------------------------------------
 
    fp_improve_west: foreignAction({
        ideoMin: 1, ideoMax: 16,
        weight: () => scaledWeight(1.20, Q.west_relation, 5, 2),
        desc: ', at the Foreign Ministry, has pursued rapprochement with France and the Western Allies.',
        eligible: () => Q.west_relation < 8,
        effects: { west_relation: 2, reparations_negotiation: 1 }
    }),
 
    fp_improve_east: foreignAction({
        ideoMin: 1, ideoMax: 13,
        weight: () => scaledWeight(1.00, Q.east_relation, 4, 2),
        desc: ', at the Foreign Ministry, has reassured Poland and Czechoslovakia of Germany\'s peaceful intentions.',
        eligible: () => Q.east_relation < 8,
        effects: { east_relation: 2 }
    }),
 
    fp_soviet_aid: foreignAction({
        ideoMin: 1, ideoMax: 5,
        weight: () => scaledWeight(1.10, Q.soviet_relation, 4, 2),
        desc: ', at the Foreign Ministry, has extended economic aid to the Soviet Union in the spirit of Rapallo.',
        eligible: () => Q.budget >= 1 && Q.soviet_relation < 8,
        effects: { budget: -1, soviet_relation: 2, west_relation: -0.5 }
    }),
 
    fp_soviet_military: foreignAction({
        ideoMin: 15, ideoMax: 20,
        weight: () => scaledWeight(1.10, Q.soviet_relation, 4, 2),
        desc: ', at the Foreign Ministry, has traded aid to the Soviets for secret training and equipment for the Reichswehr.',
        eligible: () => Q.budget >= 1 && Q.soviet_relation < 8,
        effects: { budget: -1, soviet_relation: 1, reichswehr_militancy: 0.2, reichswehr_loyalty: 0.05, west_relation: -1 }
    }),
 
    fp_negotiate_versailles: foreignAction({
        ideoMin: 1, ideoMax: 13,
        weight: () => 1.80,
        desc: ', at the Foreign Ministry, has opened talks with the Western powers on Germany\'s remaining Versailles obligations.',
        eligible: () => Q.reparations > -2 && Q.reparations_negotiation < 3,
        effects: { west_relation: 1, reparations_negotiation: 1 },
        extra: () => {
            if (Q.pacifism >= 3) Q.reparations_negotiation += 1;
            if (Q.nationalism <= 50) Q.reparations_negotiation += 1;
            if (Q.west_relation >= 3) Q.reparations_negotiation += 1;
        }
    }),
 
    fp_reduce_reparations: foreignAction({
        ideoMin: 1, ideoMax: 20,
        weight: () => 3.00,
        desc: ', at the Foreign Ministry, has secured a pause on reparations payments from the Western Allies.',
        eligible: () => Q.reparations_negotiation >= 5 && Q.black_thursday_seen == 1 && Q.reparations > -2,
        effects: { west_relation: 1, budget: 1, economic_growth: 0.7, coup_progress: -1 },
        support: { workers: 4, old_middle: 3, new_middle: 3, rural: 3 },
        extra: () => { Q.reparations = -2; }
    }),
 
    fp_expose_rearmament: foreignAction({
        ideoMin: 1, ideoMax: 11,
        weight: () => 1.60,
        desc: ', at the Foreign Ministry, has exposed the secret rearmament program of the previous government.',
        eligible: () => Q.rearmament_exposed < 1,
        effects: { west_relation: 2, east_relation: 1, nationalism: -5, pro_republic: 5, rearmament_exposed: 1, reparations_negotiation: 3, coup_progress: 2 }
    }),
 
    fp_customs_union: foreignAction({
        ideoMin: 14, ideoMax: 20,
        weight: () => 1.50,
        desc: ', at the Foreign Ministry, has forged a customs union with Austria in defiance of Versailles and France.',
        eligible: () => Q.black_thursday_seen == 1 && Q.customs_union == 0 && Q.eu == 0,
        effects: { customs_union: 1, west_relation: -2, east_relation: -2, nationalism: 3, coup_progress: -1 },
        extra: () => { Q.banking_crisis_timer = 2; }
    }),
 
    fp_revisionist_posture: foreignAction({
        ideoMin: 17, ideoMax: 20,
        weight: () => 1.20,
        desc: ', at the Foreign Ministry, has taken a defiant revisionist line against Versailles and the neighbors.',
        eligible: () => Q.west_relation > -5 && Q.east_relation > -5,
        effects: { nationalism: 2, west_relation: -1, east_relation: -1, reparations_negotiation: -1 }
    }),
 
    fp_european_union: foreignAction({
        ideoMin: 1, ideoMax: 10,
        weight: () => 1.70,
        desc: ', at the Foreign Ministry, has pushed multilateral talks toward a European Union.',
        eligible: () => Q.reparations <= -2 && Q.eu == 0 && Q.west_relation >= 5 && Q.east_relation >= 4,
        effects: { eu_progress: 1, west_relation: 1 },
        extra: () => {
            if (Q.eu_progress < 2) return;
            Q.eu = 1;
            Q.pro_republic += 5; Q.nationalism -= 5;
            Q.budget += 1; Q.economic_growth += 1;
            if (Q.unemployed >= 10) Q.unemployed -= 2;
        }
    }),
 
    fp_concordat: foreignAction({
        ideoMin: 9, ideoMax: 14,
        weight: () => 1.40,
        desc: ', at the Foreign Ministry, has advanced negotiations on a Concordat with the Vatican.',
        eligible: () => Q.prussian_concordat == 1 && Q.reichskonkordat == 0,
        effects: { reichskonkordat_progress: 2, z_relation: 3 },
        extra: () => {
            if (Q.reichskonkordat_progress < 4) return;
            Q.reichskonkordat = 1;
            Q.z_relation += 10;
            Q.catholics_z += 5;
        }
    }),
 
    // ---- FOREIGN: counterweights (right-wing / hawkish) ----------------------
 
    fp_reichswehr_buildup: foreignAction({
        ideoMin: 17, ideoMax: 20,
        weight: () => linearWeight(1.10, Q.nationalism, 50, 2),
        desc: ', at the Foreign Ministry, has pressed ahead with Reichswehr expansion in defiance of Versailles limits.',
        eligible: () => Q.rearmament_exposed < 1,
        effects: { reichswehr_militancy: 0.2, pacifism: -1, nationalism: 1, west_relation: -0.5, east_relation: -0.5, coup_progress: 0.5 }
    }),
 
    fp_snub_west: foreignAction({
        ideoMin: 15, ideoMax: 20,
        weight: () => linearWeight(1.20, Q.west_relation, 5, 2),
        desc: ', at the Foreign Ministry, has snubbed the Western Allies and stalled the "policy of fulfillment".',
        eligible: () => Q.west_relation > -5,
        effects: { west_relation: -2, reparations_negotiation: -1, nationalism: 1 }
    }),
 
    fp_reparations_defiance: foreignAction({
        ideoMin: 18, ideoMax: 20,
        weight: () => 1.00,
        desc: ', at the Foreign Ministry, has refused to honor reparations obligations, calling them a "tribute of slavery".',
        eligible: () => Q.reparations > -2 && Q.west_relation > -4,
        effects: { west_relation: -2, reparations_negotiation: -2, nationalism: 2, budget: 1 }
    }),
 
    fp_east_revisionism: foreignAction({
        ideoMin: 16, ideoMax: 20,
        weight: () => linearWeight(1.00, Q.east_relation, 4, 2),
        desc: ', at the Foreign Ministry, has demanded revision of the eastern borders, alarming Poland and Czechoslovakia.',
        eligible: () => Q.east_relation > -5,
        effects: { east_relation: -2, nationalism: 2 }
    }),
 
    fp_anti_comintern: foreignAction({
        ideoMin: 12, ideoMax: 20,
        weight: () => linearWeight(1.00, Q.soviet_relation, 4, 2),
        desc: ', at the Foreign Ministry, has frozen ties with Moscow and denounced the Comintern\'s subversion of Germany.',
        eligible: () => Q.soviet_relation > -5,
        effects: { soviet_relation: -2, kpd_relation: -1, west_relation: 0.5 }
    }),
 
    fp_eu_sabotage: foreignAction({
        ideoMin: 15, ideoMax: 20,
        weight: () => linearWeight(1.30, Q.eu_progress, 2, 2),
        desc: ', at the Foreign Ministry, has obstructed the European Union talks, warning against surrendering German sovereignty.',
        eligible: () => Q.eu == 0 && Q.eu_progress > 0,
        effects: { eu_progress: -1, nationalism: 1, west_relation: -1 }
    }),
 
    // ---- FOREIGN: counterweights (left / pacifist) ---------------------------
 
    fp_disarmament_push: foreignAction({
        ideoMin: 1, ideoMax: 8,
        weight: () => scaledWeight(1.10, Math.max(Q.pacifism, 0) + 1, 5, 2),
        desc: ', at the Foreign Ministry, has championed multilateral disarmament and the outlawing of war at Geneva.',
        eligible: () => Q.pacifism < 10,
        effects: { pacifism: 1, nationalism: -2, west_relation: 1, east_relation: 1, reichswehr_militancy: -0.1 },
        extra: () => { Q.reichswehr_militancy = Math.max(0, Q.reichswehr_militancy || 0); }
    }),
 
    fp_league_diplomacy: foreignAction({
        ideoMin: 7, ideoMax: 13,
        weight: () => 1.20,
        desc: ', at the Foreign Ministry, has worked through the League of Nations to rebuild Germany\'s standing as a trusted partner.',
        eligible: () => Q.pacifism < 8,
        effects: { pacifism: 0.5, pro_republic: 1, west_relation: 1, east_relation: 1 }
    }),
 
    fp_oppose_concordat: foreignAction({
        ideoMin: 1, ideoMax: 5,
        weight: () => 0.90,
        desc: ', at the Foreign Ministry, has stalled the Vatican negotiations, wary of clerical influence over the Republic.',
        eligible: () => Q.reichskonkordat == 0 && Q.reichskonkordat_progress > 0,
        effects: { reichskonkordat_progress: -1, z_relation: -3 }
    }),
 
    // ---- FOREIGN: repair and economic diplomacy ------------------
 
    // Centrists patch up the worst relation instead of chasing a new initiative
    fp_repair_relations: foreignAction({
        ideoMin: 7, ideoMax: 16,
        weight: () => scaledWeight(1.50, Math.min(Q.west_relation, Q.east_relation) + 5, 5, 2),
        desc: ', at the Foreign Ministry, has dispatched envoys to mend strained relations with Germany\'s neighbors.',
        eligible: () => Q.west_relation < 1 || Q.east_relation < 1,
        effects: { west_relation: 1, east_relation: 1 }
    }),
 
    fp_trade_agreements: foreignAction({
        ideoMin: 1, ideoMax: 16,
        weight: () => linearWeight(1.20, Q.unemployed, 10, 2),
        desc: ', at the Foreign Ministry, has signed new trade agreements to open export markets for German industry.',
        eligible: () => Q.unemployed > 5 && Q.west_relation >= 2,
        effects: { economic_growth: 0.3, unemployed: -0.5 },
        support: { workers: 2, new_middle: 2 }
    }),
 
    // ---- JUSTICE: reform ----------------------------------------------------
    // judicial_reform runs -10..10, so "+ 11" keeps the value positive for the weight helpers.
 
    jus_minor_reforms: justiceAction({
        ideoMin: 1, ideoMax: 13,
        weight: () => 1.20,
        desc: ', at the Justice Ministry, has quietly removed the most openly biased and corrupt jurists while leaving the system intact.',
        eligible: () => Q.full_reform != 1 && Q.judicial_reform < 10,
        effects: { judicial_reform: 1, democratization: 1, pro_republic: 3 },
        support: { workers: 3 }
    }),
 
    jus_reform: justiceAction({
        ideoMin: 1, ideoMax: 10,
        weight: () => scaledWeight(1.80, Q.judicial_reform + 11, 11, 2),
        desc: ', at the Justice Ministry, has purged biased jurists and replaced them with democratically-minded judges, enraging conservatives.',
        eligible: () => Q.budget >= 1 && Q.full_reform != 1 && Q.judicial_reform < 10,
        effects: { budget: -1, judicial_reform: 2, democratization: 2, pro_republic: 5, coup_progress: 1 },
        support: { workers: 5 }
    }),
 
    jus_full_reform: justiceAction({
        ideoMin: 1, ideoMax: 8,
        weight: () => 2.50,
        desc: ', at the Justice Ministry, has completed the republicanization of the judiciary, barring monarchists and nationalists from the bench.',
        eligible: () => Q.budget >= 2 && Q.judicial_reform >= 10 && Q.full_reform != 1,
        effects: { budget: -2, democratization: 2, pro_republic: 10 },
        support: { workers: 5 },
        extra: () => { Q.full_reform = 1; }
    }),
 
    jus_prosecute_far_right: justiceAction({
        ideoMin: 1, ideoMax: 12,
        weight: () => linearWeight(1.30, Q.sa_strength, 500, 2) + linearWeight(0.40, Q.coup_progress, 5, 2),
        desc: ', at the Justice Ministry, has pushed through prosecutions of Nazi and nationalist agitators and paramilitary leaders.',
        eligible: () => Q.judicial_reform >= 5,
        effects: { sa_strength: -20, coup_progress: -0.5, pro_republic: 1 },
        support: { workers: 1 }
    }),
 
    jus_amnesty_prisoners: justiceAction({
        ideoMin: 1, ideoMax: 8,
        weight: () => 1.00,
        desc: ', at the Justice Ministry, has amnestied political prisoners jailed for pacifism and leftist agitation.',
        eligible: () => Q.pacifism < 10,
        effects: { pacifism: 1, democratization: 1, kpd_relation: 2, nationalism: -1 },
        support: { workers: 2, unemployed: 2 }
    }),
 
    jus_republic_protection: justiceAction({
        ideoMin: 7, ideoMax: 13,
        weight: () => 1.20,
        desc: ', at the Justice Ministry, has pressed a republic protection law against extremists of left and right.',
        eligible: () => Q.pro_republic < 60,
        effects: { pro_republic: 2, sa_strength: -10, rfb_strength: -10, democratization: 0.5 }
    }),
 
    // ---- JUSTICE: counterweights --------------------------------------------
    // Heavier the more reformed the courts already are, so the AI claws things back.
 
    jus_reactionary_appointments: justiceAction({
        ideoMin: 15, ideoMax: 20,
        weight: () => linearWeight(1.60, Q.judicial_reform + 11, 11, 2),
        desc: ', at the Justice Ministry, has filled the courts with monarchist and nationalist jurists.',
        eligible: () => Q.judicial_reform > -10,
        effects: { judicial_reform: -1, democratization: -1, pro_republic: -1, nationalism: 1 }
    }),
 
    jus_lenient_far_right: justiceAction({
        ideoMin: 17, ideoMax: 20,
        weight: () => 1.30,
        desc: ', at the Justice Ministry, has seen putschists and Nazi thugs walk free with token sentences.',
        effects: { sa_strength: 15, coup_progress: 0.3, nationalism: 1, pro_republic: -1 }
    }),
 
    jus_persecute_left: justiceAction({
        ideoMin: 14, ideoMax: 20,
        weight: () => 1.10,
        desc: ', at the Justice Ministry, has pursued treason and sedition cases against pacifists, journalists and communists.',
        eligible: () => Q.pacifism > -10,
        effects: { pacifism: -1, socialism: -2, rfb_strength: -20, democratization: -0.5 },
        support: { workers: -2, unemployed: -2 }
    }),
 
    jus_sedition_crackdown: justiceAction({
        ideoMin: 12, ideoMax: 18,
        weight: () => linearWeight(0.90, Q.socialism, 50, 2),
        desc: ', at the Justice Ministry, has tightened sedition and press laws against radical agitation.',
        eligible: () => Q.democratization > -10,
        effects: { socialism: -2, nationalism: -1, democratization: -1, rfb_strength: -10, sa_strength: -10 }
    }),
 
    // ---- SCIENCE (Economic Ministry) ----------------------------------------
 
    sci_fund_kwg: scienceAction({
        ideoMin: 1, ideoMax: 14,
        weight: () => linearWeight(1.20, Q.budget, 6, 2) + scaledWeight(0.50, Q.science_funding + 1, 4, 2),
        desc: ', at the Economic Ministry, has funded the Kaiser Wilhelm Society for basic research.',
        eligible: () => Q.budget >= 1 && Q.science_funding < 10,
        effects: { budget: -1, science: 1, kwg_research: 1, science_funding: 1, west_relation: 1, ddp_relation: 5 },
        support: { new_middle: 5 },
        extra: () => {
            if (Q.economic_growth <= 8) Q.economic_growth += 0.3;
            if (Q.unemployed >= 4) Q.unemployed -= 0.2;
        }
    }),
 
    sci_fund_applied: scienceAction({
        ideoMin: 1, ideoMax: 20,
        weight: () => linearWeight(1.40, Q.budget, 6, 2) + linearWeight(0.40, Q.unemployed, 8, 3),
        desc: ', at the Economic Ministry, has funded applied research with industry to spur growth.',
        eligible: () => Q.budget >= 1 && Q.science_funding < 10,
        effects: { budget: -1, science: 1, applied_research: 1, science_funding: 1, ddp_relation: 5 },
        support: { new_middle: 5, workers: 3 },
        extra: () => {
            if (Q.applied_research > 1) Q.economic_growth += 3;
            else if (Q.economic_growth <= 8) Q.economic_growth += 0.5;
            if (Q.unemployed >= 4) Q.unemployed -= 0.5;
            if (Q.capital_strike_progress > 1) Q.capital_strike_progress -= 1;
        }
    }),
 
    sci_fund_medical: scienceAction({
        ideoMin: 1, ideoMax: 13,
        weight: () => linearWeight(1.00, Q.budget, 6, 2),
        desc: ', at the Economic Ministry, has funded biomedical research at hospitals and medical schools.',
        eligible: () => Q.budget >= 1 && Q.science_funding < 10,
        effects: { budget: -1, science: 1, medical_research: 1, science_funding: 1, ddp_relation: 5 },
        support: { new_middle: 5, workers: 3 },
        extra: () => {
            if (Q.economic_growth <= 8) Q.economic_growth += 0.4;
            if (Q.unemployed >= 4) Q.unemployed -= 0.2;
        }
    }),
 
    sci_cut_funding: scienceAction({
        ideoMin: 14, ideoMax: 20,
        weight: () => scaledWeight(1.80, Q.budget, 5) + linearWeight(0.40, Q.science_funding, 4, 2),
        desc: ', at the Economic Ministry, has slashed science budgets, idling researchers.',
        eligible: () => Q.science_funding >= 1,
        effects: { budget: 1, science: -1, science_funding: -1, applied_research: -0.33, kwg_research: -0.33, medical_research: -0.33, economic_growth: -0.5, unemployed: 0.3, ddp_relation: -5 },
        support: { new_middle: -5, workers: -2 }
    }),
 
    // ---- EDUCATION: structure (Chancellery) ---------------------------------
 
    edu_public_hs: educationAction({
        ideoMin: 1, ideoMax: 9,
        weight: () => linearWeight(1.50, Q.budget, 6, 2) + scaledWeight(0.50, Q.public_hs + 1, 3, 2),
        desc: ', through the Chancellery, has funded public secondary schools for working-class children.',
        eligible: () => Q.budget >= 1 && Q.public_hs < 3,
        effects: { budget: -1, public_hs: 1, prussian_police_loyalty: 0.04, education_science: 0.5, unemployed: -0.2, economic_growth: 0.2, pro_republic: 4 },
        support: { workers: 6, unemployed: 3 }
    }),
 
    edu_school_boards: educationAction({
        ideoMin: 1, ideoMax: 12,
        weight: () => 1.10,
        desc: ', through the Chancellery, has created elected school boards with local control of schools.',
        eligible: () => Q.school_boards == 0,
        effects: { school_boards: 1, education_science: 0.2 },
        support: { workers: 3, new_middle: 3, old_middle: 2 }
    }),
 
    edu_secularize: educationAction({
        ideoMin: 1, ideoMax: 8,
        weight: () => 1.40,
        desc: ', through the Chancellery, has replaced denominational schools with secular community schools, enraging the Center Party.',
        eligible: () => Q.budget >= 1 && Q.secularized == 0,
        effects: { budget: -1, secularized: 1, z_relation: -15, dvp_relation: 6, ddp_relation: 6, kpd_relation: 6, education_science: 0.5, new_middle_ddp: 4, new_middle_dvp: 4 },
        support: { new_middle: 3, workers: 3 }
        // The scene triggers an instant VONC here; hook that into your AI-coalition collapse logic if you want parity.
    }),
 
    // Right-wing counterweight: undo secularization
    edu_confessional_schools: educationAction({
        ideoMin: 12, ideoMax: 20,
        weight: () => 1.30,
        desc: ', through the Chancellery, has restored denominational schools and religious instruction.',
        eligible: () => Q.secularized == 1,
        effects: { secularized: -1, z_relation: 10, dvp_relation: 3, kpd_relation: -4, education_science: -0.3 },
        support: { old_middle: 3, rural: 3 }
    }),
 
    // ---- EDUCATION: curriculum (shared lockout via curriculum_timer) ---------
 
    edu_curr_democratic: educationAction({
        ideoMin: 1, ideoMax: 8,
        weight: () => scaledWeight(1.60, Q.pro_republic, 60, 2),
        desc: ', through the Chancellery, has introduced a democratic curriculum built on critical thinking and civic duty.',
        eligible: () => Q.curriculum_timer <= 0,
        effects: { pro_republic: 5, democratization: 1, pacifism: 1, education_science: 0.3 },
        support: { workers: 3 },
        extra: () => { Q.curriculum_timer = 50; Q.major_curriculum = "democratic"; Q.minor_curriculum = "scientific"; }
    }),
 
    edu_curr_scientific: educationAction({
        ideoMin: 5, ideoMax: 14,
        weight: () => 1.40,
        desc: ', through the Chancellery, has overhauled the curriculum around science and mathematics.',
        eligible: () => Q.curriculum_timer <= 0,
        effects: { education_science: 1 },
        support: { new_middle: 3, workers: 2 },
        extra: () => { Q.curriculum_timer = 50; Q.major_curriculum = "scientific"; Q.minor_curriculum = "vocational"; }
    }),
 
    edu_curr_humanist: educationAction({
        ideoMin: 6, ideoMax: 14,
        weight: () => 1.10,
        desc: ', through the Chancellery, has refocused schooling on literature, history and philosophy.',
        eligible: () => Q.curriculum_timer <= 0,
        effects: { education_science: 0.2 },
        support: { new_middle: 4 },
        extra: () => { Q.curriculum_timer = 50; Q.major_curriculum = "humanist"; Q.minor_curriculum = "democratic"; }
    }),
 
    edu_curr_vocational: educationAction({
        ideoMin: 5, ideoMax: 16,
        weight: () => linearWeight(1.00, Q.unemployed, 8, 2) + 0.60,
        desc: ', through the Chancellery, has pivoted schools toward vocational training for working life.',
        eligible: () => Q.curriculum_timer <= 0,
        effects: { unemployed: -0.1, education_science: 0.5 },
        support: { workers: 4, rural: 2, unemployed: 3, new_middle: -1 },
        extra: () => { Q.curriculum_timer = 50; Q.major_curriculum = "vocational"; Q.minor_curriculum = "scientific"; }
    }),
 
    edu_curr_traditional: educationAction({
        ideoMin: 14, ideoMax: 20,
        weight: () => 1.70,
        desc: ', through the Chancellery, has restored a traditional curriculum of classics, discipline and national pride.',
        eligible: () => Q.curriculum_timer <= 0,
        effects: { pro_republic: -5, education_science: 0.2 },
        support: { old_middle: 3, rural: 3 },
        extra: () => {
            if (Q.pacifism > 0) Q.pacifism -= 1;
            Q.curriculum_timer = 50; Q.major_curriculum = "traditional"; Q.minor_curriculum = "humanist";
        }
    }),
};
 
 
function runPartyGovernmentActions(party) {
    var timerKey = party + '_government_action_timer';
    var descKey = party + '_government_action_description';
 
    if (Q[timerKey] > 0 || Q[party + '_banned']) return;
    if (!inReichGovernment(party)) return;
 
    var pool = {};
    for (var key in Q.GLOBAL_PARTY_GOVERNMENT_ACTIONS) {
        var action = Q.GLOBAL_PARTY_GOVERNMENT_ACTIONS[key];
        if (!inIdeoRange(party, action.ideoMin, action.ideoMax)) continue;
 
        pool[key] = {
            weight: action.weight(party),
            eligible: action.eligible ? action.eligible(party) : true,
            timer: action.timer,
            description: action.description(party)
        };
    }
 
    var chosen = PickHighest(pool, 'weight');
 
    if (chosen === null) {
        Q[timerKey] = 6;
        Q[descKey] = partyLabel(party) + ' takes no notable government action for the time being.';
        return;
    }
 
    Q[timerKey] = pool[chosen].timer;
    Q[descKey] = pool[chosen].description;
    Q.GLOBAL_PARTY_GOVERNMENT_ACTIONS[chosen].apply(party);
    Q[party + '_government_flavor_action_timer'] = 3;
}
 
 
// ---- Daily events ----------------------------------------------------------
 
Q.GLOBAL_DAILY_EVENTS = {
 
    generic_daily_event: {
        weight: () => scaledWeight(1.00, Q.nationalism, 10),
        description: () => 'A generic development has occurred, reflecting shifting conditions across the Reich.',
        eligible: () => true,
        timer: 6,
        apply: () => { Q.nationalism += 0; }
    },
 
};
 
function runDailyEvents() {
    var timerKey = 'daily_event_timer';
    var descKey = 'daily_event_description';
 
    if (Q[timerKey] > 0) return;
 
    var pool = {};
    for (var key in Q.GLOBAL_DAILY_EVENTS) {
        var event = Q.GLOBAL_DAILY_EVENTS[key];
 
        pool[key] = {
            weight: event.weight(),
            eligible: event.eligible ? event.eligible() : true,
            timer: event.timer,
            description: event.description()
        };
    }
 
    var chosen = PickHighest(pool, 'weight');
 
    if (chosen === null) {
        Q[timerKey] = 6;
        Q[descKey] = 'No notable developments occur today.';
        return;
    }
 
    Q[timerKey] = pool[chosen].timer;
    Q[descKey] = pool[chosen].description;
    Q.GLOBAL_DAILY_EVENTS[chosen].apply();
}
 
// ---- Leadership events ----------------------------------------------------------
 
// Leader helpers
function lvIsLeader() {
    var names = Array.prototype.slice.call(arguments);
    return names.indexOf(Q.spd_party_leader) !== -1;
}
function lvAdd(key, delta) { Q[key] = (Q[key] || 0) + delta; }
function lvStr(key, delta) { Q[key] = Math.max(0, Math.min(100, (Q[key] || 0) + delta)); }
function lvJitter()        { return 0.75 + Math.random() * 0.5; }
function lvW(base, extra)  { return (base + (extra || 0)) * lvJitter(); }
 
Q.LEADER_EVENTS = {
 
    wels_party_discipline: {
        weight: () => lvW(1.0, linearWeight(1.5, Q.left_dissent, 10, 3)),
        description: () => 'Wels tightens the screws on the apparatus and threatens the rebels.',
        eligible: () => lvIsLeader('Wels'),
        timer: 8,
        apply: () => {
            lvStr('center_strength', 3);
            lvAdd('left_dissent', 5);
            lvAdd('labor_dissent', -3);
            lvAdd('reformist_dissent', -3);
        }
    },
 
};
 
function runLeaderEvents() {
    var timerKey = 'leader_event_timer';
    var descKey = 'leader_event_description';
 
    if (Q[timerKey] > 0) return;
    if (!Q.spd_party_leader) return;  
 
    var pool = {};
    for (var key in Q.LEADER_EVENTS) {
        var event = Q.LEADER_EVENTS[key];
 
        pool[key] = {
            weight: event.weight() * (key === Q.leader_last_event ? 0.35 : 1),
            eligible: event.eligible ? event.eligible() : true,
            timer: event.timer,
            description: event.description()
        };
    }
 
    var chosen = PickHighest(pool, 'weight');
 
    if (chosen === null) {
        Q[timerKey] = 6;
        Q[descKey] = 'The party leadership has no new initiative at the moment.';
        return;
    }
 
    Q[timerKey] = pool[chosen].timer;
    Q[descKey] = pool[chosen].description;
    Q.leader_last_event = chosen;
    Q.LEADER_EVENTS[chosen].apply();
    Q.leader_event_flavor_timer = 3;   
}