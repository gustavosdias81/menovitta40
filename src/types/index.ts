export type FaseMenopausa = 'pre_menopausa' | 'menopausa' | 'pos_menopausa'

export type Objetivo = 'emagrecer' | 'forma' | 'hipertrofia' | 'saude' | 'flexibilidade'

export interface Profile {
  id: string
  user_id: string
  nome: string
  email: string
  telefone: string
  data_nascimento: string
  idade: number
  peso: number
  altura: number
  fase_menopausa: FaseMenopausa
  objetivo: Objetivo
  is_admin: boolean
  quiz_completo: boolean
  foto_url?: string
  created_at: string
  updated_at: string
}

export interface AnamneseResponse {
  id: string
  user_id: string
  idade: number
  ultima_menstruacao: string
  ciclo_regular: boolean
  sintomas: string[]
  intensidade_sintomas?: string
  medicamentos: string[]
  atividade_fisica: string
  restricoes_alimentares: string[]
  horas_sono: number
  qualidade_sono?: string
  nivel_estresse: string
  objetivo: Objetivo
  peso_atual: number
  altura: number
  circunferencia_abdominal?: number
  uso_trh: boolean
  doencas_previas: string[]
  historico_familiar?: string[]
  frequencia_ciclo?: string
  fase_classificada: FaseMenopausa
  created_at: string
}

export interface PlanoAcao {
  id: string
  user_id: string
  titulo: string
  fase: FaseMenopausa
  treino_descricao: string
  nutricao_descricao: string
  mentalidade_descricao: string
  notas_admin: string
  meta_calorias: number
  meta_proteinas: number
  meta_gorduras: number
  meta_carboidratos: number
  progresso_notas: ProgressoNota[]
  // Trilha de evolução (jornada de longo prazo)
  trilha_ativa?: '8sem' | '90d' | '180d' | '360d'
  data_inicio_programa?: string
  ativo?: boolean
  created_at: string
  updated_at: string
}

export interface ProgressoNota {
  data: string
  nota: string
  autor: 'admin' | 'sistema'
}

export interface FoodLog {
  id: string
  user_id: string
  foto_url: string
  descricao: string
  calorias: number
  proteinas: number
  gorduras: number
  carboidratos: number
  refeicao: 'cafe_manha' | 'almoco' | 'lanche' | 'jantar' | 'outro'
  data: string
  created_at: string
}

export interface CommunityPost {
  id: string
  user_id: string
  autor_nome: string
  autor_foto?: string
  tipo: 'refeicao' | 'treino' | 'evolucao' | 'dica' | 'geral'
  texto: string
  foto_url?: string
  curtidas: number
  created_at: string
}

export interface MacroMeta {
  calorias: number
  proteinas: number
  gorduras: number
  carboidratos: number
}
