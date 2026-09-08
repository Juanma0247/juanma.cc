import ExtText from '/js/core/ExtText.js'

const MAX_SIZE = 400
const MAX_DELAY = 2000
// Every recorded step keeps a snapshot of the whole array, so an O(n^2) run
// on a wide screen would otherwise pile up hundreds of megabytes. Once the
// cap is hit the timeline is halved and the stride doubled, which keeps the
// animation's shape while bounding memory.
const MAX_FRAMES = 8000

class Sorting {
    constructor() {
        this.content = document.getElementById('p12GCont')
        this.i1 = document.getElementById('p12i1')
        this.i2 = document.getElementById('p12i2')
        this.l1 = document.getElementById('p12l1')
        this.frames = []
        this.frame = null
        this.timer = null
        this.seen = 0
        this.stride = 1
        this.tick = 50
        this.measure()
        this.size = Math.max(12, Math.min(120, Math.round(this.w / 8)))
        this.i1.value = this.size
        this.i2.value = this.tick
        this.readPalette()
    }

    // -- Canvas -------------------------------------------

    measure() {
        const box = this.content.getBoundingClientRect()
        this.w = box.width || window.innerWidth
        this.h = box.height || window.innerHeight
    }

    svg(element) {
        return document.createElementNS('http://www.w3.org/2000/svg', element)
    }

    cleanGraph() {
        this.content.replaceChildren()
    }

    // -- Palette ------------------------------------------
    // Read from the live custom properties instead of being captured once at
    // import time: the accessibility page lets the user override
    // --color-primary/text/bg, and the dark theme swaps text and bg.

    readPalette() {
        const s = getComputedStyle(document.documentElement)
        const pick = (name, fallback) => s.getPropertyValue(name).trim() || fallback
        this.palette = {
            idle: pick('--color-primary', '#008888'),
            active: pick('--color-text', '#000000'),
            edge: pick('--color-bg', '#ffffff')
        }
    }

