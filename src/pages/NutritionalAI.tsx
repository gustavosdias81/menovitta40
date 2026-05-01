import React, { useState, useRef, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { useAuth } from '../contexts/AuthContext'
import { saveFoodLog, getFoodLogs, getPlanoAcao } from '../lib/supabase'
import type { FoodLog, PlanoAcao } from '../types'
import {
  Camera, Upload, Loader2, Utensils, Plus,
  TrendingUp, X, Sparkles, AlertCircle, Leaf,
  CheckCircle2, Target, ChevronDown, ChevronUp, ChevronRight, Zap
} from 'lucide-react'

// ── IA Nutricional Menovitta (Gemini) ─────────────────────────────────────────
function getGemini() {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (!key) throw new Error('VITE_GEMINI_API_KEY não configurada')
  return new GoogleGenerativeAI(key)
}

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

interface Receita {
  nome: string
  descricao: string
  tempo_preparo: string
  calorias: number
  proteinas: number
  gorduras: number
  carboidratos: number
  ingredientes: string[]
  modo_preparo: string[]
  imagem_termo: string
}

// ── Constantes para Receitas IA ────────────────────────────────────────────────
type HorarioRefeicao = 'cafe' | 'almoco' | 'tarde' | 'jantar'

const HORARIO_LABELS: Record<HorarioRefeicao, string> = {
  cafe: 'Café da Manhã',
  almoco: 'Almoço',
  tarde: 'Café da Tarde',
  jantar: 'Jantar',
}

const HORARIO_EMOJI: Record<HorarioRefeicao, string> = {
  cafe: '☀️',
  almoco: '🌤️',
  tarde: '🌥️',
  jantar: '🌙',
}

const HORARIO_CONTEXTO: Record<HorarioRefeicao, string> = {
  cafe: 'café da manhã energético com alta proteína para começar o dia',
  almoco: 'almoço balanceado com proteína de qualidade e vegetais',
  tarde: 'café da tarde com proteína para manter energia e saciedade',
  jantar: 'jantar leve mas protéico para boa recuperação noturna',
}

// ── Mapeamento de Imagens Unsplash ────────────────────────────────────────────
const FOOD_IMAGES: Record<string, string> = {
  'egg': 'photo-1525351484163-7529414344d8',
  'omelet': 'photo-1525351484163-7529414344d8',
  'smoothie': 'photo-1553530666-ba11a90bb0ae',
  'acai': 'photo-1553530666-ba11a90bb0ae',
  'yogurt': 'photo-1488477181946-6428a0291777',
  'granola': 'photo-1488477181946-6428a0291777',
  'salmon': 'photo-1467003909585-2f8a72700288',
  'fish': 'photo-1467003909585-2f8a72700288',
  'chicken': 'photo-1598103442097-8b74394b95c3',
  'meat': 'photo-1598103442097-8b74394b95c3',
  'salad': 'photo-1512621776951-a57141f2eefd',
  'lettuce': 'photo-1512621776951-a57141f2eefd',
  'soup': 'photo-1547592166-23ac45744acd',
  'broth': 'photo-1547592166-23ac45744acd',
  'rice': 'photo-1536304929831-ee1ca9d44906',
  'quinoa': 'photo-1512621776951-a57141f2eefd',
  'pasta': 'photo-1473093295043-cdd812d0e601',
  'noodle': 'photo-1473093295043-cdd812d0e601',
  'bowl': 'photo-1540189549336-e6e99c3679fe',
  'protein': 'photo-1490645935967-10de6ba17061',
  'vegetables': 'photo-1512621776951-a57141f2eefd',
  'fruit': 'photo-1519996529931-28324d5a630e',
  'bread': 'photo-1509042239860-f550ce710b93',
  'cheese': 'photo-1618164436241-4473940571ce',
  'butter': 'photo-1589985643862-19e6550a5b5b',
  'default': 'photo-1490645935967-10de6ba17061',
}

function getUnsplashUrl(termo: string): string {
  const lower = termo.toLowerCase()
  let key = 'default'
  for (const k of Object.keys(FOOD_IMAGES)) {
    if (lower.includes(k)) {
      key = k
      break
    }
  }
  const photoId = FOOD_IMAGES[key]
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=400&q=80`
}

// ── Geração de Receitas IA ────────────────────────────────────────────────────
async function gerarReceitaIA(horario: HorarioRefeicao, fase: string): Promise<Receita> {
  const genai = getGemini()
  const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

  const contexto = HORARIO_CONTEXTO[horario]
  const prompt = `Você é a IA Menovitta 4.0, nutricionista especializada em mulheres 40+ na menopausa (fase: ${fase}).

Gere EXATAMENTE 1 receita saudável para ${contexto}.

Priorize:
- Alta proteína (para recomposição muscular)
- Alimentos anti-inflamatórios
- Máximo 20 minutos de preparo
- Ingredientes acessíveis no Brasil

Retorne APENAS um JSON válido (sem markdown, sem \`\`\`json) com este formato exato:
{
  "nome": "Nome da receita",
  "descricao": "Uma frase descrevendo a receita",
  "tempo_preparo": "15 min",
  "calorias": 320,
  "proteinas": 25,
  "gorduras": 12,
  "carboidratos": 18,
  "ingredientes": ["Ingrediente 1", "Ingrediente 2", "..."],
  "modo_preparo": ["Passo 1", "Passo 2", "..."],
  "imagem_termo": "termo em inglês para buscar imagem (ex: omelet, salmon, salad)"
}`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
    return JSON.parse(clean) as Receita
  } catch (err) {
    console.error('Erro ao gerar receita:', err)
    throw new Error('Falha ao gerar receita com IA')
  }
}

// ── Análise de foto ───────────────────────────────────────────────────────────
async function analisarPratoIA(imageFile: File): Promise<AnaliseResultado> {
  const genai = getGemini()
  const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(',')[1]) // apenas o base64 puro, sem prefixo data:
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const base64Data = await toBase64(imageFile)
  // Normaliza HEIF/HEIC do iPhone → jpeg
  const mimeType = (imageFile.type === 'image/heif' || imageFile.type === 'image/heic')
    ? 'image/jpeg'
    : (imageFile.type || 'image/jpeg')

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

  const delays = [0, 4000, 10000]
  for (let attempt = 0; attempt < 3; attempt++) {
    if (delays[attempt] > 0) await new Promise(r => setTimeout(r, delays[attempt]))
    try {
      const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64Data, mimeType } },
      ])
      const text = result.response.text().trim()
      const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
      return JSON.parse(clean) as AnaliseResultado
    } catch (err) {
      if (attempt === 2) throw err
    }
  }
  throw new Error('Falha após 3 tentativas')
}

