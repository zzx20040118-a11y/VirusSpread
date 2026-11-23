"""Balance sim for VirusSpread, feature branch rules (2026-11-23), with tunable knobs.

Rules modelled (from index.html on feature/map-pool-random-seeds-ap-growth-manual-spread):
- maps x cells_per_map triangle cells; coastal port candidates per map; Spread links ports.
- Spread: 2 initial hidden seeds (different maps). Start of each Spread turn every public
  infection plants `auto` adjacent hidden seeds; then Spread places `spread` seeds adjacent
  to any infection/seed (via links too).
- Resistance: each player 1 personal AP (+1 next round per infection they cleared) and a
  shared pool. Search a cell = 1 AP (removes seed if there). Clear public infection = 2 AP.
- Seeds planted this round become public after Resistance responds.
- Spread wins: every cell infected or seeded. Resistance wins: nothing left.
"""
import random, sys, itertools, json

TILES = [  # (orientation,row,col) coords from balance-simulation.mjs
 [[0,0,0],[1,0,0],[0,0,1],[0,1,0],[1,1,0],[1,-1,1],[0,1,1],[1,1,-1],[1,0,-1],[0,1,-1],[1,1,1],[1,0,1]],
 [[0,0,0],[1,0,0],[0,1,0],[1,0,-1],[0,1,-1],[1,1,-2],[1,1,-1],[0,2,-2],[1,2,-2],[0,2,-1],[1,2,-3],[0,3,-3]],
 [[0,0,0],[1,-1,0],[1,0,-1],[1,0,0],[0,1,0],[0,0,1],[0,-1,0],[1,-1,1],[0,-1,1],[1,-1,-1],[0,0,-1],[1,1,0]],
 [[0,0,0],[1,-1,0],[0,-1,1],[0,-1,0],[1,-1,1],[0,0,1],[1,0,1],[1,-2,0],[0,-2,1],[1,-2,1],[1,0,0],[0,0,2]],
]
def nbrs(o,r,c):
    return [(1,r,c),(1,r,c-1),(1,r-1,c)] if o==0 else [(0,r,c),(0,r+1,c),(0,r,c+1)]

def build(cfg, rng):
    M, C = cfg['maps'], cfg['cells']
    adj, ports, nodes = {}, [], []
    for m in range(M):
        coords = [tuple(x) for x in rng.choice(TILES)[:C]]
        s = set(coords)
        coast = [i for i,x in enumerate(coords) if any(n not in s for n in nbrs(*x))]
        k = min(cfg['ports'], len(coast))
        ports.append([coast[int(i*len(coast)/k)] for i in range(k)])
        for i in range(C): adj[(m,i)] = []; nodes.append((m,i))
        for i,j in itertools.combinations(range(C),2):
            if coords[j] in nbrs(*coords[i]):
                adj[(m,i)].append((m,j)); adj[(m,j)].append((m,i))
    # which map pairs get a link
    order = list(range(M)); rng.shuffle(order)
    if cfg['links'] == 'chain':   pairs = [(order[i],order[i+1]) for i in range(M-1)]
    elif cfg['links'] == 'ring':  pairs = [(order[i],order[(i+1)%M]) for i in range(M)] if M>2 else [(0,1)]
    elif cfg['links'] == 'double':  # chain, but every adjacent pair joined twice
        pairs = [(order[i],order[i+1]) for i in range(M-1)]*2
    free = [rng.sample(p, len(p)) for p in ports]
    for a,b in pairs:
        if not free[a] or not free[b]: continue
        pa, pb = (a,free[a].pop()), (b,free[b].pop())
        adj[pa].append(pb); adj[pb].append(pa)
    return nodes, adj, ports

def play(cfg, rng):
    nodes, adj, ports = build(cfg, rng)
    M, total = cfg['maps'], len(nodes)
    deg = lambda n: len(adj[n])
    infected, seeds = set(), set()
    for m in rng.sample(range(M), min(2, M)):
        seeds.add(rng.choice([n for n in nodes if n[0]==m]))
    bonus = [0]*M
    for rnd in range(1, cfg['cap']+1):
        # ---- Spread turn
        for src in sorted(infected):
            for _ in range(cfg['auto']):
                opts = [v for v in adj[src] if v not in infected and v not in seeds]
                if opts: seeds.add(max(opts, key=lambda v:(deg(v), rng.random())))
        n_place = cfg['spread'] + (1 if cfg['extra_every'] and rnd % cfg['extra_every']==0 else 0)
        for _ in range(n_place):
            legal = {v for n in infected|seeds for v in adj[n] if v not in infected and v not in seeds}
            if not legal: break
            seeds.add(max(legal, key=lambda v:(deg(v), rng.random())))
        if len(infected)+len(seeds) >= total: return 'S', rnd
        # ---- Resistance turn
        ap = [1+b for b in bonus]; bonus = [0]*M; pool = cfg['shared']
        reported = set(infected); remote = {m for (m,_) in reported}
        # most-infected maps act first and get first call on the pool
        for m in sorted(range(M), key=lambda m: -sum(1 for n in infected if n[0]==m)):
            missed = set()
            while True:
                local = [n for n in infected if n[0]==m]
                avail = ap[m] + pool
                def spend(k):
                    nonlocal pool
                    p = min(ap[m], k); ap[m] -= p; pool -= (k-p)
                if local and avail >= cfg['clear']:
                    tgt = max(local, key=lambda n: sum(1 for v in adj[n] if v not in infected))
                    infected.discard(tgt); spend(cfg['clear']); bonus[m] += cfg['clear_bonus']; continue
                if avail < 1: break
                # don't drain the pool searching if another map has infections to clear
                if ap[m] == 0 and any(n[0]!=m for n in infected): break
                near = [v for n in reported if n[0]==m for v in adj[n] if v[0]==m and v not in infected and v not in missed]
                cand = near or ([ (m,p) for p in ports[m] if (m,p) not in infected and (m,p) not in missed] if remote-{m} else [])
                if not cand:
                    if ap[m] == 0: break   # blind search only with personal AP
                    cand = [n for n in nodes if n[0]==m and n not in infected and n not in missed]
                    if not cand: break
                g = rng.choice(cand); spend(1)
                if g in seeds: seeds.discard(g)
                else: missed.add(g)
        infected |= seeds; seeds = set()
        if len(infected) >= total: return 'S', rnd
        if not infected: return 'R', rnd
    return 'U', cfg['cap']

BASE = dict(maps=3, cells=8, ports=5, links='chain', spread=1, extra_every=0, auto=1,
            shared=3, clear=2, clear_bonus=1, cap=100)

def run(over, n=3000, seed=1):
    cfg = {**BASE, **over}; rng = random.Random(seed)
    res = [play(cfg, rng) for _ in range(n)]
    s = sum(r=='S' for r,_ in res); u = sum(r=='U' for r,_ in res)
    rounds = sum(k for _,k in res)/n
    return s/n*100, u/n*100, rounds

if __name__ == '__main__':
    sweeps = json.loads(sys.argv[1])
    for label, over in sweeps:
        s,u,r = run(over)
        print(f"{label:<34} Spread {s:5.1f}%  Resist {100-s-u:5.1f}%  unresolved {u:4.1f}%  avg rounds {r:5.1f}")
