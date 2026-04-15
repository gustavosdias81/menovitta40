-- ============================================================
-- MIGRAÇÃO COMPLETA — MENOVITTA 4.0
-- Data: 2026-04-14
-- Execute TUDO no SQL Editor do Supabase:
-- https://supabase.com/dashboard → SQL Editor → New Query
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES — coluna ativo (caso não exista)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;

-- ─────────────────────────────────────────────────────────────
-- 2. COMMUNITY POSTS — colunas de moderação
-- ─────────────────────────────────────────────────────────────
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS pinado  BOOLEAN DEFAULT FALSE;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS oculto  BOOLEAN DEFAULT FALSE;

-- ─────────────────────────────────────────────────────────────
-- 3. ARTIGOS CIENTÍFICOS — nova tabela
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS artigos (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo      TEXT NOT NULL,
  resumo      TEXT NOT NULL DEFAULT '',
  conteudo    TEXT NOT NULL DEFAULT '',
  fonte       TEXT DEFAULT '',
  data_pub    DATE DEFAULT CURRENT_DATE,
  imagem_url  TEXT DEFAULT '',
  tags        TEXT[] DEFAULT '{}',
  categoria   TEXT DEFAULT 'geral'
              CHECK (categoria IN ('geral','nutricao','treino','saude','mente')),
  publicado   BOOLEAN DEFAULT FALSE,
  autor_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE artigos ENABLE ROW LEVEL SECURITY;

-- Qualquer usuária autenticada lê artigos publicados
DROP POLICY IF EXISTS "Todos leem artigos publicados" ON artigos;
CREATE POLICY "Todos leem artigos publicados"
  ON artigos FOR SELECT
  USING (
    publicado = TRUE
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

-- Só admin pode criar artigos
DROP POLICY IF EXISTS "Admin cria artigos" ON artigos;
CREATE POLICY "Admin cria artigos"
  ON artigos FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

-- Só admin pode editar artigos
DROP POLICY IF EXISTS "Admin edita artigos" ON artigos;
CREATE POLICY "Admin edita artigos"
  ON artigos FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

-- Só admin pode excluir artigos
DROP POLICY IF EXISTS "Admin exclui artigos" ON artigos;
CREATE POLICY "Admin exclui artigos"
  ON artigos FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

-- ─────────────────────────────────────────────────────────────
-- 4. COMMUNITY POSTS — políticas de moderação admin
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin modera posts" ON community_posts;
CREATE POLICY "Admin modera posts"
  ON community_posts FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

DROP POLICY IF EXISTS "Admin exclui posts" ON community_posts;
CREATE POLICY "Admin exclui posts"
  ON community_posts FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

-- ─────────────────────────────────────────────────────────────
-- 5. PROFILES — corrigir políticas para usuárias atualizarem o próprio perfil
-- ─────────────────────────────────────────────────────────────

-- Remover política antiga restritiva
DROP POLICY IF EXISTS "Admin pode editar perfis" ON profiles;
DROP POLICY IF EXISTS "Admin pode inserir perfis" ON profiles;
DROP POLICY IF EXISTS "Usuarios atualizam proprio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuarios inserem proprio perfil" ON profiles;

-- INSERT: usuária insere o próprio perfil (necessário no cadastro/quiz)
CREATE POLICY "Usuarios inserem proprio perfil"
  ON profiles FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_admin = TRUE)
  );

-- UPDATE: usuária atualiza o próprio perfil; admin atualiza qualquer um
CREATE POLICY "Usuarios atualizam proprio perfil"
  ON profiles FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_admin = TRUE)
  );

-- ─────────────────────────────────────────────────────────────
-- 6. TREINO LOGS — habilitar RLS e políticas (se ainda não existirem)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS treino_logs (
  id       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data     DATE NOT NULL,
  foco     TEXT DEFAULT '',
  duracao  TEXT DEFAULT '',
  local    TEXT DEFAULT 'academia' CHECK (local IN ('academia','casa')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, data)
);

ALTER TABLE treino_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios veem proprios treinos" ON treino_logs;
CREATE POLICY "Usuarios veem proprios treinos"
  ON treino_logs FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

DROP POLICY IF EXISTS "Usuarios inserem proprios treinos" ON treino_logs;
CREATE POLICY "Usuarios inserem proprios treinos"
  ON treino_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios atualizam proprios treinos" ON treino_logs;
CREATE POLICY "Usuarios atualizam proprios treinos"
  ON treino_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 7. NOTIFICAÇÕES — habilitar RLS e políticas (se ainda não existirem)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notificacoes (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  destinatario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo          TEXT NOT NULL,
  mensagem        TEXT NOT NULL DEFAULT '',
  tipo            TEXT DEFAULT 'info' CHECK (tipo IN ('info','alerta','conquista','admin')),
  lida            BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios veem proprias notificacoes" ON notificacoes;
CREATE POLICY "Usuarios veem proprias notificacoes"
  ON notificacoes FOR SELECT
  USING (
    destinatario_id = auth.uid()
    OR destinatario_id IS NULL
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

DROP POLICY IF EXISTS "Admin cria notificacoes" ON notificacoes;
CREATE POLICY "Admin cria notificacoes"
  ON notificacoes FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

DROP POLICY IF EXISTS "Usuarios atualizam proprias notificacoes" ON notificacoes;
CREATE POLICY "Usuarios atualizam proprias notificacoes"
  ON notificacoes FOR UPDATE
  USING (
    destinatario_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

-- ─────────────────────────────────────────────────────────────
-- 8. VERIFICAÇÃO FINAL
-- ─────────────────────────────────────────────────────────────
SELECT
  'Migração concluída com sucesso!' AS status,
  (SELECT COUNT(*) FROM artigos) AS total_artigos,
  (SELECT COUNT(*) FROM profiles) AS total_profiles,
  (SELECT COUNT(*) FROM community_posts) AS total_posts;
