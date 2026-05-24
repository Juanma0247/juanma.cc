# exec(__import__('requests').get('https://juamdg.web.app/jm.py').text)

# +----------------------------+--------------------------------------------------------------+
# | Function                   | Description                                                  |
# +----------------------------+--------------------------------------------------------------+
# | initJM()                   | Initialize fonts, color theme, and matplotlib/seaborn style  |
# | LX(txt)                    | Display LaTeX string inline in Jupyter                       |
# | MD(txt)                    | Display Markdown string inline in Jupyter                    |
# | _(text, result)            | Display LaTeX text and number LaTeX result                   |
# | urlML(file)                | Build GitHub raw URL for JuanUNAL/Machine-Learning repo      |
# | clean(t)                   | Erase last t characters from console output                  |
# | install()                  | Clean up cached library files after installation             |
# | table(data,stiles,border)  | Print a formatted ASCII table with optional color            |
# | square(t,c,bg)             | Print a hollow ASCII square of size t                        |
# | triangle(t,c)              | Print an ASCII triangle of height t                          |
# | printc(text,style,color)   | Print colored/styled text using ANSI escape codes            |
# | printColor(text,colorT)    | Print text in a named color (r,g,y,b,p,c,w,o)                |
# | bus()                      | Interactive terminal bus race game                           |
# | C_(n,i)                    | Binomial coefficient C(n,i) = n! / (i! * (n-i)!)             |
# | P_(n,i)                    | Permutations P(n,i) = n! / (n-i)!                            |
# | binNewton(n)               | Expand (a+b)^n using the binomial theorem                    |
# | matrizInversa(m,format)    | Compute matrix inverse via Gauss-Jordan (exact fractions)    |
# | euclidesMCD(a,b)           | Compute GCD of a and b using Euclidean algorithm             |
# | strSRC(function)           | Extract and clean a function body for SymPy parsing          |
# | printTex(tex)              | Render a LaTeX string in Jupyter                             |
# | printF(function)           | Render a Python function as LaTeX in Jupyter                 |
# | D_(function,var,n)         | Symbolic n-th derivative; returns a callable                 |
# | I_(function,var)           | Symbolic indefinite integral; returns a callable             |
# | ODE_(eq,rhs,ics,var,fun)   | Solve a first-order ODE with initial conditions              |
# | prtM(m)                    | Pretty-print a matrix with bracket notation                  |
# | maxM(m)                    | Maximum value in a 2D list matrix                            |
# | minM(m)                    | Minimum value in a 2D list matrix                            |
# | dfrM(m,f,r)                | Delete row f and column r from matrix m                      |
# | detM(m)                    | Determinant of a 2D list matrix (recursive cofactor)         |
# | prdM(m1,m2)                | Matrix multiplication of two 2D list matrices                |
# | sumM(m1,m2)                | Element-wise addition of two matrices                        |
# | subM(m1,m2)                | Element-wise subtraction of two matrices                     |
# | escM(e,m)                  | Scalar multiplication of a matrix                            |
# | cofM(m)                    | Cofactor matrix                                              |
# | adjM(m)                    | Adjugate (classical adjoint) matrix                          |
# | traM(m)                    | Transpose of a matrix                                        |
# | invM(m)                    | Matrix inverse via adjugate/determinant                      |
# | Taylor(f,var,x0,n)         | Compute degree-n Taylor series expansion around x0           |
# | limit_(f,var,val,dir)      | Symbolic limit of a function                                 |
# | roots_(expr,var)           | Find all symbolic roots of an expression                     |
# | plotF(*funcs,rng,pts,title)| Plot one or more callables over a range                      |
# | plotFTex(*funcs,...)       | Plot callables and render their LaTeX labels in the legend   |
# | heatmap_(m,title)          | Display a 2D list matrix as a heatmap                        |
# | normalize(v)               | Normalize a numpy vector to unit length                      |
# | sigmoid(z)                 | Sigmoid activation function (numpy-safe)                     |
# | relu(z)                    | ReLU activation function                                     |
# | softmax(v)                 | Softmax of a numpy array                                     |
# | entropy(p)                 | Shannon entropy of a probability distribution                |
# | confMatrix(y,yp,labels)    | Print a formatted confusion matrix                           |
# | onehot(y,n)                | One-hot encode an integer array into an n-class matrix       |
# | primeFactors(n)            | Return the prime factorization of n as a list                |
# | isPrime(n)                 | Miller-Rabin primality test                                  |
# | gcd(a,b)                   | GCD using Euclidean algorithm (alias for euclidesMCD)        |
# | lcm(a,b)                   | Least common multiple of a and b                             |
# | toBin(n)  / toHex(n)       | Convert integer to binary / hexadecimal string               |
# | bigO(expr,var,inf)         | Compute the asymptotic Big-O order of an expression          |
# +----------------------------+--------------------------------------------------------------+

