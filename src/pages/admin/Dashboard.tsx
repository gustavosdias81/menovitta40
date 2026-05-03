import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllProfiles, createNotificacao, getNotificacoesAdmin } from '../../lib/supabase'
import type { Profile, Notificacao } from '../../types'
import {
  Crown, Users, UserPlus, Search, Bell, BellRing,
  MessageSquare, ChevronRight, Loader2, ArrowLeft, User,
  Filter, Send, TrendingUp, Activity, WifiOff, Wifi, BookOpen, FlaskConical, DollarSign
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

type TabKey = 'alunas' | 'stats' | 'vendas' | 'notificacoes'
type FiltroKey = 'todas' | 'ativas' | 'inativas' | 'quiz'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('alunas')
  const [filtro, setFiltro] = useState<FiltroKey>('todas')

  // Notificações
  const [notifTitulo, setNotifTitulo] = useState('')
  const [notifMensagem, setNotifMensagem] = useState('')
  const [notifTipo, setNotifTipo] = useState<'info' | 'treino' | 'nutricao' | 'motivacao'>('info')
  const [notifDestinatario, setNotifDestinatario] = useState<string>('todas')
  const [enviando, setEnviando] = useState(false)
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loadingNotifs, setLoadingNotifs] = useState(false)

  useEffect(() => {
    loadProfiles()
  }, [])

  useEffect(() => {
    if (activeTab === 'notificacoes') loadNotificacoes()
  }, [activeTab])

  const loadProfiles = async () => {
    setLoading(true)
    try {
      const { data } = await getAllProfiles()
      if (data) setProfiles(data.filter((p: Profile) => !p.is_admin) as Profile[])
    } catch (e) {
      console.error('loadProfiles error:', e)
    } finally {
      setLoading(false)
    }
  }

  const loadNotificacoes = async () => {
    setLoadingNotifs(true)
    const { data } = await getNotificacoesAdmin(10)
    if (data) setNotificacoes(data as Notificacao[])
    setLoadingNotifs(false)
  }

  const handleEnviarNotificacao = async () => {
    if (!notifTitulo.trim() || !notifMensagem.trim()) return
    setEnviando(true)
    await createNotificacao({
      destinatario_id: notifDestinatario === 'todas' ? null : notifDestinatario,
      titulo: notifTitulo.trim(),
      mensagem: notifMensagem.trim(),
      tipo: notifTipo,
    })
    setNotifTitulo('')
    setNotifMensagem('')
    setNotifTipo('info')
    setNotifDestinatario('todas')
    setEnviando(false)
    await loadNotificacoes()
  }

  // Sem dados de treino_logs aqui, então "ativa" = quiz completo e não suspenso
  const alunasFiltradas = profiles.filter(p => {
    const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
    if (filtro === 'ativas') return p.ativo !== false && p.quiz_completo
    if (filtro === 'inativas') return p.ativo === false
    if (filtro === 'quiz') return !p.quiz_completo
    return true
  })

  const stats = {
    total: profiles.length,
    ativas: profiles.filter(p => p.ativo !== false && p.quiz_completo).length,
    inativas: profiles.filter(p => p.ativo === false).length,
    quizPendente: profiles.filter(p => !p.quiz_completo).length,
    pre: profiles.filter(p => p.fase_menopausa === 'pre_menopausa').length,
    meno: profiles.filter(p => p.fase_menopausa === 'menopausa').length,
    pos: profiles.filter(p => p.fase_menopausa === 'pos_menopausa').length,
  }

  // Vendas stats
  const today = new Date().toISOString().split('T')[0]
  const vendaStats = {
    vendedHoje: profiles.filter(p => p.created_at?.includes(today)).length,
    totalClientes: profiles.filter(p => p.ativo !== false).length,
    receita: profiles.filter(p => p.ativo !== false).length * 49.90,
    conversao: profiles.length > 0 ? Math.round((profiles.filter(p => p.quiz_completo).length / profiles.length) * 100) : 0,
  }

  // Últimas alunas criadas
  const recentAlunas = [...profiles]
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
    .slice(0, 5)

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'alunas', label: 'Alunas' },
    { key: 'stats', label: 'Stats' },
    { key: 'vendas', label: 'Vendas' },
    { key: 'notificacoes', label: 'Notificações' },
  ]

  const filtros: { key: FiltroKey; label: string }[] = [
    { key: 'todas', label: 'Todas' },
    { key: 'ativas', label: 'Ativas' },
    { key: 'inativas', label: 'Inativas' },
    { key: 'quiz', label: 'Quiz pendente' },
  ]

  const tipoNotifLabel: Record<string, string> = {
    info: 'Info',
    treino: 'Treino',
    nutricao: 'Nutrição',
    motivacao: 'Motivação',
  }

  const tipoNotifColor: Record<string, string> = {
    info: 'bg-blue-100 text-blue-600',
    treino: 'bg-orange-100 text-orange-600',
    nutricao: 'bg-green-100 text-green-600',
    motivacao: 'bg-purple-100 text-purple-600',
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
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
          onClick={() => navigate('/dashboard/artigos')}
          title="Gerenciar Artigos"
          className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shadow-sm"
        >
          <FlaskConical size={18} className="text-purple-500" />
        </button>
        <button
          onClick={() => navigate('/dashboard/nova-aluna')}
          className="w-10 h-10 bg-rosa-500 rounded-xl flex items-center justify-center shadow-md"
        >
          <UserPlus size={18} className="text-white" />
        </button>
      </div>

      {/* Tabs principais */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-white text-rosa-500 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            {tab.key === 'notificacoes' ? (
              <span className="flex items-center justify-center gap-1">
                <Bell size={12} /> {tab.label}
              </span>
            ) : tab.key === 'stats' ? (
              <span className="flex items-center justify-center gap-1">
                <TrendingUp size={12} /> {tab.label}
              </span>
            ) : tab.key === 'vendas' ? (
              <span className="flex items-center justify-center gap-1">
                <DollarSign size={12} /> {tab.label}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1">
                <Users size={12} /> {tab.label}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB: ALUNAS ── */}
      {activeTab === 'alunas' && (
        <>
          {/* Stats mini */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="card text-center p-3">
              <p className="text-xl font-bold text-rosa-500">{stats.total}</p>
              <p className="text-[10px] text-gray-400">Total</p>
            </div>
            <div className="card text-center p-3">
              <p className="text-xl font-bold text-green-500">{stats.ativas}</p>
              <p className="text-[10px] text-gray-400">Ativas</p>
            </div>
            <div className="card text-center p-3">
              <p className="text-xl font-bold text-red-500">{stats.inativas}</p>
              <p className="text-[10px] text-gray-400">Suspensas</p>
            </div>
            <div className="card text-center p-3">
              <p className="text-xl font-bold text-amber-500">{stats.quizPendente}</p>
              <p className="text-[10px] text-gray-400">Quiz</p>
            </div>
          </div>

          {/* Busca */}
          <div className="relative mb-3">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar aluna por nome ou email..."
              className="input-field pl-11"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            <Filter size={14} className="text-gray-400 flex-shrink-0 mt-1.5" />
            {filtros.map(f => (
              <button
                key={f.key}
                onClick={() => setFiltro(f.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                  filtro === f.key
                    ? 'bg-rosa-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Lista */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-rosa-500 animate-spin" />
            </div>
          ) : alunasFiltradas.length === 0 ? (
            <div className="text-center py-16">
              <Users size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                {search ? 'Nenhuma aluna encontrada' : 'Nenhuma aluna nesta categoria'}
              </p>
              {!search && filtro === 'todas' && (
                <button
                  onClick={() => navigate('/dashboard/nova-aluna')}
                  className="btn-primary mt-4"
                >
                  <UserPlus size={16} className="inline mr-2" />
                  Adicionar Primeira Aluna
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {alunasFiltradas.map(aluna => (
                <div key={aluna.id} className="card flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/dashboard/aluna/${aluna.user_id}`)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <div className="w-11 h-11 bg-gradient-to-br from-rosa-400 to-rosa-600 rounded-full flex items-center justify-center text-white flex-shrink-0 overflow-hidden">
                      {aluna.foto_url ? (
                        <img src={aluna.foto_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={18} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{aluna.nome || 'Sem nome'}</p>
                      <p className="text-[11px] text-gray-400 truncate">{aluna.email}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {aluna.fase_menopausa && (
                          <span className={`${faseBadge(aluna.fase_menopausa)} text-[10px] px-2 py-0.5`}>
                            {FASE_LABELS[aluna.fase_menopausa] || aluna.fase_menopausa}
                          </span>
                        )}
                        {aluna.ativo === false ? (
                          <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <WifiOff size={8} /> Suspenso
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-600 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Wifi size={8} /> Ativo
                          </span>
                        )}
                        {!aluna.quiz_completo && (
                          <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full">
                            Quiz pendente
                          </span>
                        )}
                        <span className="text-gray-300 text-[10px]">Streak: —</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                  </button>
                  {aluna.telefone && (
                    <a
                      href={`https://wa.me/55${aluna.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0"
                    >
                      <MessageSquare size={16} className="text-green-500" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── TAB: STATS ── */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          {/* Cards grandes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card text-center">
              <div className="w-12 h-12 bg-rosa-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users size={22} className="text-rosa-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-xs text-gray-400 mt-1">Total de Alunas</p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <Activity size={22} className="text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.ativas}</p>
              <p className="text-xs text-gray-400 mt-1">Ativas (quiz OK)</p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <BellRing size={22} className="text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.quizPendente}</p>
              <p className="text-xs text-gray-400 mt-1">Quiz Pendente</p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <WifiOff size={22} className="text-red-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.inativas}</p>
              <p className="text-xs text-gray-400 mt-1">Suspensas</p>
            </div>
          </div>

          {/* Fases */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-rosa-500" />
              Distribuição por Fase
            </h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-amber-600">{stats.pre}</p>
                <p className="text-[10px] text-amber-500 mt-0.5">Pré-Meno</p>
              </div>
              <div className="bg-rosa-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-rosa-500">{stats.meno}</p>
                <p className="text-[10px] text-rosa-400 mt-0.5">Menopausa</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-purple-500">{stats.pos}</p>
                <p className="text-[10px] text-purple-400 mt-0.5">Pós-Meno</p>
              </div>
            </div>
          </div>

          {/* Atalho artigos científicos */}
          <div
            className="card flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/dashboard/artigos')}
          >
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
              <FlaskConical size={22} className="text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">Artigos Científicos</p>
              <p className="text-xs text-gray-400">Publicar e gerenciar artigos para as alunas</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </div>

          {/* Alunas com quiz pendente */}
          {stats.quizPendente > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                <BellRing size={16} className="text-yellow-500" />
                Quiz Pendente ({stats.quizPendente})
              </h2>
              <div className="space-y-2">
                {profiles.filter(p => !p.quiz_completo).map(aluna => (
                  <div key={aluna.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-rosa-400 to-rosa-600 rounded-full flex items-center justify-center text-white flex-shrink-0 overflow-hidden">
                      {aluna.foto_url ? (
                        <img src={aluna.foto_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={14} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{aluna.nome || 'Sem nome'}</p>
                      <p className="text-[10px] text-gray-400 truncate">{aluna.email}</p>
                    </div>
                    {aluna.telefone && (
                      <a
                        href={`https://wa.me/55${aluna.telefone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0"
                      >
                        <MessageSquare size={14} className="text-green-500" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: NOTIFICAÇÕES ── */}
      {activeTab === 'notificacoes' && (
        <div className="space-y-4">
          {/* Formulário de envio */}
          <div className="card space-y-3">
            <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <Send size={16} className="text-rosa-500" />
              Nova Notificação
            </h2>

            <div>
              <label className="label-field">Título</label>
              <input
                type="text"
                value={notifTitulo}
                onChange={e => setNotifTitulo(e.target.value)}
                placeholder="Ex: Novo treino disponível!"
                className="input-field"
              />
            </div>

            <div>
              <label className="label-field">Mensagem</label>
              <textarea
                value={notifMensagem}
                onChange={e => setNotifMensagem(e.target.value)}
                placeholder="Digite a mensagem para a(s) aluna(s)..."
                className="input-field min-h-[100px] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-field">Tipo</label>
                <select
                  value={notifTipo}
                  onChange={e => setNotifTipo(e.target.value as 'info' | 'treino' | 'nutricao' | 'motivacao')}
                  className="input-field"
                >
                  <option value="info">Info</option>
                  <option value="treino">Treino</option>
                  <option value="nutricao">Nutrição</option>
                  <option value="motivacao">Motivação</option>
                </select>
              </div>
              <div>
                <label className="label-field">Destinatário</label>
                <select
                  value={notifDestinatario}
                  onChange={e => setNotifDestinatario(e.target.value)}
                  className="input-field"
                >
                  <option value="todas">Todas as alunas</option>
                  {profiles.map(p => (
                    <option key={p.user_id} value={p.user_id}>
                      {p.nome || p.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleEnviarNotificacao}
              disabled={enviando || !notifTitulo.trim() || !notifMensagem.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {enviando ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <><Send size={16} /> Enviar Notificação</>
              )}
            </button>
          </div>

          {/* Histórico de notificações */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <Bell size={16} className="text-gray-500" />
              Últimas Notificações Enviadas
            </h2>
            {loadingNotifs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-rosa-500 animate-spin" />
              </div>
            ) : notificacoes.length === 0 ? (
              <div className="text-center py-8">
                <Bell size={32} className="text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Nenhuma notificação enviada ainda</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notificacoes.map(n => (
                  <div key={n.id} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-800">{n.titulo}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${tipoNotifColor[n.tipo] || 'bg-gray-100 text-gray-500'}`}>
                        {tipoNotifLabel[n.tipo] || n.tipo}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{n.mensagem}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-[10px] text-gray-400">
                        {n.destinatario_id ? 'Individual' : 'Para todas'}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(n.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: VENDAS ── */}
      {activeTab === 'vendas' && (
        <div className="space-y-4">
          {/* Métricas principais */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">📊</span>
                <span className="text-xs text-gray-400 font-medium">Hoje</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{vendaStats.vendedHoje}</p>
              <p className="text-xs text-gray-400 mt-1">Vendas Hoje</p>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">💰</span>
                <span className="text-xs text-gray-400 font-medium">Estimado</span>
              </div>
              <p className="text-3xl font-bold text-green-600">R$ {vendaStats.receita.toFixed(0)}</p>
              <p className="text-xs text-gray-400 mt-1">Receita</p>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">👥</span>
                <span className="text-xs text-gray-400 font-medium">Total</span>
              </div>
              <p className="text-3xl font-bold text-rosa-500">{vendaStats.totalClientes}</p>
              <p className="text-xs text-gray-400 mt-1">Clientes Ativos</p>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">📈</span>
                <span className="text-xs text-gray-400 font-medium">Taxa</span>
              </div>
              <p className="text-3xl font-bold text-blue-500">{vendaStats.conversao}%</p>
              <p className="text-xs text-gray-400 mt-1">Conversão</p>
            </div>
          </div>

          {/* Últimas alunas cadastradas */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <UserPlus size={16} className="text-rosa-500" />
              Últimas Alunas Cadastradas
            </h2>
            {recentAlunas.length === 0 ? (
              <div className="text-center py-8">
                <Users size={32} className="text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Nenhuma aluna cadastrada ainda</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentAlunas.map(aluna => (
                  <div key={aluna.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-rosa-400 to-rosa-600 rounded-full flex items-center justify-center text-white flex-shrink-0 overflow-hidden">
                        {aluna.foto_url ? (
                          <img src={aluna.foto_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User size={14} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{aluna.nome || 'Sem nome'}</p>
                        <p className="text-[10px] text-gray-400 truncate">{aluna.email}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${
                      aluna.ativo !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {aluna.ativo !== false ? '✓ Ativa' : '✗ Inativa'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info adicional */}
          <div className="card bg-blue-50 border border-blue-100">
            <p className="text-xs text-blue-700">
              <span className="font-semibold">💡 Nota:</span> As receitas são estimadas com base em R$ 49,90 por aluna ativa/mês. Os dados são atualizados em tempo real baseado nos registros de perfis ativos.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
