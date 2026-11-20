# Spread / Resistance prototype

Open `index.html` in a browser to play on one device. Resistance only sees the active player's map; Spread sees the stitched map.

## Rules in this build

- Three irregular maps of 12 edge-connected triangles each. Spread connects the maps through two pairs of ports.
- Spread places two initial hidden seeds on separate maps. Each round it places one seed, plus one additional seed every third round. It may extend from public infections or hidden seeds.
- At the start of Spread's turn, each public infection plants one adjacent hidden seed before Resistance responds. If that infection is cleared later in the response, its seed remains; if it was cleared before Spread's turn, it plants nothing. Seeds mature after a later Resistance response.
- Resistance gets one action per player and five shared actions. Searching for a seed and blocking a linked exit cost one action; clearing a public infection costs two. A missed search tells the team that the selected cell is currently clear; players can share the result to avoid repeating a search.
- Blocking a linked exit closes it for the next Spread turn. The same linked pair then has to remain open for one round before Resistance can block it again; the cooldown applies to the whole pair, whichever endpoint was blocked.
- Resistance wins by clearing every infection and seed. Spread wins when all 36 areas are infected or hold a hidden seed. The playable game has no round-limit victory.

## Balance simulation

Run `node balance-simulation.mjs --runs 10000 --seed 25071 --initial-seeds 2 --ap 1 --bonus-ap 5 --clear-infection-ap 2 --auto-seeds 1 --spread-actions 1 --extra-every 3 --win-fraction 1 --threshold-includes-seeds true --rounds 100 --out results/rounds.csv`.

The simulation's round limit is only a safety cap for reporting unresolved cases; it does not award a win. Run `node tests/smoke.mjs` for basic rule wiring checks.
