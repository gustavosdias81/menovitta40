// ── Notificações Push Locais (PWA) ────────────────────────────────────────

/**
 * Solicita permissão para enviar notificações push ao usuário
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Notificações não suportadas neste navegador')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

/**
 * Obtém status atual de permissão de notificações
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied'
  return Notification.permission
}

/**
 * Agenda uma notificação local para um horário específico
 * @param horario - Formato "HH:MM" (ex: "06:30")
 * @param titulo - Título da notificação
 * @param opcoes - Opções adicionais (ícone, badge, etc)
 */
export function agendarNotificacaoDiaria(
  horario: string,
  titulo: string = '⏰ Hora do Treino!',
  opcoes: NotificationOptions = {}
) {
  if (getNotificationPermission() !== 'granted') {
    console.warn('Permissão de notificação não concedida')
    return
  }

  // Parser do horário (HH:MM)
  const [horas, minutos] = horario.split(':').map(Number)
  if (isNaN(horas) || isNaN(minutos)) {
    console.error('Formato de horário inválido. Use HH:MM')
    return
  }

  // Calcula tempo até o próximo disparo
  const agora = new Date()
  const proximoDisparo = new Date()
  proximoDisparo.setHours(horas, minutos, 0, 0)

  // Se já passou o horário hoje, agenda para amanhã
  if (proximoDisparo <= agora) {
    proximoDisparo.setDate(proximoDisparo.getDate() + 1)
  }

  const msAtéDisparo = proximoDisparo.getTime() - agora.getTime()

  // Agenda a primeira notificação
  setTimeout(() => {
    enviarNotificacao(titulo, opcoes)
    // Depois agenda para repetir diariamente (24h = 86.400.000 ms)
    setInterval(() => {
      enviarNotificacao(titulo, opcoes)
    }, 24 * 60 * 60 * 1000)
  }, msAtéDisparo)

  console.log(
    `✅ Notificação agendada para ${horario} todos os dias`,
    `Próximo disparo: ${proximoDisparo.toLocaleTimeString('pt-BR')}`
  )
}

/**
 * Envia uma notificação imediata
 */
export function enviarNotificacao(
  titulo: string,
  opcoes: NotificationOptions = {}
) {
  if (getNotificationPermission() !== 'granted') {
    console.warn('Permissão não concedida')
    return
  }

  const notif = new Notification(titulo, {
    icon: '/logo.png', // Ícone do app
    badge: '/logo-badge.png',
    tag: 'menovitta-notif',
    requireInteraction: false, // Permite auto-fechar
    ...opcoes,
  })

  // Ao clicar, abre o app
  notif.onclick = () => {
    window.focus()
    notif.close()
  }

  // Auto-fecha após 5 segundos
  setTimeout(() => notif.close(), 5000)
}

/**
 * Cancela todas as notificações agendadas
 * Nota: Para notificações verdadeiramente recorrentes, seria necessário
 * usar Service Worker + Web Push API. Esta versão funciona enquanto
 * o navegador/PWA estiver aberto.
 */
export function cancelarNotificacoes() {
  // Fecha qualquer notificação ativa
  Notification.close?.()
  console.log('Notificações canceladas')
}

/**
 * Testa notificação (para debug)
 */
export function testarNotificacao() {
  if (getNotificationPermission() !== 'granted') {
    console.warn('Permissão não concedida. Solicite primeiro.')
    return
  }

  enviarNotificacao('🧪 Teste de Notificação Menovitta', {
    body: 'Se você viu isso, as notificações estão funcionando! ✅',
  })
}
