import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  User, Calendar, Scale, Ruler, Target, Activity,
  Heart, Info, ChevronRight, RefreshCw
} from 'lucide-react'
import type { FaseMenopausa, Objetivo } from '../types'

const FASE_LABELS: Record<FaseMenopausa, string> = {
  pre_menopausa: 'Pré-Menopausa',
  menopausa: 'Menopausa',
  pos_menopausa: 'Pós-Menopausa',
}

const OBJETIVO_LABELS: Record<Objetivo, string> = {
  emagrecer: 'Emagrecer',
  forma: 'Ficar em Forma',
  hipertrofia: 'Ganho Muscular',
  saude: 'Saúde Geral',
  flexibilidade: 'Flexibilidade',
}

const faseBadge = (f: FaseMenopausa) => {
  const map = {
    pre_menopausa: 'badge-pre',
    menopausa: 'badge-meno',
    pos_menopausa: 'badge-pos',
  }
  return map[f]
}

export default function Profile() {
  const { profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Tenta carregar automaticamente até 3 vezes com delay
    let tentativas = 0
    const tentar = async () => {
      if (tentativas >= 3) return
      tentativas++
      await refreshProfile()
    }
    if (!profile) {
      tentar()
      const t1 = setTimeout(tentar, 2000)
      const t2 = setTimeout(tentar, 4500)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [])

  if (!profile) return (
    <div className="page-container flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-10 h-10 border-3 border-rosa-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm text-center">Carregando seu perfil...</p>
      <button
        onClick={refreshProfile}
        className="flex items-center gap-2 text-rosa-500 text-sm font-medium"
      >
        <RefreshCw size={16} /> Tentar novamente
      </button>
    </div>
  )

  const imc = profile.peso && profile.altura
    ? (profile.peso / (profile.altura * profile.altura)).toFixed(1)
    : '—'

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-rosa-500 to-rosa-600 rounded-full flex items-center justify-center text-white shadow-lg">
          {profile.foto_url ? (
            <img src={profile.foto_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <User size={28} />
          )}
        </div>
        <div className="flex-1">
          <h1 className="page-title">{profile.nome || 'Aluna'}</h1>
          <p className="text-sm text-gray-500">{profile.email}</p>
          {profile.fase_menopausa && (
            <span className={`${faseBadge(profile.fase_menopausa as FaseMenopausa)} mt-1`}>
              {FASE_LABELS[profile.fase_menopausa as FaseMenopausa]}
            </span>
          )}
        </div>
      </div>

      {/* Info Card - Somente leitura */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Info size={16} className="text-rosa-500" />
          <p className="text-xs text-gray-400">
            Seu perfil é gerenciado pela sua consultora. Apenas visualização.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-2xl p-3">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Calendar size={14} />
              <span className="text-xs">Idade</span>
            </div>
            <p className="font-bold text-gray-800 text-lg">{profile.idade || '—'} anos</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Scale size={14} />
              <span className="text-xs">Peso</span>
            </div>
            <p className="font-bold text-gray-800 text-lg">{profile.peso || '—'} kg</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Ruler size={14} />
              <span className="text-xs">Altura</span>
            </div>
            <p className="font-bold text-gray-800 text-lg">{profile.altura || '—'} m</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Activity size={14} />
              <span className="text-xs">IMC</span>
            </div>
            <p className="font-bold text-gray-800 text-lg">{imc}</p>
          </div>
        </div>
      </div>

      {/* Objetivo */}
      <div className="card mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-ouro-50 rounded-xl flex items-center justify-center">
            <Target size={22} className="text-ouro-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Meu Objetivo</p>
            <p className="font-semibold text-gray-800">
              {profile.objetivo ? OBJETIVO_LABELS[profile.objetivo as Objetivo] : 'Não definido'}
            </p>
          </div>
        </div>
      </div>

      {/* Banner motivacional com imagem */}
      <div
        className="relative rounded-2xl overflow-hidden mb-4 cursor-pointer"
        onClick={() => navigate('/saude-info')}
      >
        <img
          src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80"
          alt="Saúde e bem-estar"
          className="w-full h-28 object-cover object-center"
        />
        <div className="absolute inset-0 flex items-center justify-between px-4"
          style={{ background: 'linear-gradient(90deg, rgba(183,110,121,0.88) 0%, rgba(183,110,121,0.55) 100%)' }}>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Heart size={14} className="text-white/80" />
              <p className="text-white/80 text-xs font-medium uppercase tracking-wide">Informações da Sua Fase</p>
            </div>
            <p className="font-serif text-base font-bold text-white">Dicas personalizadas para você</p>
            <p className="text-white/80 text-xs mt-0.5">Saúde, treino e bem-estar</p>
          </div>
          <ChevronRight size={20} className="text-white flex-shrink-0" />
        </div>
      </div>

      {/* Link para o Plano */}
      <div
        className="relative rounded-2xl overflow-hidden cursor-pointer"
        onClick={() => navigate('/plano')}
      >
        <img
          src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80"
          alt="Plano de Ação"
          className="w-full h-28 object-cover object-top"
        />
        <div className="absolute inset-0 flex items-center justify-between px-4"
          style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.88) 0%, rgba(212,175,55,0.55) 100%)' }}>
          <div>
            <p className="text-white/80 text-xs font-medium uppercase tracking-wide mb-0.5">Seu Programa</p>
            <p className="font-serif text-base font-bold text-white">Plano de Ação Completo</p>
            <p className="text-white/80 text-xs mt-0.5">Treino • Nutrição • Mentalidade</p>
          </div>
          <ChevronRight size={20} className="text-white flex-shrink-0" />
        </div>
      </div>
    </div>
  )
}
