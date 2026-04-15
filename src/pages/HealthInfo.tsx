import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Sparkles } from 'lucide-react'
import type { FaseMenopausa } from '../types'

// ── IMAGENS POR FASE (hero) ───────────────────────────────────────────────────
const HERO_IMGS: Record<FaseMenopausa, string> = {
  pre_menopausa:
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
  menopausa:
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  pos_menopausa:
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
}

// ── CARDS COM IMAGEM POR FASE ─────────────────────────────────────────────────
interface InfoCard {
  emoji: string
  title: string
  content: string
  img: string
  color: string
}

const INFO_POR_FASE: Record<FaseMenopausa, { titulo: string; descricao: string; cards: InfoCard[] }> = {
  pre_menopausa: {
    titulo: 'Pré-Menopausa',
    descricao: 'Fase de transição. Hora de se preparar com hábitos que vão definir os próximos anos.',
    cards: [
      {
        emoji: '🔥', title: 'Metabolismo em Transição',
        content: 'O corpo começa a armazenar mais gordura abdominal. Com treino de força e alimentação certa, é possível reverter esse processo.',
        img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=200&q=80',
        color: 'from-amber-50 to-white border-amber-100',
      },
      {
        emoji: '🏋️‍♀️', title: 'Treino de Força é Prioridade',
        content: 'A sarcopenia começa silenciosamente até 10 anos antes da menopausa. Cada ano sem treino de força equivale a meses de envelhecimento acelerado. Mulheres sedentárias perdem até 8% de força muscular por década a partir dos 30 anos. Comece agora: 2–4x/semana de resistência preserva massa magra, mantém o metabolismo ativo, protege ossos e articulações e garante independência na terceira idade.',
        img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=200&q=80',
        color: 'from-rosa-50 to-white border-rosa-100',
      },
      {
        emoji: '🥗', title: 'Nutrição Estratégica',
        content: 'Proteínas (1,2–1,5g/kg), cálcio, vitamina D e fitoestrógenos (soja, linhaça). Reduza açúcares refinados.',
        img: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=200&q=80',
        color: 'from-green-50 to-white border-green-100',
      },
      {
        emoji: '🌙', title: 'Sono e Recuperação',
        content: 'Sono consistente e telas desligadas 1h antes de dormir. Magnésio e melatonina (com orientação) ajudam na regulação hormonal.',
        img: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=200&q=80',
        color: 'from-indigo-50 to-white border-indigo-100',
      },
      {
        emoji: '🧘‍♀️', title: 'Saúde Mental',
        content: 'Oscilações de humor e ansiedade são comuns. Meditação, yoga e aeróbico moderado regulam neurotransmissores.',
        img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=200&q=80',
        color: 'from-purple-50 to-white border-purple-100',
      },
      {
        emoji: '🩺', title: 'Exames Preventivos',
        content: 'Check-up anual: FSH, estradiol, densitometria óssea, perfil lipídico. Converse com seu médico sobre TRH.',
        img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=200&q=80',
        color: 'from-blue-50 to-white border-blue-100',
      },
    ],
  },
  menopausa: {
    titulo: 'Menopausa (Perimenopausa)',
    descricao: 'Os hormônios estão em queda significativa. Este é o momento mais importante para investir em saúde.',
    cards: [
      {
        emoji: '🌡️', title: 'Gerenciando os Fogachos',
        content: 'Afetam 80% das mulheres e são causados pela queda do estrogênio, que desregula o termostato cerebral. Podem ocorrer até 10–15x por dia, interrompendo o sono e aumentando fadiga. Exercício aeróbico 30–45min reduz a frequência em até 50%. Evite álcool, cafeína e alimentos apimentados. Roupas em camadas e ambiente fresco ajudam. A TRH (terapia de reposição hormonal) é a opção mais eficaz quando indicada pelo médico.',
        img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=200&q=80',
        color: 'from-orange-50 to-white border-orange-100',
      },
      {
        emoji: '🏋️‍♀️', title: 'Treino de Força: Urgente e Vital',
        content: 'A sarcopenia — perda de massa muscular — acelera drasticamente na menopausa pela queda do estrogênio e GH. Sem intervenção, perde-se 1–2% de músculo por ano, levando a fraqueza, quedas, fraturas e dependência na terceira idade. Mulheres que não treinam força chegam aos 70 anos com 30–40% menos músculo que aos 40. O treino de resistência 3–4x/semana é a maior intervenção de longevidade disponível: mantém músculos, ossos, metabolismo e autonomia.',
        img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=200&q=80',
        color: 'from-rosa-50 to-white border-rosa-100',
      },
      {
        emoji: '❤️', title: 'Proteção Cardiovascular',
        content: 'O estrogênio protegia seu coração: controlava colesterol, mantinha artérias flexíveis e reduzia inflamação. Com sua queda, o risco de infarto e AVC aumenta 2–3x na pós-menopausa — igualando ao dos homens. Colesterol LDL sobe, HDL cai e a pressão arterial tende a aumentar. Pratique aeróbico 150min/semana, consuma ômega-3 (salmão, sardinha, linhaça), reduza gorduras saturadas e sal. Monitore pressão e perfil lipídico a cada 6 meses.',
        img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=200&q=80',
        color: 'from-red-50 to-white border-red-100',
      },
      {
        emoji: '🥩', title: 'Proteína: O Remédio Contra a Sarcopenia',
        content: 'A deficiência hormonal reduz a síntese proteica muscular em até 30%. Por isso a necessidade sobe para 1,4–1,6g/kg/dia — muito acima da recomendação geral. Distribua 25–30g por refeição (café, almoço e jantar) para máxima absorção. Sem proteína suficiente, nem o treino mais pesado salva o músculo. A sarcopenia avançada causa dificuldade para subir escadas, carregar peso, manter equilíbrio e, nos casos graves, dependência total de terceiros.',
        img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=200&q=80',
        color: 'from-green-50 to-white border-green-100',
      },
      {
        emoji: '💧', title: 'Pele, Colágeno e Hidratação',
        content: 'O estrogênio estimula a produção de colágeno, que mantém a pele firme, as articulações lubrificadas e os ossos densos. Com sua queda, perde-se 30% do colágeno nos primeiros 5 anos da menopausa. A pele fica mais fina, seca e com rugas aceleradas. Vagina e uretra também ficam mais secas. Beba 2L de água/dia, use colágeno hidrolisado (10g/dia), vitamina C (aumenta absorção) e protetor solar diário. Hidratante corporal e ácido hialurônico tópico ajudam.',
        img: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=200&q=80',
        color: 'from-cyan-50 to-white border-cyan-100',
      },
      {
        emoji: '🧠', title: 'Névoa Mental: O Que Ninguém Conta',
        content: 'O estrogênio é neuroprotetor: regula memória, concentração, humor e sono. Sua queda causa a chamada "névoa mental" — esquecimentos, dificuldade de foco, irritabilidade e até sintomas depressivos em 40% das mulheres. Isso não é loucura: é química cerebral. Exercício aeróbico aumenta BDNF, proteína que regenera neurônios. Sono de qualidade é inegociável. Ômega-3 DHA protege a membrana neuronal. Sem cuidado, o risco de demência e Alzheimer pode dobrar na pós-menopausa.',
        img: 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?auto=format&fit=crop&w=200&q=80',
        color: 'from-purple-50 to-white border-purple-100',
      },
    ],
  },
  pos_menopausa: {
    titulo: 'Pós-Menopausa',
    descricao: 'Hormônios estabilizados. Foco total em longevidade: ossos, músculo, coração e qualidade de vida.',
    cards: [
      {
        emoji: '🦴', title: 'Saúde Óssea — Prioridade Máxima',
        content: 'Perda óssea pode chegar a 2-3%/ano. Treino de força + cálcio (1.200mg/dia) + Vit D + K2. Faça densitometria anual.',
        img: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=200&q=80',
        color: 'from-blue-50 to-white border-blue-100',
      },
      {
        emoji: '💪', title: 'Músculo: O Órgão da Longevidade',
        content: 'O músculo é o maior órgão metabólico do corpo: regula glicose, produz hormônios protetores e sustenta ossos e articulações. Sem treino, perde-se 1–2% ao ano — chegando aos 80 com apenas metade do músculo dos 40. Sarcopenia avançada causa quedas (principal causa de morte em idosos), fraturas de quadril, diabetes tipo 2 e dependência. Treino de força 3–4x/semana com progressão de carga é literalmente o exercício mais antienvelhecimento que existe.',
        img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=200&q=80',
        color: 'from-rosa-50 to-white border-rosa-100',
      },
      {
        emoji: '❤️', title: 'Coração sob Cuidado',
        content: 'Risco cardiovascular iguala o dos homens após a menopausa. Aeróbico 150–300min/semana + dieta mediterrânea.',
        img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=200&q=80',
        color: 'from-red-50 to-white border-red-100',
      },
      {
        emoji: '🫐', title: 'Nutrição Anti-inflamatória',
        content: 'Salmão, frutas vermelhas, azeite, cúrcuma. Evite açúcar e ultraprocessados. Proteína: 1,4–1,6g/kg.',
        img: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=200&q=80',
        color: 'from-green-50 to-white border-green-100',
      },
      {
        emoji: '🧠', title: 'Longevidade Cognitiva',
        content: 'Exercício físico é o maior protetor contra declínio cognitivo. Combine aeróbico + força + vida social + sono de qualidade.',
        img: 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?auto=format&fit=crop&w=200&q=80',
        color: 'from-purple-50 to-white border-purple-100',
      },
      {
        emoji: '✨', title: 'Qualidade de Vida',
        content: 'Muitas mulheres relatam mais energia e clareza após a estabilização hormonal. Invista em hobbies, conexões e autocuidado.',
        img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=200&q=80',
        color: 'from-ouro-50 to-white border-ouro-100',
      },
    ],
  },
}

