const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function linkPattern(title) {
  return new RegExp(`\\[\\[\\s*${escapeRe(title.trim())}\\s*\\]\\]`, 'gi')
}

export function hasLink(text, title) {
  return typeof text === 'string' && title.trim() !== '' && linkPattern(title).test(text)
}

// Rewrites [[title]] as [[next]] inside a Y.Text (case-insensitive), as one
// transaction from the end so earlier offsets stay valid. Returns the count.
export function relink(doc, ytext, title, next) {
  const matches = [...ytext.toString().matchAll(linkPattern(title))]
  if (!matches.length) return 0
  const replacement = `[[${next.trim()}]]`
  doc.transact(() => {
    for (let i = matches.length - 1; i >= 0; i--) {
      const m = matches[i]
      ytext.delete(m.index, m[0].length)
      ytext.insert(m.index, replacement)
    }
  })
  return matches.length
}
