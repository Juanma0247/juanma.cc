import { EditorState, StateField, StateEffect, EditorSelection } from '@codemirror/state'
import { EditorView, Decoration, WidgetType, keymap, drawSelection, dropCursor, placeholder } from '@codemirror/view'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { syntaxTree, syntaxHighlighting, HighlightStyle, indentUnit } from '@codemirror/language'
import { autocompletion } from '@codemirror/autocomplete'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { tags } from '@lezer/highlight'
import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next'
import { tex, imageHtml } from './render.js'

const refresh = StateEffect.define()

const highlight = HighlightStyle.define([
  { tag: tags.heading, fontWeight: '700' },
  { tag: tags.strong, fontWeight: '700' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: [tags.link, tags.url], color: 'var(--nt-link)' },
  { tag: [tags.processingInstruction, tags.meta, tags.contentSeparator], color: 'var(--nt-muted)' },
  { tag: tags.monospace, fontFamily: 'var(--nt-mono)' },
  { tag: tags.quote, color: 'var(--nt-soft)' },
  { tag: [tags.keyword, tags.operatorKeyword, tags.modifier], color: 'var(--nt-k1)' },
  { tag: [tags.string, tags.special(tags.string), tags.regexp], color: 'var(--nt-k2)' },
  { tag: [tags.number, tags.bool, tags.atom, tags.null], color: 'var(--nt-k3)' },
  { tag: [tags.comment, tags.lineComment, tags.blockComment], color: 'var(--nt-muted)', fontStyle: 'italic' },
  { tag: [tags.function(tags.variableName), tags.definition(tags.variableName), tags.className, tags.typeName], color: 'var(--nt-k4)' },
  { tag: [tags.propertyName, tags.attributeName, tags.tagName], color: 'var(--nt-k5)' },
])

class MathWidget extends WidgetType {
  constructor(src, display, block) { super(); this.src = src; this.display = display; this.block = block }
  eq(o) { return o.src === this.src && o.display === this.display && o.block === this.block }
  toDOM() {
    const el = document.createElement(this.block ? 'div' : 'span')
    el.className = this.block ? 'nt-math-block cm-math-widget' : 'cm-math-widget'
    el.innerHTML = tex(this.src, this.display)
    return el
  }
  ignoreEvent() { return false }
}

class MathPreviewWidget extends MathWidget {
  toDOM() {
    const el = super.toDOM()
    el.classList.add('cm-math-preview')
    return el
  }
  ignoreEvent() { return true }
}

class ImageWidget extends WidgetType {
  constructor(url, alt, block) { super(); this.url = url; this.alt = alt; this.block = block }
  eq(o) { return o.url === this.url && o.alt === this.alt && o.block === this.block }
  toDOM() {
    const el = document.createElement(this.block ? 'div' : 'span')
    el.className = 'cm-img-widget'
    const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
    el.innerHTML = imageHtml(esc(this.url), esc(this.alt))
    el.addEventListener('click', e => {
      const img = e.target.closest('img')
      if (img) el.dispatchEvent(new CustomEvent('nt-image', { bubbles: true, detail: { src: img.currentSrc || img.src } }))
    })
    return el
  }
  // A tap on the picture opens the viewer; a tap beside it still moves the cursor.
  ignoreEvent(e) { return e.target?.tagName === 'IMG' }
}

class CheckboxWidget extends WidgetType {
  constructor(checked, pos) { super(); this.checked = checked; this.pos = pos }
  eq(o) { return o.checked === this.checked && o.pos === this.pos }
  toDOM(view) {
    const box = document.createElement('input')
    box.type = 'checkbox'
    box.className = 'nt-task'
    box.checked = this.checked
    box.addEventListener('mousedown', e => {
      e.preventDefault()
      view.dispatch({ changes: { from: this.pos + 1, to: this.pos + 2, insert: this.checked ? ' ' : 'x' } })
    })
    return box
  }
  ignoreEvent() { return true }
}

class BulletWidget extends WidgetType {
  eq() { return true }
  toDOM() {
    const el = document.createElement('span')
    el.className = 'cm-bullet'
    el.textContent = '•'
    return el
  }
}

