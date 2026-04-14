import React, { useState, useRef, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { useAuth } from '../contexts/AuthContext'
import { saveFoodLog, getFoodLogs, getPlanoAcao } from '../lib/supabase'
import type { FoodLog, PlanoAcao } from '../types'
import {
  Camera, Upload, Loader2, Utensils, Plus,
  TrendingUp, X, Sparkles, ChevronDown, ChevronUp,
  AlertCircle, Leaf, ChefHat, Clock, CheckCircle2,
  Apple, Flame, Zap, Target
} from 'lucide-react'

// ── Gemini 1.5 Flash ──────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface AnaliseResultado {
  descricao: string
  calorias: number
  proteinas: number
  gorduras: number
  carboidratos: number
  fibras: number
  alimentos_detectados: string[]
  confianca: number
  dica_menopausa: string
}

interface Sugestao {
  nome: string
  descricao: string
  calorias: number
  proteinas: number
  gorduras: number
  carboidratos: number
  tempo_preparo: string
  ingredientes: string[]
  modo_preparo: string[]
  imagem_termo: string
}

// ── Análise de foto ───────────────────────────────────────────────────────────
async function analisarPratoIA(imageFile: File): Promise<AnaliseResultado> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve((reader.result as string).split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const base64 = await toBase64(imageFile)

  const prompt = `Analise esta foto de refeição e retorne um JSON com análise nutricional estimada.
Contexto: App de saúde para mulheres 40+ na menopausa que buscam emagrecer.

Retorne APENAS um JSON válido (sem markdown, sem \`\`\`json) com este formato exato:
{
  "descricao": "Descrição resumida do prato em português",
  "calorias": <número inteiro>,
  "proteinas": <gramas com 1 decimal>,
  "gorduras": <gramas com 1 decimal>,
  "carboidratos": <gramas com 1 decimal>,
  "fibras": <gramas com 1 decimal>,
  "alimentos_detectados": ["alimento1", "alimento2"],
  "confianca": <número entre 0 e 1>,
  "dica_menopausa": "Uma dica específica sobre como este prato impacta o emagrecimento/saúde na menopausa"
}

Se não conseguir identificar alimentos, retorne confianca: 0 e calorias: 0.`

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType: imageFile.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/heic', data: base64 } },
  ])

  const clean = result.response.text().trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
  return JSON.parse(clean) as AnaliseResultado
}

// ── Sugestões de refeições ────────────────────────────────────────────────────
async function gerarSugestoesIA(
  faltamCal: number, faltamProt: number, faltamGord: number, faltamCarb: number,
  faseMenopausa: string
): Promise<Sugestao[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `Você é nutricionista especializada em mulheres 40+ na menopausa (fase: ${faseMenopausa}).
A aluna ainda precisa consumir hoje:
- ${Math.round(faltamCal)} kcal
- ${Math.round(faltamProt)}g de proteína
- ${Math.round(faltamGord)}g de gordura
- ${Math.round(faltamCarb)}g de carboidrato

Sugira 3 refeições rápidas, saborosas e saudáveis para completar essas metas.
Priorize alimentos anti-inflamatórios, ricos em proteína e adequados à menopausa.
As receitas devem ser simples (max 15 min de preparo), com ingredientes acessíveis no Brasil.

Retorne APENAS um JSON array válido (sem markdown, sem \`\`\`json) com este formato:
[
  {
    "nome": "Nome apetitoso da refeição",
    "descricao": "Descrição curta e apetitosa em 1 frase",
    "calorias": <número inteiro>,
    "proteinas": <número com 1 decimal>,
    "gorduras": <número com 1 decimal>,
    "carboidratos": <número com 1 decimal>,
    "tempo_preparo": "X min",
    "ingredientes": ["quantidade + ingrediente", ...],
    "modo_preparo": ["Passo 1 curto", "Passo 2 curto", "Passo 3 curto"],
    "imagem_termo": "food search term in English (e.g. 'grilled salmon salad')"
  }
]`

  const result = await model.generateContent(prompt)
  const clean = result.response.text().trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
  return JSON.parse(clean) as Sugestao[]
}

