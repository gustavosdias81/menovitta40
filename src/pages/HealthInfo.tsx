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
        content: 'Sarcopenia pode começar anos antes da menopausa. 2-4x por semana de resistência preserva massa magra, ossos e articulações.',
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
        content: 'Afetam 80% das mulheres. Exercício aeróbico 30-45min reduz a frequência em até 50%. Vistas em camadas e evite álcool.',
        img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=200&q=80',
        color: 'from-orange-50 to-white border-orange-100',
      },
      {
        emoji: '🏋️‍♀️', title: 'Treino Adaptado à Fase',
        content: 'Combine força (3-4x/semana) com aeróbico moderado (150min/semana). HIIT é válido, mas evite excessos que aumentem cortisol.',
        img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=200&q=80',
        color: 'from-rosa-50 to-white border-rosa-100',
      },
      {
        emoji: '❤️', title: 'Proteção Cardiovascular',
        content: 'A queda do estrogênio aumenta o risco cardíaco. Ômega-3, exercício aeróbico e menos gordura saturada são fundamentais.',
        img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=200&q=80',
        color: 'from-red-50 to-white border-red-100',
      },
      {
        emoji: '🥩', title: 'Proteína é Essencial',
        content: '1,3–1,6g/kg de peso por dia. 25–30g por refeição. Frango, peixe, ovos, iogurte grego combatem a sarcopenia.',
        img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=200&q=80',
        color: 'from-green-50 to-white border-green-100',
      },
      {
        emoji: '💧', title: 'Hidratação e Pele',
        content: 'Estrogênio em queda afeta colágeno e hidratação. 2L de água/dia + colágeno hidrolisado (10g) + protetor solar.',
        img: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=200&q=80',
        color: 'from-cyan-50 to-white border-cyan-100',
      },
      {
        emoji: '🧠', title: 'Névoa Mental e Cognição',
        content: 'Lapsos de memória são temporários. Aeróbico, sono e ômega-3 melhoram a cognição em até 30%.',
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
        emoji: '💪', title: 'Manutenção Muscular',
        content: 'Sem exercício, perde-se 1–2% de músculo por ano. Força 3-4x/semana com carga progressiva é a maior intervenção de longevidade.',
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
