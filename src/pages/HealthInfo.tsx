import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Heart, Shield, Flame, Brain, Moon, Dumbbell,
  Apple, Droplets, ChevronRight, Sparkles
} from 'lucide-react'
import type { FaseMenopausa } from '../types'

interface InfoCard {
  icon: React.ReactNode
  title: string
  content: string
  color: string
}

const INFO_POR_FASE: Record<FaseMenopausa, { titulo: string; descricao: string; cards: InfoCard[] }> = {
  pre_menopausa: {
    titulo: 'Pré-Menopausa',
    descricao: 'Você está na fase de transição. Seu corpo está começando a reduzir a produção de estrogênio e progesterona. É o momento ideal para se preparar e minimizar os impactos das mudanças hormonais.',
    cards: [
      {
        icon: <Flame size={20} />,
        title: 'Metabolismo em Transição',
        content: 'Nesta fase, o metabolismo começa a desacelerar gradualmente. O corpo passa a armazenar mais gordura na região abdominal devido à queda do estrogênio. A boa notícia: com treino de força e alimentação adequada, é possível reverter esse processo e até acelerar o metabolismo.',
        color: 'bg-amber-50 text-amber-600',
      },
      {
        icon: <Dumbbell size={20} />,
        title: 'Treino de Força é Prioridade',
        content: 'A perda muscular (sarcopenia) pode começar anos antes da menopausa. Treinos de resistência com pesos 2-4x por semana são essenciais para manter massa magra, fortalecer ossos e proteger articulações. Exercícios compostos como agachamento, levantamento terra e supino são os mais eficientes.',
        color: 'bg-rosa-50 text-rosa-600',
      },
      {
        icon: <Apple size={20} />,
        title: 'Nutrição Estratégica',
        content: 'Aumente a ingestão de proteínas (1,2-1,5g por kg de peso), cálcio (1.000-1.200mg/dia), vitamina D e magnésio. Reduza açúcares refinados e alimentos ultraprocessados. Inclua alimentos ricos em fitoestrógenos como soja, linhaça e grão-de-bico.',
        color: 'bg-green-50 text-green-600',
      },
      {
        icon: <Moon size={20} />,
        title: 'Sono e Recuperação',
        content: 'Alterações no sono podem começar nesta fase. Estabeleça uma rotina de sono consistente, evite telas 1h antes de dormir e considere suplementação de magnésio e melatonina (com orientação médica). O sono é fundamental para a regulação hormonal.',
        color: 'bg-indigo-50 text-indigo-600',
      },
      {
        icon: <Brain size={20} />,
        title: 'Saúde Mental',
        content: 'Oscilações de humor, ansiedade e irritabilidade são comuns na pré-menopausa. Práticas como meditação, yoga e exercício aeróbico de intensidade moderada ajudam a regular neurotransmissores e melhorar o bem-estar emocional.',
        color: 'bg-purple-50 text-purple-600',
      },
      {
        icon: <Shield size={20} />,
        title: 'Exames Preventivos',
        content: 'Faça check-up anual com seu ginecologista. Solicite exames de dosagem hormonal (FSH, estradiol, progesterona), densitometria óssea, perfil lipídico e glicemia. Discuta com seu médico sobre a possibilidade de Terapia de Reposição Hormonal (TRH).',
        color: 'bg-blue-50 text-blue-600',
      },
    ],
  },
  menopausa: {
    titulo: 'Menopausa (Perimenopausa)',
    descricao: 'Você está no período de transição ativa. Os níveis de estrogênio estão caindo significativamente, o que intensifica os sintomas. Este é o momento mais importante para investir em hábitos saudáveis que vão definir sua qualidade de vida nos próximos anos.',
    cards: [
      {
        icon: <Flame size={20} />,
        title: 'Gerenciando os Fogachos',
        content: 'As ondas de calor afetam até 80% das mulheres. Além da TRH (que é a mais eficaz), estratégias como exercício regular, vestir-se em camadas, evitar álcool e cafeína, e manter o ambiente fresco ajudam. Exercício aeróbico moderado 30-45min reduz a frequência dos fogachos em até 50%.',
        color: 'bg-orange-50 text-orange-600',
      },
      {
        icon: <Dumbbell size={20} />,
        title: 'Treino Adaptado à Fase',
        content: 'Combine treino de força (3-4x/semana) com exercício aeróbico moderado (150min/semana). O treino HIIT pode ser excelente, mas evite excessos que aumentem o cortisol. Priorize exercícios de impacto moderado para saúde óssea: caminhada rápida, subir escadas, dança.',
        color: 'bg-rosa-50 text-rosa-600',
      },
      {
        icon: <Heart size={20} />,
        title: 'Proteção Cardiovascular',
        content: 'A queda do estrogênio aumenta significativamente o risco cardiovascular. Monitore pressão arterial, colesterol e glicemia. Ômega-3 (2-3g/dia), exercício aeróbico e redução de gordura saturada são fundamentais. O treino aeróbico reduz o risco cardíaco em até 40%.',
        color: 'bg-red-50 text-red-600',
      },
      {
        icon: <Apple size={20} />,
        title: 'Proteína é Essencial',
        content: 'Aumente para 1,3-1,6g de proteína por kg de peso. Distribua ao longo do dia (mínimo 25-30g por refeição). Fontes ideais: frango, peixe, ovos, iogurte grego, whey protein. A proteína adequada combate a sarcopenia e mantém a saciedade, ajudando no controle de peso.',
        color: 'bg-green-50 text-green-600',
      },
      {
        icon: <Droplets size={20} />,
        title: 'Hidratação e Pele',
        content: 'A queda do estrogênio afeta a produção de colágeno e a hidratação da pele. Beba pelo menos 2L de água/dia. Colágeno hidrolisado (10g/dia) pode ajudar. Use protetor solar diariamente e invista em hidratação cutânea adequada.',
        color: 'bg-cyan-50 text-cyan-600',
      },
      {
        icon: <Brain size={20} />,
        title: 'Névoa Mental e Cognição',
        content: 'A dificuldade de concentração e lapsos de memória são comuns e temporários. Exercício aeróbico, sono de qualidade, ômega-3 e atividades cognitivas (leitura, jogos) ajudam. Estudos mostram que o exercício regular melhora a cognição em até 30% nesta fase.',
        color: 'bg-purple-50 text-purple-600',
      },
    ],
  },
  pos_menopausa: {
    titulo: 'Pós-Menopausa',
    descricao: 'Seus hormônios se estabilizaram em um novo patamar. Muitos sintomas agudos tendem a diminuir. Agora o foco é prevenção: manter ossos fortes, massa muscular, saúde cardiovascular e qualidade de vida a longo prazo.',
    cards: [
      {
        icon: <Shield size={20} />,
        title: 'Saúde Óssea — Prioridade Máxima',
        content: 'A perda óssea acelera após a menopausa (até 2-3% por ano nos primeiros 5 anos). Treino de força com carga progressiva, exercícios de impacto (caminhada, dança), cálcio (1.200mg/dia), vitamina D (2.000-4.000 UI/dia) e K2 são fundamentais. Faça densitometria anual.',
        color: 'bg-blue-50 text-blue-600',
      },
      {
        icon: <Dumbbell size={20} />,
        title: 'Manutenção Muscular',
        content: 'Após a menopausa, a perda muscular pode chegar a 1-2% ao ano sem exercício. Treino de resistência 3-4x/semana com cargas progressivas é a intervenção mais eficaz. Foque em exercícios multiarticulares. A massa muscular é o maior preditor de longevidade e independência funcional.',
        color: 'bg-rosa-50 text-rosa-600',
      },
      {
        icon: <Heart size={20} />,
        title: 'Coração sob Cuidado',
        content: 'O risco cardiovascular iguala ou supera o dos homens após a menopausa. Mantenha atividade aeróbica regular (150-300min/semana), controle pressão e colesterol, mantenha peso saudável. Dieta mediterrânea é a mais recomendada para proteção cardiovascular.',
        color: 'bg-red-50 text-red-600',
      },
      {
        icon: <Apple size={20} />,
        title: 'Nutrição Anti-inflamatória',
        content: 'A inflamação crônica de baixo grau aumenta na pós-menopausa. Priorize: peixes gordos (salmão, sardinha), frutas vermelhas, vegetais coloridos, azeite de oliva, cúrcuma, gengibre. Evite: açúcar refinado, ultraprocessados, excesso de álcool. Proteína: 1,4-1,6g/kg.',
        color: 'bg-green-50 text-green-600',
      },
      {
        icon: <Brain size={20} />,
        title: 'Longevidade Cognitiva',
        content: 'O exercício físico regular é o fator mais protetor contra declínio cognitivo. Combine treino aeróbico + força + atividades sociais + desafios cognitivos. Sono de qualidade (7-8h) é fundamental. A suplementação com ômega-3 e vitamina D mostra benefícios cognitivos.',
        color: 'bg-purple-50 text-purple-600',
      },
      {
        icon: <Sparkles size={20} />,
        title: 'Qualidade de Vida',
        content: 'A pós-menopausa pode ser uma fase de liberdade e autoconhecimento. Muitas mulheres relatam mais energia e clareza mental após a estabilização hormonal. Invista em atividades prazerosas, conexões sociais e autocuidado. Seu corpo é capaz de coisas incríveis — cuide dele.',
        color: 'bg-ouro-50 text-ouro-600',
      },
    ],
  },
}

