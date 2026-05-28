import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import slidesData from '../slides_data.json'
import SlideRenderer from '../components/SlideRenderer'
import AppShell from '../components/AppShell'
import { gamesData } from '../lib/gamesData'

const slideMap = {}
slidesData.forEach(s => { slideMap[s.slide] = s })

const OVERLAY_MS = 2200
const COMPLETE_MS = 2000

function getSlideType(slideId) {
  const s = slideMap[slideId]
  if (!s) return 'normal'
  for (const el of s.elements) {
    if (el.type !== 'shape') continue
    for (const p of el.paragraphs) {
      for (const r of p.runs) {
        if (r.text.includes('МОЛОДЕЦ')) return 'molodets'
        if (r.text.includes('Неправильно')) return 'nepravilno'
      }
    }
  }
  return 'normal'
}

const FIREWORK_COLORS = [
  '#FF6B6B', '#FFE66D', '#4ECDC4', '#FF9F43',
  '#A29BFE', '#FD79A8', '#55EFC4', '#FDCB6E',
  '#ffffff', '#ff4d4d', '#7BF5FF', '#FFDC5E',
]

function makeParticles(count, distBase, distStep, waves) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 2 * Math.PI
    const dist = distBase + (i % distStep) * 2.4
    const delay = (Math.floor(i / (count / waves)) * 0.3).toFixed(2)
    return {
      dx: (Math.cos(angle) * dist).toFixed(2),
      dy: (Math.sin(angle) * dist).toFixed(2),
      color: FIREWORK_COLORS[i % FIREWORK_COLORS.length],
      delay: `${delay}s`,
      size: `${0.6 + (i % 3) * 0.35}cqw`,
      radius: i % 4 === 1 ? '2px' : '50%',
    }
  })
}

function ResultOverlay({ type }) {
  const isComplete = type === 'complete'
  const showParticles = type === 'molodets' || isComplete
  const particles = showParticles
    ? makeParticles(isComplete ? 56 : 36, isComplete ? 10 : 8, 5, 3)
    : []

  return (
    <div className={`result-overlay result-overlay--${type}`}>
      {particles.map((p, i) => (
        <div
          key={i}
          className="firework-particle"
          style={{
            background: p.color,
            animationDelay: p.delay,
            '--dx': `${p.dx}cqw`,
            '--dy': `${p.dy}cqw`,
            width: p.size,
            height: p.size,
            borderRadius: p.radius,
          }}
        />
      ))}
      <div className="result-overlay__card">
        {isComplete ? (
          <>
            <div className="result-overlay__text">УРА!</div>
            <div className="result-overlay__subtext">Задание пройдено!</div>
          </>
        ) : (
          <div className="result-overlay__text">
            {type === 'molodets' ? 'МОЛОДЕЦ!' : 'Подумай ещё!'}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SlidePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const startId = parseInt(id) || 1
  const gameData = gamesData[startId]
  const returnTo = gameData
    ? `/categories/${gameData.categorySlide}`
    : (state?.returnTo ?? '/categories')

  // Skip the game intro slide — its description is shown on GameIntroPage
  const firstSlide = gameData ? startId + 1 : startId
  const [currentSlide, setCurrentSlide] = useState(firstSlide)
  const [history, setHistory] = useState([firstSlide])
  const [fading, setFading] = useState(false)
  const fadingRef = useRef(false)
  const [overlay, setOverlay] = useState(null)

  const goToSlide = useCallback((num) => {
    if (!slideMap[num] || fadingRef.current) return
    fadingRef.current = true
    setFading(true)
    setTimeout(() => {
      setCurrentSlide(num)
      setHistory(h => [...h, num])
      setFading(false)
      fadingRef.current = false
    }, 200)
  }, [])

  const interceptGoToSlide = useCallback((num) => {
    if (overlay) return
    const type = getSlideType(num)
    if (type === 'molodets') {
      const nextSlide = num + 1
      const isLastQuestion = gameData ? num === gameData.lastMolodets : !slideMap[nextSlide]
      setOverlay({ type: isLastQuestion ? 'complete' : 'molodets', nextSlide: isLastQuestion ? null : nextSlide })
      return
    }
    if (type === 'nepravilno') {
      setOverlay({ type: 'nepravilno', nextSlide: null })
      return
    }
    goToSlide(num)
  }, [overlay, goToSlide])

  useEffect(() => {
    if (!overlay) return
    const ms = overlay.type === 'complete' ? COMPLETE_MS : OVERLAY_MS
    const timer = setTimeout(() => {
      const { type, nextSlide } = overlay
      setOverlay(null)
      if (type === 'complete') {
        navigate(returnTo)
      } else if (type === 'molodets' && nextSlide) {
        // Skip any Неправильно slides that may come right after a МОЛОДЕЦ slide
        let target = nextSlide
        while (slideMap[target] && getSlideType(target) === 'nepravilno') target++
        if (slideMap[target]) goToSlide(target)
      }
    }, ms)
    return () => clearTimeout(timer)
  }, [overlay, goToSlide, navigate, returnTo])

  const goBack = useCallback(() => {
    if (overlay) { setOverlay(null); return }
    setHistory(h => {
      if (h.length <= 1) { navigate(returnTo); return h }
      const newH = h.slice(0, -1)
      const prev = newH[newH.length - 1]
      fadingRef.current = true
      setFading(true)
      setTimeout(() => {
        setCurrentSlide(prev)
        setFading(false)
        fadingRef.current = false
      }, 200)
      return newH
    })
  }, [navigate, overlay])

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') goBack() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [goBack])

  const slide = slideMap[currentSlide]
  if (!slide) return <div className="error">Слайд {currentSlide} не найден</div>

  return (
    <AppShell fading={fading} onBack={goBack}>
      <SlideRenderer
        slide={slide}
        onNavigate={interceptGoToSlide}
        overlay={overlay && <ResultOverlay type={overlay.type} />}
      />
    </AppShell>
  )
}
