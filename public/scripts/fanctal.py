"""Fanctal: draw and verify the f(r, n, a) family of self-similar circular fractals.

Reference implementation of the recursive construction described in the
supplementary material of "El fanctal: area, perimeter, and a generalized
family of self-similar circular fractals" (Diaz Arcila, Diaz Gomez &
Solorzano Tovar). This is the single source of code cited by the article:
it reproduces exactly the algorithm behind the interactive figure at
https://juanma.cc/projects/fanctal, and independently verifies the closed-form
area formula the article proves, in a language-independent way. An R port
with the same two capabilities ships alongside it as fanctal.R.

The construction: divide a disk of radius r into n congruent angular
sectors; select a of them (odd indices first, then random) to hold a child
disk tangent to the parent, with scale ratio k(n) = sin(pi/n) / (1+sin(pi/n));
repeat inside every child disk until it falls below a radius threshold, or an
explicit recursion depth is reached. Coordinates use the standard
mathematical convention (y grows upward, angles measured counter-clockwise).
The web app inverts the sign of sin() only to compensate for SVG's
downward-growing y-axis; the geometry is identical.

Note on k(n): the same formula k(n) = sin(pi/n)/(1+sin(pi/n)) is evaluated
in three different numeric domains below - plain floats for drawing and the
closed-form summary, 50-digit mpmath for Method 1, and exact symbolic sympy
for Method 2 - so it is written three times on purpose, not duplicated by
accident: each method's whole point is to be numerically independent of the
others.

Note on sector selection: `select_shaded_sectors` mirrors the interactive
app exactly, including the random fallback it uses whenever the alternating
pattern does not evenly divide n. `selected_sectors` (used only by the Monte
Carlo membership test) instead applies a fully deterministic, equispaced
rule, so that the verification below is reproducible independently of any
RNG state. Both are valid: the shaded area depends only on how many sectors
are selected (a), never on which specific ones, since the n wedges are
disjoint and each selected wedge contributes a congruent piece regardless of
its neighbors.

Two independent things this script can do:

  draw    Render f(r, n, a) to SVG/PNG, exactly as before the two scripts
          were merged.
  verify  Recompute the shaded area A(r, n, a) by three independent methods
          (a truncated series summed at 50-digit precision, an exact
          symbolic self-similarity equation, and a classical Monte Carlo
          simulation) and compare them, reproducing Table I of the article.

Usage:
    python fanctal.py --n 6 --a 3 --out fanctal.svg      # draw (default command)
    python fanctal.py draw --n 8 --a 4 --depth 4 --out fanctal.png
    python fanctal.py verify
    python fanctal.py verify --pairs 7,3 9,2 --points 200000

Requirements: Python >= 3.10, matplotlib, numpy, sympy (ships mpmath).
"""

import argparse
import math
import random
import sys
from dataclasses import dataclass

import matplotlib.pyplot as plt
import mpmath
import numpy as np
import sympy as sp
from matplotlib.path import Path
from matplotlib.patches import PathPatch

EPSILON = 0.01  # default radius cutoff for drawing, relative to r0 = 1
VERIFY_SEED = 2026
DEFAULT_PAIRS = ((3, 1), (4, 2), (5, 2), (6, 3), (8, 4), (12, 6))  # Table I
DEFAULT_POINTS = 1_000_000
DIGITS = 50
MAX_RESCALINGS = 64


# ---------------------------------------------------------------------------
# shared geometry
# ---------------------------------------------------------------------------

def scale_ratio(n):
    """k(n): ratio between a child disk's radius and its parent's."""
    s = math.sin(math.pi / n)
    return s / (1 + s)


def fanctal_area(r, n, a):
    """Closed-form shaded area A(r, n, a) = pi r^2 * a(1/n - k^2) / (1 - a k^2)."""
    k = scale_ratio(n)
    return math.pi * r ** 2 * (a * (1 / n - k ** 2)) / (1 - a * k ** 2)


# ---------------------------------------------------------------------------
# drawing
# ---------------------------------------------------------------------------

def select_shaded_sectors(n, a, rng=random):
    """Pick the `a` sectors (of n) that hold a child disk.

    Mirrors the app's alternation rule: mark n-a sectors as *not* shaded,
    preferring odd indices first (so shaded sectors alternate whenever
    possible); if there are not enough odd indices, fill the rest randomly
    among the remaining ones. The `a` sectors left unmarked are shaded.
    """
    if a >= n:
        return set(range(n))
    not_shaded_count = n - a
    odd_indices = list(range(1, n, 2))
    not_shaded = odd_indices[:not_shaded_count]
    if len(not_shaded) < not_shaded_count:
        remaining = [i for i in range(n) if i not in not_shaded]
        rng.shuffle(remaining)
        not_shaded += remaining[: not_shaded_count - len(not_shaded)]
    return set(range(n)) - set(not_shaded)


