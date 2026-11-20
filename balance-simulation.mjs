#!/usr/bin/env node
// Spread / Resistance prototype Monte Carlo simulation.
// Run: node work/simulate_game.mjs --runs 500 --seed 7
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, arg, i, arr) => {
  if (arg.startsWith('--')) pairs.push([arg.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
  return pairs;
}, []));
const config = {
  maps: 3, cellsPerMap: Number(args['cells-per-map'] ?? 8), width: 4, height: 4,
  apPerPlayer: Number(args.ap ?? 1), seedInfections: Number(args['initial-seeds'] ?? 2),
  bonusAp: Number(args['bonus-ap'] ?? 4),
  bonusEvery: Number(args['bonus-every'] ?? 1),
  spreadInfectionsPerRound: Number(args['spread-actions'] ?? 1), winFraction: Number(args['win-fraction'] ?? 1),
  autoSeedsPerInfection: Number(args['auto-seeds'] ?? 1),
  meterSteps: Number(args['meter-steps'] ?? 3),
  extraEvery: Number(args['extra-every'] ?? 3),
  autoSeedMode: String(args['auto-mode'] ?? 'infection'),
  guessesPerPlayer: Number(args['guesses-per-round'] ?? 99),
  allowBlocks: args['allow-blocks'] !== 'false',
  thresholdIncludesSeeds: args['threshold-includes-seeds'] !== 'false',
  allTimeCoverage: args['all-time-coverage'] === 'true',
  seedMode: String(args['seed-mode'] ?? 'random'),
  maxRounds: Number(args.rounds ?? 200), runs: Number(args.runs ?? 5000), seed: Number(args.seed ?? 7),
};

