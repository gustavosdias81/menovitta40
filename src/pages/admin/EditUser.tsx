import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProfile, updateProfile, getPlanoAcao, upsertPlanoAcao, getAnamnese } from '../../lib/supabase'
import type { Profile, PlanoAcao, AnamneseResponse, FaseMenopausa, Objetivo } from '../../types'
import {
  ArrowLeft, Save, Loader2, User, ClipboardList,
  Dumbbell, Apple, Brain, TrendingUp, FileText,
  Scale, Ruler, Calendar, Target, Plus
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

export default function EditUser() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'perfil' | 'plano' | 'anamnese'>('perfil')

  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [idade, setIdade] = useState(0)
  const [peso, setPeso] = useState(0)
  const [altura, setAltura] = useState(0)
  const [faseMenopausa, setFaseMenopausa] = useState<FaseMenopausa>('menopausa')
  const [objetivo, setObjetivo] = useState<Objetivo>('emagrecer')

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

  useEffect(() => {
    if (userId) loadData()
  }, [userId])

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

    // Adicionar nova nota se houver
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
        <button onClick={() => navigate('/admin')} className="btn-primary mt-4">Voltar</button>
      </div>
    )
  }

  const tabs = [
    { key: 'perfil', label: 'Perfil', icon: <User size={14} /> },
    { key: 'plano', label: 'Plano', icon: <ClipboardList size={14} /> },
    { key: 'anamnese', label: 'Anamnese', icon: <FileText size={14} /> },
  ] as const

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate('/admin')}
          className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="page-title truncate">{profile.nome || 'Aluna'}</h1>
          <p className="text-xs text-gray-500 truncate">{profile.email}</p>
        </div>
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
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
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
              placeholder="Descreva o protocolo de treino semanal da aluna...&#10;&#10;Ex: Segunda e Quarta - Treino A (Superior)&#10;Terça e Quinta - Treino B (Inferior)&#10;Sexta - Cardio LISS 40min"
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
              placeholder="Descreva o protocolo nutricional da aluna...&#10;&#10;Ex: Café da manhã: 30g proteína + carboidrato complexo&#10;Almoço: Prato equilibrado com proteína magra&#10;Lanche: Frutas + oleaginosas"
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
              placeholder="Orientações de mentalidade e bem-estar...&#10;&#10;Ex: Meditação guiada 10min pela manhã&#10;Journaling noturno (3 gratidões)&#10;Caminhada na natureza 1x por semana"
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

          {/* Adicionar nota de progresso */}
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
                    {anamnese.historico_familiar.map((h, i) => (
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