def _arc_points(cx, cy, r, theta1, theta2, samples=64):
    thetas = [theta1 + (theta2 - theta1) * i / (samples - 1) for i in range(samples)]
    return [(cx + r * math.cos(t), cy + r * math.sin(t)) for t in thetas]


def sector_minus_disk_patch(cx, cy, r, theta1, theta2, hx, hy, hr, **kwargs):
    """Sector (vertex (cx,cy), radius r, from theta1 to theta2) minus a disk.

    Built as one compound path: the sector traced counter-clockwise plus the
    hole disk traced clockwise, so the opposite winding carves the hole out
    under the nonzero fill rule (equivalent to the app's evenodd trick).
    """
    outer = [(cx, cy)] + _arc_points(cx, cy, r, theta1, theta2) + [(cx, cy)]
    inner = list(reversed(_arc_points(hx, hy, hr, 0, 2 * math.pi)))
    vertices = outer + inner
    codes = (
        [Path.MOVETO] + [Path.LINETO] * (len(outer) - 1)
        + [Path.MOVETO] + [Path.LINETO] * (len(inner) - 1)
    )
    return PathPatch(Path(vertices, codes), **kwargs)


def draw_fanctal(ax, n, a, r0=1.0, c0=(0.0, 0.0), epsilon=EPSILON, depth=None,
                  color="black", seed=None):
    """Draw f(r0, n, a) into a Matplotlib axes, following the app's algorithm."""
    rng = random.Random(seed)
    shaded = select_shaded_sectors(n, a, rng)
    step = 2 * math.pi / n
    k = scale_ratio(n)

    if a >= n:
        ax.add_patch(plt.Circle(c0, r0, color=color))
        return
    if a <= 0:
        return

    def recurse(c, r, i):
        cx, cy = c
        if r < epsilon or (depth is not None and i == depth):
            if depth is not None and i == depth:
                ax.add_patch(plt.Circle(c, r, fill=False, edgecolor=color, linewidth=r / 300))
            else:
                ax.add_patch(plt.Circle(c, r, color=color))
            return
        r_next = r * k
        rho = r * (1 - k)
        for j in shaded:
            phi = j * step + step / 2
            child = (cx + rho * math.cos(phi), cy + rho * math.sin(phi))
            ax.add_patch(sector_minus_disk_patch(
                cx, cy, r, j * step, j * step + step, child[0], child[1], r_next,
                facecolor=color, edgecolor=color, linewidth=r / 300,
            ))
            recurse(child, r_next, i + 1)

    recurse(c0, r0, 0)


def run_draw(args):
    fig, ax = plt.subplots(figsize=(6, 6))
    draw_fanctal(ax, args.n, args.a, r0=args.radius, depth=args.depth, seed=args.seed)
    ax.set_xlim(-args.radius, args.radius)
    ax.set_ylim(-args.radius, args.radius)
    ax.set_aspect("equal")
    ax.axis("off")
    fig.tight_layout(pad=0)
    fig.savefig(args.out, transparent=True)

    area = fanctal_area(args.radius, args.n, args.a)
    print(f"f(r={args.radius}, n={args.n}, a={args.a})")
    print(f"Shaded area A(r,n,a) = {area:.6f}  (= {area / (math.pi * args.radius ** 2):.6f} * pi r^2)")
    print(f"Saved to {args.out}")


# ---------------------------------------------------------------------------
# verification: Method 1, by generations (mpmath, 50 digits)
# ---------------------------------------------------------------------------

def area_by_generations(n, a):
    """Sum a^i (1/n - k^2) k^(2(i-1)), i >= 1, until the geometric tail is below 1e-45.

    k(n) is recomputed here at 50-digit precision rather than reusing the
    float scale_ratio(n), since the whole point of this method is to be an
    independent, high-precision check. Returns the partial sum (as a
    fraction of the disk) and the number of terms used.
    """
    with mpmath.workdps(DIGITS + 10):
        s = mpmath.sin(mpmath.pi / n)
        k = s / (1 + s)
        q = a * k ** 2
        piece = mpmath.mpf(1) / n - k ** 2
        tolerance = mpmath.mpf(10) ** (-(DIGITS - 5))
        total, i = mpmath.mpf(0), 0
        while True:
            i += 1
            term = a ** i * piece * k ** (2 * (i - 1))
            total += term
            tail_bound = term * q / (1 - q)
            if tail_bound < tolerance or i >= 10_000:
                return +total, i


# ---------------------------------------------------------------------------
# verification: Method 2, by self-similarity (sympy, exact)
# ---------------------------------------------------------------------------

