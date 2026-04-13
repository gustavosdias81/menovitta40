import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllProfiles } from '../../lib/supabase'
import type { Profile, FaseMenopausa } from '../../types'
import {
  Users, UserPlus, Search, ChevronRight,
  Loader2, ArrowLeft, Crown, User
} from 'lucide-react'

const FASE_LABELS: Record<string, string> = {
  pre_menopausa: 'Pré-Meno',
  menopausa: 'Menopausa',
  pos_menopausa: 'Pós-Meno',
}

const faseBadge = (f: string) => {
  const map: Record<string, string> = {
    pre_menopausa: 'badge-pre',
    menopausa: 'badge-meno',
    pos_menopausa: 'badge-pos',
  }
  return map[f] || 'bg-gray-100 text-gray-500'
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    setLoading(true)
    const { data } = await getAllProfiles()
    if (data) setProfiles(data.filter((p: Profile) => !p.is_admin) as Profile[])
    setLoading(false)
  }

  const filtered = profiles.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: profiles.length,
    pre: profiles.filter(p => p.fase_menopausa === 'pre_menopausa').length,
    meno: profiles.filter(p => p.fase_menopausa === 'menopausa').length,
    pos: profiles.filter(p => p.fase_menopausa === 'pos_menopausa').length,
    quizPendente: profiles.filter(p => !p.quiz_completo).length,
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/configuracoes')}
          className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="page-title flex items-center gap-2">
            <Crown size={20} className="text-ouro-400" />
            Painel Admin
          </h1>
          <p className="text-sm text-gray-500">Gerencie suas alunas</p>
        </div>
        <button
          onClick={() => navigate('/admin/nova-aluna')}
          className="w-10 h-10 bg-rosa-500 rounded-xl flex items-center justify-center shadow-md"
        >
          <UserPlus size={18} className="text-white" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        <div className="card text-center p-3">
          <p className="text-xl font-bold text-rosa-500">{stats.total}</p>
          <p className="text-[10px] text-gray-400">Total</p>
        </div>
        <div className="card text-center p-3">
          <p className="text-xl font-bold text-amber-500">{stats.pre}</p>
          <p className="text-[10px] text-gray-400">Pré</p>
        </div>
        <div className="card text-center p-3">
          <p className="text-xl font-bold text-rosa-500">{stats.meno}</p>
          <p className="text-[10px] text-gray-400">Meno</p>
        </div>
        <div className="card text-center p-3">
          <p className="text-xl font-bold text-purple-500">{stats.pos}</p>
          <p className="text-[10px] text-gray-400">Pós</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar aluna por nome ou email..."
          className="input-field pl-11"
        />
      </div>

      {/* Lista de Alunas */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-rosa-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            {search ? 'Nenhuma aluna encontrada' : 'Nenhuma aluna cadastrada ainda'}
          </p>
          {!search && (
            <button
              onClick={() => navigate('/admin/nova-aluna')}
              className="btn-primary mt-4"
            >
              <UserPlus size={16} className="inline mr-2" />
              Adicionar Primeira Aluna
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(aluna => (
            <button
              key={aluna.id}
              onClick={() => navigate(`/admin/aluna/${aluna.user_id}`)}
              className="card w-full flex items-center gap-3 hover:shadow-md transition-shadow"
            >
              <div className="w-11 h-11 bg-gradient-to-br from-rosa-400 to-rosa-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                {aluna.foto_url ? (
                  <img src={aluna.foto_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User size={18} />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{aluna.nome || 'Sem nome'}</p>
                <p className="text-[11px] text-gray-400 truncate">{aluna.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {aluna.fase_menopausa && (
                    <span className={`${faseBadge(aluna.fase_menopausa)} text-[10px] px-2 py-0.5`}>
                      {FASE_LABELS[aluna.fase_menopausa] || aluna.fase_menopausa}
                    </span>
                  )}
                  {!aluna.quiz_completo && (
                    <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full">
                      Quiz pendente
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
