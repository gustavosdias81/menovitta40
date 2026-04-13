import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getCommunityPosts, createCommunityPost } from '../lib/supabase'
import type { CommunityPost } from '../types'
import {
  Heart, MessageCircle, Camera, Send, Loader2,
  User, Utensils, Dumbbell, TrendingUp, Lightbulb,
  Plus, X, Image
} from 'lucide-react'

const TIPO_ICONS: Record<string, React.ReactNode> = {
  refeicao: <Utensils size={12} />,
  treino: <Dumbbell size={12} />,
  evolucao: <TrendingUp size={12} />,
  dica: <Lightbulb size={12} />,
  geral: <MessageCircle size={12} />,
}

const TIPO_LABELS: Record<string, string> = {
  refeicao: 'Refeição',
  treino: 'Treino',
  evolucao: 'Evolução',
  dica: 'Dica',
  geral: 'Geral',
}

const TIPO_COLORS: Record<string, string> = {
  refeicao: 'bg-green-100 text-green-700',
  treino: 'bg-rosa-100 text-rosa-700',
  evolucao: 'bg-purple-100 text-purple-700',
  dica: 'bg-ouro-100 text-ouro-700',
  geral: 'bg-gray-100 text-gray-700',
}

export default function Community() {
  const { user, profile } = useAuth()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewPost, setShowNewPost] = useState(false)
  const [newText, setNewText] = useState('')
  const [newTipo, setNewTipo] = useState('geral')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [])

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Comunidade</h1>
          <p className="text-sm text-gray-500">Compartilhe e inspire outras mulheres</p>
        </div>
        <button
          onClick={() => setShowNewPost(true)}
          className="w-10 h-10 bg-rosa-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* Novo Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-bold text-gray-800">Nova Publicação</h2>
              <button onClick={() => setShowNewPost(false)}>
                <X size={22} className="text-gray-400" />
              </button>
            </div>

            {/* Tipo do post */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(TIPO_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setNewTipo(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    newTipo === key
                      ? 'bg-rosa-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {TIPO_ICONS[key]} {label}
                </button>
              ))}
            </div>

            {/* Texto */}
            <textarea
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="Compartilhe sua experiência, conquista ou dica..."
              className="input-field min-h-[120px] resize-none mb-3"
              maxLength={500}
            />

            <div className="flex items-center justify-between">
              <button className="flex items-center gap-2 text-gray-400 text-sm">
                <Image size={18} /> Foto (em breve)
              </button>

              <button
                onClick={handlePost}
                disabled={posting || !newText.trim()}
                className="btn-primary flex items-center gap-2"
              >
                {posting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send size={16} /> Publicar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feed */}
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
              {/* Header do post */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-rosa-400 to-rosa-600 rounded-full flex items-center justify-center text-white">
                  {post.autor_foto ? (
                    <img src={post.autor_foto} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User size={18} />
                  )}
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

              {/* Texto */}
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{post.texto}</p>

              {/* Foto (se houver) */}
              {post.foto_url && (
                <img
                  src={post.foto_url}
                  alt=""
                  className="w-full h-48 object-cover rounded-xl mb-3"
                />
              )}

              {/* Ações */}
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
    </div>
  )
}
