import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loader2, WifiOff, Clock } from 'lucide-react'

interface Props {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: Props) {
  const { user, loading, isAdmin, profile, profileFetched } = useAuth()

  // Timeout de segurança: se o banco demorar mais de 12s, libera baseado no que temos
  const [adminCheckTimeout, setAdminCheckTimeout] = useState(false)
  useEffect(() => {
    if (!requireAdmin || profileFetched) return
    const t = setTimeout(() => setAdminCheckTimeout(true), 12_000)
    return () => clearTimeout(t)
  }, [requireAdmin, profileFetched])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-rosa-500 animate-spin" />
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/perfil" replace />
  }

  // Verifica se a conta está suspensa (apenas para não-admins)
  if (!isAdmin && profile?.ativo === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite px-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <WifiOff size={36} className="text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Acesso Suspenso</h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Seu acesso ao Menovitta foi temporariamente suspenso.
            Entre em contato com sua consultora para mais informações.
          </p>
          {profile.telefone && (
            <a
              href={`https://wa.me/55${profile.telefone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              Falar com Consultora
            </a>
          )}
        </div>
      </div>
    )
  }

  // Verifica se o acesso por tempo limitado expirou (apenas para não-admins)
  if (!isAdmin && profile?.acesso_expira) {
    const expira = new Date(profile.acesso_expira)
    const agora = new Date()
    // Considera o fim do dia de expiração (23:59:59)
    expira.setHours(23, 59, 59, 999)

    if (agora > expira) {
      const diasPassados = Math.floor((agora.getTime() - expira.getTime()) / (1000 * 60 * 60 * 24)) + 1
      return (
        <div className="min-h-screen flex items-center justify-center bg-offwhite px-6">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Clock size={36} className="text-amber-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">Período de Acesso Encerrado</h1>
            <p className="text-sm text-gray-500 mb-2 leading-relaxed">
              Seu período de acesso ao Menovitta encerrou há {diasPassados === 1 ? '1 dia' : `${diasPassados} dias`}.
            </p>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Entre em contato com sua consultora para renovar ou continuar no desafio! 🌸
            </p>
            {profile.telefone && (
              <a
                href={`https://wa.me/55${profile.telefone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                💬 Falar com Consultora
              </a>
            )}
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
