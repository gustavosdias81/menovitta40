import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getProfile, updateProfile, getPlanoAcao, upsertPlanoAcao, getAnamnese,
  getTreinoLogsAdmin, getFoodLogsAdmin, createNotificacao, toggleAtivoAluna
} from '../../lib/supabase'
import type { Profile, PlanoAcao, AnamneseResponse, FaseMenopausa, Objetivo, TreinoLog, FoodLog } from '../../types'
import {
  ArrowLeft, Save, Loader2, User, ClipboardList,
  Dumbbell, Apple, Brain, TrendingUp, FileText,
  Scale, Ruler, Calendar, Target, Plus, MessageSquare,
  Activity, Send, Wifi, WifiOff
} from 'lucide-react'

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

function calcularStreak(logs: TreinoLog[]): number {
  if (!logs.length) return 0
  const datas = [...new Set(logs.map(l => l.data))].sort().reverse()
  const hoje = new Date().toISOString().split('T')[0]
  let streak = 0
  let esperado = hoje
  for (const data of datas) {
    if (data === esperado) {
      streak++
      const d = new Date(esperado + 'T12:00:00')
      d.setDate(d.getDate() - 1)
      esperado = d.toISOString().split('T')[0]
    } else if (data < esperado) break
  }
  return streak
}

