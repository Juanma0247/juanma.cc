#!/usr/bin/env Rscript
# Fanctal: draw and verify the f(r, n, a) family of self-similar circular fractals.
#
# R port of fanctal.py, the reference implementation cited by the supplementary
# material of "El fanctal: area, perimeter, and a generalized family of
# self-similar circular fractals" (Diaz Arcila, Diaz Gomez & Solorzano Tovar).
# Same construction, same three verification methods, same default values as
# the Python version. It is base R only (no CRAN packages required).
#
# Three differences from the Python original are deliberate, not bugs:
#
#   * Method 1 (by generations) sums the series in ordinary double precision.
#     R has no bundled arbitrary-precision arithmetic comparable to mpmath;
#     the Rmpfr package would replicate the 50-digit precision of the Python
#     version, but it is not part of base R, so it is intentionally not used
#     here. Double precision still reaches about 15-16 significant digits,
#     enough to match every digit printed in Table I of the article.
#   * Method 2 (by self-similarity) solves the linear equation
#     A = a(1/n - k^2) + a k^2 A algebraically, A = a(1/n-k^2) / (1 - a k^2)
#     (the same closed form as fanctal_area() below), and evaluates it in
#     double precision. Base R ships no computer algebra system, so it
#     returns a numeric value, not the exact radical expression sympy prints
#     in Python (e.g. 9/14 - 2*sqrt(2)/7 for (4,2)).
#   * Method 3 (Monte Carlo) uses R's own random number generator, seeded
#     with set.seed(), a different algorithm from numpy's PCG64. It CANNOT
#     reproduce the same digits as the Python run: agreement is expected
#     only within statistical error (|z| < 2 against the exact area), never
#     bit for bit.
#
# Usage:
#   Rscript fanctal.R --n 6 --a 3 --out fanctal.svg
#   Rscript fanctal.R draw --n 8 --a 4 --depth 4 --out fanctal.png
#   Rscript fanctal.R verify
#   Rscript fanctal.R verify --pairs 7,3 9,2 --points 200000

EPSILON <- 0.01 # default radius cutoff for drawing, relative to r0 = 1
VERIFY_SEED <- 2026
DEFAULT_PAIRS <- list(c(3, 1), c(4, 2), c(5, 2), c(6, 3), c(8, 4), c(12, 6)) # Table I
DEFAULT_POINTS <- 1000000
MAX_RESCALINGS <- 64

# ---------------------------------------------------------------------------
# shared geometry
# ---------------------------------------------------------------------------

# k(n): ratio between a child disk's radius and its parent's.
scale_ratio <- function(n) {
  s <- sin(pi / n)
  s / (1 + s)
}

# Closed-form shaded area A(r, n, a) = pi r^2 * a(1/n - k^2) / (1 - a k^2).
fanctal_area <- function(r, n, a) {
  k <- scale_ratio(n)
  pi * r^2 * (a * (1 / n - k^2)) / (1 - a * k^2)
}

# ---------------------------------------------------------------------------
# drawing
# ---------------------------------------------------------------------------

# Pick the `a` sectors (of n, 0-indexed) that hold a child disk.
#
# Mirrors the app's alternation rule: mark n-a sectors as *not* shaded,
# preferring odd indices first (so shaded sectors alternate whenever
# possible); if there are not enough odd indices, fill the rest randomly
# among the remaining ones. The `a` sectors left unmarked are shaded.
select_shaded_sectors <- function(n, a) {
  if (a >= n) return(0:(n - 1))
  if (a <= 0) return(integer(0))
  not_shaded_count <- n - a
  odd_indices <- if (n > 1) seq(1, n - 1, by = 2) else integer(0)
  not_shaded <- utils::head(odd_indices, not_shaded_count)
  if (length(not_shaded) < not_shaded_count) {
    remaining <- setdiff(0:(n - 1), not_shaded)
    remaining <- sample(remaining)
    not_shaded <- c(not_shaded, utils::head(remaining, not_shaded_count - length(not_shaded)))
  }
  setdiff(0:(n - 1), not_shaded)
}

arc_points <- function(cx, cy, r, theta1, theta2, samples = 64) {
  thetas <- theta1 + (theta2 - theta1) * (0:(samples - 1)) / (samples - 1)
  list(x = cx + r * cos(thetas), y = cy + r * sin(thetas))
}

