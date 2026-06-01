import ExtText from '../core/ExtText.js'

const rootStyles = getComputedStyle(document.documentElement)
const c1 = rootStyles.getPropertyValue('--c1').trim()
const c2 = rootStyles.getPropertyValue('--c2').trim()
const c3 = rootStyles.getPropertyValue('--c3').trim()

class Sorting {
    constructor() {
        this.content = document.getElementById('p12GCont')
        this.i1 = document.getElementById('p12i1')
        this.i2 = document.getElementById('p12i2')
        this.l1 = document.getElementById('p12l1')
        this.h = parseFloat(getComputedStyle(this.content).height)
        this.w = parseFloat(getComputedStyle(this.content).width)
        this.tick = 50
        this.size = parseInt(this.w / 10)
        this.i1.value = this.size
        this.i2.value = this.tick
    }

    add(element) {
        this.content.appendChild(element)
    }

    group(elements) {
        const g = this.svg('g')
        elements.forEach(e => g.appendChild(e))
        return g
    }

    svg(element) {
        return document.createElementNS('http://www.w3.org/2000/svg', element)
    }

    cleanGraph() {
        this.content.innerHTML = ""
    }

    stopAll() {
        let lastTO = setTimeout(() => {}, 0)
        for (let i = 0; i <= lastTO; i++) {
            clearTimeout(i)
        }
    }

    reload() {
        this.data = this.randomList(this.size)
        this.mergeGraphData = this.data
        this.sTO = 1
        this.ew = this.w / this.size
        this.eh = this.h / this.size
        this.cleanGraph()
        this.stopAll()
    }

    complement(array, subarrat) {
        return array.filter(x => !subarrat.includes(x))
    }

    straightTrapezoid(x, y, emphasis, flag) {
        let isPixel = this.w / this.size < 2
        const l = this.svg('path')
        l.setAttribute('d', `
            M ${x * this.ew} ${this.h}
            l 0 ${-y * this.eh}
            l ${this.ew} 0
            l 0 ${y * this.eh} Z`)
        l.setAttribute('fill', emphasis ? c2 : c1)
        l.setAttribute("stroke", !isPixel ? c3 : emphasis ? c1 : c2)
        l.setAttribute("stroke-width", 1)
        this.add(l)
        if (flag) {
            const p = this.svg('path')
            p.setAttribute('d', `
                M ${x * this.ew} ${this.h}
                l ${this.ew / 2} ${-(y * this.eh / 2)}
                l ${this.ew / 2} ${y * this.eh / 2}Z`)
            p.setAttribute('fill', c3)
            p.setAttribute("stroke", c3)
            p.setAttribute("stroke-width", 1)
            this.add(p)
        }
    }

    graph(data, emphasis = [], flags = []) {
        setTimeout(() => {
            this.cleanGraph()
            for (let i_ in data) {
                const i = parseInt(i_)
                this.straightTrapezoid(i, data[i], emphasis.includes(i), flags.includes(i))
            }
        }, this.sTO * this.tick)
        this.sTO += 1
    }

