# Spread / Resistance prototype

Open `index.html` in a browser to play on one device. Resistance only sees the active player's map; Spread sees the stitched map. At setup, click two port cells on different maps to make a link; repeat with two unused ports to connect all three maps.

## Voice and tutorial

Open 语音房间 and create a Jitsi room. Copy its invite link for other players. The first participant signs in as moderator. The room starts audio-only and muted. Use the standalone window if the browser blocks embedded microphone access. Voice works across devices. Board actions take place on the device running the game. Open 玩法教程 for a five-step walkthrough.

## AI players

Use the player selectors at the top of the screen to set any of the four seats to human or AI. The selectors stay visible with a saved game and can be changed at any time. AI seats act automatically after a short pause. The Spread bot chooses the stitched exits and seed routes; Resistance bots search locally using visible infection clues, remember clear searches, and clear public infections. Resistance bots do not inspect hidden seeds to choose a search. This is a local heuristic bot, so no API key or network connection is needed. You can also set every seat to AI to watch a full game.

## Rules in this build

- Three irregular maps of eight edge-connected triangles each (24 areas total). Five numbered triangles per map are marked as outlet candidates; all five have an exposed edge and are visible locally. Spread clicks ports to make two outlet pairs, and Resistance cannot see which cells were connected.
- Spread places two initial hidden seeds on separate maps. Each round it places one seed, plus one additional seed every third round. It may extend from public infections or hidden seeds.
- At the start of Spread's turn, each public infection plants one adjacent hidden seed before Resistance responds. If that infection is cleared later in the response, its seed remains; if it was cleared before Spread's turn, it plants nothing. All surviving seeds become public infections at the end of the Resistance response in their planting round.
- Resistance gets one basic action per player and four shared actions for the team. The shared pool is spent during Resistance turns, so it no longer needs a separate allocation step. Searching for a seed costs one action; clearing a public infection costs two. A missed search tells the team that the selected cell is currently clear.
- The blockade action has been removed to prevent repeated port blocking from stalling play. Spread still uses the stitched links, and Resistance still shares search findings freely.
- Resistance wins by clearing every infection and seed. Spread wins when all 24 areas are infected or hold a hidden seed. The playable game has no round-limit victory.

## Balance simulation

Run `node balance-simulation.mjs --runs 10000 --seed 30147 --cells-per-map 8 --ports-per-map 5 --initial-seeds 2 --ap 1 --bonus-ap 4 --clear-infection-ap 2 --auto-seeds 1 --spread-actions 1 --extra-every 3 --win-fraction 1 --threshold-includes-seeds true --rounds 100 --out results/rounds.csv`.

Historical balance check before restricting outlets to the coast: 50,000 automated games over five seeds gave Resistance 54.4% and Spread 45.6%. The simulation selects two legal links randomly; a human Spread player can choose links strategically, so this estimate may not match table play exactly. See `balance-results.md`.

The simulation's round limit is only a safety cap for reporting unresolved cases; it does not award a win. Run `node tests/smoke.mjs` for basic rule wiring checks.Preview deployment test