function rngFrom(seed) {
  let state = seed >>> 0;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 0x100000000; };
}
const key = n => n.join(':');
const edgeKey = (a, b) => [key(a), key(b)].sort().join('|');
function shuffle(items, random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
const tileTypes = [
 {name:'tri_north',coords:[[0,0,0],[1,0,0],[0,0,1],[0,1,0],[1,1,0],[1,-1,1],[0,1,1],[1,1,-1],[1,0,-1],[0,1,-1],[1,1,1],[1,0,1]],ports:[0,4,11]},
 {name:'tri_east',coords:[[0,0,0],[1,0,0],[0,1,0],[1,0,-1],[0,1,-1],[1,1,-2],[1,1,-1],[0,2,-2],[1,2,-2],[0,2,-1],[1,2,-3],[0,3,-3]],ports:[0,5,11]},
 {name:'tri_delta',coords:[[0,0,0],[1,-1,0],[1,0,-1],[1,0,0],[0,1,0],[0,0,1],[0,-1,0],[1,-1,1],[0,-1,1],[1,-1,-1],[0,0,-1],[1,1,0]],ports:[0,6,11]},
 {name:'tri_bay',coords:[[0,0,0],[1,-1,0],[0,-1,1],[0,-1,0],[1,-1,1],[0,0,1],[1,0,1],[1,-2,0],[0,-2,1],[1,-2,1],[1,0,0],[0,0,2]],ports:[0,7,11]},
];
function graph(random) {
  const nodes = [], adj = new Map();
  const maps = shuffle(tileTypes, random).slice(0, config.maps).map(tile => {
    const coords = tile.coords.slice(0, config.cellsPerMap);
    const ports = tile.ports.filter(port => port < config.cellsPerMap);
    for (let i = 0; ports.length < 3 && i < coords.length; i++) if (!ports.includes(i)) ports.push(i);
    return { ...tile, coords, ports };
  });
  const names = maps.map(t=>t.name);
  const mapPorts = [], mapLinks = Array.from({length:config.maps},()=>[]);
  for (let m=0;m<config.maps;m++) {
    const coords=maps[m].coords, ports=maps[m].ports;
    mapPorts.push(ports);
    for (let i=0;i<coords.length;i++) {
      const n=[m,i]; nodes.push(n); adj.set(key(n),[]);
    }
    for(let i=0;i<coords.length;i++)for(let j=i+1;j<coords.length;j++){const [o,r,q]=coords[i],[oo,rr,qq]=coords[j];const ns=o===0?[[1,r,q],[1,r,q-1],[1,r-1,q]]:[[0,r,q],[0,r+1,q],[0,r,q+1]];if(ns.some(([a,b,c])=>a===oo&&b===rr&&c===qq)){const a=[m,i],b=[m,j];adj.get(key(a)).push(b);adj.get(key(b)).push(a)}}
  }
  // Random spanning tree: exactly two unique port-to-port connections join all maps.
  const order=shuffle([0,1,2],random), used=[new Set(),new Set(),new Set()];
  for(let i=0;i<2;i++) {
    const m=order[i],next=order[i+1];
    const ap=shuffle(mapPorts[m].filter(p=>!used[m].has(p)),random)[0];
    const bp=shuffle(mapPorts[next].filter(p=>!used[next].has(p)),random)[0];
    used[m].add(ap);used[next].add(bp);
    const a=[m,ap], b=[next,bp];
    adj.get(key(a)).push(b); adj.get(key(b)).push(a);
    mapLinks[m].push({port:[ap], neighbor:next, remotePort:[bp]});
    mapLinks[next].push({port:[bp], neighbor:m, remotePort:[ap]});
  }
  return { nodes, adj, mapTypes:names, mapPorts, mapLinks };
}

function simulate(policy, random) {
  const { nodes, adj, mapTypes, mapPorts, mapLinks } = graph(random);
  const infected = new Map(), seeds = new Map(), everInfected = new Set(), blocked = new Set(), blockedUntil = new Map(), rows = [];
  let contagionMeter = args['meter-start'] === undefined ? Math.floor(random()*5) : Number(args['meter-start']);
  let initialCandidates = nodes;
  if (config.seedMode === 'focus') {
    const map = Math.floor(random() * config.maps);
    initialCandidates = nodes.filter(n => n[0] === map);
  } else if (config.seedMode === 'spread' && config.seedInfections <= config.maps) {
    initialCandidates = shuffle([...Array(config.maps).keys()], random)
      .slice(0, config.seedInfections).flatMap(m => shuffle(nodes.filter(n => n[0] === m), random).slice(0,1));
  }
  const shuffled = shuffle(initialCandidates, random);
  for (const n of shuffled.slice(0, config.seedInfections)) seeds.set(key(n), {node:n, planted:1, matureAfter:1});
  let seedsCleared = 0, infectionsCleared = 0, seedGuesses = 0, seedMisses = 0, winner = '', winReason = '';
  const threshold = Math.ceil(nodes.length * config.winFraction);
  for (let round = 1; round <= config.maxRounds; round++) {
    // Reaching the infection threshold ends the game immediately, before
    // Resistance can spend AP to clean those newly announced locations.
    if ((config.allTimeCoverage ? everInfected.size : infected.size + (config.thresholdIncludesSeeds ? seeds.size : 0)) >= threshold) {
      rows.push({ round, infected: infected.size, seeds: seeds.size,
        seed_guesses_this_round: 0, seed_guesses_total: seedGuesses,
        seed_misses_this_round: 0, seed_misses_total: seedMisses,
        seeds_cleared_this_round: 0, seeds_cleared_total: seedsCleared,
        infections_cleared_this_round: 0, infections_cleared_total: infectionsCleared,
        blocked_this_round: 0, blocked_total: blocked.size,
        resistance_ap: config.maps * config.apPerPlayer + (round % config.bonusEvery === 0 ? config.bonusAp : 0),
        winner: 'Spread', win_reason: 'infection_threshold' });
      winner = 'Spread'; winReason = 'infection_threshold';
      break;
    }
    let seedsClearedRound = 0, infectionsClearedRound = 0, guessesRound = 0, missesRound = 0, blockedRound = 0;
    const bonusThisRound = (round % config.bonusEvery === 0 ? config.bonusAp : 0);
    const apByMap = Array(config.maps).fill(config.apPerPlayer);
    for (let i=0;i<bonusThisRound;i++) {
      const counts = Array(config.maps).fill(0);
      for (const {node} of infected.values()) counts[node[0]]++;
      const max = Math.max(...counts);
      const candidates = counts.map((n,m)=>n===max?m:-1).filter(m=>m>=0);
      apByMap[candidates[Math.floor(random()*candidates.length)]]++;
    }
    // Extra spread can be checked per infection (baseline), or with one shared
    // percentile roll per round and at most one extra seed per map.
    if (config.autoSeedMode === 'once') {
      const sources = [...infected.values()].map(x=>x.node).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
      if (sources.length && random() < config.autoSeedsPerInfection) {
        for (const source of sources) {
          const adjacent = adj.get(key(source)).filter(v=>!infected.has(key(v))&&!seeds.has(key(v))&&!blocked.has(edgeKey(source,v)));
          if (adjacent.length) { seeds.set(key(adjacent[0]), {node:adjacent[0], sourceId:key(source), planted:round, matureAfter:round+1}); break; }
        }
      }
    } else if (config.autoSeedMode === 'round-roll') {
      const sources = [...infected.values()].map(x=>x.node).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
      const rollOffset = Math.floor(random()*5);
      const extraCount = Math.floor((3 * sources.length + rollOffset) / 5);
      for (const source of sources.slice(0, extraCount)) {
        const adjacent = adj.get(key(source)).filter(v=>!infected.has(key(v))&&!seeds.has(key(v))&&!blocked.has(edgeKey(source,v)));
        if (adjacent.length) seeds.set(key(adjacent[0]), {node:adjacent[0], sourceId:key(source), planted:round, matureAfter:round+1});
      }
    } else if (config.autoSeedMode === 'meter') {
      const sources = [...infected.values()].map(x=>x.node).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
      const surge = infected.size >= 999;
      const total = contagionMeter + config.meterSteps * sources.length;
      const extraCount = Math.floor(total / 5);
      contagionMeter = total % 5;
      for (const source of sources.slice(0, extraCount)) {
        const adjacent = adj.get(key(source)).filter(v=>!infected.has(key(v))&&!seeds.has(key(v))&&!blocked.has(edgeKey(source,v))).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
        for (const cell of adjacent.slice(0, surge ? 2 : 1)) seeds.set(key(cell), {node:cell, sourceId:key(source), planted:round, matureAfter:round+1});
      }
    } else if (config.autoSeedMode === 'map') {
      const mapGroups = Array.from({length:config.maps}, (_,m) => [...infected.values()].map(x=>x.node).filter(n=>n[0]===m));
      const roll = Math.floor(random()*100)+1;
      for (const sources of mapGroups) {
        if (!sources.length) continue;
        const n = sources.length;
        const threshold = Math.ceil(100 * (1 - Math.pow(1-config.autoSeedsPerInfection, n)));
        if (roll > threshold) continue;
        const source = sources[Math.floor(random()*sources.length)];
        const adjacent = adj.get(key(source)).filter(v=>!infected.has(key(v))&&!seeds.has(key(v))&&!blocked.has(edgeKey(source,v))).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
        if (adjacent.length) seeds.set(key(adjacent[0]), {node:adjacent[0], sourceId:key(source), planted:round, matureAfter:round+1});
      }
    } else {
      for (const {node:source} of infected.values()) {
        let autoCount = Math.floor(config.autoSeedsPerInfection);
        if (random() < config.autoSeedsPerInfection - autoCount) autoCount++;
        for (let j=0;j<autoCount;j++) {
          const adjacent = adj.get(key(source)).filter(v=>!infected.has(key(v))&&!seeds.has(key(v))&&!blocked.has(edgeKey(source,v))).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
          if (adjacent.length) seeds.set(key(adjacent[0]), {node:adjacent[0], sourceId:key(source), planted:round, matureAfter:round+1});
        }
      }
    }



    // Spread can continue a route from either a public infection or any hidden
    // seed. Recalculate legal cells after every placement to allow chains.
    const spreadCount = config.spreadInfectionsPerRound + (config.extraEvery > 0 && round % config.extraEvery === 0 ? 1 : 0);
    for (let action = 0; action < spreadCount; action++) {
      const sources = [...infected.values(), ...seeds.values()].map(x=>x.node);
      const legal = new Map();
      for (const n of sources) for (const v of adj.get(key(n)))
        if (!infected.has(key(v)) && !seeds.has(key(v)) && !blocked.has(edgeKey(n,v))) legal.set(key(v), v);
      if (!legal.size) break;
      const choices = shuffle([...legal.values()], random).sort((a,b)=>adj.get(key(b)).length-adj.get(key(a)).length);
      const n = choices[0];
      seeds.set(key(n), {node:n, planted:round, matureAfter:round});
    }
    if (!config.allTimeCoverage && config.thresholdIncludesSeeds && infected.size + seeds.size >= threshold) {
      winner = 'Spread'; winReason = 'infection_threshold';
      rows.push({ round, infected: infected.size, seeds: seeds.size,
        seed_guesses_this_round: 0, seed_guesses_total: seedGuesses,
        seed_misses_this_round: 0, seed_misses_total: seedMisses,
        seeds_cleared_this_round: 0, seeds_cleared_total: seedsCleared,
        infections_cleared_this_round: 0, infections_cleared_total: infectionsCleared,
        blocked_this_round: 0, blocked_total: blocked.size,
        resistance_ap: config.maps * config.apPerPlayer + (round % config.bonusEvery === 0 ? config.bonusAp : 0),
        winner, win_reason: winReason });
      break;
    }
    // A blockade lasts through one complete Spread planting turn, then opens
    // before Resistance acts in that round.
    for (const edge of [...blocked]) if ((blockedUntil.get(edge) ?? Infinity) <= round) {
      blocked.delete(edge); blockedUntil.delete(edge);
    }
    // Resistance responds using only its own map. Seed locations stay hidden;
    // an AP spent on a guess clears a seed only when the guessed cell is correct.
    const guarded = new Set();
    for (let m = 0; m < config.maps; m++) {
      let ap = apByMap[m];
      const missesThisRound = new Set();
      let guessesThisRound = 0;
      // Keep the locations of infections seen before this turn's actions so
      // clearing one does not erase the clue to its adjacent hidden seeds.
      const reportedInfections = [...infected.values()].map(x=>x.node);
      const knownSources = reportedInfections.filter(n=>n[0]===m);
      const remoteReport = reportedInfections.some(n=>n[0]!==m);
      while (ap > 0) {
        const localInfected = [...infected.values()].map(x=>x.node).filter(n => n[0] === m);
        const pressure = n => adj.get(key(n)).filter(v => !infected.has(key(v)) && !blocked.has(edgeKey(n,v))).length;
        // Block an unused stitched exit near local infections. A visibly
        // infected exit cannot be sealed; the selected route stays closed for
        // the next Spread planting turn only.
        const candidates = mapLinks[m].map(link=>{
          const here=[m,...link.port],there=[link.neighbor,...link.remotePort],route=edgeKey(here,there);
          const nearby=adj.get(key(here)).filter(v=>v[0]===m&&infected.has(key(v))).length;
          return {here,there,route,nearby};
        }).filter(c=>c.nearby>0&&!infected.has(key(c.here))&&!infected.has(key(c.there))&&!blocked.has(c.route));
        if (config.allowBlocks && localInfected.length && ap < 1 && candidates.length) {
          candidates.sort((a,b)=>b.nearby-a.nearby);
          blocked.add(candidates[0].route); blockedUntil.set(candidates[0].route,round+1); blockedRound++; ap--;
          continue;
        }
        // Confirmed infections have known coordinates and cost one action to clear.
        if (localInfected.length && ap >= Number(args['clear-infection-ap'] ?? 2)) {
          localInfected.sort((a,b) => pressure(b)-pressure(a));
          infected.delete(key(localInfected[0])); infectionsClearedRound++; infectionsCleared++; ap -= Number(args['clear-infection-ap'] ?? 2);
          continue;
        }
        // Guess near known infections where possible; otherwise search the map.
        // Misses are remembered for this round so an AP is not wasted twice on one cell.
        if (guessesThisRound >= config.guessesPerPlayer) break;
        const neighbours = knownSources.flatMap(n => adj.get(key(n)).filter(v => v[0] === m && !infected.has(key(v)) && !missesThisRound.has(key(v))));
        const reportedMaps = new Set(reportedInfections.map(n=>n[0]));
        const linkedClueExits = mapLinks[m].filter(link=>reportedMaps.has(link.neighbor))
          .map(link=>[m,...link.port]).filter(n=>!infected.has(key(n))&&!missesThisRound.has(key(n)));
        const exits = remoteReport
          ? (linkedClueExits.length ? linkedClueExits : mapLinks[m].map(link=>[m,...link.port]).filter(n=>!infected.has(key(n))&&!missesThisRound.has(key(n))))
          : [];
        const pool = neighbours.length ? neighbours : exits.length ? exits : nodes.filter(n => n[0] === m && !infected.has(key(n)) && !missesThisRound.has(key(n)));
        if (!pool.length) break;
        const guess = pool[Math.floor(random()*pool.length)];
        guessesThisRound++; guessesRound++; seedGuesses++;
        if (seeds.has(key(guess))) { seeds.delete(key(guess)); seedsClearedRound++; seedsCleared++; }
        else { missesThisRound.add(key(guess)); missesRound++; seedMisses++; }
        ap--;
      }
    }
    // Seeds mature after this response, so a newly announced infection cannot
    // produce another seed until a later Resistance round.
    for (const [k, seed] of [...seeds]) if (seed.matureAfter <= round) {
      seeds.delete(k); infected.set(k, {node:seed.node, at:round}); everInfected.add(k);
    }
    // Resolve end-of-round conditions after Resistance responds.
    if ((config.allTimeCoverage ? everInfected.size : infected.size + (config.thresholdIncludesSeeds ? seeds.size : 0)) >= threshold) { winner = 'Spread'; winReason = 'infection_threshold'; }
    else if (infected.size === 0 && seeds.size === 0) { winner = 'Resistance'; winReason = 'all_cleared'; }
    rows.push({ round, infected: infected.size, seeds: seeds.size,
      seed_guesses_this_round: guessesRound, seed_guesses_total: seedGuesses,
      seed_misses_this_round: missesRound, seed_misses_total: seedMisses,
      seeds_cleared_this_round: seedsClearedRound, seeds_cleared_total: seedsCleared,
      infections_cleared_this_round: infectionsClearedRound, infections_cleared_total: infectionsCleared,
      blocked_this_round: blockedRound, blocked_total: blocked.size,
      resistance_ap: config.maps * config.apPerPlayer + bonusThisRound, winner, win_reason: winReason });
    if (winner) break;
  }
  // Resistance wins only by clearing every revealed infection and hidden seed.
  // The simulation safety cap is not a game victory condition. Unresolved games
  // remain visible in results instead of being incorrectly awarded to Spread.
  if (!winner) {
    winner = 'Unresolved';
    winReason = 'simulation_safety_cap';
  }
  rows.at(-1).winner = winner;
  rows.at(-1).win_reason = winReason;
  return { winner, rows, mapTypes };
}

function toCsv(rows) {
  const headers = Object.keys(rows[0]);
  const quote = v => `"${String(v).replaceAll('"', '""')}"`;
  return [headers.join(','), ...rows.map(row => headers.map(h => quote(row[h])).join(','))].join('\n') + '\n';
}
const roundRows = [], gameRows = [];
const random = rngFrom(config.seed);
for (const policy of ['combined']) for (let game = 1; game <= config.runs; game++) {
  const result = simulate(policy, random), last = result.rows.at(-1);
  for (const row of result.rows) roundRows.push({ policy, game, ...row });
  gameRows.push({ policy, game, map_types: result.mapTypes.join('|'), winner: result.winner, win_reason:last.win_reason, rounds_played: result.rows.length,
    final_infected: last.infected, final_seeds: last.seeds,
    seeds_cleared_total: last.seeds_cleared_total, infections_cleared_total: last.infections_cleared_total,
    final_blocked_total: last.blocked_total });
}
const out = path.resolve(String(args.out ?? 'outputs/simulation_rounds.csv'));
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, toCsv(roundRows), 'utf8');
const gameOut = /_rounds\.csv$/i.test(out)
  ? out.replace(/_rounds\.csv$/i, '_games.csv')
  : out.replace(/\.csv$/i, '_games.csv');