draw_circle <- function(center, r, col = NA, border = NA, lwd = 1) {
  pts <- arc_points(center[1], center[2], r, 0, 2 * pi, samples = 128)
  graphics::polygon(pts$x, pts$y, col = col, border = border, lwd = lwd)
}

# Sector (vertex (cx,cy), radius r, from theta1 to theta2) minus a disk.
#
# Returns one path with two subpaths (outer sector, inner hole circle)
# separated by NA, drawn together with polypath(..., rule = "evenodd") so
# the hole is carved out regardless of winding direction - the same result
# the Python version gets from a compound path with opposite windings.
sector_minus_disk_xy <- function(cx, cy, r, theta1, theta2, hx, hy, hr) {
  outer <- arc_points(cx, cy, r, theta1, theta2)
  ox <- c(cx, outer$x, cx)
  oy <- c(cy, outer$y, cy)
  inner <- arc_points(hx, hy, hr, 0, 2 * pi)
  list(x = c(ox, NA, inner$x), y = c(oy, NA, inner$y))
}

# Draw f(r0, n, a) into the current plot, following the app's algorithm.
draw_fanctal <- function(n, a, r0 = 1, c0 = c(0, 0), epsilon = EPSILON, depth = NULL,
                          color = "black") {
  shaded <- select_shaded_sectors(n, a)
  step <- 2 * pi / n
  k <- scale_ratio(n)

  if (a >= n) {
    draw_circle(c0, r0, col = color, border = NA)
    return(invisible(NULL))
  }
  if (a <= 0) return(invisible(NULL))

  recurse <- function(c, r, i) {
    cx <- c[1]
    cy <- c[2]
    if (r < epsilon || (!is.null(depth) && i == depth)) {
      if (!is.null(depth) && i == depth) {
        draw_circle(c, r, col = NA, border = color, lwd = max(r / 300 * 96, 0.05))
      } else {
        draw_circle(c, r, col = color, border = NA)
      }
      return(invisible(NULL))
    }
    r_next <- r * k
    rho <- r * (1 - k)
    for (j in shaded) {
      phi <- j * step + step / 2
      child <- c(cx + rho * cos(phi), cy + rho * sin(phi))
      piece <- sector_minus_disk_xy(cx, cy, r, j * step, j * step + step, child[1], child[2], r_next)
      graphics::polypath(piece$x, piece$y, col = color, border = color, rule = "evenodd",
                          lwd = max(r / 300 * 96, 0.05))
      recurse(child, r_next, i + 1)
    }
  }

  recurse(c0, r0, 0)
}

run_draw <- function(args) {
  ext <- tolower(tools::file_ext(args$out))
  if (ext == "png") {
    grDevices::png(args$out, width = 6, height = 6, units = "in", res = 150, bg = "transparent")
  } else {
    grDevices::svg(args$out, width = 6, height = 6, bg = "transparent")
  }
  on.exit(grDevices::dev.off())

  if (!is.null(args$seed)) set.seed(args$seed)
  op <- graphics::par(mar = c(0, 0, 0, 0))
  graphics::plot.new()
  graphics::plot.window(xlim = c(-args$radius, args$radius), ylim = c(-args$radius, args$radius), asp = 1)
  draw_fanctal(args$n, args$a, r0 = args$radius, depth = args$depth)
  graphics::par(op)

  area <- fanctal_area(args$radius, args$n, args$a)
  cat(sprintf("f(r=%s, n=%d, a=%d)\n", format(args$radius), args$n, args$a))
  cat(sprintf("Shaded area A(r,n,a) = %.6f  (= %.6f * pi r^2)\n", area, area / (pi * args$radius^2)))
  cat(sprintf("Saved to %s\n", args$out))
}

# ---------------------------------------------------------------------------
# verification: Method 1, by generations (double precision)
# ---------------------------------------------------------------------------

# Sum a^i (1/n - k^2) k^(2(i-1)), i >= 1, until the geometric tail is below
# double-precision resolution. Returns the partial sum (as a fraction of the
# disk) and the number of terms used.
area_by_generations <- function(n, a, tolerance = 1e-15) {
  s <- sin(pi / n)
  k <- s / (1 + s)
  q <- a * k^2
  piece <- 1 / n - k^2
  total <- 0
  i <- 0
  repeat {
    i <- i + 1
    term <- a^i * piece * k^(2 * (i - 1))
    total <- total + term
    tail_bound <- term * q / (1 - q)
    if (tail_bound < tolerance || i >= 10000) break
  }
  list(value = total, terms = i)
}

