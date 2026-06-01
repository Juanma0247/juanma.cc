const rootStyles = getComputedStyle(document.documentElement)
const c1 = rootStyles.getPropertyValue('--c1').trim()
const c2 = rootStyles.getPropertyValue('--c2').trim()
const c3 = rootStyles.getPropertyValue('--c3').trim()

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [0, 0, 0]
}

const c1rgb = hexToRgb(c1)
const c2rgb = hexToRgb(c2)
const c3rgb = hexToRgb(c3)
const crrgb = hexToRgb("#ff0000")

class CrossMatrix {
    constructor() {
        this.p13StartRow = document.getElementById('p13StartRow')
        this.p13StartRowValue = document.getElementById('p13StartRowValue')
        this.p13TotalCost = document.getElementById('p13TotalCost')
        this.p13CanvasContainer = document.getElementById('p13canvas')
        this.p13input1 = document.querySelector(".p13input1")
        this.p13input2 = document.querySelector(".p13input2")
        this.presets = document.querySelector(".p13presets")
        this.pesets_botton = document.getElementById("p13presetsBotton")
        this.i21 = document.getElementById("p13i21")
        this.i22 = document.getElementById("p13i22")
        this.i23 = document.getElementById("p13i23")
        this.b21 = document.getElementById("p13b21")
        this.cellSize = 25
        this.heightScale = 8
        this.isFunct = true

        this.matrix = []
        this.path = []
        this.startRow = 0

        this.opacity = 1.0
        this.fadeDirection = -1

        this.cam = null
        this.rotationX = -Math.PI / 5
        this.rotationY = 0
        this.zoom = 0.4
        this.autoRotationY = 0

        this.isDragging = false
        this.prevMouseX = 0
        this.prevMouseY = 0

        this.p5Instance = null
        this.pathSet = new Set()

        this.presetsData = [
            {
                name: "Turbulent",
                func: "10*sin(x) + 8*cos(y*1.5) + 5*sin(x*y/10) + 20",
                latex: "10\\sin(x) + 8\\cos(1.5y) + 5\\sin(\\frac{xy}{10}) + 20",
                x_range: "0 20",
                y_range: "0 10"
            },
            {
                name: "Waves",
                func: "10*sin(x) + 10*cos(y)",
                latex: "10\\sin(x) + 10\\cos(y)",
                x_range: "-20 20",
                y_range: "0 20"
            },
            {
                name: "Mountain",
                func: "40*exp(-((x-30)*(x-20) + (y-20)*(y-20))/300)",
                latex: "40e^{-\\frac{(x-30)^2+(y-20)^2}{300}} ",
                x_range: "0 40",
                y_range: "0 40"
            },
            {
                name: "Ripples",
                func: "20*sin(sqrt(x*x + y*y)) + 25",
                latex: "20\\sin(\\sqrt{x^2+y^2}) + 25",
                x_range: "-8 8",
                y_range: "-8 8"
            },
            {
                name: "Valley",
                func: "abs(x) + abs(y) + 5",
                latex: "|x| + |y| + 5",
                x_range: "-10 10",
                y_range: "-10 10"
            },
            {
                name: "Spiral",
                func: "10*sin(x + y) + 10*cos(x - y) + 20",
                latex: "10\\sin(x+y) + 10\\cos(x-y) + 20",
                x_range: "0 10",
                y_range: "0 10"
            },
            {
                name: "Paraboloid",
                func: "x*x + y*y",
                latex: "x^2 + y^2",
                x_range: "-5 5",
                y_range: "-5 5"
            },
            {
                name: "Saddle",
                func: "x*x - y*y + 20",
                latex: "x^2 - y^2 + 20",
                x_range: "-5 5",
                y_range: "-5 5"
            },
            {
                name: "Undulating",
                func: "10*sin(x/2)*cos(y/2) + 15",
                latex: "10\\sin(\\frac{x}{2})\\cos(\\frac{y}{2}) + 15",
                x_range: "0 12",
                y_range: "0 8"
            },
            {
                name: "Inclined Plane",
                func: "x + 2*y",
                latex: "x + 2y",
                x_range: "0 8",
                y_range: "0 5"
            },
            {
                name: "Chess",
                func: "(floor(x) + floor(y)) % 2 === 0 ? 1 : 5",
                latex: "\\begin{cases} 1 & \\text{if } (\\lfloor x \\rfloor + \\lfloor y \\rfloor) \\bmod 2 = 0 \\\\ 5 & \\text{otherwise} \\end{cases}",
                x_range: "-4 4",
                y_range: "-4 4"
            },
            {
                name: "Steps",
                func: "floor(x/3)*10 + floor(y/2)*5",
                latex: "\\lfloor\\frac{x}{3}\\rfloor \\cdot 10 + \\lfloor\\frac{y}{2}\\rfloor \\cdot 5",
                x_range: "0 12",
                y_range: "0 6"
            },
            {
                name: "mountain",
                func: "mountain [8, 8, 25, 8] [22, 15, 30, 10] [15, 22, 20, 7] [5, 20, 18, 6] [40, 5, 59, 20] [60, 25, 10, 20]",
                latex: "\\text{Mountains with random peaks}",
                x_range: "0 80",
                y_range: "0 30"
            }
        ]
    }

