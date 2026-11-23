# Balance sweep for the feature-branch rules (2026-11-23, balance_sim.py)

3,000 bot games per row. Changes are made one at a time from the feature-branch rules (3 maps × 8 cells, 5 outlets, chain links, 1 seed per round, shared pool 3, clear costs 2 and gives +1 AP).

| Setting | Spread | Resistance | Unresolved | Avg rounds |
|---|---|---|---|---|
| Feature-branch rules | 85.7% | 10.7% | 3.6% | 16.4 |
| 2 / 4 / 5 maps | 84.9 / 85.3 / 86.1% | ~11% | ~3.5% | 13.3 / 18.8 / 20.4 |
| Ring links / double links | 86.0 / 84.5% | 10–12% | ~3.5% | 16.0 / 15.0 |
| 2 / 3 / 4 outlets per map | 68.4 / 80.5 / 82.8% | 29.2 / 15.7 / 13.3% | 2–4% | 14–16 |
| Spread 2 seeds per round | 100% | 0% | 0% | 6.3 |
| Spread +1 every 3rd round | 98.6% | 1.4% | 0% | 10.2 |
| Shared pool 2 / 4 / 5 | 99.1 / 42.4 / 3.9% | 0.8 / 45.1 / 85.5% | 0 / 12.5 / 10.6% | 10.0 / 26.6 / 20.7 |
| **Shared 5 + extra every 3rd + 4 outlets (this branch)** | **46.2%** | **53.5%** | **0.2%** | **20.4** |
| Shared 5 + extra every 3rd + 5 outlets | 57.9% | 41.6% | 0.5% | 23.1 |
| Shared 5 + extra every 3rd + 3 outlets | 32.9% | 66.7% | 0.3% | 18.0 |

Map count and link topology barely move the win rate; they mostly change game length. Spread speed and the Resistance pool are steep. The extra third-round seed removes most stalemates. Both sides are simple bots, so use these numbers to compare settings, not as table win rates.

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
