import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, UserPlus, Loader2, Check, Clock, Infinity } from 'lucide-react'

// Calcula data de expiração a partir de hoje + dias
function calcularExpiracao(dias: number | null): string | null {
  if (!dias) return null
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return d.toISOString().split('T')[0]
}

const OPCOES_ACESSO = [
  { dias: 7, label: '7 dias', sublabel: '1 semana', cor: 'border-amber-300 bg-amber-50 text-amber-700' },
  { dias: 14, label: '14 dias', sublabel: '2 semanas', cor: 'border-orange-300 bg-orange-50 text-orange-700' },
  { dias: 30, label: '30 dias', sublabel: '1 mês', cor: 'border-rosa-300 bg-rosa-50 text-rosa-700' },
  { dias: null, label: 'Permanente', sublabel: 'Sem expiração', cor: 'border-green-300 bg-green-50 text-green-700' },
]

export default function AddUser() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('menovitta2024')
  const [telefone, setTelefone] = useState('')
  const [diasAcesso, setDiasAcesso] = useState<number | null>(7)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [acessoExpira, setAcessoExpira] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const expira = calcularExpiracao(diasAcesso)

    // Criar usuário via Supabase Auth signUp
    // Nota: O admin continua logado pois o Supabase não faz auto-login no signUp
    // quando já há uma sessão ativa (comportamento do SDK v2)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome },
      },
    })

    if (signUpError) {
      setError(signUpError.message === 'User already registered'
        ? 'Este e-mail já está cadastrado.'
        : signUpError.message)
      setLoading(false)
      return
    }

    // Atualizar perfil com dados extras
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ nome, telefone, acesso_expira: expira })
        .eq('user_id', data.user.id)
    }

    setAcessoExpira(expira)
    setLoading(false)
    setSuccess(true)
  }

  const resetForm = () => {
    setSuccess(false)
    setNome('')
    setEmail('')
    setTelefone('')
    setDiasAcesso(7)
    setAcessoExpira(null)
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
        <p className="text-xs text-gray-400 text-center mb-1">
          Email: {email} | Senha: {senha}
        </p>
        {acessoExpira ? (
          <p className="text-xs text-amber-600 text-center mb-6">
            ⏰ Acesso válido até {new Date(acessoExpira + 'T12:00:00').toLocaleDateString('pt-BR')}
          </p>
        ) : (
          <p className="text-xs text-green-600 text-center mb-6">
            ✅ Acesso permanente
          </p>
        )}
        <div className="flex gap-3">
          <button onClick={resetForm} className="btn-secondary">
            Cadastrar Outra
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
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
          onClick={() => navigate('/dashboard')}
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
        {/* Dados da aluna */}
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

        {/* Período de acesso */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 text-sm mb-1 flex items-center gap-2">
            <Clock size={16} className="text-rosa-500" />
            Período de Acesso
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Ideal para desafios e períodos de teste do programa.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {OPCOES_ACESSO.map(op => (
              <button
                key={String(op.dias)}
                type="button"
                onClick={() => setDiasAcesso(op.dias)}
                className={`border-2 rounded-xl p-3 text-center transition-all ${
                  diasAcesso === op.dias
                    ? op.cor + ' border-opacity-100 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-500'
                }`}
              >
                <div className="font-bold text-base">{op.label}</div>
                <div className="text-[11px] opacity-70">{op.sublabel}</div>
              </button>
            ))}
          </div>

          {diasAcesso && (
            <p className="text-xs text-gray-400 mt-3 text-center">
              Acesso expira em:{' '}
              <strong className="text-gray-600">
                {new Date(calcularExpiracao(diasAcesso)! + 'T12:00:00').toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              </strong>
            </p>
          )}
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
