// Question slides for "Где находится житель?" (slides 185-203)
export const DIRECTION_GAME_SLIDES = new Set([186, 189, 192, 195, 198, 201])

// Which image is the target animal for each question slide
export const DIRECTION_TARGETS = {
  186: 'image15.png', // корова
  189: 'image21.png', // гусь
  192: 'image19.png', // белка
  195: 'image14.png', // мышка
  198: 'image23.png', // лиса
  201: 'image89.png', // сова
}

// Question slides for "Найди место бабочки" (slides 204-225)
export const BUTTERFLY_GAME_SLIDES = new Set([205, 208, 211, 214, 217, 220, 223])

// [x, y, label] — match button positions to their preposition label
// tolerance ±2.5% used when matching
export const BUTTERFLY_POS_LABELS = [
  [67.6, 60.9, 'рядом'],
  [26.6, 56.8, 'за'],
  [38.7, 17.4, 'над'],
  [44.9, 39.1, 'на'],
  [51.1, 67.7, 'под'],
  [40.5, 38.1, 'в коробке'],
  [47.8, 48.8, 'между'],
  [66.3, 54.6, 'рядом'],
  [24.9, 57.5, 'за'],
  [44.9, 81.3, 'под'],
  [69.1, 70.7, 'под'],
  [67.6, 16.4, 'над'],
  [12.3, 51.2, 'за'],
  [24.4, 55.0, 'на'],
]

export function getButterflyLabel(x, y) {
  let best = null, bestDist = Infinity
  for (const [cx, cy, label] of BUTTERFLY_POS_LABELS) {
    const dist = Math.hypot(cx - x, cy - y)
    if (dist < 3.5 && dist < bestDist) {
      bestDist = dist
      best = label
    }
  }
  return best ?? '?'
}
