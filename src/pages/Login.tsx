import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (isLogin) {
      const { error } = await signIn(email, password)
      if (error) setError('E-mail ou senha incorretos.')
      else navigate('/perfil')
    } else {
      if (!nome.trim()) { setError('Por favor, insira seu nome.'); setLoading(false); return }
      const { error } = await signUp(email, password, nome)
      if (error) setError('Erro ao criar conta. Tente novamente.')
      else navigate('/perfil')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-offwhite flex flex-col max-w-md mx-auto">

      {/* Topo com gradiente e logo */}
      <div className="relative overflow-hidden px-6 pt-10 pb-14"
        style={{ background: 'linear-gradient(145deg, #B76E79 0%, #9d5a64 60%, #8a4d56 100%)' }}>

        {/* Ornamentos */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
          style={{ background: '#D4AF37', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full opacity-10"
          style={{ background: '#D4AF37', transform: 'translate(-30%, 30%)' }} />

        <div className="relative z-10 text-center">
          {/* Logo sem fundo */}
          <img src="/logo.png" alt="Menovitta 4.0" className="w-20 h-20 object-contain drop-shadow-xl mx-auto mb-3" />

          {/* Nome */}
          <h1 className="font-serif text-3xl font-bold text-white tracking-wide drop-shadow-sm">Menovitta</h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className="h-px w-6 opacity-50" style={{ background: '#D4AF37' }} />
            <span className="text-xs tracking-widest font-medium" style={{ color: '#D4AF37' }}>4.0</span>
            <div className="h-px w-6 opacity-50" style={{ background: '#D4AF37' }} />
          </div>
          <p className="text-white/80 text-xs mt-2 tracking-wide">
            Saúde e bem-estar para mulheres 40+
          </p>
        </div>
      </div>

      {/* Card de login */}
      <div className="flex-1 px-5 -mt-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">

          {/* Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isLogin ? 'bg-white shadow-sm text-rosa-600' : 'text-gray-500'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setIsLogin(false); setError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                !isLogin ? 'bg-white shadow-sm text-rosa-600' : 'text-gray-500'
              }`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="label-field">Seu Nome</label>
                <input
                  type="text" value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Maria Silva"
                  className="input-field"
                />
              </div>
            )}

            <div>
              <label className="label-field">E-mail</label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label-field">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="input-field pr-12"
                  required minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : isLogin ? 'Entrar na Minha Conta' : 'Criar Minha Conta'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5 mb-8">
          Ao continuar, você concorda com nossos<br />
          <span className="underline cursor-pointer">Termos de Uso</span> e <span className="underline cursor-pointer">Política de Privacidade</span>
        </p>
      </div>
    </div>
  )
}
