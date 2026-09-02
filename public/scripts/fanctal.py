"""Fanctal generator: f(r, n, a) family of self-similar circular fractals.

Reference implementation of the recursive construction described in the
supplementary material of "El fanctal: area, perimeter, and a generalized
family of self-similar circular fractals" (Diaz Arcila, Diaz Gomez &
Solorzano Tovar). Reproduces exactly the algorithm behind the interactive
figure at https://juanma.cc/projects/fanctal, in a language-independent way:

  1. Divide a disk of radius r into n congruent angular sectors.
  2. Select a of them (odd indices first, then random) to hold a child disk
     tangent to the parent, with scale ratio k(n) = sin(pi/n) / (1+sin(pi/n)).
  3. Repeat inside every child disk until it falls below a radius threshold,
     or an explicit recursion depth is reached.

Coordinates use the standard mathematical convention (y grows upward,
angles measured counter-clockwise). The web app inverts the sign of sin()
only to compensate for SVG's downward-growing y-axis; the geometry is
identical.

Usage:
    python fanctal.py --n 6 --a 3 --out fanctal.svg
    python fanctal.py --n 8 --a 4 --depth 4 --out fanctal.png
"""

import argparse
import math
import random
import sys

import matplotlib.pyplot as plt
from matplotlib.path import Path
from matplotlib.patches import PathPatch

EPSILON = 0.01  # default radius cutoff, relative to the initial radius r0 = 1


def scale_ratio(n):
    """k(n): ratio between a child disk's radius and its parent's."""
    s = math.sin(math.pi / n)
    return s / (1 + s)


def fanctal_area(r, n, a):
    """Closed-form shaded area A(r, n, a) = pi r^2 * a(1/n - k^2) / (1 - a k^2)."""
    k = scale_ratio(n)
    return math.pi * r ** 2 * (a * (1 / n - k ** 2)) / (1 - a * k ** 2)


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


def main():
    parser = argparse.ArgumentParser(description="Draw a member of the fanctal family f(r, n, a).")
    parser.add_argument("--n", type=int, default=6, help="number of angular sectors (n >= 2)")
    parser.add_argument("--a", type=int, default=3, help="number of sectors selected to recurse (0 <= a <= n)")
    parser.add_argument("--depth", type=int, default=None, help="explicit recursion depth 1-7 (default: automatic cutoff at radius %.2f)" % EPSILON)
    parser.add_argument("--radius", type=float, default=1.0, help="radius R of the initial disk")
    parser.add_argument("--seed", type=int, default=None, help="random seed for sector selection when it is not fully determined by (n, a)")
    parser.add_argument("--out", default="fanctal.svg", help="output file (.svg or .png)")
    # In a Jupyter/IPython cell sys.argv holds the kernel's own connection
    # args (e.g. `-f ...kernel.json`), which argparse would otherwise choke
    # on; fall back to the defaults there instead of a real CLI's argv.
    in_notebook = "ipykernel_launcher" in sys.argv[0]
    args = parser.parse_args([] if in_notebook else None)

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


if __name__ == "__main__":
    main()