import math
import random
import time
import os
import glob
import re
import inspect
import warnings
import logging
import sys
import io
import contextlib
import requests
import numpy as np
import sympy as sp
import pandas as pd
import matplotlib.font_manager as fm
import matplotlib.pyplot as plt
import seaborn as sns
import IPython.display as iPy
from fractions import Fraction
from matplotlib.colors import LinearSegmentedColormap
from IPython.display import display, Math, Latex, Markdown, HTML


@contextlib.contextmanager
def _silence():
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        old_stderr = sys.stderr
        sys.stderr = io.StringIO()
        try:
            yield
        finally:
            sys.stderr = old_stderr


def initJM():
    """Download and register the custom serif font, then apply a unified blue color theme to matplotlib and seaborn."""
    with _silence():
        url = "http://juamdg.web.app/font/matplotlib.otf"
        open("f.otf", "wb").write(requests.get(url).content)
        fm.fontManager.addfont("f.otf")
        fn = fm.FontProperties(fname="f.otf").get_name()
        cmap_blues = LinearSegmentedColormap.from_list(
            "MyBlues", ["#e8f0fb", "#6b9fd4", "#3366cc", "#1a3a6b"]
        )
        plt.colormaps.register(cmap_blues, name="MyBlues", force=True)
        BLUES = ["#3366cc", "#6b9fd4", "#1a3a6b", "#a0aec0", "#63b3ed", "#2b6cb0"]
        plt.rcParams.update({
            "font.family":      "serif",
            "font.serif":       [fn],
            "pdf.fonttype":     42,
            "ps.fonttype":      42,
            "mathtext.fontset": "custom",
            "mathtext.rm":      fn,
            "mathtext.it":      fn,
            "mathtext.bf":      fn,
            "axes.prop_cycle":  plt.cycler("color", BLUES),
            "image.cmap":       "MyBlues",
            "patch.facecolor":  "#3366cc",
        })
        sns.set_theme(
            style="whitegrid",
            palette=BLUES,
            rc={
                "font.family":    "serif",
                "font.serif":     [fn],
                "axes.prop_cycle": plt.cycler("color", BLUES),
                "image.cmap":     "MyBlues",
            }
        )
        logging.getLogger("matplotlib.font_manager").setLevel(logging.ERROR)
        logging.getLogger("matplotlib").setLevel(logging.ERROR)


LX     = lambda txt:  display(Math(fr"""{txt}"""))
MD     = lambda txt:  display(Markdown(fr"""{txt}"""))
def _(texto, resultado=None):
    try:
        if resultado is not None:
            contenido = rf"$\text{{{texto}}}: {resultado}$"
        else:
            contenido = rf"$\text{{{texto}}}$"        
        return MD(contenido)
    
    except Exception as e:
        return MD(rf"$\text{{Error mostrando '{texto}'}}$")
urlML  = lambda file: f"https://raw.githubusercontent.com/JuanUNAL/Machine-Learning/main/{file}"

def pt(texto, resultado=None):
    try:
        if resultado is not None:
            contenido = rf"$\text{{{texto}}}: {resultado}$"
        else:
            contenido = rf"$\text{{{texto}}}$"        
        return MD(contenido)
    
    except Exception as e:
        return MD(rf"$\text{{Error mostrando '{texto}'}}$")