# ---------------------------------------------------------------------------
# verification: Method 2, by self-similarity (algebraic, double precision)
# ---------------------------------------------------------------------------

# Solve A = a(1/n - k^2) + a k^2 A for A: A = a(1/n - k^2) / (1 - a k^2).
area_by_self_similarity <- function(n, a) {
  k <- scale_ratio(n)
  a * (1 / n - k^2) / (1 - a * k^2)
}

# ---------------------------------------------------------------------------
# verification: Method 3, classical Monte Carlo
# ---------------------------------------------------------------------------

# Deterministic sector choice j = floor(i n / a), used only for verification.
#
# Unlike select_shaded_sectors (which mirrors the app and may use randomness
# for irregular cases), this rule is fully deterministic so every number
# below is reproducible. It need not match the app's choice: the shaded area
# depends only on how many sectors are selected, never on which ones.
selected_sectors <- function(n, a) {
  floor((0:(a - 1)) * n / a)
}

sample_disk <- function(count) {
  radius <- sqrt(stats::runif(count))
  angle <- 2 * pi * stats::runif(count)
  list(x = radius * cos(angle), y = radius * sin(angle))
}

# Self-similar membership test for points of the unit disk.
#
# Sector not selected -> not shaded. Selected and outside the child disk ->
# shaded. Inside the child disk -> magnify the copy with x -> (x - c_j) / k
# and test again. Returns the shaded mask, how many points are still
# undecided after max_rescalings (counted as not shaded), and the largest
# number of rescalings any point needed.
is_shaded <- function(x, y, n, sectors, max_rescalings = MAX_RESCALINGS) {
  k <- scale_ratio(n)
  phi <- (2 * (0:(n - 1)) + 1) * pi / n
  cx <- (1 - k) * cos(phi)
  cy <- (1 - k) * sin(phi)
  selected <- rep(FALSE, n)
  selected[sectors + 1] <- TRUE

  shaded <- rep(FALSE, length(x))
  index <- seq_along(x)
  rescalings <- 0
  for (step in 0:max_rescalings) {
    ang <- (atan2(y, x)) %% (2 * pi)
    j <- pmin(floor(ang * n / (2 * pi)), n - 1)
    dx <- x - cx[j + 1]
    dy <- y - cy[j + 1]
    inside_child <- (dx * dx + dy * dy) < k * k
    in_selected <- selected[j + 1]
    shaded[index[in_selected & !inside_child]] <- TRUE
    keep <- in_selected & inside_child
    index <- index[keep]
    if (length(index) == 0 || step == max_rescalings) break
    rescalings <- step + 1
    x <- dx[keep] / k
    y <- dy[keep] / k
  }
  list(shaded = shaded, undecided = length(index), rescalings = rescalings)
}

monte_carlo <- function(n, a, points, seed, sectors = NULL, stream = 0) {
  if (is.null(sectors)) sectors <- selected_sectors(n, a)
  # R's RNG has no equivalent of numpy's per-stream seed vector [seed, n, a,
  # stream]; this combination only needs to vary deterministically per call.
  set.seed(seed * 100003 + n * 101 + a * 11 + stream)
  d <- sample_disk(points)
  res <- is_shaded(d$x, d$y, n, sectors)
  hits <- sum(res$shaded)
  p_hat <- hits / points
  se <- sqrt(p_hat * (1 - p_hat) / points)
  list(estimate = p_hat, se = se, points = points, hits = hits,
       undecided = res$undecided, rescalings = res$rescalings)
}

# ---------------------------------------------------------------------------
# comparison table
# ---------------------------------------------------------------------------

compare <- function(pairs, points, seed) {
  lapply(pairs, function(pair) {
    n <- pair[1]
    a <- pair[2]
    m1 <- area_by_generations(n, a)
    m2 <- area_by_self_similarity(n, a)
    mc <- monte_carlo(n, a, points, seed)
    z <- if (mc$se > 0) (mc$estimate - m2) / mc$se else 0
    list(
      n = n, a = a, k = scale_ratio(n),
      sectors = paste(selected_sectors(n, a), collapse = " "),
      method1 = m1$value, method1_terms = m1$terms,
      method2 = m2,
      difference = abs(m1$value - m2),
      mc_estimate = mc$estimate, mc_se = mc$se,
      mc_ci_low = mc$estimate - 1.96 * mc$se,
      mc_ci_high = mc$estimate + 1.96 * mc$se,
      mc_z = z, mc_points = points,
      mc_max_rescalings = mc$rescalings, mc_undecided = mc$undecided
    )
  })
}

