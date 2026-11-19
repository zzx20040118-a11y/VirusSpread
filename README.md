# Spread / Resistance prototype

Open `index.html` in a browser to play on one device. The Resistance view only shows the active player's map. Spread sees the stitched full map.

## Candidate rules in this build

- Three irregular maps, 12 edge-connected triangles per map; Spread links the three maps through two pairs of ports.
- Spread places one hidden seed each round. It may extend from a public infection or any hidden seed, so Spread chooses whether to branch or advance a route. Resistance cannot see seeds.
- Each Resistance player gets one action per round; the team assigns three extra actions. Searching, clearing an infection, and blocking an exit each use one action.
- A failed search protects the selected cell from infection growth for that round.
- Each infection that remains after Resistance responds creates one hidden neighboring seed. That seed stays hidden through the next Resistance response and only then matures.
- Resistance wins by clearing all seeds and infections. Spread wins at 18 simultaneous infections or if anything remains after round 20.

## Balance simulation

Run `node balance-simulation.mjs --runs 10000 --seed 7 --ap 1 --bonus-ap 3 --spread-actions 1 --auto-seeds 1 --rounds 20 --win-fraction 0.5 --out results/rounds.csv`.

The 10,000-game result in `balance-results.md` is a model estimate. It uses a fixed resistance search policy; real players choosing targets differently may get different results.

Run `node tests/smoke.mjs` for basic rule wiring checks.
