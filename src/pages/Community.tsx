import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getCommunityPosts, createCommunityPost, getArtigos, moderarPost, deleteCommunityPost, getRankingMensal } from '../lib/supabase'
import type { RankingEntry } from '../lib/supabase'
import type { CommunityPost, Artigo } from '../types'
import {
  Heart, MessageCircle, Send, Loader2,
  User, Utensils, Dumbbell, TrendingUp, Lightbulb,
  Plus, X, Image, Newspaper, BookOpen,
  FlaskConical, Users, Pin, EyeOff, Trash2, Shield, ChevronRight, Trophy
} from 'lucide-react'

// ── TIPOS DE POST ─────────────────────────────────────────────────────────────
const TIPO_ICONS: Record<string, React.ReactNode> = {
  refeicao: <Utensils size={12} />,
  treino:   <Dumbbell size={12} />,
  evolucao: <TrendingUp size={12} />,
  dica:     <Lightbulb size={12} />,
  geral:    <MessageCircle size={12} />,
}
const TIPO_LABELS: Record<string, string> = {
  refeicao: 'Refeição', treino: 'Treino', evolucao: 'Evolução', dica: 'Dica', geral: 'Geral',
}
const TIPO_COLORS: Record<string, string> = {
  refeicao: 'bg-green-100 text-green-700',
  treino:   'bg-rosa-100 text-rosa-700',
  evolucao: 'bg-purple-100 text-purple-700',
  dica:     'bg-ouro-100 text-ouro-700',
  geral:    'bg-gray-100 text-gray-700',
}
const CATEGORIA_COR: Record<string, string> = {
  geral:    'bg-rosa-50 text-rosa-600',
  treino:   'bg-orange-50 text-orange-600',
  nutricao: 'bg-green-50 text-green-600',
  saude:    'bg-blue-50 text-blue-600',
  mente:    'bg-purple-50 text-purple-600',
}

