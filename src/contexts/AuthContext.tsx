import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, wakeUpSupabase } from '../lib/supabase'
import type { Profile } from '../types'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  profileFetched: boolean  // true após o banco responder (evita redirect prematuro no admin)
  dbAcordando: boolean   // true quando o banco está saindo do cold start
  isAdmin: boolean
  quizCompleto: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, nome: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>
  marcarQuizCompleto: () => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileFetched, setProfileFetched] = useState(false)
  const [dbAcordando, setDbAcordando] = useState(false)
  const [quizDone, setQuizDone] = useState(false)

  // Busca perfil — padrão stale-while-revalidate:
  // 1) Mostra cache do localStorage IMEDIATAMENTE (zero espera)
  // 2) Busca dado fresco do banco em background
  // 3) Atualiza tela e cache quando o banco responder
  const fetchProfile = async (userId: string) => {
    const cacheKey = `menovitta_profile_${userId}`

    // ── Passo 1: carregar cache imediatamente ──
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached) as Profile
        setProfile(parsed)
        if (parsed.quiz_completo === true) setQuizDone(true)
      }
    } catch { /* cache corrompido — ignora */ }

    // ── Passo 2: buscar dado fresco do banco ──
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      if (data) {
        setProfile(data as Profile)
        if ((data as Profile).quiz_completo === true) setQuizDone(true)
        // Atualiza cache com dado fresco
        try { localStorage.setItem(cacheKey, JSON.stringify(data)) } catch { /* ignora */ }
      }
    } catch (err) {
      console.error('Erro perfil:', err)
      // Se falhou mas temos cache, o app já está mostrando o perfil — ok
    } finally {
      // Sinaliza que a consulta ao banco foi concluída (sucesso ou falha)
      // ProtectedRoute usa isso para não redirecionar antes do is_admin real chegar
      setProfileFetched(true)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  // Garante que a aba Perfil não trave: se há usuário mas profile é null,
  // o token de sessão foi renovado — busca o perfil silenciosamente.
  useEffect(() => {
    if (user && !profile && !loading) {
      fetchProfile(user.id)
    }
  }, [user?.id, loading]) // eslint-disable-line react-hooks/exhaustive-deps

  const marcarQuizCompleto = () => {
    if (user?.id) localStorage.setItem(`quiz_done_${user.id}`, '1')
    setQuizDone(true)
  }

  useEffect(() => {
    let mounted = true

    // Timeout de segurança — nunca trava na tela de carregamento
    // 3s é suficiente para getSession() (auth, sem banco) — fetchProfile
    // roda em background e não precisa deste timeout.
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth timeout — forçando carregamento')
        setLoading(false)
      }
    }, 3000)

    const init = async () => {
      // ── Wake-up ping: acorda o banco ANTES de qualquer query real ──
      // Fire-and-forget — não bloqueia o loading principal.
      // Se demorar > 2s para responder, ativa o banner "Conectando..."
      wakeUpSupabase(
        () => { if (mounted) setDbAcordando(true) },   // banco demorando → mostra aviso
        () => { if (mounted) setDbAcordando(false) },  // banco respondeu → esconde aviso
      )

      let sessionUser: import('@supabase/supabase-js').User | null = null
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return

        sessionUser = session?.user ?? null
        setSession(session)
        setUser(sessionUser)

        if (sessionUser) {
          // Verificar localStorage ANTES de setLoading(false) para evitar
          // janela onde quizDone=false causa redirect para /quiz.
          const localDone = localStorage.getItem(`quiz_done_${sessionUser.id}`) === '1'
          if (localDone) setQuizDone(true)
        }
      } catch (err) {
        console.error('Erro auth:', err)
      } finally {
        // ── CRÍTICO: libera o spinner ANTES de buscar o perfil ──
        // getSession() é rápido (< 300ms). fetchProfile() pode demorar
        // 20-60s no plano gratuito (banco dormindo). Separar os dois
        // faz o app aparecer quase instantaneamente para o usuário.
        if (mounted) {
          clearTimeout(timeout)
          setLoading(false)
        }
      }

      // Busca o perfil em segundo plano — não bloqueia a UI
      if (mounted && sessionUser) {
        await fetchProfile(sessionUser.id)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        // INITIAL_SESSION já é tratado por init() — ignorar para evitar race condition
        if (event === 'INITIAL_SESSION') return

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // Novo login: verificar localStorage imediatamente
          if (event === 'SIGNED_IN') {
            const localDone = localStorage.getItem(`quiz_done_${session.user.id}`) === '1'
            if (localDone) setQuizDone(true)
          }
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  const signUp = async (email: string, password: string, nome: string) => {
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { nome } }
    })
    // Cria linha na tabela profiles logo após o cadastro
    if (!error && data.user) {
      const { error: upsertError } = await supabase.from('profiles').upsert({
        user_id: data.user.id,
        email,
        nome,
        quiz_completo: false,
        is_admin: false,
        ativo: true,
      }, { onConflict: 'user_id' })
      if (upsertError) {
        console.error('Erro ao criar perfil:', upsertError)
        return { error: upsertError as unknown as Error }
      }
      // Já busca o profile recém-criado para evitar race na primeira tela
      await fetchProfile(data.user.id)
    }
    return { error: error as Error | null }
  }

  const signOut = async () => {
    // Remove apenas o cache de perfil (dados sensíveis).
    // quiz_done é preservado por user_id — evita que cold-start do banco
    // redirecione a usuária para /quiz no próximo login.
    if (user?.id) {
      try {
        localStorage.removeItem(`menovitta_profile_${user.id}`)
      } catch { /* ignora */ }
    }
    await supabase.auth.signOut()
    setProfile(null)
    setQuizDone(false)
  }

  return (
    <AuthContext.Provider value={{
      user, session, profile, loading, profileFetched, dbAcordando,
      isAdmin: profile?.is_admin ?? false,
      quizCompleto: quizDone,
      signIn, signUp, signOut, refreshProfile, setProfile, marcarQuizCompleto,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
