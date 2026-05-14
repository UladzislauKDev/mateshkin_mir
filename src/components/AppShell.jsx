import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import '../App.css'
import { BG_OPTIONS, useBgTheme } from '../lib/bgTheme'

const PARENT = {
  '/menu': '/',
  '/categories': '/menu',
  '/reference': '/menu',
}

function getParent(pathname) {
  if (PARENT[pathname]) return PARENT[pathname]
  if (pathname.startsWith('/categories/')) return '/categories'
  return null
}

export default function AppShell({ children, fading, onBack }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  const parent = getParent(pathname)
  const handleBack = onBack ?? (parent ? () => navigate(parent) : null)

  useEffect(() => {
    if (!handleBack) return
    if (onBack) return  // SlidePage registers its own Escape listener
    const fn = e => { if (e.key === 'Escape') handleBack() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [handleBack, onBack])

  const { idx, pick } = useBgTheme()

  const toggleFs = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.()
    else document.exitFullscreen?.()
  }

  return (
    <div className="app">
      <div className="slide-frame">
        <div className={`slide-wrapper${fading ? ' fading' : ''}`}>
          {children}
        </div>
      </div>
      {handleBack && (
        <button className="back-btn" onClick={handleBack} title="Назад (Esc)">
          Назад
        </button>
      )}
      <button className="fullscreen-btn" onClick={toggleFs} title="Полный экран">
        ⛶
      </button>
      {!isHome && (
        <div className="bg-picker">
          {BG_OPTIONS.map((opt, i) => (
            <button
              key={i}
              className={`bg-swatch${idx === i ? ' bg-swatch--active' : ''}`}
              style={{ background: opt.swatch }}
              onClick={() => pick(i)}
              title={opt.name}
            />
          ))}
        </div>
      )}
    </div>
  )
}
