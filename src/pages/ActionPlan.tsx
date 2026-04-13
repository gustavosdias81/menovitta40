import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { PlanoAcao, FaseMenopausa, Objetivo } from '../types'
import {
  Dumbbell, Apple, Brain, ClipboardList,
  TrendingUp, Loader2, Flame, Droplets,
  Moon, Heart, ChevronDown, ChevronUp, Star
} from 'lucide-react'

// ── Conteúdo padrão por fase ──────────────────────────────────────────────────
const TREINO_POR_FASE: Record<FaseMenopausa, { titulo: string; dias: { dia: string; treino: string; duracao: string; intensidade: string }[] }> = {
  pre_menopausa: {
    titulo: 'Protocolo Pré-Menopausa',
    dias: [
      { dia: 'Segunda', treino: 'Musculação — Membros Inferiores', duracao: '45 min', intensidade: 'Moderada-Alta' },
      { dia: 'Terça', treino: 'Caminhada ou Bike leve', duracao: '30 min', intensidade: 'Leve' },
      { dia: 'Quarta', treino: 'Musculação — Membros Superiores + Core', duracao: '45 min', intensidade: 'Moderada' },
      { dia: 'Quinta', treino: 'Yoga ou Pilates', duracao: '40 min', intensidade: 'Leve' },
      { dia: 'Sexta', treino: 'Treino Full Body', duracao: '50 min', intensidade: 'Alta' },
      { dia: 'Sábado', treino: 'Caminhada ao ar livre', duracao: '40 min', intensidade: 'Leve' },
      { dia: 'Domingo', treino: 'Descanso ativo / Alongamento', duracao: '20 min', intensidade: 'Muito Leve' },
    ],
  },
  menopausa: {
    titulo: 'Protocolo Menopausa',
    dias: [
      { dia: 'Segunda', treino: 'Musculação — Foco em glúteos e coxas', duracao: '40 min', intensidade: 'Moderada' },
      { dia: 'Terça', treino: 'Caminhada com variação de ritmo', duracao: '35 min', intensidade: 'Leve-Moderada' },
      { dia: 'Quarta', treino: 'Pilates ou Yoga — Foco no Core', duracao: '45 min', intensidade: 'Leve' },
      { dia: 'Quinta', treino: 'Musculação — Parte superior + Ombros', duracao: '40 min', intensidade: 'Moderada' },
      { dia: 'Sexta', treino: 'Dança ou Aeróbico leve', duracao: '30 min', intensidade: 'Moderada' },
      { dia: 'Sábado', treino: 'Caminhada / Natação', duracao: '40 min', intensidade: 'Leve' },
      { dia: 'Domingo', treino: 'Descanso e alongamento', duracao: '15 min', intensidade: 'Muito Leve' },
    ],
  },
  pos_menopausa: {
    titulo: 'Protocolo Pós-Menopausa',
    dias: [
      { dia: 'Segunda', treino: 'Musculação — Foco em ossos e equilíbrio', duracao: '35 min', intensidade: 'Moderada' },
      { dia: 'Terça', treino: 'Caminhada ou Hidroginástica', duracao: '30 min', intensidade: 'Leve' },
      { dia: 'Quarta', treino: 'Pilates terapêutico', duracao: '40 min', intensidade: 'Leve' },
      { dia: 'Quinta', treino: 'Musculação — Membros + Equilíbrio', duracao: '35 min', intensidade: 'Moderada' },
      { dia: 'Sexta', treino: 'Yoga restaurativo', duracao: '40 min', intensidade: 'Muito Leve' },
      { dia: 'Sábado', treino: 'Caminhada ao ar livre', duracao: '30 min', intensidade: 'Leve' },
      { dia: 'Domingo', treino: 'Descanso completo', duracao: '—', intensidade: 'Repouso' },
    ],
  },
}