export default function HealthInfo() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const fase = (profile?.fase_menopausa || 'menopausa') as FaseMenopausa
  const info = INFO_POR_FASE[fase]

  return (
    <div className="min-h-screen bg-offwhite pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-rosa-500 to-rosa-700 px-5 pt-10 pb-14 rounded-b-[2.5rem]">
        <h1 className="font-serif text-2xl font-bold text-white mb-1">{info.titulo}</h1>
        <p className="text-rosa-100 text-sm leading-relaxed">{info.descricao}</p>
      </div>

      {/* Cards */}
      <div className="px-4 -mt-8 space-y-4">
        {info.cards.map((card, i) => (
          <div key={i} className="card">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}>
                {card.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-sm mb-1.5">{card.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{card.content}</p>
              </div>
            </div>
          </div>
        ))}

        {/* CTA */}
        <div className="card bg-gradient-to-br from-ouro-50 to-white border-ouro-200 text-center">
          <Sparkles className="w-8 h-8 text-ouro-400 mx-auto mb-2" />
          <h3 className="font-serif text-lg font-bold text-gray-800 mb-1">
            Pronta para começar?
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Seu plano personalizado está preparado com base na sua fase e objetivos.
          </p>
          <button
            onClick={() => navigate('/plano')}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            Ver Meu Plano de Ação <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
