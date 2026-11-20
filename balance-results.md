# Historical coastal-port results (before the seed timing fix)

10,000 games, seed 424242, 100-round diagnostic cap. The simulation uses the five coastal candidates on each map. Two initial seeds start on different maps. Resistance can search candidate ports after a teammate reports infections, and cannot use the secret link endpoints to rank cells. Spread won 8,293 games and Resistance won 1,707, averaging 15.10 rounds. This measures the simulator's policies, which differ from the in-game bots and human players. Both the geography and the simulation policy changed since the historical run below.

## Historical five-outlet balance check

Five batches of 10,000 automated games (seeds 2026, 31415, 271828, 123456, 8675309). Rules tested: three connected maps of eight triangles each (24 spaces); five candidate outlet cells per map; two randomly chosen outlet pairs connect all three maps; two initial seeds; Spread places one seed each round and a second every third round; each public infection plants one adjacent hidden seed at the start of Spread's turn; Resistance gets one personal action each and four shared actions; searching costs one action and clearing a public infection costs two. The blockade action and separate allocation screen are removed. Wins still require full coverage or complete cleanup.

- Spread wins: 22,811 / 50,000 (45.62%).
- Resistance wins: 27,161 / 50,000 (54.32%).
- Unresolved at the simulator's 100-round diagnostic cap: 28 / 50,000 (0.06%); these are not counted as wins.
- Among resolved games: Spread 45.65%, Resistance 54.35%.
- Average game length: about 15.6 rounds.

Five marked outlets give Resistance a modest edge under this randomized simulation policy. The simulator does not model a human Spread player deliberately choosing the most favorable locations or physical drag precision, so actual table results may differ. There is no round-limit victory.
