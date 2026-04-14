import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { FaseMenopausa, Objetivo } from '../types'
import {
  ChevronRight, ChevronLeft, Loader2, Check,
  Moon, Activity, Brain, Heart, Flame, Dumbbell,
  Apple, Scale, Ruler, Clock, AlertCircle
} from 'lucide-react'

const SINTOMAS_OPTIONS = [
  'Ondas de calor (fogachos)',
  'Suores noturnos',
  'Insônia ou dificuldade para dormir',
  'Irritabilidade e mudanças de humor',
  'Ansiedade',
  'Depressão ou tristeza',
  'Fadiga / cansaço excessivo',
  'Dores articulares ou musculares',
  'Ganho de peso (especialmente abdominal)',
  'Ressecamento vaginal',
  'Diminuição da libido',
  'Dificuldade de concentração (névoa mental)',
  'Palpitações cardíacas',
  'Dores de cabeça / enxaqueca',
  'Queda de cabelo',
  'Pele ressecada',
  'Incontinência urinária leve',
  'Inchaço / retenção de líquido',
]

const DOENCAS_OPTIONS = [
  'Diabetes tipo 2', 'Hipertensão arterial', 'Osteoporose / Osteopenia',
  'Hipotireoidismo', 'Hipertireoidismo', 'Colesterol alto',
  'Triglicerídeos alto', 'Artrite / Artrose', 'Fibromialgia',
  'Síndrome do ovário policístico', 'Endometriose',
  'Depressão diagnosticada', 'Ansiedade diagnosticada', 'Nenhuma das anteriores',
]

const HISTORICO_FAMILIAR_OPTIONS = [
  'Câncer de mama', 'Câncer de ovário', 'Osteoporose', 'Diabetes',
  'Doenças cardiovasculares', 'Trombose', 'Nenhuma das anteriores',
]

const MEDICAMENTOS_OPTIONS = [
  'Anti-hipertensivo', 'Antidepressivo', 'Ansiolítico',
  'Hormônio tireoidiano (Levotiroxina)', 'Terapia de Reposição Hormonal (TRH)',
  'Suplemento de Cálcio', 'Suplemento de Vitamina D', 'Colágeno',
  'Anti-inflamatório regular', 'Estatina (colesterol)', 'Metformina (diabetes)',
  'Nenhum medicamento',
]

const RESTRICOES_OPTIONS = [
  'Intolerância à lactose', 'Intolerância ao glúten / Doença celíaca',
  'Vegetariana', 'Vegana', 'Alergia a frutos do mar',
  'Alergia a amendoim/nozes', 'Restrição de sódio', 'Sem restrições',
]

const OBJETIVOS: { value: Objetivo; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: 'emagrecer', label: 'Emagrecer', desc: 'Perder gordura corporal de forma saudável', icon: <Flame size={22} /> },
  { value: 'forma', label: 'Ficar em Forma', desc: 'Melhorar condicionamento e disposição', icon: <Activity size={22} /> },
  { value: 'hipertrofia', label: 'Ganho Muscular', desc: 'Ganhar massa magra e força', icon: <Dumbbell size={22} /> },
  { value: 'saude', label: 'Saúde Geral', desc: 'Prevenção e qualidade de vida', icon: <Heart size={22} /> },
  { value: 'flexibilidade', label: 'Flexibilidade', desc: 'Mobilidade e bem-estar articular', icon: <Apple size={22} /> },
]

const STEPS = [
  { id: 'boas_vindas', title: 'Seja Bem-Vinda!', subtitle: 'Vamos criar seu plano personalizado' },
  { id: 'dados_basicos', title: 'Dados Básicos', subtitle: 'Informações corporais essenciais' },
  { id: 'ciclo', title: 'Ciclo Menstrual', subtitle: 'Sobre sua menstruação atual' },
  { id: 'sintomas', title: 'Seus Sintomas', subtitle: 'O que você está sentindo?' },
  { id: 'saude', title: 'Histórico de Saúde', subtitle: 'Condições e medicamentos' },
  { id: 'estilo_vida', title: 'Estilo de Vida', subtitle: 'Sono, estresse e atividade física' },
  { id: 'alimentacao', title: 'Alimentação', subtitle: 'Restrições e preferências' },
  { id: 'objetivo', title: 'Seu Objetivo', subtitle: 'O que você quer alcançar?' },
  { id: 'resultado', title: 'Pronto!', subtitle: 'Seu perfil foi criado' },
]

