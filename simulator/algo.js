// ------------- Edmonds–Karp maximum-flow ----------------
// Input format (all integers, 1-based vertices, directed edges):
//   n m
//   u1 v1 w1
//   ...
//   um vm wm
//   s t
//
// Output: a single line containing the maximum flow value
// --------------------------------------------------------


function max_flow(default_graph) {
  const n = default_graph[0].length      // number of vertices
  const m = default_graph[1].length          // number of edges
  // console.log(n, m);
  

  // Adjacency list.  Each entry is {to, rev, cap}
  const G = {};
    default_graph[0].forEach(vertex => {
    G[vertex] = [];
  });

  /**
   * Adds a forward edge (u→v, capacity c) and its residual edge (v→u, capacity 0)
   * rev stores the index of the reverse edge so we can update both in O(1)
   */
  function addEdge(u, v, c) {
    G[u].push({ to: v, rev: G[v].length, cap: c });
    G[v].push({ to: u, rev: G[u].length - 1, cap: 0 });
  }

  // read edges
  for (let i = 0; i < m; ++i) {
    const u = default_graph[1][i][0], v = default_graph[1][i][1], w = default_graph[1][i][2];
    addEdge(u, v, w);
  }

  // source s and sink t
  const s = default_graph[0][0], t = default_graph[0][1];
  // console.log(s, t);

  /**
   * BFS to find the shortest (fewest-edge) augmenting path.
   * Returns the bottleneck flow along that path and records the parent edges.
   */
  function bfs() {
    const parentV = {};
    const parentE = {};
    default_graph[0].forEach(v => {
      parentV[v] = -1;
      parentE[v] = null;
    });
    parentV[s] = s;

    const q = [s];
    while (q.length && parentV[t] === -1) {
      const u = q.shift();
      for (const e of G[u]) {
        if (e.cap > 0 && parentV[e.to] === -1) {
          parentV[e.to] = u;
          parentE[e.to] = e;
          q.push(e.to);
          if (e.to === t) break;
        }
      }
    }

    if (parentV[t] === -1) return 0; // no augmenting path

    // compute bottleneck capacity
    let flow = Infinity;
    for (let v = t; v !== s; v = parentV[v]) {
      flow = Math.min(flow, parentE[v].cap);
    }
    // update residual capacities
    for (let v = t; v !== s; v = parentV[v]) {
      const e  = parentE[v];
      const re = G[e.to][e.rev];
      e.cap  -= flow;
      re.cap += flow;
    }
    return flow;
  }

  // Edmonds–Karp main loop
  let maxFlow = 0;
  while (true) {
    const aug = bfs();
    if (aug === 0) break; // no augmenting path left
    maxFlow += aug;
  }

  const res ={};
  res.maxFlow = maxFlow;
  res.G = G;
  
  return res;
}


const default_graph = [
    ['s', 't', 'A', 'B', 'C', 'D'],
    [
        ['s', 'A', 7],
        ['s', 'D', 4],
        ['D', 'A', 3],
        ['A', 'B', 5],
        ['D', 'C', 2],
        ['A', 'C', 3],
        ['C', 'B', 3],
        ['B', 't', 8],
        ['C', 't', 5]
    ]
]

console.log(max_flow(default_graph));