    watchPalette() {
        const refresh = () => { this.readPalette(); this.paint() }
        new MutationObserver(refresh).observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style', 'data-theme']
        })
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', refresh)
    }

    // -- Drawing ------------------------------------------

    round(value) {
        return Math.round(value * 100) / 100
    }

    bar(x, w, height, active) {
        const y = this.h - height
        const r = Math.min(2.5, w / 3, height / 2)
        const n = v => this.round(v)
        const p = this.svg('path')
        p.setAttribute('d',
            'M' + n(x) + ' ' + n(this.h) +
            'V' + n(y + r) +
            'Q' + n(x) + ' ' + n(y) + ' ' + n(x + r) + ' ' + n(y) +
            'H' + n(x + w - r) +
            'Q' + n(x + w) + ' ' + n(y) + ' ' + n(x + w) + ' ' + n(y + r) +
            'V' + n(this.h) + 'Z')
        p.setAttribute('fill', active ? this.palette.active : this.palette.idle)
        // Below ~3px a background-coloured outline would swallow the bar
        // itself, so thin bars are left as flat slivers of their own colour.
        if (w >= 3) {
            p.setAttribute('stroke', this.palette.edge)
            p.setAttribute('stroke-width', 1)
        }
        return p
    }

    // Wedge notched out of the bar's base, marking the pivot / just-placed
    // element the algorithm is currently pointing at.
    mark(x, w, height) {
        const peak = Math.min(height, Math.max(height / 2, 4))
        const n = v => this.round(v)
        const p = this.svg('path')
        p.setAttribute('d',
            'M' + n(x) + ' ' + n(this.h) +
            'L' + n(x + w / 2) + ' ' + n(this.h - peak) +
            'L' + n(x + w) + ' ' + n(this.h) + 'Z')
        p.setAttribute('fill', this.palette.edge)
        p.setAttribute('stroke', this.palette.edge)
        p.setAttribute('stroke-width', 1)
        return p
    }

    draw(frame) {
        const data = frame.data
        const n = data.length
        if (!n) { this.cleanGraph(); return }
        const slot = this.w / n
        const unit = (this.h - 2) / n
        const gap = slot >= 4 ? 1 : 0
        const width = Math.max(slot - gap, 0.6)
        const emphasis = new Set(frame.emphasis)
        const flags = new Set(frame.flags)
        const batch = document.createDocumentFragment()
        for (let i = 0; i < n; i++) {
            const x = i * slot + gap / 2
            const height = Math.max(data[i] * unit, 1)
            batch.appendChild(this.bar(x, width, height, emphasis.has(i)))
            if (flags.has(i)) batch.appendChild(this.mark(x, width, height))
        }
        this.content.replaceChildren(batch)
    }

    paint() {
        if (this.frame) this.draw(this.frame)
    }

    // -- Timeline -----------------------------------------
    // The sorts run synchronously and record steps; playback is a single
    // chained timeout. The previous version queued one setTimeout per step
    // and cancelled them by clearing every timer id on the page, which also
    // killed timers the site itself owned.

    graph(data, emphasis = [], flags = [], force = false) {
        this.seen += 1
        if (!force && this.seen % this.stride !== 0) return
        this.frames.push({
            data: Array.from(data),
            emphasis: Array.from(emphasis),
            flags: Array.from(flags)
        })
        if (this.frames.length >= MAX_FRAMES) {
            this.frames = this.frames.filter((_, i) => i % 2 === 0)
            this.stride *= 2
        }
    }

    stop() {
        if (this.timer !== null) {
            clearTimeout(this.timer)
            this.timer = null
        }
    }

    play(onDone) {
        this.stop()
        let i = 0
        const step = () => {
            if (i >= this.frames.length) {
                this.timer = null
                if (onDone) onDone()
                return
            }
            this.frame = this.frames[i++]
            this.draw(this.frame)
            this.timer = setTimeout(step, Math.max(1, this.tick))
        }
        step()
    }

    reload() {
        this.stop()
        this.measure()
        this.data = this.randomList(this.size)
        this.mergeGraphData = this.data
        this.frames = []
        this.seen = 0
        this.stride = 1
        this.cleanGraph()
    }

    preview() {
        this.reload()
        this.frame = { data: this.data, emphasis: [], flags: [] }
        this.paint()
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
        this.mergeGraphData = [...changes]
        this.graph(this.mergeGraphData, swapIndices, swapIndices)
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

    insertionGraph(arr, indices = [], flags = []) {
        this.mergeGraphData = [...arr]
        this.graph(this.mergeGraphData, indices, flags)
    }

    insertion(arr) {
        for (let i = 1; i < arr.length; i++) {
            let key = arr[i]
            let j = i - 1
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j]
                j--
                this.insertionGraph([...arr], [j + 1, i], [i])
            }
            arr[j + 1] = key
            this.insertionGraph([...arr], [j + 1, i], [j + 1])
        }
        return arr
    }

    selectionGraph(arr, indices = [], flags = []) {
        this.mergeGraphData = [...arr]
        this.graph(this.mergeGraphData, indices, flags)
    }

    selection(arr) {
        let n = arr.length
        for (let i = 0; i < n - 1; i++) {
            let min = i
            for (let j = i + 1; j < n; j++) {
                if (arr[j] < arr[min]) min = j
                this.selectionGraph([...arr], [i, j], [min])
            }
            if (min !== i) {
                [arr[i], arr[min]] = [arr[min], arr[i]]
                this.selectionGraph([...arr], [i, min], [i])
            }
        }
        return arr
    }

    bubbleGraph(data, emphasis = [], flags = []) {
        this.mergeGraphData = [...data]
        this.graph(this.mergeGraphData, emphasis, flags)
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

        return arr
    }

    shellGraph(data, emphasis = [], flags = []) {
        this.mergeGraphData = [...data]
        this.graph(this.mergeGraphData, emphasis, flags)
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
        return arr
    }

    quick3Graph(data, emphasis = [], flags = []) {
        this.mergeGraphData = [...data]
        this.graph(this.mergeGraphData, emphasis, flags)
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
        return arr
    }

    timGraph(fullData, emphasis = [], flags = []) {
        this.mergeGraphData = [...fullData]
        this.graph(this.mergeGraphData, emphasis, flags)
    }

    timSort(data) {
        const RUN = 32
        const insertionSort = (arr, left, right) => {
            for (let i = left + 1; i <= right; i++) {
                let temp = arr[i]
                let j = i - 1
                while (j >= left && arr[j] > temp) {
                    arr[j + 1] = arr[j]
                    j--
                    this.timGraph([...arr], [i, j], [left])
                }
                arr[j + 1] = temp
                this.timGraph([...arr], [i], [left])
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
                this.timGraph([...arr], [k], [m])
                k++
            }
            while (i < len1) {
                arr[k] = left[i]
                i++
                this.timGraph([...arr], [k], [m])
                k++
            }
            while (j < len2) {
                arr[k] = right[j]
                j++
                this.timGraph([...arr], [k], [m])
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
        return data
    }

    // -- Wiring -------------------------------------------

    setRunning(button) {
        document.querySelectorAll('.p12Algos button').forEach(b => {
            b.classList.toggle('is-solid', b === button)
        })
    }

    addSortListener(id, methodName) {
        const button = document.getElementById(id)
        if (!button || typeof this[methodName] !== 'function') return

        button.addEventListener('click', () => {
            this.reload()
            this.graph(this.data, [], [], true)
            const sorted = this[methodName]([...this.data])
            this.graph(sorted, [], [], true)
            this.setRunning(button)
            this.play(() => this.setRunning(null))
        })
    }

    setupPanel() {
        const panel = document.getElementById('p12Panel')
        const toggle = document.getElementById('p12Toggle')
        if (!panel || !toggle) return
        const t = (k, f) => window.i18nGet ? window.i18nGet('pd.sorting.' + k, f) : f
        const sync = () => {
            const collapsed = panel.classList.contains('is-collapsed')
            toggle.setAttribute('aria-expanded', String(!collapsed))
            toggle.setAttribute('aria-label', collapsed
                ? t('showPanel', 'Show controls')
                : t('hidePanel', 'Hide controls'))
        }
        toggle.addEventListener('click', () => {
            panel.classList.toggle('is-collapsed')
            sync()
        })
        window.addEventListener('langchanged', sync)
        sync()
    }

    main() {
        this.preview()
        this.watchPalette()
        this.setupPanel()

        ExtText.restrictNI(this.i1, 1, MAX_SIZE, "N")
        ExtText.restrictNI(this.i2, 1, MAX_DELAY, "N")

        this.i1.addEventListener("input", () => {
            const value = parseInt(this.i1.value)
            if (!Number.isFinite(value) || value < 1) return
            this.size = value
            clearTimeout(this.previewTimer)
            this.previewTimer = setTimeout(() => this.preview(), 250)
        })
        this.i2.addEventListener("input", () => {
            const value = parseInt(this.i2.value)
            if (Number.isFinite(value) && value >= 1) this.tick = value
        })

        // The canvas tracks the viewport, so a rotation or resize has to
        // remeasure before the current frame is redrawn at the new scale.
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimer)
            this.resizeTimer = setTimeout(() => {
                this.measure()
                this.paint()
            }, 120)
        })

        this.addSortListener('p12bMerge', 'merge')
        this.addSortListener('p12bHeap', 'heap')
        this.addSortListener('p12bQuick', 'quick')
        this.addSortListener('p12bInsertion', 'insertion')
        this.addSortListener('p12bSelection', 'selection')
        this.addSortListener('p12bBubble', 'bubble')
        this.addSortListener('p12bShell', 'shell')
        this.addSortListener('p12bQuick3', 'quick3')
        this.addSortListener('p12bTim', 'timSort')
    }
}

export default Sorting
