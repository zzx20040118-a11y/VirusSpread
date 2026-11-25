# Spread / Resistance prototype

Open `index.html` in a browser to play on one device. Resistance only sees the active player's map; Spread sees the stitched map. At setup, click two port cells on different maps to make a link; repeat with two unused ports to connect all three maps.

## Voice and tutorial

Open 语音房间 and create a Jitsi room. Copy its invite link for other players. The first participant signs in as moderator. The room starts audio-only and muted. Use the standalone window if the browser blocks embedded microphone access. Voice works across devices. Board actions take place on the device running the game. Open 玩法教程 for a five-step walkthrough.

## AI players

Use the player selectors at the top of the screen to set any of the four seats to human or AI. The selectors stay visible with a saved game and can be changed at any time. AI seats act automatically after a short pause. The Spread bot chooses the stitched exits and seed routes; Resistance bots search locally using visible infection clues, remember clear searches, and clear public infections. Resistance bots do not inspect hidden seeds to choose a search. This is a local heuristic bot, so no API key or network connection is needed. You can also set every seat to AI to watch a full game.

## Terrain calendar playtest

Weather happens on rounds 3, 6 and 9. The full calendar is visible from setup. On round 3, each matching public infection can grow by up to four spaces. On round 6, each matching public infection automatically spreads through adjacent non-infected areas. A crossing can relay through the far harbor even if it is already infected. Round 9 relief originates at each matching clear or secretly seeded tile and cleans its island and directly linked islands. All sources use the terrain snapshot at event start.

Clearing a public infection costs two AP in every round. A normal search costs one. Each Resistance player receives one personal AP and the team shares three. Each clear grants that player one extra AP next round. Local mobilization begins on round 9. Spread starts with two seeds on distinct cells, which may be on the same island. From round 2 it can use two distinct public sources for basic spread and plant one manual seed. Full coverage wins for Spread. Complete cleanup or surviving round 10 wins for Resistance.

Run `node tests/smoke.mjs` for the prototype checks. The standalone balance simulator and saved results describe older rules.
