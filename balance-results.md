# Compact-map balance check

10,000 automated games, seed 30147. Rules tested: three connected maps of eight triangles each (24 spaces total); two initial seeds on separate maps; Spread places one seed each round and a second every third round; each public infection plants one adjacent hidden seed at the start of Spread's turn; Resistance gets one personal action each and four shared actions; searching costs one action and clearing a public infection costs two. The shared pool is used during Resistance turns, with the automated policy prioritizing the map with the most visible infections. There is no blockade action or separate allocation screen. Wins still require full coverage or complete cleanup.

- Spread wins: 4,630 (46.30%).
- Resistance wins: 5,358 (53.58%).
- Unresolved at the simulator's 100-round diagnostic cap: 12 (0.12%); these are not counted as wins.
- Among resolved games: Spread 46.36%, Resistance 53.64%.
- Length: 16.22 rounds on average; median 14; 90% finished by round 31 and 95% by round 39.

This version reduces the board from 36 to 24 spaces, removes the repeated-blockade action and removes the pre-round shared-action allocation step. The 8-cell layouts are connected. The result is close to a 55/45 Resistance-favored balance and shorter in the average case; actual minutes still depend on discussion and decision speed, which the simulator does not model. The playable game still has no timer or round-limit victory.