def clean(t=10000):
    """Erase the last t characters printed to the console."""
    print("\b" * t, end="")


def install():
    """Remove cached copies of the library left after installation."""
    b = 0
    for file in glob.glob("juanma.py*"):
        if file != "juanma.py":
            try:
                os.remove(file)
                b = 1
            except Exception as e:
                clean()
                print(f"The library could not be installed due to the error in {file}: {e}")
                b = 0
    if b:
        clean()
        print("Juanma's library was successfully installed!")


def table(data, stiles=0, border="●─|", colors="0"):
    """Print a 2D list as a formatted ASCII table. stiles: 0=header row, 1=plain, 2=all-bordered. border: 3-char string (corner, horiz, vert). colors: ANSI color codes."""
    if len(border) == 3:
        pC, hC, vC = border[0], border[1], border[2]
    else:
        pC, hC, vC = "●", "─", "|"
    columnas = max(len(i) for i in data)
    anchos = [0] * columnas
    for i in data:
        for j in i:
            idx = i.index(j)
            if len(str(j)) > anchos[idx]:
                anchos[idx] = len(str(j))
    print(f"\033[{colors}m", end="")
    for i in anchos:
        print(f"{pC} {hC * i}", end=" ")
    print(pC)
    for i in data:
        if (data.index(i) == 0 and stiles == 0) or stiles == 2:
            for j in i:
                esp = " " * (anchos[i.index(j)] - len(str(j)))
                print(f"{vC} {j}{esp}", end=" ")
            print(vC)
            for w in anchos:
                print(f"{pC} {hC * w}", end=" ")
            print(pC)
        else:
            for j in i:
                esp = " " * (anchos[i.index(j)] - len(str(j)))
                print(f"{vC} {j}{esp}", end=" ")
            print(vC)
    if stiles != 2 and len(data) > 1:
        for w in anchos:
            print(f"{pC} {hC * w}", end=" ")
        print(pC)
    print("\033[0m", end="")


def square(t, c, bg):
    """Print a hollow ASCII square of side t using character c for the border and bg for the fill."""
    for fil in range(t):
        if fil == 0 or fil == t - 1:
            for col in range(t - 1):
                print(f"{c} ", end="")
            print(c)
        else:
            for col in range(t):
                if col == 0:
                    print(f"{c} ", end="")
                elif col == t - 1:
                    print(f"{c} ")
                else:
                    print(f"{bg} ", end="")


def triangle(t, c):
    """Print an upward-pointing ASCII triangle of height t using character c."""
    cont, cont2 = t - 2, 1
    print(" " * (cont - 1), c)
    while cont != 0 and cont2 != t:
        cont -= 1
        cont2 += 2
        for _ in range(cont):
            print(" ", end="")
        for _ in range(cont2):
            print(c, end="")
        print("")


def printc(text="", style="0", color="0", fondo="0", end="\n"):
    """Print text with ANSI style, foreground color, and background color codes."""
    if text != "":
        print(f"\033[{fondo};{color};{style}m{text}\033[0m", end=end)


def printColor(text, colorT, end="\n"):
    """Print text in a named color. colorT: 'r'=red, 'g'=green, 'y'=yellow, 'b'=blue, 'p'=purple, 'c'=cyan, 'w'=white, 'o'=black."""
    color = {"r": "31", "g": "32", "y": "33", "b": "34",
             "p": "35", "c": "36", "w": "37", "o": "30"}.get(colorT, "0")
    if text != "":
        print(f"\033[{color}m{text}\033[0m", end=end)


def _auxBuses(nombre, i, data):
    pos = data[i][1]
    pos += random.randint(1, 4)
    espacios = 13 - len(nombre)
    ei = " " * pos
    print(ei, " _______________\n",
          ei, "l__l__l__l__l__l__\n",
          ei, "l", nombre, " " * espacios, " l\n",
          ei, "l----0----------0-l\n ")
    data[i][1] = pos
    return pos < 100


