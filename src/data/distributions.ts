// Build-time-only metadata for the "Distribution Functions" project page.
// Consumed by distribution-functions.astro to stamp out the picker buttons
// and the reference accordion. The actual math (jStat wiring, plot domain)
// lives separately in public/js/lib/Distributions.js, since public/js/**
// is served as static files and can never import from src/**; the two are
// linked only by the shared `key` string, the same way projects.json links
// to its .astro/.js pair.

export interface DistParam {
  key: string
  symbol: string // LaTeX, never translated
  min: number
  max: number
  step: number
  default: number
  integer?: boolean
}

export interface DistributionMeta {
  key: string
  nameEn: string
  discrete: boolean
  formulaTex: string
  support: string
  mean: string
  variance: string
  params: DistParam[]
  theoryEn: string
  historyEn: string
  useCaseEn: string
  portrait?: { img: string; alt: string; credit: string }
}

export const DISTRIBUTIONS: DistributionMeta[] = [
  {
    key: 'normal',
    nameEn: 'Normal',
    discrete: false,
    formulaTex: 'f(x;\\mu,\\sigma)=\\frac{1}{\\sigma\\sqrt{2\\pi}}\\,e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}',
    support: '(-\\infty,\\infty)',
    mean: '\\mu',
    variance: '\\sigma^2',
    params: [
      { key: 'mu', symbol: '\\mu', min: -10, max: 10, step: 0.1, default: 0 },
      { key: 'sigma', symbol: '\\sigma', min: 0.1, max: 5, step: 0.1, default: 1 },
    ],
    theoryEn: 'Models continuous quantities that arise as the sum of many small, independent effects: the Central Limit Theorem. Its bell shape comes from a negative quadratic in the exponent, symmetric and peaked at the mean μ; the spread σ stretches or compresses it while the area underneath always stays 1.',
    historyEn: "First derived by Abraham de Moivre in 1733 as an approximation to the binomial distribution, decades before Gauss. Gauss used it in 1809 to justify least-squares fitting of astronomical data, and the name stuck to him anyway: a classic case of Stigler's Law of eponymy.",
    useCaseEn: "Manufacturing control charts (Six Sigma): a machined part's dimension is assumed normal around a target, and limits at μ±3σ flag defective units.",
    portrait: { img: '/img/distributions/gauss.jpg', alt: 'Carl Friedrich Gauss', credit: 'Gottlieb Biermann (1887), after Christian Albrecht Jensen; Wikimedia Commons, public domain' },
  },
  {
    key: 'studentt',
    nameEn: "Student's t",
    discrete: false,
    formulaTex: 'f(x;\\nu)=\\frac{\\Gamma\\!\\left(\\frac{\\nu+1}{2}\\right)}{\\sqrt{\\nu\\pi}\\,\\Gamma\\!\\left(\\frac{\\nu}{2}\\right)}\\left(1+\\frac{x^2}{\\nu}\\right)^{-\\frac{\\nu+1}{2}}',
    support: '(-\\infty,\\infty)',
    mean: '0 \\ (\\nu>1)',
    variance: '\\frac{\\nu}{\\nu-2} \\ (\\nu>2)',
    params: [
      { key: 'df', symbol: '\\nu', min: 1, max: 30, step: 1, default: 10, integer: true },
    ],
    theoryEn: "Models the standardized sample mean when the population's standard deviation is unknown and estimated from a small sample. Because that estimate itself fluctuates, the tails are heavier than the normal's; as the degrees of freedom ν grow, the extra uncertainty shrinks and the curve converges to the standard normal.",
    historyEn: "Derived in 1908 by William Sealy Gosset, a chemist at the Guinness brewery in Dublin, to draw sound conclusions from the small samples typical of brewery experiments. Guinness barred staff from publishing under their own name, so he signed the paper \"Student\"; Fisher later put the formula on rigorous footing in terms of degrees of freedom (1925).",
    useCaseEn: 'The two-sample t-test: comparing the mean of a small clinical trial (say, 10 patients) against a baseline when the population variance is unknown.',
    portrait: { img: '/img/distributions/gosset.jpg', alt: 'William Sealy Gosset', credit: 'Annals of Eugenics obituary photo, 1937; Wikimedia Commons, public domain' },
  },
  {
    key: 'chisquare',
    nameEn: 'Chi-squared',
    discrete: false,
    formulaTex: 'f(x;k)=\\frac{1}{2^{k/2}\\Gamma(k/2)}\\,x^{k/2-1}e^{-x/2}',
    support: '[0,\\infty)',
    mean: 'k',
    variance: '2k',
    params: [
      { key: 'df', symbol: 'k', min: 1, max: 30, step: 1, default: 10, integer: true },
    ],
    theoryEn: 'Models the sum of k independent squared standard-normal variables, so it lives only on the positive numbers and is right-skewed. Small k gives a sharp peak near zero; as k grows the sum trends toward normal by the Central Limit Theorem, and the curve becomes more symmetric around its mean k.',
    historyEn: 'Independently derived in 1876 by geodesist Friedrich Robert Helmert while studying measurement-error variance, then rediscovered and named by Karl Pearson in 1900 for his goodness-of-fit test, unaware of Helmert’s earlier work. English-language sources only credited Helmert’s priority decades later, by Pearson himself in 1931.',
    useCaseEn: "Pearson's goodness-of-fit test: checking whether a die is fair, or whether disease incidence is independent of blood type in a contingency table.",
    portrait: { img: '/img/distributions/pearson.jpg', alt: 'Karl Pearson', credit: 'National Portrait Gallery, London, 1910; Wikimedia Commons, public domain in the US' },
  },
  {
    key: 'f',
    nameEn: 'F (Snedecor)',
    discrete: false,
    formulaTex: 'f(x;d_1,d_2)=\\frac{1}{B\\!\\left(\\frac{d_1}{2},\\frac{d_2}{2}\\right)}\\left(\\frac{d_1}{d_2}\\right)^{\\frac{d_1}{2}}x^{\\frac{d_1}{2}-1}\\left(1+\\frac{d_1}{d_2}x\\right)^{-\\frac{d_1+d_2}{2}}',
    support: '[0,\\infty)',
    mean: '\\frac{d_2}{d_2-2} \\ (d_2>2)',
    variance: '\\text{(depends on } d_1,d_2\\text{)} \\ (d_2>4)',
    params: [
      { key: 'df1', symbol: 'd_1', min: 1, max: 30, step: 1, default: 5, integer: true },
      { key: 'df2', symbol: 'd_2', min: 1, max: 30, step: 1, default: 10, integer: true },
    ],
    theoryEn: 'Models the ratio of two independent variance estimates, each a chi-squared variable divided by its own degrees of freedom, so it lives on the positive numbers and is right-skewed. d₁ shapes how peaked the curve is; d₂ mainly controls how heavy its right tail is.',
    historyEn: "Ronald Fisher gave the mathematical form around 1922–1924, working with a transformed statistic rather than the ratio itself. George Snedecor tabulated the distribution directly as a ratio in his 1934 textbook and named it \"F\" in Fisher's honor. The two never worked on it jointly; a decade separates their contributions.",
    useCaseEn: 'One-way ANOVA: comparing mean crop yields across several fertilizer treatments through the ratio of between-group to within-group variance.',
    portrait: { img: '/img/distributions/fisher.jpg', alt: 'Ronald Fisher (1913)', credit: 'University of Adelaide archive; Wikimedia Commons, public domain in the US' },
  },
  {
    key: 'binomial',
    nameEn: 'Binomial',
    discrete: true,
    formulaTex: 'P(k;n,p)=\\binom{n}{k}p^k(1-p)^{n-k}',
    support: '\\{0,1,\\dots,n\\}',
    mean: 'np',
    variance: 'np(1-p)',
    params: [
      { key: 'n', symbol: 'n', min: 1, max: 50, step: 1, default: 20, integer: true },
      { key: 'p', symbol: 'p', min: 0, max: 1, step: 0.01, default: 0.5 },
    ],
    theoryEn: 'Counts the number of successes in n independent trials that each succeed with probability p: the sum of n Bernoulli(p) trials. Larger n spreads and smooths the distribution toward a normal shape; p controls its skew, symmetric at p=0.5 and lopsided as p approaches 0 or 1.',
    historyEn: "Jacob Bernoulli derived the binomial probabilities and proved an early law of large numbers for them in Ars Conjectandi, published posthumously in 1713, the same book behind the Bernoulli distribution below. Abraham de Moivre had related results shortly before, in 1711, though Bernoulli's treatment is the one credited with formulating the distribution.",
    useCaseEn: 'Quality control: counting how many of 100 inspected units from a production batch are defective, when each unit independently fails with the same fixed probability.',
  },
  {
    key: 'bernoulli',
    nameEn: 'Bernoulli',
    discrete: true,
    formulaTex: 'P(k;p)=p^k(1-p)^{1-k}',
    support: '\\{0,1\\}',
    mean: 'p',
    variance: 'p(1-p)',
    params: [
      { key: 'p', symbol: 'p', min: 0, max: 1, step: 0.01, default: 0.5 },
    ],
    theoryEn: "The simplest possible distribution: a single trial with two outcomes, weight p on success (1) and 1−p on failure (0). With only two points in its support there's no separate \"spread\" parameter; p alone fixes the whole shape.",
    historyEn: 'Named after Jacob Bernoulli (1655–1705), whose treatment of single- and repeated-trial probabilities in Ars Conjectandi (1713, published by his nephew after his death) is the distribution’s origin, the same source behind the Binomial above.',
    useCaseEn: 'A/B testing: whether a single visitor who lands on a page clicks the call-to-action button or not.',
    portrait: { img: '/img/distributions/bernoulli.jpg', alt: 'Jacob Bernoulli', credit: 'Niklaus Bernoulli (1687); Wikimedia Commons, public domain' },
  },
  {
    key: 'poisson',
    nameEn: 'Poisson',
    discrete: true,
    formulaTex: 'P(k;\\lambda)=\\frac{\\lambda^k e^{-\\lambda}}{k!}',
    support: '\\{0,1,2,\\dots\\}',
    mean: '\\lambda',
    variance: '\\lambda',
    params: [
      { key: 'lambda', symbol: '\\lambda', min: 0.1, max: 20, step: 0.1, default: 4 },
    ],
    theoryEn: 'Counts rare, independent events occurring at a constant average rate λ over a fixed interval of time, area, or volume: the limit of the Binomial as n→∞ and p→0 with np held fixed at λ. The same number λ sets both the center and the spread, its defining trait (mean equals variance).',
    historyEn: 'Published by Siméon Denis Poisson in 1837, applied to modeling wrongful-conviction rates in criminal and civil judgments. Abraham de Moivre had anticipated similar results as early as 1711, but the distribution kept Poisson’s name; its best-known early application came later, in Ladislaus Bortkiewicz’s 1898 study of Prussian cavalry deaths by horse-kick.',
    useCaseEn: 'Call-center staffing: modeling how many calls arrive in a given hour when they occur independently at a roughly constant average rate.',
    portrait: { img: '/img/distributions/poisson.jpg', alt: 'Siméon Denis Poisson', credit: 'Lithograph by F.-S. Delpech after N.-E. Maurin, before 1840; Wikimedia Commons, public domain' },
  },
  {
    key: 'exponential',
    nameEn: 'Exponential',
    discrete: false,
    formulaTex: 'f(x;\\lambda)=\\lambda e^{-\\lambda x}',
    support: '[0,\\infty)',
    mean: '1/\\lambda',
    variance: '1/\\lambda^2',
    params: [
      { key: 'lambda', symbol: '\\lambda', min: 0.1, max: 5, step: 0.1, default: 1 },
    ],
    theoryEn: "Models the waiting time until the next event in a Poisson process: events happening continuously and independently at a constant rate λ. It's memoryless (having already waited doesn't change the odds of waiting longer), and that single property forces the exponential-decay shape; larger λ compresses the wait toward zero.",
    historyEn: 'It falls directly out of the Poisson-process framework built up across the 19th century and formalized within 20th-century probability theory. Unlike Normal or Poisson, no single person is credited with discovering it as a named distribution.',
    useCaseEn: 'Reliability engineering: modeling the time to failure of a component with a constant hazard rate, such as a memoryless electronic part.',
  },
  {
    key: 'uniform',
    nameEn: 'Uniform',
    discrete: false,
    formulaTex: 'f(x;a,b)=\\frac{1}{b-a}',
    support: '[a,b]',
    mean: '\\frac{a+b}{2}',
    variance: '\\frac{(b-a)^2}{12}',
    params: [
      { key: 'a', symbol: 'a', min: -10, max: 10, step: 0.1, default: 0 },
      { key: 'b', symbol: 'b', min: -10, max: 10, step: 0.1, default: 1 },
    ],
    theoryEn: 'Models a quantity known only to lie somewhere in [a,b], with every equal-length subinterval equally likely: the natural assumption when nothing favors one point over another. The flat density 1/(b−a) is exactly the height needed to keep the area under the curve equal to 1.',
    historyEn: "Not tied to a single historical figure: its origins are inconclusive; equiprobability reasoning goes back to 16th-century dice problems (Gerolamo Cardano), but its formalization as a continuous distribution is a byproduct of 20th-century measure-theoretic probability.",
    useCaseEn: 'The base primitive of software random-number generators (e.g. Python’s random.random()), later transformed via inverse-CDF sampling to generate values from other distributions.',
  },
  {
    key: 'gamma',
    nameEn: 'Gamma',
    discrete: false,
    formulaTex: 'f(x;k,\\theta)=\\frac{1}{\\Gamma(k)\\,\\theta^k}\\,x^{k-1}e^{-x/\\theta}',
    support: '(0,\\infty)',
    mean: 'k\\theta',
    variance: 'k\\theta^2',
    params: [
      { key: 'shape', symbol: 'k', min: 0.1, max: 10, step: 0.1, default: 2 },
      { key: 'scale', symbol: '\\theta', min: 0.1, max: 5, step: 0.1, default: 1 },
    ],
    theoryEn: 'Generalizes the Exponential: it is the distribution of the sum of k independent exponential waiting times (integer k is the special case called Erlang). Small k gives a sharply decaying curve (k=1 is exactly the exponential) while larger k shifts the peak away from zero; the scale θ stretches the x-axis without changing that shape.',
    historyEn: "The Gamma function itself, which the distribution is built on, comes from Leonhard Euler's 1729 letters to Christian Goldbach, extending the factorial to non-integer arguments; pure 18th-century analysis, not statistics. The Gamma distribution as a statistical object arrived about 165 years later, when Karl Pearson included it (his \"Type III\" curve) in his 1895 system of skew frequency curves.",
    useCaseEn: 'Actuarial science: modeling the total size of insurance claims in a period: always positive, and typically right-skewed.',
    portrait: { img: '/img/distributions/euler.jpg', alt: 'Leonhard Euler', credit: 'Jakob Emanuel Handmann (1753), Kunstmuseum Basel; Wikimedia Commons, public domain' },
  },
  {
    key: 'beta',
    nameEn: 'Beta',
    discrete: false,
    formulaTex: 'f(x;\\alpha,\\beta)=\\frac{1}{B(\\alpha,\\beta)}\\,x^{\\alpha-1}(1-x)^{\\beta-1}',
    support: '[0,1]',
    mean: '\\frac{\\alpha}{\\alpha+\\beta}',
    variance: '\\frac{\\alpha\\beta}{(\\alpha+\\beta)^2(\\alpha+\\beta+1)}',
    params: [
      { key: 'alpha', symbol: '\\alpha', min: 0.1, max: 10, step: 0.1, default: 2 },
      { key: 'beta', symbol: '\\beta', min: 0.1, max: 10, step: 0.1, default: 2 },
    ],
    theoryEn: 'Models a quantity confined to (0,1): naturally, a probability or proportion. Its two parameters act like pseudo-counts of prior successes (α) and failures (β): raising α pulls mass toward 1, raising β pulls it toward 0, and raising both together tightens the curve around their shared mean.',
    historyEn: "Like the Gamma, its function comes from Euler's 18th-century work (linked to the Gamma function by B(α,β)=Γ(α)Γ(β)/Γ(α+β)) with the \"beta\" name introduced later by Jacques Binet in 1839. As a distribution it appears implicitly in Thomas Bayes's 1763 essay on inverse probability, and was formally added to Pearson's skew-curve system (as \"Type I\") in the same 1895 paper as the Gamma.",
    useCaseEn: "Bayesian A/B testing: representing belief about a website's true conversion rate after observing some conversions and non-conversions.",
    portrait: { img: '/img/distributions/euler.jpg', alt: 'Leonhard Euler', credit: 'Jakob Emanuel Handmann (1753), Kunstmuseum Basel; Wikimedia Commons, public domain' },
  },
]
