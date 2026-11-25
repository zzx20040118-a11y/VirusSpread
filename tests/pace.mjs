// Run: node tests/pace.mjs [games-per-calendar] [seed]
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const simulate = (html, num, seed=96)=>{
const src=html.match(/<script>([\s\S]*?)<\/script>/)[1],hand=src.match(/window.continueHandoff=.*?;\n/)[0].replace('window.continueHandoff','const continueHandoff');const math=Object.create(Math);math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
return Function('Math','num',src.slice(src.indexOf('const $'),src.indexOf('\nwindow.setAISeat='))+'\n'+hand+`
render=()=>{};persist=()=>{};const out=[];
for(const c of CALENDARS){const z={o:0,s:0,r:0,t:0,sum:0,mid:0,h:Array(11).fill(0)};for(let i=0;i<num;i++){makeGame({spread:true,resistance:[true,true,true]});state.calendar=c;let n=0;while(state.phase!=='finished'&&n++<500)runAI();if(state.phase!=='finished'||state.round>10)throw Error('turn flow');if(state.openingElimination){z.o++;continue}z[state.winner==='Spread'?'s':state.winReason.includes('撑过')?'t':'r']++;z.sum+=state.round;z.h[state.round]++;if(state.round>=6&&state.round<=9)z.mid++}out.push(z)}return out;`)(math,num)};
const results = simulate(html, Number(process.argv[2] || 2500), Number(process.argv[3] || 20261125));
console.table(results.map(({o,s,r,t,sum,mid},i) => ({calendar:'ABCD'[i], opening:o, spread:s, cleanup:r, timeout:t, endedIn6to9:mid, meanRound:sum/(s+r+t)})));
