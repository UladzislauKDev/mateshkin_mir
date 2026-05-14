import { useNavigate, useParams, useLocation } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { getNavItems, resolveSlideRoute, getSlideTitle } from '../lib/slideNav'
import { useBgTheme } from '../lib/bgTheme'
import './pages.css'

export default function TasksPage() {
  const { slideId } = useParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const id = parseInt(slideId)
  const items = getNavItems(id)
  const title = getSlideTitle(id)
  const { bg } = useBgTheme()

  const handleClick = (link) => {
    if (link.type === 'slide') navigate(resolveSlideRoute(link.value), { state: { returnTo: pathname } })
    else window.open(link.value, '_blank')
  }

  return (
    <AppShell>
      <div className="page-slide" style={{ background: bg }}>
        <div className="list-content">
          {title && <div className="page-header-text">{title}</div>}
          <div className="nav-list">
            {items.map((item, i) => (
              <div key={i} className="nav-item" onClick={() => handleClick(item.link)}>
                <span className="nav-item-text">{item.text}</span>
                <span className="nav-arrow">
                  {item.link.type === 'url' ? '↗' : '▸'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
