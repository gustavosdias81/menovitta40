import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Sparkles, X, Loader2 } from 'lucide-react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { FaseMenopausa, Objetivo } from '../types'

// ── GEMINI ────────────────────────────────────────────────────────────────────
function getGemini() {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (!key) throw new Error('VITE_GEMINI_API_KEY não configurada')
  return new GoogleGenerativeAI(key)
}

// ── LABEL DO OBJETIVO ─────────────────────────────────────────────────────────
const OBJETIVO_LABELS: Record<Objetivo, string> = {
  emagrecer:     'Emagrecer',
  forma:         'Ficar em Forma',
  hipertrofia:   'Ganho Muscular',
  saude:         'Saúde Geral',
  flexibilidade: 'Flexibilidade',
}
const OBJETIVO_EMOJI: Record<Objetivo, string> = {
  emagrecer: '🔥', forma: '⚡', hipertrofia: '💪', saude: '❤️', flexibilidade: '🧘‍♀️',
}

// ── IMAGENS POR FASE ─────────────────────────────────────────────────────────
const HERO_IMGS: Record<FaseMenopausa, string> = {
  pre_menopausa:  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
  menopausa:      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  pos_menopausa:  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
}

// ── CARDS DETALHADOS POR FASE ─────────────────────────────────────────────────
interface InfoCard {
  emoji: string
  titulo: string
  resumo: string
  detalhe: string
  img: string
  color: string
}