class RuleWidget extends WidgetType {
  eq() { return true }
  toDOM() {
    const el = document.createElement('div')
    el.className = 'cm-hr'
    return el
  }
}

const hide = Decoration.replace({})
const mark = cls => Decoration.mark({ class: cls })
const lineCls = cls => Decoration.line({ class: cls })

const INLINE_MATH = /(?<![\\$])\$(?=[^\s$])((?:[^$\n\\]|\\.)+?)(?<=[^\s\\])\$(?![$\d])/g
const BLOCK_MATH = /\$\$([\s\S]+?)\$\$/g
const WIKI = /\[\[([^[\]\n]+)\]\]/g

function buildDecorations(state, ctx) {
  const doc = state.doc
  const sel = state.selection.ranges
  const touches = (from, to) => sel.some(r => r.from <= to && r.to >= from)
  const lineActive = pos => {
    const line = doc.lineAt(pos)
    return touches(line.from, line.to)
  }
  const out = []
  const add = (from, to, deco) => { if (from < to) out.push(deco.range(from, to)) }
  const addLine = (pos, cls) => out.push(lineCls(cls).range(pos))
  const tree = syntaxTree(state)

  const code = []
  tree.iterate({
    enter(n) {
      if (n.name === 'FencedCode' || n.name === 'CodeBlock' || n.name === 'InlineCode' || n.name === 'HTMLBlock') {
        code.push([n.from, n.to])
        return false
      }
    },
  })
  const inCode = (from, to) => code.some(([a, b]) => from < b && to > a)

  const math = []
  const text = doc.toString()
  if (text.includes('$')) {
    let masked = text
    for (const m of text.matchAll(BLOCK_MATH)) {
      const from = m.index
      const to = from + m[0].length
      if (inCode(from, to)) continue
      masked = masked.slice(0, from) + ' '.repeat(to - from) + masked.slice(to)
      math.push([from, to])
      const startLine = doc.lineAt(from)
      const endLine = doc.lineAt(to)
      const fullLines = text.slice(startLine.from, from).trim() === '' && text.slice(to, endLine.to).trim() === ''
      if (touches(from, to)) {
        add(from, to, mark('cm-math-src'))
        if (fullLines) out.push(Decoration.widget({ widget: new MathPreviewWidget(m[1], true, true), block: true, side: 1 }).range(endLine.to))
      } else if (fullLines) {
        out.push(Decoration.replace({ widget: new MathWidget(m[1], true, true), block: true }).range(startLine.from, endLine.to))
      } else if (startLine.number === endLine.number) {
        add(from, to, Decoration.replace({ widget: new MathWidget(m[1], true, false) }))
      }
    }
    for (const m of masked.matchAll(INLINE_MATH)) {
      const from = m.index
      const to = from + m[0].length
      if (inCode(from, to)) continue
      math.push([from, to])
      if (touches(from, to)) add(from, to, mark('cm-math-src'))
      else add(from, to, Decoration.replace({ widget: new MathWidget(m[1], false, false) }))
    }
  }
  const inMath = (from, to) => math.some(([a, b]) => from < b && to > a)

  if (text.includes('[[')) {
    for (const m of text.matchAll(WIKI)) {
      const from = m.index
      const to = from + m[0].length
      if (inCode(from, to) || inMath(from, to)) continue
      const name = m[1].trim()
      const exists = !!ctx.resolveNote(name)
      const cls = exists ? 'cm-wikilink' : 'cm-wikilink cm-wikilink--missing'
      if (touches(from, to)) {
        add(from, to, Decoration.mark({ class: cls + ' cm-wikilink--src', attributes: { 'data-note': name } }))
      } else {
        add(from, from + 2, hide)
        add(from + 2, to - 2, Decoration.mark({ class: cls, attributes: { 'data-note': name } }))
        add(to - 2, to, hide)
      }
      math.push([from, to])
    }
  }

  tree.iterate({
    enter(n) {
      if (inMath(n.from, n.to) && !/Heading|Paragraph|Document|List|ListItem|Blockquote|Table/.test(n.name)) return false
      const name = n.name
      if (/^ATXHeading(\d)$/.test(name)) {
        addLine(doc.lineAt(n.from).from, 'cm-h cm-h' + name.slice(-1))
        return
      }
      if (/^SetextHeading(\d)$/.test(name)) {
        addLine(doc.lineAt(n.from).from, 'cm-h cm-h' + name.slice(-1))
        return
      }
      switch (name) {
        case 'HeaderMark': {
          const parent = n.node.parent
          if (parent && /^ATX/.test(parent.name) && !lineActive(n.from)) {
            const line = doc.lineAt(n.from)
            add(n.from, Math.min(n.to + 1, line.to), hide)
          }
          return
        }
        case 'EmphasisMark':
        case 'StrikethroughMark': {
          const p = n.node.parent
          if (p && !touches(p.from, p.to)) add(n.from, n.to, hide)
          return
        }
        case 'CodeMark': {
          const p = n.node.parent
          if (p && p.name === 'InlineCode' && !touches(p.from, p.to)) add(n.from, n.to, hide)
          return
        }
        case 'InlineCode':
          add(n.from, n.to, mark('cm-icode'))
          return
        case 'Link': {
          const node = n.node
          const marks = node.getChildren('LinkMark')
          const url = node.getChild('URL')
          if (marks.length < 2 || !url) return
          const href = state.sliceDoc(url.from, url.to)
          const labelFrom = marks[0].to
          const labelTo = marks[1].from
          add(labelFrom, labelTo, Decoration.mark({ class: 'cm-link', attributes: { 'data-href': href } }))
          if (!touches(n.from, n.to)) {
            add(n.from, labelFrom, hide)
            add(labelTo, n.to, hide)
          }
          return false
        }
        case 'URL': {
          const p = n.node.parent
          if (p && (p.name === 'Link' || p.name === 'Image')) return
          add(n.from, n.to, Decoration.mark({ class: 'cm-link', attributes: { 'data-href': state.sliceDoc(n.from, n.to) } }))
          return
        }
        case 'Image': {
          const node = n.node
          const url = node.getChild('URL')
          if (!url) return false
          const src = state.sliceDoc(url.from, url.to)
          const marks = node.getChildren('LinkMark')
          const alt = marks.length >= 2 ? state.sliceDoc(marks[0].to, marks[1].from) : ''
          const line = doc.lineAt(n.from)
          const alone = state.sliceDoc(line.from, n.from).trim() === '' && state.sliceDoc(n.to, line.to).trim() === ''
          if (touches(n.from, n.to)) {
            add(n.from, n.to, mark('cm-img-src'))
            out.push(Decoration.widget({ widget: new ImageWidget(src, alt, true), block: true, side: 1 }).range(line.to))
          } else if (alone) {
            out.push(Decoration.replace({ widget: new ImageWidget(src, alt, true), block: true }).range(line.from, line.to))
          } else {
            add(n.from, n.to, Decoration.replace({ widget: new ImageWidget(src, alt, false) }))
          }
          return false
        }
        case 'Blockquote': {
          for (let l = doc.lineAt(n.from).number; l <= doc.lineAt(n.to).number; l++) {
            const line = doc.line(l)
            addLine(line.from, 'cm-quote')
          }
          return
        }
        case 'QuoteMark': {
          if (!lineActive(n.from)) {
            const line = doc.lineAt(n.from)
            add(n.from, Math.min(n.to + (state.sliceDoc(n.to, n.to + 1) === ' ' ? 1 : 0), line.to), hide)
          }
          return
        }
        case 'FencedCode':
        case 'CodeBlock': {
          const first = doc.lineAt(n.from).number
          const last = doc.lineAt(n.to).number
          for (let l = first; l <= last; l++) {
            const line = doc.line(l)
            let cls = 'cm-cb'
            if (l === first) cls += ' cm-cb-first'
            if (l === last) cls += ' cm-cb-last'
            addLine(line.from, cls)
          }
          return false
        }
        case 'HorizontalRule': {
          if (!lineActive(n.from)) add(n.from, n.to, Decoration.replace({ widget: new RuleWidget() }))
          return
        }
        case 'ListMark': {
          const item = n.node.parent
          const list = item?.parent
          const task = item?.getChild('Task')
          if (lineActive(n.from)) return
          if (task) {
            const end = Math.min(n.to + 1, doc.lineAt(n.from).to)
            add(n.from, end, hide)
          } else if (list?.name === 'BulletList') {
            add(n.from, n.to, Decoration.replace({ widget: new BulletWidget() }))
          }
          return
        }
        case 'TaskMarker': {
          const checked = /x/i.test(state.sliceDoc(n.from, n.to))
          if (!touches(n.from, n.to)) add(n.from, n.to, Decoration.replace({ widget: new CheckboxWidget(checked, n.from) }))
          if (checked) {
            const line = doc.lineAt(n.from)
            add(n.to, line.to, mark('cm-task-done'))
          }
          return
        }
        case 'Table': {
          for (let l = doc.lineAt(n.from).number; l <= doc.lineAt(n.to).number; l++) {
            const line = doc.line(l)
            addLine(line.from, 'cm-table')
          }
          return
        }
      }
    },
  })
  return Decoration.set(out, true)
}

