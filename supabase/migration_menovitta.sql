-- ============================================================
-- MENOVITTA 4.0 — MIGRAÇÃO COMPLETA DO SCHEMA
-- Cole e execute no Supabase → SQL Editor
-- Seguro para rodar múltiplas vezes (idempotente)
-- ============================================================

-- ── UUID ─────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid    DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         uuid    NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome            text,
  email           text,
  telefone        text,
  data_nascimento date,
  idade           integer,
  peso            numeric(6,2),
  altura          numeric(5,2),
  fase_menopausa  text    CHECK (fase_menopausa IN ('pre_menopausa','menopausa','pos_menopausa')),
  objetivo        text    CHECK (objetivo IN ('emagrecer','forma','hipertrofia','saude','flexibilidade')),
  is_admin        boolean DEFAULT false,
  quiz_completo   boolean DEFAULT false,
  foto_url        text,
  ativo           boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id    ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_auth"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"    ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"    ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own"    ON public.profiles;

-- Leitura liberada para todas as alunas autenticadas (necessário para ranking)
CREATE POLICY "profiles_select_auth"
  ON public.profiles FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);


-- ============================================================
-- 2. ANAMNESE_RESPOSTAS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.anamnese_respostas (
  id                      uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id                 uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  idade                   integer,
  ultima_menstruacao      text,
  ciclo_regular           boolean,
  frequencia_ciclo        text,
  sintomas                text[]  DEFAULT '{}',
  intensidade_sintomas    text,
  medicamentos            text[]  DEFAULT '{}',
  uso_trh                 boolean,
  atividade_fisica        text,
  restricoes_alimentares  text[]  DEFAULT '{}',
  horas_sono              integer,
  qualidade_sono          text,
  nivel_estresse          text,
  objetivo                text,
  peso_atual              numeric(6,2),
  altura                  numeric(5,2),
  circunferencia_abdominal numeric(6,2),
  doencas_previas         text[]  DEFAULT '{}',
  historico_familiar      text[],
  fase_classificada       text    CHECK (fase_classificada IN ('pre_menopausa','menopausa','pos_menopausa')),
  created_at              timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_anamnese_user_id ON public.anamnese_respostas(user_id);

ALTER TABLE public.anamnese_respostas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anamnese_select_own" ON public.anamnese_respostas;
DROP POLICY IF EXISTS "anamnese_insert_own" ON public.anamnese_respostas;
DROP POLICY IF EXISTS "anamnese_update_own" ON public.anamnese_respostas;

CREATE POLICY "anamnese_select_own"
  ON public.anamnese_respostas FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "anamnese_insert_own"
  ON public.anamnese_respostas FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "anamnese_update_own"
  ON public.anamnese_respostas FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);


-- ============================================================
-- 3. PLANOS_ACAO
-- ============================================================
CREATE TABLE IF NOT EXISTS public.planos_acao (
  id                   uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id              uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo               text,
  fase                 text CHECK (fase IN ('pre_menopausa','menopausa','pos_menopausa')),
  treino_descricao     text,
  nutricao_descricao   text,
  mentalidade_descricao text,
  notas_admin          text,
  meta_calorias        integer,
  meta_proteinas       integer,
  meta_gorduras        integer,
  meta_carboidratos    integer,
  progresso_notas      jsonb DEFAULT '[]'::jsonb,
  trilha_ativa         text CHECK (trilha_ativa IN ('8sem','90d','180d','360d') OR trilha_ativa IS NULL),
  data_inicio_programa date,
  ativo                boolean DEFAULT true,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

-- Colunas adicionadas depois do lançamento inicial
ALTER TABLE public.planos_acao
  ADD COLUMN IF NOT EXISTS trilha_ativa         text,
  ADD COLUMN IF NOT EXISTS data_inicio_programa date,
  ADD COLUMN IF NOT EXISTS progresso_notas      jsonb DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_planos_user_id ON public.planos_acao(user_id);

ALTER TABLE public.planos_acao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "planos_select_own" ON public.planos_acao;
DROP POLICY IF EXISTS "planos_insert_own" ON public.planos_acao;
DROP POLICY IF EXISTS "planos_update_own" ON public.planos_acao;

CREATE POLICY "planos_select_own"
  ON public.planos_acao FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "planos_insert_own"
  ON public.planos_acao FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "planos_update_own"
  ON public.planos_acao FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);


-- ============================================================
-- 4. TREINO_LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.treino_logs (
  id         uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data       date NOT NULL,
  foco       text,
  duracao    text,
  local      text CHECK (local IN ('academia','casa')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, data)   -- 1 treino por dia por aluna (upsert)
);

-- Coluna adicionada depois do lançamento inicial
ALTER TABLE public.treino_logs
  ADD COLUMN IF NOT EXISTS local text CHECK (local IN ('academia','casa'));

