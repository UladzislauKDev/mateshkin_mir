import { useState, useRef, useLayoutEffect } from 'react'
import './SlideRenderer.css'
import { useBgTheme } from '../lib/bgTheme'
import { DIRECTION_GAME_SLIDES, DIRECTION_TARGETS, BUTTERFLY_GAME_SLIDES } from '../lib/directionGameData'

const GDEBOLSHE_SLIDES = new Set([37, 40, 43, 46, 49])

// 1pt = 12700 EMU; slide width = 12192000 EMU → exact ratio
const PT_TO_CQW_BASE = 0.10417
// game slides scale up for readability; info slides (e.g. 281) use base
const PT_TO_CQW_GAME = 0.138
const BASE = import.meta.env.BASE_URL

const BG_PANEL_FILL    = '#A6C57D'
const MOLODETS_FILL    = '#A8D08D'
const VERDICT_CORRECT  = '#AFD68A'
const VERDICT_WRONG    = '#DE8899'


function resolveLink(link, onNavigate) {
  if (!link) return null
  if (link.type === 'slide') return () => onNavigate(link.value)
  if (link.type === 'url') return () => window.open(link.value, '_blank')
  return null
}

function posStyle(pos) {
  if (!pos) return {}
  return {
    left: `${pos.x}%`,
    top: `${pos.y}%`,
    width: `${pos.w}%`,
    height: `${pos.h}%`,
  }
}

function anchorToJustify(anchor) {
  if (anchor === 't') return 'flex-start'
  if (anchor === 'b') return 'flex-end'
  return 'center'
}

function alignMap(a) {
  if (a === 'ctr') return 'center'
  if (a === 'r') return 'right'
  if (a === 'just') return 'justify'
  return 'left'
}

const CONFETTI_COLORS = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#FF9F43', '#A29BFE', '#FD79A8', '#55EFC4', '#FDCB6E']

function MolodetsCard({ el }) {
  const pieces = Array.from({ length: 20 }, (_, i) => ({
    left: `${4 + i * 4.6}%`,
    delay: `${((i * 0.13) % 1.6).toFixed(2)}s`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    tx: `${-25 + i * 3}px`,
    shape: i % 3 === 0 ? '50%' : '2px',
  }))

  return (
    <div className="molodets-card" style={{ ...posStyle(el.pos), position: 'absolute' }}>
      <div className="molodets-confetti" aria-hidden="true">
        {pieces.map((p, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: p.left,
              background: p.color,
              borderRadius: p.shape,
              animationDelay: p.delay,
              '--tx': p.tx,
            }}
          />
        ))}
      </div>
      <div className="molodets-text">МОЛОДЕЦ!</div>
    </div>
  )
}

function ImageElement({ el, onNavigate }) {
  if (el.src === 'image2.png') return null
  const handler = resolveLink(el.link, onNavigate)
  const style = {
    ...posStyle(el.pos),
    position: 'absolute',
    objectFit: handler ? 'fill' : 'contain',
    cursor: handler ? 'pointer' : 'default',
    transform: el.pos?.flipH ? 'scaleX(-1)' : undefined,
    pointerEvents: handler ? 'auto' : 'none',
  }
  return (
    <img
      src={`${BASE}images/${el.src}`}
      style={style}
      className={handler ? 'clickable-img' : undefined}
      alt=""
      draggable={false}
      onClick={handler || undefined}
    />
  )
}

const RUN_STYLE = {
  fontFamily: "'Fredoka', 'Nunito', sans-serif",
  fontSize: 'inherit',
  fontWeight: '700',
  letterSpacing: '0.01em',
  color: '#002060',
  textShadow: [
    '0 2px 0 rgba(255,255,255,0.9)',
    '0 0 18px rgba(255,255,255,0.95)',
    '0 0 40px rgba(255,255,255,0.7)',
    '0 6px 24px rgba(0,32,96,0.15)',
  ].join(', '),
}

