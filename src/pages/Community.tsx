import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getCommunityPosts, createCommunityPost, getArtigos, moderarPost, deleteCommunityPost } from '../lib/supabase'
import type { CommunityPost, Artigo } from '../types'
import {
  Heart, MessageCircle, Send, Loader2,
  User, Utensils, Dumbbell, TrendingUp, Lightbulb,
  Plus, X, Image, Newspaper, ExternalLink, BookOpen,
  FlaskConical, Users, Pin, EyeOff, Trash2, Shield
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

const CATEGORIA_COR: Record<string, string> = {
  geral: 'bg-rosa-50 text-rosa-600',
  treino: 'bg-orange-50 text-orange-600',
  nutricao: 'bg-green-50 text-green-600',
  saude: 'bg-blue-50 text-blue-600',
  mente: 'bg-purple-50 text-purple-600',
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function Community() {
  const { user, profile } = useAuth()
  const isAdmin = profile?.is_admin === true

  const [activeTab, setActiveTab] = useState<'feed' | 'news'>('news')
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [artigos, setArtigos] = useState<Artigo[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingArtigos, setLoadingArtigos] = useState(false)
  const [showNewPost, setShowNewPost] = useState(false)
  const [newText, setNewText] = useState('')
  const [newTipo, setNewTipo] = useState('geral')
  const [posting, setPosting] = useState(false)
  const [artigoAberto, setArtigoAberto] = useState<Artigo | null>(null)
  const [moderando, setModerando] = useState<string | null>(null)

  useEffect(() => {
    if (activeTab === 'feed') loadPosts()
    if (activeTab === 'news') loadArtigos()
  }, [activeTab])

  useEffect(() => {
    loadArtigos()
  }, [])

  const loadArtigos = async () => {
    setLoadingArtigos(true)
    try {
      const { data } = await getArtigos(true)
      if (data) setArtigos(data as Artigo[])
    } catch (e) {
      console.error('loadArtigos error:', e)
    } finally {
      setLoadingArtigos(false)
    }
  }

  const loadPosts = async () => {
    setLoading(true)
    try {
      const { data } = await getCommunityPosts(50)
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
    } catch (e) {
      console.error('loadPosts error:', e)
    } finally {
      setLoading(false)
    }
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
    if (!confirm(`Excluir post de ${post.autor_nome}? Esta ação não pode ser desfeita.`)) return
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
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'news' ? 'bg-white text-rosa-500 shadow-sm' : 'text-gray-500'
          }`}
        >
          <Newspaper size={15} /> Artigos
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

      {/* ═══ ABA ARTIGOS ═══ */}
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

          {loadingArtigos ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-rosa-500 animate-spin" />
            </div>
          ) : artigos.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Nenhum artigo publicado ainda</p>
              {isAdmin && (
                <p className="text-xs text-gray-400 mt-1">Acesse o Admin → Artigos para publicar</p>
              )}
            </div>
          ) : (
            artigos.map(artigo => (
              <div
                key={artigo.id}
                className="card overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setArtigoAberto(artigo)}
              >
                {/* Imagem */}
                {artigo.imagem_url && (
                  <div className="relative -mx-4 -mt-4 mb-3 h-36">
                    <img
                      src={artigo.imagem_url}
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
                )}

                {/* Conteúdo */}
                <div className="flex items-start gap-2 mb-2">
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${CATEGORIA_COR[artigo.categoria] || CATEGORIA_COR.geral}`}>
                    <BookOpen size={10} className="inline mr-1" />
                    {artigo.categoria.charAt(0).toUpperCase() + artigo.categoria.slice(1)}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {artigo.data_pub ? new Date(artigo.data_pub).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : ''}
                  </span>
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
            ))
          )}
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

          {/* Banner moderação (apenas admin) */}
          {isAdmin && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3 mb-4 flex items-center gap-2">
              <Shield size={16} className="text-purple-500 flex-shrink-0" />
              <p className="text-xs text-purple-700 font-medium">Modo Moderação ativo — você vê todos os posts, incluindo ocultos.</p>
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
                <div key={post.id} className={`card ${post.oculto ? 'opacity-50 border border-dashed border-red-300' : ''} ${post.pinado ? 'border border-ouro-300 bg-ouro-50/30' : ''}`}>
                  {/* Badge pinado */}
                  {post.pinado && (
                    <div className="flex items-center gap-1 text-ouro-600 text-[10px] font-semibold mb-2">
                      <Pin size={10} /> Fixado pela equipe
                    </div>
                  )}
                  {/* Badge oculto (apenas admin vê) */}
                  {post.oculto && isAdmin && (
                    <div className="flex items-center gap-1 text-red-500 text-[10px] font-semibold mb-2">
                      <EyeOff size={10} /> Oculto (apenas você vê)
                    </div>
                  )}

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

                    {/* Ações de moderação (só admin) */}
                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handlePinar(post)}
                          disabled={moderando === post.id}
                          title={post.pinado ? 'Despinar' : 'Fixar post'}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            post.pinado ? 'bg-ouro-100 text-ouro-600' : 'bg-gray-100 text-gray-400 hover:bg-ouro-50 hover:text-ouro-500'
                          }`}
                        >
                          <Pin size={13} />
                        </button>
                        <button
                          onClick={() => handleOcultar(post)}
                          disabled={moderando === post.id}
                          title={post.oculto ? 'Mostrar' : 'Ocultar'}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            post.oculto ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-400'
                          }`}
                        >
                          <EyeOff size={13} />
                        </button>
                        <button
                          onClick={() => handleDeletar(post)}
                          disabled={moderando === post.id}
                          title="Excluir permanentemente"
                          className="w-7 h-7 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
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

      {/* ═══ MODAL ARTIGO COMPLETO ═══ */}
      {artigoAberto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl max-h-[90vh] overflow-y-auto">
            {/* Imagem topo */}
            {artigoAberto.imagem_url ? (
              <div className="relative h-44">
                <img src={artigoAberto.imagem_url} alt={artigoAberto.titulo}
                  className="w-full h-full object-cover" />
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                <button onClick={() => setArtigoAberto(null)}
                  className="absolute top-4 right-4 bg-black/40 rounded-full p-1.5">
                  <X size={18} className="text-white" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="font-serif text-base font-bold text-gray-800 flex-1 pr-3">{artigoAberto.titulo}</h2>
                <button onClick={() => setArtigoAberto(null)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <X size={16} className="text-gray-600" />
                </button>
              </div>
            )}

            {/* Conteúdo */}
            <div className="p-5">
              {/* Tags */}
              {artigoAberto.tags && artigoAberto.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {artigoAberto.tags.map(tag => (
                    <span key={tag} className={`px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORIA_COR[artigoAberto.categoria] || CATEGORIA_COR.geral}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {artigoAberto.imagem_url && (
                <h2 className="font-serif text-lg font-bold text-gray-800 leading-snug mb-3">
                  {artigoAberto.titulo}
                </h2>
              )}

              <p className="text-sm text-gray-600 leading-relaxed mb-4">{artigoAberto.resumo}</p>

              {artigoAberto.conteudo && (
                <div className="text-sm text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap border-t pt-4">
                  {artigoAberto.conteudo}
                </div>
              )}

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