CREATE INDEX IF NOT EXISTS idx_treino_user_data  ON public.treino_logs(user_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_treino_data_range ON public.treino_logs(data);

ALTER TABLE public.treino_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "treino_select_all_auth" ON public.treino_logs;
DROP POLICY IF EXISTS "treino_insert_own"      ON public.treino_logs;
DROP POLICY IF EXISTS "treino_update_own"      ON public.treino_logs;
DROP POLICY IF EXISTS "treino_delete_own"      ON public.treino_logs;

-- SELECT aberto para autenticados (ranking lê logs de todas as alunas)
CREATE POLICY "treino_select_all_auth"
  ON public.treino_logs FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "treino_insert_own"
  ON public.treino_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "treino_update_own"
  ON public.treino_logs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "treino_delete_own"
  ON public.treino_logs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);


-- ============================================================
-- 5. FOOD_LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.food_logs (
  id           uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  foto_url     text,
  descricao    text,
  calorias     numeric(8,2),
  proteinas    numeric(6,2),
  gorduras     numeric(6,2),
  carboidratos numeric(6,2),
  refeicao     text CHECK (refeicao IN ('cafe_manha','almoco','lanche','jantar','outro')),
  data         date,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_food_user_data ON public.food_logs(user_id, data DESC);

ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "food_select_own" ON public.food_logs;
DROP POLICY IF EXISTS "food_insert_own" ON public.food_logs;
DROP POLICY IF EXISTS "food_update_own" ON public.food_logs;
DROP POLICY IF EXISTS "food_delete_own" ON public.food_logs;

CREATE POLICY "food_select_own"
  ON public.food_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "food_insert_own"
  ON public.food_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "food_update_own"
  ON public.food_logs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "food_delete_own"
  ON public.food_logs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);


-- ============================================================
-- 6. COMMUNITY_POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.community_posts (
  id         uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  autor_nome text,
  autor_foto text,
  tipo       text CHECK (tipo IN ('refeicao','treino','evolucao','dica','geral')),
  texto      text,
  foto_url   text,
  curtidas   integer DEFAULT 0,
  pinado     boolean DEFAULT false,
  oculto     boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Colunas adicionadas depois do lançamento inicial
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS foto_url text,
  ADD COLUMN IF NOT EXISTS pinado   boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS oculto   boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_community_created ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_user    ON public.community_posts(user_id);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_select_auth"          ON public.community_posts;
DROP POLICY IF EXISTS "community_insert_own"           ON public.community_posts;
DROP POLICY IF EXISTS "community_update_own_or_admin"  ON public.community_posts;
DROP POLICY IF EXISTS "community_delete_own_or_admin"  ON public.community_posts;

CREATE POLICY "community_select_auth"
  ON public.community_posts FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "community_insert_own"
  ON public.community_posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Admin pode atualizar qualquer post (pin/hide); aluna só o próprio
CREATE POLICY "community_update_own_or_admin"
  ON public.community_posts FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR (SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()) = true
  );

CREATE POLICY "community_delete_own_or_admin"
  ON public.community_posts FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR (SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()) = true
  );


-- ============================================================
-- 7. NOTIFICACOES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id               uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  destinatario_id  uuid REFERENCES auth.users(id) ON DELETE CASCADE,  -- NULL = broadcast
  titulo           text,
  mensagem         text,
  tipo             text CHECK (tipo IN ('info','treino','nutricao','motivacao')),
  lida             boolean DEFAULT false,
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_dest_lida ON public.notificacoes(destinatario_id, lida, created_at DESC);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notif_select_own_or_broadcast" ON public.notificacoes;
DROP POLICY IF EXISTS "notif_insert_admin"            ON public.notificacoes;
DROP POLICY IF EXISTS "notif_update_own"              ON public.notificacoes;

-- Aluna vê notificações para ela ou broadcast (destinatario_id IS NULL)
CREATE POLICY "notif_select_own_or_broadcast"
  ON public.notificacoes FOR SELECT
  TO authenticated
  USING (destinatario_id IS NULL OR auth.uid() = destinatario_id);

CREATE POLICY "notif_insert_admin"
  ON public.notificacoes FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()) = true);

CREATE POLICY "notif_update_own"
  ON public.notificacoes FOR UPDATE
  TO authenticated USING (auth.uid() = destinatario_id);


-- ============================================================
-- 8. ARTIGOS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.artigos (
  id         uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  titulo     text,
  resumo     text,
  conteudo   text,
  fonte      text,
  data_pub   date,
  tags       text[] DEFAULT '{}',
  imagem_url text,
  categoria  text,
  publicado  boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artigos_pub_data ON public.artigos(publicado, data_pub DESC);

ALTER TABLE public.artigos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "artigos_select_public"     ON public.artigos;
DROP POLICY IF EXISTS "artigos_select_admin"      ON public.artigos;
DROP POLICY IF EXISTS "artigos_insert_admin"      ON public.artigos;
DROP POLICY IF EXISTS "artigos_update_admin"      ON public.artigos;
DROP POLICY IF EXISTS "artigos_delete_admin"      ON public.artigos;

CREATE POLICY "artigos_select_public"
  ON public.artigos FOR SELECT
  TO authenticated USING (publicado = true);

CREATE POLICY "artigos_select_admin"
  ON public.artigos FOR SELECT
  TO authenticated
  USING ((SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()) = true);

CREATE POLICY "artigos_insert_admin"
  ON public.artigos FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()) = true);

