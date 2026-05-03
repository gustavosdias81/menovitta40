import { useAuth } from '../contexts/AuthContext'
import { Wifi } from 'lucide-react'

/**
 * Banner discreto que aparece na base da tela quando o banco Supabase
 * está saindo do cold start (plano gratuito).
 *
 * Aparece apenas se a query demorar mais de 2 segundos — a maioria
 * das sessões (banco já quente) nunca verá este banner.
 */
export default function DbWakeBanner() {
  const { dbAcordando } = useAuth()

  if (!dbAcordando) return null

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="flex items-center gap-2.5 bg-gray-800/90 backdrop-blur-sm text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg animate-fade-in">
        {/* Ícone pulsante */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ouro-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ouro-400" />
        </span>
        <Wifi size={13} className="text-ouro-300" />
        Conectando ao servidor... ☕
      </div>
    </div>
  )
}
