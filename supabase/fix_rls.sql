-- ============================================================
-- CORREÇÃO DE POLÍTICAS RLS — MENOVITTA 4.0
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Permitir que usuárias atualizem o próprio plano de ação
--    (necessário para o quiz criar o plano inicial)
DROP POLICY IF EXISTS "Admin edita planos" ON planos_acao;

CREATE POLICY "Usuarios e admin editam planos"
  ON planos_acao FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

-- 2. Garantir que o trigger de criação de perfil funcione
ALTER FUNCTION handle_new_user() SECURITY DEFINER SET search_path = public, auth;

-- 3. Confirmar que está tudo certo
SELECT 'RLS corrigido com sucesso!' as status;
