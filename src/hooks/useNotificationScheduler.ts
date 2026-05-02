import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { agendarNotificacaoDiaria, getNotificationPermission } from '../lib/notifications'

/**
 * Hook que agenda notificações de treino quando o usuário faz login
 * Executa uma única vez ao carregar o app
 */
export function useNotificationScheduler() {
  const { profile, loading } = useAuth()

  useEffect(() => {
    // Aguardar carregamento do perfil
    if (loading) return

    // Se usuário não autenticado, sair
    if (!profile) return

    // Se notificações desativadas, não fazer nada
    if (!profile.notif_treino_ativada) return

    // Se não tem horário definido, usar padrão (06:30)
    const horario = profile.horario_treino || '06:30'

    // Verificar permissão
    const permissao = getNotificationPermission()
    if (permissao !== 'granted') {
      console.log('Notificações: permissão não concedida, pulando agendamento')
      return
    }

    // Agendar notificação
    console.log(`📅 Agendando notificação para ${horario}`)
    agendarNotificacaoDiaria(
      horario,
      '⏰ Hora do Treino!',
      {
        body: 'Seu treino do dia está esperando por você! 💪',
        icon: '/logo.png',
        badge: '/logo-badge.png',
      }
    )
  }, [profile?.id, profile?.notif_treino_ativada, profile?.horario_treino, loading])
}
