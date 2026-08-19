import { CanvasNode, CanvasEdge } from "../types/canvas";
import { FocusTag, FocusSession, FocusBlockerConfig } from "../types/focus";
import { GoogleCalendarFeed, GoogleCalendarEvent } from "../types/googleCalendar";
import { Viewport } from "@xyflow/react";

export const SEED_NODES: CanvasNode[] = [
  {
    "id": "group-1786491645600",
    "data": {
      "title": "Matrices"
    },
    "type": "groupNode",
    "style": {
      "width": 350,
      "height": 250
    },
    "zIndex": -10,
    "measured": {
      "width": 856,
      "height": 516
    },
    "position": {
      "x": 153.36679367621355,
      "y": -428.7444939059121
    },
    "selected": false,
    "width": 856,
    "height": 516,
    "dragging": false,
    "resizing": false
  },
  {
    "id": "group-1786476431839",
    "data": {
      "title": "Vector Spaces"
    },
    "type": "groupNode",
    "style": {
      "width": 350,
      "height": 250
    },
    "width": 1024,
    "height": 491,
    "zIndex": -10,
    "dragging": false,
    "measured": {
      "width": 1024,
      "height": 491
    },
    "position": {
      "x": -40.004793166492504,
      "y": 332.55901586243897
    },
    "resizing": false,
    "selected": false
  },
  {
    "id": "group-1786470578240",
    "data": {
      "title": "Vector operations"
    },
    "type": "groupNode",
    "style": {
      "width": 350,
      "height": 250
    },
    "width": 309,
    "height": 586,
    "zIndex": -10,
    "dragging": false,
    "measured": {
      "width": 309,
      "height": 586
    },
    "position": {
      "x": -676.8587822702632,
      "y": -108.4954316316156
    },
    "selected": false,
    "resizing": false
  },
  {
    "id": "group-1786471574157",
    "data": {
      "title": "Linear dependence"
    },
    "type": "groupNode",
    "style": {
      "width": 300,
      "height": 200
    },
    "width": 461,
    "height": 372,
    "zIndex": -9,
    "dragging": false,
    "measured": {
      "width": 461,
      "height": 372
    },
    "parentId": "group-1786476431839",
    "position": {
      "x": 25,
      "y": 80
    },
    "selected": false,
    "resizing": false
  },
  {
    "id": "note-1786468990719",
    "data": {
      "title": "Vector",
      "content": "3 perspectives of vectors\n- Physics: Arrows pointing in space\n- Computer Science: Ordered list of numbers\n- Mathematics: Abstract objects where there\u2019s a sensible notion of adding 2 vectors and multiplying a vector by a scalar",
      "updatedAt": "2026-08-11T18:21:21.337Z"
    },
    "type": "noteNode",
    "style": {
      "width": 260
    },
    "dragging": false,
    "measured": {
      "width": 260,
      "height": 220
    },
    "position": {
      "x": -183.72169036040364,
      "y": 28.734272422446466
    },
    "selected": false
  },
  {
    "id": "note-1786469278409",
    "data": {
      "title": "Vector addition",
      "content": "(Visually) walking along the first [[vector]], then along the second [[vector]]",
      "updatedAt": "2026-08-11T18:21:21.341Z"
    },
    "type": "noteNode",
    "style": {
      "width": 260
    },
    "dragging": false,
    "measured": {
      "width": 260,
      "height": 108
    },
    "parentId": "group-1786470578240",
    "position": {
      "x": 23.694412007428454,
      "y": 165.84174130860112
    },
    "selected": false
  },
  {
    "id": "note-1786469497731",
    "data": {
      "title": "Vector (scalar) multiplication",
      "content": "Scaling a [[vector]] by a real scalar factor",
      "updatedAt": "2026-08-11T18:21:21.341Z"
    },
    "type": "noteNode",
    "style": {
      "width": 260
    },
    "dragging": false,
    "measured": {
      "width": 260,
      "height": 118
    },
    "parentId": "group-1786470578240",
    "position": {
      "x": 27.661342611025333,
      "y": 438.9097375432123
    },
    "selected": false
  },
  {
    "id": "note-1786469882546",
    "data": {
      "title": "Vector subtraction",
      "content": "(Visually) walking along the first [[vector]], then along the opposite direction of the second [[vector]]",
      "updatedAt": "2026-08-11T18:21:21.341Z"
    },
    "type": "noteNode",
    "style": {
      "width": 260
    },
    "dragging": false,
    "measured": {
      "width": 260,
      "height": 127
    },
    "parentId": "group-1786470578240",
    "position": {
      "x": 21.277831225852296,
      "y": 298.312562004673
    },
    "selected": false
  },
  {
    "id": "note-1786470205447",
    "data": {
      "title": "Linear combination",
      "content": "A sum of scaled [[vector]]",
      "updatedAt": "2026-08-11T18:46:03.169Z"
    },
    "type": "noteNode",
    "style": {
      "width": 260
    },
    "dragging": false,
    "measured": {
      "width": 260,
      "height": 90
    },
    "parentId": "group-1786476431839",
    "position": {
      "x": 637.749137431949,
      "y": 14.893487260497636
    },
    "selected": false
  },
  {
    "id": "note-1786470813035",
    "data": {
      "title": "Span",
      "content": "The set of all possible vectors reachable via a [[Linear combination]] a given set of vectors",
      "updatedAt": "2026-08-11T17:54:40.782Z"
    },
    "type": "noteNode",
    "style": {
      "width": 260
    },
    "dragging": false,
    "measured": {
      "width": 260,
      "height": 127
    },
    "parentId": "group-1786476431839",
    "position": {
      "x": 626.5384270800625,
      "y": 163.93577776237618
    },
    "selected": false
  },
  {
    "id": "note-1786471076834",
    "data": {
      "title": "Basis",
      "content": "A set of [[Linearly independent]] vectors that [[Span]] a given vector space",
      "updatedAt": "2026-08-11T17:58:56.052Z"
    },
    "type": "noteNode",
    "style": {
      "width": 260
    },
    "dragging": false,
    "measured": {
      "width": 260,
      "height": 108
    },
    "parentId": "group-1786476431839",
    "position": {
      "x": 630.0724966431992,
      "y": 337.6026232704372
    },
    "selected": false
  },
  {
    "id": "note-1786471153018",
    "data": {
      "title": "Linearly Dependent",
      "content": "At least one [[vector]] in the set can be expressed as a [[Linear combination]] of the others",
      "updatedAt": "2026-08-17T01:17:57.945Z"
    },
    "type": "noteNode",
    "style": {
      "width": 260
    },
    "dragging": false,
    "measured": {
      "width": 260,
      "height": 127
    },
    "parentId": "group-1786471574157",
    "position": {
      "x": 22.482924344370517,
      "y": 227.51767480144122
    },
    "selected": false
  },
  {
    "id": "note-1786471180770",
    "data": {
      "title": "Linearly Independent",
      "content": "No [[vector]] in the set can be expressed as a [[Linear combination]] of the others",
      "updatedAt": "2026-08-11T18:21:21.341Z"
    },
    "type": "noteNode",
    "style": {
      "width": 260
    },
    "dragging": false,
    "measured": {
      "width": 260,
      "height": 136
    },
    "parentId": "group-1786471574157",
    "position": {
      "x": 25,
      "y": 80
    },
    "selected": false
  },
  {
    "id": "note-1786476657434",
    "data": {
      "title": "Linear transformation",
      "content": "A transformation where\n1. The origin remains fixed\n2. The grid lines remain parallel and evenly spaced",
      "updatedAt": "2026-08-11T19:31:43.022Z"
    },
    "type": "noteNode",
    "style": {
      "width": 260
    },
    "dragging": false,
    "measured": {
      "width": 260,
      "height": 172
    },
    "position": {
      "x": -374.0298360832345,
      "y": -729.6041803593251
    },
    "selected": false
  },
  {
    "id": "note-1786477096710",
    "data": {
      "title": "Matrix",
      "content": "",
      "updatedAt": "2026-08-11T19:38:19.596Z"
    },
    "type": "noteNode",
    "style": {
      "width": 260
    },
    "measured": {
      "width": 260,
      "height": 90
    },
    "parentId": "group-1786491645600",
    "position": {
      "x": 253.57451940070143,
      "y": 45.96684026330553
    },
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-1786477156324",
    "data": {
      "title": "Matrix multiplication (vector)",
      "content": "$$\nunderbrace(mat(a, b; c, d), \"Transformation Matrix\")\nunderbrace(mat(x; y), \"Input Vector\")\n= x underbrace(mat(a; c), \"where \" hat(i) \" lands\")\n+ y underbrace(mat(b; d), \"where \" hat(j) \" lands\")\n= underbrace(mat(a x + b y; c x + d y), \"Matrix Multiplication Formula\")\n$$",
      "updatedAt": "2026-08-14T01:43:16.633Z"
    },
    "type": "noteNode",
    "style": {
      "width": 260
    },
    "width": 634,
    "height": 146,
    "dragging": false,
    "measured": {
      "width": 634,
      "height": 146
    },
    "parentId": "group-1786491645600",
    "position": {
      "x": 64.65431412223722,
      "y": 171.83212895345991
    },
    "resizing": false,
    "selected": false
  },
  {
    "id": "group-foundations-classical",
    "type": "groupNode",
    "data": {
      "title": "Foundations of Computation",
      "color": "blue"
    },
    "position": {
      "x": 8000,
      "y": -900
    },
    "style": {
      "width": 930,
      "height": 490
    },
    "width": 930,
    "height": 490,
    "zIndex": -10,
    "selected": false,
    "dragging": false,
    "resizing": false
  },
  {
    "id": "group-complexity-models",
    "type": "groupNode",
    "data": {
      "title": "Complexity & Computation Models",
      "color": "purple"
    },
    "position": {
      "x": 9010,
      "y": -900
    },
    "style": {
      "width": 620,
      "height": 490
    },
    "width": 620,
    "height": 490,
    "zIndex": -10,
    "selected": false,
    "dragging": false,
    "resizing": false
  },
  {
    "id": "group-thermodynamics-info",
    "type": "groupNode",
    "data": {
      "title": "Physics & Thermodynamics of Computation",
      "color": "amber"
    },
    "position": {
      "x": 8000,
      "y": -350
    },
    "style": {
      "width": 930,
      "height": 490
    },
    "width": 930,
    "height": 490,
    "zIndex": -10,
    "selected": false,
    "dragging": false,
    "resizing": false
  },
  {
    "id": "group-quantum-shift",
    "type": "groupNode",
    "data": {
      "title": "The Quantum Shift",
      "color": "featherGreen"
    },
    "position": {
      "x": 9010,
      "y": -350
    },
    "style": {
      "width": 620,
      "height": 490
    },
    "width": 620,
    "height": 490,
    "zIndex": -10,
    "selected": false,
    "dragging": false,
    "resizing": false
  },
  {
    "id": "group-quantum-speedup",
    "type": "groupNode",
    "data": {
      "title": "Quantum Speedup & Computational Advantage",
      "color": "indigo"
    },
    "position": {
      "x": 8000,
      "y": 200
    },
    "style": {
      "width": 930,
      "height": 500
    },
    "width": 930,
    "height": 500,
    "zIndex": -10,
    "selected": false,
    "dragging": false,
    "resizing": false
  },
  {
    "id": "group-quantum-cost-learning",
    "type": "groupNode",
    "data": {
      "title": "Quantum Cost & Learning Theory",
      "color": "teal"
    },
    "position": {
      "x": 9010,
      "y": 200
    },
    "style": {
      "width": 620,
      "height": 500
    },
    "width": 620,
    "height": 500,
    "zIndex": -10,
    "selected": false,
    "dragging": false,
    "resizing": false
  },
  {
    "id": "group-quantum-hardware",
    "type": "groupNode",
    "data": {
      "title": "Quantum Hardware Horizons & Fault Tolerance",
      "color": "rose"
    },
    "position": {
      "x": 8250,
      "y": 770
    },
    "style": {
      "width": 1140,
      "height": 380
    },
    "width": 1140,
    "height": 380,
    "zIndex": -10,
    "selected": false,
    "dragging": false,
    "resizing": false
  },
  {
    "id": "group-quantum-linear-algebra",
    "type": "groupNode",
    "data": {
      "title": "Matrix Operators & Quantum Norms",
      "color": "emerald"
    },
    "position": {
      "x": 9710,
      "y": -430
    },
    "style": {
      "width": 900,
      "height": 720
    },
    "width": 900,
    "height": 720,
    "zIndex": -10,
    "selected": false,
    "dragging": false,
    "resizing": false
  },
  {
    "id": "note-alan-turing",
    "type": "noteNode",
    "parentId": "group-foundations-classical",
    "data": {
      "title": "Alan Turing",
      "content": "Formalized the mathematical abstraction of computation via the [[Turing Machine]] to define algorithmic limits, computability, and decidability.",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 30,
      "y": 70
    },
    "style": {
      "width": 270
    },
    "width": 270,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-john-von-neumann",
    "type": "noteNode",
    "parentId": "group-foundations-classical",
    "data": {
      "title": "John von Neumann",
      "content": "Formalized foundational computer architecture (ALU, control unit, memory, I/O) where instructions and data share a unified memory space.",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 30,
      "y": 260
    },
    "style": {
      "width": 270
    },
    "width": 270,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-turing-machine",
    "type": "noteNode",
    "parentId": "group-foundations-classical",
    "data": {
      "title": "Turing Machine",
      "content": "Abstract theoretical model capable of running any classical algorithm:\n- Infinite tape\n- Read/write head\n- State register\n- Transition table",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 330,
      "y": 70
    },
    "style": {
      "width": 270
    },
    "width": 270,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-turing-completeness",
    "type": "noteNode",
    "parentId": "group-foundations-classical",
    "data": {
      "title": "Turing Completeness",
      "content": "A system is Turing complete if it can simulate any universal [[Turing Machine]].\n\n> All known classical computing architectures are Turing equivalent.",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 330,
      "y": 260
    },
    "style": {
      "width": 270
    },
    "width": 270,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-probabilistic-turing-machine",
    "type": "noteNode",
    "parentId": "group-foundations-classical",
    "data": {
      "title": "Probabilistic Turing Machine (PTM)",
      "content": "A deterministic [[Turing Machine]] augmented with a classical random bit generator.\n\n- Probabilities are non-negative real numbers summing to $1$.\n- Errors add up based on runtime duration, not on state space size.",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 630,
      "y": 70
    },
    "style": {
      "width": 270
    },
    "width": 270,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-computational-complexity",
    "type": "noteNode",
    "parentId": "group-complexity-models",
    "data": {
      "title": "Computational Complexity",
      "content": "- **Polynomial Time**: $O(n^k)$, where $k$ is a fixed constant independent of input size $n$ (efficiently computable)\n- **Exponential Time**: $O(c^n)$, where base $c > 1$ (inefficient for large $n$)\n- **Factorial Time**: $O(n!)$",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 30,
      "y": 70
    },
    "style": {
      "width": 260
    },
    "width": 260,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-classical-vs-quantum-distinction",
    "type": "noteNode",
    "parentId": "group-complexity-models",
    "data": {
      "title": "Classical vs Quantum PTM Distinction",
      "content": "A quantum computer is **not** a [[Probabilistic Turing Machine (PTM)]].\n\n- **Classical PTM**: Real non-negative probabilities summing to $1$.\n- **Quantum**: Complex probability amplitudes exhibiting constructive and destructive interference.",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 320,
      "y": 70
    },
    "style": {
      "width": 270
    },
    "width": 270,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-computational-error-scaling",
    "type": "noteNode",
    "parentId": "group-complexity-models",
    "data": {
      "title": "Error Scaling in Classical & PTM",
      "content": "- **Classical Computing**: Error accumulation is linear.\n- **Probabilistic Computing (PTM)**: Errors accumulate based on how long you run the algorithm, not on how large the state space is.",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 30,
      "y": 290
    },
    "style": {
      "width": 560
    },
    "width": 560,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-information-is-physical",
    "type": "noteNode",
    "parentId": "group-thermodynamics-info",
    "data": {
      "title": "Information is Physical",
      "content": "Computation is fundamentally bounded by physical thermodynamics.\n\n- **[[Claude Shannon]]**: Linked information theory to entropy\n- **[[Landauer's Principle]]**: Minimum energy cost of bit erasure\n- **[[Reversible Computation]]**: Zero-dissipation theoretical limit",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 30,
      "y": 70
    },
    "style": {
      "width": 270
    },
    "width": 270,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-claude-shannon",
    "type": "noteNode",
    "parentId": "group-thermodynamics-info",
    "data": {
      "title": "Claude Shannon",
      "content": "Formally linked information theory to thermodynamic entropy ($S$):\n$$ S = -k_B sum_i p_i ln p_i $$",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 330,
      "y": 70
    },
    "style": {
      "width": 270
    },
    "width": 270,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-landauers-principle",
    "type": "noteNode",
    "parentId": "group-thermodynamics-info",
    "data": {
      "title": "Landauer's Principle",
      "content": "Erasing a single bit of information dissipates a minimum thermodynamic energy cost:\n$$ W = k_B T ln 2 $$",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 630,
      "y": 70
    },
    "style": {
      "width": 270
    },
    "width": 270,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-reversible-computation",
    "type": "noteNode",
    "parentId": "group-thermodynamics-info",
    "data": {
      "title": "Reversible Computation",
      "content": "Demonstrated by **Charles Bennett**:\nComputation without bit erasure can theoretically proceed with **zero energy dissipation** via reversible logic operations.",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 330,
      "y": 260
    },
    "style": {
      "width": 570
    },
    "width": 570,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-extended-church-turing",
    "type": "noteNode",
    "parentId": "group-quantum-shift",
    "data": {
      "title": "Extended Church-Turing Thesis (ECTT)",
      "content": "> Any reasonable physical model of computation can be simulated in polynomial time by a [[Probabilistic Turing Machine (PTM)]].\n\n*(Challenged by quantum systems)*",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 30,
      "y": 70
    },
    "style": {
      "width": 260
    },
    "width": 260,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-quantum-shift-feynman",
    "type": "noteNode",
    "parentId": "group-quantum-shift",
    "data": {
      "title": "The Quantum Shift (Feynman & Manin)",
      "content": "- **Entanglement**: Quantum correlations violating classical local realism.\n- **Exponential State Space**: An $n$-qubit system requires $2^n$ continuous complex parameters, creating an exponential simulation bottleneck for classical [[Turing Machine]]s.",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 320,
      "y": 70
    },
    "style": {
      "width": 270
    },
    "width": 270,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-quantum-ectt",
    "type": "noteNode",
    "parentId": "group-quantum-shift",
    "data": {
      "title": "Quantum ECTT",
      "content": "Replaces classical [[Extended Church-Turing Thesis (ECTT)]]:\n\n> Any realistic physical process can be simulated in polynomial time by a quantum computer (e.g., algorithms by Shor, Lloyd).",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 30,
      "y": 290
    },
    "style": {
      "width": 560
    },
    "width": 560,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-quantum-speedup",
    "type": "noteNode",
    "parentId": "group-quantum-speedup",
    "data": {
      "title": "Quantum Speedup",
      "content": "$$\n\"Quantum Speedup\" = (log(min \"Cost\"(\"classical\"))) / (log(\"Cost\"(\"quantum\")))\n$$\n\nIf $n^(alpha_c)$ is classical cost and $n^(alpha_q)$ is quantum cost, ratio $(alpha_c) / (alpha_q)$:\n- $(alpha_c) / (alpha_q) = 2$: **Quadratic Speedup** (e.g., Grover's)\n- $(alpha_c) / (alpha_q) = 3$: **Cubic Speedup**",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 30,
      "y": 70
    },
    "style": {
      "width": 410
    },
    "width": 410,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-speedup-classifications",
    "type": "noteNode",
    "parentId": "group-quantum-speedup",
    "data": {
      "title": "Speedup Classifications & Advantage",
      "content": "- **Significant Quantum Speedup**: Speedups strictly greater than quadratic ($(alpha_c) / (alpha_q) > 2$)\n- **Superpolynomial Speedup**: $alpha_c -> infinity$ as $n -> infinity$ while $alpha_q$ remains bounded\n- **Exponential Quantum Advantage (EQA)**: Subset of superpolynomial speedup where classical cost grows exponentially ($O(c^n)$) but quantum cost is polynomial ($O(n^k)$)",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 470,
      "y": 70
    },
    "style": {
      "width": 430
    },
    "width": 430,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-origin-of-quantum-speedup",
    "type": "noteNode",
    "parentId": "group-quantum-speedup",
    "data": {
      "title": "Origin of Quantum Speedup",
      "content": "Speedup fundamentally stems from the difference between probability structures:\n- **Classical Probability Density Function**: Sums directly to 1: $sum_i p_i = 1$\n- **Quantum Amplitude**: Complex values whose squared magnitudes sum to 1: $sum_i |alpha_i|^2 = 1$\n- Enables **constructive interference** (amplifying correct answers) and **destructive interference** (cancelling wrong paths).",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 30,
      "y": 310
    },
    "style": {
      "width": 870
    },
    "width": 870,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-quantum-algorithm-cost",
    "type": "noteNode",
    "parentId": "group-quantum-cost-learning",
    "data": {
      "title": "Quantum Algorithm Cost",
      "content": "$$\n\"Cost\" approx \"Total Gate Complexity\" times \"# of Repetitions\"\n$$\n\nThree Main Cost Stages:\n- **Input Cost**: Cost of preparing initial state $U_I$\n- **Running Cost**: Coherent execution of quantum algorithm circuit\n- **Output Cost**: Quantum measurement and state readout",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 30,
      "y": 70
    },
    "style": {
      "width": 560
    },
    "width": 560,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-quantum-learning-theory",
    "type": "noteNode",
    "parentId": "group-quantum-cost-learning",
    "data": {
      "title": "Quantum Learning Theory",
      "content": "A field that studies how efficiently one can infer properties of an unknown quantum state from state preparations and measurements.",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 30,
      "y": 290
    },
    "style": {
      "width": 260
    },
    "width": 260,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-quantum-state-tomography",
    "type": "noteNode",
    "parentId": "group-quantum-cost-learning",
    "data": {
      "title": "Quantum State Tomography",
      "content": "Procedure to reconstruct/recover an unknown quantum state on a classical computer.\n\n> **Exponential Bottleneck**: Cost grows **exponentially** relative to the size of the quantum system.",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 320,
      "y": 290
    },
    "style": {
      "width": 270
    },
    "width": 270,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-fault-tolerance-threshold",
    "type": "noteNode",
    "parentId": "group-quantum-hardware",
    "data": {
      "title": "Fault-Tolerance Threshold Theorem",
      "content": "If the physical error rate of quantum operations is below a threshold value (around $p_\"th\" approx 0.001 = 10^(-3)$), it is possible to perform quantum computation for an arbitrary length of time with arbitrarily high accuracy via quantum error correction.",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 30,
      "y": 70
    },
    "style": {
      "width": 340
    },
    "width": 340,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-quantum-hardware-eras",
    "type": "noteNode",
    "parentId": "group-quantum-hardware",
    "data": {
      "title": "Quantum Hardware Eras",
      "content": "- **NISQ (Noisy Intermediate-Scale Quantum)**: Current era of noisy, uncorrected physical qubits.\n- **EFTQC (Early Fault-Tolerant Quantum Computers)**: Expected in the next few years (IBM roadmap).\n- **FTQC (Fully Fault-Tolerant Quantum Computers)**: Long-term goal with universal fault-tolerant logical qubits.",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 400,
      "y": 70
    },
    "style": {
      "width": 340
    },
    "width": 340,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-quantum-roadmap-timeline",
    "type": "noteNode",
    "parentId": "group-quantum-hardware",
    "data": {
      "title": "Hardware Evolution Timeline",
      "content": "$$\n\"NISQ\" arrow.r.long \"EFTQC\" arrow.r.long \"FTQC\"\n$$\n\nProgression from noisy physical qubits to fault-tolerant logical qubits capable of arbitrary circuit depth.",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 770,
      "y": 70
    },
    "style": {
      "width": 340
    },
    "width": 340,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-complex-vector-norm",
    "type": "noteNode",
    "parentId": "group-quantum-linear-algebra",
    "data": {
      "title": "Complex Vector 2-Norm",
      "content": "For complex/imaginary vectors, uses the complex conjugate transpose inner product:\n$$\nnorm(v)_2 = sqrt(v^dagger v) = sqrt(sum_(i=1)^n |v_i|^2)\n$$",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 30,
      "y": 70
    },
    "style": {
      "width": 260
    },
    "width": 260,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-hermitian-conjugate",
    "type": "noteNode",
    "parentId": "group-quantum-linear-algebra",
    "data": {
      "title": "Hermitian Conjugate (Conjugate Transpose)",
      "content": "Transpose and then take complex conjugates of all matrix entries:\n$$\nA^dagger = (overline(A))^T = (A^T)^*\n$$\nAlso known as conjugate transpose or adjoint operator.",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 320,
      "y": 70
    },
    "style": {
      "width": 260
    },
    "width": 260,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-operator-norm",
    "type": "noteNode",
    "parentId": "group-quantum-linear-algebra",
    "data": {
      "title": "Operator Norm (Induced 2-Norm)",
      "content": "$$\nnorm(A) = sup_(norm(v)=1) norm(A v) = sigma_\"max\"(A)\n$$\nMaximum amplification factor under matrix transformation $A$ (equals largest singular value $sigma_\"max\"(A)$).",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 610,
      "y": 70
    },
    "style": {
      "width": 260
    },
    "width": 260,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-hermitian-matrix",
    "type": "noteNode",
    "parentId": "group-quantum-linear-algebra",
    "data": {
      "title": "Hermitian Matrix",
      "content": "A matrix equal to its [[Hermitian Conjugate (Conjugate Transpose)]]:\n$$\nA = A^dagger\n$$\n- All eigenvalues are real ($lambda_i in RR$)\n- Represents physical quantum observables.",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 30,
      "y": 280
    },
    "style": {
      "width": 260
    },
    "width": 260,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-normal-matrix",
    "type": "noteNode",
    "parentId": "group-quantum-linear-algebra",
    "data": {
      "title": "Normal Matrix",
      "content": "A matrix that commutes with its [[Hermitian Conjugate (Conjugate Transpose)]]:\n$$\nA A^dagger = A^dagger A\n$$\n- Unitarily diagonalizable via the Spectral Theorem.",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 320,
      "y": 280
    },
    "style": {
      "width": 260
    },
    "width": 260,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-unitary-matrix",
    "type": "noteNode",
    "parentId": "group-quantum-linear-algebra",
    "data": {
      "title": "Unitary Matrix",
      "content": "A matrix whose [[Hermitian Conjugate (Conjugate Transpose)]] is its inverse:\n$$\nU^dagger U = U U^dagger = I ==> U^dagger = U^(-1)\n$$\n- Length-preserving and inner-product-preserving\n- Represents all closed quantum system time evolutions.",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 610,
      "y": 280
    },
    "style": {
      "width": 260
    },
    "width": 260,
    "selected": false,
    "dragging": false
  },
  {
    "id": "note-positive-semidefinite-matrix",
    "type": "noteNode",
    "parentId": "group-quantum-linear-algebra",
    "data": {
      "title": "Positive Semidefinite Matrix (Positive Operator)",
      "content": "A [[Hermitian Matrix]] whose eigenvalues are all non-negative:\n$$\nlambda_i >= 0 quad forall i\n$$\nEquivalently, $angle.l v | A | v angle.r >= 0$ for all vectors $v$.\n- Mathematical foundation for **quantum density matrices** ($rho$).",
      "updatedAt": "2026-08-18T22:52:03.904Z"
    },
    "position": {
      "x": 30,
      "y": 490
    },
    "style": {
      "width": 550
    },
    "width": 550,
    "selected": false,
    "dragging": false
  },
  {
    "id": "group-qc-vectors",
    "type": "groupNode",
    "position": {
      "x": 1300,
      "y": -450
    },
    "style": {
      "width": 620,
      "height": 500
    },
    "width": 620,
    "height": 500,
    "zIndex": -10,
    "data": {
      "title": "Quantum Vectors & States"
    }
  },
  {
    "id": "group-qc-matrices",
    "type": "groupNode",
    "position": {
      "x": 2000,
      "y": -450
    },
    "style": {
      "width": 920,
      "height": 500
    },
    "width": 920,
    "height": 500,
    "zIndex": -10,
    "data": {
      "title": "Matrix Classes & Adjoints"
    }
  },
  {
    "id": "group-qc-norms",
    "type": "groupNode",
    "position": {
      "x": 1300,
      "y": 120
    },
    "style": {
      "width": 920,
      "height": 500
    },
    "width": 920,
    "height": 500,
    "zIndex": -10,
    "data": {
      "title": "Operator Positivity & Norms"
    }
  },
  {
    "id": "group-qc-asymptotics",
    "type": "groupNode",
    "position": {
      "x": 2300,
      "y": 120
    },
    "style": {
      "width": 620,
      "height": 500
    },
    "width": 620,
    "height": 500,
    "zIndex": -10,
    "data": {
      "title": "Asymptotics & Quantum Scale"
    }
  },
  {
    "id": "note-qc-complex-vec",
    "type": "noteNode",
    "parentId": "group-qc-vectors",
    "position": {
      "x": 25,
      "y": 70
    },
    "style": {
      "width": 260
    },
    "data": {
      "title": "Complex Vector ($v in CC^N$)",
      "content": "An $N$-tuple of complex numbers:\n$ v = mat(v_0; v_1; dots.v; v_(N-1)) in CC^N $\n\n- *0-based indexing (default)*: $j in [N] := {0, dots, N - 1}$\n- *1-based indexing*: $j = 1, dots, N$ (when explicit)\n- Unnormalized unless specified.",
      "pinned": false,
      "updatedAt": "2026-08-18T20:29:00.000Z"
    }
  },
  {
    "id": "note-qc-vec-norm",
    "type": "noteNode",
    "parentId": "group-qc-vectors",
    "position": {
      "x": 320,
      "y": 70
    },
    "style": {
      "width": 260
    },
    "data": {
      "title": "Vector 2-Norm ($||v||$)",
      "content": "The standard Euclidean norm for $v in CC^N$:\n$ ||v|| = sqrt(sum_(i in [N]) |v_i|^2) $\n\n- Determines vector length in Hilbert space $CC^N$.\n- Used to normalize vectors into pure states.",
      "pinned": false,
      "updatedAt": "2026-08-18T20:29:00.000Z"
    }
  },
  {
    "id": "note-qc-pure-state",
    "type": "noteNode",
    "parentId": "group-qc-vectors",
    "position": {
      "x": 25,
      "y": 270
    },
    "style": {
      "width": 260
    },
    "data": {
      "title": "Pure Quantum State ($|v angle.r$)",
      "content": "A nonzero, normalized vector viewed as a pure quantum state:\n$ |v angle.r = v / ||v||, quad |||v angle.r|| = 1 $\n\nRepresents a state vector in quantum information theory.",
      "pinned": false,
      "updatedAt": "2026-08-18T20:29:00.000Z"
    }
  },
  {
    "id": "note-qc-unnorm-state",
    "type": "noteNode",
    "parentId": "group-qc-vectors",
    "position": {
      "x": 320,
      "y": 270
    },
    "style": {
      "width": 260
    },
    "data": {
      "title": "Unnormalized State ($|v succ$)",
      "content": "Notation used to explicitly emphasize that a ket vector is unnormalized ($||v|| != 1$):\n$ |v succ in CC^N $",
      "pinned": false,
      "updatedAt": "2026-08-18T20:29:00.000Z"
    }
  },
  {
    "id": "note-qc-matrix-ops",
    "type": "noteNode",
    "parentId": "group-qc-matrices",
    "position": {
      "x": 25,
      "y": 70
    },
    "style": {
      "width": 270
    },
    "data": {
      "title": "Matrix Operations ($A^top, A^*, A^(-1)$)",
      "content": "For $A in CC^(M times N)$ with entries $A_(i j)$:\n- *Conjugate* $A^*$ or $overline(A)$: $(A^*)_(i j) = (A_(i j))^*$\n- *Transpose* $A^top$: $(A^top)_(i j) = A_(j i)$\n- *Inverse* $A^(-1)$: $A A^(-1) = I$",
      "pinned": false,
      "updatedAt": "2026-08-18T20:29:00.000Z"
    }
  },
  {
    "id": "note-qc-hermitian-adj",
    "type": "noteNode",
    "parentId": "group-qc-matrices",
    "position": {
      "x": 320,
      "y": 70
    },
    "style": {
      "width": 270
    },
    "data": {
      "title": "Hermitian Conjugate ($A^dagger$)",
      "content": "The adjoint (conjugate transpose) of $A in CC^(M times N)$:\n$ A^dagger = (A^top)^* = (A^*)^top $\n\nSatisfies $(A B)^dagger = B^dagger A^dagger$.",
      "pinned": false,
      "updatedAt": "2026-08-18T20:29:00.000Z"
    }
  },
  {
    "id": "note-qc-hermitian-mat",
    "type": "noteNode",
    "parentId": "group-qc-matrices",
    "position": {
      "x": 615,
      "y": 70
    },
    "style": {
      "width": 270
    },
    "data": {
      "title": "Hermitian Matrix ($A = A^dagger$)",
      "content": "A square matrix equal to its adjoint:\n$ A = A^dagger $\n\n- All eigenvalues are real: $lambda_i in RR$.\n- Observables in quantum mechanics are Hermitian.",
      "pinned": false,
      "updatedAt": "2026-08-18T20:29:00.000Z"
    }
  },
  {
    "id": "note-qc-normal-mat",
    "type": "noteNode",
    "parentId": "group-qc-matrices",
    "position": {
      "x": 25,
      "y": 270
    },
    "style": {
      "width": 270
    },
    "data": {
      "title": "Normal Matrix ($A A^dagger = A^dagger A$)",
      "content": "A square matrix that commutes with its adjoint:\n$ A A^dagger = A^dagger A $\n\n- Unitarily diagonalizable: $A = U Lambda U^dagger$.\n- Includes Hermitian and Unitary matrices.",
      "pinned": false,
      "updatedAt": "2026-08-18T20:29:00.000Z"
    }
  },
  {
    "id": "note-qc-unitary-mat",
    "type": "noteNode",
    "parentId": "group-qc-matrices",
    "position": {
      "x": 320,
      "y": 270
    },
    "style": {
      "width": 270
    },
    "data": {
      "title": "Unitary Matrix ($U^dagger = U^(-1)$)",
      "content": "An isometry whose inverse is its adjoint:\n$ U^dagger U = U U^dagger = I $\n\n- Preserves norms: $||U v|| = ||v||$.\n- Represents reversible quantum gates.",
      "pinned": false,
      "updatedAt": "2026-08-18T20:29:00.000Z"
    }
  },
  {
    "id": "note-qc-unitary-groups",
    "type": "noteNode",
    "parentId": "group-qc-matrices",
    "position": {
      "x": 615,
      "y": 270
    },
    "style": {
      "width": 270
    },
    "data": {
      "title": "Unitary Groups ($U(N), S U(N)$)",
      "content": "- *Unitary Group $U(N)$*: Set of all $N times N$ unitary matrices.\n- *Special Unitary Group $S U(N)$*:\n$ S U(N) = { U in U(N) mid(|) det(U) = 1 } $",
      "pinned": false,
      "updatedAt": "2026-08-18T20:29:00.000Z"
    }
  },
  {
    "id": "note-qc-pos-semidef",
    "type": "noteNode",
    "parentId": "group-qc-norms",
    "position": {
      "x": 25,
      "y": 70
    },
    "style": {
      "width": 270
    },
    "data": {
      "title": "Positive Semidefinite Matrix ($A succ.eq 0$)",
      "content": "A Hermitian matrix $A in CC^(N times N)$ with non-negative eigenvalues:\n$ lambda_i(A) >= 0 quad forall i $\n\n*Loewner Order*:\n- $A succ.eq B <==> A - B succ.eq 0$\n- $A prec.eq B <==> B succ.eq A$",
      "pinned": false,
      "updatedAt": "2026-08-18T20:29:00.000Z"
    }
  },
  {
    "id": "note-qc-pos-def",
    "type": "noteNode",
    "parentId": "group-qc-norms",
    "position": {
      "x": 320,
      "y": 70
    },
    "style": {
      "width": 270
    },
    "data": {
      "title": "Positive Definite Matrix ($A succ 0$)",
      "content": "A Hermitian matrix with strictly positive eigenvalues:\n$ lambda_i(A) > 0 quad forall i $\n\nStrict Loewner order: $A succ B <==> A - B succ 0$.",
      "pinned": false,
      "updatedAt": "2026-08-18T20:29:00.000Z"
    }
  },
  {
    "id": "note-qc-op-norm",
    "type": "noteNode",
    "parentId": "group-qc-norms",
    "position": {
      "x": 615,
      "y": 70
    },
    "style": {
      "width": 270
    },
    "data": {
      "title": "Operator Norm ($||A||$)",
      "content": "The induced vector 2-norm of matrix $A$:\n$ ||A|| := sup_(||v|| = 1) ||A v|| $\n\n- Equals maximum singular value $sigma_(max)(A)$.\n- Coincides with Schatten $oo$-norm $||A||_oo$.",
      "pinned": false,
      "updatedAt": "2026-08-18T20:29:00.000Z"
    }
  },
  {
    "id": "note-qc-schatten-p",
    "type": "noteNode",
    "parentId": "group-qc-norms",
    "position": {
      "x": 25,
      "y": 270
    },
    "style": {
      "width": 270
    },
    "data": {
      "title": "Schatten p-Norm ($||A||_p$)",
      "content": "For $p >= 1$, defined as:\n$ ||A||_p := (tr((A^dagger A)^(p/2)))^(1/p) $\n\nRepresents the $ell_p$-norm of singular values.",
      "pinned": false,
      "updatedAt": "2026-08-18T20:29:00.000Z"
    }
  },
  {
    "id": "note-qc-trace-norm",
    "type": "noteNode",
    "parentId": "group-qc-norms",
    "position": {
      "x": 320,
      "y": 270
    },
    "style": {
      "width": 270
    },
    "data": {
      "title": "Trace Norm ($||A||_1$)",
      "content": "The Schatten 1-norm of matrix $A$:\n$ ||A||_1 := tr(sqrt(A^dagger A)) $\n\nSums the singular values of $A$.",
      "pinned": false,
      "updatedAt": "2026-08-18T20:29:00.000Z"
    }
  },
  {
    "id": "note-qc-density-op",
    "type": "noteNode",
    "parentId": "group-qc-norms",
    "position": {
      "x": 615,
      "y": 270
    },
    "style": {
      "width": 270
    },
    "data": {
      "title": "Density Operator ($||rho||_1 = 1$)",
      "content": "Any quantum state / density operator $rho$ satisfies:\n$ rho succ.eq 0, quad ||rho||_1 = tr(rho) = 1 $\n\nNormalized with respect to the trace norm.",
      "pinned": false,
      "updatedAt": "2026-08-18T20:29:00.000Z"
    }
  },
  {
    "id": "note-qc-asymptotics",
    "type": "noteNode",
    "parentId": "group-qc-asymptotics",
    "position": {
      "x": 25,
      "y": 70
    },
    "style": {
      "width": 260
    },
    "data": {
      "title": "Asymptotic Notations ($O, Omega, Theta$)",
      "content": "For $f: RR -> CC$, $g: RR -> RR^+$:\n- *Big-$O$*: $f(x) = O(g(x)) <==> limsup_(x -> a) |f(x)| / g(x) < oo$\n- *Big-$Omega$*: $f = Omega(g) <==> g = O(f)$\n- *Big-$Theta$*: $f = Theta(g) <==> f = O(g) \"and\" g = O(f)$",
      "pinned": false,
      "updatedAt": "2026-08-18T20:29:00.000Z"
    }
  },
  {
    "id": "note-qc-soft-asymp",
    "type": "noteNode",
    "parentId": "group-qc-asymptotics",
    "position": {
      "x": 320,
      "y": 70
    },
    "style": {
      "width": 260
    },
    "data": {
      "title": "Soft Asymptotics ($tilde(O), tilde(Omega), tilde(Theta)$)",
      "content": "Suppresses subdominant polylog factors:\n$ f = tilde(O)(g) <==> f = O(g \"polylog\"(g)) $\n\n- E.g.: $O(log g log log g) = tilde(O)(log g)$.",
      "pinned": false,
      "updatedAt": "2026-08-18T20:29:00.000Z"
    }
  },
  {
    "id": "note-qc-qubit-dim",
    "type": "noteNode",
    "parentId": "group-qc-asymptotics",
    "position": {
      "x": 25,
      "y": 270
    },
    "style": {
      "width": 260
    },
    "data": {
      "title": "Qubit Dimension ($N = 2^n$)",
      "content": "When dimension $N$ and $n$ appear together:\n$ N = 2^n $\nwhere $n$ is the number of *qubits*.\n\n- $ln$ / $log$ is natural log; $log_2$ is base-2.",
      "pinned": false,
      "updatedAt": "2026-08-18T20:29:00.000Z"
    }
  }
];

