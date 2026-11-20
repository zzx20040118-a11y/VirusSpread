# Faster full-infection/full-cleanup balance check

10,000 automated games, seed 25071. Rules tested: two starting seeds; Spread places one seed each round plus a second on every third round; each public infection plants one adjacent hidden seed at the start of Spread's turn; Resistance gets one personal action each and five shared actions; search/block costs one action and clearing a public infection costs two. Wins still require full coverage or clearing every infection and seed. No round-limit win was used.

- Spread wins: 5,417 (54.17%).
- Resistance wins: 4,579 (45.79%).
- Still unresolved at the simulator's 100-round diagnostic cap: 4 (0.04%); these are not awarded to either side.
- Among resolved games: Spread 54.19%, Resistance 45.81%.
- Length: 17.11 rounds on average; median 17; 90% finished by round 30 and 95% by round 36. The longest resolved sample took 99 rounds.

This is shorter than the prior tested rules (33.11 rounds on average; 90% finished by round 63). The result is near the target 55/45 balance and keeps the full-board/full-cleanup endings. It does not guarantee a 20-minute maximum: the simulation does not model real player discussion time or blockade choices, and a small number of games lasted much longer. The online game has no timer or round-limit victory.
