import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getPlanoAcao, getFoodLogs } from '../lib/supabase'
import type { PlanoAcao, FoodLog, FaseMenopausa } from '../types'
import {
  Dumbbell, Apple, Brain, ClipboardList,
  TrendingUp, Loader2, Calendar
} from 'lucide-react'

const FASE_LABELS: Record<FaseMenopausa, string> = {
  pre_menopausa: 'Pré-Menopausa',
  menopausa: 'Menopausa',
  pos_menopausa: 'Pós-Menopausa',
}

export default function ActionPlan() {
  const { user, profile } = useAuth()
  const [plano, setPlano] = useState<PlanoAcao | null>(null)
  const [todayLogs, setTodayLogs] = useState<FoodLog[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'treino' | 'nutricao' | 'mentalidade'>('treino')

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    const [planoRes, logsRes] = await Promise.all([
      getPlanoAcao(user.id),
      getFoodLogs(user.id, today),
    ])
    if (planoRes.data) setPlano(planoRes.data as PlanoAcao)
    if (logsRes.data) setTodayLogs(logsRes.data as FoodLog[])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-rosa-500 animate-spin" />
      </div>
    )
  }

  // Calcular consumo do dia
  const consumoHoje = todayLogs.reduce(
    (acc, log) => ({
      calorias: acc.calorias + (log.calorias || 0),
      proteinas: acc.proteinas + Number(log.proteinas || 0),
      gorduras: acc.gorduras + Number(log.gorduras || 0),
      carboidratos: acc.carboidratos + Number(log.carboidratos || 0),
    }),
    { calorias: 0, proteinas: 0, gorduras: 0, carboidratos: 0 }
  )

  const metas = {
    calorias: plano?.meta_calorias || 1600,
    proteinas: plano?.meta_proteinas || 90,
    gorduras: plano?.meta_gorduras || 55,
    carboidratos: plano?.meta_carboidratos || 180,
  }

  const progresso = (consumo: number, meta: number) =>
    Math.min((consumo / meta) * 100, 100)

  const progressoColor = (pct: number) => {
    if (pct < 50) return 'bg-gray-300'
    if (pct < 80) return 'bg-ouro-400'
    if (pct <= 100) return 'bg-green-500'
    return 'bg-red-500'
  }

  const tabs = [
    { key: 'treino', label: 'Treino', icon: <Dumbbell size={16} /> },
    { key: 'nutricao', label: 'Nutrição', icon: <Apple size={16} /> },
    { key: 'mentalidade', label: 'Mentalidade', icon: <Brain size={16} /> },
  ] as const

  return (
    <div className="page-container">
      <h1 className="page-title">Plano de Ação</h1>
      <p className="page-subtitle">
        {profile?.fase_menopausa
          ? `Personalizado para ${FASE_LABELS[profile.fase_menopausa as FaseMenopausa]}`
          : 'Seu acompanhamento personalizado'}
      </p>

      {/* Macros do dia */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
            <TrendingUp size={16} className="text-rosa-500" />
            Consumo de Hoje
          </h2>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar size={12} />
            {new Date().toLocaleDateString('pt-BR')}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Kcal', consumo: consumoHoje.calorias, meta: metas.calorias, color: 'text-orange-500' },
            { label: 'Prot', consumo: consumoHoje.proteinas, meta: metas.proteinas, color: 'text-red-500' },
            { label: 'Gord', consumo: consumoHoje.gorduras, meta: metas.gorduras, color: 'text-yellow-600' },
            { label: 'Carb', consumo: consumoHoje.carboidratos, meta: metas.carboidratos, color: 'text-blue-500' },
          ].map((m, i) => {
            const pct = progresso(m.consumo, m.meta)
            return (
              <div key={i} className="text-center">
                <div className="relative w-14 h-14 mx-auto mb-1">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#f0f0f0" strokeWidth="4" />
                    <circle
                      cx="28" cy="28" r="24" fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={`${pct * 1.508} 150.8`}
                      className={m.color}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">
                    {Math.round(m.consumo)}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400">{m.label}</p>
                <p className="text-[10px] text-gray-300">/ {m.meta}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tabs do protocolo */}
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

      {/* Conteúdo do protocolo */}
      <div className="card mb-4">
        {activeTab === 'treino' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Dumbbell size={16} className="text-rosa-500" />
              Protocolo de Treino
            </h3>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {plano?.treino_descricao || (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-sm">
                    Seu protocolo de treino será preenchido pela sua consultora.
                  </p>
                  <p className="text-gray-300 text-xs mt-1">
                    Aguarde a personalização do seu plano.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'nutricao' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Apple size={16} className="text-green-500" />
              Protocolo Nutricional
            </h3>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {plano?.nutricao_descricao || (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-sm">
                    Seu protocolo nutricional será preenchido pela sua consultora.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'mentalidade' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Brain size={16} className="text-purple-500" />
              Mentalidade & Bem-Estar
            </h3>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {plano?.mentalidade_descricao || (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-sm">
                    Orientações de mentalidade serão adicionadas pela sua consultora.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notas de progresso do Admin */}
      {plano?.notas_admin && (
        <div className="card mb-4 border-l-4 border-ouro-400">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <ClipboardList size={16} className="text-ouro-400" />
            Notas da Consultora
          </h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{plano.notas_admin}</p>
        </div>
      )}

      {/* Histórico de progresso */}
      {plano?.progresso_notas && Array.isArray(plano.progresso_notas) && plano.progresso_notas.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-rosa-500" />
            Histórico de Acompanhamento
          </h3>
          <div className="space-y-3">
            {(plano.progresso_notas as Array<{ data: string; nota: string; autor: string }>).map((nota, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">
                    {new Date(nota.data).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="text-[10px] bg-rosa-100 text-rosa-600 px-2 py-0.5 rounded-full">
                    {nota.autor === 'admin' ? 'Consultora' : 'Sistema'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{nota.nota}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
