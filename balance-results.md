# Any-cell outlet balance check

10,000 automated games, seed 424242. Rules tested: three connected maps of eight triangles each (24 spaces); any space may be chosen as an outlet; two random outlet pairs connect all three maps; two initial seeds; Spread places one seed each round and a second every third round; each public infection plants one adjacent hidden seed at the start of Spread's turn; Resistance gets one personal action each and four shared actions; searching costs one action and clearing a public infection costs two. The blockade action and separate allocation screen are removed. Wins still require full coverage or complete cleanup.

- Spread wins: 5,266 (52.66%).
- Resistance wins: 4,732 (47.32%).
- Unresolved at the simulator's 100-round diagnostic cap: 2 (0.02%); these are not counted as wins.
- Among resolved games: Spread 52.67%, Resistance 47.33%.
- Length: 15.78 rounds on average; median 15; 90% finished by round 29 and 95% by round 35.

Random outlet selection moves the automated result from a slight Resistance advantage to a slight Spread advantage. In the playable setup, Spread can deliberately drag and align the outlet cells, so that strategy may change the actual win rate; the simulator does not model that spatial choice. All map layouts remain connected, and there is no round-limit victory.