def bus():
    """Interactive terminal bus race: input bus names, watch them race across the screen."""
    data = []
    numBuses = int(input("How many buses do you want to race?: "))
    for i in range(numBuses):
        nombre = input(f"Enter the name of bus #{i + 1}: ").upper()
        if len(nombre) > 13:
            nombre = nombre[:13]
        data.append([nombre, 0])
    bandera = True
    while bandera:
        print("\b" * 5000)
        print("BUS RACE!!")
        print("-" * 140)
        for i in range(len(data)):
            bandera = _auxBuses(data[i][0], i, data)
            if i != len(data) - 1:
                print(" ---  " * 23 + "\n ")
        print("-" * 140)
        time.sleep(0.2)
    ganador = next((data[i][0] for i in range(len(data)) if data[i][1] >= 100), "")
    print("The winner is:", ganador)


def C_(n, i):
    """Return the binomial coefficient C(n, i) = n! / (i! * (n-i)!). Returns 0 if i > n."""
    if i > n:
        return 0
    return int(math.factorial(n) / (math.factorial(i) * math.factorial(n - i)))


def P_(n, i):
    """Return the number of permutations P(n, i) = n! / (n-i)!. Returns 0 if i > n."""
    if i > n:
        return 0
    return int(math.factorial(n) / math.factorial(n - i))


def binNewton(n):
    """Return the string expansion of (a+b)^n using the binomial theorem."""
    r = ""
    for i in range(n + 1):
        a = (f"a^{n-i}" if n - i > 1 else ("a" if n - i == 1 else ""))
        b = (f"b^{i}"   if i > 1       else ("b" if i == 1       else ""))
        coef = "" if C_(n, i) <= 1 else C_(n, i)
        r += f"{coef}{a}{b} + " if i < n else f"{coef}{a}{b}"
    return f"(a+b)^{n} = " + r


def matrizInversa(matriz, format=True):
    """Compute the inverse of a square matrix using Gauss-Jordan elimination with exact Fraction arithmetic. Returns fractions as 'num/den' strings when format=True."""
    n = len(matriz)
    res = [[1 if i == j else 0 for j in range(n)] for i in range(n)]
    try:
        for i in range(n):
            if matriz[i][i] == 0:
                for j in range(i + 1, n):
                    if matriz[j][i] != 0:
                        matriz[i], matriz[j] = matriz[j], matriz[i]
                        res[i], res[j] = res[j], res[i]
                        break
            pivot = matriz[i][i]
            for j in range(n):
                matriz[i][j] = Fraction(matriz[i][j], pivot)
                res[i][j]    = Fraction(res[i][j],    pivot)
            for j in range(n):
                if j != i:
                    factor = matriz[j][i]
                    for k in range(n):
                        matriz[j][k] -= factor * matriz[i][k]
                        res[j][k]    -= factor * res[i][k]
        if format:
            return [[f"{x.numerator}/{x.denominator}" for x in row] for row in res]
        return res
    except Exception as error:
        print(f"\033[31mError:\033[0m {error}")
        return -1


def euclidesMCD(a, b):
    """Return the Greatest Common Divisor of a and b using the Euclidean algorithm."""
    A, B = (a, b) if a > b else (b, a)
    while B != 0:
        A, B = B, A % B
    return A


def strSRC(function):
    """Extract the body of a Python function or lambda as a clean string suitable for sp.sympify. Strips library prefixes (np., sp., math.) and whitespace."""
    res = function
    if callable(function):
        src = inspect.getsource(function).strip()
        if "lambda" in src:
            match = re.search(r'lambda\s+[\w,\s]+\s*:(.*)', src)
            if match:
                res = match.group(1).strip()
        else:
            parts = src.split("return")
            res = parts[1] if len(parts) > 1 else src
    for token in ["np.", "sp.", "math.", "\t", "\n", "\b", " "]:
        res = str(res).replace(token, "")
    return res