const INFO_POR_FASE: Record<FaseMenopausa, { titulo: string; descricao: string; cards: InfoCard[] }> = {
  pre_menopausa: {
    titulo: 'Pré-Menopausa',
    descricao: 'Fase de transição. Hora de se preparar com hábitos que vão definir os próximos anos.',
    cards: [
      {
        emoji: '', titulo: 'Metabolismo em Transição',
        resumo: 'O corpo começa a armazenar mais gordura abdominal — mas dá para reverter.',
        detalhe: 'A queda gradual do estrogênio altera o metabolismo: o corpo passa a preferir armazenar gordura na região abdominal em vez de quadris. Isso aumenta o risco cardiovascular e metabólico. A boa notícia: treino de força 3–4x/semana + proteína adequada (1,2–1,5g/kg) + redução de açúcares refinados podem reverter completamente esse processo. O metabolismo basal cai cerca de 1–2% por décade após os 30, mas o treino de força compensa essa perda mantendo massa magra — o principal tecido que queima calorias.',
        img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80',
        color: 'from-amber-50 to-white border-amber-100',
      },
      {
        emoji: '', titulo: 'Treino de Força é Prioridade',
        resumo: 'A sarcopenia começa silenciosamente até 10 anos antes da menopausa.',
        detalhe: 'Cada ano sem treino de força equivale a meses de envelhecimento acelerado. Mulheres sedentárias perdem até 8% de força muscular por década a partir dos 30 anos. A sarcopenia (perda de músculo) causa fraqueza, quedas, fraturas e dependência na terceira idade — e começa muito antes da menopausa. Comece agora: 2–4x/semana de treino de resistência preserva massa magra, mantém o metabolismo ativo, protege ossos e articulações, melhora humor e garante independência. É o melhor investimento que você pode fazer pela sua saúde futura.',
        img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
        color: 'from-rosa-50 to-white border-rosa-100',
      },
      {
        emoji: '', titulo: 'Nutrição Estratégica',
        resumo: 'Proteínas, cálcio, vitamina D e fitoestrógenos são seus aliados agora.',
        detalhe: 'Na pré-menopausa, a alimentação deve ser estratégica: proteínas (1,2–1,5g/kg/dia) para preservar músculo; cálcio (1.000mg/dia) e vitamina D para os ossos; fitoestrógenos naturais (soja, linhaça, grão-de-bico) para modular os hormônios de forma suave; e ômega-3 (salmão, sardinha, chia) para proteger o coração e o cérebro. Reduza ao máximo açúcares refinados, bebidas alcoólicas e alimentos ultraprocessados — que amplificam a inflamação e pioram os sintomas hormonais. Distribua 3–4 refeições equilibradas ao longo do dia.',
        img: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=400&q=80',
        color: 'from-green-50 to-white border-green-100',
      },
      {
        emoji: '', titulo: 'Sono e Recuperação',
        resumo: 'Sono consistente é a base de toda regulação hormonal.',
        detalhe: 'O sono é quando seu corpo produz GH (hormônio do crescimento), repara músculos, consolida memória e regula insulina e cortisol. Na pré-menopausa, a queda da progesterona (que tem efeito sedativo) começa a piorar o sono. Estratégias práticas: horário fixo para dormir e acordar (mesmo fins de semana); desligar telas 60 minutos antes; quarto escuro e frio (18–20°C ideal); evitar cafeína após 14h; magnésio (300–400mg antes de dormir) pode ajudar a relaxar. 7–9 horas de sono de qualidade não é luxo — é medicamento.',
        img: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=400&q=80',
        color: 'from-indigo-50 to-white border-indigo-100',
      },
      {
        emoji: '', titulo: 'Saúde Mental',
        resumo: 'Oscilações de humor e ansiedade são comuns — e têm solução.',
        detalhe: 'As flutuações hormonais da pré-menopausa afetam diretamente os neurotransmissores: serotonina, dopamina e GABA — os responsáveis pelo humor, prazer e calma. Isso explica irritabilidade, choro repentino, ansiedade e sensação de "estar no limite". Não é fraqueza: é fisiologia. Exercício aeróbico (30–45min, 3–5x/semana) é o antidepressivo natural mais eficaz — aumenta BDNF e serotonina. Meditação 10 minutos diários reduz cortisol em até 27%. Yoga combina movimento, respiração e consciência corporal, atacando a ansiedade em múltiplas frentes.',
        img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80',
        color: 'from-purple-50 to-white border-purple-100',
      },
      {
        emoji: '', titulo: 'Exames Preventivos',
        resumo: 'Check-up anual é seu radar — não espere sintomas para agir.',
        detalhe: 'Na pré-menopausa, o monitoramento preventivo é fundamental: exames hormonais (FSH, LH, estradiol, progesterona) para avaliar a fase do ciclo; densitometria óssea (linha de base para comparação futura); perfil lipídico completo (colesterol total, LDL, HDL, triglicerídeos); glicemia de jejum e insulina; TSH e T4 livre (tireóide); vitamina D (níveis abaixo de 40ng/mL são muito comuns); mamografia e papanicolau conforme protocolos. Converse com seu ginecologista sobre terapia de reposição hormonal (TRH) — é uma opção válida para muitas mulheres.',
        img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80',
        color: 'from-blue-50 to-white border-blue-100',
      },
    ],
  },
  menopausa: {
    titulo: 'Menopausa',
    descricao: 'Os hormônios estão em queda significativa. Este é o momento mais importante para investir em saúde.',
    cards: [
      {
        emoji: '', titulo: 'Gerenciando os Fogachos',
        resumo: 'Afetam 80% das mulheres — e têm solução prática.',
        detalhe: 'Os fogachos (ondas de calor) são causados pela queda do estrogênio, que desregula o termostato cerebral no hipotálamo. Podem ocorrer 10–15x por dia, incluindo à noite (suores noturnos), interrompendo o sono e aumentando fadiga. Estratégias práticas: exercício aeróbico 30–45min/dia reduz a frequência em até 50%; evite álcool, cafeína e alimentos apimentados (gatilhos comuns); use roupas em camadas; mantenha o ambiente fresco; técnicas de respiração profunda ajudam a controlar a intensidade. A TRH (terapia de reposição hormonal) é a opção mais eficaz quando indicada pelo médico — e os riscos costumam ser menores que os benefícios para a maioria das mulheres saudáveis.',
        img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80',
        color: 'from-orange-50 to-white border-orange-100',
      },
      {
        emoji: '', titulo: 'Treino de Força: Urgente e Vital',
        resumo: 'A sarcopenia acelera drasticamente na menopausa — aja agora.',
        detalhe: 'Sem estrogênio e com GH em declínio, a perda de massa muscular (sarcopenia) pode chegar a 2% ao ano na menopausa sem intervenção. Mulheres que não treinam força chegam aos 70 anos com 30–40% menos músculo que aos 40, levando a fraqueza, quedas, fraturas e dependência. Além disso, perder músculo significa metabolismo mais lento, ganho de gordura e piora do controle glicêmico. O treino de resistência 3–4x/semana com progressão de carga é a maior intervenção de longevidade disponível: mantém músculos, ossos, metabolismo e autonomia. Cada sessão é um investimento que você vai sentir daqui a 20 anos.',
        img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
        color: 'from-rosa-50 to-white border-rosa-100',
      },
      {
        emoji: '', titulo: 'Proteção Cardiovascular',
        resumo: 'O estrogênio protegia seu coração — agora você assume esse papel.',
        detalhe: 'O estrogênio era o protetor natural do coração: controlava o colesterol, mantinha as artérias elásticas, reduzia inflamação e regulava a pressão. Com sua queda na menopausa, o risco de infarto e AVC aumenta 2–3x — igualando ao dos homens. O LDL sobe, o HDL cai e a pressão arterial tende a aumentar. Ação: aeróbico 150min/semana em intensidade moderada; ômega-3 (2–3 porções de peixe gordo por semana ou suplementação com EPA+DHA); dieta pobre em sódio e gordura saturada; controle do estresse (cortisol elevado cronicamente danifica as artérias); não fumar; e monitorar pressão arterial e colesterol a cada 6 meses.',
        img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80',
        color: 'from-red-50 to-white border-red-100',
      },
      {
        emoji: '', titulo: 'Proteína: O Remédio Contra a Sarcopenia',
        resumo: 'Sem proteína suficiente, nem o treino salva o músculo.',
        detalhe: 'A deficiência hormonal da menopausa reduz a síntese proteica muscular em até 30%, o que significa que o corpo aproveita menos a proteína que você consome. Por isso a necessidade sobe para 1,4–1,6g/kg/dia — bem acima da recomendação geral. Distribua 25–30g de proteína por refeição (café, almoço e jantar) para máxima absorção — o músculo não consegue usar mais que isso de vez. Fontes: frango (31g/100g), atum (30g/100g), ovos (13g/2 ovos), iogurte grego (10g/100g), whey protein, tofu (8g/100g). Sem proteína adequada e treino de força, a sarcopenia é inevitável.',
        img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80',
        color: 'from-green-50 to-white border-green-100',
      },
      {
        emoji: '', titulo: 'Pele, Colágeno e Hidratação',
        resumo: 'Perde-se 30% do colágeno nos primeiros 5 anos da menopausa.',
        detalhe: 'O estrogênio estimula fibroblastos a produzirem colágeno — proteína que mantém pele firme, articulações lubrificadas e ossos densos. Nos primeiros 5 anos após a menopausa, perde-se até 30% do colágeno. A pele fica mais fina, seca, com rugas e menos resistente. As articulações podem doer mais. Ação: beba 2L de água/dia; use colágeno hidrolisado (10g/dia) com vitamina C (aumenta absorção em até 70%); protetor solar diário SPF 30+ (UV acelera a degradação); hidratante corporal e facial; ácido hialurônico tópico retém água na pele; e o próprio treino de força estimula naturalmente a síntese de colágeno.',
        img: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=400&q=80',
        color: 'from-cyan-50 to-white border-cyan-100',
      },
      {
        emoji: '', titulo: 'Névoa Mental: O Que Ninguém Conta',
        resumo: 'Esquecimentos e dificuldade de foco têm causa hormonal — e solução.',
        detalhe: 'O estrogênio é neuroprotetor: regula memória, concentração, humor e sono através de receptores em todo o cérebro. Sua queda causa a "névoa mental" — esquecimentos, dificuldade de foco, lapsos de linguagem e irritabilidade. Isso afeta 40% das mulheres na menopausa e não é início de demência: é química. O que ajuda: exercício aeróbico 30min/dia aumenta BDNF (fator neurotrófico que regenera neurônios); sono de qualidade é inegociável para consolidar memória; ômega-3 DHA protege a membrana neuronal; aprendizado constante (idiomas, instrumentos, jogos) cria novas conexões. Com tratamento, a névoa mental regride na grande maioria das mulheres.',
        img: 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?auto=format&fit=crop&w=400&q=80',
        color: 'from-purple-50 to-white border-purple-100',
      },
    ],
  },
  pos_menopausa: {
    titulo: 'Pós-Menopausa',
    descricao: 'Hormônios estabilizados. Foco total em longevidade: ossos, músculo, coração e qualidade de vida.',
    cards: [
      {
        emoji: '', titulo: 'Saúde Óssea — Prioridade Máxima',
        resumo: 'Perda óssea pode chegar a 2–3% ao ano sem prevenção.',
        detalhe: 'Os ossos são tecido vivo em constante remodelação — e o estrogênio era o principal hormônio que freava a reabsorção óssea. Sem ele, a perda pode chegar a 2–3% ao ano, elevando drasticamente o risco de osteoporose e fraturas. A fratura de quadril em idosos tem mortalidade de 20–30% em 1 ano. Prevenção: treino de força com impacto (agachamento, afundo, exercícios em pé) — o impacto mecânico estimula a formação óssea; cálcio 1.200mg/dia (preferencialmente alimentar: laticínios, sardinha, brócolis); vitamina D3 (2.000–4.000 UI/dia, ajuste com exame); vitamina K2 MK-7 (direciona o cálcio para os ossos); e densitometria óssea anual para monitoramento.',
        img: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=400&q=80',
        color: 'from-blue-50 to-white border-blue-100',
      },
      {
        emoji: '', titulo: 'Músculo: O Órgão da Longevidade',
        resumo: 'Músculo é o maior órgão metabólico — e o mais antienvelhecimento.',
        detalhe: 'O músculo é muito mais que estética: é o maior órgão metabólico do corpo, regulando glicose (prevenção de diabetes), produzindo miocinase (hormônios protetores do cérebro e do coração) e sustentando a estrutura óssea e articular. Sem treino na pós-menopausa, perde-se 1–2% de massa muscular por ano — chegando aos 80 com menos da metade do músculo que tinha aos 40. A sarcopenia avançada causa quedas (principal causa de hospitalização e morte em idosos), fraturas de quadril, dificuldade para atividades básicas e perda de autonomia. Treino de força 3–4x/semana com progressão de carga é literalmente o exercício mais antienvelhecimento que existe — e nunca é tarde para começar.',
        img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
        color: 'from-rosa-50 to-white border-rosa-100',
      },
      {
        emoji: '', titulo: 'Coração sob Cuidado',
        resumo: 'Risco cardiovascular iguala o dos homens após a menopausa.',
        detalhe: 'Após 10 anos de pós-menopausa, a doença cardiovascular é a principal causa de morte em mulheres — ultrapassando todos os cânceres combinados. Sem estrogênio, o LDL sobe, o HDL cai, as artérias ficam menos elásticas e a inflamação crônica se instala. Ação preventiva: aeróbico 150–300min/semana (caminhada rápida, bike, natação) em intensidade moderada; dieta mediterrânea (azeite, peixes, oleaginosas, vegetais, leguminosas); controle da pressão arterial (meta: <130/80); não fumar; gerenciar estresse (cortisol elevado danifica endotélio); e consulta cardiológica anual com exames de lipidograma e glicemia.',
        img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&q=80',
        color: 'from-red-50 to-white border-red-100',
      },
      {
        emoji: '', titulo: 'Nutrição Anti-inflamatória',
        resumo: 'A inflamação crônica acelera o envelhecimento — a dieta é sua arma.',
        detalhe: 'Na pós-menopausa, a inflamação crônica de baixo grau (inflammaging) é o motor que acelera quase todas as doenças: cardiovascular, osteoporose, diabetes, demência e cânceres. A dieta anti-inflamatória é a intervenção mais poderosa: salmão, sardinha e atum (ômega-3 EPA+DHA); frutas vermelhas (antocianinas); azeite extra virgem (oleocantal); cúrcuma com pimenta-preta (curcumina); gengibre; oleaginosas (castanhas, nozes); vegetais crucíferos (brócolis, couve-flor). Evite: açúcar refinado, óleos vegetais processados (soja, milho, girassol), farinhas brancas e carnes ultraprocessadas. Proteína: 1,4–1,6g/kg/dia para preservar músculo.',
        img: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=400&q=80',
        color: 'from-green-50 to-white border-green-100',
      },
      {
        emoji: '', titulo: 'Longevidade Cognitiva',
        resumo: 'Exercício físico é o maior protetor contra declínio cognitivo.',
        detalhe: 'A cada ano após a menopausa sem proteção hormonal e sem estilo de vida ativo, o risco de declínio cognitivo e Alzheimer aumenta. O exercício físico aeróbico é o maior protetor existente: aumenta o fluxo sanguíneo cerebral, estimula BDNF (fator de crescimento neuronal), reduz a deposição de placas amiloides e mantém o volume do hipocampo (memória). Combine aeróbico + treino de força + vida social ativa + sono de qualidade + aprendizado constante. Suplementos com evidência: ômega-3 DHA (1g/dia), vitamina D3, B12 (especialmente em idosas acima de 65). Cuide da pressão arterial — hipertensão é o maior fator de risco modificável para demência.',
        img: 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?auto=format&fit=crop&w=400&q=80',
        color: 'from-purple-50 to-white border-purple-100',
      },
      {
        emoji: '', titulo: 'Qualidade de Vida',
        resumo: 'Muitas mulheres relatam mais energia e clareza após a estabilização hormonal.',
        detalhe: 'A pós-menopausa pode ser um dos períodos mais poderosos e libertadores da vida de uma mulher. Com a estabilização hormonal, muitas relatam mais clareza mental, menos oscilações de humor e maior confiança. Estudo da Universidade de Melbourne mostrou que 60% das mulheres na pós-menopausa se sentem "mais elas mesmas" que em qualquer outra fase. Para maximizar essa qualidade de vida: invista em hobbies e aprendizados que te desafiam; cultive relacionamentos de qualidade (a solidão aumenta o risco de demência em 50%); pratique gratidão e mindfulness; cuide do autocuidado sem culpa; e lembre-se que longevidade sem saúde é carga — longevidade com saúde é presente.',
        img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80',
        color: 'from-ouro-50 to-white border-ouro-100',
      },
    ],
  },
}