export default function Quiz() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const [idade, setIdade] = useState(45)
  const [peso, setPeso] = useState(70)
  const [pesoAlterado, setPesoAlterado] = useState(false)
  const [altura, setAltura] = useState(1.60)
  const [alturaAlterada, setAlturaAlterada] = useState(false)
  const [circAbdominal, setCircAbdominal] = useState<number | undefined>()
  const [ultimaMenstruacao, setUltimaMenstruacao] = useState('')
  const [cicloRegular, setCicloRegular] = useState(true)
  const [frequenciaCiclo, setFrequenciaCiclo] = useState('')
  const [sintomas, setSintomas] = useState<string[]>([])
  const [intensidadeSintomas, setIntensidadeSintomas] = useState('moderado')
  const [doencas, setDoencas] = useState<string[]>([])
  const [historicoFamiliar, setHistoricoFamiliar] = useState<string[]>([])
  const [medicamentos, setMedicamentos] = useState<string[]>([])
  const [usoTrh, setUsoTrh] = useState(false)
  const [atividadeFisica, setAtividadeFisica] = useState('sedentaria')
  const [horasSono, setHorasSono] = useState(7)
  const [qualidadeSono, setQualidadeSono] = useState('regular')
  const [nivelEstresse, setNivelEstresse] = useState('moderado')
  const [restricoes, setRestricoes] = useState<string[]>([])
  const [objetivo, setObjetivo] = useState<Objetivo>('emagrecer')
  const [faseClassificada, setFaseClassificada] = useState<FaseMenopausa>('menopausa')

  const classificarFase = (): FaseMenopausa => {
    if (ultimaMenstruacao === 'regular') {
      if (idade >= 45 && sintomas.length >= 3) return 'pre_menopausa'
      return 'pre_menopausa'
    }
    if (ultimaMenstruacao === 'menos_1_ano') {
      if (sintomas.length >= 4 || idade >= 50) return 'menopausa'
      return 'pre_menopausa'
    }
    if (ultimaMenstruacao === '1_a_3_anos') return 'menopausa'
    if (ultimaMenstruacao === 'mais_3_anos') return 'pos_menopausa'
    if (idade < 45) return 'pre_menopausa'
    if (idade <= 55) return 'menopausa'
    return 'pos_menopausa'
  }

  const calcularMetas = (fase: FaseMenopausa, obj: Objetivo) => {
    let calorias = peso * 25
    let proteinas = peso * 1.2
    let gorduras = peso * 0.8

    if (fase === 'pos_menopausa') { calorias *= 0.9; proteinas = peso * 1.4 }
    else if (fase === 'menopausa') { proteinas = peso * 1.3 }

    if (obj === 'emagrecer') { calorias *= 0.8; proteinas = peso * 1.5; gorduras = peso * 0.7 }
    else if (obj === 'hipertrofia') { calorias *= 1.1; proteinas = peso * 1.6; gorduras = peso * 0.9 }

    const carboidratos = (calorias - (proteinas * 4) - (gorduras * 9)) / 4
    return {
      meta_calorias: Math.round(calorias),
      meta_proteinas: Math.round(proteinas),
      meta_gorduras: Math.round(gorduras),
      meta_carboidratos: Math.round(Math.max(carboidratos, 80)),
    }
  }

  const toggleItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    if (item.startsWith('Nenhum') || item.startsWith('Sem ')) { setter([item]); return }
    const cleaned = arr.filter(a => !a.startsWith('Nenhum') && !a.startsWith('Sem '))
    setter(cleaned.includes(item) ? cleaned.filter(a => a !== item) : [...cleaned, item])
  }

  const handleFinish = async () => {
    if (!user) return
    setLoading(true)
    setErro('')

    const fase = classificarFase()
    setFaseClassificada(fase)
    const metas = calcularMetas(fase, objetivo)

    // Tenta salvar com timeout de 6s — nunca trava
    try {
      await Promise.race([
        (async () => {
          const { error: e1 } = await supabase.from('anamnese_respostas').upsert({
            user_id: user.id,
            idade, ultima_menstruacao: ultimaMenstruacao, ciclo_regular: cicloRegular,
            frequencia_ciclo: frequenciaCiclo, sintomas, intensidade_sintomas: intensidadeSintomas,
            medicamentos, uso_trh: usoTrh, atividade_fisica: atividadeFisica,
            restricoes_alimentares: restricoes, horas_sono: horasSono,
            qualidade_sono: qualidadeSono, nivel_estresse: nivelEstresse,
            objetivo, peso_atual: peso, altura,
            circunferencia_abdominal: circAbdominal || null,
            doencas_previas: doencas, historico_familiar: historicoFamiliar,
            fase_classificada: fase,
          }, { onConflict: 'user_id' })
          if (e1) console.warn('Anamnese:', e1.message)

          const { error: e2 } = await supabase.from('profiles').update({
            idade, peso, altura, fase_menopausa: fase, objetivo,
            quiz_completo: true, updated_at: new Date().toISOString(),
          }).eq('user_id', user.id)
          if (e2) console.warn('Perfil:', e2.message)

          const { error: e3 } = await supabase.from('planos_acao').upsert({
            user_id: user.id, fase, ...metas, updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' })
          if (e3) console.warn('Plano:', e3.message)
        })(),
        new Promise<void>(resolve => setTimeout(resolve, 6000))
      ])
    } catch (err) {
      console.error('Erro inesperado:', err)
    }

    // Marca localmente que o quiz foi concluído (fallback se Supabase falhar)
    localStorage.setItem(`quiz_done_${user.id}`, '1')
    setLoading(false)
    setStep(STEPS.length - 1)

    // Atualiza perfil no contexto e navega automaticamente após 3s
    refreshProfile()
    setTimeout(() => navigate('/saude-info'), 3000)
  }

  const nextStep = () => {
    if (step === STEPS.length - 2) handleFinish()
    else setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  const prevStep = () => setStep(s => Math.max(s - 1, 0))

  const imc = (pesoAlterado || alturaAlterada) ? (peso / (altura * altura)).toFixed(1) : null

  const faseLabel = (f: FaseMenopausa) => ({
    pre_menopausa: 'Pré-Menopausa', menopausa: 'Menopausa', pos_menopausa: 'Pós-Menopausa',
  }[f])

  const faseBadgeClass = (f: FaseMenopausa) => ({
    pre_menopausa: 'bg-amber-100 text-amber-700',
    menopausa: 'bg-rosa-100 text-rosa-700',
    pos_menopausa: 'bg-purple-100 text-purple-700',
  }[f])

  const progress = (step / (STEPS.length - 1)) * 100

  // ── CHECKBOX ──────────────────────────────────────────────
  const Checkbox = ({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
        checked ? 'border-rosa-500 bg-rosa-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
        checked ? 'border-rosa-500 bg-rosa-500' : 'border-gray-300'
      }`}>
        {checked && <Check size={11} className="text-white" strokeWidth={3} />}
      </div>
      <span className={`text-sm ${checked ? 'text-rosa-700 font-medium' : 'text-gray-600'}`}>{label}</span>
    </button>
  )

  // ── OPTION BUTTON ─────────────────────────────────────────
  const OptionBtn = ({ value, current, label, desc, onClick }: {
    value: string; current: string; label: string; desc?: string; onClick: () => void
  }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all ${
        current === value ? 'border-rosa-500 bg-rosa-50' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <span className={`text-sm font-medium ${current === value ? 'text-rosa-700' : 'text-gray-700'}`}>{label}</span>
      {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
    </button>
  )

  // ── RENDER STEP ───────────────────────────────────────────
  const renderStep = () => {
    switch (STEPS[step].id) {

      case 'boas_vindas':
        return (
          <div className="text-center py-4">
            <div className="w-24 h-24 mx-auto mb-5 flex items-center justify-center">
              <img src="/logo.png" alt="Menovitta" className="w-24 h-24 object-contain drop-shadow-lg" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-gray-800 mb-3">
              Olá, seja bem-vinda!
            </h2>
            <p className="text-gray-500 leading-relaxed max-w-sm mx-auto text-sm mb-6">
              Este questionário vai nos ajudar a entender sua fase atual e criar um plano
              totalmente personalizado para você. São apenas <strong className="text-rosa-600">7 passos rápidos</strong>.
            </p>
            <div className="grid grid-cols-1 gap-2 max-w-xs mx-auto text-left">
              {[
                { icon: <Scale size={15} />, text: 'Dados corporais e IMC' },
                { icon: <Moon size={15} />, text: 'Ciclo menstrual e sintomas' },
                { icon: <Brain size={15} />, text: 'Histórico de saúde' },
                { icon: <Activity size={15} />, text: 'Estilo de vida e sono' },
                { icon: <Flame size={15} />, text: 'Seu objetivo principal' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl shadow-sm">
                  <span className="text-rosa-500">{item.icon}</span>
                  <span className="text-sm text-gray-600">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        )

      case 'dados_basicos':
        return (
          <div className="space-y-5">
            <div>
              <label className="label-field flex items-center gap-2">
                <Clock size={14} className="text-rosa-500" /> Sua Idade: <strong className="text-rosa-500 ml-1">{idade} anos</strong>
              </label>
              <input
                type="range" min={35} max={75} value={idade}
                onChange={e => setIdade(Number(e.target.value))}
                className="w-full mt-2 accent-rosa-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>35</span><span>55</span><span>75</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field flex items-center gap-1">
                  <Scale size={13} className="text-rosa-500" /> Peso (kg)
                </label>
                <input
                  type="number" step="0.1" value={peso}
                  onChange={e => { setPeso(Number(e.target.value)); setPesoAlterado(true) }}
                  onFocus={e => e.target.select()}
                  className="input-field text-center text-lg"
                />
              </div>
              <div>
                <label className="label-field flex items-center gap-1">
                  <Ruler size={13} className="text-rosa-500" /> Altura (m)
                </label>
                <input
                  type="number" step="0.01" value={altura}
                  onChange={e => { setAltura(Number(e.target.value)); setAlturaAlterada(true) }}
                  onFocus={e => e.target.select()}
                  className="input-field text-center text-lg"
                />
              </div>
            </div>

            <div>
              <label className="label-field">Circunferência Abdominal (cm) — opcional</label>
              <input
                type="number" step="0.5"
                value={circAbdominal || ''}
                onChange={e => setCircAbdominal(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Ex: 88"
                className="input-field"
              />
              <p className="text-xs text-gray-400 mt-1">Medida na altura do umbigo.</p>
            </div>

            {imc && (
              <div className="bg-ouro-50 border border-ouro-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-ouro-600 font-medium">IMC Calculado</p>
                  <p className="text-2xl font-bold text-ouro-500">{imc}</p>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p>{'< 18.5'} Abaixo do peso</p>
                  <p>18.5–24.9 Normal</p>
                  <p>25–29.9 Sobrepeso</p>
                  <p>{'≥ 30'} Obesidade</p>
                </div>
              </div>
            )}
          </div>
        )

      case 'ciclo':
        return (
          <div className="space-y-5">
            <div>
              <label className="label-field">Quando foi sua última menstruação?</label>
              <div className="space-y-2">
                {[
                  { value: 'regular', label: 'Ainda menstruo regularmente' },
                  { value: 'menos_1_ano', label: 'Parei há menos de 1 ano' },
                  { value: '1_a_3_anos', label: 'Parei entre 1 e 3 anos atrás' },
                  { value: 'mais_3_anos', label: 'Parei há mais de 3 anos' },
                ].map(opt => (
                  <OptionBtn key={opt.value} value={opt.value} current={ultimaMenstruacao} label={opt.label} onClick={() => setUltimaMenstruacao(opt.value)} />
                ))}
              </div>
            </div>

            {ultimaMenstruacao === 'regular' && (
              <>
                <div>
                  <label className="label-field">Seu ciclo é regular?</label>
                  <div className="flex gap-3">
                    {[{ v: true, l: 'Sim, regular' }, { v: false, l: 'Não, irregular' }].map(o => (
                      <button key={String(o.v)} onClick={() => setCicloRegular(o.v)}
                        className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${cicloRegular === o.v ? 'border-rosa-500 bg-rosa-50 text-rosa-700' : 'border-gray-200'}`}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label-field">Frequência aproximada</label>
                  <div className="space-y-2">
                    {[
                      { value: 'regular', label: 'A cada 21-35 dias (normal)' },
                      { value: 'irregular', label: 'Intervalos variáveis (às vezes pula)' },
                      { value: 'ausente', label: 'Muito espaçado (60+ dias entre ciclos)' },
                    ].map(opt => (
                      <OptionBtn key={opt.value} value={opt.value} current={frequenciaCiclo} label={opt.label} onClick={() => setFrequenciaCiclo(opt.value)} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )

      case 'sintomas':
        return (
          <div className="space-y-4">
            <div>
              <label className="label-field">Selecione os sintomas que você sente:</label>
              <p className="text-xs text-gray-400 mb-3">Pode selecionar vários</p>
              <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1">
                {SINTOMAS_OPTIONS.map(s => (
                  <Checkbox key={s} label={s} checked={sintomas.includes(s)} onClick={() => toggleItem(sintomas, s, setSintomas)} />
                ))}
              </div>
            </div>
            {sintomas.length > 0 && (
              <div>
                <label className="label-field">Intensidade geral:</label>
                <div className="flex gap-2">
                  {[{ v: 'leve', l: 'Leve' }, { v: 'moderado', l: 'Moderado' }, { v: 'intenso', l: 'Intenso' }].map(o => (
                    <button key={o.v} onClick={() => setIntensidadeSintomas(o.v)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${intensidadeSintomas === o.v ? 'border-rosa-500 bg-rosa-50 text-rosa-700' : 'border-gray-200'}`}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'saude':
        return (
          <div className="space-y-5">
            <div>
              <label className="label-field">Condições de saúde diagnosticadas:</label>
              <div className="space-y-2 max-h-[22vh] overflow-y-auto pr-1">
                {DOENCAS_OPTIONS.map(d => (
                  <Checkbox key={d} label={d} checked={doencas.includes(d)} onClick={() => toggleItem(doencas, d, setDoencas)} />
                ))}
              </div>
            </div>
            <div>
              <label className="label-field">Histórico familiar:</label>
              <div className="space-y-2">
                {HISTORICO_FAMILIAR_OPTIONS.map(h => (
                  <Checkbox key={h} label={h} checked={historicoFamiliar.includes(h)} onClick={() => toggleItem(historicoFamiliar, h, setHistoricoFamiliar)} />
                ))}
              </div>
            </div>
            <div>
              <label className="label-field">Medicamentos em uso:</label>
              <div className="space-y-2 max-h-[22vh] overflow-y-auto pr-1">
                {MEDICAMENTOS_OPTIONS.map(m => (
                  <Checkbox key={m} label={m} checked={medicamentos.includes(m)} onClick={() => toggleItem(medicamentos, m, setMedicamentos)} />
                ))}
              </div>
            </div>
            <div>
              <label className="label-field">Usa Terapia de Reposição Hormonal (TRH)?</label>
              <div className="flex gap-3">
                {[{ v: true, l: 'Sim' }, { v: false, l: 'Não' }].map(o => (
                  <button key={String(o.v)} onClick={() => setUsoTrh(o.v)}
                    className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${usoTrh === o.v ? 'border-rosa-500 bg-rosa-50 text-rosa-700' : 'border-gray-200'}`}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 'estilo_vida':
        return (
          <div className="space-y-5">
            <div>
              <label className="label-field">Nível atual de atividade física:</label>
              <div className="space-y-2">
                {[
                  { value: 'sedentaria', label: 'Sedentária', desc: 'Não pratico exercícios' },
                  { value: 'leve', label: 'Leve', desc: '1-2x por semana, caminhada' },
                  { value: 'moderada', label: 'Moderada', desc: '3-4x por semana' },
                  { value: 'intensa', label: 'Intensa', desc: '5+ vezes por semana' },
                ].map(opt => (
                  <OptionBtn key={opt.value} value={opt.value} current={atividadeFisica} label={opt.label} desc={opt.desc} onClick={() => setAtividadeFisica(opt.value)} />
                ))}
              </div>
            </div>
            <div>
              <label className="label-field flex items-center gap-2">
                <Moon size={14} className="text-rosa-500" />
                Horas de sono por noite: <strong className="text-rosa-500 ml-1">{horasSono}h</strong>
              </label>
              <input type="range" min={3} max={12} value={horasSono}
                onChange={e => setHorasSono(Number(e.target.value))}
                className="w-full mt-2 accent-rosa-500" />
            </div>
            <div>
              <label className="label-field">Qualidade do sono:</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ v: 'boa', l: 'Boa' }, { v: 'regular', l: 'Regular' }, { v: 'ruim', l: 'Ruim' }, { v: 'pessima', l: 'Péssima' }].map(o => (
                  <button key={o.v} onClick={() => setQualidadeSono(o.v)}
                    className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${qualidadeSono === o.v ? 'border-rosa-500 bg-rosa-50 text-rosa-700' : 'border-gray-200'}`}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label-field flex items-center gap-2">
                <Brain size={14} className="text-rosa-500" /> Nível de estresse:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[{ v: 'baixo', l: 'Baixo' }, { v: 'moderado', l: 'Moderado' }, { v: 'alto', l: 'Alto' }, { v: 'muito_alto', l: 'Muito Alto' }].map(o => (
                  <button key={o.v} onClick={() => setNivelEstresse(o.v)}
                    className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${nivelEstresse === o.v ? 'border-rosa-500 bg-rosa-50 text-rosa-700' : 'border-gray-200'}`}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 'alimentacao':
        return (
          <div>
            <label className="label-field">Restrições alimentares:</label>
            <div className="space-y-2">
              {RESTRICOES_OPTIONS.map(r => (
                <Checkbox key={r} label={r} checked={restricoes.includes(r)} onClick={() => toggleItem(restricoes, r, setRestricoes)} />
              ))}
            </div>
          </div>
        )

      case 'objetivo':
        return (
          <div className="space-y-3">
            <label className="label-field">Qual o seu principal objetivo?</label>
            {OBJETIVOS.map(obj => (
              <button
                key={obj.value}
                onClick={() => setObjetivo(obj.value)}
                className={`w-full text-left px-4 py-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                  objetivo === obj.value ? 'border-rosa-500 bg-rosa-50' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  objetivo === obj.value ? 'bg-rosa-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {obj.icon}
                </div>
                <div>
                  <p className={`font-semibold text-sm ${objetivo === obj.value ? 'text-rosa-700' : 'text-gray-700'}`}>{obj.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{obj.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )

      case 'resultado':
        return (
          <div className="text-center py-4">
            <div className="w-24 h-24 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
            </div>
            <h2 className="font-serif text-2xl font-bold text-gray-800 mb-2">🎉 Perfil Criado!</h2>
            <p className="text-gray-500 text-sm mb-1">Você foi classificada como:</p>
            <div className="flex justify-center mb-5">
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${faseBadgeClass(faseClassificada)}`}>
                {faseLabel(faseClassificada)}
              </span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5 text-left">
              <div className="grid grid-cols-2 gap-3 text-center">
                {[
                  { label: 'Idade', valor: `${idade} anos` },
                  { label: 'IMC', valor: (peso / (altura * altura)).toFixed(1) },
                  { label: 'Sintomas', valor: sintomas.length },
                  { label: 'Objetivo', valor: OBJETIVOS.find(o => o.value === objetivo)?.label },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 mb-0.5">{item.label}</p>
                    <p className="font-bold text-rosa-500 text-sm">{item.valor}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-4 animate-pulse">
              Preparando seu plano personalizado...
            </p>

            <button
              onClick={() => navigate('/saude-info')}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Ver Informações da Minha Fase <ChevronRight size={18} />
            </button>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-offwhite flex flex-col">
      {/* Header com logo */}
      <div className="bg-offwhite border-b border-gray-100 px-4 pt-4 pb-3 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <img src="/logo.png" alt="Menovitta" className="w-9 h-9 object-contain drop-shadow" />
          <div className="flex-1">
            <h1 className="font-serif text-base font-bold text-gray-800">{STEPS[step].title}</h1>
            <p className="text-[11px] text-gray-400">{STEPS[step].subtitle}</p>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {step + 1}/{STEPS.length}
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(to right, #B76E79, #D4AF37)'
            }}
          />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 px-4 py-5 overflow-y-auto">
        {renderStep()}
      </div>

      {/* Erro */}
      {erro && (
        <div className="mx-4 mb-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle size={16} />
          {erro}
        </div>
      )}

      {/* Botões de navegação */}
      {STEPS[step].id !== 'resultado' && (
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3 shadow-lg">
          {step > 0 && (
            <button onClick={prevStep} className="btn-secondary flex items-center gap-1 px-4">
              <ChevronLeft size={18} /> Voltar
            </button>
          )}
          <button
            onClick={nextStep}
            disabled={loading || (STEPS[step].id === 'ciclo' && !ultimaMenstruacao)}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</>
            ) : step === STEPS.length - 2 ? (
              'Finalizar'
            ) : (
              <>Próximo <ChevronRight size={18} /></>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
