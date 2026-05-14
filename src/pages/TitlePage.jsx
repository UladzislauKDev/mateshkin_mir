import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import './pages.css'

const BASE = import.meta.env.BASE_URL

export default function TitlePage() {
  const navigate = useNavigate()
  return (
    <AppShell>
      <div className="page-slide">
        <img className="page-bg" src={`${BASE}images/image1.JPG`} alt="" draggable={false} />
        <div className="title-content">
          <div className="title-text">Матешкин мир</div>
          <button className="start-btn" onClick={() => navigate('/menu')}>
            НАЧАТЬ
          </button>
        </div>
      </div>
    </AppShell>
  )
}
