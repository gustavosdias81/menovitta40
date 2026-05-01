# 🔒 SEGURANÇA DA ABA ADMIN — MENOVITTA 4.0

## ✅ PROTEÇÕES IMPLEMENTADAS

### 1️⃣ **Campo `is_admin` no Banco de Dados**
- **Tabela**: `profiles`
- **Campo**: `is_admin` (boolean, default: `false`)
- **Novo cadastro**: Automaticamente criado como `false`
- **Arquivo**: `src/contexts/AuthContext.tsx` linha 187
```typescript
is_admin: false,  // ← Padrão para todos os novos usuários
```

---

### 2️⃣ **Leitura do Campo no Frontend**
- **Arquivo**: `src/contexts/AuthContext.tsx` linha 217
```typescript
isAdmin: profile?.is_admin ?? false,  // ← Sempre false se não setado
```

---

### 3️⃣ **Proteção de Rota (ProtectedRoute)**
- **Arquivo**: `src/components/ProtectedRoute.tsx` linhas 29-31
```typescript
if (requireAdmin && !isAdmin) {
  return <Navigate to="/perfil" replace />  // ← Redireciona para Perfil
}
```

**Qualquer rota com `requireAdmin={true}` protegida:**
- ✅ `/admin` (AdminDashboard)
- ✅ `/admin/nova-aluna` (AddUser)
- ✅ `/admin/aluna/:userId` (EditUser)
- ✅ `/admin/artigos` (Artigos)

---

### 4️⃣ **Botão Admin em Settings (Oculto para Não-Admin)**
- **Arquivo**: `src/pages/Settings.tsx` linhas 111-125
```typescript
{isAdmin && (  // ← Só renderiza se isAdmin === true
  <button onClick={() => navigate('/admin')}>
    Painel Administrativo
  </button>
)}
```

**Se usuária é não-admin:**
- 🚫 Botão não aparece
- 🚫 Se tentar acessar `/admin` direto na URL → redireciona para `/perfil`

---

## 🔐 O QUE PRECISA SER VERIFICADO NO SUPABASE

Essas proteções de frontend são ótimas, mas o **banco de dados TAMBÉM precisa estar protegido**. No Supabase, você deve verificar:

### ✅ **RLS Policies (Row Level Security)**

#### **Tabela: `profiles`**
```sql
-- Usuária pode ler apenas seu próprio perfil
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Usuária pode atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Apenas admin pode ler TODOS os perfis
CREATE POLICY "Admin can read all profiles"
ON profiles FOR SELECT
USING (is_admin = true AND auth.uid() IN (
  SELECT user_id FROM profiles WHERE is_admin = true
));
```

#### **Tabelas que precisam RLS:**
- ✅ `food_logs` — usuária acessa apenas seus logs
- ✅ `treino_logs` — usuária acessa apenas seus logs
- ✅ `planos_acao` — usuária acessa apenas seu plano
- ✅ `anamnese_respostas` — usuária acessa apenas sua anamnese
- ✅ `community_posts` — todos podem ler, mas só autor pode editar/deletar
- ✅ `artigos` — usuárias leem (admin cria/edita)
- ✅ `notificacoes` — usuária recebe apenas suas notificações

---

## 🛡️ COMO VERIFICAR SE ESTÁ SEGURO

### Teste 1️⃣: **Frontend Seguro** ✅
1. Abra seu navegador (como admin)
2. Vá para Settings
3. Veja o botão "Painel Administrativo" → 🟢 **Correto**

### Teste 2️⃣: **Não-Admin Bloqueado (Frontend)** ✅
1. Crie uma conta de teste (não-admin)
2. Faça login
3. Vá para Settings
4. Botão "Painel Administrativo" **NÃO aparece** → 🟢 **Correto**
5. Tente acessar `/admin` na URL direto → Redireciona para `/perfil` → 🟢 **Correto**

### Teste 3️⃣: **Banco de Dados Seguro** (⚠️ PRECISA VERIFICAR)
1. Abra Supabase dashboard → seu projeto
2. Vá para **Authentication** → **Users**
3. Veja seu user_id
4. Vá para **SQL Editor** e execute:
```sql
SELECT user_id, nome, email, is_admin 
FROM profiles 
WHERE user_id = 'seu_user_id_aqui';
```
5. Confirme que seu `is_admin = true` ✅
6. Crie outro usuário de teste e confirme que `is_admin = false` ✅

---

## ⚙️ COMO PROMOVER ALGUÉM A ADMIN

### Opção 1: Via Supabase SQL Editor
```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'consultora@email.com';
```

### Opção 2: Via Admin Dashboard (futuro)
- Crie uma página `/admin/usuarios` para gerenciar quem é admin
- Lá você promove/rebaixa usuárias

---

## 📋 CHECKLIST DE SEGURANÇA

- ✅ Campo `is_admin` criado no Supabase
- ✅ Frontend protegido com `requireAdmin` nas rotas
- ✅ Botão admin oculto para não-admin
- ✅ Redireciona não-admin se tentar acessar `/admin`
- ⚠️ **RLS Policies no Supabase** — VERIFICAR/IMPLEMENTAR
- ⚠️ **Apenas você deve ter `is_admin = true`** — VERIFICAR

---

## 🚨 RISCO SE NÃO ESTIVER PROTEGIDO

Se **não existir RLS Policy no Supabase**:
- ❌ Uma aluna poderia usar ferramentas de desenvolvedor para chamar API do Supabase diretamente
- ❌ Ela conseguiria ler/modificar dados de outras alunas
- ❌ Ela conseguiria deletar posts da comunidade
- ❌ Ela conseguiria ver dados sensíveis de outras usuárias

**Solução**: Ativar RLS no Supabase (leia a seção "RLS Policies" acima)

---

## 📞 PRÓXIMOS PASSOS

1. **Hoje**: Verificar que seu user tem `is_admin = true` no Supabase
2. **Esta semana**: Implementar RLS Policies nas tabelas principais
3. **Beta testing**: Testar com um conta não-admin para confirmar bloqueios

**Documentação RLS**: https://supabase.com/docs/guides/auth/row-level-security