export const SEED_EDGES: CanvasEdge[] = [
  {
    "id": "e-welcome-min-edge",
    "data": {
      "animated": true
    },
    "type": "customEdge",
    "source": "note-welcome",
    "target": "note-feature-min-edge",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "sourceHandle": "right",
    "targetHandle": "left"
  },
  {
    "id": "e-welcome-edge-connect",
    "data": {
      "animated": false
    },
    "type": "customEdge",
    "source": "note-welcome",
    "target": "note-feature-edge-connect",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "sourceHandle": "bottom",
    "targetHandle": "left"
  },
  {
    "id": "xy-edge__note-1786468990719left-note-1786469460844right",
    "data": {
      "animated": false
    },
    "type": "customEdge",
    "source": "note-1786468990719",
    "target": "note-1786469460844",
    "selected": false,
    "markerEnd": {
      "type": "arrowclosed"
    },
    "sourceHandle": "left",
    "targetHandle": "right"
  },
  {
    "id": "xy-edge__note-1786470205447bottom-note-1786470813035top",
    "data": {
      "animated": false
    },
    "type": "customEdge",
    "source": "note-1786470205447",
    "target": "note-1786470813035",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "sourceHandle": "bottom",
    "targetHandle": "top"
  },
  {
    "id": "xy-edge__note-1786470813035bottom-note-1786471076834top",
    "data": {
      "animated": false
    },
    "type": "customEdge",
    "source": "note-1786470813035",
    "target": "note-1786471076834",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "sourceHandle": "bottom",
    "targetHandle": "top"
  },
  {
    "id": "xy-edge__junction-1786477401919bottom-note-1786476657434bottom",
    "data": {
      "animated": false
    },
    "type": "customEdge",
    "source": "junction-1786477401919",
    "target": "note-1786476657434",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "sourceHandle": "bottom",
    "targetHandle": "bottom"
  },
  {
    "id": "xy-edge__note-1786476657434bottom-note-1786477096710top",
    "data": {
      "label": "Can be represented as",
      "animated": false
    },
    "type": "customEdge",
    "label": "Can be represented as",
    "source": "note-1786476657434",
    "target": "note-1786477096710",
    "selected": false,
    "markerEnd": {
      "type": "arrowclosed"
    },
    "sourceHandle": "right",
    "targetHandle": "left"
  },
  {
    "type": "customEdge",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "source": "note-1786468990719",
    "sourceHandle": "top",
    "target": "group-1786491645600",
    "targetHandle": "left",
    "data": {
      "animated": false
    },
    "id": "xy-edge__note-1786468990719top-group-1786491645600left"
  },
  {
    "id": "wiki-note-1786468990719-note-1786470205447",
    "source": "note-1786468990719",
    "target": "note-1786470205447",
    "type": "customEdge",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "isWikiLink": true
    },
    "sourceHandle": "right",
    "targetHandle": "left"
  },
  {
    "id": "wiki-note-1786471180770-note-1786471076834",
    "source": "note-1786471180770",
    "target": "note-1786471076834",
    "type": "customEdge",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "isWikiLink": true
    },
    "sourceHandle": "right",
    "targetHandle": "left"
  },
  {
    "id": "wiki-note-1786477096710-note-1786477156324",
    "source": "note-1786477096710",
    "target": "note-1786477156324",
    "type": "customEdge",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "isWikiLink": true
    },
    "sourceHandle": "bottom",
    "targetHandle": "top"
  },
  {
    "id": "group-auto-note-1786468990719-group-1786470578240",
    "source": "note-1786468990719",
    "target": "group-1786470578240",
    "type": "customEdge",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "isGroupAutoEdge": true
    },
    "sourceHandle": "left",
    "targetHandle": "right"
  },
  {
    "id": "group-auto-note-1786468990719-group-1786471574157",
    "source": "note-1786468990719",
    "target": "group-1786471574157",
    "type": "customEdge",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "isGroupAutoEdge": true
    },
    "sourceHandle": "right",
    "targetHandle": "top"
  },
  {
    "id": "group-auto-note-1786470205447-group-1786471574157",
    "source": "note-1786470205447",
    "target": "group-1786471574157",
    "type": "customEdge",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "isGroupAutoEdge": true
    },
    "sourceHandle": "left",
    "targetHandle": "right"
  },
  {
    "id": "edge-turing-to-machine",
    "type": "customEdge",
    "source": "note-alan-turing",
    "target": "note-turing-machine",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "label": "Formalized",
      "animated": false
    }
  },
  {
    "id": "edge-machine-to-completeness",
    "type": "customEdge",
    "source": "note-turing-machine",
    "target": "note-turing-completeness",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "label": "Defines",
      "animated": false
    }
  },
  {
    "id": "edge-machine-to-ptm",
    "type": "customEdge",
    "source": "note-turing-machine",
    "target": "note-probabilistic-turing-machine",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "label": "Augmented with randomness",
      "animated": false
    }
  },
  {
    "id": "edge-ptm-to-ectt",
    "type": "customEdge",
    "source": "note-probabilistic-turing-machine",
    "target": "note-extended-church-turing",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "label": "Classical physical baseline",
      "animated": false
    }
  },
  {
    "id": "edge-ptm-to-contrast",
    "type": "customEdge",
    "source": "note-probabilistic-turing-machine",
    "target": "note-classical-vs-quantum-distinction",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "label": "Contrasted with",
      "animated": false
    }
  },
  {
    "id": "edge-shannon-to-landauer",
    "type": "customEdge",
    "source": "note-claude-shannon",
    "target": "note-landauers-principle",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "label": "Thermodynamic basis",
      "animated": false
    }
  },
  {
    "id": "edge-landauer-to-reversible",
    "type": "customEdge",
    "source": "note-landauers-principle",
    "target": "note-reversible-computation",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "label": "Overcome by",
      "animated": false
    }
  },
  {
    "id": "edge-ectt-to-quantum-shift",
    "type": "customEdge",
    "source": "note-extended-church-turing",
    "target": "note-quantum-shift-feynman",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "label": "Classical bottleneck",
      "animated": false
    }
  },
  {
    "id": "edge-shift-to-quantum-ectt",
    "type": "customEdge",
    "source": "note-quantum-shift-feynman",
    "target": "note-quantum-ectt",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "label": "Led to",
      "animated": false
    }
  },
  {
    "id": "edge-speedup-to-hierarchy",
    "type": "customEdge",
    "source": "note-quantum-speedup",
    "target": "note-speedup-classifications",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "label": "Categorized by",
      "animated": false
    }
  },
  {
    "id": "edge-origin-to-speedup",
    "type": "customEdge",
    "source": "note-origin-of-quantum-speedup",
    "target": "note-quantum-speedup",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "label": "Enables",
      "animated": false
    }
  },
  {
    "id": "edge-cost-to-learning",
    "type": "customEdge",
    "source": "note-quantum-algorithm-cost",
    "target": "note-quantum-learning-theory",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "label": "Measurement complexity",
      "animated": false
    }
  },
  {
    "id": "edge-learning-to-tomography",
    "type": "customEdge",
    "source": "note-quantum-learning-theory",
    "target": "note-quantum-state-tomography",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "label": "Full state recovery",
      "animated": false
    }
  },
  {
    "id": "edge-threshold-to-roadmap",
    "type": "customEdge",
    "source": "note-fault-tolerance-threshold",
    "target": "note-quantum-hardware-eras",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "label": "Enables FTQC",
      "animated": false
    }
  },
  {
    "id": "edge-eras-to-timeline",
    "type": "customEdge",
    "source": "note-quantum-hardware-eras",
    "target": "note-quantum-roadmap-timeline",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "animated": true
    }
  },
  {
    "id": "edge-matrix-to-quantum-classes",
    "type": "customEdge",
    "source": "note-1786477096710",
    "target": "group-quantum-linear-algebra",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "label": "Special Quantum Classes",
      "animated": false
    }
  },
  {
    "id": "edge-adj-to-hermitian",
    "type": "customEdge",
    "source": "note-hermitian-conjugate",
    "target": "note-hermitian-matrix",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "label": "Self-adjoint",
      "animated": false
    }
  },
  {
    "id": "edge-adj-to-unitary",
    "type": "customEdge",
    "source": "note-hermitian-conjugate",
    "target": "note-unitary-matrix",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "label": "Inverse is adjoint",
      "animated": false
    }
  },
  {
    "id": "edge-hermitian-to-psd",
    "type": "customEdge",
    "source": "note-hermitian-matrix",
    "target": "note-positive-semidefinite-matrix",
    "markerEnd": {
      "type": "arrowclosed"
    },
    "data": {
      "label": "Non-negative spectrum",
      "animated": false
    }
  },
  {
    "id": "e-qc-v1",
    "source": "note-qc-complex-vec",
    "target": "note-qc-vec-norm",
    "type": "customEdge",
    "data": {
      "label": "Euclidean norm"
    }
  },
  {
    "id": "e-qc-v2",
    "source": "note-qc-vec-norm",
    "target": "note-qc-pure-state",
    "type": "customEdge",
    "data": {
      "label": "normalize"
    }
  },
  {
    "id": "e-qc-v3",
    "source": "note-qc-complex-vec",
    "target": "note-qc-unnorm-state",
    "type": "customEdge",
    "data": {
      "label": "unnormalized"
    }
  },
  {
    "id": "e-qc-m1",
    "source": "note-qc-matrix-ops",
    "target": "note-qc-hermitian-adj",
    "type": "customEdge",
    "data": {
      "label": "conjugate transpose"
    }
  },
  {
    "id": "e-qc-m2",
    "source": "note-qc-hermitian-adj",
    "target": "note-qc-hermitian-mat",
    "type": "customEdge",
    "data": {
      "label": "self-adjoint"
    }
  },
  {
    "id": "e-qc-m3",
    "source": "note-qc-hermitian-adj",
    "target": "note-qc-unitary-mat",
    "type": "customEdge",
    "data": {
      "label": "inverse adjoint"
    }
  },
  {
    "id": "e-qc-m4",
    "source": "note-qc-hermitian-mat",
    "target": "note-qc-normal-mat",
    "type": "customEdge",
    "data": {
      "label": "commutes"
    }
  },
  {
    "id": "e-qc-m5",
    "source": "note-qc-unitary-mat",
    "target": "note-qc-unitary-groups",
    "type": "customEdge",
    "data": {
      "label": "group structure"
    }
  },
  {
    "id": "e-qc-n1",
    "source": "note-qc-hermitian-mat",
    "target": "note-qc-pos-semidef",
    "type": "customEdge",
    "data": {
      "label": "non-negative eigenvalues"
    }
  },
  {
    "id": "e-qc-n2",
    "source": "note-qc-pos-semidef",
    "target": "note-qc-pos-def",
    "type": "customEdge",
    "data": {
      "label": "strictly positive"
    }
  },
  {
    "id": "e-qc-n3",
    "source": "note-qc-op-norm",
    "target": "note-qc-schatten-p",
    "type": "customEdge",
    "data": {
      "label": "p = infinity"
    }
  },
  {
    "id": "e-qc-n4",
    "source": "note-qc-schatten-p",
    "target": "note-qc-trace-norm",
    "type": "customEdge",
    "data": {
      "label": "p = 1"
    }
  },
  {
    "id": "e-qc-n5",
    "source": "note-qc-trace-norm",
    "target": "note-qc-density-op",
    "type": "customEdge",
    "data": {
      "label": "unit trace"
    }
  },
  {
    "id": "e-qc-a1",
    "source": "note-qc-asymptotics",
    "target": "note-qc-soft-asymp",
    "type": "customEdge",
    "data": {
      "label": "suppress polylog"
    }
  },
  {
    "id": "e-qc-a2",
    "source": "note-qc-qubit-dim",
    "target": "note-qc-complex-vec",
    "type": "customEdge",
    "data": {
      "label": "dimension N = 2^n"
    }
  }
];