fs.writeFileSync(gameOut, toCsv(gameRows), 'utf8');
console.log(`Assumptions: 3 irregular maps with ${config.cellsPerMap} cells each, two port links; ${config.apPerPlayer} personal action plus ${config.bonusAp} team actions per round; ${config.seedInfections} initial seeds; ${config.spreadInfectionsPerRound} Spread seed per round plus one every ${config.extraEvery} rounds; each public infection plants a hidden seed at the start of Spread's turn before Resistance responds; ${config.maxRounds}-round simulation safety cap; Spread wins when ${config.winFraction * 100}% of the board is infected or seeded.`);
for (const policy of ['combined']) {
  const subset = gameRows.filter(row => row.policy === policy);
  const wins = subset.filter(row => row.winner === 'Spread').length;
  const unresolved = subset.filter(row => row.winner === 'Unresolved').length;
  console.log(`${policy}: Spread wins ${wins}/${subset.length} (${(wins/subset.length*100).toFixed(1)}%); unresolved at simulation safety cap ${unresolved}; average rounds ${(subset.reduce((s,r)=>s+r.rounds_played,0)/subset.length).toFixed(2)}; average final infected ${(subset.reduce((s,r)=>s+r.final_infected,0)/subset.length).toFixed(2)}`);
}
console.log(`Round-by-round data: ${out}\nPer-game outcomes: ${gameOut}`);