// ── AI: tipo de tópico gerado ─────────────────────────────────────────────────
interface TopicoIA {
  emoji: string
  titulo: string
  resumo: string
  detalhe: string
}

async function gerarTopicosIA(fase: FaseMenopausa, objetivo: Objetivo, nome: string): Promise<TopicoIA[]> {
  const genai = getGemini()
  const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const objetivoLabel = OBJETIVO_LABELS[objetivo] || 'Saúde Geral'
  const prompt = `Você é a IA Menovitta, especialista em saúde feminina 40+.
A aluna ${nome || 'Aluna'} está na fase ${fase.replace(/_/g, '-')} e seu objetivo principal é: ${objetivoLabel}.

Gere 5 tópicos de saúde ALTAMENTE PERSONALIZADOS para o objetivo "${objetivoLabel}" nessa fase.
Cada tópico deve ser acionável, motivador e específico para esse objetivo.

Retorne SOMENTE um array JSON válido (sem markdown, sem texto antes ou depois):
[{"emoji":"🔥","titulo":"título curto","resumo":"1 frase de impacto","detalhe":"explicação de 3 parágrafos com estratégias práticas e dicas acionáveis"}]`

  // 3 tentativas com backoff
  const delays = [0, 3000, 8000]
  for (let attempt = 0; attempt < 3; attempt++) {
    if (delays[attempt] > 0) await new Promise(r => setTimeout(r, delays[attempt]))
    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text().trim()
      const clean = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
      const arr = JSON.parse(clean)
      if (!Array.isArray(arr) || arr.length === 0) throw new Error('Resposta inválida da IA')
      return arr as TopicoIA[]
    } catch (err) {
      if (attempt === 2) throw err
    }
  }
  throw new Error('Falha após 3 tentativas')
}

