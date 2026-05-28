import slidesData from '../slides_data.json'
import { gamesData } from './gamesData'

const slideMap = {}
slidesData.forEach(s => { slideMap[s.slide] = s })

export function getNavItems(slideId) {
  const slide = slideMap[slideId]
  if (!slide) return []
  const items = []
  for (const el of slide.elements) {
    if (el.type !== 'shape') continue
    if (el.link) {
      const text = el.paragraphs.flatMap(p => p.runs).map(r => r.text).join('').trim()
      if (text) { items.push({ text, link: el.link }); continue }
    }
    for (const para of el.paragraphs) {
      if (!para.link) continue
      const text = para.runs.map(r => r.text).join('').trim()
      if (text) items.push({ text, link: para.link })
    }
  }
  return items
}

export function getSlideTitle(slideId) {
  const categories = getNavItems(3)
  const match = categories.find(item => item.link?.value === slideId)
  return match?.text ?? null
}

// Slides 1–9 are handled as custom JSX pages; games go to /game/:id for intro
export function resolveSlideRoute(slideId) {
  if (slideId === 1) return '/'
  if (slideId === 2) return '/menu'
  if (slideId === 3) return '/categories'
  if (slideId >= 4 && slideId <= 9) return `/categories/${slideId}`
  if (slideId === 280) return '/reference'
  if (gamesData[slideId]) return `/game/${slideId}`
  return `/slide/${slideId}`
}
