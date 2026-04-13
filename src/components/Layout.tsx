import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { User, ClipboardList, Camera, Users, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/perfil', label: 'Perfil', icon: User },
  { path: '/plano', label: 'Plano', icon: ClipboardList },
  { path: '/scanner', label: 'Scanner', icon: Camera },
  { path: '/comunidade', label: 'Social', icon: Users },
  { path: '/configuracoes', label: 'Config', icon: Settings },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Page content */}
      <main className="pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 pb-safe z-40">
        <div className="max-w-md mx-auto flex items-stretch justify-around">
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            const isScanner = item.path === '/scanner'

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`bottom-nav-item flex-1 py-2.5 ${
                  isActive ? 'bottom-nav-active' : 'bottom-nav-inactive'
                }`}
              >
                {isScanner ? (
                  <div className={`w-11 h-11 -mt-5 rounded-full flex items-center justify-center shadow-lg ${
                    isActive
                      ? 'bg-rosa-500 text-white'
                      : 'bg-white text-gray-400 border border-gray-200'
                  }`}>
                    <Icon size={20} />
                  </div>
                ) : (
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                )}
                <span className={`text-[10px] ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
