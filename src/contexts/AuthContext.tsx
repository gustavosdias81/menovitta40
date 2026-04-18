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
    if (user) await fetchProfile(user.id)
  }

  const marcarQuizCompleto = () => {
    if (user?.id) localStorage.setItem(`quiz_done_${user.id}`, '1')
    setQuizDone(true)
  }

  useEffect(() => {
    let mounted = true

    // Timeout de segurança — nunca trava na tela de carregamento
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth timeout — forçando carregamento')
        setLoading(false)
      }
    }, 8000)

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // ── CRÍTICO: verificar localStorage ANTES de setLoading(false) ──
          // Sem isso, há uma janela onde loading=false mas quizDone=false,
          // fazendo o guard redirecionar para /quiz e desmontar o Layout.
          const localDone = localStorage.getItem(`quiz_done_${session.user.id}`) === '1'
          if (localDone) setQuizDone(true)

          // Busca perfil (e já atualiza quizDone via fetchProfile se quiz_completo=true)
          await fetchProfile(session.user.id)
        }
      } catch (err) {
        console.error('Erro auth:', err)
      } finally {
        if (mounted) {
          clearTimeout(timeout)
          setLoading(false) // quizDone já está correto aqui
        }
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
      await supabase.from('profiles').upsert({
        user_id: data.user.id,
        email,
        nome,
        quiz_completo: false,
        is_admin: false,
        ativo: true,
      }, { onConflict: 'user_id' })
    }
    return { error: error as Error | null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
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
