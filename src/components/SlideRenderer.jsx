import './SlideRenderer.css'
import { useBgTheme } from '../lib/bgTheme'

// 1pt = 12700 EMU; slide width = 12192000 EMU → exact ratio
const PT_TO_CQW_BASE = 0.10417
// game slides scale up for readability; info slides (e.g. 281) use base
const PT_TO_CQW_GAME = 0.138
const BASE = import.meta.env.BASE_URL

const BG_PANEL_FILL  = '#A6C57D'
const MOLODETS_FILL  = '#A8D08D'


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
  const handler = resolveLink(el.link, onNavigate)
  const isArrow = el.src === 'image2.png'
  const style = {
    ...posStyle(el.pos),
    position: 'absolute',
    objectFit: 'contain',
    cursor: handler ? 'pointer' : 'default',
    transform: [
      el.pos?.flipH ? 'scaleX(-1)' : null,
      isArrow ? 'rotate(45deg)' : null,
    ].filter(Boolean).join(' ') || undefined,
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

  // Деревянная кнопка-навигация
  const isWoodenNav = !isTitle && el.fill && el.link && hasText

  const containerStyle = {
    ...posStyle(el.pos),
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: isInstructionBox ? 'center' : anchorToJustify(el.anchor),
    alignItems: isInstructionBox ? 'center' : undefined,
    overflow: isInstructionBox ? 'hidden' : 'auto',
    backgroundColor: 'transparent',
    cursor: shapeHandler ? 'pointer' : 'default',
    boxSizing: 'border-box',
    padding: isInstructionBox ? '4% 6%' : (isInfoSlide ? '3% 5%' : 0),
    pointerEvents: hasAnyLink ? 'auto' : 'none',
  }

  return (
    <div
      style={containerStyle}
      className={[
        shapeHandler ? 'clickable-shape' : '',
        isWoodenNav ? 'wooden-nav' : '',
        isInstructionBox ? 'instruction-box' : '',
      ].filter(Boolean).join(' ')}
      onClick={shapeHandler || undefined}
    >
      {el.paragraphs.map((para, pi) => {
        const paraHandler = resolveLink(para.link, onNavigate)
        const allText = para.runs.map(r => r.text).join('')
        if (!allText.trim()) return <div key={pi} style={{ height: isInstructionBox ? '0.6em' : '0.25em' }} />

        const paraStyle = {
          textAlign: isInstructionBox ? 'center' : alignMap(para.align),
          cursor: paraHandler ? 'pointer' : undefined,
          lineHeight: isInstructionBox ? 1.2 : 1.25,
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
              const runStyle = isInstructionBox ? {
                fontFamily: "'Fredoka', 'Nunito', sans-serif",
                fontSize: '6.5cqw',
                fontWeight: '700',
                letterSpacing: '0.01em',
                color: '#002060',
                textShadow: [
                  '0 2px 0 rgba(255,255,255,0.9)',
                  '0 0 18px rgba(255,255,255,0.95)',
                  '0 0 40px rgba(255,255,255,0.7)',
                  '0 6px 24px rgba(0,32,96,0.15)',
                ].join(', '),
              } : {
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

const INFO_SLIDES = new Set([281])

export default function SlideRenderer({ slide, onNavigate, overlay }) {
  const isTitle = slide.slide === 1
  const isInfoSlide = INFO_SLIDES.has(slide.slide)
  const ptScale = isInfoSlide ? PT_TO_CQW_BASE : PT_TO_CQW_GAME
  const { bg } = useBgTheme()

  return (
    <div className="slide" style={{ background: bg }}>
      {slide.elements.map((el, i) => {
        if (el.type === 'image') {
          return <ImageElement key={i} el={el} onNavigate={onNavigate} />
        }
        if (el.type === 'shape') {
          return <ShapeElement key={i} el={el} onNavigate={onNavigate} isTitle={isTitle} ptScale={ptScale} isInfoSlide={isInfoSlide} />
        }
        return null
      })}
      {overlay}
    </div>
  )
}