    randomList(n) {
        let arr = Array.from({length: n}, (_, i) => i + 1)
        for (let i = arr.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1))
            ;[arr[i], arr[j]] = [arr[j], arr[i]]
        }
        return arr
    }

    dataToIndex(array) {
        return array.map(element => {
            return this.data.indexOf(element)
        })
    }

    mergeGraph(changes) {
        const sortChanges = [...changes].sort((i, j) => i - j)
        const indexChanges = this.dataToIndex(changes).sort((i, j) => i - j)
        const flags = []
        this.mergeGraphData = this.mergeGraphData.map(element => {
            if (indexChanges.length > 0) {
                if (this.mergeGraphData.indexOf(element) == indexChanges[0]) {
                    flags.push(indexChanges.shift())
                    return sortChanges.shift()
                }
            }
            return element
        })
        this.graph(this.mergeGraphData, this.dataToIndex(changes), [flags[0]])
    }

    merge(arr) {
        if (arr.length <= 1) { return arr }
        const m = Math.floor(arr.length / 2)
        const m1 = this.merge(arr.slice(0, m))
        const m2 = this.merge(arr.slice(m))
        let res = []
        let i = 0, j = 0
        while (i < m1.length && j < m2.length) {
            if (m1[i] <= m2[j]) {
                res.push(m1[i])
                i++
            } else {
                res.push(m2[j])
                j++
            }
        }
        while (i < m1.length) {
            res.push(m1[i])
            i++
        }
        while (j < m2.length) {
            res.push(m2[j])
            j++
        }
        this.mergeGraph([...res])
        return res
    }

    heapGraph(changes, swapIndices = []) {
        const sortChanges = [...changes]
        const indexChanges = swapIndices.length > 0 ? swapIndices : []
        const flags = [...swapIndices]
        this.mergeGraphData = sortChanges
        this.graph(this.mergeGraphData, indexChanges, flags)
    }

    heapify(arr, n, i) {
        let largest = i
        const left = 2 * i + 1
        const right = 2 * i + 2

        if (left < n && arr[left] > arr[largest]) largest = left
        if (right < n && arr[right] > arr[largest]) largest = right

        if (largest !== i) {
            [arr[i], arr[largest]] = [arr[largest], arr[i]]
            this.heapGraph([...arr], [i, largest])
            this.heapify(arr, n, largest)
        }
    }

    heap(arr) {
        let n = arr.length
        this.mergeGraphData = [...arr]
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            this.heapify(arr, n, i)
        }
        for (let i = n - 1; i > 0; i--) {
            [arr[0], arr[i]] = [arr[i], arr[0]]
            this.heapGraph([...arr], [0, i])
            this.heapify(arr, i, 0)
        }
        return arr
    }

    quickGraph(array, emphasis = [], pivot = null) {
        this.mergeGraphData = [...array]
        const flags = pivot !== null ? [pivot] : []
        this.graph(this.mergeGraphData, emphasis, flags)
    }

    quick(arr, low = 0, high = arr.length - 1) {
        this.mergeGraphData = [...arr]
        if (low < high) {
            const pi = this.partition(arr, low, high)
            this.quick(arr, low, pi - 1)
            this.quick(arr, pi + 1, high)
        }
        return arr
    }

    partition(arr, low, high) {
        const pivot = arr[high]
        let i = low - 1

        this.quickGraph([...arr], [], high)

        for (let j = low; j < high; j++) {
            this.quickGraph([...arr], [j, high], high)
            if (arr[j] < pivot) {
                i++
                ;[arr[i], arr[j]] = [arr[j], arr[i]]
                this.quickGraph([...arr], [i, j], high)
            }
        }

        ;[arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
        this.quickGraph([...arr], [i + 1, high], i + 1)
        return i + 1
    }

    insertionGraph(arr, indices = []) {
        this.mergeGraphData = [...arr]
        this.graph(this.mergeGraphData, indices, [])
    }

    insertion(arr) {
        for (let i = 1; i < arr.length; i++) {
            let key = arr[i]
            let j = i - 1
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j]
                j--
                this.insertionGraph([...arr], [j + 1, i])
            }
            arr[j + 1] = key
            this.insertionGraph([...arr], [j + 1, i])
        }
        return arr
    }

    selectionGraph(arr, indices = []) {
        this.mergeGraphData = [...arr]
        this.graph(this.mergeGraphData, indices, [])
    }

    selection(arr) {
        let n = arr.length
        for (let i = 0; i < n - 1; i++) {
            let min = i
            for (let j = i + 1; j < n; j++) {
                if (arr[j] < arr[min]) min = j
                this.selectionGraph([...arr], [i, j, min])
            }
            if (min !== i) {
                [arr[i], arr[min]] = [arr[min], arr[i]]
                this.selectionGraph([...arr], [i, min])
            }
        }
        return arr
    }

    bubbleGraph(data, emphasis = [], flags = []) {
        setTimeout(() => {
            this.cleanGraph()
            for (let i_ in data) {
                const i = parseInt(i_)
                this.straightTrapezoid(i, data[i], emphasis.includes(i), flags.includes(i))
            }
        }, this.sTO * this.tick)
        this.sTO += 1
    }

    bubble(data) {
        this.mergeGraphData = [...data]
        const arr = [...data]
        const n = arr.length
        let swapped

        for (let i = 0; i < n - 1; i++) {
            swapped = false
            for (let j = 0; j < n - i - 1; j++) {
                this.bubbleGraph([...arr], [j, j + 1])
                if (arr[j] > arr[j + 1]) {
                    ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
                    this.bubbleGraph([...arr], [j, j + 1], [j + 1])
                    swapped = true
                }
            }
            if (!swapped) break
        }

        this.graph(arr)
        return arr
    }

    shellGraph(data, emphasis = [], flags = []) {
        setTimeout(() => {
            this.cleanGraph()
            for (let i_ in data) {
                const i = parseInt(i_)
                this.straightTrapezoid(i, data[i], emphasis.includes(i), flags.includes(i))
            }
        }, this.sTO * this.tick)
        this.sTO += 1
    }

    shell(data) {
        this.mergeGraphData = [...data]
        const arr = [...data]
        const n = arr.length
        for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
            for (let i = gap; i < n; i++) {
                const temp = arr[i]
                let j = i
                this.shellGraph([...arr], [i], [i - gap])
                while (j >= gap && arr[j - gap] > temp) {
                    arr[j] = arr[j - gap]
                    j -= gap
                    this.shellGraph([...arr], [j, j + gap], [j])
                }
                arr[j] = temp
                this.shellGraph([...arr], [j], [i])
            }
        }
        this.graph(arr)
        return arr
    }

    quick3Graph(data, emphasis = [], flags = []) {
        setTimeout(() => {
            this.cleanGraph()
            for (let i_ in data) {
                const i = parseInt(i_)
                this.straightTrapezoid(i, data[i], emphasis.includes(i), flags.includes(i))
            }
        }, this.sTO * this.tick)
        this.sTO += 1
    }

    quick3(data) {
        this.mergeGraphData = [...data]
        const arr = [...data]
        const sort = (lo, hi) => {
            if (hi <= lo) return
            let lt = lo
            let gt = hi
            const pivot = arr[lo]
            let i = lo + 1
            this.quick3Graph([...arr], [lt, gt], [lo])
            while (i <= gt) {
                this.quick3Graph([...arr], [i], [lt, gt, lo])
                if (arr[i] < pivot) {
                    ;[arr[lt], arr[i]] = [arr[i], arr[lt]]
                    this.quick3Graph([...arr], [lt, i], [lo])
                    lt++
                    i++
                } else if (arr[i] > pivot) {
                    ;[arr[i], arr[gt]] = [arr[gt], arr[i]]
                    this.quick3Graph([...arr], [i, gt], [lo])
                    gt--
                } else {
                    i++
                }
            }
            sort(lo, lt - 1)
            sort(gt + 1, hi)
        }
        sort(0, arr.length - 1)
        this.graph(arr)
        return arr
    }

    timGraph(fullData, emphasis = [], flags = []) {
        setTimeout(() => {
            this.cleanGraph()
            for (let i_ in fullData) {
                const i = parseInt(i_)
                this.straightTrapezoid(i, fullData[i], emphasis.includes(i), flags.includes(i))
            }
        }, this.sTO * this.tick)
        this.sTO += 1
    }

    timSort(data) {
        const RUN = 32
        this.timGraphData = [...data]
        this.sTO = 1
        const insertionSort = (arr, left, right) => {
            for (let i = left + 1; i <= right; i++) {
                let temp = arr[i]
                let j = i - 1
                while (j >= left && arr[j] > temp) {
                    arr[j + 1] = arr[j]
                    j--
                    this.timGraph([...arr], [i, j])
                }
                arr[j + 1] = temp
                this.timGraph([...arr], [i])
            }
        }

        const merge = (arr, l, m, r) => {
            const len1 = m - l + 1
            const len2 = r - m
            const left = new Array(len1)
            const right = new Array(len2)
            for (let x = 0; x < len1; x++) left[x] = arr[l + x]
            for (let x = 0; x < len2; x++) right[x] = arr[m + 1 + x]
            let i = 0
            let j = 0
            let k = l
            while (i < len1 && j < len2) {
                if (left[i] <= right[j]) {
                    arr[k] = left[i]
                    i++
                } else {
                    arr[k] = right[j]
                    j++
                }
                this.timGraph([...arr], [k])
                k++
            }
            while (i < len1) {
                arr[k] = left[i]
                i++
                this.timGraph([...arr], [k])
                k++
            }
            while (j < len2) {
                arr[k] = right[j]
                j++
                this.timGraph([...arr], [k])
                k++
            }
        }
        for (let i = 0; i < data.length; i += RUN)
            insertionSort(data, i, Math.min(i + RUN - 1, data.length - 1))
        for (let size = RUN; size < data.length; size = 2 * size) {
            for (let left = 0; left < data.length; left += 2 * size) {
                const mid = Math.min(left + size - 1, data.length - 1)
                const right = Math.min(left + 2 * size - 1, data.length - 1)
                if (mid < right) merge(data, left, mid, right)
            }
        }
        this.graph(data)
        return data
    }

    addSortListener(id, methodName, isAsync = false) {
        const button = document.getElementById(id)
        if (!button || typeof this[methodName] !== 'function') return

        button.addEventListener('click', async () => {
            this.reload()
            this.graph(this.data)
            const sorted = isAsync
                ? await this[methodName]([...this.data])
                : this[methodName]([...this.data])
            this.graph(sorted)
        })
    }

    main() {
        this.reload()
        ExtText.restrictNI(this.i1, 1, this.w, "N")
        ExtText.restrictNI(this.i2, 1, 2000, "N")
        this.i1.addEventListener("input", () => {
            this.size = parseInt(this.i1.value)
        })
        this.i2.addEventListener("input", () => {
            this.tick = parseInt(this.i2.value)
        })
        this.addSortListener('p12bMerge', 'merge')
        this.addSortListener('p12bHeap', 'heap')
        this.addSortListener('p12bQuick', 'quick', true)
        this.addSortListener('p12bInsertion', 'insertion')
        this.addSortListener('p12bSelection', 'selection')
        this.addSortListener('p12bBubble', 'bubble')
        this.addSortListener('p12bShell', 'shell')
        this.addSortListener('p12bQuick3', 'quick3')
        this.addSortListener('p12bTim', 'timSort')
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth"
        })
    }
}

export default Sorting
