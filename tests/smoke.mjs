import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

assert.match(html, /state\.ap=\[1,1,1\]/, 'each Resistance player gets one action');
assert.match(html, /state\.sharedPool=3/, 'the team gets three optional actions');
assert.match(html, /state\.spreadLeft=1\+\(state\.round%3===0\?1:0\)/, 'Spread gets an extra deliberate placement every third round');
assert.match(html, /spend\(1\).*清除了一个已公开感染/s, 'clearing an infection costs one action');
assert.match(html, /matureAfter:state\.round\+1/, 'infection-generated seeds wait through the next response');
assert.match(html, /matureAfter:state\.round/, 'Spread seeds can be handled in the current response');
assert.match(html, /function fullCoverage\(\)\{return state\.infected\.length\+state\.seeds\.length>=CELLS_PER_MAP\*3\}/, 'Spread wins when infection or seeds cover the full board');
assert.doesNotMatch(html, /state\.round>=20/, 'the game has no round-limit victory');
assert.match(html, /state\.blockCooldownUntil\[route\?edge\(\.\.\.route\):id\]=state\.round\+2/, 'a stitched exit cannot be repeatedly blocked in consecutive rounds');
assert.match(html, /function startSpreadRound\(\)\{[\s\S]*?spreadPublicInfections\(\);/, 'public infections plant seeds when the Spread turn begins');
assert.match(html, /function guess\(\)[\s\S]*?搜索[\s\S]*?当前没有隐藏种子/, 'a failed search gives information without creating a protected cell');
assert.match(html, /已经埋下的种子仍会成熟/, 'already planted seeds remain independent after their source infection is cleared');
assert.match(html, /不会再产生新种子/, 'a cleared infection cannot plant future seeds');

console.log('Prototype smoke checks passed.');
