import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getCommunityPosts, createCommunityPost } from '../lib/supabase'
import type { CommunityPost } from '../types'
import {
  Heart, MessageCircle, Send, Loader2,
  User, Utensils, Dumbbell, TrendingUp, Lightbulb,
  Plus, X, Image, Newspaper, ExternalLink, BookOpen,
  FlaskConical, Users
} from 'lucide-react'

// ── TIPOS DE POST ──────────────────────────────────────────────────────────────
const TIPO_ICONS: Record<string, React.ReactNode> = {
  refeicao: <Utensils size={12} />,
  treino: <Dumbbell size={12} />,
  evolucao: <TrendingUp size={12} />,
  dica: <Lightbulb size={12} />,
  geral: <MessageCircle size={12} />,
}
const TIPO_LABELS: Record<string, string> = {
  refeicao: 'Refeição', treino: 'Treino', evolucao: 'Evolução', dica: 'Dica', geral: 'Geral',
}
const TIPO_COLORS: Record<string, string> = {
  refeicao: 'bg-green-100 text-green-700',
  treino: 'bg-rosa-100 text-rosa-700',
  evolucao: 'bg-purple-100 text-purple-700',
  dica: 'bg-ouro-100 text-ouro-700',
  geral: 'bg-gray-100 text-gray-700',
}

// ── ARTIGOS CIENTÍFICOS (NEWS) ─────────────────────────────────────────────────
interface Artigo {
  id: number
  titulo: string
  resumo: string
  fonte: string
  data: string
  tags: string[]
  img: string
  cor: string
}

