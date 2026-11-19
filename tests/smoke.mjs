import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

assert.match(html, /state\.ap=\[1,1,1\]/, 'each Resistance player gets one action');
assert.match(html, /state\.sharedPool=3/, 'the team gets three optional actions');
assert.match(html, /state\.spreadLeft=1/, 'Spread gets one seed placement each round');
assert.match(html, /spend\(1\).*清除了一个已公开感染/s, 'clearing an infection costs one action');
assert.match(html, /matureAfter:state\.round\+1/, 'infection-generated seeds wait through the next response');
assert.match(html, /matureAfter:state\.round/, 'Spread seeds can be handled in the current response');
assert.match(html, /state\.infected\.length>=18/, 'half-board infection is a Spread victory');
assert.match(html, /state\.guarded=\[\.\.\.\(state\.guarded\|\|\[\]\),id\]/, 'a failed search protects its cell this round');

console.log('Prototype smoke checks passed.');