export default function EditUser() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'perfil' | 'plano' | 'progresso' | 'anamnese'>('perfil')

  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [idade, setIdade] = useState(0)
  const [peso, setPeso] = useState(0)
  const [altura, setAltura] = useState(0)
  const [faseMenopausa, setFaseMenopausa] = useState<FaseMenopausa>('menopausa')
  const [objetivo, setObjetivo] = useState<Objetivo>('emagrecer')
  const [ativo, setAtivo] = useState(true)
  const [togglingAtivo, setTogglingAtivo] = useState(false)

  // Plano state
  const [plano, setPlano] = useState<PlanoAcao | null>(null)
  const [treinoDesc, setTreinoDesc] = useState('')
  const [nutricaoDesc, setNutricaoDesc] = useState('')
  const [mentalidadeDesc, setMentalidadeDesc] = useState('')
  const [notasAdmin, setNotasAdmin] = useState('')
  const [metaCalorias, setMetaCalorias] = useState(1600)
  const [metaProteinas, setMetaProteinas] = useState(90)
  const [metaGorduras, setMetaGorduras] = useState(55)
  const [metaCarboidratos, setMetaCarboidratos] = useState(180)
  const [novaNota, setNovaNota] = useState('')

  // Anamnese state
  const [anamnese, setAnamnese] = useState<AnamneseResponse | null>(null)

  // Progresso state
  const [treinoLogs, setTreinoLogs] = useState<TreinoLog[]>([])
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([])
  const [loadingProgresso, setLoadingProgresso] = useState(false)

  // Notificação para aluna
  const [notifTitulo, setNotifTitulo] = useState('')
  const [notifMensagem, setNotifMensagem] = useState('')
  const [enviandoNotif, setEnviandoNotif] = useState(false)
  const [notifEnviada, setNotifEnviada] = useState(false)

  useEffect(() => {
    if (userId) loadData()
  }, [userId])

  useEffect(() => {
    if (activeTab === 'progresso' && userId && treinoLogs.length === 0 && foodLogs.length === 0) {
      loadProgresso()
    }
  }, [activeTab])

  const loadData = async () => {
    if (!userId) return
    setLoading(true)

    const [profileRes, planoRes, anamneseRes] = await Promise.all([
      getProfile(userId),
      getPlanoAcao(userId),
      getAnamnese(userId),
    ])

    if (profileRes.data) {
      const p = profileRes.data as Profile
      setProfile(p)
      setNome(p.nome || '')
      setTelefone(p.telefone || '')
      setIdade(p.idade || 0)
      setPeso(p.peso || 0)
      setAltura(p.altura || 0)
      setFaseMenopausa((p.fase_menopausa as FaseMenopausa) || 'menopausa')
      setObjetivo((p.objetivo as Objetivo) || 'emagrecer')
      setAtivo(p.ativo !== false)
    }

    if (planoRes.data) {
      const pl = planoRes.data as PlanoAcao
      setPlano(pl)
      setTreinoDesc(pl.treino_descricao || '')
      setNutricaoDesc(pl.nutricao_descricao || '')
      setMentalidadeDesc(pl.mentalidade_descricao || '')
      setNotasAdmin(pl.notas_admin || '')
      setMetaCalorias(pl.meta_calorias || 1600)
      setMetaProteinas(pl.meta_proteinas || 90)
      setMetaGorduras(pl.meta_gorduras || 55)
      setMetaCarboidratos(pl.meta_carboidratos || 180)
    }

    if (anamneseRes.data) {
      setAnamnese(anamneseRes.data as AnamneseResponse)
    }

    setLoading(false)
  }

  const loadProgresso = async () => {
    if (!userId) return
    setLoadingProgresso(true)
    const [treinoRes, foodRes] = await Promise.all([
      getTreinoLogsAdmin(userId),
      getFoodLogsAdmin(userId, 7),
    ])
    if (treinoRes.data) setTreinoLogs(treinoRes.data as TreinoLog[])
    if (foodRes.data) setFoodLogs(foodRes.data as FoodLog[])
    setLoadingProgresso(false)
  }

  const handleSaveProfile = async () => {
    if (!userId) return
    setSaving(true)
    await updateProfile(userId, {
      nome, telefone, idade, peso, altura,
      fase_menopausa: faseMenopausa,
      objetivo,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSavePlano = async () => {
    if (!userId) return
    setSaving(true)

    const progressoNotas = plano?.progresso_notas || []

    if (novaNota.trim()) {
      (progressoNotas as Array<{ data: string; nota: string; autor: string }>).push({
        data: new Date().toISOString(),
        nota: novaNota.trim(),
        autor: 'admin',
      })
      setNovaNota('')
    }

    await upsertPlanoAcao(userId, {
      fase: faseMenopausa,
      treino_descricao: treinoDesc,
      nutricao_descricao: nutricaoDesc,
      mentalidade_descricao: mentalidadeDesc,
      notas_admin: notasAdmin,
      meta_calorias: metaCalorias,
      meta_proteinas: metaProteinas,
      meta_gorduras: metaGorduras,
      meta_carboidratos: metaCarboidratos,
      progresso_notas: progressoNotas,
    })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    await loadData()
  }

  const handleToggleAtivo = async () => {
    if (!userId) return
    setTogglingAtivo(true)
    const novoAtivo = !ativo
    const { error } = await toggleAtivoAluna(userId, novoAtivo)
    if (!error) {
      setAtivo(novoAtivo)
      setProfile(prev => prev ? { ...prev, ativo: novoAtivo } : prev)
    }
    setTogglingAtivo(false)
  }

  const handleEnviarNotificacao = async () => {
    if (!userId || !notifTitulo.trim() || !notifMensagem.trim()) return
    setEnviandoNotif(true)
    await createNotificacao({
      destinatario_id: userId,
      titulo: notifTitulo.trim(),
      mensagem: notifMensagem.trim(),
      tipo: 'info',
    })
    setNotifTitulo('')
    setNotifMensagem('')
    setEnviandoNotif(false)
    setNotifEnviada(true)
    setTimeout(() => setNotifEnviada(false), 3000)
  }

  // Calendário 21 dias
  const ultimos21Dias = () => {
    const dias: string[] = []
    for (let i = 20; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dias.push(d.toISOString().split('T')[0])
    }
    return dias
  }

  const datasComTreino = new Set(treinoLogs.map(l => l.data))

  // Resumo nutricional 7 dias
  const totalRefeicoes = foodLogs.length
  const mediaKcal = totalRefeicoes > 0
    ? Math.round(foodLogs.reduce((acc, f) => acc + (f.calorias || 0), 0) / 7)
    : 0
  const mediaProteina = totalRefeicoes > 0
    ? Math.round(foodLogs.reduce((acc, f) => acc + (f.proteinas || 0), 0) / 7)
    : 0

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-rosa-500 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="page-container text-center py-20">
        <p className="text-gray-500">Aluna não encontrada</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary mt-4">Voltar</button>
      </div>
    )
  }

  const tabs = [
    { key: 'perfil' as const, label: 'Perfil', icon: <User size={12} /> },
    { key: 'plano' as const, label: 'Plano', icon: <ClipboardList size={12} /> },
    { key: 'progresso' as const, label: 'Progresso', icon: <Activity size={12} /> },
    { key: 'anamnese' as const, label: 'Anamnese', icon: <FileText size={12} /> },
  ]

  return (
    <div className="page-container">
      {/* Header melhorado */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="page-title truncate">{profile.nome || 'Aluna'}</h1>
          <p className="text-xs text-gray-500 truncate">{profile.email}</p>
        </div>
        {/* Badge ativo + toggle */}
        <button
          onClick={handleToggleAtivo}
          disabled={togglingAtivo}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
            ativo
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {togglingAtivo ? (
            <Loader2 size={10} className="animate-spin" />
          ) : ativo ? (
            <><Wifi size={10} /> Ativa</>
          ) : (
            <><WifiOff size={10} /> Suspensa</>
          )}
        </button>
        {/* WhatsApp */}
        {profile.telefone && (
          <a
            href={`https://wa.me/55${profile.telefone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"
          >
            <MessageSquare size={18} className="text-green-500" />
          </a>
        )}
        {saved && (
          <span className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium">
            Salvo!
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-[11px] font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-white text-rosa-500 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Perfil */}
      {activeTab === 'perfil' && (
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
              <User size={16} className="text-rosa-500" />
              Dados Pessoais
            </h2>

            <div className="space-y-3">
              <div>
                <label className="label-field">Nome</label>
                <input value={nome} onChange={e => setNome(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label-field">Telefone</label>
                <input value={telefone} onChange={e => setTelefone(e.target.value)} className="input-field" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label-field flex items-center gap-1"><Calendar size={12} /> Idade</label>
                  <input type="number" value={idade} onChange={e => setIdade(Number(e.target.value))} className="input-field text-center" />
                </div>
                <div>
                  <label className="label-field flex items-center gap-1"><Scale size={12} /> Peso</label>
                  <input type="number" step="0.1" value={peso} onChange={e => setPeso(Number(e.target.value))} className="input-field text-center" />
                </div>
                <div>
                  <label className="label-field flex items-center gap-1"><Ruler size={12} /> Altura</label>
                  <input type="number" step="0.01" value={altura} onChange={e => setAltura(Number(e.target.value))} className="input-field text-center" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <Target size={16} className="text-ouro-400" />
              Classificação
            </h2>

            <div className="space-y-3">
              <div>
                <label className="label-field">Fase da Menopausa</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(FASE_LABELS) as [FaseMenopausa, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setFaseMenopausa(key)}
                      className={`py-2 rounded-xl border-2 text-xs font-medium transition-all ${
                        faseMenopausa === key
                          ? 'border-rosa-500 bg-rosa-50 text-rosa-700'
                          : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-field">Objetivo</label>
                <select
                  value={objetivo}
                  onChange={e => setObjetivo(e.target.value as Objetivo)}
                  className="input-field"
                >
                  {(Object.entries(OBJETIVO_LABELS) as [Objetivo, string][]).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={18} /> Salvar Perfil</>}
          </button>
        </div>
      )}

      {/* TAB: Plano de Ação */}
      {activeTab === 'plano' && (
        <div className="space-y-4">
          {/* Metas de Macros */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-rosa-500" />
              Metas Diárias de Macros
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-field text-orange-500">Calorias (kcal)</label>
                <input type="number" value={metaCalorias} onChange={e => setMetaCalorias(Number(e.target.value))} className="input-field text-center" />
              </div>
              <div>
                <label className="label-field text-red-500">Proteínas (g)</label>
                <input type="number" value={metaProteinas} onChange={e => setMetaProteinas(Number(e.target.value))} className="input-field text-center" />
              </div>
              <div>
                <label className="label-field text-yellow-600">Gorduras (g)</label>
                <input type="number" value={metaGorduras} onChange={e => setMetaGorduras(Number(e.target.value))} className="input-field text-center" />
              </div>
              <div>
                <label className="label-field text-blue-500">Carboidratos (g)</label>
                <input type="number" value={metaCarboidratos} onChange={e => setMetaCarboidratos(Number(e.target.value))} className="input-field text-center" />
              </div>
            </div>
          </div>

          {/* Protocolo de Treino */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <Dumbbell size={16} className="text-rosa-500" />
              Protocolo de Treino
            </h2>
            <textarea
              value={treinoDesc}
              onChange={e => setTreinoDesc(e.target.value)}
              placeholder="Descreva o protocolo de treino semanal da aluna..."
              className="input-field min-h-[150px] resize-none"
            />
          </div>

          {/* Protocolo Nutricional */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <Apple size={16} className="text-green-500" />
              Protocolo Nutricional
            </h2>
            <textarea
              value={nutricaoDesc}
              onChange={e => setNutricaoDesc(e.target.value)}
              placeholder="Descreva o protocolo nutricional da aluna..."
              className="input-field min-h-[150px] resize-none"
            />
          </div>

          {/* Mentalidade */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <Brain size={16} className="text-purple-500" />
              Mentalidade & Bem-Estar
            </h2>
            <textarea
              value={mentalidadeDesc}
              onChange={e => setMentalidadeDesc(e.target.value)}
              placeholder="Orientações de mentalidade e bem-estar..."
              className="input-field min-h-[120px] resize-none"
            />
          </div>

          {/* Notas Gerais */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <ClipboardList size={16} className="text-ouro-400" />
              Notas da Consultora
            </h2>
            <textarea
              value={notasAdmin}
              onChange={e => setNotasAdmin(e.target.value)}
              placeholder="Observações gerais sobre a aluna..."
              className="input-field min-h-[100px] resize-none"
            />
          </div>

          {/* Nova nota de progresso */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <Plus size={16} className="text-rosa-500" />
              Nova Nota de Acompanhamento
            </h2>
            <textarea
              value={novaNota}
              onChange={e => setNovaNota(e.target.value)}
              placeholder="Registrar evolução, ajuste ou observação..."
              className="input-field min-h-[80px] resize-none mb-2"
            />
            <p className="text-[10px] text-gray-400">
              A nota será adicionada ao histórico de acompanhamento da aluna com data de hoje.
            </p>
          </div>

          {/* Histórico de notas */}
          {plano?.progresso_notas && Array.isArray(plano.progresso_notas) && (plano.progresso_notas as Array<{ data: string; nota: string; autor: string }>).length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-800 text-sm mb-3">Histórico</h2>
              <div className="space-y-2">
                {(plano.progresso_notas as Array<{ data: string; nota: string; autor: string }>).map((n, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <span className="text-[10px] text-gray-400">
                      {new Date(n.data).toLocaleDateString('pt-BR')}
                    </span>
                    <p className="text-sm text-gray-600 mt-0.5">{n.nota}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSavePlano}
            disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={18} /> Salvar Plano de Ação</>}
          </button>
        </div>
      )}

      {/* TAB: Progresso */}
      {activeTab === 'progresso' && (
        <div className="space-y-4">
          {loadingProgresso ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-rosa-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* Streak */}
              <div className="card bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">🔥</div>
                  <div>
                    <p className="text-3xl font-bold text-orange-500">{calcularStreak(treinoLogs)}</p>
                    <p className="text-sm text-orange-400 font-medium">dias consecutivos de treino</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-gray-400">Total treinos</p>
                    <p className="text-xl font-bold text-gray-700">{treinoLogs.length}</p>
                  </div>
                </div>
              </div>

              {/* Calendário 21 dias */}
              <div className="card">
                <h2 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                  <Calendar size={16} className="text-rosa-500" />
                  Últimos 21 Dias
                </h2>
                <div className="grid grid-cols-7 gap-1.5">
                  {ultimos21Dias().map(dia => {
                    const treinou = datasComTreino.has(dia)
                    const label = new Date(dia + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit' })
                    return (
                      <div
                        key={dia}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center text-[10px] font-semibold ${
                          treinou
                            ? 'bg-green-400 text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {label}
                        {treinou && <span className="text-[8px]">✓</span>}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Resumo nutricional 7 dias */}
              <div className="card">
                <h2 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                  <Apple size={16} className="text-green-500" />
                  Nutrição — Últimos 7 Dias
                </h2>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xl font-bold text-gray-700">{totalRefeicoes}</p>
                    <p className="text-[10px] text-gray-400">Refeições registradas</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-3">
                    <p className="text-xl font-bold text-orange-500">{mediaKcal}</p>
                    <p className="text-[10px] text-orange-400">Kcal/dia (média)</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3">
                    <p className="text-xl font-bold text-red-500">{mediaProteina}g</p>
                    <p className="text-[10px] text-red-400">Proteína/dia (média)</p>
                  </div>
                </div>
              </div>

              {/* Últimas refeições */}
              {foodLogs.length > 0 && (
                <div className="card">
                  <h2 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                    <Activity size={16} className="text-purple-500" />
                    Últimas Refeições
                  </h2>
                  <div className="space-y-2">
                    {foodLogs.slice(0, 5).map(f => (
                      <div key={f.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 truncate">{f.descricao || 'Refeição'}</p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(f.data + 'T12:00:00').toLocaleDateString('pt-BR')} · {f.refeicao?.replace('_', ' ')}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-orange-500 flex-shrink-0">
                          {f.calorias} kcal
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enviar notificação para aluna */}
              <div className="card space-y-3">
                <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                  <Send size={16} className="text-rosa-500" />
                  Enviar Notificação para {profile.nome?.split(' ')[0] || 'Aluna'}
                </h2>
                <div>
                  <label className="label-field">Título</label>
                  <input
                    type="text"
                    value={notifTitulo}
                    onChange={e => setNotifTitulo(e.target.value)}
                    placeholder="Ex: Parabéns pelo treino!"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-field">Mensagem</label>
                  <textarea
                    value={notifMensagem}
                    onChange={e => setNotifMensagem(e.target.value)}
                    placeholder="Escreva uma mensagem de incentivo..."
                    className="input-field min-h-[80px] resize-none"
                  />
                </div>
                {notifEnviada && (
                  <p className="text-xs text-green-600 bg-green-50 rounded-xl px-3 py-2 text-center font-medium">
                    Notificação enviada com sucesso!
                  </p>
                )}
                <button
                  onClick={handleEnviarNotificacao}
                  disabled={enviandoNotif || !notifTitulo.trim() || !notifMensagem.trim()}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {enviandoNotif ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <><Send size={16} /> Enviar</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB: Anamnese (somente leitura) */}
      {activeTab === 'anamnese' && (
        <div className="space-y-4">
          {!anamnese ? (
            <div className="card text-center py-10">
              <FileText size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">A aluna ainda não respondeu o questionário.</p>
            </div>
          ) : (
            <>
              <div className="card">
                <h2 className="font-semibold text-gray-800 text-sm mb-3">Dados Corporais</h2>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Idade</p>
                    <p className="font-bold text-gray-800">{anamnese.idade}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Peso</p>
                    <p className="font-bold text-gray-800">{anamnese.peso_atual}kg</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Altura</p>
                    <p className="font-bold text-gray-800">{anamnese.altura}m</p>
                  </div>
                </div>
                {anamnese.circunferencia_abdominal && (
                  <div className="bg-gray-50 rounded-xl p-3 mt-2 text-center">
                    <p className="text-xs text-gray-400">Circ. Abdominal</p>
                    <p className="font-bold text-gray-800">{anamnese.circunferencia_abdominal}cm</p>
                  </div>
                )}
              </div>

              <div className="card">
                <h2 className="font-semibold text-gray-800 text-sm mb-3">Ciclo Menstrual</h2>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Última menstruação:</strong> {
                    { regular: 'Ainda menstrua regularmente', menos_1_ano: 'Parou há menos de 1 ano', '1_a_3_anos': 'Parou entre 1 e 3 anos', mais_3_anos: 'Parou há mais de 3 anos' }[anamnese.ultima_menstruacao] || anamnese.ultima_menstruacao
                  }</p>
                  <p><strong>Fase classificada:</strong> <span className="font-semibold text-rosa-500">{FASE_LABELS[anamnese.fase_classificada as FaseMenopausa]}</span></p>
                  <p><strong>Uso de TRH:</strong> {anamnese.uso_trh ? 'Sim' : 'Não'}</p>
                </div>
              </div>

              {anamnese.sintomas && anamnese.sintomas.length > 0 && (
                <div className="card">
                  <h2 className="font-semibold text-gray-800 text-sm mb-3">
                    Sintomas ({anamnese.sintomas.length}) — Intensidade: {anamnese.intensidade_sintomas}
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {anamnese.sintomas.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 bg-rosa-50 text-rosa-600 rounded-full text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {anamnese.doencas_previas && anamnese.doencas_previas.length > 0 && (
                <div className="card">
                  <h2 className="font-semibold text-gray-800 text-sm mb-3">Condições de Saúde</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {anamnese.doencas_previas.map((d, i) => (
                      <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">{d}</span>
                    ))}
                  </div>
                </div>
              )}

              {anamnese.medicamentos && anamnese.medicamentos.length > 0 && (
                <div className="card">
                  <h2 className="font-semibold text-gray-800 text-sm mb-3">Medicamentos</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {anamnese.medicamentos.map((m, i) => (
                      <span key={i} className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full text-xs">{m}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="card">
                <h2 className="font-semibold text-gray-800 text-sm mb-3">Estilo de Vida</h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Atividade Física</p>
                    <p className="font-medium text-gray-700 capitalize">{anamnese.atividade_fisica}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Sono</p>
                    <p className="font-medium text-gray-700">{anamnese.horas_sono}h — {anamnese.qualidade_sono}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Estresse</p>
                    <p className="font-medium text-gray-700 capitalize">{anamnese.nivel_estresse}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Objetivo</p>
                    <p className="font-medium text-gray-700">{OBJETIVO_LABELS[anamnese.objetivo as Objetivo]}</p>
                  </div>
                </div>
              </div>

              {anamnese.restricoes_alimentares && anamnese.restricoes_alimentares.length > 0 && (
                <div className="card">
                  <h2 className="font-semibold text-gray-800 text-sm mb-3">Restrições Alimentares</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {anamnese.restricoes_alimentares.map((r, i) => (
                      <span key={i} className="px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs">{r}</span>
                    ))}
                  </div>
                </div>
              )}

              {anamnese.historico_familiar && anamnese.historico_familiar.length > 0 && (
                <div className="card">
                  <h2 className="font-semibold text-gray-800 text-sm mb-3">Histórico Familiar</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {anamnese.historico_familiar.map((h: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-xs">{h}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