const NUTRICAO_POR_FASE: Record<FaseMenopausa, { dicas: string[]; alimentos: string[]; evitar: string[] }> = {
  pre_menopausa: {
    dicas: [
      'Priorize 25–30g de proteína por refeição para manter o músculo',
      'Inclua fibras em cada refeição (frutas, legumes, grãos integrais)',
      'Mantenha-se hidratada: mínimo 2L de água por dia',
      'Distribua as refeições a cada 3–4 horas para estabilizar a glicemia',
    ],
    alimentos: ['Frango e peixe', 'Ovos e laticínios magros', 'Quinoa e aveia', 'Frutas vermelhas', 'Vegetais folhosos', 'Azeite extra-virgem'],
    evitar: ['Açúcar refinado em excesso', 'Ultra processados', 'Álcool em excesso', 'Sódio elevado'],
  },
  menopausa: {
    dicas: [
      'Aumente a proteína: 1,3–1,5g por kg de peso corporal',
      'Priorize cálcio (leite, iogurte, sardinha, couve) e Vitamina D',
      'Reduza carboidratos simples para controlar ganho abdominal',
      'Inclua fitoestrógenos: soja, linhaça, grão-de-bico',
    ],
    alimentos: ['Sardinha e salmão', 'Iogurte grego', 'Linhaça e chia', 'Grão-de-bico', 'Tofu', 'Nozes e amêndoas', 'Couve e brócolis'],
    evitar: ['Cafeína em excesso (piora fogachos)', 'Alimentos picantes', 'Álcool', 'Açúcar e farinhas brancas'],
  },
  pos_menopausa: {
    dicas: [
      'Proteína ainda mais importante: 1,4–1,6g/kg para evitar sarcopenia',
      'Cálcio e Vitamina D diariamente — consulte suplementação com médico',
      'Ômega-3 é essencial para coração e cognição (peixe ou suplemento)',
      'Refeições menores e mais frequentes para melhor digestão',
    ],
    alimentos: ['Peixes gordurosos (salmão, atum)', 'Ovos caipiras', 'Laticínios enriquecidos com Ca', 'Vegetais coloridos', 'Sementes', 'Chá verde'],
    evitar: ['Sódio elevado (hipertensão)', 'Gordura saturada em excesso', 'Álcool', 'Açúcar refinado'],
  },
}

const MENTALIDADE_POR_FASE: Record<FaseMenopausa, { praticas: { titulo: string; desc: string; icon: string }[] }> = {
  pre_menopausa: {
    praticas: [
      { titulo: 'Meditação Matinal', desc: '10 minutos ao acordar para centrar a mente e reduzir ansiedade.', icon: '🧘‍♀️' },
      { titulo: 'Diário de Gratidão', desc: 'Escreva 3 coisas positivas ao final do dia para melhorar o humor.', icon: '📓' },
      { titulo: 'Sono de Qualidade', desc: 'Priorize 7–8h de sono. Evite telas 1h antes de dormir.', icon: '🌙' },
      { titulo: 'Conexão Social', desc: 'Mantenha vínculos afetivos — amizades e família protegem a saúde mental.', icon: '💗' },
    ],
  },
  menopausa: {
    praticas: [
      { titulo: 'Respiração Profunda', desc: 'Técnica 4-7-8: inspire 4s, segure 7s, expire 8s. Alivia fogachos e ansiedade.', icon: '🫁' },
      { titulo: 'Mindfulness', desc: '15 minutos de atenção plena por dia reduz sintomas da menopausa em até 30%.', icon: '🧘‍♀️' },
      { titulo: 'Autocuidado Diário', desc: 'Reserve tempo para si: banho relaxante, leitura, música — sem culpa.', icon: '✨' },
      { titulo: 'Psicologia Positiva', desc: 'Reformule pensamentos negativos sobre a menopausa — é uma transição, não um fim.', icon: '💪' },
    ],
  },
  pos_menopausa: {
    praticas: [
      { titulo: 'Estimulação Cognitiva', desc: 'Palavras-cruzadas, leitura e jogos de memória protegem o cérebro.', icon: '🧠' },
      { titulo: 'Vida Social Ativa', desc: 'Grupos, cursos e atividades comunitárias reduzem risco de depressão.', icon: '🤝' },
      { titulo: 'Propósito de Vida', desc: 'Voluntariado, hobbies e metas pessoais aumentam longevidade e felicidade.', icon: '🌟' },
      { titulo: 'Gerenciamento do Estresse', desc: 'Estresse crônico acelera envelhecimento. Priorize relaxamento diário.', icon: '🌸' },
    ],
  },
}

const intensidadeColor = (i: string) => {
  if (i === 'Muito Leve' || i === 'Repouso') return 'bg-blue-50 text-blue-600'
  if (i === 'Leve' || i === 'Leve-Moderada') return 'bg-green-50 text-green-600'
  if (i === 'Moderada') return 'bg-ouro-50 text-ouro-600'
  return 'bg-rosa-50 text-rosa-600'
}