print_table <- function(rows) {
  cat(sprintf("\n%3s %3s %8s %12s %12s %9s %23s %23s %6s %5s %6s\n",
              "n", "a", "k", "Method 1", "Method 2", "|M1-M2|", "Monte Carlo",
              "95% CI", "z", "resc.", "undec."))
  for (r in rows) {
    ci <- sprintf("[%.6f, %.6f]", r$mc_ci_low, r$mc_ci_high)
    mc <- sprintf("%.6f+/-%.6f", r$mc_estimate, r$mc_se)
    cat(sprintf("%3d %3d %8.4f %12.6f %12.6f %9.2e %23s %23s %6.2f %5d %6d\n",
                r$n, r$a, r$k, r$method1, r$method2, r$difference, mc, ci,
                r$mc_z, r$mc_max_rescalings, r$mc_undecided))
  }
  cat("\n")
  for (r in rows) {
    status <- if (abs(r$mc_z) < 2) "|z| < 2, compatible" else "|z| >= 2, check the run"
    cat(sprintf("  (%d,%d) sectors %s: area = %.10f (%d generations summed), Monte Carlo %s\n",
                r$n, r$a, r$sectors, r$method2, r$method1_terms, status))
  }
}

parse_pair <- function(text) {
  parts <- suppressWarnings(as.integer(strsplit(text, ",")[[1]]))
  if (length(parts) != 2 || anyNA(parts) || parts[1] < 2 || parts[2] < 0 || parts[2] > parts[1]) {
    stop(sprintf("not an admissible pair: %s", text))
  }
  parts
}

run_verify <- function(args) {
  cat("Shaded area A(r,n,a) as a fraction of the disk (A / (pi r^2)).\n")
  cat(sprintf("Monte Carlo: N=%d points per pair, root seed %d.\n", args$points, args$seed))
  cat("Methods 1 and 2 are deterministic (double precision; see the file header for why R\n")
  cat("differs from the 50-digit/symbolic Python methods). Method 3 (Monte Carlo) uses R's\n")
  cat("own RNG and is expected to match only within statistical error (|z| < 2), never bit\n")
  cat("for bit.\n")
  rows <- compare(args$pairs, args$points, args$seed)
  print_table(rows)
}

# ---------------------------------------------------------------------------
# command line
# ---------------------------------------------------------------------------

get_flag <- function(argv, name, default = NULL, multi = FALSE) {
  idx <- which(argv == name)
  if (length(idx) == 0) return(default)
  idx <- idx[1]
  start <- idx + 1
  if (start > length(argv)) stop(sprintf("missing value for %s", name))
  if (!multi) return(argv[start])
  end <- length(argv)
  rest <- argv[start:end]
  stop_at <- which(startsWith(rest, "--"))
  end <- if (length(stop_at) > 0) start + stop_at[1] - 2 else end
  argv[start:end]
}

parse_args <- function(argv) {
  if (length(argv) > 0 && argv[1] %in% c("draw", "verify")) {
    command <- argv[1]
    argv <- argv[-1]
  } else {
    command <- "draw"
  }

  if (command == "draw") {
    depth_raw <- get_flag(argv, "--depth")
    seed_raw <- get_flag(argv, "--seed")
    list(
      command = "draw",
      n = as.integer(get_flag(argv, "--n", "6")),
      a = as.integer(get_flag(argv, "--a", "3")),
      depth = if (is.null(depth_raw)) NULL else as.integer(depth_raw),
      radius = as.numeric(get_flag(argv, "--radius", "1.0")),
      seed = if (is.null(seed_raw)) NULL else as.integer(seed_raw),
      out = get_flag(argv, "--out", "fanctal.svg")
    )
  } else {
    pairs_raw <- get_flag(argv, "--pairs", NULL, multi = TRUE)
    pairs <- if (is.null(pairs_raw)) DEFAULT_PAIRS else lapply(pairs_raw, parse_pair)
    list(
      command = "verify",
      pairs = pairs,
      points = as.integer(get_flag(argv, "--points", as.character(DEFAULT_POINTS))),
      seed = as.integer(get_flag(argv, "--seed", as.character(VERIFY_SEED)))
    )
  }
}

main <- function() {
  args <- parse_args(commandArgs(trailingOnly = TRUE))
  if (args$command == "verify") {
    run_verify(args)
  } else {
    run_draw(args)
  }
}

if (!interactive()) {
  main()
}
