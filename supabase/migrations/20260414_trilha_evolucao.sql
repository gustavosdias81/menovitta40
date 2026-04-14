-- ============================================================
-- MIGRAÇÃO: Trilha de Evolução — Menovitta 4.0
-- Data: 2026-04-14
-- Execute no SQL Editor do Supabase:
-- https://supabase.com/dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Adicionar coluna trilha_ativa na tabela planos_acao
--    Guarda qual jornada a aluna escolheu (8 sem / 90d / 180d / 360d)
ALTER TABLE planos_acao
  ADD COLUMN IF NOT EXISTS trilha_ativa TEXT DEFAULT '8sem'
    CHECK (trilha_ativa IN ('8sem', '90d', '180d', '360d'));

-- 2. Adicionar coluna data_inicio_programa
--    Registra quando a aluna iniciou o programa (base para calcular progresso)
ALTER TABLE planos_acao
  ADD COLUMN IF NOT EXISTS data_inicio_programa DATE DEFAULT CURRENT_DATE;

-- 3. Preencher registros existentes com valor padrão
UPDATE planos_acao
  SET trilha_ativa = '8sem'
  WHERE trilha_ativa IS NULL;

UPDATE planos_acao
  SET data_inicio_programa = created_at::DATE
  WHERE data_inicio_programa IS NULL;

-- 4. Confirmar
SELECT
  'Migração concluída! Colunas adicionadas: trilha_ativa, data_inicio_programa' AS status,
  COUNT(*) AS registros_atualizados
FROM planos_acao;
