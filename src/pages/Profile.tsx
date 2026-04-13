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
    if (!profile) refreshProfile()
  }, [])

  if (!profile) return (
    <div className="page-container flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="text-gray-400 text-sm text-center">Carregando seu perfil...</p>
      <button onClick={refreshProfile} className="flex items-center gap-2 text-rosa-500 text-sm font-medium">
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

      {/* Link para Saúde Info */}
      <button
        onClick={() => navigate('/saude-info')}
        className="card w-full flex items-center justify-between mb-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rosa-50 rounded-xl flex items-center justify-center">
            <Heart size={18} className="text-rosa-500" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-800 text-sm">Informações da Minha Fase</p>
            <p className="text-xs text-gray-400">Dicas e orientações personalizadas</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-gray-300" />
      </button>
    </div>
  )
}