// ── Helper: cor da barra de progresso ────────────────────────────────────────
function barColor(pct: number) {
  if (pct >= 100) return 'bg-red-400'
  if (pct >= 85)  return 'bg-orange-400'
  if (pct >= 50)  return 'bg-rosa-400'
  return 'bg-green-400'
}

// ── Imagem de comida via Unsplash ─────────────────────────────────────────────
function foodImageUrl(termo: string) {
  return `https://source.unsplash.com/400x280/?${encodeURIComponent(termo + ',food,healthy')}`
}

// ─────────────────────────────────────────────────────────────────────────────

export default function NutritionalAI() {
  const { user, profile } = useAuth()
  const fileInputRef    = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  // Scanner
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile,    setImageFile]    = useState<File | null>(null)
  const [analyzing,    setAnalyzing]    = useState(false)
  const [resultado,    setResultado]    = useState<AnaliseResultado | null>(null)
  const [refeicao,     setRefeicao]     = useState('almoco')
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [scanError,    setScanError]    = useState<string | null>(null)

  // Dia
  const [todayLogs,  setTodayLogs]  = useState<FoodLog[]>([])
  const [plano,      setPlano]      = useState<PlanoAcao | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  // Sugestões IA
  const [sugestoes,        setSugestoes]        = useState<Sugestao[] | null>(null)
  const [loadingSugestoes, setLoadingSugestoes] = useState(false)
  const [sugestaoAberta,   setSugestaoAberta]   = useState<number | null>(null)
  const [sugestaoError,    setSugestaoError]    = useState<string | null>(null)

  // Tabs
  const [tab, setTab] = useState<'scanner' | 'sugestoes'>('scanner')

  useEffect(() => { if (user) loadTodayData() }, [user])

  const loadTodayData = async () => {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    const [logsRes, planoRes] = await Promise.all([getFoodLogs(user.id, today), getPlanoAcao(user.id)])
    if (logsRes.data)  setTodayLogs(logsRes.data as FoodLog[])
    if (planoRes.data) setPlano(planoRes.data as PlanoAcao)
  }

  // ── Metas e consumo ──────────────────────────────────────────────────────────
  const meta = {
    calorias:     plano?.meta_calorias     || 1600,
    proteinas:    plano?.meta_proteinas    || 90,
    gorduras:     plano?.meta_gorduras     || 55,
    carboidratos: plano?.meta_carboidratos || 180,
  }

  const consumido = todayLogs.reduce(
    (acc, log) => ({
      calorias:     acc.calorias     + (log.calorias     || 0),
      proteinas:    acc.proteinas    + Number(log.proteinas    || 0),
      gorduras:     acc.gorduras     + Number(log.gorduras     || 0),
      carboidratos: acc.carboidratos + Number(log.carboidratos || 0),
    }),
    { calorias: 0, proteinas: 0, gorduras: 0, carboidratos: 0 }
  )

  const faltam = {
    calorias:     Math.max(0, meta.calorias     - consumido.calorias),
    proteinas:    Math.max(0, meta.proteinas    - consumido.proteinas),
    gorduras:     Math.max(0, meta.gorduras     - consumido.gorduras),
    carboidratos: Math.max(0, meta.carboidratos - consumido.carboidratos),
  }

  const refeicaoLabels: Record<string, string> = {
    cafe_manha: 'Café da Manhã', almoco: 'Almoço',
    lanche: 'Lanche', jantar: 'Jantar', outro: 'Outro',
  }

  // ── Scanner handlers ─────────────────────────────────────────────────────────
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file); setResultado(null); setSaved(false); setScanError(null)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleAnalyze = async () => {
    if (!imageFile) return
    setAnalyzing(true); setScanError(null)
    try {
      const r = await analisarPratoIA(imageFile)
      if (r.confianca === 0) setScanError('Não consegui identificar alimentos. Tente uma foto mais próxima do prato.')
      else setResultado(r)
    } catch {
      setScanError('Erro ao analisar. Verifique sua conexão e tente novamente.')
    } finally { setAnalyzing(false) }
  }

  const handleSave = async () => {
    if (!user || !resultado) return
    setSaving(true)
    await saveFoodLog({
      user_id: user.id, descricao: resultado.descricao,
      calorias: resultado.calorias, proteinas: resultado.proteinas,
      gorduras: resultado.gorduras, carboidratos: resultado.carboidratos,
      fibras: resultado.fibras, refeicao,
      data: new Date().toISOString().split('T')[0],
    })
    setSaved(true); setSaving(false)
    await loadTodayData()
  }

  const resetScanner = () => {
    setImagePreview(null); setImageFile(null); setResultado(null); setSaved(false); setScanError(null)
  }

  // ── Sugestões handler ────────────────────────────────────────────────────────
  const handleGerarSugestoes = async () => {
    setLoadingSugestoes(true); setSugestaoError(null); setSugestoes(null); setSugestaoAberta(null)
    try {
      const fase = (profile as { fase_menopausa?: string })?.fase_menopausa || 'menopausa'
      const s = await gerarSugestoesIA(faltam.calorias, faltam.proteinas, faltam.gorduras, faltam.carboidratos, fase)
      setSugestoes(s)
    } catch {
      setSugestaoError('Erro ao gerar sugestões. Tente novamente.')
    } finally { setLoadingSugestoes(false) }
  }

  const pct = (v: number, total: number) => Math.min(100, Math.round((v / total) * 100))

  // ── MACROS DO DIA (usados em ambas as abas) ──────────────────────────────────
  const macros = [
    { label: 'Kcal',  consumido: consumido.calorias,     meta: meta.calorias,     falta: faltam.calorias,     cor: 'text-orange-500', bg: 'bg-orange-50', unit: '' },
    { label: 'Prot',  consumido: consumido.proteinas,    meta: meta.proteinas,    falta: faltam.proteinas,    cor: 'text-red-500',    bg: 'bg-red-50',    unit: 'g' },
    { label: 'Gord',  consumido: consumido.gorduras,     meta: meta.gorduras,     falta: faltam.gorduras,     cor: 'text-yellow-600', bg: 'bg-yellow-50', unit: 'g' },
    { label: 'Carb',  consumido: consumido.carboidratos, meta: meta.carboidratos, falta: faltam.carboidratos, cor: 'text-blue-500',   bg: 'bg-blue-50',   unit: 'g' },
  ]

  return (
    <div className="page-container">

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <h1 className="page-title">IA Nutricional</h1>
        <span className="text-[10px] bg-rosa-100 text-rosa-600 px-2 py-0.5 rounded-full font-semibold">Gemini AI</span>
      </div>
      <p className="page-subtitle mb-4">Controle seus macros e receba sugestões personalizadas</p>

      {/* ── Resumo do Dia ── */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
            <TrendingUp size={16} className="text-rosa-500" /> Seu Dia
          </h2>
          <span className="text-xs text-gray-400">{todayLogs.length} refeição{todayLogs.length !== 1 ? 'ões' : ''}</span>
        </div>

        {/* Barras de progresso */}
        <div className="space-y-2.5 mb-4">
          {macros.map((m, i) => {
            const p = pct(m.consumido, m.meta)
            return (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={`font-semibold ${m.cor}`}>{m.label}</span>
                  <span className="text-gray-500">
                    <span className="font-medium text-gray-700">{Math.round(m.consumido)}{m.unit}</span>
                    {' / '}{m.meta}{m.unit}
                    {m.falta > 0 && <span className="text-green-600 ml-1">(faltam {Math.round(m.falta)}{m.unit})</span>}
                    {m.falta === 0 && <span className="text-orange-500 ml-1">✓ meta atingida</span>}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${barColor(p)}`} style={{ width: `${p}%` }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Cards resumo */}
        <div className="grid grid-cols-4 gap-2">
          {macros.map((m, i) => (
            <div key={i} className={`rounded-xl p-2 text-center ${m.bg}`}>
              <p className={`text-base font-bold ${m.cor}`}>{Math.round(m.consumido)}</p>
              <p className="text-[10px] text-gray-400">/ {m.meta}{m.unit}</p>
              <p className="text-[10px] text-gray-500">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Dica IA do dia */}
        <div className="mt-3 bg-rosa-50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={13} className="text-rosa-500" />
            <span className="text-xs font-semibold text-rosa-700">Dica do Dia</span>
          </div>
          <p className="text-xs text-rosa-600">
            {consumido.calorias === 0
              ? `Comece registrando suas refeições. Sua meta é ${meta.calorias} kcal com ${meta.proteinas}g de proteína.`
              : faltam.calorias > 0
                ? `Faltam ${Math.round(faltam.calorias)} kcal e ${Math.round(faltam.proteinas)}g de proteína. Veja as sugestões da IA abaixo!`
                : 'Parabéns! Você atingiu sua meta calórica hoje. Priorize proteína nas próximas refeições.'}
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-4">
        {[
          { key: 'scanner'  as const, label: 'Scanner de Prato', icon: <Camera size={15} /> },
          { key: 'sugestoes' as const, label: 'Sugestões IA',     icon: <ChefHat size={15} /> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              tab === t.key ? 'bg-white text-rosa-500 shadow-sm' : 'text-gray-500'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════
          ABA SCANNER
      ══════════════════════════════════════════════════ */}
      {tab === 'scanner' && (
        <div className="card mb-4">
          <input ref={fileInputRef}    type="file" accept="image/*" capture="environment" onChange={handleImageSelect} className="hidden" />
          <input ref={galleryInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

          {!imagePreview ? (
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-rosa-50 rounded-full flex items-center justify-center">
                <Camera size={32} className="text-rosa-500" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Escaneie seu Prato</h3>
              <p className="text-xs text-gray-400 mb-1">Foto → macros automáticos com IA</p>
              <p className="text-[10px] text-rosa-400 mb-5 flex items-center justify-center gap-1">
                <Sparkles size={11} /> Gemini 1.5 Flash
              </p>
              <div className="flex gap-3">
                <button onClick={() => fileInputRef.current?.click()} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Camera size={18} /> Tirar Foto
                </button>
                <button onClick={() => galleryInputRef.current?.click()} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                  <Upload size={18} /> Galeria
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Preview */}
              <div className="relative mb-4">
                <img src={imagePreview} alt="Prato" className="w-full h-52 object-cover rounded-2xl" />
                <button onClick={resetScanner} className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
                  <X size={16} className="text-white" />
                </button>
              </div>

              {/* Tipo de refeição */}
              <div className="mb-4">
                <label className="label-field">Tipo de Refeição</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(refeicaoLabels).map(([key, label]) => (
                    <button key={key} onClick={() => setRefeicao(key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${refeicao === key ? 'bg-rosa-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Erro */}
              {scanError && (
                <div className="flex items-start gap-2 bg-red-50 text-red-600 text-xs px-3 py-2.5 rounded-xl mb-3">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" /> {scanError}
                </div>
              )}

              {/* Botão analisar */}
              {!resultado && (
                <button onClick={handleAnalyze} disabled={analyzing} className="btn-gold w-full flex items-center justify-center gap-2">
                  {analyzing ? <><Loader2 className="w-5 h-5 animate-spin" /> Analisando com Gemini AI...</> : <><Sparkles size={18} /> Analisar com IA</>}
                </button>
              )}

              {/* Resultado */}
              {resultado && (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="bg-green-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={16} className="text-green-600" />
                      <span className="font-semibold text-green-700 text-sm">Análise Concluída</span>
                      <span className="text-[10px] bg-green-200 text-green-700 px-2 py-0.5 rounded-full ml-auto">{Math.round(resultado.confianca * 100)}% confiança</span>
                    </div>
                    <p className="text-sm text-green-800">{resultado.descricao}</p>
                  </div>

                  {/* Alimentos */}
                  <div>
                    <p className="text-[11px] text-gray-400 mb-1.5 font-medium">Detectados:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {resultado.alimentos_detectados.map((a, i) => (
                        <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">{a}</span>
                      ))}
                    </div>
                  </div>

                  {/* Macros */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Calorias',     val: resultado.calorias,      unit: '',  bg: 'bg-orange-50', cor: 'text-orange-500' },
                      { label: 'Proteínas',    val: resultado.proteinas,     unit: 'g', bg: 'bg-red-50',    cor: 'text-red-500' },
                      { label: 'Gorduras',     val: resultado.gorduras,      unit: 'g', bg: 'bg-yellow-50', cor: 'text-yellow-600' },
                      { label: 'Carboidratos', val: resultado.carboidratos,  unit: 'g', bg: 'bg-blue-50',   cor: 'text-blue-500' },
                    ].map((m, i) => (
                      <div key={i} className={`${m.bg} rounded-xl p-3 text-center`}>
                        <p className={`text-2xl font-bold ${m.cor}`}>{m.val}{m.unit}</p>
                        <p className="text-xs text-gray-500">{m.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Fibras */}
                  {resultado.fibras > 0 && (
                    <div className="bg-green-50 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2"><Leaf size={14} className="text-green-600" /><span className="text-xs text-green-700 font-medium">Fibras</span></div>
                      <span className="text-sm font-bold text-green-600">{resultado.fibras}g</span>
                    </div>
                  )}

                  {/* Dica menopausa */}
                  {resultado.dica_menopausa && (
                    <div className="bg-rosa-50 rounded-xl p-3 border border-rosa-100">
                      <div className="flex items-start gap-2">
                        <Sparkles size={14} className="text-rosa-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-rosa-700 mb-0.5">Dica para sua fase:</p>
                          <p className="text-xs text-rosa-600">{resultado.dica_menopausa}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Salvar */}
                  {!saved ? (
                    <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus size={18} /> Salvar Refeição</>}
                    </button>
                  ) : (
                    <div className="text-center py-3">
                      <p className="text-green-600 font-semibold text-sm flex items-center justify-center gap-2">
                        <CheckCircle2 size={16} /> Refeição salva!
                      </p>
                      <button onClick={resetScanner} className="text-rosa-500 text-sm mt-2 underline">Escanear outro prato</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          ABA SUGESTÕES
      ══════════════════════════════════════════════════ */}
      {tab === 'sugestoes' && (
        <div className="space-y-4">

          {/* Card: o que falta */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-rosa-500" />
              <h3 className="font-semibold text-gray-800 text-sm">O que ainda precisa consumir hoje</h3>
            </div>

            {faltam.calorias === 0 && faltam.proteinas === 0 ? (
              <div className="text-center py-4">
                <CheckCircle2 size={32} className="mx-auto text-green-500 mb-2" />
                <p className="font-semibold text-green-700 text-sm">Metas atingidas!</p>
                <p className="text-xs text-gray-400 mt-1">Você completou suas metas nutricionais de hoje.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { icon: <Flame size={14} />, label: 'Calorias',     val: faltam.calorias,     unit: 'kcal', cor: 'text-orange-500 bg-orange-50' },
                    { icon: <Zap size={14} />,   label: 'Proteína',     val: faltam.proteinas,    unit: 'g',    cor: 'text-red-500 bg-red-50' },
                    { icon: <Apple size={14} />, label: 'Carboidratos', val: faltam.carboidratos, unit: 'g',    cor: 'text-blue-500 bg-blue-50' },
                    { icon: <Leaf size={14} />,  label: 'Gorduras',     val: faltam.gorduras,     unit: 'g',    cor: 'text-yellow-600 bg-yellow-50' },
                  ].map((m, i) => (
                    <div key={i} className={`rounded-xl p-3 flex items-center gap-2 ${m.cor.split(' ')[1]}`}>
                      <span className={m.cor.split(' ')[0]}>{m.icon}</span>
                      <div>
                        <p className={`text-base font-bold ${m.cor.split(' ')[0]}`}>{Math.round(m.val)}{m.unit}</p>
                        <p className="text-[10px] text-gray-500">{m.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleGerarSugestoes}
                  disabled={loadingSugestoes}
                  className="btn-gold w-full flex items-center justify-center gap-2"
                >
                  {loadingSugestoes
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Gerando sugestões com IA...</>
                    : <><ChefHat size={18} /> {sugestoes ? 'Gerar novas sugestões' : 'Sugerir o que comer agora'}</>
                  }
                </button>

                {sugestaoError && (
                  <div className="flex items-start gap-2 bg-red-50 text-red-600 text-xs px-3 py-2.5 rounded-xl mt-3">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" /> {sugestaoError}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Cards de sugestões */}
          {sugestoes && sugestoes.map((s, i) => (
            <div key={i} className="card overflow-hidden p-0">
              {/* Imagem */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={foodImageUrl(s.imagem_termo)}
                  alt={s.nome}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80`
                  }}
                />
                <div className="absolute inset-0 flex flex-col justify-end p-4"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 60%)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-ouro-400 text-white px-2 py-0.5 rounded-full font-semibold">Sugestão {i + 1}</span>
                    <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock size={10} /> {s.tempo_preparo}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base mt-1">{s.nome}</h3>
                  <p className="text-white/80 text-xs">{s.descricao}</p>
                </div>
              </div>

              <div className="p-4">
                {/* Macros da sugestão */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { label: 'Kcal', val: s.calorias,     cor: 'text-orange-500 bg-orange-50', unit: '' },
                    { label: 'Prot', val: s.proteinas,    cor: 'text-red-500 bg-red-50',       unit: 'g' },
                    { label: 'Gord', val: s.gorduras,     cor: 'text-yellow-600 bg-yellow-50', unit: 'g' },
                    { label: 'Carb', val: s.carboidratos, cor: 'text-blue-500 bg-blue-50',     unit: 'g' },
                  ].map((m, j) => (
                    <div key={j} className={`rounded-xl p-2 text-center ${m.cor.split(' ')[1]}`}>
                      <p className={`text-sm font-bold ${m.cor.split(' ')[0]}`}>{Math.round(m.val)}{m.unit}</p>
                      <p className="text-[10px] text-gray-400">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Toggle receita */}
                <button
                  onClick={() => setSugestaoAberta(sugestaoAberta === i ? null : i)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-rosa-500 py-2 border-t border-gray-100"
                >
                  <span className="flex items-center gap-2"><ChefHat size={15} /> Ver Receita Completa</span>
                  {sugestaoAberta === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {sugestaoAberta === i && (
                  <div className="mt-3 space-y-4">
                    {/* Ingredientes */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                        <Utensils size={13} className="text-rosa-400" /> Ingredientes
                      </p>
                      <ul className="space-y-1">
                        {s.ingredientes.map((ing, j) => (
                          <li key={j} className="text-xs text-gray-600 flex items-start gap-2">
                            <span className="text-rosa-400 mt-0.5 shrink-0">•</span> {ing}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Modo de preparo */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                        <ChefHat size={13} className="text-rosa-400" /> Modo de Preparo
                      </p>
                      <ol className="space-y-2">
                        {s.modo_preparo.map((passo, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-rosa-100 text-rosa-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{j + 1}</span>
                            <p className="text-xs text-gray-600">{passo}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Histórico do dia ── */}
      {todayLogs.length > 0 && (
        <div className="card mt-4">
          <button onClick={() => setShowHistory(!showHistory)} className="w-full flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <Utensils size={16} className="text-rosa-500" /> Refeições de Hoje ({todayLogs.length})
            </h3>
            {showHistory ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>

          {showHistory && (
            <div className="mt-3 space-y-2">
              {todayLogs.map((log, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-700">{refeicaoLabels[log.refeicao] || log.refeicao}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{log.descricao}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-500">{log.calorias} kcal</p>
                    <p className="text-[10px] text-gray-400">P:{log.proteinas}g G:{log.gorduras}g C:{log.carboidratos}g</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
