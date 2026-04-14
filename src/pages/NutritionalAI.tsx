import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { saveFoodLog, getFoodLogs, getPlanoAcao } from '../lib/supabase'
import type { FoodLog, PlanoAcao } from '../types'
import {
  Camera, Upload, Loader2, Utensils, Plus,
  TrendingUp, X, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react'

// ============================================================
// INTEGRAÇÃO COM IA DE VISÃO COMPUTACIONAL
// ============================================================
// RECOMENDAÇÃO: Use a API da Clarifai (modelo "food-item-recognition")
// ou a API do Google Cloud Vision + Nutritionix para obter dados
// nutricionais a partir da foto.
//
// Para o MVP, a função abaixo simula a análise. Substitua pela
// chamada real à API quando configurar as credenciais.
//
// Alternativas de API recomendadas:
// 1. Clarifai Food Model: https://clarifai.com (US$ 0,0025/chamada)
// 2. LogMeal API: https://logmeal.com/api (especializado em nutrição)
// 3. Passio.ai: https://passio.ai (SDK nativo, melhor precisão)
// 4. Google Vision + Nutritionix: combinação robusta
//
// Fluxo recomendado:
// 1. Upload da imagem para Supabase Storage
// 2. Enviar URL da imagem para API de reconhecimento
// 3. API retorna lista de alimentos detectados
// 4. Buscar dados nutricionais no Nutritionix/TACO (tabela brasileira)
// 5. Exibir resultado para a usuária confirmar/ajustar
// ============================================================

interface AnaliseResultado {
  descricao: string
  calorias: number
  proteinas: number
  gorduras: number
  carboidratos: number
  fibras: number
  alimentos_detectados: string[]
  confianca: number
}

// Simulação da análise de IA (substituir pela API real)
async function analisarPratoIA(_imageFile: File): Promise<AnaliseResultado> {
  // Simular delay de processamento
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Dados simulados — serão substituídos pela API real
  const pratos = [
    {
      descricao: 'Prato com arroz, feijão, frango grelhado e salada',
      calorias: 485,
      proteinas: 38,
      gorduras: 12,
      carboidratos: 52,
      fibras: 8,
      alimentos_detectados: ['Arroz branco', 'Feijão carioca', 'Frango grelhado', 'Alface', 'Tomate'],
      confianca: 0.87,
    },
    {
      descricao: 'Omelete com legumes e pão integral',
      calorias: 320,
      proteinas: 22,
      gorduras: 18,
      carboidratos: 24,
      fibras: 4,
      alimentos_detectados: ['Ovo', 'Pimentão', 'Cebola', 'Pão integral', 'Azeite'],
      confianca: 0.82,
    },
    {
      descricao: 'Salada com frango, quinoa e abacate',
      calorias: 410,
      proteinas: 32,
      gorduras: 20,
      carboidratos: 30,
      fibras: 10,
      alimentos_detectados: ['Frango desfiado', 'Quinoa', 'Abacate', 'Rúcula', 'Tomate cereja'],
      confianca: 0.91,
    },
  ]

  return pratos[Math.floor(Math.random() * pratos.length)]
}

export default function NutritionalAI() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [resultado, setResultado] = useState<AnaliseResultado | null>(null)
  const [refeicao, setRefeicao] = useState<string>('almoco')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [todayLogs, setTodayLogs] = useState<FoodLog[]>([])
  const [plano, setPlano] = useState<PlanoAcao | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (user) loadTodayData()
  }, [user])

  const loadTodayData = async () => {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    const [logsRes, planoRes] = await Promise.all([
      getFoodLogs(user.id, today),
      getPlanoAcao(user.id),
    ])
    if (logsRes.data) setTodayLogs(logsRes.data as FoodLog[])
    if (planoRes.data) setPlano(planoRes.data as PlanoAcao)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    setResultado(null)
    setSaved(false)

    const reader = new FileReader()
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAnalyze = async () => {
    if (!imageFile) return
    setAnalyzing(true)
    const result = await analisarPratoIA(imageFile)
    setResultado(result)
    setAnalyzing(false)
  }

  const handleSave = async () => {
    if (!user || !resultado) return
    setSaving(true)

    await saveFoodLog({
      user_id: user.id,
      descricao: resultado.descricao,
      calorias: resultado.calorias,
      proteinas: resultado.proteinas,
      gorduras: resultado.gorduras,
      carboidratos: resultado.carboidratos,
      fibras: resultado.fibras,
      refeicao,
      data: new Date().toISOString().split('T')[0],
    })

    setSaved(true)
    setSaving(false)
    await loadTodayData()
  }

  const resetScanner = () => {
    setImagePreview(null)
    setImageFile(null)
    setResultado(null)
    setSaved(false)
  }

  // Consumo total do dia
  const consumoTotal = todayLogs.reduce(
    (acc, log) => ({
      calorias: acc.calorias + (log.calorias || 0),
      proteinas: acc.proteinas + Number(log.proteinas || 0),
      gorduras: acc.gorduras + Number(log.gorduras || 0),
      carboidratos: acc.carboidratos + Number(log.carboidratos || 0),
    }),
    { calorias: 0, proteinas: 0, gorduras: 0, carboidratos: 0 }
  )

  const metaIdeal = {
    calorias: plano?.meta_calorias || 1600,
    proteinas: plano?.meta_proteinas || 90,
    gorduras: plano?.meta_gorduras || 55,
    carboidratos: plano?.meta_carboidratos || 180,
  }

  const refeicaoLabels: Record<string, string> = {
    cafe_manha: 'Café da Manhã',
    almoco: 'Almoço',
    lanche: 'Lanche',
    jantar: 'Jantar',
    outro: 'Outro',
  }

  return (
    <div className="page-container">
      <h1 className="page-title">IA Nutricional</h1>
      <p className="page-subtitle">Tire uma foto do seu prato e descubra os macros</p>

      {/* Resumo do dia */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
            <TrendingUp size={16} className="text-rosa-500" />
            Resumo do Dia
          </h2>
          <span className="text-xs text-gray-400">{todayLogs.length} refeições</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Kcal', valor: consumoTotal.calorias, meta: metaIdeal.calorias, cor: 'text-orange-500 bg-orange-50' },
            { label: 'Prot', valor: consumoTotal.proteinas, meta: metaIdeal.proteinas, cor: 'text-red-500 bg-red-50' },
            { label: 'Gord', valor: consumoTotal.gorduras, meta: metaIdeal.gorduras, cor: 'text-yellow-600 bg-yellow-50' },
            { label: 'Carb', valor: consumoTotal.carboidratos, meta: metaIdeal.carboidratos, cor: 'text-blue-500 bg-blue-50' },
          ].map((m, i) => (
            <div key={i} className={`macro-card ${m.cor.split(' ')[1]}`}>
              <span className={`text-lg font-bold ${m.cor.split(' ')[0]}`}>{Math.round(m.valor)}</span>
              <span className="text-[10px] text-gray-400">/ {m.meta}</span>
              <span className="text-[10px] text-gray-400">{m.label}</span>
            </div>
          ))}
        </div>

        {/* Meta inteligente */}
        <div className="mt-3 bg-rosa-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-rosa-500" />
            <span className="text-xs font-semibold text-rosa-700">Meta Inteligente</span>
          </div>
          <p className="text-xs text-rosa-600">
            {consumoTotal.calorias === 0
              ? `Para emagrecer na sua fase, consuma até ${metaIdeal.calorias} kcal/dia com pelo menos ${metaIdeal.proteinas}g de proteína.`
              : consumoTotal.calorias < metaIdeal.calorias
                ? `Você ainda pode consumir ${metaIdeal.calorias - consumoTotal.calorias} kcal hoje. Priorize proteínas (faltam ${Math.max(0, metaIdeal.proteinas - consumoTotal.proteinas)}g).`
                : `Você atingiu sua meta calórica de hoje. Nas próximas refeições, prefira alimentos leves e ricos em proteína.`
            }
          </p>
        </div>
      </div>

      {/* Scanner */}
      <div className="card mb-4">
        {!imagePreview ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-rosa-50 rounded-full flex items-center justify-center">
              <Camera size={32} className="text-rosa-500" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Escaneie seu Prato</h3>
            <p className="text-xs text-gray-400 mb-5">
              Tire uma foto ou escolha da galeria para análise nutricional
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />

            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Camera size={18} /> Tirar Foto
              </button>
              <button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute('capture')
                    fileInputRef.current.click()
                    fileInputRef.current.setAttribute('capture', 'environment')
                  }
                }}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <Upload size={18} /> Galeria
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Preview da imagem */}
            <div className="relative mb-4">
              <img
                src={imagePreview}
                alt="Prato"
                className="w-full h-48 object-cover rounded-2xl"
              />
              <button
                onClick={resetScanner}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
              >
                <X size={16} className="text-white" />
              </button>
            </div>

            {/* Seleção de refeição */}
            <div className="mb-4">
              <label className="label-field">Tipo de Refeição</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(refeicaoLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setRefeicao(key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      refeicao === key
                        ? 'bg-rosa-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Botão analisar */}
            {!resultado && (
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="btn-gold w-full flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analisando com IA...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Analisar Prato
                  </>
                )}
              </button>
            )}

            {/* Resultado da análise */}
            {resultado && (
              <div className="space-y-4">
                <div className="bg-green-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-green-600" />
                    <span className="font-semibold text-green-700 text-sm">Análise Concluída</span>
                    <span className="text-[10px] bg-green-200 text-green-700 px-2 py-0.5 rounded-full ml-auto">
                      {Math.round(resultado.confianca * 100)}% confiança
                    </span>
                  </div>
                  <p className="text-sm text-green-800">{resultado.descricao}</p>
                </div>

                {/* Alimentos detectados */}
                <div className="flex flex-wrap gap-1.5">
                  {resultado.alimentos_detectados.map((alimento, i) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {alimento}
                    </span>
                  ))}
                </div>

                {/* Macros */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-orange-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-orange-500">{resultado.calorias}</p>
                    <p className="text-xs text-gray-500">Calorias</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-red-500">{resultado.proteinas}g</p>
                    <p className="text-xs text-gray-500">Proteínas</p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{resultado.gorduras}g</p>
                    <p className="text-xs text-gray-500">Gorduras</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-blue-500">{resultado.carboidratos}g</p>
                    <p className="text-xs text-gray-500">Carboidratos</p>
                  </div>
                </div>

                {/* Meta inteligente por refeição */}
                <div className="bg-ouro-50 rounded-xl p-3 border border-ouro-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={14} className="text-ouro-500" />
                    <span className="text-xs font-semibold text-ouro-700">
                      Ideal para esta refeição ({refeicaoLabels[refeicao]}):
                    </span>
                  </div>
                  <p className="text-xs text-ouro-600">
                    ~{Math.round(metaIdeal.calorias / 4)} kcal | ~{Math.round(metaIdeal.proteinas / 4)}g prot | ~{Math.round(metaIdeal.gorduras / 4)}g gord | ~{Math.round(metaIdeal.carboidratos / 4)}g carb
                  </p>
                </div>

                {/* Botão salvar */}
                {!saved ? (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Plus size={18} /> Salvar Refeição
                      </>
                    )}
                  </button>
                ) : (
                  <div className="text-center py-3">
                    <p className="text-green-600 font-semibold text-sm flex items-center justify-center gap-2">
                      <Utensils size={16} /> Refeição salva com sucesso!
                    </p>
                    <button onClick={resetScanner} className="text-rosa-500 text-sm mt-2 underline">
                      Escanear outro prato
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Histórico do dia */}
      {todayLogs.length > 0 && (
        <div className="card">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between"
          >
            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <Utensils size={16} className="text-rosa-500" />
              Refeições de Hoje ({todayLogs.length})
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