def area_by_self_similarity(n, a):
    """Solve A = a(1/n - k^2) + a k^2 A exactly; returns (exact expression, 50-digit value).

    k(n) is rebuilt here as an exact symbolic expression, independent of the
    float and mpmath versions used elsewhere.
    """
    A = sp.Symbol("A")
    s = sp.sin(sp.pi / n)
    k = s / (1 + s)
    (solution,) = sp.solve(sp.Eq(A, a * (sp.Rational(1, n) - k ** 2) + a * k ** 2 * A), A)
    solution = sp.simplify(solution)
    return solution, sp.N(solution, DIGITS)


# ---------------------------------------------------------------------------
# verification: Method 3, classical Monte Carlo
# ---------------------------------------------------------------------------

def selected_sectors(n, a):
    """Deterministic sector choice j = floor(i n / a), used only for verification.

    Unlike select_shaded_sectors (which mirrors the app and may use
    randomness for irregular cases), this rule is fully deterministic so
    every number below is reproducible. It does not need to match the app's
    choice: the shaded area depends only on how many sectors are selected,
    never on which ones.
    """
    return tuple((i * n) // a for i in range(a))


def sample_disk(rng, count):
    radius = np.sqrt(rng.random(count))
    angle = 2 * np.pi * rng.random(count)
    return radius * np.cos(angle), radius * np.sin(angle)


def is_shaded(x, y, n, sectors, max_rescalings=MAX_RESCALINGS):
    """Self-similar membership test for points of the unit disk.

    Sector not selected -> not shaded. Selected and outside the child disk ->
    shaded. Inside the child disk -> magnify the copy with x -> (x - c_j) / k
    and test again. Returns the boolean mask, the number of points still
    undecided after max_rescalings (counted as not shaded), and the largest
    number of rescalings any point needed.
    """
    k = scale_ratio(n)
    phi = (2 * np.arange(n) + 1) * np.pi / n
    cx, cy = (1 - k) * np.cos(phi), (1 - k) * np.sin(phi)
    selected = np.zeros(n, dtype=bool)
    selected[list(sectors)] = True

    shaded = np.zeros(x.size, dtype=bool)
    index = np.arange(x.size)
    rescalings = 0
    for step in range(max_rescalings + 1):
        j = np.floor(np.mod(np.arctan2(y, x), 2 * np.pi) * n / (2 * np.pi)).astype(np.intp)
        np.minimum(j, n - 1, out=j)
        dx, dy = x - cx[j], y - cy[j]
        inside_child = dx * dx + dy * dy < k * k
        in_selected = selected[j]
        shaded[index[in_selected & ~inside_child]] = True
        keep = in_selected & inside_child
        index = index[keep]
        if index.size == 0 or step == max_rescalings:
            break
        rescalings = step + 1
        x, y = dx[keep] / k, dy[keep] / k
    return shaded, int(index.size), rescalings


@dataclass
class MonteCarloResult:
    estimate: float
    standard_error: float
    points: int
    hits: int
    undecided: int
    rescalings: int


def monte_carlo(n, a, points, seed, sectors=None, stream=0):
    sectors = selected_sectors(n, a) if sectors is None else tuple(sectors)
    rng = np.random.default_rng([seed, n, a, stream])
    x, y = sample_disk(rng, points)
    mask, undecided, rescalings = is_shaded(x, y, n, sectors)
    hits = int(mask.sum())
    p_hat = hits / points
    return MonteCarloResult(p_hat, math.sqrt(p_hat * (1 - p_hat) / points), points, hits,
                             undecided, rescalings)


# ---------------------------------------------------------------------------
# comparison table
# ---------------------------------------------------------------------------

def compare(pairs, points, seed):
    rows = []
    for n, a in pairs:
        m1, terms = area_by_generations(n, a)
        exact, m2 = area_by_self_similarity(n, a)
        mc = monte_carlo(n, a, points, seed)
        exact_float = float(m2)
        with mpmath.workdps(DIGITS + 10):
            difference = abs(m1 - mpmath.mpf(str(sp.N(exact, DIGITS + 10))))
        z = (mc.estimate - exact_float) / mc.standard_error if mc.standard_error else 0.0
        rows.append({
            "n": n, "a": a, "k": scale_ratio(n),
            "sectors": " ".join(map(str, selected_sectors(n, a))),
            "method1_generations": m1,
            "method1_terms": terms,
            "method2_exact": exact,
            "method2_value": m2,
            "difference_m1_m2": difference,
            "mc_estimate": mc.estimate,
            "mc_standard_error": mc.standard_error,
            "mc_z": z,
            "mc_ci95_low": mc.estimate - 1.96 * mc.standard_error,
            "mc_ci95_high": mc.estimate + 1.96 * mc.standard_error,
            "mc_points": mc.points,
            "mc_seed": f"[{seed}, {n}, {a}, 0]",
            "mc_max_rescalings": mc.rescalings,
            "mc_undecided": mc.undecided,
        })
    return rows


def print_table(rows):
    print(f"\n{'n':>3} {'a':>3} {'k':>8} {'Method 1':>12} {'Method 2':>12} "
          f"{'|M1-M2|':>9} {'Monte Carlo':>13} {'95% CI':>23} {'z':>6} {'resc.':>5} {'undec.':>6}")
    for r in rows:
        ci = f"[{r['mc_ci95_low']:.6f}, {r['mc_ci95_high']:.6f}]"
        print(f"{r['n']:>3} {r['a']:>3} {r['k']:>8.4f} {float(r['method1_generations']):>12.6f} "
              f"{float(r['method2_value']):>12.6f} {mpmath.nstr(r['difference_m1_m2'], 3):>9} "
              f"{r['mc_estimate']:.6f}+/-{r['mc_standard_error']:.6f} {ci:>23} "
              f"{r['mc_z']:>6.2f} {r['mc_max_rescalings']:>5} {r['mc_undecided']:>6}")
    print()
    for r in rows:
        status = "|z| < 2, compatible" if abs(r['mc_z']) < 2 else "|z| >= 2, check the run"
        print(f"  ({r['n']},{r['a']}) sectors {r['sectors']}: exact area = {r['method2_exact']} "
              f"({r['method1_terms']} generations summed), Monte Carlo {status}")


def parse_pair(text):
    n, a = (int(v) for v in text.split(","))
    if n < 2 or not 0 <= a <= n:
        raise argparse.ArgumentTypeError(f"not an admissible pair: n={n}, a={a}")
    return n, a


def run_verify(args):
    print(f"Shaded area A(r,n,a) as a fraction of the disk (A / (pi r^2)).\n"
          f"Monte Carlo: N={args.points} points per pair, root seed {args.seed}.\n"
          f"Methods 1 and 2 are deterministic and independent of the seed; only Method 3 "
          f"(Monte Carlo) is expected to match the reference values within statistical error "
          f"(|z| < 2), not bit for bit.")
    rows = compare(args.pairs, args.points, args.seed)
    print_table(rows)


# ---------------------------------------------------------------------------
# command line
# ---------------------------------------------------------------------------

def build_parser():
    parser = argparse.ArgumentParser(
        prog="fanctal.py",
        description="Draw a member of the fanctal family f(r, n, a), or verify its area.")
    sub = parser.add_subparsers(dest="command")

    draw_p = sub.add_parser("draw", help="draw f(r, n, a) to an SVG/PNG file")
    draw_p.add_argument("--n", type=int, default=6, help="number of angular sectors (n >= 2)")
    draw_p.add_argument("--a", type=int, default=3, help="number of sectors selected to recurse (0 <= a <= n)")
    draw_p.add_argument("--depth", type=int, default=None,
                         help="explicit recursion depth 1-7 (default: automatic cutoff at radius %.2f)" % EPSILON)
    draw_p.add_argument("--radius", type=float, default=1.0, help="radius R of the initial disk")
    draw_p.add_argument("--seed", type=int, default=None,
                         help="random seed for sector selection when it is not fully determined by (n, a)")
    draw_p.add_argument("--out", default="fanctal.svg", help="output file (.svg or .png)")

    verify_p = sub.add_parser("verify", help="verify A(r, n, a) by three independent methods")
    verify_p.add_argument("--pairs", nargs="+", type=parse_pair, default=list(DEFAULT_PAIRS),
                           help="(n,a) pairs to verify, e.g. --pairs 7,3 9,2")
    verify_p.add_argument("--points", type=int, default=DEFAULT_POINTS,
                           help="Monte Carlo sample size per pair")
    verify_p.add_argument("--seed", type=int, default=VERIFY_SEED, help="Monte Carlo root seed")

    return parser


def main(argv=None):
    argv = list(sys.argv[1:] if argv is None else argv)
    # In a Jupyter/IPython cell sys.argv holds the kernel's own connection
    # args (e.g. `-f ...kernel.json`), which argparse would otherwise choke
    # on; fall back to the defaults there instead of a real CLI's argv.
    if "ipykernel_launcher" in sys.argv[0]:
        argv = []
    if not argv:
        argv = ["draw"]
    elif argv[0] not in ("draw", "verify", "-h", "--help"):
        argv = ["draw"] + argv

    parser = build_parser()
    args = parser.parse_args(argv)
    if args.command == "verify":
        run_verify(args)
    else:
        run_draw(args)


if __name__ == "__main__":
    main()
