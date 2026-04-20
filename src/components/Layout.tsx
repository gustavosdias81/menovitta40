import { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { User, ClipboardList, Camera, Users, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getNotificacoes, marcarNotificacaoLida } from '../lib/supabase'
import type { Notificacao } from '../types'

const NAV_ITEMS = [
  { path: '/perfil', label: 'Perfil', icon: User },
  { path: '/plano', label: 'Plano', icon: ClipboardList },
  { path: '/scanner', label: 'Nutrição', icon: Camera },
  { path: '/comunidade', label: 'Social', icon: Users },
  { path: '/configuracoes', label: 'Config', icon: Settings },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [modalNotif, setModalNotif] = useState<Notificacao | null>(null)

  // Scroll ao topo a cada troca de aba
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname])

  useEffect(() => {
    if (!user) return

    const verificarNotificacoes = async () => {
      const { data } = await getNotificacoes(user.id)
      if (data && data.length > 0) {
        const lista = data as Notificacao[]
        setNotificacoes(lista)
        setModalNotif(lista[0])
      }
    }

    verificarNotificacoes()
  }, [user?.id])

  const handleEntendido = async () => {
    if (!modalNotif) return
    await marcarNotificacaoLida(modalNotif.id)
    const restante = notificacoes.filter(n => n.id !== modalNotif.id)
    setNotificacoes(restante)
    setModalNotif(restante.length > 0 ? restante[0] : null)
  }

  const temNotificacoes = notificacoes.length > 0

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Modal de notificação */}
      {modalNotif && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-safe">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 mb-6 animate-slide-up">
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                modalNotif.tipo === 'treino' ? 'bg-orange-100 text-orange-500' :
                modalNotif.tipo === 'nutricao' ? 'bg-green-100 text-green-500' :
                modalNotif.tipo === 'motivacao' ? 'bg-purple-100 text-purple-500' :
                'bg-blue-100 text-blue-500'
              }`}>
                <span className="text-lg">
                  {modalNotif.tipo === 'treino' ? '💪' :
                   modalNotif.tipo === 'nutricao' ? '🥗' :
                   modalNotif.tipo === 'motivacao' ? '✨' : 'ℹ️'}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{modalNotif.titulo}</p>
                <p className="text-xs text-gray-500 mt-0.5">{new Date(modalNotif.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{modalNotif.mensagem}</p>
            <button
              onClick={handleEntendido}
              className="btn-primary w-full"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

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
            const isConfig = item.path === '/configuracoes'

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`bottom-nav-item flex-1 py-2.5 relative ${
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
                  <div className="relative inline-flex">
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                    {isConfig && temNotificacoes && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
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
