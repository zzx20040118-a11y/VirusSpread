# Balance check: full infection or full cleanup

Simulation: 10,000 games, seed 19, two initial seeds, one deliberate Spread placement each round plus one every third round, three Resistance personal actions and three shared actions, and one hidden seed planted beside each public infection at the beginning of each Spread turn. Spread wins when all 36 spaces are infected or seeded; Resistance wins by clearing all infections and seeds. There is no round-limit victory in the playable game.

- Spread wins: 4,965 / 10,000 (49.65%).
- Resistance wins: 5,028 / 10,000 (50.28%).
- Unresolved at the simulator's 200-round diagnostic cap: 7 / 10,000 (0.07%). These are not awarded to either side.
- Among resolved games: Spread 49.68%, Resistance 50.32%.
- Average length among resolved games: 33.11 rounds.

The game now actually runs infection-to-seed growth at the start of each Spread turn. This was missing from the previous playable build, so earlier balance figures did not reflect the displayed rule. The simulation uses automated search and clearing choices and does not model human blockade decisions; the near-even result is a useful baseline, not a guarantee of tabletop win rates. The cap only flags unusually long simulations and is not a game-ending rule.
