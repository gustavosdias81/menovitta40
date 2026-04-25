import { createClient } from '@supabase/supabase-js'

// ============================================================
// CONFIGURAÇÃO SUPABASE
// ============================================================
// Substitua pelas suas credenciais do projeto Supabase
// Acesse: https://supabase.com/dashboard → Settings → API
// ============================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas no .env')
}

// Fetch com timeout de 10s — evita que queries fiquem penduradas para sempre
// quando o banco do Supabase está dormindo (plano gratuito tem cold start).
const fetchComTimeout = (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 25_000)
  
  // Se o Supabase ou o navegador enviar um signal para cancelar a req,
  // repassamos esse cancelamento para o nosso controller interno.
  if (options?.signal) {
    options.signal.addEventListener('abort', () => controller.abort())
  }
  
  return fetch(url as RequestInfo, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer))
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: fetchComTimeout },
})

// ============================================================
// FUNÇÕES AUXILIARES DE BANCO
// ============================================================

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single()
  return { data, error }
}

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function saveAnamnese(userId: string, respostas: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('anamnese_respostas')
    .upsert(
      { user_id: userId, ...respostas },
      { onConflict: 'user_id' }
    )
    .select()
    .single()
  return { data, error }
}

export async function getAnamnese(userId: string) {
  const { data, error } = await supabase
    .from('anamnese_respostas')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export async function getPlanoAcao(userId: string) {
  const { data, error } = await supabase
    .from('planos_acao')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export async function upsertPlanoAcao(userId: string, plano: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('planos_acao')
    .upsert(
      { user_id: userId, ...plano, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    .select()
    .single()
  return { data, error }
}

export async function saveFoodLog(log: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('food_logs')
    .insert(log)
    .select()
    .single()
  return { data, error }
}

export async function getFoodLogs(userId: string, data?: string) {
  let query = supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (data) {
    query = query.eq('data', data)
  }

  const { data: logs, error } = await query
  return { data: logs, error }
}

export async function getCommunityPosts(limit = 50) {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data, error }
}

export async function createCommunityPost(post: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('community_posts')
    .insert(post)
    .select()
    .single()
  return { data, error }
}

// ── TREINO LOGS ──────────────────────────────────────────────────────────────

export async function saveTreinoLog(log: {
  user_id: string
  data: string
  foco: string
  duracao: string
  local: string
}) {
  const { data, error } = await supabase
    .from('treino_logs')
    .upsert(log, { onConflict: 'user_id,data' })
    .select()
    .single()
  return { data, error }
}

export async function getTreinoLogs(userId: string, limite = 60) {
  const { data, error } = await supabase
    .from('treino_logs')
    .select('*')
    .eq('user_id', userId)
    .order('data', { ascending: false })
    .limit(limite)
  return { data, error }
}

// ── NOTIFICAÇÕES ─────────────────────────────────────────────────────────────

export async function getNotificacoes(userId: string) {
  const { data, error } = await supabase
    .from('notificacoes')
    .select('*')
    .or(`destinatario_id.eq.${userId},destinatario_id.is.null`)
    .eq('lida', false)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function createNotificacao(notif: { destinatario_id?: string | null; titulo: string; mensagem: string; tipo: string }) {
  const { data, error } = await supabase
    .from('notificacoes')
    .insert(notif)
    .select()
    .single()
  return { data, error }
}

export async function marcarNotificacaoLida(id: string) {
  const { error } = await supabase
    .from('notificacoes')
    .update({ lida: true })
    .eq('id', id)
  return { error }
}

export async function getNotificacoesAdmin(limit = 10) {
  const { data, error } = await supabase
    .from('notificacoes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data, error }
}

export async function getTreinoLogsAdmin(userId: string) {
  const { data, error } = await supabase
    .from('treino_logs')
    .select('*')
    .eq('user_id', userId)
    .order('data', { ascending: false })
    .limit(60)
  return { data, error }
}

export async function getFoodLogsAdmin(userId: string, days = 7) {
  const from = new Date()
  from.setDate(from.getDate() - days)
  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('data', from.toISOString().split('T')[0])
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function toggleAtivoAluna(userId: string, ativo: boolean) {
  const { error } = await supabase
    .from('profiles')
    .update({ ativo, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
  return { error }
}

// ── CURTIDAS ──────────────────────────────────────────────────────────────────

export async function toggleCurtida(postId: string, incremento: number) {
  const { data, error } = await supabase.rpc('incrementar_curtida', {
    post_id: postId,
    incremento
  })
  return { data, error }
}

// ── ARTIGOS CIENTÍFICOS ───────────────────────────────────────────────────────

export async function getArtigos(apenasPublicados = true) {
  let query = supabase
    .from('artigos')
    .select('*')
    .order('data_pub', { ascending: false })
  if (apenasPublicados) {
    query = query.eq('publicado', true)
  }
  const { data, error } = await query
  return { data, error }
}

export async function getArtigo(id: string) {
  const { data, error } = await supabase
    .from('artigos')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

export async function upsertArtigo(artigo: Record<string, unknown>) {
  const { id, ...rest } = artigo
  const payload = { ...rest, updated_at: new Date().toISOString() }
  if (id) {
    const { data, error } = await supabase
      .from('artigos')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
  const { data, error } = await supabase
    .from('artigos')
    .insert(payload)
    .select()
    .single()
  return { data, error }
}

export async function deleteArtigo(id: string) {
  const { error } = await supabase
    .from('artigos')
    .delete()
    .eq('id', id)
  return { error }
}

// ── MODERAÇÃO COMUNIDADE ──────────────────────────────────────────────────────

export async function getAllCommunityPosts(limit = 100) {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data, error }
}

export async function moderarPost(postId: string, updates: { pinado?: boolean; oculto?: boolean }) {
  const { data, error } = await supabase
    .from('community_posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single()
  return { data, error }
}

export async function deleteCommunityPost(postId: string) {
  const { error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', postId)
  return { error }
}

// ── RANKING MENSAL ────────────────────────────────────────────────────────────

export interface RankingEntry {
  user_id: string
  nome: string
  primeiroNome: string
  nickname?: string
  treinos: number
  posicao: number
}

export async function getRankingMensal(limite = 10): Promise<{ data: RankingEntry[] | null; error: unknown }> {
  try {
    const mesAtual = new Date().toISOString().slice(0, 7) // ex: "2026-04"
    const inicioMes = `${mesAtual}-01`
    const fimMes = new Date(new Date(inicioMes).getFullYear(), new Date(inicioMes).getMonth() + 1, 0)
      .toISOString()
      .split('T')[0]

    // Busca logs do mês atual
    const { data: logs, error: logsError } = await supabase
      .from('treino_logs')
      .select('user_id, data')
      .gte('data', inicioMes)
      .lte('data', fimMes)

    if (logsError || !logs) return { data: null, error: logsError }

    // Agrupa por user_id no cliente
    const contagem: Record<string, number> = {}
    logs.forEach(l => {
      contagem[l.user_id] = (contagem[l.user_id] || 0) + 1
    })

    // Ordena e pega top N
    const topUsers = Object.entries(contagem)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limite)

    if (!topUsers.length) return { data: [], error: null }

    // Busca perfis dos top users
    const userIds = topUsers.map(([id]) => id)
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('user_id, nome, nickname')
      .in('user_id', userIds)

    if (profError) return { data: null, error: profError }

    const profileMap: Record<string, { nome: string; nickname?: string }> = {}
    profiles?.forEach(p => { profileMap[p.user_id] = { nome: p.nome || 'Aluna', nickname: p.nickname } })

    const ranking: RankingEntry[] = topUsers.map(([user_id, treinos], idx) => {
      const p = profileMap[user_id] || { nome: 'Aluna' }
      const primeiroNome = p.nome.split(' ')[0]
      return { user_id, nome: p.nome, primeiroNome, nickname: p.nickname, treinos, posicao: idx + 1 }
    })

    return { data: ranking, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}