export default function HealthInfo() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const fase = (profile?.fase_menopausa || 'menopausa') as FaseMenopausa
  const info = INFO_POR_FASE[fase]
  const heroImg = HERO_IMGS[fase]

  return (
    <div className="min-h-screen bg-offwhite pb-8">

      {/* ── HERO BANNER com imagem ─────────────────────────────── */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={heroImg}
          alt={info.titulo}
          className="w-full h-full object-cover object-center"
        />
        {/* Gradiente sobre a imagem */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(183,110,121,0.85) 100%)' }}
        />
        {/* Texto sobre a imagem */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-white/80 text-xs font-medium uppercase tracking-widest mb-1">Informações da Sua Fase</p>
          <h1 className="font-serif text-2xl font-bold text-white drop-shadow">{info.titulo}</h1>
          <p className="text-white/90 text-sm leading-relaxed mt-1">{info.descricao}</p>
        </div>
      </div>

      {/* ── CARDS com imagem ──────────────────────────────────────── */}
      <div className="px-4 mt-4 space-y-3">
        {info.cards.map((card, i) => (
          <div key={i} className={`bg-gradient-to-r ${card.color} rounded-2xl border overflow-hidden shadow-sm`}>
            <div className="flex items-stretch">
              {/* Imagem lateral */}
              <div className="w-24 flex-shrink-0">
                <img
                  src={card.img}
                  alt={card.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Conteúdo */}
              <div className="flex-1 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-base">{card.emoji}</span>
                  <h3 className="font-semibold text-gray-800 text-sm leading-tight">{card.title}</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{card.content}</p>
              </div>
            </div>
          </div>
        ))}

        {/* ── CTA FINAL ──────────────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden mt-2">
          <img
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80"
            alt="Comece agora"
            className="w-full h-36 object-cover object-top"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(183,110,121,0.85) 0%, rgba(212,175,55,0.75) 100%)' }}>
            <Sparkles className="w-6 h-6 text-white mb-2" />
            <h3 className="font-serif text-lg font-bold text-white mb-1">Pronta para começar?</h3>
            <p className="text-white/90 text-xs mb-3">Seu plano personalizado está preparado!</p>
            <button
              onClick={() => navigate('/plano')}
              className="bg-white text-rosa-600 font-semibold text-sm px-6 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md"
            >
              Ver Meu Plano de Ação <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
