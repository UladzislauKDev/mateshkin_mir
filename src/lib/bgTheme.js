import { useState, useEffect } from 'react'

export const BG_OPTIONS = [
  {
    name: 'Синий',
    bg: 'linear-gradient(160deg, #b8d8f8 0%, #96c2f0 60%, #78aee8 100%)',
    swatch: '#96c2f0',
  },
  {
    name: 'Луг',
    bg: 'linear-gradient(160deg, #d4ebbe 0%, #c0dba6 60%, #aecf94 100%)',
    swatch: '#c0dba6',
  },
  {
    name: 'Пергамент',
    bg: 'linear-gradient(160deg, #fdf5e0 0%, #f5e6c4 60%, #ecd8ac 100%)',
    swatch: '#f5e6c4',
  },
  {
    name: 'Персик',
    bg: 'linear-gradient(160deg, #fdebd8 0%, #f8d4b4 60%, #f2c09a 100%)',
    swatch: '#f8d4b4',
  },
  {
    name: 'Сирень',
    bg: 'linear-gradient(160deg, #ece4f8 0%, #dbd0f2 60%, #c9bce8 100%)',
    swatch: '#dbd0f2',
  },
]

const LS_KEY = 'mateshkin_bg'

function readIdx() {
  const v = parseInt(localStorage.getItem(LS_KEY) ?? '0')
  return Number.isFinite(v) && v >= 0 && v < BG_OPTIONS.length ? v : 0
}

export function useBgTheme() {
  const [idx, setIdx] = useState(readIdx)

  useEffect(() => {
    const h = (e) => setIdx(e.detail)
    window.addEventListener('bgchange', h)
    return () => window.removeEventListener('bgchange', h)
  }, [])

  const pick = (i) => {
    localStorage.setItem(LS_KEY, i)
    setIdx(i)
    window.dispatchEvent(new CustomEvent('bgchange', { detail: i }))
  }

  return { bg: BG_OPTIONS[idx].bg, idx, pick }
}