CREATE POLICY "artigos_update_admin"
  ON public.artigos FOR UPDATE
  TO authenticated
  USING ((SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()) = true);

CREATE POLICY "artigos_delete_admin"
  ON public.artigos FOR DELETE
  TO authenticated
  USING ((SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()) = true);


-- ============================================================
-- 9. FUNÇÃO RPC — incrementar_curtida
-- ============================================================
CREATE OR REPLACE FUNCTION public.incrementar_curtida(post_id uuid, incremento integer)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.community_posts
  SET curtidas = curtidas + incremento
  WHERE id = post_id;
$$;

GRANT EXECUTE ON FUNCTION public.incrementar_curtida TO authenticated;


-- ============================================================
-- 10. PERMISSÕES GERAIS
-- ============================================================
GRANT USAGE  ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES    IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT                  ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================
-- 11. NOVAS COLUNAS — Sprint 4.0 (nickname, autor_nickname)
-- ============================================================

-- nickname no perfil da aluna (identificador social na comunidade e ranking)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nickname TEXT;

-- autor_nickname na tabela de posts (salvo no momento da publicação)
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS autor_nickname TEXT;

-- Unique constraint para treino_logs (necessário para upsert idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'treino_logs_user_id_data_key'
      AND conrelid = 'public.treino_logs'::regclass
  ) THEN
    ALTER TABLE public.treino_logs ADD CONSTRAINT treino_logs_user_id_data_key UNIQUE (user_id, data);
  END IF;
END $$;


-- ============================================================
-- 12. SEED — 5 posts iniciais da comunidade (aparência natural)
-- ============================================================
-- Insere posts apenas se a tabela estiver vazia (evita duplicatas ao re-rodar)
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM public.community_posts) = 0 THEN
    INSERT INTO public.community_posts
      (id, user_id, autor_nome, autor_nickname, tipo, texto, curtidas, pinado, created_at)
    VALUES
      (
        uuid_generate_v4(),
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Ana Carolina',
        '@anacarolina',
        'evolucao',
        'Gente, completei meu primeiro mês no app e já perdi 3kg! O treino de pernas da semana 2 tá me matando (no bom sentido 😅). Quem mais tá nessa jornada? Vamos se ajudar! 💪',
        12,
        false,
        NOW() - INTERVAL '3 days'
      ),
      (
        uuid_generate_v4(),
        '00000000-0000-0000-0000-000000000002'::uuid,
        'Márcia Lima',
        '@marcialima',
        'refeicao',
        'Café da manhã de hoje: omelete de claras com espinafre e ricota + mix de frutas vermelhas. Simples, rápido e com 28g de proteína 🥚🍓 A IA me sugeriu e tô amando a funcionalidade de receitas!',
        8,
        false,
        NOW() - INTERVAL '1 day'
      ),
      (
        uuid_generate_v4(),
        '00000000-0000-0000-0000-000000000003'::uuid,
        'Fernanda Mello',
        '@fernandamello',
        'dica',
        'Dica de ouro pra quem tem fogacho à noite: coloca o quarto para 18°C antes de dormir e faz a respiração 4-7-8 deitada (inspira 4s, segura 7s, expira 8s). Reduziu meus episódios pela metade! Aprendi aqui nos artigos do app 🌙',
        21,
        true,
        NOW() - INTERVAL '5 days'
      ),
      (
        uuid_generate_v4(),
        '00000000-0000-0000-0000-000000000004'::uuid,
        'Claudia Rocha',
        '@claudinharocha',
        'treino',
        'Primeira semana na academia e já consigo fazer leg press sem apoiar nos suportes! Pequenas vitórias que importam 🏋️‍♀️ Pra quem tá com medo de começar: dá pra ser, sim. O treino guiado do app ajuda muito.',
        15,
        false,
        NOW() - INTERVAL '2 days'
      ),
      (
        uuid_generate_v4(),
        '00000000-0000-0000-0000-000000000005'::uuid,
        'Simone Tavares',
        '@simonetav',
        'geral',
        'Boa tarde meninas! Aproveitei o domingo para preparar as marmitas da semana: frango grelhado com batata doce e brócolis. Preparo em lote salva minha semana 🥡 Quem mais faz meal prep? Compartilha suas dicas!',
        6,
        false,
        NOW() - INTERVAL '4 hours'
      );
  END IF;
END $$;


-- ============================================================
-- FIM DA MIGRAÇÃO ✅
-- ============================================================
