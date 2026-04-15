import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
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

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (data) {
        setProfile(data as Profile)
      } else if (!error) {
        // Nenhuma linha encontrada — cria o perfil automaticamente
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const { data: newProfile } = await supabase
            .from('profiles')
            .upsert({
              user_id: userId,
              email: authUser.email ?? '',
              nome: authUser.user_metadata?.nome ?? '',
              quiz_completo: false,
              is_admin: false,
              ativo: true,
            }, { onConflict: 'user_id' })
            .select()
            .maybeSingle()
          if (newProfile) setProfile(newProfile as Profile)
        }
      }
    } catch (err) {
      console.error('Erro perfil:', err)
    }
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id)
  }

  useEffect(() => {
    let mounted = true

    // Timeout de segurança — garante que nunca trava na tela de carregamento
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth timeout — forçando carregamento')
        setLoading(false)
      }
    }, 2000)

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) await fetchProfile(session.user.id)
      } catch (err) {
        console.error('Erro auth:', err)
      } finally {
        if (mounted) {
          clearTimeout(timeout)
          setLoading(false)
        }
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) await fetchProfile(session.user.id)
        else setProfile(null)
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
      quizCompleto: profile?.quiz_completo === true || localStorage.getItem(`quiz_done_${user?.id}`) === '1',
      signIn, signUp, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
