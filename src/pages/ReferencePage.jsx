import { useNavigate, useLocation } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { getNavItems, resolveSlideRoute } from '../lib/slideNav'
import { useBgTheme } from '../lib/bgTheme'
import './pages.css'

// Путь к PDF — заменить когда файл будет готов
const METODICHESKIE_PDF = null

export default function ReferencePage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const linkedItems = getNavItems(280).filter(item => item.link)
  const { bg } = useBgTheme()

  const handleClick = (link) => {
    if (link.type === 'slide') navigate(resolveSlideRoute(link.value), { state: { returnTo: pathname } })
    else window.open(link.value, '_blank')
  }

  const handlePdf = () => {
    if (METODICHESKIE_PDF) window.open(METODICHESKIE_PDF, '_blank')
  }

  return (
    <AppShell>
      <div className="page-slide" style={{ background: bg }}>
        <div className="list-content">
          <div className="page-header-text">Справочный блок</div>
          <div className="nav-list">
            <div
              className={`nav-item${METODICHESKIE_PDF ? '' : ' nav-item--soon'}`}
              onClick={handlePdf}
            >
              <span className="nav-item-text">Методические рекомендации</span>
              <span className="nav-arrow">{METODICHESKIE_PDF ? '↗' : '📄'}</span>
            </div>
            {linkedItems.map((item, i) => (
              <div key={i} className="nav-item" onClick={() => handleClick(item.link)}>
                <span className="nav-item-text">{item.text}</span>
                <span className="nav-arrow">▸</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
