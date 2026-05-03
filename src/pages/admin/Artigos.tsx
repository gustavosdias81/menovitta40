import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getArtigos, upsertArtigo, deleteArtigo } from '../../lib/supabase'
import type { Artigo } from '../../types'
import {
  ArrowLeft, Plus, BookOpen, Loader2, Edit2, Trash2,
  Eye, EyeOff, Save, X, FlaskConical
} from 'lucide-react'

const CATEGORIAS = [
  { value: 'geral',    label: '📰 Geral' },
  { value: 'treino',   label: '🏋️ Treino' },
  { value: 'nutricao', label: '🥗 Nutrição' },
  { value: 'saude',    label: '❤️ Saúde' },
  { value: 'mente',    label: '🧠 Mente' },
]

const ARTIGO_VAZIO: Partial<Artigo> = {
  titulo: '',
  conteudo: '',
  fonte: '',
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

  useEffect(() => { loadArtigos() }, [])

  const loadArtigos = async () => {
    setLoading(true)
    try {
      const { data } = await getArtigos(false)
      if (data) setArtigos(data as Artigo[])
    } catch { /* silencia erro de tabela vazia */ }
    finally { setLoading(false) }
  }

  const abrirNovo = () => {
    setEditando(ARTIGO_VAZIO)
    setShowEditor(true)
  }

  const abrirEditar = (artigo: Artigo) => {
    setEditando({ ...artigo })
    setShowEditor(true)
  }

  const handleSalvar = async () => {
    if (!editando.titulo?.trim() || !editando.conteudo?.trim()) return
    setSalvando(true)
    // Resumo = primeiros 200 chars do conteúdo (automático)
    const resumo = (editando.conteudo || '').slice(0, 200).trimEnd()
    const payload = {
      ...editando,
      resumo,
      tags: [],
      imagem_url: '',
      data_pub: editando.data_pub || new Date().toISOString().split('T')[0],
    }
    await upsertArtigo(payload)
    setSalvando(false)
    setShowEditor(false)
    await loadArtigos()
  }

  const handlePublicar = async (artigo: Artigo) => {
    await upsertArtigo({ ...artigo, publicado: !artigo.publicado })
    await loadArtigos()
  }

  const handleDeletar = async (artigo: Artigo) => {
    if (!confirm(`Excluir "${artigo.titulo}"?`)) return
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
          onClick={() => navigate('/dashboard')}
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

      {/* Contador */}
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
              <div className="flex items-start gap-2 mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 mt-0.5 ${
                  artigo.publicado ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {artigo.publicado ? 'Publicado' : 'Rascunho'}
                </span>
                <p className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 flex-1">
                  {artigo.titulo}
                </p>
              </div>
              <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                {artigo.conteudo?.slice(0, 120)}...
              </p>

              {/* Ações */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => abrirEditar(artigo)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-medium"
                >
                  <Edit2 size={13} /> Editar
                </button>
                <button
                  onClick={() => handlePublicar(artigo)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium ${
                    artigo.publicado
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {artigo.publicado
                    ? <><EyeOff size={13} /> Despublicar</>
                    : <><Eye size={13} /> Publicar</>
                  }
                </button>
                <button
                  onClick={() => handleDeletar(artigo)}
                  className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-400 rounded-xl"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ EDITOR SIMPLIFICADO ═══ */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl max-h-[92vh] overflow-y-auto">

            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
              <h2 className="font-serif text-base font-bold text-gray-800">
                {editando.id ? 'Editar Artigo' : 'Novo Artigo'}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSalvar}
                  disabled={salvando || !editando.titulo?.trim() || !editando.conteudo?.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rosa-500 text-white rounded-xl text-sm font-semibold disabled:opacity-40"
                >
                  {salvando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Publicar
                </button>
                <button
                  onClick={() => setShowEditor(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <X size={16} className="text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">

              {/* Toggle publicar */}
              <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {editando.publicado ? '✅ Publicado' : '📝 Rascunho'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {editando.publicado ? 'Visível para todas as alunas' : 'Só você vê'}
                  </p>
                </div>
                <button
                  onClick={() => setEditando(p => ({ ...p, publicado: !p.publicado }))}
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
                  onChange={e => setEditando(p => ({ ...p, titulo: e.target.value }))}
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
                      key={cat.value}
                      onClick={() => setEditando(p => ({ ...p, categoria: cat.value }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        editando.categoria === cat.value
                          ? 'bg-rosa-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conteúdo */}
              <div>
                <label className="label-field">Conteúdo do artigo *</label>
                <textarea
                  value={editando.conteudo || ''}
                  onChange={e => setEditando(p => ({ ...p, conteudo: e.target.value }))}
                  placeholder="Cole aqui o conteúdo completo do artigo científico, estudo ou notícia de saúde..."
                  className="input-field min-h-[200px] resize-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  O resumo do card será gerado automaticamente das primeiras linhas.
                </p>
              </div>

              {/* Fonte (opcional) */}
              <div>
                <label className="label-field">Fonte <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input
                  type="text"
                  value={editando.fonte || ''}
                  onChange={e => setEditando(p => ({ ...p, fonte: e.target.value }))}
                  placeholder="Ex: Journal of Clinical Endocrinology, 2024"
                  className="input-field"
                />
              </div>

              <button
                onClick={handleSalvar}
                disabled={salvando || !editando.titulo?.trim() || !editando.conteudo?.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {salvando
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <><Save size={16} /> Salvar Artigo</>
                }
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
