import { Routes, Route } from 'react-router-dom'
import TitlePage from './pages/TitlePage'
import MenuPage from './pages/MenuPage'
import CategoriesPage from './pages/CategoriesPage'
import TasksPage from './pages/TasksPage'
import SlidePage from './pages/SlidePage'
import ReferencePage from './pages/ReferencePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TitlePage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/categories/:slideId" element={<TasksPage />} />
      <Route path="/reference" element={<ReferencePage />} />
      <Route path="/slide/:id" element={<SlidePage />} />
    </Routes>
  )
}
