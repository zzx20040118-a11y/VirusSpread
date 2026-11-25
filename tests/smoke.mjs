import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

assert.match(html, /const CELLS_PER_MAP=8/, 'each map has eight spaces for a shorter search');
assert.match(html, /function availableAP\(m=state\.activeMap\)\{return \(state\.ap\[m\]\|\|0\)\+\(state\.sharedPool\|\|0\)\}/, 'players can use shared actions during their turn without allocating them first');
assert.doesNotMatch(html, /matureAfter:state\.round\+1/, 'automatic seeds must not get an extra hidden round');
assert.match(html, /matureAfter:state\.round/, 'Spread seeds can be handled in the current response');
assert.match(html, /function fullCoverage\(\)\{return state\.infected\.length\+state\.seeds\.length>=CELLS_PER_MAP\*3\}/, 'Spread wins when infection or seeds cover the full board');
assert.doesNotMatch(html, /state\.round>=20/, 'the game has no round-limit victory');
assert.doesNotMatch(html, /window\.blockExit/, 'the blockade action is removed to prevent repeated blocking loops');
assert.doesNotMatch(html, /state\.phase==='allocation'/, 'there is no separate action-allocation phase');
assert.match(html, /function guess\(\)[\s\S]*?搜索[\s\S]*?当前没有隐藏种子/, 'a failed search gives information without creating a protected cell');
assert.match(html, /已经埋下的种子仍会成熟/, 'already planted seeds remain independent after their source infection is cleared');
assert.match(html, /不会再产生新种子/, 'a cleared infection cannot plant future seeds');

const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
Function(script); // Parse the complete browser script before exercising the engine.
const engine = script.slice(script.indexOf('const $'), script.indexOf('\nwindow.setAISeat='));
Function('assert', engine + `
  render = () => {};
  persist = () => {};
  for (const calendar of CALENDARS) {
    makeGame();
    state.calendar = calendar;
    assert.deepEqual(Object.keys(calendar.events), ['3','6','9']);
    assert.equal(EVENTS[calendar.events[9]].purge, true);
    for (let round = 1; round <= MAX_ROUNDS; round++) {
      state.round = round;
      assert.equal(clearCost(0), 2);
      runCalendarEvent();
      assert.equal(!!activeEvent(), [3,6,9].includes(round));
      assert.ok(eventSeedQuota() <= 4);
    }
    state.phase='resistance'; state.round=3;
    state.calendar={...calendar,events:{2:'rain',3:'heatwave',4:'rain'}};
    updateRemainingWeather();
    assert.deepEqual(state.calendar.events,{2:'rain',3:'heatwave',6:calendar.events[6],9:calendar.events[9]});
  }
  state.round=9;
  state.calendar=CALENDARS[1]; state.maps[0].terrain.fill('plains');
  state.infected=[0]; state.seeds=[{id:1,planted:9}];
  startSpreadRound();
  assert.equal(state.winner,'Resistance');
  assert.equal(state.seeds.length,0);
  state.phase='resistance'; state.round=10; state.activeMap=0;
  state.infected=[0]; state.ap=[1,0,0]; state.sharedPool=1; selected=0;
  clearInfection();
  assert.deepEqual(state.infected,[]); assert.equal(availableAP(),0);
  for (const layout of layoutPool) {
  const coords = layout.coords.slice(0,8);
  const ports = coastalPorts(coords);
  assert.equal(new Set(ports).size,5);
  for(const i of ports) {
    const [o,r,c] = coords[i];
    const neighbors = coords.filter(([a,b,d]) => a!==o && ((b===r && d===c) ||
      (b===r && d===c+(o?1:-1)) || (b===r+(o?1:-1) && d===c)));
    assert.ok(neighbors.length < 3, layout.name+' inland port '+i);
  }
}

`)(assert);
console.log('Prototype smoke checks passed.');
