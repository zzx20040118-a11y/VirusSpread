# Balance result: one deliberate Spread placement per round

Command: `node balance-simulation.mjs --runs 10000 --seed 7 --spread-actions 1 --out results/one_chain_rounds.csv`

Assumptions: three 12-cell irregular triangular maps, two port links; two initial hidden seeds; each of three Resistance players gets one action plus three shared actions each round; Spread places one seed each round and may extend from public infections or any hidden seed; surviving infections generate one neighboring hidden seed after each Resistance response; hidden seeds mature after the next Resistance response; Spread wins at 18 simultaneous infections or if anything remains after round 20.

Results:

- Resistance wins: 5,015 / 10,000 (50.15%).
- Spread wins: 4,985 / 10,000 (49.85%).
- Spread wins by reaching the infection threshold: 4,134 (82.93% of Spread wins).
- Spread wins by having residue after round 20: 851 (17.07% of Spread wins).
- Mean game length: 10.43 rounds.

This is close to an even split and gives Spread a deliberate route choice each round. It is a simulation estimate, not a guarantee of human play balance; the automated Resistance policy guesses randomly among local candidates.
