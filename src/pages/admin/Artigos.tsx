import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getArtigos, upsertArtigo, deleteArtigo } from '../../lib/supabase'
import type { Artigo } from '../../types'
import {
  ArrowLeft, Plus, BookOpen, Loader2, Edit2, Trash2,
  Eye, EyeOff, Save, X, FlaskConical, Image
} from 'lucide-react'

const CATEGORIAS = ['geral', 'treino', 'nutricao', 'saude', 'mente']
const CATEGORIA_LABELS: Record<string, string> = {
  geral: 'Geral', treino: 'Treino', nutricao: 'Nutrição', saude: 'Saúde', mente: 'Mente'
}

const ARTIGO_VAZIO: Partial<Artigo> = {
  titulo: '',
  resumo: '',
  conteudo: '',
  fonte: '',
  data_pub: new Date().toISOString().split('T')[0],
  tags: [],
  imagem_url: '',
  categoria: 'geral',
  publicado: false,
}

export default function AdminArtigos() {
  const navigate = useNavigate()
  const [artigos, setArtigos] = useState<Artigo[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editando, setEditando] = useState<Partial<Artigo>>(ARTIGO_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [tagsInput, setTagsInput] = useState('')

  useEffect(() => {
    loadArtigos()
  }, [])

  const loadArtigos = async () => {
    setLoading(true)
    const { data } = await getArtigos(false) // admin vê todos, incluindo não publicados
    if (data) setArtigos(data as Artigo[])
    setLoading(false)
  }

  const abrirNovo = () => {
    setEditando(ARTIGO_VAZIO)
    setTagsInput('')
    setShowEditor(true)
  }

  const abrirEditar = (artigo: Artigo) => {
    setEditando({ ...artigo })
    setTagsInput(artigo.tags?.join(', ') || '')
    setShowEditor(true)
  }

  const handleSalvar = async () => {
    if (!editando.titulo?.trim() || !editando.resumo?.trim()) return
    setSalvando(true)
    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
    await upsertArtigo({ ...editando, tags })
    setSalvando(false)
    setShowEditor(false)
    await loadArtigos()
  }

  const handlePublicar = async (artigo: Artigo) => {
    await upsertArtigo({ ...artigo, publicado: !artigo.publicado })
    await loadArtigos()
  }

  const handleDeletar = async (artigo: Artigo) => {
    if (!confirm(`Excluir "${artigo.titulo}"? Esta ação não pode ser desfeita.`)) return
    await deleteArtigo(artigo.id)
    await loadArtigos()
  }

  const publicados = artigos.filter(a => a.publicado).length
  const rascunhos = artigos.filter(a => !a.publicado).length

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate('/admin')}
          className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="page-title flex items-center gap-2">
            <FlaskConical size={20} className="text-rosa-500" />
            Artigos Científicos
          </h1>
          <p className="text-sm text-gray-500">{publicados} publicados · {rascunhos} rascunhos</p>
        </div>
        <button
          onClick={abrirNovo}
          className="w-10 h-10 bg-rosa-500 rounded-xl flex items-center justify-center shadow-md"
        >
          <Plus size={18} className="text-white" />
        </button>
      </div>

      {/* Stats mini */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="card text-center p-3">
          <p className="text-2xl font-bold text-gray-800">{artigos.length}</p>
          <p className="text-[10px] text-gray-400">Total</p>
        </div>
        <div className="card text-center p-3">
          <p className="text-2xl font-bold text-green-500">{publicados}</p>
          <p className="text-[10px] text-gray-400">Publicados</p>
        </div>
        <div className="card text-center p-3">
          <p className="text-2xl font-bold text-amber-500">{rascunhos}</p>
          <p className="text-[10px] text-gray-400">Rascunhos</p>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-rosa-500 animate-spin" />
        </div>
      ) : artigos.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-4">Nenhum artigo criado ainda</p>
          <button onClick={abrirNovo} className="btn-primary">
            <Plus size={16} className="inline mr-2" />
            Criar Primeiro Artigo
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {artigos.map(artigo => (
            <div key={artigo.id} className="card">
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                  {artigo.imagem_url ? (
                    <img src={artigo.imagem_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image size={20} className="text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      artigo.publicado ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {artigo.publicado ? 'Publicado' : 'Rascunho'}
                    </span>
                    <span className="text-[10px] text-gray-400 capitalize">{artigo.categoria}</span>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">{artigo.titulo}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 italic">{artigo.fonte || 'Sem fonte'}</p>
                  {artigo.tags && artigo.tags.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {artigo.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => abrirEditar(artigo)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-medium hover:bg-gray-200 transition-colors"
                >
                  <Edit2 size={13} /> Editar
                </button>
                <button
                  onClick={() => handlePublicar(artigo)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                    artigo.publicado
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {artigo.publicado ? <><EyeOff size={13} /> Despublicar</> : <><Eye size={13} /> Publicar</>}
                </button>
                <button
                  onClick={() => handleDeletar(artigo)}
                  className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-400 rounded-xl hover:bg-red-100 transition-colors flex-shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ EDITOR MODAL ═══ */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl max-h-[92vh] overflow-y-auto">
            {/* Header editor */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
              <h2 className="font-serif text-base font-bold text-gray-800">
                {editando.id ? 'Editar Artigo' : 'Novo Artigo'}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSalvar}
                  disabled={salvando || !editando.titulo?.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rosa-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  {salvando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Salvar
                </button>
                <button onClick={() => setShowEditor(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <X size={16} className="text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Publicado toggle */}
              <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {editando.publicado ? 'Publicado' : 'Rascunho'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {editando.publicado ? 'Visível para todas as alunas' : 'Apenas você vê'}
                  </p>
                </div>
                <button
                  onClick={() => setEditando(prev => ({ ...prev, publicado: !prev.publicado }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    editando.publicado ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    editando.publicado ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Título */}
              <div>
                <label className="label-field">Título *</label>
                <input
                  type="text"
                  value={editando.titulo || ''}
                  onChange={e => setEditando(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ex: Treino de Força Reduz Sintomas da Menopausa"
                  className="input-field"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="label-field">Categoria</label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIAS.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setEditando(prev => ({ ...prev, categoria: cat }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        editando.categoria === cat
                          ? 'bg-rosa-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {CATEGORIA_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resumo */}
              <div>
                <label className="label-field">Resumo * <span className="text-gray-400 font-normal">(exibido no card e no início do modal)</span></label>
                <textarea
                  value={editando.resumo || ''}
                  onChange={e => setEditando(prev => ({ ...prev, resumo: e.target.value }))}
                  placeholder="Resumo do estudo científico (2-4 frases)..."
                  className="input-field min-h-[100px] resize-none"
                />
              </div>

              {/* Conteúdo completo */}
              <div>
                <label className="label-field">Conteúdo completo <span className="text-gray-400 font-normal">(opcional — exibido ao abrir o artigo)</span></label>
                <textarea
                  value={editando.conteudo || ''}
                  onChange={e => setEditando(prev => ({ ...prev, conteudo: e.target.value }))}
                  placeholder="Texto completo do artigo, dados adicionais, recomendações práticas..."
                  className="input-field min-h-[140px] resize-none"
                />
              </div>

              {/* Fonte */}
              <div>
                <label className="label-field">Fonte científica</label>
                <input
                  type="text"
                  value={editando.fonte || ''}
                  onChange={e => setEditando(prev => ({ ...prev, fonte: e.target.value }))}
                  placeholder="Ex: Journal of Strength & Conditioning Research, 2024"
                  className="input-field"
                />
              </div>

              {/* Data */}
              <div>
                <label className="label-field">Data de publicação</label>
                <input
                  type="date"
                  value={editando.data_pub || ''}
                  onChange={e => setEditando(prev => ({ ...prev, data_pub: e.target.value }))}
                  className="input-field"
                />
              </div>

              {/* URL imagem */}
              <div>
                <label className="label-field">URL da imagem <span className="text-gray-400 font-normal">(Unsplash recomendado)</span></label>
                <input
                  type="url"
                  value={editando.imagem_url || ''}
                  onChange={e => setEditando(prev => ({ ...prev, imagem_url: e.target.value }))}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="input-field"
                />
                {editando.imagem_url && (
                  <img src={editando.imagem_url} alt="preview" className="mt-2 w-full h-32 object-cover rounded-xl" />
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="label-field">Tags <span className="text-gray-400 font-normal">(separe por vírgula)</span></label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="Ex: Treino de Força, Menopausa, Sono"
                  className="input-field"
                />
                {tagsInput && (
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {tagsInput.split(',').filter(t => t.trim()).map((tag, i) => (
                      <span key={i} className="bg-rosa-100 text-rosa-600 text-xs px-2.5 py-0.5 rounded-full">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleSalvar}
                disabled={salvando || !editando.titulo?.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {salvando ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={16} /> Salvar Artigo</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