    matrixFromFunction(funcStr, x_range, y_range, h_x = 1, h_y = 1, redondear = true) {
        const [x_0, x_n] = x_range
        const [y_0, y_m] = y_range
        const f = new Function('x', 'y', 'Math', `
            with(Math) {
                return ${funcStr}
            }
        `)
        const matrix = []
        for (let y = y_0; y <= y_m; y += h_y) {
            const fila = []
            for (let x = x_0; x <= x_n; x += h_x) {
                let valor = f(x, y, Math)
                if (redondear) {
                    valor = Math.round(valor)
                }
                fila.push(valor)
            }
            matrix.push(fila)
        }
        let minValor = Infinity
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] < minValor) {
                    minValor = matrix[i][j]
                }
            }
        }
        if (minValor < 0) {
            const offset = Math.abs(minValor)
            for (let i = 0; i < matrix.length; i++) {
                for (let j = 0; j < matrix[i].length; j++) {
                    matrix[i][j] += offset
                }
            }
        }
        return matrix
    }

    parseMountainPeaks(funcStr) {
        const peaksStr = funcStr.replace(/^mountain\s+/, '')
        const regex = /\[([^\]]+)\]/g
        const matches = peaksStr.matchAll(regex)
        const peaks = []
        for (const match of matches) {
            const values = match[1].split(',').map(v => parseFloat(v.trim()))
            if (values.length === 4) {
                peaks.push({
                    x: values[0],
                    y: values[1],
                    height: values[2],
                    radius: values[3]
                })
            }
        }
        return peaks
    }

    generateMountainMatrix(x_range, y_range, funcStr) {
        var matrix = []
        var peaks = this.parseMountainPeaks(funcStr)

        for (var i = y_range[0]; i < y_range[1]; i++) {
            var row = []
            for (var j = x_range[0]; j < x_range[1]; j++) {
                var height = 2 + Math.random() * 3

                for (var p = 0; p < peaks.length; p++) {
                    var peak = peaks[p]
                    var dist = Math.sqrt(Math.pow(i - peak.y, 2) + Math.pow(j - peak.x, 2))
                    if (dist < peak.radius) {
                        var influence = 1 - (dist / peak.radius)
                        height += peak.height * influence * influence
                    }
                }

                row.push(Math.round(height))
            }
            matrix.push(row)
        }
        return matrix
    }

    generateMatrixFromFunction() {
        try {
            const funcStr = this.i23.value.trim()
            const x_range = this.i21.value.trim().split(/\s+/).map(Number)
            const y_range = this.i22.value.trim().split(/\s+/).map(Number)
            if (funcStr.includes("mountain")) {
                this.matrix = this.generateMountainMatrix(x_range, y_range, funcStr)
            } else {
                if (x_range.length !== 2 || y_range.length !== 2) {
                    alert('Ranges must have the format "x1 x2" and "y1 y2"')
                    return
                }
                if (!funcStr) {
                    alert('You must enter a function')
                    return
                }
                this.matrix = this.matrixFromFunction(funcStr, x_range, y_range)
            }
            this.startRow = parseInt((this.matrix.length - 1) / 2)
            this.path = this.dinamicCross(this.matrix, this.startRow)
            this.updatePathSet()
            this.updateCost()
            this.p13StartRow.max = this.matrix.length - 1
            this.p13StartRowValue.textContent = this.startRow
            if (this.p5Instance) {
                this.p5Instance.redraw()
            }
        } catch (error) {
            alert('Error generating matrix: ' + error.message)
            console.error(error)
        }
    }

    renderPresets() {
        this.presets.innerHTML = ''
        this.presetsData.forEach((preset) => {
            const presetElement = document.createElement('p')
            presetElement.className = 'p13prefunc'
            const x_range = preset.x_range.trim().split(/\s+/).map(Number)
            const y_range = preset.y_range.trim().split(/\s+/).map(Number)
            presetElement.innerHTML = `\\(\\text{${preset.name}}\\qquad ${preset.latex}\\newline\\qquad x \\in [${x_range[0]}, ${x_range[1]}] \\qquad y \\in [${y_range[0]}, ${y_range[1]}]\\)`
            presetElement.addEventListener('click', () => {
                this.applyPreset(preset)
                this.presets.style.display = 'none'
            })
            this.presets.appendChild(presetElement)
        })
        renderMathInElement(document.body)
        if (window.MathJax) {
            MathJax.typesetPromise([this.presets]).catch((err) => console.log(err))
        }
    }

    applyPreset(preset) {
        this.i21.value = preset.x_range
        this.i22.value = preset.y_range
        this.i23.value = preset.func
        this.presets.style.display = 'none'
        this.generateMatrixFromFunction()
    }

    dinamicCross(M, y) {
        if (!M || !M[0]) return []
        var h = M.length
        var w = M[0].length
        var inf = Infinity
        var path = [[0, y]]
        var row = y

        var costs = []
        for (var i = 0; i < h; i++) {
            var costRow = []
            for (var j = 0; j < w; j++) {
                costRow.push(inf)
            }
            costs.push(costRow)
        }

        for (var j = 0; j < h; j++) {
            costs[j][w - 1] = M[j][w - 1]
        }

        for (var i = w - 2; i >= 0; i--) {
            for (var j = 0; j < h; j++) {
                var yUp = j === 0 ? 1 : j - 1
                var yDawn = j === h - 1 ? h - 2 : j + 1
                costs[j][i] = M[j][i] + Math.min(
                    costs[yUp][i + 1],
                    costs[j][i + 1],
                    costs[yDawn][i + 1]
                )
            }
        }

        for (var i = 0; i < w - 1; i++) {
            var yUp = row === 0 ? 1 : row - 1
            var yDawn = row === h - 1 ? h - 2 : row + 1

            var neighbors = [[i + 1, yUp], [i + 1, row], [i + 1, yDawn]]
            var cost = [costs[yUp][i + 1], costs[row][i + 1], costs[yDawn][i + 1]]
            var minPath = cost.indexOf(Math.min.apply(Math, cost))
            row = neighbors[minPath][1]
            path.push(neighbors[minPath])
        }

        return path
    }

    calculateTotalCost(matrix, path) {
        var sum = 0
        for (var i = 0; i < path.length; i++) {
            sum += matrix[path[i][1]][path[i][0]]
        }
        return sum
    }

    updateCost() {
        var cost = this.calculateTotalCost(this.matrix, this.path)
        this.p13TotalCost.textContent = cost
    }

    setupEventListeners() {
        this.p13StartRow.addEventListener('input', (e) => {
            this.startRow = parseInt(e.target.value)
            this.p13StartRowValue.textContent = this.startRow
            this.path = this.dinamicCross(this.matrix, this.startRow)
            this.updateCost()
            this.updatePathSet()
            this.p5Instance.redraw()
        })

        this.b21.addEventListener('click', () => {
            this.generateMatrixFromFunction()
        })

        this.pesets_botton.addEventListener('click', () => {
            this.presets.style.display = 'flex'
        })

        this.presets.addEventListener('click', (e) => {
            e.stopPropagation()
        })
    }

    isMouseOverUI() {
        var uiElements = [
            this.p13StartRow,
            this.p13StartRowValue,
            this.p13TotalCost,
            this.p13input2,
            this.p13input1,
            this.presets
        ]

        for (var i = 0; i < uiElements.length; i++) {
            if (uiElements[i]) {
                var rect = uiElements[i].getBoundingClientRect()
                var mouseX = event.clientX || 0
                var mouseY = event.clientY || 0

                if (mouseX >= rect.left && mouseX <= rect.right &&
                    mouseY >= rect.top && mouseY <= rect.bottom) {
                    return true
                }
            }
        }

        return false
    }

    updatePathSet() {
        this.pathSet.clear()
        for (var i = 0; i < this.path.length; i++) {
            this.pathSet.add(this.path[i][0] + ',' + this.path[i][1])
        }
    }

    _applyInitialPreset() {
        this.applyPreset({
            name: "mountain",
            func: "mountain [8, 8, 25, 8] [22, 15, 30, 10] [15, 22, 20, 7] [5, 20, 18, 6] [40, 5, 59, 20] [60, 25, 10, 20]",
            latex: "\\text{Mountains with random peaks}",
            x_range: "0 80",
            y_range: "0 30"
        })
    }

    createSketch() {
        const self = this

        return function(p) {
            p.setup = function() {
                var canvas = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL)
                canvas.parent(self.p13CanvasContainer)
                self.cam = p.createCamera()
                self._applyInitialPreset()
                self.updateCost()
                p.noLoop()
            }

            p.draw = function() {
                p.background(0, 0, 0, 0)
                p.ambientLight(100)
                p.pointLight(255, 255, 255, 200, -200, 300)
                p.directionalLight(150, 150, 200, -0.5, 0.5, -1)

                p.rotateX(self.rotationX)
                p.rotateY(self.rotationY)

                p.scale(self.zoom)
                var offsetX = -(self.matrix[0].length * self.cellSize) / 2
                var offsetY = (self.matrix.length * self.cellSize) / 2
                var offsetZ = -(self.matrix.length * self.cellSize) / 2

                p.push()
                p.translate(offsetX, offsetY, offsetZ)

                for (var i = 0; i < self.matrix.length; i++) {
                    for (var j = 0; j < self.matrix[i].length; j++) {
                        var height = self.matrix[i][j] * self.heightScale
                        var isInPath = self.pathSet.has(j + ',' + i)

                        p.push()
                        p.translate(j * self.cellSize + self.cellSize / 2, 0, i * self.cellSize + self.cellSize / 2)

                        if (isInPath) {
                            p.fill(...c2rgb)
                            p.stroke(...c1rgb)
                            p.strokeWeight(2)
                        } else {
                            var colorVal = p.map(self.matrix[i][j], 1, 30, 100, 255)
                            p.fill(colorVal * 0.4, colorVal * 0.6, colorVal)
                            p.stroke(colorVal * 0.3, colorVal * 0.5, colorVal * 0.9)
                            p.strokeWeight(1)
                        }

                        p.translate(0, -height / 2, 0)
                        p.box(self.cellSize * 0.9, height, self.cellSize * 0.9)

                        p.pop()
                    }
                }

                p.pop()

                // Table
                p.push()
                p.translate(0, offsetY + 5, 0)
                p.fill(...c1rgb)
                p.noStroke()
                p.box(self.matrix[0].length * self.cellSize + 50, 5, self.matrix.length * self.cellSize + 50)
                p.pop()

                // Arrow
                p.push()
                p.translate(-(self.matrix[0].length * self.cellSize / 2 + 100), offsetY + 5, 0)
                p.fill(...c1rgb)
                p.noStroke()
                p.box(80, 10, 10)
                p.push()
                p.translate(50, 0, 0)
                p.rotateZ(-Math.PI / 2)
                p.cone(20, 40)
                p.pop()

                p.pop()
            }

            p.mousePressed = function() {
                if (self.isMouseOverUI()) return
                if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
                    self.isDragging = false
                    self.prevMouseX = p.mouseX
                    self.prevMouseY = p.mouseY
                }
            }

            p.mouseDragged = function() {
                if (!self.p5Instance) return
                if (self.isMouseOverUI()) return
                if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
                    self.isDragging = true
                    var deltaX = p.mouseX - self.prevMouseX
                    var deltaY = p.mouseY - self.prevMouseY

                    self.rotationY += deltaX * 0.01
                    self.rotationX += deltaY * 0.01

                    self.rotationX = p.constrain(self.rotationX, -Math.PI / 2, 0)

                    self.prevMouseX = p.mouseX
                    self.prevMouseY = p.mouseY
                    self.p5Instance.redraw()
                }
            }

            p.mouseWheel = function(event) {
                if (!self.p5Instance) return
                if (self.isMouseOverUI()) return
                self.zoom -= event.delta * 0.001
                self.zoom = p.constrain(self.zoom, 0.3, 3)
                self.p5Instance.redraw()
                return false
            }

            p.mouseReleased = function() {
                self.isDragging = false
            }

            p.windowResized = function() {
                p.resizeCanvas(p.windowWidth - 320, p.windowHeight - 100)
            }
        }
    }

    main() {
        this.path = this.dinamicCross(this.matrix, this.startRow)
        this.setupEventListeners()
        this.updatePathSet()
        this.renderPresets()
        const sketch = this.createSketch()
        this.p5Instance = new p5(sketch)
    }

    destroy() {
        if (this.p5Instance) {
            this.p5Instance.remove()
            this.p5Instance = null
        }
        if (this.p13CanvasContainer) {
            this.p13CanvasContainer.innerHTML = ''
        }
    }
}

export default CrossMatrix
