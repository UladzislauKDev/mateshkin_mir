import { useParams, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { gamesData } from '../lib/gamesData'
import { useBgTheme } from '../lib/bgTheme'
import slidesData from '../slides_data.json'
import './pages.css'

const slideMap = {}
slidesData.forEach(s => { slideMap[s.slide] = s })

function getSlideDescription(slideId) {
  const slide = slideMap[slideId]
  if (!slide) return ''
  for (const el of slide.elements) {
    if (el.type !== 'shape') continue
    const text = el.paragraphs?.flatMap(p => p.runs).map(r => r.text).join('').trim()
    if (text) return text
  }
  return ''
}

export default function GameIntroPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const gameId = parseInt(id)
  const game = gamesData[gameId]
  const { bg } = useBgTheme()

  if (!game) {
    navigate(`/slide/${gameId}`, { replace: true })
    return null
  }

  const description = getSlideDescription(gameId)
  const categoryRoute = `/categories/${game.categorySlide}`

  return (
    <AppShell onBack={() => navigate(categoryRoute)}>
      <div className="page-slide" style={{ background: bg }}>
        <div className="game-intro-content">
          <div className="game-intro-badge">Задание</div>
          {description && <div className="game-intro-desc">{description}</div>}
          <button
            className="play-btn"
            onClick={() => navigate(`/game/${gameId}/play`)}
          >
            Начать
          </button>
        </div>
      </div>
    </AppShell>
  )
}