export const SEED_VIEWPORT: Viewport = {
  "x": 644.9775096806773,
  "y": 436.0628737371792,
  "zoom": 0.5414756170155349
};

export const SEED_TAGS: FocusTag[] = [
  {
    "id": "tag-1786938163161",
    "name": "Linear Algebra",
    "color": "#FFC800",
    "createdAt": 1786938163162
  },
  {
    "id": "tag-1786938378708-0-so1n",
    "name": "Differential Equations",
    "color": "#CE82FF",
    "createdAt": 1786938378708
  },
  {
    "id": "tag-1786938381922-0-tkpu",
    "name": "Quantum Computing",
    "color": "#1CB0F6",
    "createdAt": 1786938381922
  },
  {
    "id": "tag-1786938384841-0-hf6x",
    "name": "Vibe Coding",
    "color": "#2B70C9",
    "createdAt": 1786938384841
  },
  {
    "id": "tag-1786938475525-0-nlsv",
    "name": "NSDR",
    "color": "#FF9FF3",
    "createdAt": 1786938475525
  },
  {
    "id": "tag-1786977950710-0-d54b",
    "name": "Eating",
    "color": "#777777",
    "createdAt": 1786977950710
  },
  {
    "id": "tag-1786990646266-0-hhje",
    "name": "Anime",
    "color": "#FF4B4B",
    "createdAt": 1786990646267
  },
  {
    "id": "tag-1787011034157-aye6",
    "name": "anime4i.com",
    "color": "#00D2D3",
    "createdAt": 1787011034158
  },
  {
    "id": "tag-1787011034161-s7nm",
    "name": "anime4i.com",
    "color": "#00D2D3",
    "createdAt": 1787011034161
  },
  {
    "id": "tag-1787012061971-bxdh",
    "name": "linkedin.com",
    "color": "#777777",
    "createdAt": 1787012061972
  },
  {
    "id": "tag-1787012061998-fvje",
    "name": "linkedin.com",
    "color": "#777777",
    "createdAt": 1787012061998
  }
];