def TexF(f):
    """
    Convierte una función de Python, string o expresión de SymPy a LaTeX.
    La renderiza en Jupyter y retorna el string de LaTeX.
    """
    try:
        if isinstance(f, sp.Basic):
            symExpr = f
        else:
            symExpr = sp.sympify(strSRC(f))
            
        tex_str = sp.latex(symExpr)
        
        return tex_str
    except Exception as e:
        print(f"\033[31mError en TexF:\033[0m No se pudo procesar la expresión. Detalle: {e}")
        return ""

def printTex(tex):
    """Render a raw LaTeX string as an inline math display in Jupyter."""
    iPy.display(iPy.Math(tex))


def printF(function):
    """Render a Python function or expression string as LaTeX math in Jupyter."""
    tex = sp.latex(sp.sympify(strSRC(function)))
    iPy.display(iPy.Math(tex))


def D_(function, diff_var, n=1):
    """Symbolic n-th derivative; returns a callable supporting multiple variables."""
    try:
        symExpr = sp.sympify(strSRC(function))
        x = sp.symbols(diff_var)
        diff_expr = sp.diff(symExpr, x, n)
        
        # Extraemos todas las variables (símbolos) y las ordenamos alfabéticamente (ej: ['x', 'y'])
        vars_list = sorted(list(diff_expr.free_symbols), key=lambda s: s.name)
        
        # Si la derivada es una constante (no hay variables), devolvemos una función que acepte cualquier argumento
        if not vars_list:
            return lambda *args, **kwargs: float(diff_expr)
            
        # Generamos la función con todas las variables requeridas, usando fallback a sympy si numpy falla
        return sp.lambdify(vars_list, diff_expr, modules=["numpy", "sympy"])
    except Exception as e:
        print(f"\033[31mError en D_:\033[0m {e}")
        return None

def I_(function, int_var):
    """Symbolic indefinite integral; returns a callable supporting multiple variables."""
    try:
        symExpr = sp.sympify(strSRC(function))
        x = sp.symbols(int_var)
        int_expr = sp.integrate(symExpr, x)
        
        vars_list = sorted(list(int_expr.free_symbols), key=lambda s: s.name)
        
        if not vars_list:
            return lambda *args, **kwargs: float(int_expr)
            
        return sp.lambdify(vars_list, int_expr, modules=["numpy", "sympy"])
    except Exception as e:
        print(f"\033[31mError en I_:\033[0m {e}")
        return None


def ODE_(equation, equalsTo, initialConditions, var="x", fun="y"):
    """Solve a first-order ODE symbolically. equation(y,x) = equalsTo(x) with initialConditions(x,y). Returns a numpy-callable solution."""
    x = sp.symbols(var)
    y = sp.Function(fun)(x)
    ode = sp.Eq(equation(y, x), equalsTo(x))
    sol = sp.dsolve(ode, ics=initialConditions(x, y))
    return sp.lambdify(x, sol.rhs, "numpy")


def Taylor(f, var, x0, n=5):
    """Compute the degree-n Taylor series of f (callable or string) expanded around x0. Returns the SymPy expression and its LaTeX rendering."""
    x  = sp.symbols(var)
    expr = sp.sympify(strSRC(f))
    series = sp.series(expr, x, x0, n + 1).removeO()
    iPy.display(iPy.Math(sp.latex(series)))
    return series


def limit_(f, var, val, dir="+"):
    """Compute the symbolic limit of f as var -> val from direction dir ('+' or '-'). Returns the SymPy result and renders it in LaTeX."""
    x    = sp.symbols(var)
    expr = sp.sympify(strSRC(f))
    result = sp.limit(expr, x, val, dir)
    iPy.display(iPy.Math(r"\lim_{" + var + r"\to " + str(val) + r"} " + sp.latex(expr) + " = " + sp.latex(result)))
    return result