// ── COMPONENTE ────────────────────────────────────────────────────────────────
export default function HealthInfo() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const fase = (profile?.fase_menopausa || 'menopausa') as FaseMenopausa
  const objetivo = (profile?.objetivo || 'saude') as Objetivo
  const info = INFO_POR_FASE[fase]
  const heroImg = HERO_IMGS[fase]
  const primeiroNome = (profile?.nome || (user?.user_metadata?.nome as string | undefined) || '').split(' ')[0]

  const [cardAberto, setCardAberto] = useState<InfoCard | TopicoIA | null>(null)
  const [topicosIA, setTopicosIA] = useState<TopicoIA[]>([])
  const [loadingIA, setLoadingIA] = useState(false)
  const [erroIA, setErroIA] = useState(false)
  const [erroMsgIA, setErroMsgIA] = useState('')
  const [iaCarregada, setIaCarregada] = useState(false)

  // Cache IA por fase+objetivo no localStorage
  const cacheKey = `menovitta_health_ia_${user?.id}_${fase}_${objetivo}`

  useEffect(() => {
    // Aguarda o user estar carregado antes de tentar (evita cacheKey com 'undefined')
    if (!user?.id) return
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTopicosIA(parsed)
          setIaCarregada(true)
          return
        }
      } catch { /* ignora cache corrompido */ }
    }
    carregarIA()
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const carregarIA = async () => {
    setLoadingIA(true)
    setErroIA(false)
    setErroMsgIA('')
    try {
      const topicos = await gerarTopicosIA(fase, objetivo, primeiroNome)
      setTopicosIA(topicos)
      setIaCarregada(true)
      localStorage.setItem(cacheKey, JSON.stringify(topicos))
    } catch (err) {
      console.error('HealthInfo IA error:', err)
      const msg = err instanceof Error ? err.message : String(err)
      setErroMsgIA(msg)
      setErroIA(true)
    } finally {
      setLoadingIA(false)
    }
  }

  const objetivoLabel = OBJETIVO_LABELS[objetivo] || 'Saúde Geral'
  const objetivoEmoji = OBJETIVO_EMOJI[objetivo] || '❤️'

  return (
    <div className="min-h-screen bg-offwhite pb-10">

      {/* ── MODAL DE DETALHE ── */}
      {cardAberto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-0">
          <div className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col">
            {/* Header do modal */}
            <div className="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
              <span className="text-3xl">{cardAberto.emoji}</span>
              <p className="font-serif font-bold text-gray-800 text-base flex-1 leading-tight">{cardAberto.titulo}</p>
              <button
                onClick={() => setCardAberto(null)}
                className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>
            {/* Corpo do modal */}
            <div className="overflow-y-auto px-5 py-4 flex-1">
              {'img' in cardAberto && (
                <img
                  src={cardAberto.img}
                  alt={cardAberto.titulo}
                  className="w-full h-44 object-cover rounded-2xl mb-4"
                />
              )}
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">{cardAberto.detalhe}</p>
            </div>
            <div className="px-5 pb-6 pt-3 flex-shrink-0">
              <button
                onClick={() => setCardAberto(null)}
                className="btn-primary w-full"
              >
                Entendi ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO BANNER ── */}
      <div className="relative h-52 overflow-hidden">
        <img src={heroImg} alt={info.titulo} className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(183,110,121,0.9) 100%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-white/80 text-xs font-medium uppercase tracking-widest mb-1">
            {primeiroNome ? `Seu Perfil, ${primeiroNome}` : 'Informações da Sua Fase'}
          </p>
          <h1 className="font-serif text-2xl font-bold text-white drop-shadow leading-tight">
            {objetivoEmoji} {objetivoLabel} · {info.titulo}
          </h1>
          <p className="text-white/85 text-xs leading-relaxed mt-1">{info.descricao}</p>
        </div>
      </div>

      <div className="px-4 mt-5 space-y-5">

        {/* ── SEÇÃO IA PERSONALIZADA ── */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-rosa-400" />
            <p className="font-bold text-gray-800 text-sm">
              Personalizado para: <span className="text-rosa-500">{objetivoEmoji} {objetivoLabel}</span>
            </p>
          </div>

          {loadingIA && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 size={28} className="text-rosa-400 animate-spin" />
              <p className="text-sm text-gray-400">A IA Menovitta está personalizando suas dicas...</p>
            </div>
          )}

          {erroIA && !loadingIA && (
            <div className="py-4 space-y-2">
              <p className="text-sm text-gray-500 text-center">Não foi possível carregar as dicas personalizadas.</p>
              {erroMsgIA && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  <p className="text-[11px] text-red-500 font-mono break-all">{erroMsgIA.slice(0, 200)}</p>
                </div>
              )}
              <div className="text-center pt-1">
                <button onClick={carregarIA} className="text-rosa-500 text-sm font-semibold underline">
                  Tentar novamente
                </button>
              </div>
            </div>
          )}

          {iaCarregada && topicosIA.length > 0 && (
            <div className="space-y-2">
              {topicosIA.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setCardAberto(t)}
                  className="w-full text-left flex items-center gap-3 p-3 bg-rosa-50 hover:bg-rosa-100 active:bg-rosa-200 rounded-xl transition-all border border-rosa-100"
                >
                  <span className="text-2xl flex-shrink-0">{t.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm leading-tight">{t.titulo}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{t.resumo}</p>
                  </div>
                  <ChevronRight size={16} className="text-rosa-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── TÓPICOS POR FASE ── */}
        <div>
          <p className="font-bold text-gray-700 text-sm mb-3">📚 Sobre sua fase — {info.titulo}</p>
          <div className="space-y-2">
            {info.cards.map((card, i) => (
              <button
                key={i}
                onClick={() => setCardAberto(card)}
                className={`w-full text-left bg-gradient-to-r ${card.color} rounded-2xl border overflow-hidden shadow-sm active:scale-[0.98] transition-all`}
              >
                <div className="flex items-center p-3 gap-3">
                  <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden">
                    <img src={card.img} alt={card.titulo} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base">{card.emoji}</span>
                      <p className="font-semibold text-gray-800 text-sm leading-tight">{card.titulo}</p>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{card.resumo}</p>
                  </div>
                  <ChevronRight size={15} className="text-gray-400 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── CTA FINAL ── */}
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80"
            alt="Comece agora"
            className="w-full h-36 object-cover object-top"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(183,110,121,0.88) 0%, rgba(212,175,55,0.8) 100%)' }}>
            <Sparkles className="w-6 h-6 text-white mb-2" />
            <h3 className="font-serif text-lg font-bold text-white mb-1">Pronta para começar?</h3>
            <p className="text-white/90 text-xs mb-3">Seu plano personalizado está preparado!</p>
            <button
              onClick={() => navigate('/plano')}
              className="bg-white text-rosa-600 font-semibold text-sm px-6 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg"
              style={{ boxShadow: '0 4px 0 #e8c8cc, 0 6px 12px rgba(0,0,0,0.2)' }}
            >
              Ver Meu Plano de Ação <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