function InstructionBox({ el, containerStyle }) {
  const outerRef = useRef(null)
  const innerRef = useRef(null)
  const [fs, setFs] = useState(6.5)

  const text = el.paragraphs.map(p => p.runs.map(r => r.text).join('')).join(' ')

  useLayoutEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    // getBoundingClientRect gives actual rendered pixel heights — no padding confusion
    const outerH = outer.getBoundingClientRect().height

    const fits = (size) => {
      inner.style.fontSize = `${size}cqw`
      return inner.getBoundingClientRect().height <= outerH - 2
    }

    let lo = 1.5, hi = 6.5
    if (fits(hi)) { setFs(hi); inner.style.fontSize = ''; return }

    while (hi - lo > 0.1) {
      const mid = (lo + hi) / 2
      fits(mid) ? (lo = mid) : (hi = mid)
    }

    setFs(lo)
    inner.style.fontSize = ''
  }, [text])

  return (
    <div
      ref={outerRef}
      className="instruction-box"
      style={{
        ...containerStyle,
        overflow: 'hidden',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        ref={innerRef}
        style={{
          fontSize: `${fs}cqw`,
          width: '100%',
          paddingLeft: '1.5cqw',
          paddingRight: '1.5cqw',
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        {el.paragraphs.map((para, pi) => {
          const allText = para.runs.map(r => r.text).join('')
          if (!allText.trim()) return null
          return (
            <div key={pi} style={{ marginBottom: '2px' }}>
              {para.runs.map((run, ri) => {
                if (run.text === '\n') return <br key={ri} />
                return <span key={ri} style={RUN_STYLE}>{run.text}</span>
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ShapeElement({ el, onNavigate, isTitle, ptScale, isInfoSlide }) {
  const shapeHandler = resolveLink(el.link, onNavigate)
  const hasText = el.paragraphs.some(p => p.runs.some(r => r.text.trim()))
  const hasAnyLink = shapeHandler || el.paragraphs.some(p => p.link)

  const isBgPanel = el.fill?.toUpperCase() === BG_PANEL_FILL.toUpperCase()
  const isMolodets = el.fill?.toUpperCase() === MOLODETS_FILL.toUpperCase()

  // Зелёный фон без контента — скрываем
  if (isBgPanel && !hasAnyLink && !hasText) return null

  // МОЛОДЕЦ — заменяем на компонент-праздник
  if (isMolodets && hasText) return <MolodetsCard el={el} />

  // Текстовое задание (инструкция) — визуально выразительный блок
  const isInstructionBox = !isInfoSlide && isBgPanel && hasText && !hasAnyLink

  // Кнопки "Верно / Неверно"
  const fillUp = el.fill?.toUpperCase()
  const isVerdictBtn = fillUp === VERDICT_CORRECT.toUpperCase() || fillUp === VERDICT_WRONG.toUpperCase()
  const isCorrectBtn = fillUp === VERDICT_CORRECT.toUpperCase()

  // Деревянная кнопка-навигация (не для verdict-кнопок)
  const isWoodenNav = !isTitle && !isVerdictBtn && el.fill && el.link && hasText

  const containerStyle = {
    ...posStyle(el.pos),
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: anchorToJustify(el.anchor),
    overflow: 'hidden',
    backgroundColor: 'transparent',
    cursor: shapeHandler ? 'pointer' : 'default',
    boxSizing: 'border-box',
    padding: isInfoSlide ? '3% 5%' : 0,
    pointerEvents: hasAnyLink ? 'auto' : 'none',
    zIndex: isInstructionBox ? 2 : undefined,
  }

  if (isInstructionBox) {
    return <InstructionBox el={el} containerStyle={containerStyle} />
  }

  if (isVerdictBtn && shapeHandler) {
    const text = el.paragraphs.flatMap(p => p.runs).map(r => r.text).join('').trim()
    return (
      <div
        style={posStyle(el.pos)}
        className={`verdict-btn verdict-btn--${isCorrectBtn ? 'correct' : 'wrong'}`}
        onClick={shapeHandler}
      >
        <span className="verdict-btn__text">{text}</span>
      </div>
    )
  }

  return (
    <div
      style={containerStyle}
      className={[
        shapeHandler ? 'clickable-shape' : '',
        isWoodenNav ? 'wooden-nav' : '',
      ].filter(Boolean).join(' ')}
      onClick={shapeHandler || undefined}
    >
      {el.paragraphs.map((para, pi) => {
        const paraHandler = resolveLink(para.link, onNavigate)
        const allText = para.runs.map(r => r.text).join('')
        if (!allText.trim()) return <div key={pi} style={{ height: '0.25em' }} />

        const paraStyle = {
          textAlign: alignMap(para.align),
          cursor: paraHandler ? 'pointer' : undefined,
          lineHeight: 1.25,
          marginBottom: '2px',
        }

        return (
          <div
            key={pi}
            className={paraHandler ? 'para-btn' : undefined}
            style={paraStyle}
            onClick={paraHandler ? (e) => { e.stopPropagation(); paraHandler() } : undefined}
          >
            {para.runs.map((run, ri) => {
              if (run.text === '\n') return <br key={ri} />
              const defaultColor = isWoodenNav ? '#3d2800' : '#002060'
              const runStyle = {
                color: run.color || defaultColor,
                fontSize: run.size ? `${run.size * ptScale}cqw` : undefined,
                fontWeight: run.bold ? '700' : '500',
              }
              return (
                <span key={ri} style={runStyle}>{run.text}</span>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

// ── Direction game helpers ──

function angleDeg(fx, fy, tx, ty) {
  const a = Math.atan2(tx - fx, -(ty - fy)) * 180 / Math.PI
  return (a + 360) % 360
}

function DirectionGameArrows({ slide, onNavigate }) {
  const animals = slide.elements.filter(el => el.type === 'image' && el.pos)
  const targetSrc = DIRECTION_TARGETS[slide.slide]

  // Bottom panel: the yellow (#EADD7C) shape at y > 65
  const panel = slide.elements
    .filter(el => el.type === 'shape' && el.fill?.toUpperCase() === '#EADD7C' && (el.pos?.y ?? 0) > 65)
    .sort((a, b) => a.pos.y - b.pos.y)[0]

  if (!panel || !animals.length || !targetSrc) return null

  // Use center of the yellow content area (top) as reference for computing directions
  const contentArea = slide.elements
    .filter(el => el.type === 'shape' && el.fill?.toUpperCase() === '#EADD7C' && (el.pos?.y ?? 99) < 20)
    .sort((a, b) => a.pos.y - b.pos.y)[0]

  const refX = contentArea ? contentArea.pos.x + contentArea.pos.w / 2 : 50
  const refY = contentArea ? contentArea.pos.y + contentArea.pos.h / 2 : 40

  const items = animals
    .map(img => {
      const cx = img.pos.x + img.pos.w / 2
      const cy = img.pos.y + img.pos.h / 2
      return { src: img.src, angle: angleDeg(refX, refY, cx, cy), isTarget: img.src === targetSrc }
    })
    .sort((a, b) => a.angle - b.angle)

  const molodets = slide.slide + 2
  const nepravilno = slide.slide + 1
  const n = items.length
  const gap = panel.pos.w / n

  return items.map((item, i) => (
    <div
      key={i}
      className="dir-arrow-btn"
      style={{
        left: `${panel.pos.x + i * gap + gap * 0.1}%`,
        top: `${panel.pos.y + panel.pos.h * 0.08}%`,
        width: `${gap * 0.8}%`,
        height: `${panel.pos.h * 0.84}%`,
      }}
      onClick={() => onNavigate(item.isTarget ? molodets : nepravilno)}
    >
      <span className="dir-arrow-icon" style={{ transform: `rotate(${item.angle}deg)` }}>
        ↑
      </span>
    </div>
  ))
}

// ── Butterfly position game ──

function ButterflyGameButtons({ slide, onNavigate }) {
  const buttons = slide.elements.filter(
    el => el.type === 'shape' && el.fill === '#DE8899' && el.link
  )
  if (!buttons.length) return null

  return buttons.map((btn, i) => (
    <div
      key={i}
      className="butterfly-pos-btn"
      style={{
        left: `${btn.pos.x}%`,
        top: `${btn.pos.y}%`,
        width: `${btn.pos.w}%`,
        height: `${btn.pos.h}%`,
      }}
      onClick={() => onNavigate(btn.link.value)}
    />
  ))
}

const INFO_SLIDES = new Set([281])

export default function SlideRenderer({ slide, onNavigate, overlay }) {
  const isTitle = slide.slide === 1
  const isInfoSlide = INFO_SLIDES.has(slide.slide)
  const ptScale = isInfoSlide ? PT_TO_CQW_BASE : PT_TO_CQW_GAME
  const isDirectionGame = DIRECTION_GAME_SLIDES.has(slide.slide)
  const isButterflyGame = BUTTERFLY_GAME_SLIDES.has(slide.slide)
  const isGdeBolshe = GDEBOLSHE_SLIDES.has(slide.slide)
  const { bg } = useBgTheme()

  return (
    <div className="slide" style={{ background: bg }}>
      {slide.elements.map((el, i) => {
        if (el.type === 'image') {
          return <ImageElement key={i} el={el} onNavigate={onNavigate} />
        }
        if (el.type === 'shape') {
          if (isDirectionGame) {
            const hasText = el.paragraphs?.some(p => p.runs?.some(r => r.text.trim()))
            if (!hasText && el.pos?.y > 65 && (el.fill?.toUpperCase() === '#A6C57D' || el.fill === null)) {
              return null
            }
          }
          // Skip original pink circle spots — replaced by ButterflyGameButtons
          if (isButterflyGame && el.fill === '#DE8899') return null
          // Render Где больше? areas as soil-brown beds (in-place keeps flowers on top)
          if (isGdeBolshe && el.fill === '#DE8899') {
            const handler = resolveLink(el.link, onNavigate)
            return (
              <div
                key={i}
                className="soil-bed"
                style={{ ...posStyle(el.pos), position: 'absolute', cursor: 'pointer' }}
                onClick={handler || undefined}
              />
            )
          }
          return <ShapeElement key={i} el={el} onNavigate={onNavigate} isTitle={isTitle} ptScale={ptScale} isInfoSlide={isInfoSlide} />
        }
        return null
      })}
      {isDirectionGame && <DirectionGameArrows slide={slide} onNavigate={onNavigate} />}
      {isButterflyGame && <ButterflyGameButtons slide={slide} onNavigate={onNavigate} />}
      {overlay}
    </div>
  )
}
