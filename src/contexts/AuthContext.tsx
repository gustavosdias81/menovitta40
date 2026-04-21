import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
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
  const [quizDone, setQuizDone] = useState(false)

  // Busca perfil e já atualiza quizDone se profile.quiz_completo = true
  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      if (data) {
        setProfile(data as Profile)
        if ((data as Profile).quiz_completo === true) setQuizDone(true)
      }
    } catch (err) {
      console.error('Erro perfil:', err)
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
    // Limpa marcador local de quiz antes de logout — evita estado residual
    // caso outra usuária faça login no mesmo dispositivo
    if (user?.id) {
      try { localStorage.removeItem(`quiz_done_${user.id}`) } catch { /* ignora */ }
    }
    await supabase.auth.signOut()
    setProfile(null)
    setQuizDone(false)
  }

  return (
    <AuthContext.Provider value={{
      user, session, profile, loading,
      isAdmin: profile?.is_admin ?? false,
      quizCompleto: quizDone,
      signIn, signUp, signOut, refreshProfile, setProfile, marcarQuizCompleto,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
