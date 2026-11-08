import MarkdownIt from 'markdown-it'
import katex from 'katex'
import { imageSize } from './upload.js'

const cache = new Map()

export function tex(src, display) {
  const key = (display ? 'D' : 'I') + src
  let html = cache.get(key)
  if (html == null) {
    html = katex.renderToString(src, { displayMode: display, throwOnError: false, output: 'html', strict: 'ignore' })
    if (cache.size > 800) cache.clear()
    cache.set(key, html)
  }
  return html
}

function mathPlugin(md) {
  md.inline.ruler.after('escape', 'math_inline', (state, silent) => {
    const src = state.src
    const start = state.pos
    if (src[start] !== '$') return false
    const display = src[start + 1] === '$'
    const open = display ? 2 : 1
    if (!display && /\s/.test(src[start + 1] || ' ')) return false
    let end = start + open
    while ((end = src.indexOf(display ? '$$' : '$', end)) !== -1) {
      if (src[end - 1] !== '\\') break
      end++
    }
    if (end === -1 || end === start + open) return false
    if (!display && /\s/.test(src[end - 1])) return false
    if (!silent) {
      const tok = state.push('math_inline', 'math', 0)
      tok.content = src.slice(start + open, end)
      tok.meta = { display }
    }
    state.pos = end + open
    return true
  })

  md.block.ruler.after('blockquote', 'math_block', (state, startLine, endLine, silent) => {
    const pos = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]
    const first = state.src.slice(pos, max).trim()
    if (!first.startsWith('$$')) return false
    if (first.length > 4 && first.endsWith('$$')) {
      if (silent) return true
      const tok = state.push('math_block', 'math', 0)
      tok.content = first.slice(2, -2)
      tok.map = [startLine, startLine + 1]
      state.line = startLine + 1
      return true
    }
    let line = startLine
    let found = false
    while (++line < endLine) {
      const l = state.src.slice(state.bMarks[line] + state.tShift[line], state.eMarks[line]).trim()
      if (l.endsWith('$$')) { found = true; break }
    }
    if (!found) return false
    if (silent) return true
    const body = [first.slice(2)]
    for (let i = startLine + 1; i <= line; i++) body.push(state.src.slice(state.bMarks[i] + state.tShift[i], state.eMarks[i]))
    body[body.length - 1] = body[body.length - 1].replace(/\$\$\s*$/, '')
    const tok = state.push('math_block', 'math', 0)
    tok.content = body.join('\n')
    tok.map = [startLine, line + 1]
    state.line = line + 1
    return true
  }, { alt: ['paragraph', 'reference', 'blockquote', 'list'] })

  md.renderer.rules.math_inline = (tokens, i) => tex(tokens[i].content, tokens[i].meta.display)
  md.renderer.rules.math_block = (tokens, i) => `<div class="nt-math-block">${tex(tokens[i].content, true)}</div>`
}

function wikiPlugin(md, resolve) {
  md.inline.ruler.before('link', 'wikilink', (state, silent) => {
    const src = state.src
    if (!src.startsWith('[[', state.pos)) return false
    const end = src.indexOf(']]', state.pos + 2)
    if (end === -1) return false
    const name = src.slice(state.pos + 2, end).trim()
    if (!name || name.includes('\n')) return false
    if (!silent) {
      const tok = state.push('wikilink', 'a', 0)
      tok.content = name
    }
    state.pos = end + 2
    return true
  })
  md.renderer.rules.wikilink = (tokens, i) => {
    const name = tokens[i].content
    const id = resolve(name)
    const cls = id ? 'nt-wikilink' : 'nt-wikilink nt-wikilink--missing'
    return `<a class="${cls}" href="#" data-note-id="${id || ''}" data-note-name="${md.utils.escapeHtml(name)}">${md.utils.escapeHtml(name)}</a>`
  }
}

function taskPlugin(md) {
  md.core.ruler.after('inline', 'tasks', state => {
    const toks = state.tokens
    for (let i = 2; i < toks.length; i++) {
      const tok = toks[i]
      if (tok.type !== 'inline' || toks[i - 1].type !== 'paragraph_open' || toks[i - 2].type !== 'list_item_open') continue
      const m = /^\[([ xX])\]\s/.exec(tok.content)
      if (!m) continue
      const first = tok.children[0]
      if (!first || first.type !== 'text') continue
      first.content = first.content.replace(/^\[[ xX]\]\s/, '')
      const box = new state.Token('html_inline', '', 0)
      box.content = `<input type="checkbox" class="nt-task" data-line="${toks[i - 2].map?.[0] ?? ''}" ${m[1] !== ' ' ? 'checked' : ''}> `
      tok.children.unshift(box)
      toks[i - 2].attrJoin('class', 'nt-task-item')
    }
  })
}

export function imageHtml(src, alt) {
  const size = imageSize(src)
  const ratio = size ? `aspect-ratio:${size.w}/${size.h};max-width:min(100%,${size.w}px)` : ''
  if (src.startsWith('uploading://')) {
    return `<span class="nt-img nt-img--uploading"><span class="nt-img__label">${alt || ''}</span></span>`
  }
  return `<span class="nt-img is-loading" style="${ratio}"><img src="${src}" alt="${alt || ''}" loading="lazy" decoding="async" onload="this.parentNode.classList.remove('is-loading')" onerror="this.parentNode.classList.add('is-broken')"></span>`
}

export function createRenderer({ resolveNote }) {
  const md = new MarkdownIt({ html: false, linkify: true, breaks: true })
  md.use(mathPlugin)
  md.use(wikiPlugin, resolveNote)
  md.use(taskPlugin)
  md.renderer.rules.image = (tokens, i) => {
    const tok = tokens[i]
    return imageHtml(md.utils.escapeHtml(tok.attrGet('src') || ''), md.utils.escapeHtml(tok.content))
  }
  const defaultLink = md.renderer.rules.link_open || ((t, i, o, e, s) => s.renderToken(t, i, o))
  md.renderer.rules.link_open = (tokens, i, o, e, s) => {
    tokens[i].attrSet('target', '_blank')
    tokens[i].attrSet('rel', 'noopener')
    return defaultLink(tokens, i, o, e, s)
  }
  md.validateLink = url => !/^(javascript|vbscript|file):/i.test(url.trim()) && (!/^data:/i.test(url.trim()) || /^data:image\/(gif|png|jpeg|webp);/i.test(url.trim()))
  return src => md.render(src)
}
