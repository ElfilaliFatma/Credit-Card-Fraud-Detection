import { Shield, Activity, Clock, BarChart3 } from 'lucide-react'

export default function Navbar({ currentPage, onNavigate }) {
  const links = [
    { id: 'home', label: 'Dashboard' },
    { id: 'history', label: 'History' },
  ]

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <span style={{ fontFamily: 'Syne, sans-serif' }} className="text-white font-bold text-lg">
                FraudGuard
              </span>
              <span className="text-slate-500 text-xs ml-2 hidden sm:inline">ML Platform</span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {links.map(link => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === link.id
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Status indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 bg-emerald-400 rounded-full pulse-ring" />
            <span className="hidden sm:inline">API Connected</span>
          </div>
        </div>
      </div>
    </header>
  )
}
