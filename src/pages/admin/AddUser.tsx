import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, UserPlus, Loader2, Check } from 'lucide-react'

export default function AddUser() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('menovitta2024')
  const [telefone, setTelefone] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Criar usuário via Supabase Admin (ou Auth API)
    // Nota: Em produção, use uma Edge Function com service_role key
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Atualizar perfil com telefone
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ nome, telefone })
        .eq('user_id', data.user.id)
    }

    setLoading(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="font-serif text-xl font-bold text-gray-800 mb-2">Aluna Cadastrada!</h2>
        <p className="text-sm text-gray-500 text-center mb-1">
          <strong>{nome}</strong> foi adicionada com sucesso.
        </p>
        <p className="text-xs text-gray-400 text-center mb-6">
          Email: {email} | Senha: {senha}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => { setSuccess(false); setNome(''); setEmail(''); setTelefone('') }}
            className="btn-secondary"
          >
            Cadastrar Outra
          </button>
          <button onClick={() => navigate('/admin')} className="btn-primary">
            Ver Alunas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="page-title">Nova Aluna</h1>
          <p className="text-sm text-gray-500">Cadastrar manualmente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card">
          <h2 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
            <UserPlus size={16} className="text-rosa-500" />
            Dados da Aluna
          </h2>

          <div className="space-y-3">
            <div>
              <label className="label-field">Nome Completo *</label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Nome da aluna"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label-field">E-mail *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label-field">Senha Inicial</label>
              <input
                type="text"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                className="input-field"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                A aluna poderá alterar depois. Mínimo 6 caracteres.
              </p>
            </div>

            <div>
              <label className="label-field">Telefone / WhatsApp</label>
              <input
                type="tel"
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !nome || !email}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <UserPlus size={18} /> Cadastrar Aluna
            </>
          )}
        </button>
      </form>
    </div>
  )
}
