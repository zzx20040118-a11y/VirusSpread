# Spread / Resistance prototype

Open `index.html` in a browser to play on one device. Resistance only sees the active player's map; Spread sees the stitched map.

## Rules in this build

- Three irregular maps of eight edge-connected triangles each (24 areas total). Spread connects the maps through two pairs of ports.
- Spread places two initial hidden seeds on separate maps. Each round it places one seed, plus one additional seed every third round. It may extend from public infections or hidden seeds.
- At the start of Spread's turn, each public infection plants one adjacent hidden seed before Resistance responds. If that infection is cleared later in the response, its seed remains; if it was cleared before Spread's turn, it plants nothing. Seeds mature after a later Resistance response.
- Resistance gets one basic action per player and four shared actions for the team. The shared pool is spent during Resistance turns, so it no longer needs a separate allocation step. Searching for a seed costs one action; clearing a public infection costs two. A missed search tells the team that the selected cell is currently clear.
- The blockade action has been removed to prevent repeated port blocking from stalling play. Spread still uses the stitched links, and Resistance still shares search findings freely.
- Resistance wins by clearing every infection and seed. Spread wins when all 24 areas are infected or hold a hidden seed. The playable game has no round-limit victory.

## Balance simulation

Run `node balance-simulation.mjs --runs 10000 --seed 30147 --cells-per-map 8 --initial-seeds 2 --ap 1 --bonus-ap 4 --clear-infection-ap 2 --auto-seeds 1 --spread-actions 1 --extra-every 3 --win-fraction 1 --threshold-includes-seeds true --rounds 100 --out results/rounds.csv`.

The simulation's round limit is only a safety cap for reporting unresolved cases; it does not award a win. Run `node tests/smoke.mjs` for basic rule wiring checks.