const ARTIGOS: Artigo[] = [
  {
    id: 1,
    titulo: 'Treino de Força Reduz Sintomas da Menopausa em até 47%',
    resumo: 'Estudo publicado no Journal of Strength & Conditioning Research acompanhou 120 mulheres entre 45-60 anos por 6 meses. O grupo que realizou treino de resistência 3x/semana apresentou redução de 47% na frequência de fogachos, melhora de 38% na qualidade do sono e ganho médio de 2,1kg de massa muscular. A conclusão é que o exercício de força deve ser prescrito como primeira linha de tratamento não-hormonal para sintomas climatéricos.',
    fonte: 'Journal of Strength & Conditioning Research, 2024',
    data: 'Mar 2024',
    tags: ['Treino de Força', 'Menopausa', 'Fogachos', 'Sono'],
    img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80',
    cor: 'bg-rosa-50 text-rosa-600',
  },
  {
    id: 2,
    titulo: 'Proteína na Pós-Menopausa: Por Que 1,6g/kg é o Novo Padrão',
    resumo: 'Meta-análise de 28 estudos publicada no American Journal of Clinical Nutrition confirma que mulheres na pós-menopausa necessitam de 1,4–1,6g de proteína por kg/dia para manter massa muscular — 40% acima da recomendação geral. A queda estrogênica reduz a síntese proteica muscular, tornando a ingestão proteica elevada e distribuída (25–30g por refeição) essencial para combater a sarcopenia e regular o metabolismo.',
    fonte: 'American Journal of Clinical Nutrition, 2024',
    data: 'Jan 2024',
    tags: ['Nutrição', 'Proteína', 'Sarcopenia', 'Metabolismo'],
    img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80',
    cor: 'bg-green-50 text-green-600',
  },
  {
    id: 3,
    titulo: 'Exercício Aeróbico Protege o Cérebro Durante a Menopausa',
    resumo: 'Pesquisa da Universidade de Columbia (2023) mostrou que 150 min/semana de exercício aeróbico moderado aumenta o volume do hipocampo em 2%, a região cerebral mais afetada pela queda estrogênica. Mulheres ativas tiveram 35% menos queixas de névoa mental e 40% melhor desempenho em testes cognitivos. O exercício estimula BDNF, proteína neuroprotetora que substitui parcialmente o papel estrogênico na cognição.',
    fonte: 'Neurology Journal / Columbia University, 2023',
    data: 'Nov 2023',
    tags: ['Cognição', 'Aeróbico', 'Névoa Mental', 'Cérebro'],
    img: 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?auto=format&fit=crop&w=600&q=80',
    cor: 'bg-purple-50 text-purple-600',
  },
  {
    id: 4,
    titulo: 'Cálcio + Vitamina D: A Dupla Essencial para Ossos na Pós-Menopausa',
    resumo: 'Estudo do International Osteoporosis Foundation aponta que 70% das mulheres pós-menopausadas têm deficiência de vitamina D. A combinação de cálcio (1.200mg/dia) + vitamina D3 (2.000–4.000 UI/dia) + vitamina K2 reduz em 25% o risco de fratura osteoporótica. O treino de impacto (caminhada, dança, exercícios de força) é igualmente essencial, pois estimula a formação óssea mecanicamente.',
    fonte: 'International Osteoporosis Foundation, 2024',
    data: 'Fev 2024',
    tags: ['Ossos', 'Vitamina D', 'Cálcio', 'Osteoporose'],
    img: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=600&q=80',
    cor: 'bg-blue-50 text-blue-600',
  },
  {
    id: 5,
    titulo: 'Gordura Abdominal na Menopausa: Causas e Soluções Baseadas em Evidência',
    resumo: 'A queda do estrogênio redireciona o acúmulo de gordura para a região visceral abdominal, aumentando risco cardiovascular e metabólico. Pesquisa publicada na revista Obesity Reviews mostra que a combinação de treino de força (3x/semana) + déficit calórico de 300–500kcal + proteína elevada reduz gordura visceral em 18% em 12 semanas, sem perda muscular. Dietas restritivas isoladas falham porque aceleram a sarcopenia.',
    fonte: 'Obesity Reviews, 2024',
    data: 'Abr 2024',
    tags: ['Emagrecimento', 'Gordura Visceral', 'Metabolismo', 'Nutrição'],
    img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80',
    cor: 'bg-ouro-50 text-ouro-600',
  },
  {
    id: 6,
    titulo: 'Sono e Menopausa: Como os Hormônios Afetam a Qualidade do Descanso',
    resumo: 'Pesquisa do Sleep Research Society mostra que 61% das mulheres em perimenopausa relatam insônia moderada a grave, diretamente ligada à queda de progesterona e estrogênio. Estratégias eficazes comprovadas: exercício regular (melhora em 56%), redução de álcool e cafeína após as 14h, temperatura do quarto entre 18–20°C, e suplementação de magnésio bisglicinato 300–400mg (melhora em 39%). TRH é a intervenção mais eficaz para insônia climatérica.',
    fonte: 'Sleep Research Society, 2023',
    data: 'Out 2023',
    tags: ['Sono', 'Hormônios', 'Insônia', 'Progesterona'],
    img: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
    cor: 'bg-indigo-50 text-indigo-600',
  },
]

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function Community() {
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState<'feed' | 'news'>('news')
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(false)
  const [showNewPost, setShowNewPost] = useState(false)
  const [newText, setNewText] = useState('')
  const [newTipo, setNewTipo] = useState('geral')
  const [posting, setPosting] = useState(false)
  const [artigoAberto, setArtigoAberto] = useState<Artigo | null>(null)

  useEffect(() => {
    if (activeTab === 'feed') loadPosts()
  }, [activeTab])

  const loadPosts = async () => {
    setLoading(true)
    const { data } = await getCommunityPosts(50)
    if (data) setPosts(data as CommunityPost[])
    setLoading(false)
  }

  const handlePost = async () => {
    if (!user || !profile || !newText.trim()) return
    setPosting(true)
    await createCommunityPost({
      user_id: user.id,
      autor_nome: profile.nome || 'Aluna',
      autor_foto: profile.foto_url,
      tipo: newTipo,
      texto: newText.trim(),
    })
    setNewText('')
    setShowNewPost(false)
    setPosting(false)
    await loadPosts()
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'agora'
    if (mins < 60) return `${mins}min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d`
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  return (
    <div className="page-container">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="page-title">Comunidade</h1>
          <p className="text-sm text-gray-500">Ciência e conexão para mulheres 40+</p>
        </div>
        {activeTab === 'feed' && (
          <button
            onClick={() => setShowNewPost(true)}
            className="w-10 h-10 bg-rosa-500 rounded-full flex items-center justify-center shadow-lg"
          >
            <Plus size={20} className="text-white" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-5">
        <button
          onClick={() => setActiveTab('news')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'news' ? 'bg-white text-rosa-500 shadow-sm' : 'text-gray-500'
          }`}
        >
          <Newspaper size={15} /> Notícias
        </button>
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'feed' ? 'bg-white text-rosa-500 shadow-sm' : 'text-gray-500'
          }`}
        >
          <Users size={15} /> Comunidade
        </button>
      </div>

      {/* ═══ ABA NOTÍCIAS ═══ */}
      {activeTab === 'news' && (
        <div className="space-y-4">
          {/* Banner */}
          <div className="relative rounded-2xl overflow-hidden h-28 mb-2">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
              alt="Ciência"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 flex flex-col justify-center px-5"
              style={{ background: 'linear-gradient(90deg, rgba(183,110,121,0.9) 0%, rgba(183,110,121,0.5) 100%)' }}>
              <div className="flex items-center gap-2 mb-1">
                <FlaskConical size={14} className="text-white/80" />
                <span className="text-white/80 text-xs font-medium uppercase tracking-wide">Baseado em Evidências</span>
              </div>
              <p className="font-serif text-lg font-bold text-white">Artigos Científicos</p>
              <p className="text-white/80 text-xs">Pesquisas sobre saúde feminina 40+</p>
            </div>
          </div>

          {ARTIGOS.map(artigo => (
            <div
              key={artigo.id}
              className="card overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setArtigoAberto(artigo)}
            >
              {/* Imagem */}
              <div className="relative -mx-4 -mt-4 mb-3 h-36">
                <img
                  src={artigo.img}
                  alt={artigo.titulo}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
                <div className="absolute bottom-2 left-3 flex gap-1.5 flex-wrap">
                  {artigo.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="bg-white/20 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Conteúdo */}
              <div className="flex items-start gap-2 mb-2">
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${artigo.cor}`}>
                  <BookOpen size={10} className="inline mr-1" />
                  Ciência
                </div>
                <span className="text-[10px] text-gray-400">{artigo.data}</span>
              </div>

              <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-2">{artigo.titulo}</h3>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{artigo.resumo}</p>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 italic">{artigo.fonte}</p>
                <div className="flex items-center gap-1 text-rosa-500 text-xs font-medium">
                  Ler mais <ExternalLink size={11} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ ABA COMUNIDADE ═══ */}
      {activeTab === 'feed' && (
        <>
          {/* Novo Post Modal */}
          {showNewPost && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
              <div className="bg-white w-full max-w-md rounded-t-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-lg font-bold text-gray-800">Nova Publicação</h2>
                  <button onClick={() => setShowNewPost(false)}>
                    <X size={22} className="text-gray-400" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries(TIPO_LABELS).map(([key, label]) => (
                    <button key={key} onClick={() => setNewTipo(key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        newTipo === key ? 'bg-rosa-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {TIPO_ICONS[key]} {label}
                    </button>
                  ))}
                </div>
                <textarea value={newText} onChange={e => setNewText(e.target.value)}
                  placeholder="Compartilhe sua experiência, conquista ou dica..."
                  className="input-field min-h-[120px] resize-none mb-3" maxLength={500} />
                <div className="flex items-center justify-between">
                  <button className="flex items-center gap-2 text-gray-400 text-sm">
                    <Image size={18} /> Foto (em breve)
                  </button>
                  <button onClick={handlePost} disabled={posting || !newText.trim()}
                    className="btn-primary flex items-center gap-2">
                    {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send size={16} /> Publicar</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-rosa-500 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageCircle size={32} className="text-gray-300" />
              </div>
              <h3 className="font-semibold text-gray-500 mb-1">Nenhuma publicação ainda</h3>
              <p className="text-sm text-gray-400">Seja a primeira a compartilhar!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <div key={post.id} className="card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-rosa-400 to-rosa-600 rounded-full flex items-center justify-center text-white">
                      {post.autor_foto
                        ? <img src={post.autor_foto} alt="" className="w-full h-full rounded-full object-cover" />
                        : <User size={18} />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{post.autor_nome}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">{timeAgo(post.created_at)}</span>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${TIPO_COLORS[post.tipo]}`}>
                          {TIPO_ICONS[post.tipo]} {TIPO_LABELS[post.tipo]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{post.texto}</p>
                  {post.foto_url && (
                    <img src={post.foto_url} alt="" className="w-full h-48 object-cover rounded-xl mb-3" />
                  )}
                  <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                    <button className="flex items-center gap-1.5 text-gray-400 hover:text-rosa-500 transition-colors">
                      <Heart size={16} />
                      <span className="text-xs">{post.curtidas || 0}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-gray-400 hover:text-rosa-500 transition-colors">
                      <MessageCircle size={16} />
                      <span className="text-xs">Comentar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══ MODAL ARTIGO COMPLETO ═══ */}
      {artigoAberto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl max-h-[90vh] overflow-y-auto">
            {/* Imagem topo */}
            <div className="relative h-44">
              <img src={artigoAberto.img} alt={artigoAberto.titulo}
                className="w-full h-full object-cover" />
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
              <button onClick={() => setArtigoAberto(null)}
                className="absolute top-4 right-4 bg-black/40 rounded-full p-1.5">
                <X size={18} className="text-white" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-5">
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {artigoAberto.tags.map(tag => (
                  <span key={tag} className={`px-2.5 py-1 rounded-full text-xs font-medium ${artigoAberto.cor}`}>
                    {tag}
                  </span>
                ))}
              </div>

              <h2 className="font-serif text-lg font-bold text-gray-800 leading-snug mb-3">
                {artigoAberto.titulo}
              </h2>

              <p className="text-sm text-gray-600 leading-relaxed mb-4">{artigoAberto.resumo}</p>

              <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
                <BookOpen size={14} className="text-rosa-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-700">Fonte Científica</p>
                  <p className="text-xs text-gray-500 italic">{artigoAberto.fonte}</p>
                </div>
              </div>

              <p className="text-center text-xs text-gray-400 mt-4">
                Informações para fins educacionais.<br />Consulte sempre um profissional de saúde.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
