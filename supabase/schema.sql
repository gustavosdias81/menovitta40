-- ============================================================
-- MENOVITTA 4.0 - Schema do Banco de Dados Supabase
-- ============================================================
-- Execute este SQL no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard → SQL Editor → New Query
-- ============================================================

-- 1. TABELA: profiles (Perfil das Alunas + Admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  telefone TEXT DEFAULT '',
  data_nascimento DATE,
  idade INTEGER DEFAULT 0,
  peso DECIMAL(5,2) DEFAULT 0,
  altura DECIMAL(3,2) DEFAULT 0,
  fase_menopausa TEXT DEFAULT '' CHECK (fase_menopausa IN ('', 'pre_menopausa', 'menopausa', 'pos_menopausa')),
  objetivo TEXT DEFAULT '' CHECK (objetivo IN ('', 'emagrecer', 'forma', 'hipertrofia', 'saude', 'flexibilidade')),
  is_admin BOOLEAN DEFAULT FALSE,
  quiz_completo BOOLEAN DEFAULT FALSE,
  foto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA: anamnese_respostas (Respostas do Quiz)
-- ============================================================
CREATE TABLE IF NOT EXISTS anamnese_respostas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  idade INTEGER NOT NULL,
  ultima_menstruacao TEXT NOT NULL, -- 'menos_1_ano', '1_a_3_anos', 'mais_3_anos', 'regular'
  ciclo_regular BOOLEAN DEFAULT TRUE,
  frequencia_ciclo TEXT DEFAULT '', -- 'regular', 'irregular', 'ausente'
  sintomas TEXT[] DEFAULT '{}',
  intensidade_sintomas TEXT DEFAULT 'leve', -- 'leve', 'moderado', 'intenso'
  medicamentos TEXT[] DEFAULT '{}',
  uso_trh BOOLEAN DEFAULT FALSE,
  atividade_fisica TEXT DEFAULT 'sedentaria', -- 'sedentaria', 'leve', 'moderada', 'intensa'
  restricoes_alimentares TEXT[] DEFAULT '{}',
  horas_sono INTEGER DEFAULT 7,
  qualidade_sono TEXT DEFAULT 'regular', -- 'boa', 'regular', 'ruim', 'pessima'
  nivel_estresse TEXT DEFAULT 'moderado', -- 'baixo', 'moderado', 'alto', 'muito_alto'
  objetivo TEXT NOT NULL CHECK (objetivo IN ('emagrecer', 'forma', 'hipertrofia', 'saude', 'flexibilidade')),
  peso_atual DECIMAL(5,2) NOT NULL,
  altura DECIMAL(3,2) NOT NULL,
  circunferencia_abdominal DECIMAL(5,1),
  doencas_previas TEXT[] DEFAULT '{}',
  historico_familiar TEXT[] DEFAULT '{}',
  fase_classificada TEXT NOT NULL CHECK (fase_classificada IN ('pre_menopausa', 'menopausa', 'pos_menopausa')),
  observacoes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA: planos_acao (Plano de Ação da Aluna)
-- ============================================================
CREATE TABLE IF NOT EXISTS planos_acao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  titulo TEXT DEFAULT 'Meu Plano Menovitta',
  fase TEXT NOT NULL CHECK (fase IN ('pre_menopausa', 'menopausa', 'pos_menopausa')),
  treino_descricao TEXT DEFAULT '',
  nutricao_descricao TEXT DEFAULT '',
  mentalidade_descricao TEXT DEFAULT '',
  notas_admin TEXT DEFAULT '',
  meta_calorias INTEGER DEFAULT 1600,
  meta_proteinas INTEGER DEFAULT 90,
  meta_gorduras INTEGER DEFAULT 55,
  meta_carboidratos INTEGER DEFAULT 180,
  progresso_notas JSONB DEFAULT '[]',
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA: food_logs (Registro de Refeições com IA)
-- ============================================================
CREATE TABLE IF NOT EXISTS food_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  foto_url TEXT,
  descricao TEXT DEFAULT '',
  calorias INTEGER DEFAULT 0,
  proteinas DECIMAL(5,1) DEFAULT 0,
  gorduras DECIMAL(5,1) DEFAULT 0,
  carboidratos DECIMAL(5,1) DEFAULT 0,
  fibras DECIMAL(5,1) DEFAULT 0,
  refeicao TEXT DEFAULT 'outro' CHECK (refeicao IN ('cafe_manha', 'almoco', 'lanche', 'jantar', 'outro')),
  data DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA: community_posts (Feed da Comunidade)
-- ============================================================
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  autor_nome TEXT NOT NULL,
  autor_foto TEXT,
  tipo TEXT DEFAULT 'geral' CHECK (tipo IN ('refeicao', 'treino', 'evolucao', 'dica', 'geral')),
  texto TEXT NOT NULL,
  foto_url TEXT,
  curtidas INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FUNÇÃO: Incrementar curtida
-- ============================================================
CREATE OR REPLACE FUNCTION incrementar_curtida(post_id UUID, incremento INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE community_posts
  SET curtidas = GREATEST(0, curtidas + incremento)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNÇÃO: Criar perfil automaticamente no registro
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, email, nome)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil ao registrar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamnese_respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos_acao ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- PROFILES: Usuária vê só o seu, Admin vê todos
CREATE POLICY "Usuarios veem proprio perfil"
  ON profiles FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admin pode inserir perfis"
  ON profiles FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admin pode editar perfis"
  ON profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

-- ANAMNESE: Usuária vê só a sua, Admin vê todas
CREATE POLICY "Usuarios veem propria anamnese"
  ON anamnese_respostas FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Usuarios inserem propria anamnese"
  ON anamnese_respostas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- PLANOS DE AÇÃO: Usuária visualiza, Admin edita
CREATE POLICY "Usuarios veem proprio plano"
  ON planos_acao FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admin insere planos"
  ON planos_acao FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
    OR auth.uid() = user_id
  );

CREATE POLICY "Admin edita planos"
  ON planos_acao FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

-- FOOD LOGS: Cada usuária só vê os seus
CREATE POLICY "Usuarios veem proprios food logs"
  ON food_logs FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Usuarios inserem proprios food logs"
  ON food_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- COMMUNITY POSTS: Todos veem, cada um posta o seu
CREATE POLICY "Todos veem posts da comunidade"
  ON community_posts FOR SELECT
  USING (TRUE);

CREATE POLICY "Usuarios criam proprios posts"
  ON community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SEED: Criar usuário Admin
-- ============================================================
-- IMPORTANTE: Depois de rodar este schema, faça o seguinte:
-- 1. Vá em Authentication → Users no Supabase Dashboard
-- 2. Crie o usuário admin@gmail.com com senha "admin"
-- 3. Copie o UUID do usuário criado
-- 4. Execute o SQL abaixo substituindo o UUID:
--
-- UPDATE profiles
-- SET is_admin = TRUE, nome = 'Administrador'
-- WHERE email = 'admin@gmail.com';
-- ============================================================
