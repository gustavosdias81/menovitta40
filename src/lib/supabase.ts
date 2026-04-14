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

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
