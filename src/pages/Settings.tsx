import React from 'react'
import { useAuth } from '../contexts/AuthContext'

interface MenuItem {
  icon: React.ReactNode
  label: string
  desc: string
  action: () => void
  color: string
  badge?: string
  external?: boolean
}
interface MenuSection { section: string; items: MenuItem[] }
import { useNavigate } from 'react-router-dom'
import {
  LogOut, MessageCircle, HelpCircle, Shield,
  Bell, User, ChevronRight, Heart, ExternalLink,
  Crown
} from 'lucide-react'

export default function Settings() {
  const { profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Erro ao sair:', err)
    }
    window.location.href = '/login'
  }

  // Número do WhatsApp de suporte — configurável via VITE_SUPPORT_WHATSAPP no Vercel
  // Formato esperado: DDI+DDD+número sem símbolos (ex: 5511987654321)
  const whatsappNumber = import.meta.env.VITE_SUPPORT_WHATSAPP || '5511999999999'
  const whatsappMessage = encodeURIComponent(
    `Olá! Sou aluna do Menovitta 4.0. Preciso de ajuda.\n\nNome: ${profile?.nome}\nEmail: ${profile?.email}`
  )
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  const menuItems: MenuSection[] = [
    {
      section: 'Conta',
      items: [
        {
          icon: <User size={18} />,
          label: 'Meu Perfil',
          desc: 'Visualizar dados pessoais',
          action: () => navigate('/perfil'),
          color: 'text-rosa-500 bg-rosa-50',
        },
        {
          icon: <Bell size={18} />,
          label: 'Notificações',
          desc: 'Preferências de alertas',
          action: () => {},
          color: 'text-ouro-500 bg-ouro-50',
          badge: 'Em breve',
        },
      ],
    },
    {
      section: 'Suporte',
      items: [
        {
          icon: <MessageCircle size={18} />,
          label: 'Falar no WhatsApp',
          desc: 'Tire dúvidas com nossa equipe',
          action: () => window.open(whatsappLink, '_blank'),
          color: 'text-green-600 bg-green-50',
          external: true,
        },
        {
          icon: <HelpCircle size={18} />,
          label: 'Perguntas Frequentes',
          desc: 'Dúvidas comuns sobre o programa',
          action: () => {},
          color: 'text-blue-500 bg-blue-50',
          badge: 'Em breve',
        },
      ],
    },
    {
      section: 'Legal',
      items: [
        {
          icon: <Shield size={18} />,
          label: 'Termos de Uso',
          desc: 'Políticas e condições',
          action: () => {},
          color: 'text-gray-500 bg-gray-100',
        },
        {
          icon: <Shield size={18} />,
          label: 'Política de Privacidade',
          desc: 'Como protegemos seus dados',
          action: () => {},
          color: 'text-gray-500 bg-gray-100',
        },
      ],
    },
  ]

  return (
    <div className="page-container">
      <h1 className="page-title">Configurações</h1>
      <p className="page-subtitle">Gerencie sua conta e preferências</p>

      {/* Admin Badge */}
      {isAdmin && (
        <button
          onClick={() => navigate('/admin')}
          className="card w-full flex items-center gap-3 mb-4 bg-gradient-to-r from-ouro-50 to-ouro-100 border-ouro-200"
        >
          <div className="w-10 h-10 bg-ouro-400 rounded-xl flex items-center justify-center">
            <Crown size={18} className="text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-ouro-700 text-sm">Painel Administrativo</p>
            <p className="text-xs text-ouro-500">Gerenciar alunas e planos</p>
          </div>
          <ChevronRight size={18} className="text-ouro-400" />
        </button>
      )}

      {/* Menu Items */}
      {menuItems.map((section, si) => (
        <div key={si} className="mb-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
            {section.section}
          </h3>
          <div className="card p-0 divide-y divide-gray-50">
            {section.items.map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors first:rounded-t-3xl last:rounded-b-3xl"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>
                  {item.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                  <p className="text-[11px] text-gray-400">{item.desc}</p>
                </div>
                {item.badge ? (
                  <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                ) : item.external ? (
                  <ExternalLink size={14} className="text-gray-300" />
                ) : (
                  <ChevronRight size={16} className="text-gray-300" />
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Logout */}
      <button
        onClick={handleSignOut}
        className="card w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 transition-colors"
      >
        <LogOut size={18} />
        <span className="font-semibold text-sm">Sair da Conta</span>
      </button>

      {/* Footer */}
      <div className="text-center mt-6 pb-4">
        <div className="flex items-center justify-center gap-1 text-gray-300 text-xs">
          <Heart size={10} /> Menovitta 4.0
        </div>
        <p className="text-[10px] text-gray-300 mt-1">
          Versão 1.0.0 — Feito com carinho para mulheres incríveis
        </p>
      </div>
    </div>
  )
}
