import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Positions from './pages/Positions'
import { BarChart3, Table } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'positions', label: 'Positions', icon: Table },
  ]

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Tab Navigation */}
      <div className="bg-bg-secondary border-b border-border-primary">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2
                    ${isActive
                      ? 'text-accent-blue border-accent-blue'
                      : 'text-text-tertiary border-transparent hover:text-text-secondary hover:border-border-primary'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'positions' && <Positions />}
      </div>
    </div>
  )
}

export default App
