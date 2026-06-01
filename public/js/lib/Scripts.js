class Scripts {
  addCode(container, name, code, language) {
    const div = document.createElement('div')
    div.classList.add('codigo')

    const state = document.createElement('span')
    state.style.display = 'none'
    state.textContent = 'none'

    const titleRow = document.createElement('div')
    titleRow.style.display = 'flex'
    titleRow.style.alignItems = 'center'

    const h3 = document.createElement('h3')
    h3.textContent = name
    h3.style.cursor = 'pointer'

    const ico = document.createElement('img')
    ico.src = `/img/languages/${language.split('-')[1]}.svg`
    ico.classList.add('icoTitle')

    const codeEl = document.createElement('code')
    codeEl.classList.add('tCode', language)
    codeEl.textContent = code

    const copyBtn = document.createElement('img')
    copyBtn.classList.add('bCode')
    copyBtn.src = '/img/copy.svg'
    copyBtn.style.display = 'none'

    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(codeEl.textContent)
    })

    h3.addEventListener('click', () => {
      const visible = state.textContent === 'block'
      state.textContent = visible ? 'none' : 'block'
      codeEl.style.display = visible ? 'none' : 'block'
      copyBtn.style.display = visible ? 'none' : 'block'
    })

    codeEl.style.display = 'none'

    titleRow.appendChild(h3)
    titleRow.appendChild(ico)
    div.appendChild(state)
    div.appendChild(titleRow)
    const pre = document.createElement('pre')
    pre.appendChild(codeEl)
    div.appendChild(pre)
    div.appendChild(copyBtn)
    container.appendChild(div)
  }

  main(container) {
    const a = (name, code, lang) => this.addCode(container, name, code, lang)

    a('numeroANombre', `millones = [
  ('sextillónes',   1000000000000000000),
  ('quintillónes',  1000000000000000),
  ('trillones',     1000000000000),
  ('billónes',      1000000000),
  ('millones',      1000000),
  ('mil',           1000),
]
cientos = [
  ('novecientos', 900), ('ochocientos', 800), ('setecientos', 700),
  ('seiscientos', 600), ('quinientos', 500),  ('cuatroscientos', 400),
  ('trescientos', 300), ('doscientos', 200),  ('ciento', 100),
  ('noventa', 90),      ('ochenta', 80),       ('setenta', 70),
  ('sesenta', 60),      ('cincuenta', 50),     ('cuarenta', 40),
  ('treinta', 30),      ('veinte', 20),        ('diecinueve', 19),
  ('dieciocho', 18),    ('diecisiete', 17),    ('dieciseis', 16),
  ('quince', 15),       ('catorce', 14),       ('trece', 13),
  ('doce', 12),         ('once', 11),          ('diez', 10),
]
unidades = [
  ('nueve', 9), ('ocho', 8), ('siete', 7), ('seis', 6), ('cinco', 5),
  ('cuatro', 4), ('tres', 3), ('dos', 2),  ('uno', 1),
]

def name999(num):
  r = ""
  while num > 0 and num < 1000000000000000000:
    if num == 100:
      r += "cien "; num -= 100
    if num >= 10:
      for n, v in cientos:
        while num >= v:
          r += f"{n} "; num -= v
    if r != "" and num < 10 and num != 0:
      r += "y "
    if num < 10:
      for n, v in unidades:
        while num >= v:
          r += f"{n} "; num -= v
  return r

def numeroANombre(num):
  r = ""
  while num > 0:
    for n, v in millones:
      if num > v:
        auxnum = int(num / v)
        num -= auxnum * v
        r += f"{name999(auxnum)}{n} "
    else:
      r += name999(num); num -= num
  return r

print(numeroANombre(241374))`, 'language-python')

    a('esPrimo', `import math

def esPrimo(n):
  if n == 2 or n == 3 or n == 5:
    return True
  elif n == 1 or n == 4 or n % 5 == 0 or n % 2 == 0:
    return False
  else:
    d = 5
    r = math.isqrt(n)
    while d <= r and n % d != 0:
        d += 2
    return d > r`, 'language-python')

    a('naturalARomano', `def naturalARomano(num):
    values = [
        (1000000, 'm'), (900000, 'cm'), (500000, 'd'), (400000, 'cd'),
        (100000, 'c'), (90000, 'xc'), (50000, 'l'), (40000, 'xl'),
        (10000, 'x'), (9000, 'ix'), (5000, 'v'), (4000, 'iv'),
        (1000, 'M'), (900, 'CM'), (500, 'D'), (400, 'CD'),
        (100, 'C'), (90, 'XC'), (50, 'L'), (40, 'XL'),
        (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I'),
    ]
    romano, auxnum = "", num
    while num > 0:
       for i, r in values:
          while num >= i:
             romano += r; num -= i
    print(f"{auxnum} en numeros romanos es: {romano}")`, 'language-python')

    a('Tablas de multiplicar', `def cen(s):
    t = 15 - len(s)
    sp = " " * t
    return f"{s}{sp}"

def tab(a, b):
    for f in range(a, b + 1):
      print(cen(f"Tabla del {f}"), end=(""))
    print()
    for f in range(1, 10):
     for c in range(a, b + 1):
       print(cen(f"{c} x {f} = {c*f}"), end=(""))
     print()

tab(1, 4)
print()
tab(5, 9)`, 'language-python')

    a('Triángulo numérico', `n = int(input("Ingrese el número: "))
for f in range(1, n+1):
  if n > 9:
    if len(str(f)) == 1:
      for _ in range(2*n-f-10): print(" ", end=(""))
    else:
      for _ in range(n-f): print("  ", end=(""))
  else:
    for _ in range(n-f): print(" ", end=(""))
  for a in range(1, f+1): print(a, end=(""))
  for d in range(f-1, 0, -1): print(d, end=(""))
  print()`, 'language-python')

    a('Máxima suma de subvector contiguo', `x = [31, -41, 59, 26, -53, 58, 97, -93, -23, 84]
n = len(x)
sum, res, ma = 0, 0, 0
for i in range(n):
  ma = max(ma + x[i], 0)
  res = max(res, ma)
print(res)`, 'language-python')

    a('Hilo bajo bloques de gravedad', `local gravity_blocks = {
    blocks.sand, blocks.red_sand, blocks.gravel, blocks.anvil,
    blocks.chipped_anvil, blocks.damaged_anvil, blocks.dragon_egg,
    blocks.scaffolding,
    blocks.white_concrete_powder, blocks.orange_concrete_powder,
    blocks.magenta_concrete_powder, blocks.light_blue_concrete_powder,
    blocks.yellow_concrete_powder, blocks.lime_concrete_powder,
    blocks.pink_concrete_powder,  blocks.gray_concrete_powder,
    blocks.light_gray_concrete_powder, blocks.cyan_concrete_powder,
    blocks.purple_concrete_powder, blocks.blue_concrete_powder,
    blocks.brown_concrete_powder, blocks.green_concrete_powder,
    blocks.red_concrete_powder,   blocks.black_concrete_powder,
}

local function put_here(this, top)
    for i, j in ipairs(gravity_blocks) do
        if top == j and this == blocks.air then return true end
    end
    return false
end

if put_here(getBlock(x, y, z), getBlock(x, y + 1, z)) then
    return blocks.tripwire
end`, 'language-lua')

    a('Ajedrez tridimensional', `if getBlock(x,y,z) == blocks.obsidian and (x + y + z) % 2 == 0 then
    setBlock(x,y,z, blocks.air)
end`, 'language-lua')

    a('Construir edificio', `local config = {
    width = 10, length = 10, height = 5, n_floors = 1,
    m_wall   = "minecraft:quartz_block",
    m_window = "minecraft:glass",
    m_floor  = "minecraft:dark_oak_planks",
    m_roof   = "minecraft:stone_bricks",
    m_door   = "minecraft:oak_door",
    with_windows = true, with_balconies = false, flat_roof = false,
}

local function fill(x1,y1,z1, x2,y2,z2, block)
    for x=x1,x2 do for y=y1,y2 do for z=z1,z2 do
        setBlock(x,y,z,block)
    end end end
end

local function createHollowWall(x1,y1,z1, x2,y2,z2, block)
    fill(x1,y1,z1, x2,y2,z1, block)
    fill(x1,y1,z2, x2,y2,z2, block)
    fill(x1,y1,z1, x1,y2,z2, block)
    fill(x2,y1,z1, x2,y2,z2, block)
end

function buildBuilding()
    local x1, z1 = x, z
    local x2, z2 = x+config.width-1, z+config.length-1
    for floor = 0, config.n_floors-1 do
        local yb = y + floor*config.height
        local yc = yb + config.height - 1
        fill(x1,yb,z1, x2,yb,z2, config.m_floor)
        createHollowWall(x1,yb+1,z1, x2,yc-1,z2, config.m_wall)
        if floor == 0 then
            local xd = x1 + math.floor(config.width/2)
            setBlock(xd,yb+1,z1, config.m_door.."[half=lower,facing=south]")
            setBlock(xd,yb+2,z1, config.m_door.."[half=upper,facing=south]")
        end
        fill(x1+1,yc,z1+1, x2-1,yc,z2-1, config.m_floor)
    end
    local yr = y + config.n_floors*config.height
    if config.flat_roof then
        fill(x1,yr,z1, x2,yr,z2, config.m_roof)
    else
        for i=0,math.floor(config.length/2) do
            local zo = z1+i
            if zo <= z2-i then
                fill(x1,yr+i,zo, x2,yr+i,z2-i, config.m_roof)
            end
        end
    end
end
buildBuilding()`, 'language-lua')

    a('Espada Golpeo 255', `/give @s netherite_sword[enchantments={"minecraft:smite":255}]`, 'language-minecraft')
    a('Espada Filo 255',   `/give @s netherite_sword[enchantments={"minecraft:sharpness":255}]`, 'language-minecraft')

    const spacer = document.createElement('div')
    spacer.classList.add('buttonSpace')
    container.appendChild(spacer)
  }
}

export default Scripts
