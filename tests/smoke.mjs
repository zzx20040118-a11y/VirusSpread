import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

assert.match(html, /const CELLS_PER_MAP=8/, 'each map has eight spaces for a shorter search');
assert.match(html, /state\.ap=\[1,1,1\]/, 'each Resistance player gets one action');
assert.match(html, /state\.sharedPool=4/, 'the team gets four shared actions');
assert.match(html, /function availableAP\(m=state\.activeMap\)\{return \(state\.ap\[m\]\|\|0\)\+\(state\.sharedPool\|\|0\)\}/, 'players can use shared actions during their turn without allocating them first');
assert.match(html, /state\.spreadLeft=1\+\(state\.round%3===0\?1:0\)/, 'Spread gets an extra deliberate placement every third round');
assert.match(html, /availableAP\(\)<2\)return;state\.infected=state\.infected\.filter\(x=>x!==selected\);spend\(2\)/, 'clearing an infection costs two actions');
assert.match(html, /matureAfter:state\.round\+1/, 'infection-generated seeds wait through the next response');
assert.match(html, /matureAfter:state\.round/, 'Spread seeds can be handled in the current response');
assert.match(html, /function fullCoverage\(\)\{return state\.infected\.length\+state\.seeds\.length>=CELLS_PER_MAP\*3\}/, 'Spread wins when infection or seeds cover the full board');
assert.doesNotMatch(html, /state\.round>=20/, 'the game has no round-limit victory');
assert.doesNotMatch(html, /window\.blockExit/, 'the blockade action is removed to prevent repeated blocking loops');
assert.doesNotMatch(html, /state\.phase==='allocation'/, 'there is no separate action-allocation phase');
assert.match(html, /function startSpreadRound\(\)\{[\s\S]*?spreadPublicInfections\(\);/, 'public infections plant seeds when the Spread turn begins');
assert.match(html, /function guess\(\)[\s\S]*?搜索[\s\S]*?当前没有隐藏种子/, 'a failed search gives information without creating a protected cell');
assert.match(html, /已经埋下的种子仍会成熟/, 'already planted seeds remain independent after their source infection is cleared');
assert.match(html, /不会再产生新种子/, 'a cleared infection cannot plant future seeds');

const coastalRule = html.match(/function coastalPorts[\s\S]+?\n}/)[0];
const selectPorts = Function('return (' + coastalRule + ')')();
const layouts = Function('return ' + html.match(/const layoutPool=(\[[\s\S]*?\]);/)[1])();
for (const layout of layouts) {
  const coords = layout.coords.slice(0,8);
  const ports = selectPorts(coords);
  assert.equal(new Set(ports).size,5);
  for(const i of ports) {
    const [o,r,c] = coords[i];
    const neighbors = coords.filter(([a,b,d]) => a!==o && ((b===r && d===c) ||
      (b===r && d===c+(o?1:-1)) || (b===r+(o?1:-1) && d===c)));
    assert.ok(neighbors.length < 3, layout.name+' inland port '+i);
  }
}
assert.match(html,/isExit=map\.ports\.includes\(i\)/);
assert.match(html,/const route=isSpread \? linkedExit\(id\) : null/);
console.log('Prototype smoke checks passed.');