function livePreview(ctx) {
  return StateField.define({
    create: state => buildDecorations(state, ctx),
    update(deco, tr) {
      if (tr.docChanged || tr.selection || tr.effects.some(e => e.is(refresh)) || syntaxTree(tr.state) !== syntaxTree(tr.startState)) {
        return buildDecorations(tr.state, ctx)
      }
      return deco
    },
    provide: f => EditorView.decorations.from(f),
  })
}

function clickHandlers(ctx) {
  return EditorView.domEventHandlers({
    mousedown(e) {
      const el = e.target.closest?.('.cm-link, .cm-wikilink')
      if (!el || el.classList.contains('cm-wikilink--src')) return false
      if (el.classList.contains('cm-wikilink')) {
        e.preventDefault()
        ctx.openNote(el.getAttribute('data-note'))
        return true
      }
      const href = el.getAttribute('data-href')
      if (!href) return false
      e.preventDefault()
      window.open(/^[a-z][\w+.-]*:/i.test(href) ? href : 'https://' + href, '_blank', 'noopener')
      return true
    },
    paste(e, view) {
      const files = [...(e.clipboardData?.files || [])].filter(f => f.type.startsWith('image/'))
      if (!files.length) return false
      e.preventDefault()
      ctx.insertImages(view, files, view.state.selection.main.from)
      return true
    },
    drop(e, view) {
      const files = [...(e.dataTransfer?.files || [])].filter(f => f.type.startsWith('image/'))
      if (!files.length) return false
      e.preventDefault()
      const pos = view.posAtCoords({ x: e.clientX, y: e.clientY }) ?? view.state.selection.main.from
      ctx.insertImages(view, files, pos)
      return true
    },
  })
}

