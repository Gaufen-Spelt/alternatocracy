function dropAdvisors(fac, names, pool) {
  names.forEach(function(n) {
    if (Q[n + "_advisor"] == 1) {
      Q[n + "_advisor"] = 0;
      Q.n_advisors -= 1;
      Q[fac + "_advisors"] -= 1;
    }
  });
  Q[fac + "_slots"] = Math.min(Q[fac + "_slots"], pool);
  Q.total_slots = Q.left_slots + Q.center_slots + Q.labor_slots
                + Q.ref_slots + Q.neo_slots + Q.soc_slots + Q.eth_slots;
  var gone = names.map(function(n) { return n.charAt(0).toUpperCase() + n.slice(1); });
  if (gone.indexOf(Q.spd_party_leader) >= 0) Q.spd_party_leader = "collective";
}