export const SEED_SESSIONS: FocusSession[] = [
  {
    "id": "session-1787011515984-jsup",
    "tagId": "tag-1787011034157-aye6",
    "tagName": "anime4i.com",
    "tagColor": "#00D2D3",
    "taskTitle": "Unblocked: anime4i.com",
    "durationSeconds": 248,
    "mode": "stopwatch",
    "startedAt": 1787011267794,
    "endedAt": 1787011515984
  },
  {
    "id": "session-1787011515963-r7ld",
    "tagId": "tag-1787011034157-aye6",
    "tagName": "anime4i.com",
    "tagColor": "#00D2D3",
    "taskTitle": "Unblocked: anime4i.com",
    "durationSeconds": 248,
    "mode": "stopwatch",
    "startedAt": 1787011267794,
    "endedAt": 1787011515963
  },
  {
    "id": "session-1787005069437",
    "tagId": "tag-1786938381922-0-tkpu",
    "tagName": "Quantum Computing",
    "tagColor": "#1CB0F6",
    "durationSeconds": 1980,
    "mode": "stopwatch",
    "startedAt": 1787003040000,
    "endedAt": 1787005020000
  },
  {
    "id": "session-1787003086213",
    "tagId": "tag-1786938475525-0-nlsv",
    "tagName": "NSDR",
    "tagColor": "#FF9FF3",
    "durationSeconds": 600,
    "mode": "countdown",
    "startedAt": 1787002440000,
    "endedAt": 1787003040000
  },
  {
    "id": "session-1787000799918",
    "tagId": "tag-1786977950710-0-d54b",
    "tagName": "Eating",
    "tagColor": "#777777",
    "durationSeconds": 660,
    "mode": "stopwatch",
    "startedAt": 1787000460000,
    "endedAt": 1787001120000
  },
  {
    "id": "session-1786997743874",
    "tagId": "tag-1786938384841-0-hf6x",
    "tagName": "Vibe Coding",
    "tagColor": "#2B70C9",
    "durationSeconds": 1920,
    "mode": "countdown",
    "startedAt": 1786996800000,
    "endedAt": 1786998720000
  },
  {
    "id": "session-1786996158380",
    "tagId": "tag-1786938381922-0-tkpu",
    "tagName": "Quantum Computing",
    "tagColor": "#1CB0F6",
    "durationSeconds": 1817,
    "mode": "stopwatch",
    "startedAt": 1786994341380,
    "endedAt": 1786996158380
  },
  {
    "id": "session-1786993053522",
    "tagId": "tag-1786938475525-0-nlsv",
    "tagName": "NSDR",
    "tagColor": "#FF9FF3",
    "durationSeconds": 480,
    "mode": "countdown",
    "startedAt": 1786992540000,
    "endedAt": 1786993020000
  },
  {
    "id": "session-1786991778401",
    "tagId": "tag-1787011034157-aye6",
    "tagName": "anime4i.com",
    "tagColor": "#00D2D3",
    "durationSeconds": 1140,
    "mode": "stopwatch",
    "startedAt": 1786990620000,
    "endedAt": 1786991760000
  },
  {
    "id": "session-1786990117845",
    "tagId": "tag-1786938381922-0-tkpu",
    "tagName": "Quantum Computing",
    "tagColor": "#1CB0F6",
    "durationSeconds": 3649,
    "mode": "stopwatch",
    "startedAt": 1786986468845,
    "endedAt": 1786990117845
  },
  {
    "id": "session-1786985025619",
    "tagId": "tag-1786938475525-0-nlsv",
    "tagName": "NSDR",
    "tagColor": "#FF9FF3",
    "durationSeconds": 600,
    "mode": "stopwatch",
    "startedAt": 1786983840000,
    "endedAt": 1786984440000
  },
  {
    "id": "session-1786982152406",
    "tagId": "tag-1786938381922-0-tkpu",
    "tagName": "Quantum Computing",
    "tagColor": "#1CB0F6",
    "durationSeconds": 3600,
    "mode": "countdown",
    "startedAt": 1786980240000,
    "endedAt": 1786983840000
  },
  {
    "id": "session-1786980863571",
    "tagId": "tag-1786938475525-0-nlsv",
    "tagName": "NSDR",
    "tagColor": "#FF9FF3",
    "taskTitle": "NSDR Session",
    "durationSeconds": 780,
    "mode": "stopwatch",
    "startedAt": 1786979460000,
    "endedAt": 1786980240000
  },
  {
    "id": "session-1786979516071",
    "tagId": "tag-1786977950710-0-d54b",
    "tagName": "Eating",
    "tagColor": "#777777",
    "taskTitle": "Eating Session",
    "durationSeconds": 1529,
    "mode": "stopwatch",
    "startedAt": 1786977956321,
    "endedAt": 1786979516071
  }
];