const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export default function ActionPlan() {
  const { user, profile } = useAuth()
  const [plano, setPlano] = useState<PlanoAcao | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'treino' | 'nutricao' | 'mentalidade'>('treino')
  const [expandedDia, setExpandedDia] = useState<number | null>(null)

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('planos_acao')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    if (data) setPlano(data as PlanoAcao)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-rosa-500 animate-spin" />
      </div>
    )
  }

  const fase = (profile?.fase_menopausa || 'menopausa') as FaseMenopausa
  const objetivo = (profile?.objetivo || 'saude') as Objetivo
  const treino = TREINO_POR_FASE[fase]
  const nutricao = NUTRICAO_POR_FASE[fase]
  const mentalidade = MENTALIDADE_POR_FASE[fase]

  const metas = {
    calorias: plano?.meta_calorias || (objetivo === 'emagrecer' ? 1400 : objetivo === 'hipertrofia' ? 1900 : 1600),
    proteinas: plano?.meta_proteinas || (fase === 'pos_menopausa' ? 100 : 85),
    gorduras: plano?.meta_gorduras || 55,
    carboidratos: plano?.meta_carboidratos || 160,
  }

  const hojeIndex = new Date().getDay()
  const diaHoje = diasSemana[hojeIndex]
  const treinoHoje = treino.dias.find(d => d.dia === diaHoje)

  const tabs = [
    { key: 'treino' as const, label: 'Treino', icon: <Dumbbell size={16} /> },
    { key: 'nutricao' as const, label: 'Nutrição', icon: <Apple size={16} /> },
    { key: 'mentalidade' as const, label: 'Mente', icon: <Brain size={16} /> },
  ]

  return (
    <div className="page-container">
      <h1 className="page-title">Plano de Ação</h1>
      <p className="page-subtitle">
        Personalizado para sua fase · {fase === 'pre_menopausa' ? 'Pré-Menopausa' : fase === 'menopausa' ? 'Menopausa' : 'Pós-Menopausa'}
      </p>

      {/* Treino de hoje — destaque */}
      {treinoHoje && (
        <div className="mb-4 rounded-2xl p-4 text-white"
          style={{ background: 'linear-gradient(135deg, #B76E79 0%, #9d5a64 100%)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Star size={14} className="text-ouro-300" />
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Treino de Hoje — {diaHoje}</span>
          </div>
          <p className="font-bold text-lg mb-1">{treinoHoje.treino}</p>
          <div className="flex items-center gap-3 text-sm text-white/80">
            <span>⏱ {treinoHoje.duracao}</span>
            <span className="w-px h-3 bg-white/30" />
            <span>💪 {treinoHoje.intensidade}</span>
          </div>
        </div>
      )}

      {/* Metas nutricionais */}
      <div className="card mb-4">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Flame size={16} className="text-orange-500" />
          Suas Metas Diárias
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Calorias', valor: metas.calorias, unidade: 'kcal', color: 'bg-orange-50 text-orange-600', icon: <Flame size={16} /> },
            { label: 'Proteínas', valor: metas.proteinas, unidade: 'g', color: 'bg-red-50 text-red-500', icon: <Dumbbell size={16} /> },
            { label: 'Gorduras', valor: metas.gorduras, unidade: 'g', color: 'bg-yellow-50 text-yellow-600', icon: <Droplets size={16} /> },
            { label: 'Carboidratos', valor: metas.carboidratos, unidade: 'g', color: 'bg-blue-50 text-blue-500', icon: <Apple size={16} /> },
          ].map((m, i) => (
            <div key={i} className={`rounded-2xl p-3 ${m.color}`}>
              <div className="flex items-center gap-1.5 mb-1 opacity-70">
                {m.icon}
                <span className="text-xs font-medium">{m.label}</span>
              </div>
              <p className="text-2xl font-bold">{m.valor}</p>
              <p className="text-xs opacity-60">{m.unidade} / dia</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.key ? 'bg-white text-rosa-500 shadow-sm' : 'text-gray-500'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ABA: TREINO */}
      {activeTab === 'treino' && (
        <div className="space-y-3">
          {plano?.treino_descricao ? (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-2">Protocolo da Consultora</h3>
              <p className="text-base text-gray-600 leading-relaxed whitespace-pre-wrap">{plano.treino_descricao}</p>
            </div>
          ) : (
            <>
              <div className="card mb-1">
                <h3 className="font-semibold text-gray-800 text-base mb-1">{treino.titulo}</h3>
                <p className="text-sm text-gray-400">Toque no dia para ver detalhes</p>
              </div>
              {treino.dias.map((d, i) => (
                <div key={i} className={`card cursor-pointer transition-all ${d.dia === diaHoje ? 'border-rosa-300 border-2' : ''}`}
                  onClick={() => setExpandedDia(expandedDia === i ? null : i)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {d.dia === diaHoje && <div className="w-2 h-2 rounded-full bg-rosa-500 flex-shrink-0" />}
                      <div>
                        <p className={`font-semibold text-base ${d.dia === diaHoje ? 'text-rosa-600' : 'text-gray-800'}`}>
                          {d.dia} {d.dia === diaHoje ? '· Hoje' : ''}
                        </p>
                        <p className="text-sm text-gray-500">{d.treino}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${intensidadeColor(d.intensidade)}`}>
                        {d.intensidade}
                      </span>
                      {expandedDia === i ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>
                  {expandedDia === i && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4 text-sm text-gray-600">
                      <span>⏱ Duração: <strong>{d.duracao}</strong></span>
                      <span>🔥 Intensidade: <strong>{d.intensidade}</strong></span>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ABA: NUTRIÇÃO */}
      {activeTab === 'nutricao' && (
        <div className="space-y-4">
          {plano?.nutricao_descricao ? (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-2">Protocolo da Consultora</h3>
              <p className="text-base text-gray-600 leading-relaxed whitespace-pre-wrap">{plano.nutricao_descricao}</p>
            </div>
          ) : (
            <>
              <div className="card">
                <h3 className="font-semibold text-gray-800 text-base mb-3 flex items-center gap-2">
                  <Heart size={16} className="text-rosa-500" /> Dicas Essenciais
                </h3>
                <div className="space-y-2.5">
                  {nutricao.dicas.map((dica, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-rosa-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-rosa-600 font-bold">{i + 1}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{dica}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-800 text-base mb-3 flex items-center gap-2">
                  <Apple size={16} className="text-green-500" /> Priorize Estes Alimentos
                </h3>
                <div className="flex flex-wrap gap-2">
                  {nutricao.alimentos.map((a, i) => (
                    <span key={i} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">✓ {a}</span>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-800 text-base mb-3 flex items-center gap-2">
                  <Moon size={16} className="text-red-400" /> Reduza ou Evite
                </h3>
                <div className="flex flex-wrap gap-2">
                  {nutricao.evitar.map((a, i) => (
                    <span key={i} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-full text-sm font-medium">✗ {a}</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ABA: MENTALIDADE */}
      {activeTab === 'mentalidade' && (
        <div className="space-y-3">
          {plano?.mentalidade_descricao ? (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-2">Orientações da Consultora</h3>
              <p className="text-base text-gray-600 leading-relaxed whitespace-pre-wrap">{plano.mentalidade_descricao}</p>
            </div>
          ) : (
            mentalidade.praticas.map((p, i) => (
              <div key={i} className="card flex items-start gap-4">
                <span className="text-3xl">{p.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-base mb-1">{p.titulo}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Notas da consultora */}
      {plano?.notas_admin && (
        <div className="card mt-4 border-l-4 border-ouro-400">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <ClipboardList size={16} className="text-ouro-400" />
            Notas da Consultora
          </h3>
          <p className="text-base text-gray-600 whitespace-pre-wrap">{plano.notas_admin}</p>
        </div>
      )}

      {/* Histórico */}
      {plano?.progresso_notas && Array.isArray(plano.progresso_notas) && plano.progresso_notas.length > 0 && (
        <div className="card mt-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-rosa-500" /> Histórico de Acompanhamento
          </h3>
          <div className="space-y-3">
            {(plano.progresso_notas as Array<{ data: string; nota: string; autor: string }>).map((nota, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">{new Date(nota.data).toLocaleDateString('pt-BR')}</span>
                  <span className="text-xs bg-rosa-100 text-rosa-600 px-2 py-0.5 rounded-full">
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
