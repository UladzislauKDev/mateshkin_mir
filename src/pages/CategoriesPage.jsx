import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { getNavItems, resolveSlideRoute } from '../lib/slideNav'
import { useBgTheme } from '../lib/bgTheme'
import './pages.css'

export default function CategoriesPage() {
  const navigate = useNavigate()
  const items = getNavItems(3)
  const { bg } = useBgTheme()

  const handleClick = (link) => {
    if (link.type === 'slide') navigate(resolveSlideRoute(link.value))
    else window.open(link.value, '_blank')
  }

  return (
    <AppShell>
      <div className="page-slide" style={{ background: bg }}>
        <div className="list-content">
          <div className="page-header-text">Задания</div>
          <div className="nav-list">
            {items.map((item, i) => (
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
