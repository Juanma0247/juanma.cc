// Deterministic key for a card tag/label, shared by MosaicCard and Navbar so the
// server-rendered markup and the dictionary always agree. e.g. 'Automata Theory'
// → 'automatatheory' (looked up as tags.automatatheory).
export function tagKey(tag: string): string {
  return tag.toLowerCase().replace(/[^a-z0-9]+/g, '')
}
