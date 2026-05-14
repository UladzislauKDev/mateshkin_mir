import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { useBgTheme } from '../lib/bgTheme'
import './pages.css'

export default function MenuPage() {
  const navigate = useNavigate()
  const { bg } = useBgTheme()
  return (
    <AppShell>
      <div className="page-slide" style={{ background: bg }}>
        <div className="menu-header-text">Выберите раздел</div>
        <div className="menu-content">
          <div className="menu-card" onClick={() => navigate('/categories')}>
            <div className="menu-icon">📚</div>
            <div className="menu-label">Задания</div>
          </div>
          <div className="menu-card" onClick={() => navigate('/reference')}>
            <div className="menu-icon">📖</div>
            <div className="menu-label">Справочный блок</div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
