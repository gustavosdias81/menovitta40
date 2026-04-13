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

export async function toggleCurtida(postId: string, incremento: number) {
  const { data, error } = await supabase.rpc('incrementar_curtida', {
    post_id: postId,
    incremento
  })
  return { data, error }
}