export const SEED_BLOCKER_CONFIG: FocusBlockerConfig = {
  "enabled": true,
  "mode": "unlock_on_timer",
  "blockedDomains": [
    "youtube.com",
    "twitter.com",
    "x.com",
    "reddit.com",
    "instagram.com",
    "facebook.com",
    "tiktok.com",
    "twitch.tv",
    "netflix.com",
    "discord.com",
    "anime4i.com",
    "linkedin.com"
  ],
  "unlockedUntil": null,
  "activeSiteStopwatches": {}
};

export const SEED_GCAL_FEEDS: GoogleCalendarFeed[] = [
  {
    "id": "gcal-1787001640574-k1it0",
    "name": "School",
    "url": "https://timetable.mypurdue.purdue.edu/Timetabling/export?x=64bcxkomrwugwj3s1umn8aihimsxqmjr2",
    "color": "#8E24AA",
    "enabled": true,
    "syncStatus": "success",
    "lastSyncedAt": 1787015136988,
    "eventCount": 148
  }
];

export const SEED_GCAL_EVENTS: GoogleCalendarEvent[] = [
  {
    "id": "2110290846_1787571000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1787571000000,
    "end": 1787574000000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1787589000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1787589000000,
    "end": 1787592000000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1787668200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1787668200000,
    "end": 1787672700000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2111936209_1787682600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 23358-565",
    "description": "Recitation",
    "location": "WTHR 214",
    "start": 1787682600000,
    "end": 1787685600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2111936209"
  },
  {
    "id": "2110290846_1787743800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1787743800000,
    "end": 1787746800000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1787761800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1787761800000,
    "end": 1787764800000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1787841000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1787841000000,
    "end": 1787845500000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2110290846_1787916600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1787916600000,
    "end": 1787919600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1787934600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1787934600000,
    "end": 1787937600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110290846_1788175800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1788175800000,
    "end": 1788178800000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1788193800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1788193800000,
    "end": 1788196800000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1788273000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1788273000000,
    "end": 1788277500000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2111936209_1788287400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 23358-565",
    "description": "Recitation",
    "location": "WTHR 214",
    "start": 1788287400000,
    "end": 1788290400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2111936209"
  },
  {
    "id": "2110290846_1788348600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1788348600000,
    "end": 1788351600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1788366600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1788366600000,
    "end": 1788369600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1788445800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1788445800000,
    "end": 1788450300000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2110290846_1788521400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1788521400000,
    "end": 1788524400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1788539400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1788539400000,
    "end": 1788542400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110290846_1788780600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1788780600000,
    "end": 1788783600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1788798600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1788798600000,
    "end": 1788801600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1788877800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1788877800000,
    "end": 1788882300000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2111936209_1788892200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 23358-565",
    "description": "Recitation",
    "location": "WTHR 214",
    "start": 1788892200000,
    "end": 1788895200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2111936209"
  },
  {
    "id": "2110290846_1788953400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1788953400000,
    "end": 1788956400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1788971400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1788971400000,
    "end": 1788974400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1789050600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1789050600000,
    "end": 1789055100000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2110290846_1789126200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1789126200000,
    "end": 1789129200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1789144200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1789144200000,
    "end": 1789147200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110290846_1789385400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1789385400000,
    "end": 1789388400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1789403400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1789403400000,
    "end": 1789406400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1789482600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1789482600000,
    "end": 1789487100000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2111936209_1789497000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 23358-565",
    "description": "Recitation",
    "location": "WTHR 214",
    "start": 1789497000000,
    "end": 1789500000000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2111936209"
  },
  {
    "id": "2110290846_1789558200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1789558200000,
    "end": 1789561200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1789576200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1789576200000,
    "end": 1789579200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1789655400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1789655400000,
    "end": 1789659900000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2110290846_1789731000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1789731000000,
    "end": 1789734000000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1789749000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1789749000000,
    "end": 1789752000000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110290846_1789990200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1789990200000,
    "end": 1789993200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1790008200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1790008200000,
    "end": 1790011200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1790087400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1790087400000,
    "end": 1790091900000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2111936209_1790101800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 23358-565",
    "description": "Recitation",
    "location": "WTHR 214",
    "start": 1790101800000,
    "end": 1790104800000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2111936209"
  },
  {
    "id": "2110290846_1790163000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1790163000000,
    "end": 1790166000000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1790181000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1790181000000,
    "end": 1790184000000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1790260200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1790260200000,
    "end": 1790264700000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2110290846_1790335800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1790335800000,
    "end": 1790338800000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1790353800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1790353800000,
    "end": 1790356800000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110290846_1790595000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1790595000000,
    "end": 1790598000000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1790613000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1790613000000,
    "end": 1790616000000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1790692200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1790692200000,
    "end": 1790696700000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2111936209_1790706600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 23358-565",
    "description": "Recitation",
    "location": "WTHR 214",
    "start": 1790706600000,
    "end": 1790709600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2111936209"
  },
  {
    "id": "2193646619_1790726400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Midterm Examination Event",
    "location": "LWSN B155",
    "start": 1790726400000,
    "end": 1790730000000,
    "allDay": false,
    "isRecurring": false,
    "rawUid": "2193646619"
  },
  {
    "id": "2110290846_1790767800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1790767800000,
    "end": 1790770800000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1790785800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1790785800000,
    "end": 1790788800000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1790865000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1790865000000,
    "end": 1790869500000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2110290846_1790940600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1790940600000,
    "end": 1790943600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1790958600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1790958600000,
    "end": 1790961600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110290846_1791199800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1791199800000,
    "end": 1791202800000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1791217800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1791217800000,
    "end": 1791220800000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1791297000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1791297000000,
    "end": 1791301500000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2111936209_1791311400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 23358-565",
    "description": "Recitation",
    "location": "WTHR 214",
    "start": 1791311400000,
    "end": 1791314400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2111936209"
  },
  {
    "id": "2110290846_1791372600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1791372600000,
    "end": 1791375600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1791390600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1791390600000,
    "end": 1791393600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2188046667_1791417600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "STAT 35000DIST",
    "description": "Midterm Examination Event",
    "location": "FRNY G140, WALC 1055 (Hiler Thtr)",
    "start": 1791417600000,
    "end": 1791421200000,
    "allDay": false,
    "isRecurring": false,
    "rawUid": "2188046667"
  },
  {
    "id": "2110291490_1791469800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1791469800000,
    "end": 1791474300000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2110290846_1791545400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1791545400000,
    "end": 1791548400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1791563400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1791563400000,
    "end": 1791566400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110290846_1791804600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1791804600000,
    "end": 1791807600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1791822600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1791822600000,
    "end": 1791825600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1791901800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1791901800000,
    "end": 1791906300000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2111936209_1791916200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 23358-565",
    "description": "Recitation",
    "location": "WTHR 214",
    "start": 1791916200000,
    "end": 1791919200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2111936209"
  },
  {
    "id": "2110290846_1791977400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1791977400000,
    "end": 1791980400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1791995400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1791995400000,
    "end": 1791998400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1792074600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1792074600000,
    "end": 1792079100000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2110290846_1792150200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1792150200000,
    "end": 1792153200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1792168200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1792168200000,
    "end": 1792171200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110290846_1792409400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1792409400000,
    "end": 1792412400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1792427400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1792427400000,
    "end": 1792430400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1792506600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1792506600000,
    "end": 1792511100000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2111936209_1792521000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 23358-565",
    "description": "Recitation",
    "location": "WTHR 214",
    "start": 1792521000000,
    "end": 1792524000000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2111936209"
  },
  {
    "id": "2110290846_1792582200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1792582200000,
    "end": 1792585200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1792600200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1792600200000,
    "end": 1792603200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1792679400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1792679400000,
    "end": 1792683900000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2110290846_1792755000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1792755000000,
    "end": 1792758000000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1792773000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1792773000000,
    "end": 1792776000000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110290846_1793014200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1793014200000,
    "end": 1793017200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1793032200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1793032200000,
    "end": 1793035200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1793111400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1793111400000,
    "end": 1793115900000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2111936209_1793125800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 23358-565",
    "description": "Recitation",
    "location": "WTHR 214",
    "start": 1793125800000,
    "end": 1793128800000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2111936209"
  },
  {
    "id": "2110290846_1793187000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1793187000000,
    "end": 1793190000000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1793205000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1793205000000,
    "end": 1793208000000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1793284200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1793284200000,
    "end": 1793288700000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2110290846_1793359800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1793359800000,
    "end": 1793362800000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1793377800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1793377800000,
    "end": 1793380800000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110290846_1793622600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1793622600000,
    "end": 1793625600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1793640600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1793640600000,
    "end": 1793643600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1793719800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1793719800000,
    "end": 1793724300000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2111936209_1793734200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 23358-565",
    "description": "Recitation",
    "location": "WTHR 214",
    "start": 1793734200000,
    "end": 1793737200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2111936209"
  },
  {
    "id": "2110290846_1793795400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1793795400000,
    "end": 1793798400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1793813400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1793813400000,
    "end": 1793816400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1793892600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1793892600000,
    "end": 1793897100000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2110290846_1793968200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1793968200000,
    "end": 1793971200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1793986200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1793986200000,
    "end": 1793989200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110290846_1794227400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1794227400000,
    "end": 1794230400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1794245400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1794245400000,
    "end": 1794248400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1794324600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1794324600000,
    "end": 1794329100000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2111936209_1794339000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 23358-565",
    "description": "Recitation",
    "location": "WTHR 214",
    "start": 1794339000000,
    "end": 1794342000000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2111936209"
  },
  {
    "id": "2110290846_1794400200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1794400200000,
    "end": 1794403200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1794418200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1794418200000,
    "end": 1794421200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1794497400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1794497400000,
    "end": 1794501900000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2193647457_1794531600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Midterm Examination Event",
    "location": "LWSN B155",
    "start": 1794531600000,
    "end": 1794535200000,
    "allDay": false,
    "isRecurring": false,
    "rawUid": "2193647457"
  },
  {
    "id": "2110290846_1794573000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1794573000000,
    "end": 1794576000000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1794591000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1794591000000,
    "end": 1794594000000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110290846_1794832200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1794832200000,
    "end": 1794835200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1794850200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1794850200000,
    "end": 1794853200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1794929400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1794929400000,
    "end": 1794933900000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2111936209_1794943800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 23358-565",
    "description": "Recitation",
    "location": "WTHR 214",
    "start": 1794943800000,
    "end": 1794946800000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2111936209"
  },
  {
    "id": "2188046956_1794963600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "STAT 35000DIST",
    "description": "Midterm Examination Event",
    "location": "LILY 1105, LILY G126",
    "start": 1794963600000,
    "end": 1794967200000,
    "allDay": false,
    "isRecurring": false,
    "rawUid": "2188046956"
  },
  {
    "id": "2110290846_1795005000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1795005000000,
    "end": 1795008000000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1795023000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1795023000000,
    "end": 1795026000000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1795102200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1795102200000,
    "end": 1795106700000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2110290846_1795177800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1795177800000,
    "end": 1795180800000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1795195800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1795195800000,
    "end": 1795198800000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110290846_1795437000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1795437000000,
    "end": 1795440000000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1795455000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1795455000000,
    "end": 1795458000000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1795534200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1795534200000,
    "end": 1795538700000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2111936209_1795548600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 23358-565",
    "description": "Recitation",
    "location": "WTHR 214",
    "start": 1795548600000,
    "end": 1795551600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2111936209"
  },
  {
    "id": "2110290846_1795609800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1795609800000,
    "end": 1795612800000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1795627800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1795627800000,
    "end": 1795630800000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1795707000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1795707000000,
    "end": 1795711500000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2110290846_1795782600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1795782600000,
    "end": 1795785600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1795800600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1795800600000,
    "end": 1795803600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110290846_1796041800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1796041800000,
    "end": 1796044800000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1796059800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1796059800000,
    "end": 1796062800000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1796139000000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1796139000000,
    "end": 1796143500000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2111936209_1796153400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 23358-565",
    "description": "Recitation",
    "location": "WTHR 214",
    "start": 1796153400000,
    "end": 1796156400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2111936209"
  },
  {
    "id": "2110290846_1796214600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1796214600000,
    "end": 1796217600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1796232600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1796232600000,
    "end": 1796235600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1796311800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1796311800000,
    "end": 1796316300000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2110290846_1796387400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1796387400000,
    "end": 1796390400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1796405400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1796405400000,
    "end": 1796408400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110290846_1796646600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1796646600000,
    "end": 1796649600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1796664600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1796664600000,
    "end": 1796667600000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1796743800000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1796743800000,
    "end": 1796748300000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2111936209_1796758200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 23358-565",
    "description": "Recitation",
    "location": "WTHR 214",
    "start": 1796758200000,
    "end": 1796761200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2111936209"
  },
  {
    "id": "2110290846_1796819400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1796819400000,
    "end": 1796822400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1796837400000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1796837400000,
    "end": 1796840400000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  },
  {
    "id": "2110291490_1796916600000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 35100 64933-022",
    "description": "Lecture",
    "location": "PHYS 202",
    "start": 1796916600000,
    "end": 1796921100000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110291490"
  },
  {
    "id": "2110290846_1796992200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "MA 36600 26169-586",
    "description": "Lecture",
    "location": "SCHM 122",
    "start": 1796992200000,
    "end": 1796995200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110290846"
  },
  {
    "id": "2110233039_1797010200000",
    "calendarId": "gcal-1787001640574-k1it0",
    "calendarName": "School",
    "calendarColor": "#8E24AA",
    "title": "SCLA 10100 27777-154",
    "description": "Lecture",
    "location": "SCHM 226",
    "start": 1797010200000,
    "end": 1797013200000,
    "allDay": false,
    "isRecurring": true,
    "rawUid": "2110233039"
  }
];
