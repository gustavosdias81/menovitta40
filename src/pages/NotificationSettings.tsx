import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Bell, Clock, AlertCircle, Check } from 'lucide-react'
import {
  requestNotificationPermission,
  getNotificationPermission,
  agendarNotificacaoDiaria,
  testarNotificacao,
  cancelarNotificacoes,
} from '../lib/notifications'
import { supabase } from '../lib/supabase'

export default function NotificationSettings() {
  const { profile, setProfile } = useAuth()
  const navigate = useNavigate()

  // Estado local
  const [horarioTreino, setHorarioTreino] = useState(profile?.horario_treino || '06:30')
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(profile?.notif_treino_ativada ?? false)
  const [permissaoGranted, setPermissaoGranted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [tipoMensagem, setTipoMensagem] = useState<'sucesso' | 'erro' | 'info'>('info')

  // Verificar permissão ao carregar
  useEffect(() => {
    const perm = getNotificationPermission()
    setPermissaoGranted(perm === 'granted')
  }, [])

  // Solicitar permissão
  const handleRequestPermission = async () => {
    try {
      setLoading(true)
      const granted = await requestNotificationPermission()
      setPermissaoGranted(granted)
      if (granted) {
        setMensagem('✅ Permissão concedida! Notificações ativadas.')
        setTipoMensagem('sucesso')
      } else {
        setMensagem('❌ Você não concedeu permissão para notificações.')
        setTipoMensagem('erro')
      }
    } catch (err) {
      console.error('Erro ao solicitar permissão:', err)
      setMensagem('❌ Erro ao solicitar permissão.')
      setTipoMensagem('erro')
    } finally {
      setLoading(false)
    }
  }

  // Salvar preferências
  const handleSalvar = async () => {
    if (!profile?.user_id) return

    try {
      setLoading(true)

      // Se vai ativar notificações, validar permissão
      if (notificacoesAtivas && !permissaoGranted) {
        setMensagem('⚠️ Conceda permissão para notificações primeiro.')
        setTipoMensagem('info')
        setLoading(false)
        return
      }

      // Salvar no banco de dados
      const { error } = await supabase
        .from('profiles')
        .update({
          horario_treino: horarioTreino,
          notif_treino_ativada: notificacoesAtivas,
        })
        .eq('user_id', profile.user_id)

      if (error) throw error

      // Atualizar estado local
      setProfile(prev => prev ? {
        ...prev,
        horario_treino: horarioTreino,
        notif_treino_ativada: notificacoesAtivas,
      } : null)

      // Se ativou notificações, agendar
      if (notificacoesAtivas) {
        agendarNotificacaoDiaria(
          horarioTreino,
          '⏰ Hora do Treino!',
          {
            body: 'Seu treino do dia está esperando por você! 💪',
            icon: '/logo.png',
            badge: '/logo-badge.png',
          }
        )
        setMensagem('✅ Notificações agendadas com sucesso!')
      } else {
        // Se desativou, cancelar notificações
        cancelarNotificacoes()
        setMensagem('✅ Notificações canceladas.')
      }
      setTipoMensagem('sucesso')

      // Fechar após 2 segundos
      setTimeout(() => navigate('/configuracoes'), 2000)
    } catch (err) {
      console.error('Erro ao salvar:', err)
      setMensagem('❌ Erro ao salvar preferências.')
      setTipoMensagem('erro')
    } finally {
      setLoading(false)
    }
  }

  // Testar notificação
  const handleTestar = () => {
    if (!permissaoGranted) {
      setMensagem('⚠️ Conceda permissão para testar notificações.')
      setTipoMensagem('info')
      return
    }
    testarNotificacao()
    setMensagem('✅ Notificação de teste enviada!')
    setTipoMensagem('sucesso')
  }

  return (
    <div className="page-container">
      <button
        onClick={() => navigate('/configuracoes')}
        className="mb-4 text-rosa-500 hover:text-rosa-600 flex items-center gap-1 text-sm"
      >
        ← Voltar
      </button>

      <h1 className="page-title">Notificações de Treino</h1>
      <p className="page-subtitle">Receba lembretes para não perder seus treinos</p>

      {/* Mensagem de Feedback */}
      {mensagem && (
        <div
          className={`card mb-4 flex items-start gap-3 ${
            tipoMensagem === 'sucesso'
              ? 'bg-green-50 border-green-200'
              : tipoMensagem === 'erro'
              ? 'bg-red-50 border-red-200'
              : 'bg-blue-50 border-blue-200'
          }`}
        >
          <div
            className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
              tipoMensagem === 'sucesso'
                ? 'bg-green-500 text-white'
                : tipoMensagem === 'erro'
                ? 'bg-red-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            {tipoMensagem === 'sucesso' ? (
              <Check size={12} />
            ) : (
              <AlertCircle size={12} />
            )}
          </div>
          <p
            className={`text-sm ${
              tipoMensagem === 'sucesso'
                ? 'text-green-700'
                : tipoMensagem === 'erro'
                ? 'text-red-700'
                : 'text-blue-700'
            }`}
          >
            {mensagem}
          </p>
        </div>
      )}

      {/* Seção: Permissão */}
      <div className="card mb-4">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Bell size={18} className="text-rosa-500" />
          Permissão de Notificações
        </h2>

        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-3">
          <div>
            <p className="text-sm font-medium text-gray-700">
              {permissaoGranted ? '✅ Ativadas' : '❌ Desativadas'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {permissaoGranted
                ? 'Você receberá notificações do Menovitta'
                : 'Seu navegador precisa de permissão'}
            </p>
          </div>
          <button
            onClick={handleRequestPermission}
            disabled={permissaoGranted || loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              permissaoGranted
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-rosa-500 text-white hover:bg-rosa-600'
            }`}
          >
            {permissaoGranted ? 'Concedida' : 'Conceder'}
          </button>
        </div>

        <p className="text-xs text-gray-500">
          💡 Dica: Se recusar aqui, abra as configurações do seu navegador para alterar
          depois.
        </p>
      </div>

      {/* Seção: Horário do Treino */}
      <div className="card mb-4">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Clock size={18} className="text-ouro-500" />
          Horário do Treino
        </h2>

        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block mb-2">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Em que horário você treina?
            </p>
            <input
              type="time"
              value={horarioTreino}
              onChange={e => setHorarioTreino(e.target.value)}
              disabled={!permissaoGranted}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rosa-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Você receberá um lembrete diariamente neste horário
          </p>
        </div>
      </div>

      {/* Seção: Ativar/Desativar */}
      <div className="card mb-4">
        <h2 className="font-semibold text-gray-800 mb-3">Status das Notificações</h2>

        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-700">
              {notificacoesAtivas ? '✅ Ativadas' : '❌ Desativadas'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {notificacoesAtivas
                ? `Lembrete diário às ${horarioTreino}`
                : 'Você não receberá notificações'}
            </p>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={() => setNotificacoesAtivas(!notificacoesAtivas)}
            disabled={!permissaoGranted || loading}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              notificacoesAtivas ? 'bg-rosa-500' : 'bg-gray-300'
            } ${!permissaoGranted || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                notificacoesAtivas ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Seção: Ações */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Ações</h2>

        <div className="space-y-2">
          <button
            onClick={handleTestar}
            disabled={!permissaoGranted || loading}
            className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              permissaoGranted && !loading
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            🧪 Testar Notificação
          </button>

          <button
            onClick={handleSalvar}
            disabled={loading}
            className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              loading
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-rosa-500 text-white hover:bg-rosa-600'
            }`}
          >
            {loading ? '⏳ Salvando...' : '✅ Salvar Preferências'}
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
        <p className="font-medium mb-1">ℹ️ Como funciona</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Notificações funcionam quando o app está aberto (PWA local)</li>
          <li>Se precisar de notificações 24/7, atualizaremos para Web Push</li>
          <li>Seu horário é salvo na sua conta e sincronizado em todos os devices</li>
          <li>Você pode desativar a qualquer momento</li>
        </ul>
      </div>
    </div>
  )
}
