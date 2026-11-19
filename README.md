# Spread / Resistance prototype

Open `index.html` in a browser to play on one device. The Resistance view only shows the active player's map. The spread and resistance rules are kept in this file so they can be edited directly.

## Candidate rules in this build

- Three irregular maps, 12 edge-connected triangles per map; Spread links the three maps through two pairs of ports.
- Spread places four seeds each round. A seed placed by Spread can be found during the current Resistance turn.
- Each Resistance player gets one action per round; the team assigns three extra actions. Searching, clearing an infection, and blocking an exit each use one action.
- A failed search protects the selected cell from infection growth for that round.
- Each infection that remains after Resistance responds creates one hidden neighboring seed. That seed stays hidden through the next Resistance response and only then matures.
- Resistance wins by clearing all seeds and infections. Spread wins at 18 simultaneous infections or if anything remains after round 20.

## Balance simulation

Run `node balance-simulation.mjs --runs 10000 --ap 1 --bonus-ap 3 --bonus-every 1 --spread-actions 4 --auto-seeds 1 --rounds 20 --win-fraction 0.5 --out results/rounds.csv`.

Run `node tests/smoke.mjs` for basic rule wiring checks.

The simulation estimates strategy outcomes; it does not model real table discussion or every possible human strategy. See `balance-results.md` for the current result and its limitation.