// ── ARTIGOS CIENTÍFICOS INICIAIS (fallback quando DB está vazio) ──────────────
const ARTIGOS_INICIAIS: Omit<Artigo, 'id' | 'updated_at' | 'tags' | 'imagem_url' | 'publicado'>[] = [
  {
    titulo: '💪 Treino de Força é Fundamental na Menopausa',
    categoria: 'treino',
    resumo: 'Estudos mostram que mulheres que praticam treino de força 3x por semana reduzem sintomas da menopausa em até 60% e perdem gordura abdominal com muito mais eficiência.',
    conteudo: `Pesquisas recentes publicadas no Journal of Strength & Conditioning Research confirmam: o treino de resistência (musculação) é a intervenção mais eficaz para mulheres na menopausa.

🔬 O que a ciência diz:
• Mulheres que treinaram força 3x/semana por 16 semanas reduziram a gordura visceral em 12%
• Redução de 38% na intensidade de ondas de calor (fogachos)
• Aumento de 22% na densidade óssea em 12 meses
• Melhora significativa no humor e qualidade do sono

⚠️ Por que é urgente:
A partir dos 35 anos, perdemos naturalmente de 3 a 8% de massa muscular por década. Na menopausa, a queda do estrogênio acelera esse processo — o que chamamos de sarcopenia. Músculos são o seu "motor metabólico": quanto menos músculo, mais lento o metabolismo e mais fácil engorda.

✅ Recomendação prática:
Comece com 2-3 sessões por semana, priorizando exercícios compostos: agachamento, leg press, supino e remada. Aumente progressivamente a carga a cada 2-3 semanas. Resultados visíveis aparecem em 4-6 semanas.`,
    fonte: 'Journal of Strength & Conditioning Research, 2023',
    data_pub: '2024-03-15',
    created_at: '2024-03-15T10:00:00Z',
  },
  {
    titulo: '🥗 Proteína: A Aliada Mais Subestimada da Mulher 40+',
    categoria: 'nutricao',
    resumo: 'A ingestão adequada de proteínas (1,4–1,6g por kg de peso) é determinante para preservar músculo, acelerar o metabolismo e controlar o apetite na menopausa.',
    conteudo: `A deficiência de proteína é o erro nutricional mais comum entre mulheres na menopausa. A maioria consome apenas 0,6–0,8g/kg — metade do necessário.

📊 Por que você precisa de mais proteína:
• O corpo na menopausa passa por "resistência anabólica" — precisa de mais proteína para construir o mesmo músculo
• Proteínas têm alto efeito termogênico: o corpo gasta 20–30% das calorias da proteína só para digerí-la
• Controlam os hormônios da fome (grelina e GLP-1) por mais horas

🍳 Fontes ideais para mulheres 40+:
→ Frango, peixe (salmão, atum, sardinha) e ovos — proteínas completas e biodisponíveis
→ Whey protein e caseína — práticos e de alta qualidade
→ Leguminosas (feijão, lentilha, grão-de-bico) combinadas com grãos — opção vegetal

💡 Meta diária sugerida:
Peso corporal × 1,5g = sua meta de proteína.
Exemplo: 70 kg × 1,5 = 105g de proteína por dia (≈ distribuída em 4 refeições)

⏰ Timing importa:
Consuma 30–40g de proteína dentro de 30 minutos após o treino. Isso maximiza a síntese proteica muscular em até 40%.`,
    fonte: 'American Journal of Clinical Nutrition, 2024',
    data_pub: '2024-02-20',
    created_at: '2024-02-20T10:00:00Z',
  },
  {
    titulo: '❤️ Menopausa e Coração: O que Todo Médico Deveria Explicar',
    categoria: 'saude',
    resumo: 'O risco cardiovascular em mulheres dispara após a menopausa. Entender por que e como se proteger pode literalmente salvar vidas — e poucas mulheres recebem essa informação.',
    conteudo: `Antes da menopausa, o estrogênio protege o coração mantendo os vasos sanguíneos flexíveis e o colesterol em equilíbrio. Após a menopausa, esse escudo hormonal desaparece.

📈 Os números que assustam:
• Risco de doença cardiovascular aumenta 2-3x após a menopausa
• Mulheres pós-menopáusicas têm a mesma probabilidade de infarto que homens da mesma idade
• Colesterol LDL ("ruim") sobe em média 10-15% no primeiro ano pós-menopausa
• Pressão arterial aumenta em 60% das mulheres após a menopausa

🛡️ Como se proteger:
1. Exercício aeróbico: 150 min/semana de caminhada rápida reduz em 35% o risco cardiovascular
2. Treino de força: aumenta o HDL (colesterol bom) em 5-10%
3. Alimentação anti-inflamatória: azeite, peixes gordos, vegetais coloridos, nozes
4. Controle do estresse: cortisol crônico danifica diretamente as artérias
5. Sono de qualidade: menos de 6h por noite aumenta 45% o risco de infarto

🩺 Monitore regularmente:
Peça ao seu médico: perfil lipídico, glicemia, pressão arterial e circunferência abdominal (meta: < 88cm). Consulta anual é fundamental.`,
    fonte: 'New England Journal of Medicine, 2023',
    data_pub: '2024-01-10',
    created_at: '2024-01-10T10:00:00Z',
  },
  {
    titulo: '🌙 Por que a Menopausa Destrói o Sono — e Como Recuperar',
    categoria: 'saude',
    resumo: 'Mais de 60% das mulheres na menopausa relatam insônia grave. A ciência do sono explica os mecanismos por trás disso e oferece soluções baseadas em evidências.',
    conteudo: `A insônia na menopausa não é "coisa da cabeça" — é uma consequência direta da queda hormonal que afeta centros cerebrais do sono.

🧠 Por que acontece:
• Estrogênio regula a produção de serotonina, precursora da melatonina
• Progesterona tem efeito sedativo natural — sua queda causa insônia
• Fogachos noturnos interrompem ciclos de sono profundo (REM)
• Cortisol elevado pela manhã impede o adormecer noturno

😴 O ciclo vicioso:
Mal sono → cortisol elevado → mais acúmulo de gordura abdominal → inflamação → piora dos fogachos → mais insônia.

✅ Estratégias com evidência científica:
1. Higiene do sono: horário fixo, quarto frio (18–20°C), sem telas 1h antes
2. Magnésio bisglicinato: 300mg antes de dormir — relaxa músculos e sistema nervoso
3. Exercício matinal: expõe ao sol e regula o ritmo circadiano
4. Meditação ou respiração 4-7-8: ativa o sistema parassimpático
5. Evitar cafeína após 14h e álcool (piora fogachos noturnos)
6. Considere com seu médico: melatonina de liberação prolongada (0,5–5mg)

💡 Impacto do sono no peso:
Dormir menos de 7h aumenta em 55% a compulsão por carboidratos e reduz a queima de gordura em até 30%. Sono é parte do protocolo de emagrecimento.`,
    fonte: 'Sleep Medicine Reviews, 2023',
    data_pub: '2024-02-05',
    created_at: '2024-02-05T10:00:00Z',
  },
  {
    titulo: '🦴 Osteoporose: Prevenção Começa Antes dos Primeiros Sintomas',
    categoria: 'saude',
    resumo: 'Nos primeiros 5 anos após a menopausa, as mulheres perdem de 3 a 5% da massa óssea por ano. A boa notícia: é possível reverter esse processo com intervenções simples.',
    conteudo: `Os ossos são tecido vivo em constante renovação. O estrogênio é essencial para manter esse equilíbrio — quando cai, a reabsorção óssea supera a formação.

📉 O que acontece nos ossos:
• Perda óssea de 3–5% ao ano nos primeiros 5 anos pós-menopausa
• 1 em cada 3 mulheres acima de 50 anos terá uma fratura osteoporótica
• Quadril, punho e vértebras são os locais mais afetados
• Uma fratura de quadril aumenta em 20% o risco de morte nos 12 meses seguintes

💪 Como preservar e reconstruir ossos:
1. Treino de impacto e resistência: agachamento, jumping, caminhada — estimulam osteoblastos (células construtoras de osso)
2. Cálcio: 1.200mg/dia (preferir fontes alimentares: leite, iogurte, sardinha, brócolis, tofu)
3. Vitamina D: 2.000–4.000 UI/dia — essencial para absorção do cálcio (pedir exame de 25-OH vitamina D)
4. Vitamina K2: direciona o cálcio para os ossos (evita calcificação artérias) — 100mcg/dia
5. Magnésio: 300–400mg/dia — cofator essencial para mineralização óssea
6. Reduzir: álcool, tabagismo, refrigerantes e excesso de sódio (todos aceleram perda óssea)

🩺 Exame obrigatório:
Densitometria óssea (DEXA) a partir dos 50 anos (ou antes se houver fatores de risco). Resultados: normal (T-score > -1), osteopenia (-1 a -2,5), osteoporose (< -2,5).`,
    fonte: 'Osteoporosis International, 2023',
    data_pub: '2024-03-01',
    created_at: '2024-03-01T10:00:00Z',
  },
  {
    titulo: '🧠 Névoa Mental e Menopausa: Seu Cérebro Não Está Falhando',
    categoria: 'mente',
    resumo: 'Dificuldade de concentração, esquecimentos e "névoa mental" afetam 60% das mulheres na menopausa. É real, tem explicação científica — e tem solução.',
    conteudo: `"Névoa mental" (brain fog) não é fraqueza nem envelhecimento precoce. É uma consequência direta da queda do estrogênio no cérebro.

🧠 O estrogênio no cérebro:
• Estrogênio protege neurônios e regula neurotransmissores (serotonina, dopamina, acetilcolina)
• Hipocampo (centro da memória) tem alta densidade de receptores de estrogênio
• Queda hormonal reduz plasticidade sináptica — conexões entre neurônios ficam mais lentas
• O cérebro literalmente "procura" combustível alternativo ao estrogênio (glicose e cetonas)

✅ Como recuperar a clareza mental:
1. Exercício aeróbico: 30 min de caminhada rápida aumenta BDNF (fator neurotrófico) em 2–3x
2. Treino de força: regula insulina, que protege neurônios da inflamação
3. Dieta antiinflamatória: ômega-3 (EPA+DHA 2g/dia), cúrcuma, vegetais coloridos
4. Sono restaurador: sono profundo consolida memórias e elimina toxinas cerebrais (sistema glinfático)
5. Gestão do estresse: cortisol crônico atrofia o hipocampo — meditação 10min/dia tem efeito mensurável
6. Suplementos com evidência: ômega-3, vitamina D, colina, B12 e ácido fólico

⏰ Quando melhora?
A maioria das mulheres relata melhora significativa 3–6 meses após adotar rotina de exercícios e ajustes nutricionais. O cérebro tem neuroplasticidade — você pode reverter esse quadro.`,
    fonte: 'Menopause: The Journal of The Menopause Society, 2024',
    data_pub: '2024-04-01',
    created_at: '2024-04-01T10:00:00Z',
  },
]

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function Community() {
  const { user, profile } = useAuth()
  const isAdmin = profile?.is_admin === true

  const [activeTab, setActiveTab] = useState<'feed' | 'news' | 'ranking'>('news')
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [artigos, setArtigos] = useState<Artigo[]>(ARTIGOS_INICIAIS as unknown as Artigo[])
  const [loading, setLoading] = useState(false)
  const [erroPosts, setErroPosts] = useState(false)
  const [loadingArtigos, setLoadingArtigos] = useState(false)
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [loadingRanking, setLoadingRanking] = useState(false)
  const [showNewPost, setShowNewPost] = useState(false)
  const [newText, setNewText] = useState('')
  const [newTipo, setNewTipo] = useState('geral')
  const [posting, setPosting] = useState(false)
  const [artigoAberto, setArtigoAberto] = useState<Artigo | typeof ARTIGOS_INICIAIS[0] | null>(null)
  const [moderando, setModerando] = useState<string | null>(null)
  const [postFotoUrl, setPostFotoUrl] = useState<string>('')
  const postFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (activeTab === 'feed') loadPosts()
    if (activeTab === 'news') loadArtigos()
    if (activeTab === 'ranking') loadRanking()
  }, [activeTab])

  useEffect(() => { loadArtigos() }, [])

  const loadRanking = async () => {
    setLoadingRanking(true)
    try {
      const { data } = await getRankingMensal(10)
      if (data) setRanking(data)
    } catch { /* silencia */ }
    finally { setLoadingRanking(false) }
  }

  const loadArtigos = async () => {
    setLoadingArtigos(true)
    try {
      const { data } = await getArtigos(true)
      if (data) setArtigos(data as Artigo[])
    } catch { /* silencia */ }
    finally { setLoadingArtigos(false) }
  }

  const loadPosts = async () => {
    setLoading(true)
    setErroPosts(false)
    try {
      const { data, error } = await getCommunityPosts(50)
      if (error) throw error
      if (data) {
        const all = data as CommunityPost[]
        const visiveis = isAdmin ? all : all.filter(p => !p.oculto)
        visiveis.sort((a, b) => {
          if (a.pinado && !b.pinado) return -1
          if (!a.pinado && b.pinado) return 1
          return 0
        })
        setPosts(visiveis)
      }
    } catch {
      setErroPosts(true)
    }
    finally { setLoading(false) }
  }

  const handlePost = async () => {
    if (!user || !profile || !newText.trim()) return
    setPosting(true)
    await createCommunityPost({
      user_id: user.id,
      autor_nome: profile.nome || 'Aluna',
      autor_foto: profile.foto_url,
      autor_nickname: profile.nickname || undefined,
      tipo: newTipo,
      texto: newText.trim(),
      foto_url: postFotoUrl || undefined,
    })
    setNewText('')
    setPostFotoUrl('')
    setShowNewPost(false)
    setPosting(false)
    await loadPosts()
  }

  const handlePinar = async (post: CommunityPost) => {
    setModerando(post.id)
    await moderarPost(post.id, { pinado: !post.pinado })
    setModerando(null)
    await loadPosts()
  }

  const handleOcultar = async (post: CommunityPost) => {
    setModerando(post.id)
    await moderarPost(post.id, { oculto: !post.oculto })
    setModerando(null)
    await loadPosts()
  }

  const handleDeletar = async (post: CommunityPost) => {
    if (!confirm(`Excluir post de ${post.autor_nome}?`)) return
    setModerando(post.id)
    await deleteCommunityPost(post.id)
    setModerando(null)
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
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'news' ? 'bg-white text-rosa-500 shadow-sm' : 'text-gray-500'
          }`}
        >
          <Newspaper size={13} /> Artigos
        </button>
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'feed' ? 'bg-white text-rosa-500 shadow-sm' : 'text-gray-500'
          }`}
        >
          <Users size={13} /> Social
        </button>
        <button
          onClick={() => setActiveTab('ranking')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'ranking' ? 'bg-white text-rosa-500 shadow-sm' : 'text-gray-500'
          }`}
        >
          <Trophy size={13} /> Ranking
        </button>
      </div>

      {/* ══════════════════════════════════════════
          ABA ARTIGOS
      ══════════════════════════════════════════ */}
      {activeTab === 'news' && (
        <div className="space-y-4">

          {/* Banner */}
          <div className="relative rounded-2xl overflow-hidden h-28 mb-2">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
              alt="Ciência"
              className="w-full h-full object-cover object-center"
            />
            <div
              className="absolute inset-0 flex flex-col justify-center px-5"
              style={{ background: 'linear-gradient(90deg, rgba(183,110,121,0.92) 0%, rgba(183,110,121,0.5) 100%)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <FlaskConical size={14} className="text-white/80" />
                <span className="text-white/80 text-xs font-medium uppercase tracking-wide">Baseado em Evidências</span>
              </div>
              <p className="font-serif text-lg font-bold text-white">Artigos Científicos</p>
              <p className="text-white/80 text-xs">Pesquisas sobre saúde feminina 40+</p>
            </div>
          </div>

          {loadingArtigos ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-rosa-500 animate-spin" />
            </div>
          ) : (
            artigos.map((artigo, idx) => (
              <button
                key={(artigo as Artigo).id || idx}
                onClick={() => setArtigoAberto(artigo)}
                className="card w-full text-left cursor-pointer hover:shadow-md active:scale-[0.99] transition-all"
              >
                {/* Badges */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${CATEGORIA_COR[artigo.categoria] || CATEGORIA_COR.geral}`}>
                    {artigo.categoria.charAt(0).toUpperCase() + artigo.categoria.slice(1)}
                  </span>
                  {artigo.data_pub && (
                    <span className="text-[10px] text-gray-400">
                      {new Date(artigo.data_pub + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>

                {/* Título */}
                <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-2">
                  {artigo.titulo}
                </h3>

                {/* Resumo (primeiras linhas) */}
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-3">
                  {artigo.resumo || artigo.conteudo?.slice(0, 160)}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 italic truncate max-w-[60%]">
                    {artigo.fonte || 'Menovitta 4.0'}
                  </p>
                  <div className="flex items-center gap-1 text-rosa-500 text-xs font-semibold">
                    Ler artigo <ChevronRight size={13} />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          ABA COMUNIDADE
      ══════════════════════════════════════════ */}
      {activeTab === 'feed' && (
        <>
          {/* Novo Post */}
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
                <textarea
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  placeholder="Compartilhe sua experiência, conquista ou dica..."
                  className="input-field min-h-[120px] resize-none mb-3"
                  maxLength={500}
                />
                <input
                  ref={postFileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    if (file.size > 500 * 1024) {
                      alert('Foto muito grande. Máximo 500KB.')
                      return
                    }
                    const reader = new FileReader()
                    reader.onload = (ev) => setPostFotoUrl(ev.target?.result as string)
                    reader.readAsDataURL(file)
                  }}
                />
                {postFotoUrl && (
                  <div className="relative mb-3">
                    <img src={postFotoUrl} alt="Preview" className="w-full h-32 object-cover rounded-xl" />
                    <button
                      type="button"
                      onClick={() => setPostFotoUrl('')}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => postFileRef.current?.click()}
                    className="flex items-center gap-2 text-gray-500 text-sm font-medium hover:text-rosa-500 transition-colors"
                  >
                    <Image size={18} /> {postFotoUrl ? '✓ Foto selecionada' : 'Adicionar foto'}
                  </button>
                  <button
                    onClick={handlePost}
                    disabled={posting || !newText.trim()}
                    className="btn-primary flex items-center gap-2"
                  >
                    {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send size={16} /> Publicar</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Banner moderação */}
          {isAdmin && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3 mb-4 flex items-center gap-2">
              <Shield size={16} className="text-purple-500 flex-shrink-0" />
              <p className="text-xs text-purple-700 font-medium">
                Modo Moderação ativo — você vê todos os posts, incluindo ocultos.
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-rosa-500 animate-spin" />
            </div>
          ) : erroPosts ? (
            <div className="text-center py-16">
              <p className="text-3xl mb-3">📡</p>
              <h3 className="font-semibold text-gray-500 mb-1">Servidor lento para responder</h3>
              <p className="text-sm text-gray-400 mb-4">Pode ser o banco acordando. Tente novamente.</p>
              <button
                onClick={loadPosts}
                className="flex items-center gap-2 mx-auto text-rosa-500 text-sm font-semibold bg-rosa-50 px-5 py-2.5 rounded-xl active:scale-95 transition-transform"
              >
                🔄 Tentar novamente
              </button>
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
                <div
                  key={post.id}
                  className={`card ${post.oculto ? 'opacity-50 border border-dashed border-red-300' : ''} ${post.pinado ? 'border border-ouro-300 bg-ouro-50/30' : ''}`}
                >
                  {post.pinado && (
                    <div className="flex items-center gap-1 text-ouro-600 text-[10px] font-semibold mb-2">
                      <Pin size={10} /> Fixado pela equipe
                    </div>
                  )}
                  {post.oculto && isAdmin && (
                    <div className="flex items-center gap-1 text-red-500 text-[10px] font-semibold mb-2">
                      <EyeOff size={10} /> Oculto (apenas você vê)
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-rosa-400 to-rosa-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                      {post.autor_foto
                        ? <img src={post.autor_foto} alt="" className="w-full h-full rounded-full object-cover" />
                        : <User size={18} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-semibold text-gray-800 text-sm">{post.autor_nome}</p>
                        {(post.autor_nickname || (post.user_id === user?.id && profile?.nickname)) && (
                          <span className="text-[10px] text-rosa-400 font-semibold">
                            {post.autor_nickname || profile?.nickname}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">{timeAgo(post.created_at)}</span>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${TIPO_COLORS[post.tipo]}`}>
                          {TIPO_ICONS[post.tipo]} {TIPO_LABELS[post.tipo]}
                        </span>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handlePinar(post)}
                          disabled={moderando === post.id}
                          title={post.pinado ? 'Despinar' : 'Fixar'}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            post.pinado ? 'bg-ouro-100 text-ouro-600' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <Pin size={13} />
                        </button>
                        <button
                          onClick={() => handleOcultar(post)}
                          disabled={moderando === post.id}
                          title={post.oculto ? 'Mostrar' : 'Ocultar'}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            post.oculto ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <EyeOff size={13} />
                        </button>
                        <button
                          onClick={() => handleDeletar(post)}
                          disabled={moderando === post.id}
                          className="w-7 h-7 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
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

      {/* ══════════════════════════════════════════
          MODAL: ARTIGO COMPLETO
      ══════════════════════════════════════════ */}
      {artigoAberto && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center"
          onClick={() => setArtigoAberto(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-3xl max-h-[92vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Barra de arrasto + fechar */}
            <div className="sticky top-0 bg-white z-10 px-5 pt-4 pb-3 border-b border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${CATEGORIA_COR[artigoAberto.categoria] || CATEGORIA_COR.geral}`}>
                      {artigoAberto.categoria.charAt(0).toUpperCase() + artigoAberto.categoria.slice(1)}
                    </span>
                    {artigoAberto.data_pub && (
                      <span className="text-[10px] text-gray-400">
                        {new Date(artigoAberto.data_pub + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <h2 className="font-serif text-base font-bold text-gray-800 leading-snug">
                    {artigoAberto.titulo}
                  </h2>
                </div>
                <button
                  onClick={() => setArtigoAberto(null)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Corpo do artigo */}
            <div className="p-5">
              {/* Conteúdo completo */}
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-5">
                {artigoAberto.conteudo}
              </div>

              {/* Fonte */}
              {artigoAberto.fonte && (
                <div className="bg-rosa-50 border border-rosa-100 rounded-xl p-3 flex items-start gap-2">
                  <BookOpen size={14} className="text-rosa-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-rosa-700">Fonte Científica</p>
                    <p className="text-xs text-rosa-500 italic">{artigoAberto.fonte}</p>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-gray-300 text-center mt-4">
                Menovitta 4.0 · Conteúdo educativo, não substitui orientação médica
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          ABA RANKING
      ══════════════════════════════════════════ */}
      {activeTab === 'ranking' && (
        <div>
          {/* Banner */}
          <div className="relative rounded-2xl overflow-hidden h-28 mb-4">
            <img
              src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80"
              alt="Ranking"
              className="w-full h-full object-cover object-top"
            />
            <div
              className="absolute inset-0 flex flex-col justify-center px-5"
              style={{ background: 'linear-gradient(90deg, rgba(183,110,121,0.92) 0%, rgba(183,110,121,0.5) 100%)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Trophy size={14} className="text-white/80" />
                <span className="text-white/80 text-xs font-medium uppercase tracking-wide">
                  {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <p className="font-serif text-lg font-bold text-white">Ranking Mensal</p>
              <p className="text-white/80 text-xs">Quem mais treinou esse mês?</p>
            </div>
          </div>

          {loadingRanking ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-rosa-500 animate-spin" />
            </div>
          ) : ranking.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Trophy size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">Nenhum treino este mês ainda</p>
              <p className="text-sm mt-1">Seja a primeira a registrar! 💪</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Top 3 destaque */}
              {ranking.length >= 3 && (
                <div className="card mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-center">🏆 Top 3 do Mês</p>
                  <div className="flex items-end justify-center gap-3">
                    {/* 2º lugar */}
                    {ranking[1] && (
                      <div className="flex flex-col items-center gap-1 pb-0">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-500 border-2 border-gray-300">
                          {ranking[1].primeiroNome.charAt(0)}
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 text-center leading-tight max-w-[56px] truncate">{ranking[1].primeiroNome}</span>
                        {ranking[1].nickname && <span className="text-[9px] text-gray-400 truncate max-w-[56px]">{ranking[1].nickname}</span>}
                        <span className="text-[10px] text-gray-400">{ranking[1].treinos} treinos</span>
                        <div className="w-14 h-12 bg-gray-200 rounded-t-lg flex items-end justify-center pb-1">
                          <span className="text-lg">🥈</span>
                        </div>
                      </div>
                    )}
                    {/* 1º lugar */}
                    {ranking[0] && (
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-16 h-16 rounded-full bg-ouro-100 flex items-center justify-center text-3xl font-bold text-ouro-600 border-3 border-ouro-300">
                          {ranking[0].primeiroNome.charAt(0)}
                        </div>
                        <span className="text-[11px] font-bold text-gray-700 text-center leading-tight max-w-[64px] truncate">{ranking[0].primeiroNome}</span>
                        {ranking[0].nickname && <span className="text-[9px] text-ouro-500 truncate max-w-[64px]">{ranking[0].nickname}</span>}
                        <span className="text-[10px] text-gray-500">{ranking[0].treinos} treinos</span>
                        <div className="w-16 h-16 bg-ouro-200 rounded-t-lg flex items-end justify-center pb-1">
                          <span className="text-xl">🥇</span>
                        </div>
                      </div>
                    )}
                    {/* 3º lugar */}
                    {ranking[2] && (
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center text-xl font-bold text-amber-600 border-2 border-amber-200">
                          {ranking[2].primeiroNome.charAt(0)}
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 text-center leading-tight max-w-[52px] truncate">{ranking[2].primeiroNome}</span>
                        {ranking[2].nickname && <span className="text-[9px] text-gray-400 truncate max-w-[52px]">{ranking[2].nickname}</span>}
                        <span className="text-[10px] text-gray-400">{ranking[2].treinos} treinos</span>
                        <div className="w-14 h-8 bg-amber-100 rounded-t-lg flex items-end justify-center pb-1">
                          <span className="text-base">🥉</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Lista completa */}
              <div className="card">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Classificação completa</p>
                <div className="space-y-2">
                  {ranking.map(entry => {
                    const isMe = user?.id === entry.user_id
                    const medalha = entry.posicao === 1 ? '🥇' : entry.posicao === 2 ? '🥈' : entry.posicao === 3 ? '🥉' : null
                    return (
                      <div
                        key={entry.user_id}
                        className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all ${
                          isMe ? 'bg-rosa-50 border border-rosa-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className={`w-7 text-center text-sm font-bold ${
                          entry.posicao <= 3 ? 'text-ouro-500' : 'text-gray-400'
                        }`}>
                          {medalha || `#${entry.posicao}`}
                        </div>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-bold shrink-0 ${
                          isMe ? 'bg-rosa-200 text-rosa-700' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {entry.primeiroNome.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${isMe ? 'text-rosa-700' : 'text-gray-700'}`}>
                            {entry.primeiroNome} {isMe && <span className="text-xs font-normal">(você)</span>}
                          </p>
                          {entry.nickname && (
                            <p className={`text-[10px] truncate ${isMe ? 'text-rosa-400' : 'text-gray-400'}`}>{entry.nickname}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${isMe ? 'text-rosa-600' : 'text-gray-600'}`}>{entry.treinos}</p>
                          <p className="text-[10px] text-gray-400">treinos</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <p className="text-[10px] text-gray-400 text-center mt-2">
                Atualizado em tempo real · Apenas treinos do mês atual
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