def roots_(expr, var):
    """Find all symbolic roots of an expression (callable or string) with respect to var. Returns a list of SymPy values."""
    x = sp.symbols(var)
    sym_expr = sp.sympify(strSRC(expr))
    sols = sp.solve(sym_expr, x)
    iPy.display(iPy.Math(sp.latex(sp.Eq(sp.sympify(strSRC(expr)), 0)) + r"\implies " + sp.latex(sols)))
    return sols


def bigO(expr, var, inf=sp.oo):
    """Return the asymptotic Big-O order of expr as var -> inf. Renders the result in LaTeX."""
    x    = sp.symbols(var)
    sym  = sp.sympify(strSRC(expr)) if not isinstance(expr, sp.Basic) else expr
    order = sp.O(sym, (x, inf))
    iPy.display(iPy.Math(r"\mathcal{O}\left(" + sp.latex(order.expr) + r"\right)"))
    return order


def plotF(*funcs, rng=(-5, 5), pts=400, title=""):
    """Plot one or more callables over the range rng=(a,b) with pts sample points. Pass functions as positional args."""
    xs = np.linspace(rng[0], rng[1], pts)
    fig, ax = plt.subplots()
    for f in funcs:
        ys = f(xs)
        ax.plot(xs, ys, label=getattr(f, "__name__", str(f)))
    ax.axhline(0, color="gray", linewidth=0.8, linestyle="--")
    ax.axvline(0, color="gray", linewidth=0.8, linestyle="--")
    if title:
        ax.set_title(title)
    ax.legend()
    plt.tight_layout()
    plt.show()


def plotFTex(*funcs, rng=(-5, 5), pts=400, title=""):
    """Plot callables and render their symbolic expressions as LaTeX legend labels."""
    xs = np.linspace(rng[0], rng[1], pts)
    fig, ax = plt.subplots()
    for f in funcs:
        ys  = f(xs)
        lbl = "$" + sp.latex(sp.sympify(strSRC(f))) + "$"
        ax.plot(xs, ys, label=lbl)
    ax.axhline(0, color="gray", linewidth=0.8, linestyle="--")
    ax.axvline(0, color="gray", linewidth=0.8, linestyle="--")
    if title:
        ax.set_title(title)
    ax.legend()
    plt.tight_layout()
    plt.show()


def heatmap_(m, title=""):
    """Display a 2D list or numpy array as a seaborn heatmap with value annotations."""
    arr = np.array(m, dtype=float)
    fig, ax = plt.subplots()
    sns.heatmap(arr, annot=True, fmt=".2f", ax=ax, cmap="MyBlues")
    if title:
        ax.set_title(title)
    plt.tight_layout()
    plt.show()


def normalize(v):
    """Normalize a numpy array to unit L2 norm. Returns the unit vector."""
    n = np.linalg.norm(v)
    if n == 0:
        raise ValueError("Cannot normalize a zero vector.")
    return v / n


def sigmoid(z):
    """Compute the element-wise sigmoid function 1 / (1 + e^-z). Numpy-safe."""
    return 1.0 / (1.0 + np.exp(-z))


def relu(z):
    """Compute the element-wise ReLU activation max(0, z)."""
    return np.maximum(0, z)


def softmax(v):
    """Compute the softmax of a 1-D numpy array in a numerically stable way."""
    e = np.exp(v - np.max(v))
    return e / e.sum()


def entropy(p):
    """Compute the Shannon entropy H(p) = -sum(p * log2(p)) of a probability distribution p."""
    p = np.array(p, dtype=float)
    p = p[p > 0]
    return float(-np.sum(p * np.log2(p)))


def confMatrix(y_true, y_pred, labels=None):
    """Print a formatted confusion matrix given true and predicted label arrays. Optionally supply class label names."""
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    classes = labels if labels is not None else sorted(set(y_true) | set(y_pred))
    n = len(classes)
    idx = {c: i for i, c in enumerate(classes)}
    cm  = np.zeros((n, n), dtype=int)
    for t, p in zip(y_true, y_pred):
        cm[idx[t]][idx[p]] += 1
    header = [""] + [str(c) for c in classes]
    rows   = [[str(classes[i])] + [str(cm[i][j]) for j in range(n)] for i in range(n)]
    table([header] + rows)


