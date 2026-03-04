import { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import HomePage from './pages/HomePage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'

// Simple hash-based navigation (no react-router needed)
export default function App() {
  const [page, setPage] = useState('home')
  const [trainedModels, setTrainedModels] = useState([])

  const addTrainedModel = (result) => {
    setTrainedModels(prev => [result, ...prev])
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar currentPage={page} onNavigate={setPage} />
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {page === 'home' && (
          <HomePage 
            trainedModels={trainedModels} 
            onModelTrained={addTrainedModel} 
          />
        )}
        {page === 'history' && (
          <HistoryPage trainedModels={trainedModels} />
        )}
      </main>
    </div>
  )
}