function wikiCompletion(ctx) {
  return context => {
    const m = context.matchBefore(/\[\[[^\]\n]*/)
    if (!m) return null
    return {
      from: m.from + 2,
      validFor: /^[^\]\n]*$/,
      options: ctx.listNotes().map(n => ({
        label: n.title,
        detail: n.group || '',
        apply(view, c, from, to) {
          const close = view.state.sliceDoc(to, to + 2) === ']]' ? '' : ']]'
          view.dispatch({
            changes: { from, to, insert: c.label + close },
            selection: { anchor: from + c.label.length + 2 },
          })
        },
      })),
    }
  }
}

export const commands = {
  wrap(view, before, after = before, fill = '') {
    const { state } = view
    const tr = state.changeByRange(range => {
      const outerFrom = range.from - before.length
      const outerTo = range.to + after.length
      if (outerFrom >= 0 && state.sliceDoc(outerFrom, range.from) === before && state.sliceDoc(range.to, outerTo) === after) {
        return {
          changes: [{ from: outerFrom, to: range.from }, { from: range.to, to: outerTo }],
          range: EditorSelection.range(outerFrom, range.to - before.length),
        }
      }
      if (range.empty) {
        return {
          changes: { from: range.from, insert: before + fill + after },
          range: EditorSelection.range(range.from + before.length, range.from + before.length + fill.length),
        }
      }
      return {
        changes: [{ from: range.from, insert: before }, { from: range.to, insert: after }],
        range: EditorSelection.range(range.from + before.length, range.to + before.length),
      }
    })
    view.dispatch(tr, { scrollIntoView: true, userEvent: 'input' })
    view.focus()
  },

  prefix(view, prefix, pattern) {
    const { state } = view
    const lines = new Set()
    for (const r of state.selection.ranges) {
      for (let l = state.doc.lineAt(r.from).number; l <= state.doc.lineAt(r.to).number; l++) lines.add(l)
    }
    const all = [...lines].map(n => state.doc.line(n))
    const has = all.every(line => line.text.startsWith(prefix))
    const changes = all.map(line => {
      if (has) return { from: line.from, to: line.from + prefix.length }
      const m = pattern ? pattern.exec(line.text) : null
      return { from: line.from, to: line.from + (m ? m[0].length : 0), insert: prefix }
    })
    view.dispatch({ changes, scrollIntoView: true, userEvent: 'input' })
    view.focus()
  },

  heading(view) {
    const { state } = view
    const line = state.doc.lineAt(state.selection.main.head)
    const m = /^(#{1,6})\s/.exec(line.text)
    const level = m ? m[1].length : 0
    const next = level >= 3 ? '' : '#'.repeat(level + 1) + ' '
    view.dispatch({ changes: { from: line.from, to: line.from + (m ? m[0].length : 0), insert: next }, userEvent: 'input' })
    view.focus()
  },

  insert(view, text, cursor = text.length) {
    const { from, to } = view.state.selection.main
    const line = view.state.doc.lineAt(from)
    const lead = text.startsWith('\n') && from === line.from ? text.slice(1) : text
    const shift = text.length - lead.length
    view.dispatch({ changes: { from, to, insert: lead }, selection: { anchor: from + cursor - shift }, scrollIntoView: true, userEvent: 'input' })
    view.focus()
  },

  link(view) {
    const { from, to } = view.state.selection.main
    const label = view.state.sliceDoc(from, to) || 'link'
    const insert = `[${label}](url)`
    view.dispatch({ changes: { from, to, insert }, selection: EditorSelection.range(from + label.length + 3, from + label.length + 6), userEvent: 'input' })
    view.focus()
  },
}

const LIST_PREFIX = /^(\s*)([-*+]\s(\[[ xX]\]\s)?|\d+[.)]\s|>\s|#{1,6}\s)/

export function createEditor({ parent, ytext, undoManager, ctx, placeholderText = '' }) {
  const extensions = [
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    syntaxHighlighting(highlight),
    EditorView.lineWrapping,
    drawSelection(),
    dropCursor(),
    highlightSelectionMatches(),
    indentUnit.of('  '),
    EditorState.tabSize.of(2),
    placeholder(placeholderText),
    autocompletion({ override: [wikiCompletion(ctx)], icons: false }),
    yCollab(ytext, null, { undoManager }),
    keymap.of([
      { key: 'Mod-b', run: v => (commands.wrap(v, '**'), true) },
      { key: 'Mod-i', run: v => (commands.wrap(v, '*'), true) },
      { key: 'Mod-Shift-x', run: v => (commands.wrap(v, '~~'), true) },
      { key: 'Mod-e', run: v => (commands.wrap(v, '`'), true) },
      { key: 'Mod-k', run: v => (commands.link(v), true) },
      { key: 'Mod-m', run: v => (commands.wrap(v, '$'), true) },
      { key: 'Mod-Shift-m', run: v => (commands.insert(v, '\n$$\n\n$$\n', 4), true) },
      { key: 'Mod-Shift-7', run: v => (commands.prefix(v, '1. ', LIST_PREFIX), true) },
      { key: 'Mod-Shift-8', run: v => (commands.prefix(v, '- ', LIST_PREFIX), true) },
      { key: 'Mod-Shift-9', run: v => (commands.prefix(v, '- [ ] ', LIST_PREFIX), true) },
      ...yUndoManagerKeymap,
      ...searchKeymap,
      indentWithTab,
      ...defaultKeymap,
    ]),
    clickHandlers(ctx),
    livePreview(ctx),
    EditorView.contentAttributes.of({ spellcheck: 'true', autocapitalize: 'sentences', autocorrect: 'on' }),
  ]
  const view = new EditorView({ parent, state: EditorState.create({ doc: ytext.toString(), extensions }) })
  return {
    view,
    refresh() {
      view.dispatch({ effects: refresh.of(null) })
    },
    destroy() { view.destroy() },
  }
}