// ── Helper: cor da barra de progresso ────────────────────────────────────────
function barColor(pct: number) {
  if (pct >= 100) return 'bg-red-400'
  if (pct >= 85)  return 'bg-orange-400'
  if (pct >= 50)  return 'bg-rosa-400'
  return 'bg-green-400'
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

  // Receitas IA
  const [receitas, setReceitas] = useState<Record<HorarioRefeicao, Receita | null>>({
    cafe: null,
    almoco: null,
    tarde: null,
    jantar: null,
  })
  const [horarioSelecionado, setHorarioSelecionado] = useState<HorarioRefeicao>('almoco')
  const [loadingReceita, setLoadingReceita] = useState(false)
  const [expandedIngredientes, setExpandedIngredientes] = useState<Record<HorarioRefeicao, boolean>>({
    cafe: false,
    almoco: false,
    tarde: false,
    jantar: false,
  })
  const [expandedPreparo, setExpandedPreparo] = useState<Record<HorarioRefeicao, boolean>>({
    cafe: false,
    almoco: false,
    tarde: false,
    jantar: false,
  })
  const [receitaError, setReceitaError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    if (user) {
      loadTodayData(mounted)
      loadReceitasFromCache()
    }
    return () => { mounted = false }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const RECEITAS_CACHE_KEY = `menovitta_receitas_${user?.id}_${new Date().toISOString().split('T')[0]}`

  const loadReceitasFromCache = () => {
    try {
      const cached = localStorage.getItem(RECEITAS_CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        setReceitas(parsed)
      }
    } catch (err) {
      console.warn('Erro ao carregar cache de receitas:', err)
    }
  }

  const saveReceitasToCache = (r: Record<HorarioRefeicao, Receita | null>) => {
    try {
      localStorage.setItem(RECEITAS_CACHE_KEY, JSON.stringify(r))
    } catch (err) {
      console.warn('Erro ao salvar cache de receitas:', err)
    }
  }

  const handleGerarReceita = async () => {
    if (!profile) return
    setLoadingReceita(true)
    setReceitaError(null)
    try {
      const fase = (profile as { fase_menopausa?: string })?.fase_menopausa || 'menopausa'
      const novaReceita = await gerarReceitaIA(horarioSelecionado, fase)
      const updated = { ...receitas, [horarioSelecionado]: novaReceita }
      setReceitas(updated)
      saveReceitasToCache(updated)
    } catch (err) {
      console.error('Erro ao gerar receita:', err)
      setReceitaError(err instanceof Error ? err.message : 'Erro ao gerar receita')
    } finally {
      setLoadingReceita(false)
    }
  }

  const handleSalvarReceita = async () => {
    const receita = receitas[horarioSelecionado]
    if (!user || !receita) return

    try {
      await saveFoodLog({
        user_id: user.id,
        descricao: receita.nome,
        calorias: receita.calorias,
        proteinas: receita.proteinas,
        gorduras: receita.gorduras,
        carboidratos: receita.carboidratos,
        refeicao: horarioSelecionado === 'cafe' ? 'cafe_manha' : horarioSelecionado === 'almoco' ? 'almoco' : horarioSelecionado === 'tarde' ? 'lanche' : 'jantar',
        data: new Date().toISOString().split('T')[0],
      })
      await loadTodayData()
    } catch (err) {
      console.error('Erro ao salvar receita:', err)
      setReceitaError('Erro ao salvar receita')
    }
  }

  const loadTodayData = async (mounted = true) => {
    if (!user) return
    try {
      const today = new Date().toISOString().split('T')[0]
      const [logsRes, planoRes] = await Promise.all([
        getFoodLogs(user.id, today),
        getPlanoAcao(user.id),
      ])
      if (!mounted) return
      if (logsRes.data)  setTodayLogs(logsRes.data as FoodLog[])
      if (planoRes.data) setPlano(planoRes.data as PlanoAcao)
    } catch (err) {
      console.error('NutritionalAI loadTodayData error:', err)
      // silencia — página renderiza com estado padrão (metas default)
    }
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
    } catch (err: unknown) {
      console.error('Erro análise IA:', err)
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('VITE_GEMINI_API_KEY')) {
        setScanError('Chave da IA não configurada no Vercel. Adicione VITE_GEMINI_API_KEY nas variáveis de ambiente.')
      } else if (msg.includes('401') || msg.includes('API key') || msg.includes('API_KEY_INVALID')) {
        setScanError('Chave da IA inválida ou sem permissão. Verifique a chave no Vercel.')
      } else if (msg.includes('quota') || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
        setScanError('Limite de requisições atingido. Aguarde alguns minutos e tente novamente.')
      } else {
        setScanError(`Erro ao analisar: ${msg.slice(0, 100)}`)
      }
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
        <h1 className="page-title">Nutrição</h1>
        <span className="text-[10px] bg-rosa-100 text-rosa-600 px-2 py-0.5 rounded-full font-semibold">Menovitta</span>
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

        {/* Dica Menovitta */}
        <div className="mt-3 bg-rosa-50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={13} className="text-rosa-500" />
            <span className="text-xs font-semibold text-rosa-700">Dica Menovitta</span>
          </div>
          <p className="text-xs text-rosa-600">
            {consumido.calorias === 0
              ? `Comece registrando suas refeições. Sua meta é ${meta.calorias} kcal com ${meta.proteinas}g de proteína.`
              : faltam.calorias > 0
                ? `Faltam ${Math.round(faltam.calorias)} kcal e ${Math.round(faltam.proteinas)}g de proteína para atingir sua meta de hoje.`
                : consumido.calorias > meta.calorias
                  ? `Você ultrapassou ${Math.round(consumido.calorias - meta.calorias)} kcal da sua meta hoje. Prefira refeições mais leves nas próximas.`
                  : 'Parabéns! Você atingiu sua meta calórica hoje. Priorize proteína nas próximas refeições.'}
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          SCANNER DE PRATOS
      ══════════════════════════════════════════════════ */}
      <div>
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
                <Sparkles size={11} /> IA Nutricional Menovitta
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
                  {analyzing ? <><Loader2 className="w-5 h-5 animate-spin" /> Analisando com IA Menovitta...</> : <><Sparkles size={18} /> Analisar com IA</>}
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
      </div>

      {/* ══════════════════════════════════════════════════
          RECEITAS IA PERSONALIZADAS
      ══════════════════════════════════════════════════ */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-rosa-500" />
          <h2 className="font-semibold text-gray-800">Receitas do Dia</h2>
          <span className="text-[10px] bg-rosa-100 text-rosa-600 px-2 py-0.5 rounded-full font-medium">Menovitta IA</span>
        </div>
        <p className="text-xs text-gray-500 mb-4">1 receita por refeição, gerada pela IA Menovitta 4.0</p>

        {/* Tabs para horários */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {(Object.entries(HORARIO_LABELS) as [HorarioRefeicao, string][]).map(([hora, label]) => (
            <button
              key={hora}
              onClick={() => setHorarioSelecionado(hora)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg whitespace-nowrap transition-all flex-shrink-0 ${
                horarioSelecionado === hora
                  ? 'bg-rosa-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{HORARIO_EMOJI[hora]}</span>
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Erro */}
        {receitaError && (
          <div className="flex items-start gap-2 bg-red-50 text-red-600 text-xs px-3 py-2.5 rounded-xl mb-3">
            <AlertCircle size={14} className="mt-0.5 shrink-0" /> {receitaError}
          </div>
        )}

        {/* Receita ou botão para gerar */}
        {!receitas[horarioSelecionado] ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 bg-rosa-50 rounded-full flex items-center justify-center">
              <Zap size={28} className="text-rosa-500" />
            </div>
            <p className="text-sm text-gray-600 mb-4">Clique para gerar uma receita personalizada</p>
            <button
              onClick={handleGerarReceita}
              disabled={loadingReceita}
              className="btn-gold w-full flex items-center justify-center gap-2"
            >
              {loadingReceita ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Gerando receita...</>
              ) : (
                <><Sparkles size={18} /> Gerar Receita</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header da receita */}
            <div className="bg-green-50 rounded-2xl p-4">
              <h3 className="font-semibold text-green-800 text-base mb-1">{receitas[horarioSelecionado].nome}</h3>
              <p className="text-xs text-green-700">{receitas[horarioSelecionado].descricao}</p>
            </div>

            {/* Imagem */}
            <img
              src={getUnsplashUrl(receitas[horarioSelecionado].imagem_termo)}
              alt={receitas[horarioSelecionado].nome}
              className="w-full h-40 object-cover rounded-2xl"
            />

            {/* Tempo de preparo */}
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-lg">⏱️</span>
              <span>{receitas[horarioSelecionado].tempo_preparo}</span>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Calorias', val: receitas[horarioSelecionado].calorias, unit: '', bg: 'bg-orange-50', cor: 'text-orange-500' },
                { label: 'Proteínas', val: receitas[horarioSelecionado].proteinas, unit: 'g', bg: 'bg-red-50', cor: 'text-red-500' },
                { label: 'Gorduras', val: receitas[horarioSelecionado].gorduras, unit: 'g', bg: 'bg-yellow-50', cor: 'text-yellow-600' },
                { label: 'Carbos', val: receitas[horarioSelecionado].carboidratos, unit: 'g', bg: 'bg-blue-50', cor: 'text-blue-500' },
              ].map((m, i) => (
                <div key={i} className={`${m.bg} rounded-xl p-3 text-center`}>
                  <p className={`text-2xl font-bold ${m.cor}`}>{m.val}{m.unit}</p>
                  <p className="text-xs text-gray-500">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Ingredientes expandível */}
            <div>
              <button
                onClick={() => setExpandedIngredientes({
                  ...expandedIngredientes,
                  [horarioSelecionado]: !expandedIngredientes[horarioSelecionado],
                })}
                className="w-full flex items-center justify-between bg-gray-50 rounded-xl p-3"
              >
                <span className="text-sm font-semibold text-gray-800">Ingredientes</span>
                {expandedIngredientes[horarioSelecionado] ? (
                  <ChevronUp size={18} className="text-gray-400" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </button>
              {expandedIngredientes[horarioSelecionado] && (
                <div className="mt-2 space-y-1">
                  {receitas[horarioSelecionado].ingredientes.map((ing, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-700 bg-gray-50 p-2 rounded">
                      <span className="text-rosa-500 font-bold">•</span>
                      <span>{ing}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modo de preparo expandível */}
            <div>
              <button
                onClick={() => setExpandedPreparo({
                  ...expandedPreparo,
                  [horarioSelecionado]: !expandedPreparo[horarioSelecionado],
                })}
                className="w-full flex items-center justify-between bg-gray-50 rounded-xl p-3"
              >
                <span className="text-sm font-semibold text-gray-800">Modo de Preparo</span>
                {expandedPreparo[horarioSelecionado] ? (
                  <ChevronUp size={18} className="text-gray-400" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </button>
              {expandedPreparo[horarioSelecionado] && (
                <div className="mt-2 space-y-2">
                  {receitas[horarioSelecionado].modo_preparo.map((passo, i) => (
                    <div key={i} className="flex gap-3 text-xs text-gray-700">
                      <span className="font-bold text-rosa-500 min-w-5">{i + 1}.</span>
                      <span>{passo}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGerarReceita}
                disabled={loadingReceita}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                {loadingReceita ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight size={16} />}
                Outra
              </button>
              <button
                onClick={handleSalvarReceita}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Salvar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Resumo de Macros: faltam ou ultrapassou ── */}
      <div className="card py-3 mb-4">
        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
          <Target size={12} className="text-rosa-400" />
          {consumido.calorias > meta.calorias
            ? 'Você ultrapassou hoje:'
            : 'Ainda faltam hoje:'}
        </p>
        <div className="flex gap-2">
          {(consumido.calorias > meta.calorias
            ? [
                { label: 'kcal', val: consumido.calorias - meta.calorias,     cor: 'text-red-500 bg-red-50' },
                { label: 'prot', val: Math.max(0, consumido.proteinas - meta.proteinas),    cor: 'text-red-500 bg-red-50' },
                { label: 'carb', val: Math.max(0, consumido.carboidratos - meta.carboidratos), cor: 'text-red-500 bg-red-50' },
                { label: 'gord', val: Math.max(0, consumido.gorduras - meta.gorduras),     cor: 'text-red-500 bg-red-50' },
              ]
            : [
                { label: 'kcal', val: faltam.calorias,     cor: 'text-orange-500 bg-orange-50' },
                { label: 'prot', val: faltam.proteinas,    cor: 'text-red-500 bg-red-50' },
                { label: 'carb', val: faltam.carboidratos, cor: 'text-blue-500 bg-blue-50' },
                { label: 'gord', val: faltam.gorduras,     cor: 'text-yellow-600 bg-yellow-50' },
              ]
          ).map((m, i) => (
            <div key={i} className={`flex-1 rounded-xl p-2 text-center ${m.cor.split(' ')[1]}`}>
              <p className={`text-sm font-bold ${m.cor.split(' ')[0]}`}>{Math.round(m.val)}</p>
              <p className="text-[9px] text-gray-400">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Orientações Nutricionais da Fase ── */}
      {(() => {
        const fase = (profile as { fase_menopausa?: string })?.fase_menopausa || 'menopausa'
        const nutr: Record<string, { dicas: string[]; alimentos: string[]; evitar: string[] }> = {
          pre_menopausa: {
            dicas: ['Priorize 25–30g de proteína por refeição', 'Inclua fibras em cada refeição', 'Mínimo 2L de água por dia', 'Refeições a cada 3–4 horas'],
            alimentos: ['Frango e peixe', 'Ovos', 'Quinoa e aveia', 'Frutas vermelhas', 'Folhosos verdes', 'Azeite extra-virgem'],
            evitar: ['Açúcar refinado', 'Ultra processados', 'Álcool em excesso', 'Excesso de sódio'],
          },
          menopausa: {
            dicas: ['Proteína: 1,3–1,5g por kg/dia', 'Priorize cálcio e Vitamina D', 'Reduza carboidratos simples', 'Inclua fitoestrógenos (soja, linhaça)'],
            alimentos: ['Sardinha e salmão', 'Iogurte grego', 'Linhaça e chia', 'Grão-de-bico', 'Tofu', 'Couve e brócolis'],
            evitar: ['Cafeína excessiva', 'Alimentos picantes', 'Álcool', 'Farinhas brancas'],
          },
          pos_menopausa: {
            dicas: ['Proteína: 1,4–1,6g/kg contra sarcopenia', 'Cálcio + Vit D diariamente', 'Ômega-3 para coração e cérebro', 'Refeições menores e frequentes'],
            alimentos: ['Peixes gordurosos', 'Ovos caipiras', 'Laticínios com Ca', 'Vegetais coloridos', 'Sementes', 'Chá verde'],
            evitar: ['Sódio elevado', 'Gordura saturada', 'Álcool', 'Açúcar refinado'],
          },
        }
        const n = nutr[fase] || nutr['menopausa']
        return (
          <div className="mt-4 space-y-3">
            <div className="relative rounded-2xl overflow-hidden h-24">
              <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80"
                alt="Nutrição" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex flex-col justify-end p-3"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)' }}>
                <p className="font-serif text-base font-bold text-white">🥗 Orientações da Sua Fase</p>
              </div>
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-2">
                <Sparkles size={14} className="text-rosa-500" /> Dicas Essenciais Menovitta
              </h3>
              <div className="space-y-2">
                {n.dicas.map((dica, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-rosa-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[9px] text-rosa-600 font-bold">{i + 1}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{dica}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="card">
                <p className="text-xs font-semibold text-green-700 mb-2">✓ Priorize</p>
                <div className="space-y-1">
                  {n.alimentos.map((a, i) => (
                    <p key={i} className="text-[11px] text-gray-600">• {a}</p>
                  ))}
                </div>
              </div>
              <div className="card">
                <p className="text-xs font-semibold text-red-500 mb-2">✗ Evite</p>
                <div className="space-y-1">
                  {n.evitar.map((a, i) => (
                    <p key={i} className="text-[11px] text-gray-600">• {a}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

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
