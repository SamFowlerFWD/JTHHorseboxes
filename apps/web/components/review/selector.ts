/**
 * Turning a clicked element into something we can find again on a later visit.
 *
 * A pin has to survive a redeploy, so the selector avoids anything Next.js
 * regenerates between builds — hashed CSS module classes, React-injected
 * attributes. It walks up to the nearest stable ancestor and records the
 * position of each step. Where that still fails (the element moved, the copy
 * was rewritten), findElement falls back to matching the stored text.
 */

function isOverlayNode(el: Element): boolean {
  return !!el.closest('[data-review-overlay]')
}

/** Build a selector path from the element up to <body>. */
export function buildSelector(el: Element): string {
  if (!el || el === document.body) return 'body'

  const parts: string[] = []
  let current: Element | null = el

  while (current && current !== document.body && parts.length < 8) {
    // An id is unique by definition — stop as soon as we find a usable one.
    if (current.id && !/^\d/.test(current.id)) {
      parts.unshift(`#${CSS.escape(current.id)}`)
      return parts.join(' > ')
    }

    const tag = current.tagName.toLowerCase()
    const parent: Element | null = current.parentElement

    if (!parent) {
      parts.unshift(tag)
      break
    }

    const sameTagSiblings = Array.from(parent.children).filter(
      (c) => c.tagName === current!.tagName
    )

    if (sameTagSiblings.length === 1) {
      parts.unshift(tag)
    } else {
      const index = sameTagSiblings.indexOf(current) + 1
      parts.unshift(`${tag}:nth-of-type(${index})`)
    }

    current = parent
  }

  return parts.join(' > ')
}

/** Re-find a pinned element: selector first, then stored text as a fallback. */
export function findElement(selector: string, elementText: string): Element | null {
  if (selector) {
    try {
      const found = document.querySelector(selector)
      if (found && !isOverlayNode(found)) return found
    } catch {
      // Malformed selector — fall through to the text match
    }
  }

  const needle = elementText.trim()
  if (needle.length < 4) return null

  const candidates = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, li, button, td, th, label, div')
  for (const candidate of Array.from(candidates)) {
    if (isOverlayNode(candidate)) continue
    // Only match the element that directly owns the text, not its ancestors
    const ownText = Array.from(candidate.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent ?? '')
      .join('')
      .trim()
    if (ownText === needle) return candidate
  }

  return null
}

/** A short, human-readable label for the element, shown in the admin list. */
export function describeElement(el: Element): string {
  const tag = el.tagName.toLowerCase()
  const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ')

  if (tag === 'img') {
    const alt = el.getAttribute('alt')
    const src = el.getAttribute('src') ?? ''
    return alt ? `Image: ${alt}` : `Image: ${src.split('/').pop()}`
  }

  if (!text) return `<${tag}>`
  return text.length > 80 ? `${text.slice(0, 80)}…` : text
}

/** Text used to re-anchor the pin — the element's own text, not its children's. */
export function ownTextOf(el: Element): string {
  return Array.from(el.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent ?? '')
    .join('')
    .trim()
    .slice(0, 200)
}