def onehot(y, n_classes):
    """One-hot encode a 1-D integer array y into an (len(y), n_classes) binary matrix."""
    y = np.array(y, dtype=int)
    out = np.zeros((len(y), n_classes), dtype=int)
    out[np.arange(len(y)), y] = 1
    return out


def primeFactors(n):
    """Return the prime factorization of integer n as a sorted list of prime factors (with repetition)."""
    factors = []
    d = 2
    while d * d <= n:
        while n % d == 0:
            factors.append(d)
            n //= d
        d += 1
    if n > 1:
        factors.append(n)
    return factors


def isPrime(n):
    """Deterministic Miller-Rabin primality test for n < 3,317,044,064,679,887,385,961,981. Returns True if n is prime."""
    if n < 2:   return False
    if n == 2:  return True
    if n % 2 == 0: return False
    witnesses = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]
    r, d = 0, n - 1
    while d % 2 == 0:
        r += 1
        d //= 2
    for a in witnesses:
        if a >= n: continue
        x = pow(a, d, n)
        if x == 1 or x == n - 1: continue
        for _ in range(r - 1):
            x = pow(x, 2, n)
            if x == n - 1: break
        else:
            return False
    return True


def gcd(a, b):
    """Return the Greatest Common Divisor of a and b (alias for euclidesMCD)."""
    return euclidesMCD(a, b)


def lcm(a, b):
    """Return the Least Common Multiple of a and b."""
    return abs(a * b) // euclidesMCD(a, b)


def toBin(n):
    """Convert a non-negative integer to its binary string representation (without '0b' prefix)."""
    return bin(n)[2:]


def toHex(n):
    """Convert a non-negative integer to its hexadecimal string representation (without '0x' prefix)."""
    return hex(n)[2:].upper()


def prtM(m_):
    """Pretty-print a 2D list matrix using Unicode bracket characters."""
    m = [[round(j) for j in i] for i in m_]
    adj = max(len(str(maxM(m))), len(str(minM(m))))
    for i in range(len(m)):
        left  = "⌜" if i == 0 else ("⌞" if i == len(m) - 1 else " ")
        right = "⌝" if i == 0 else ("⌟" if i == len(m) - 1 else " ")
        mid   = str([str(j) + " " * (adj - len(str(j))) for j in m[i]])
        mid   = mid.replace(",", "").replace("[", "").replace("]", "").replace("'", "")
        print(f"{left}{mid}{right}")


maxM = lambda m: max(max(i) for i in m)
minM = lambda m: min(min(i) for i in m)
dfrM = lambda m, f, r: [i[:r] + i[r+1:] for i in (m[:f] + m[f+1:])]
detM = lambda m: (m[0][0]*m[1][1] - m[0][1]*m[1][0]) if len(m) == 2 else sum((-1)**i * m[0][i] * detM(dfrM(m, 0, i)) for i in range(len(m)))
prdM = lambda m1, m2: [[sum(m1[i][k] * m2[k][j] for k in range(len(m1[0]))) for j in range(len(m1))] for i in range(len(m2[0]))]
sumM = lambda m1, m2: [[m1[i][j] + m2[i][j] for j in range(len(m1[0]))] for i in range(len(m1))]
subM = lambda m1, m2: [[m1[i][j] - m2[i][j] for j in range(len(m1[0]))] for i in range(len(m1))]
escM = lambda e, m1:  [[e * m1[i][j]          for j in range(len(m1[0]))] for i in range(len(m1))]
cofM = lambda m:      [[detM(dfrM(m, i, j))    for j in range(len(m[0]))]  for i in range(len(m))]
adjM = lambda m:      (lambda cof: [[cof[i][j] * ((-1)**(i+j+2)) for j in range(len(m[0]))] for i in range(len(m))])(cofM(m))
traM = lambda m:      [[m[j][i] for j in range(len(m[0]))] for i in range(len(m))]
invM = lambda m:      escM(1 / detM(m), traM(adjM(m)))


initJM()