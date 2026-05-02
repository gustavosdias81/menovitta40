# 📱 MENOVITTA 4.0 — DOCUMENTAÇÃO COMPLETA DAS FUNCIONALIDADES

## 🎯 Visão Geral do Produto

**Menovitta 4.0** é um aplicativo PWA (Progressive Web App) de saúde e bem-estar especializado em mulheres acima de 40 anos na fase de menopausa e pós-menopausa. O app combina inteligência artificial personalizada, rastreamento de saúde, comunidade de apoio e planos de ação estruturados para ajudar mulheres a gerenciar os desafios dessa fase da vida.

**Target**: Mulheres 40+ em transição menopáusica  
**Plataforma**: Web (PWA) — funciona no navegador de qualquer dispositivo, com suporte offline  
**Tecnologia**: React 18 + TypeScript, Supabase (banco de dados PostgreSQL), Google Gemini AI (2.0-flash-lite)  
**Disponibilidade**: PWA — pode ser instalada como app nativo no celular/desktop

---

## 🔄 FLUXO GERAL DO USUÁRIO

```
Login → Quiz de Diagnóstico → Perfil → Menu Principal (5 abas) → Features
                                        ├─ Perfil
                                        ├─ Plano (Treino + Mentalidade)
                                        ├─ Nutrição (Scanner de Pratos)
                                        ├─ Comunidade (Social)
                                        └─ Configurações
```

---

## 📍 SEÇÃO 1: LOGIN & AUTENTICAÇÃO

### 🎨 Interface Visual
- **Logo principal**: Branding Menovitta 4.0 em destaque
- **Campo de Email**: Input com validação
- **Campo de Senha**: Input com masking de caracteres
- **Botão "Entrar"**: CTA primária em rosa/dourado
- **Link "Criar Conta"**: Redireciona para signup
- **Loading state**: Spinner discreto enquanto verifica credenciais

### 🔐 Funcionalidades

#### Login (Usuária Existente)
- Validação de email e senha
- Autenticação via Supabase Auth
- Redireciona para **Perfil** (usuária já completou quiz)
- Redireciona para **Quiz** (usuária nova ou quiz incompleto)
- Mensagem de erro clara se credenciais inválidas

#### Signup (Criar Conta)
- Input de **Email** (validado, único)
- Input de **Senha** (requisitos de segurança)
- Input de **Nome** (salvo no perfil)
- Cria automaticamente linha na tabela `profiles` após signup
- Redireciona para Quiz (novo usuário)
- Mensagem de sucesso visual

### 💡 Benefício para o Usuário
_"Acesso rápido e seguro ao seu espaço personalizado de saúde. Seus dados ficam protegidos e você pode acessar em qualquer dispositivo."_

### 🎬 Descrição para Vídeo Demo
> Tela limpa e minimalista com logo da Menovitta 4.0. Usuária digita email e senha, toca em "Entrar" e é levada para seu perfil personalizado. Todo o processo leva menos de 3 segundos.

---

## 📋 SEÇÃO 2: QUIZ ONBOARDING (Diagnóstico Inicial)

### 🎯 Propósito
Coleta informações críticas para personalizar todo o app e criar um perfil de saúde preciso. O quiz é a base de toda a recomendação de IA.

### 📊 Estrutura em 4 Etapas

#### **ETAPA 1: Ciclo Menstrual**
- **Pergunta**: "Qual foi o primeiro dia de sua última menstruação?"
- **Input**: Seletor de data
- **Processamento**: Calcula:
  - **Fase atual**: Pré-menopausa (menstrua regularmente), Menopausa (irregular), Pós-menopausa (sem menstruação há 12+ meses)
  - **Tempo até menopausa** (se pré-menopausa)
  - **Dias desde menstruação** (base para análise de sintomas cíclicos)

**Por que importa**: Cada fase tem diferentes recomendações de dieta, exercício e manejo de sintomas.

#### **ETAPA 2: Sintomas**
- **Pergunta**: "Quais sintomas você está vivenciando? (Selecione ao menos 1)"
- **Opções** (com emojis):
  - 🔥 Fogachos (sudden hot flashes)
  - 😴 Insônia (sleep disruption)
  - 📈 Ganho de peso (weight gain)
  - 💪 Falta de energia (fatigue)
  - 🧠 Névoa mental (brain fog)
  - 😰 Ansiedade
  - 😢 Oscilações de humor
  - 💔 Baixa libido (decreased sexual desire)
  - 🦴 Dor articular (joint pain)
- **Validação**: Impede avanço sem selecionar pelo menos 1 sintoma
- **3D Button Effect**: Cada opção tem efeito visual 3D (shadow + translate on click)

**Por que importa**: Sintomas determinam recomendações de IA, exercícios prioritários e conteúdo focado.

#### **ETAPA 3: Saúde (Condições Pré-existentes)**
- **Pergunta**: "Você tem algumas dessas condições de saúde? (Selecione ao menos 1)"
- **Opções**:
  - 🩺 Hipertensão (high blood pressure)
  - 🍬 Diabetes
  - 💚 Colesterol alto
  - 🦴 Osteoporose
  - 🫀 Problemas cardiovasculares
  - 🫁 Problemas respiratórios
  - Nenhuma das anteriores (legítima — muitas mulheres saudáveis)
- **Validação**: Selecionar "Nenhuma" bloqueia seleção de outras; vice-versa
- **3D Button Effect**: Mesmo tratamento visual que Etapa 2

**Por que importa**: Garante segurança — recomendações de exercício/nutrição consideram limitações de saúde.

#### **ETAPA 4: Alimentação (Preferências e Restrições)**
- **Pergunta**: "Qual é sua preferência ou restrição alimentar? (Selecione ao menos 1)"
- **Opções**:
  - 🥗 Vegetariana
  - 🌱 Vegana
  - 🚫 Intolerância ao lactose
  - 🌾 Sem glúten (celíaca ou sensibilidade)
  - Nenhuma restrição (meat-eater, sem alergias)
- **3D Button Effect**: Padrão visual consistente
- **Validação**: Selecionar "Nenhuma" bloqueia outras

**Por que importa**: O app recomenda refeições, receitas (futuro) e macros alinhados com essas restrições.

### 🎬 Tela Final (Motivacional)
Após completar as 4 etapas:
- **Mensagem personalizada**: "Pronto, [Nome]! Vamos começar sua jornada?"
- **Ícone de celebração**: Confetti ou animação positiva
- **CTA Botão**: "Próximo → Saúde-Info" (leva ao **Perfil** → **HealthInfo**)
- **Fundo inspirador**: Gradiente em cores da marca (rosa + ouro)

### 💡 Benefício para o Usuário
_"Um quiz rápido (2-3 minutos) que personaliza TUDO no app. Sem respostas genéricas — cada recomendação é feita especificamente para você."_

### 🎬 Descrição para Vídeo Demo
> Usuária toca em botões coloridos representando seus sintomas (fogachos, insônia). A interface é intuitiva com emojis grandes. Progride por 4 telas em sequência. Na final, recebe mensagem motivacional celebrando o início da jornada. **Tempo total: ~2 minutos.**

---

## 👤 SEÇÃO 3: PERFIL (Meus Dados)

### 🎯 Propósito
Tela de resumo pessoal. Mostra dados coletados no quiz + IMC calculado. Ponto de acesso para outras features.

### 📊 Dados Exibidos

| Campo | Fonte | Descrição |
|-------|-------|-----------|
| **Nome** | Quiz/Signup | "Olá, [Nome]!" |
| **Email** | Supabase Auth | Verificado no login |
| **Fase Menopáusica** | Quiz etapa 1 | Pré / Meno / Pós |
| **Peso (kg)** | Manual (editar) | Rastreado para evolução |
| **Altura (cm)** | Manual (editar) | Cálculo de IMC |
| **IMC** | Calculado | `(peso / altura²) × 10000` |
| **Objetivo** | Manual (editar) | "Emagrecer", "Ganhar massa", "Manter saúde" |

### 🎨 Layout Visual
- **Header**: "Meu Perfil" + ícone de usuária (avatar placeholder)
- **Card Principal**: Exibe foto + nome + fase (badge colorida)
- **Stats Grid** (2×3):
  - Peso | Altura
  - IMC | Objetivo
  - Fase | Última atualização
- **Banner Cards** (2 cards com efeito 3D):
  - 🏥 **Informações da Sua Fase** → Leva a **HealthInfo**
  - 📋 **Plano de Ação** → Leva a **ActionPlan**
- **Botão Edit**: Permite editar peso, altura, objetivo (modal)
- **Loading State**: Spinner discreto enquanto carrega dados

### 🔄 Padrão de Cache (Stale-While-Revalidate)
1. **Etapa 1** (Instantâneo): Mostra dados do localStorage se disponível
2. **Etapa 2** (Background): Busca dados frescos do Supabase
3. **Etapa 3**: Atualiza tela e cache quando dados frescos chegam
4. **Timeout de segurança**: Se demora mais de 3 segundos, mostra dados em cache (não congela a tela)

**Benefício**: Usuária nunca vê tela branca vazia — sempre há algo a exibir.

### 💡 Benefício para o Usuário
_"Seu dashboard de saúde centralizado. Veja seu progresso de IMC, entenda sua fase atual e acesse rapidamente as próximas etapas da sua jornada."_

### 🎬 Descrição para Vídeo Demo
> Tela mostra nome da usuária, peso, altura, IMC calculado em tempo real. Dois cards grandes chamam atenção: "Informações da Sua Fase" e "Plano de Ação". Usuária toca em um dos cards e é levada para a próxima feature.

---

## 🏥 SEÇÃO 4: SAÚDE-INFO (Informações da Sua Fase)

### 🎯 Propósito
Educação personalizada sobre a fase menopáusica atual. Combina:
1. **IA Personalizada**: Conselhos gerados por Gemini baseados em fase + sintomas
2. **Cartões Informativos**: Conteúdo estruturado sobre a fase
3. **Motivação**: Hero image + mensagem inspiradora

### 🎨 Layout Visual

#### **Section 1: Hero Banner**
- **Imagem de fundo**: Fase-específica (pastel suave, inspirador)
- **Overlay com gradiente**: Rosa/Ouro
- **Título**: "Informações da Sua Fase"
- **Subtítulo**: "Pré-menopausa", "Menopausa" ou "Pós-menopausa"
- **Descrição breve**: "Você está na fase X. Aqui estão informações personalizadas para você."
- **Botão voltar** (← seta): Retorna a **Perfil**

#### **Section 2: IA Personalizada (5 Cartões Dinâmicos)**
- **Título**: "Dicas IA Menovitta para sua fase"
- **Como funciona**: 
  - Usa modelo **Gemini 2.0-flash-lite** (gratuito, 1500 RPM)
  - Gera 5 tópicos baseado em: fase + sintomas + objetivo
  - Exemplo input IA: _"Mulher em pós-menopausa com fogachos e insônia, objetivo: emagrecimento"_
  - Exemplo output IA: _"Cardio moderado à noite (não antes de dormir)", "Aumentar proteína no café", "Meditação 10min antes de cama"_
- **Cada cartão**:
  - Ícone (emoji contextual)
  - Título (topic)
  - Descrição (1-2 linhas)
  - Clicável → expande modal com detalhe completo
- **Cache**: Armazenado em localStorage por `user_id + fase + objetivo`
- **Loading state**: Spinner + "Gerando dicas personalizadas..."
- **Error state**: "IA está um pouco ocupada" (429 quota) ou "Erro ao gerar dicas" com botão "Tentar novamente"

**Por que IA é importante**: Cada mulher é única. Em vez de conteúdo genérico, Menovitta gera recomendações especificamente para SUA situação.

#### **Section 3: Cartões Informativos da Fase (3-5 cartões)**
Cada fase (Pré/Meno/Pós) tem diferentes cartões pré-estruturados:

**Exemplo — Pós-menopausa**:
- 🧬 "O que é Pós-menopausa?" → Modal com definição + duração
- 💊 "Hormônios na Pós-menopausa" → Explicação de estrógeno/progesterona
- 🫀 "Saúde Cardiovascular" → Risco aumentado, prevenção
- 🦴 "Osteoporose" → Perda óssea, cálcio, exercício de peso
- 🧘 "Bem-estar Emocional" → Depressão, ansiedade, apoio

**Design**: 3D button effect
- Sombra colorida (rosa/ouro)
- On click: translate-y-1 (desce 4px)
- Cursor pointer
- Transição suave

**Modal ao clicar**:
- Fechar (X) no topo-direito
- Título grande
- Conteúdo formatado (parágrafos + lista)
- Rodapé com emoji representativo

### 💡 Benefício para o Usuário
_"Entenda sua fase atual com conselhos personalizados por IA. Saiba exatamente o que esperar e como se cuidar agora."_

### 🎬 Descrição para Vídeo Demo
> Tela colorida mostra imagem de fundo (tema menopausa). Abaixo, 5 cartões com dicas geradas por IA aparecem um por um (animação). Usuária clica em um cartão → abre modal com informação detalhada. Mostra também cartões informativos pré-estruturados. **Tempo: ~45 segundos** para mostrar 2-3 dicas.

---

## 📋 SEÇÃO 5: PLANO DE AÇÃO (3 sub-abas)

### 🎯 Propósito
Plano prático de execução com 3 pilares: Exercício + Mentalidade + Sono.

---

### 📍 ABA 1: TREINO (Exercise Planning)

#### 🎯 Funcionalidade
Estrutura exercícios em **trilhas** (8 semanas, 12 semanas ou customizável). Mostra:
- Semana atual (ex: "Semana 1 de 8")
- Breakdown diário com exercícios específicos
- **Duração** de cada exercício
- **Local** (Academia vs. Casa — importante para mulheres com limitações)
- ✅ **Checklist**: Marca como concluído durante o exercício
- 💾 **Botão "Marcar Treino Concluído"**: Salva na tabela `treino_logs` do banco
- 📊 **Participação no Ranking**: Cada treino conta para ranking mensal da comunidade

#### 🎨 Layout Visual
- **Card por dia** (Sex, Sab, Dom, etc.)
- **Título exercício** (ex: "Caminhada leve")
- **Meta duração** (ex: "30 min")
- **Local** (Academia 🏢 ou Casa 🏠)
- **Checklist** (usuária marca conforme executa)
- **Botão salvar** (com validação — seleciona pelo menos 1 exercício)
- **Success message**: "Treino salvo com sucesso! ✅"
- **Efeito 3D**: Botão tem shadow rosa/ouro

#### 🔄 Persistência
- **Estado local**: Checkboxes salvos em localStorage por data
- **Estado persistente**: Treino marcado como concluído vai para banco (treino_logs)
- **Cada login**: Checkboxes recarregam automaticamente (stale-while-revalidate)

#### 💡 Benefício para o Usuário
_"Um plano de exercício estruturado. Você sabe exatamente o que fazer cada dia, quanto tempo leva e onde fazer. Marca como feito e participa do ranking da comunidade."_

#### 🎬 Descrição para Vídeo Demo
> Mostra calendário semanal com 7 cartões (um por dia). Cada cartão liste exercício, duração, local. Usuária marca checkboxes enquanto se exercita. Toca "Marcar Treino Concluído". Tela exibe "Treino salvo!" com animação. **Tempo: ~30 segundos.**

---

### 📍 ABA 2: MENTALIDADE (Mental Health + Sleep Hygiene)

#### 🎯 Funcionalidade
**Sub-Tab 1: Práticas Mentais**
- **Accordion list** de práticas:
  - 🧘 Meditação (5, 10, 20 min)
  - 🌬️ Respiração (técnicas específicas)
  - 🙏 Gratidão (journaling)
  - 🎵 Mindfulness
  - 📖 Leitura meditativa
- **Clique**: Abre modal com:
  - Instruções passo-a-passo
  - Duração sugerida
  - Benefícios específicos para menopausa
  - Imagem ou ícone representativo

**Sub-Tab 2: Higiene do Sono**
- **Hero title**: "Criando Sua Rotina de Sono"
- **Video Player**: Vídeo H.264 (MP4) hospedado em Supabase Storage
  - Mostra técnicas práticas para dormir melhor
  - Duração ~5-10 min
- **Checklist Sono** (6 itens com horários):
  - 20h00 — Desligue telas
  - 20h30 — Ambiente escuro e fresco
  - 21h00 — Chá de camomila (ou relax)
  - 21h30 — Meditação guiada (5-10 min)
  - 22h00 — Deitar na cama
  - 22h30 — Dormir (meta)
- **Efeito 3D**: Sub-tabs têm purple shadow, translate-y-1 on click

#### 🎨 Layout Visual
- **Tab buttons** (Práticas Mentais | Higiene do Sono) com 3D effect
- **Accordion** ou **List** com práticas expandíveis
- **Video player** com controls (play, pause, progress bar)
- **Checklist com inputs** (checkbox ou toggle)
- **Button salvar** para marcar higiene como concluída

#### 💡 Benefício para o Usuário
_"Técnicas práticas para dormir melhor e reduzir estresse. Insônia é um dos maiores sintomas da menopausa — este plano ajuda a recuperar qualidade de sono."_

#### 🎬 Descrição para Vídeo Demo
> Mostra sub-tabs coloridas. Toca em "Práticas Mentais" → accordion abre com lista de práticas. Clica em uma → modal abre com instruções. Volta. Toca em "Higiene do Sono" → aparece vídeo player com título "Criando Sua Rotina de Sono". Usuária pode assistir (mostra 10 segundos do vídeo). Abaixo, checklist de horários para preparar o sono. **Tempo total: ~1 min.**

---

### 📍 ABA 3: (REMOVED)
A aba anterior de "Sugestões IA" (receitas) foi removida. Apenas **Treino** e **Mentalidade** permanecem no **Plano de Ação**.

---

## 🍽️ SEÇÃO 6: NUTRIÇÃO (Food Scanner + Macro Tracking)

### 🎯 Propósito
**Scanner de IA para fotos de comida**. Você fotografa seu prato → IA analisa → retorna calorias e macros. Rastreia consumo diário contra metas metabólicas personalizadas.

### 🎨 Layout Visual

#### **Section 1: Seu Dia (Daily Summary)**
- **Título**: "Seu Dia"
- **4 Progress Bars** (Kcal, Proteína, Gordura, Carboidrato):
  ```
  Kcal: ████████░░ 1800 / 2000 (90%)
  Prot: ██████░░░░ 120g / 150g (80%)
  Gord: █████░░░░░ 50g / 65g (77%)
  Carb: ███████░░░ 200g / 250g (80%)
  ```
  - **Cores dinâmicas**:
    - Verde (0-70% de meta) — abaixo da meta
    - Amarelo (70-100% de meta) — próximo de completar
    - Laranja (100-120% de meta) — ligeiramente acima
    - Vermelho (120%+) — acima de meta
- **Grid 2×2** abaixo mostrando consumido vs. meta
- **Dica Menovitta Box** (contextual):
  - Se 0 consumido: _"Comece registrando seu café da manhã"_
  - Se abaixo meta: _"Faltam 300 kcal para sua meta. Que tal um lanche?"_
  - Se acima meta: _"Ultrapassou 200 kcal hoje. Sem problema — amanhã é novo dia!"_

#### **Section 2: Scanner de Pratos (Image Analysis)**
- **Título**: "Scanner de Pratos"
- **Subtitle**: "Fotografe seu prato e descubra os macros"
- **Input buttons**:
  - 📷 "Tirar Foto" (acessa câmera do dispositivo)
  - 🖼️ "Escolher da Galeria" (seleciona imagem salva)
- **Image Preview**:
  - Mostra foto selecionada em grande
  - Botão X para remover e escolher outra
- **Botão "Analisar"** (com loading state):
  - Envia foto para Gemini Vision API
  - Retorna: descrição, calorias, proteínas, gorduras, carboidratos, fibras, confiança (%), dica menopausa
  - Loading: _"Analisando prato... (pode levar 5-10 segundos)"_
  - Exemplo resposta:
    ```
    Arroz integral com frango grelhado e brócolis
    Kcal: 450
    Proteína: 35g
    Gordura: 12g
    Carboidrato: 45g
    Fibras: 5g
    Confiança: 92%
    💡 Dica: Alto em proteína — ótimo para saciedade na menopausa!
    ```
- **Botão "Salvar Refeição"**:
  - Adiciona à tabela `food_logs` com timestamp
  - Atualiza progress bars em "Seu Dia" em tempo real
  - Success message: _"Refeição salva! ✅"_
  - CTA: "Escanear outra" ou voltar para summary
- **Error handling**:
  - Se conexão falha: _"Sem internet. Tente novamente."_
  - Se quota Gemini excedida (429): _"IA está ocupada. Tente em alguns minutos."_
  - User-friendly — nunca mostra código de erro bruto

#### **Section 2.5: Receitas IA Personalizadas**
- **Título**: "Receitas do Dia"
- **Subtitle**: "1 receita por refeição, gerada especialmente para você"
- **Tabs para horários** (4 abas):
  - ☀️ Café da Manhã
  - 🌤️ Almoço
  - 🌥️ Café da Tarde
  - 🌙 Jantar
- **Fluxo**:
  1. Usuária clica em uma aba (ex: Almoço)
  2. Se vazio → botão "Gerar Receita"
  3. IA Menovitta 4.0 gera receita personalizada com prompt:
     - Contexto da fase menopáusica
     - Tipo de refeição
     - Prioridade: alta proteína, anti-inflamatório, máx 20min preparo
  4. Retorna Receita com:
     - Nome (ex: "Omelete com Espinafre")
     - Descrição (1 frase)
     - Tempo de preparo (ex: "10 min")
     - Macros: Calorias, Proteína, Gordura, Carboidratos
     - Imagem (Unsplash dinâmica baseada no termo da receita)
     - Ingredientes (expandível)
     - Modo de preparo (expandível)

- **Cards de macros**:
  - Grid 2×2 mostrando Kcal, Proteína, Gordura, Carbos
  - Mesmo estilo dos cards em "Seu Dia"

- **Botões**:
  - "Gerar Outra Receita" (revalida com Gemini, nova receita)
  - "Salvar Receita" → adiciona à `food_logs` com os macros
    - Atualiza progress bars em "Seu Dia" em tempo real
    - Success: _"Refeição salva!"_

- **Cache**:
  - localStorage: `menovitta_receitas_{user_id}_{data}`
  - TTL: 1 dia (reseta ao virar a meia-noite)
  - Cada horário é cacheado independentemente
  - Offline: mostra receita em cache

### 💡 Benefício para o Usuário (Receitas)
_"Não sabe o que comer? A IA Menovitta 4.0 gera 1 receita saudável por refeição, adaptada ao seu peso, fase menopáusica, e objetivo. Clique 'Salvar' e as calorias/macros já estão no seu dia. Nenhuma contagem manual."_

### 🎬 Descrição para Vídeo Demo (Receitas)
> Usuária clica na aba "Almoço" → botão "Gerar Receita". Clica → spinner (5-10 segundos). IA retorna: "Filé de Salmão com Brócolis e Batata-doce" com imagem linda do Unsplash, 430 kcal, 40g proteína. Ingredientes e modo de preparo vêm fechados (com seta). Clica seta → expande lista de ingredientes. Depois clica "Salvar" → macros aparecem em "Seu Dia" e barras de progresso atualizam. **Tempo: ~1 min.**

---

#### **Section 3: Ainda Faltam Hoje / Ultrapassou Hoje**
- **Condicional**: Só mostra se há gap ou overage
- **Layout**: Grid 2×2 mostrando macros faltantes (ou excedentes)
- **Cores**: Verde para faltante, vermelho para excesso
- **Exemplo**:
  ```
  Faltam Hoje
  Kcal: 200  |  Prot: 30g
  Gord: 15g  |  Carb: 50g
  ```

#### **Section 4: Orientações Nutricionais da Sua Fase**
- **Hero image banner** (fase-específica)
- **Expandable card**:
  - Click para expandir → mostra:
    - **Dicas nutricionais** (3-5 pontos)
    - **Alimentos recomendados** (lista)
    - **Alimentos a evitar** (lista)
  - Exemplo Pós-menopausa:
    - ✅ Recomendados: Peixes gordos (ômega-3), laticínios (cálcio), verduras escuras (ferro)
    - ❌ Evitar: Alimentos ultraprocessados, álcool, açúcar refinado

### 💡 Benefício para o Usuário
_"Não precisa contar calorias manualmente. Fotografe seu prato, IA calcula tudo. Veja em tempo real se está dentro de sua meta metabólica personalizada."_

### 🎬 Descrição para Vídeo Demo
> Usuária toca "Tirar Foto" → câmera abre. Fotografa prato de comida (almôço com arroz, frango, verdura). Preview mostra a foto. Clica "Analisar" → spinner (4 segundos). Retorna: "Frango com arroz integral e brócolis — 450 kcal, 35g proteína, 45g carboidrato." Botão "Salvar" → progress bars no topo atualizam em tempo real. Success message. **Tempo total: ~45 segundos.**

---

## 👥 SEÇÃO 7: COMUNIDADE (Social + News + Ranking)

### 🎯 Propósito
Conectar mulheres em jornada similar. Compartilhar vitórias, apoiar-se mutuamente, competir amigavelmente em ranking.

---

### 📍 ABA 1: FEED (Publicações Sociais)

#### 🎯 Funcionalidade
- **Timeline social** de posts de usuárias
- **5 tipos de posts**: 🍽️ Refeição | 💪 Treino | 📈 Evolução | 💡 Dica | 💬 Geral
- **Dados por post**:
  - Avatar + Nome da autora
  - Tipo (badge colorida)
  - Texto da publicação
  - Foto (opcional)
  - Timestamp (ex: "há 2 horas")
  - ❤️ Curtidas (contador atualizado em tempo real)
- **Like button**: Toca para curtir/descurtir via RPC function `incrementar_curtida()`
- **Cache**: Armazenado em localStorage, recarrega com stale-while-revalidate

#### ✍️ Criar Publicação (Modal)
- **Botão "Nova publicação"** (flutuante ou superior)
- **Modal criação**:
  - **Tipo selector** (dropdown com 5 opções)
  - **Texto input** (textarea)
  - **Foto opcional** (upload ou câmera)
  - **Botão Publicar** (com loading)
  - **Success**: _"Publicado com sucesso!"_ + volta ao feed
  - **Error**: Mensagem user-friendly com retry

#### 👑 Admin Features (se `isAdmin = true`)
Cada post mostra 3 botões para moderadores:
- 📌 **Pin/Unpin**: Fixa post em destaque
- 👁️ **Hide/Show**: Oculta de usuárias (removido da timeline)
- 🗑️ **Delete**: Remove permanentemente

#### 🎨 Layout Visual
- **Header**: "Comunidade" + 🔔 bell (notificações)
- **Tab bar**: Feed | Notícias | Ranking
- **Post card**:
  - Avatar círculo (left)
  - Nome + "há X" (top)
  - Tipo badge (colorida, ex: 🍽️ Refeição)
  - Texto em 1-2 linhas
  - Foto (se houver) — thumbnail
  - Footer: ❤️ [count] likes
- **Stacked posts** (scroll vertical)

#### 💡 Benefício para o Usuário
_"Veja o que outras mulheres estão fazendo. Compartilhe sua vitória. Sinta-se apoiada por uma comunidade que entende sua fase da vida."_

#### 🎬 Descrição para Vídeo Demo
> Tela mostra 3-4 posts no feed. Primeiro post: "Completei meu treino hoje! 💪" com 24 curtidas. Usuária toca coração → número sobe para 25. Toca "Nova publicação" → modal abre. Seleciona tipo "Refeição", digita "Salada gostosa!", tira foto, publica. Post aparece no topo do feed. **Tempo: ~1 min.**

---

### 📍 ABA 2: NOTÍCIAS (Artigos Científicos)

#### 🎯 Funcionalidade
- **Timeline de artigos** sobre menopausa, saúde, nutrição
- **Dados por artigo**:
  - Título
  - Categoria (badge)
  - Resumo (excerpt 2-3 linhas)
  - Imagem de capa (thumbnail)
  - Data de publicação
- **Clique**: Expande modal com:
  - Título grande
  - Conteúdo completo
  - Fonte/citação (link para artigo original)
  - Data de publicação
  - Fechar (X)

#### 📚 Conteúdo
- **Fallback articles** (pré-estruturados no código):
  - "Fogachos: Causas e Soluções Naturais"
  - "Nutrição na Menopausa: Alimentos Que Ajudam"
  - "Exercício Físico Reduz Sintomas Menopáusicos"
  - "Sono e Menopausa: Estratégias Que Funcionam"
  - Etc.
- **Admin pode adicionar artigos** via dashboard futuro

#### 💡 Benefício para o Usuário
_"Fique informada com conteúdo científico revisado. Artigos curtos e práticos sobre temas relevantes à sua fase."_

#### 🎬 Descrição para Vídeo Demo
> Mostra 3-4 artigos listados. Cada um com imagem, título, resumo. Usuária toca em um → modal abre com conteúdo completo e link para fonte. Toca X para fechar. **Tempo: ~30 segundos.**

---

### 📍 ABA 3: RANKING (Leaderboard Mensal)

#### 🎯 Funcionalidade
- **Top 10 mulheres** do mês baseado em **treinos completados**
- **Dados por usuária**:
  - Posição (1º, 2º, 3º... 10º)
  - Avatar (placeholder ou foto)
  - Nome (ou primeiro nome)
  - Número de treinos completados
  - 🏆 Troféu emoji (1º lugar)
- **Atualização**: Mensal (reseta em 1º de cada mês)
- **Motivação**: Gamificação leve — "veja quem está se movimentando este mês!"

#### 📊 Cálculo
- Conta todos os registros em `treino_logs` com `data >= primeiro dia do mês`
- Agrupa por `user_id`, ordena por count DESC
- Top 10 com nomes + avatares

#### 💡 Benefício para o Usuário
_"Veja quem está sendo mais ativa. Isso motiva você a manter consistência. Competição amigável, sem pressão."_

#### 🎬 Descrição para Vídeo Demo
> Mostra ranking com 10 usuárias listadas. #1 tem 🏆. Usuária pode ver que está em #5 com 12 treinos. Motivação visual: "Se eu fazer mais 3 treinos, entro no top 3!" **Tempo: ~20 segundos.**

---

### 🔔 Notificações (Integrado em Community)

#### Funcionalidade
- **Bell icon** no header do Community
- **Click**: Abre modal com notificações não-lidas
- **Tipos de notificações**:
  - Alguém curtiu seu post
  - Novo artigo publicado
  - Você entrou no ranking
  - Mensagem de admin (ex: manutenção)
- **Mark as read**: Clique marca como lida
- **Badge**: Número de não-lidas no ícone do sino

---

## ⚙️ SEÇÃO 8: CONFIGURAÇÕES (Settings)

### 🎯 Propósito
Acesso rápido a conta, suporte e legal. Logout.

### 🎨 Layout Visual
- **Header**: "Configurações"
- **Seções** com scroll vertical:

#### **Seção 1: Conta**
- 👤 "Meu Perfil" → Link para `/perfil` (✏️ editar dados)
- 🔔 "Notificações" → Link para `/notificacoes` (⏰ lembretes de treino)

#### **Seção 2: Suporte**
- 💬 "Falar no WhatsApp" → Abre WhatsApp com número pré-preenchido
  - Mensagem automática: _"Oi! Sou [Nome], usuária do Menovitta. Tenho uma dúvida..."_
  - Número: Configurável via `VITE_SUPPORT_WHATSAPP` env var
  - Exemplo: `https://wa.me/5531987654321?text=...`
- ❓ "Perguntas Frequentes" → Badge "Em breve"

#### **Seção 3: Legal**
- 📋 "Termos de Uso" → Link (placeholder)
- 🔒 "Política de Privacidade" → Link (placeholder)

#### **Admin Badge** (condicional)
Se `isAdmin = true`:
- 👑 Badge gold com "Painel Administrativo"
- Navega para `/admin` (dashboard de moderação)

#### **Logout Button**
- Texto vermelho + ícone LogOut
- Clica → Modal de confirmação: _"Tem certeza?"_
- Sim → Desconecta, limpa localStorage, volta para Login

### 💡 Benefício para o Usuário
_"Configurações rápidas, suporte ao alcance de um clique, logout seguro."_

---

## 🔔 SEÇÃO 9: NOTIFICAÇÕES (Push Notifications)

### 🎯 Propósito
Aumentar retenção através de lembretes diários personalizados de treino. Usuária define o horário que treina, recebe notificação naquele horário para manter a consistência.

### 🎨 Layout Visual
**Página: `/notificacoes`**

```
┌────────────────────────────────────┐
│ Notificações de Treino             │
│ Receba lembretes para não perder   │
│ seus treinos                       │
├────────────────────────────────────┤
│ 🔔 Permissão de Notificações       │
│   ❌ Desativadas                    │
│   [Conceder]                       │
│   💡 Se recusar aqui, abra         │
│   configurações do navegador       │
├────────────────────────────────────┤
│ 🕐 Horário do Treino               │
│   [Seletor de Horário: 06:30]      │
│   Receba lembrete neste horário    │
│   todos os dias                    │
├────────────────────────────────────┤
│ Status das Notificações            │
│   ✅ Ativadas                       │
│   Lembrete diário às 06:30         │
│   [Toggle: ON]                     │
├────────────────────────────────────┤
│ Ações                              │
│ [🧪 Testar Notificação]            │
│ [✅ Salvar Preferências]           │
├────────────────────────────────────┤
│ ℹ️ Como funciona                   │
│  • Notificações enquanto app       │
│    aberto (PWA local)              │
│  • Seu horário sincroniza          │
│  • Pode desativar a qualquer       │
│    momento                         │
└────────────────────────────────────┘
```

### 🔐 Funcionalidades

#### **1. Solicitar Permissão**
- Clique em **"Conceder"** → Navegador solicita permissão
- Uma vez concedida: exibe "✅ Ativadas"
- Se recusar: mostra aviso "💡 Configurações do navegador"

#### **2. Definir Horário do Treino**
- **Input**: Time picker `<input type="time">`
- **Padrão**: 06:30
- **Salvo em**: `profiles.horario_treino` (formato HH:MM)
- **Sincronizado**: Todos os devices do usuário

#### **3. Toggle Ativar/Desativar**
- **ON**: Recebe notificação diária no horário agendado
- **OFF**: Sem notificações, mas preferência é salva
- **Estado**: `profiles.notif_treino_ativada` (boolean)

#### **4. Testar Notificação**
- Botão **"🧪 Testar Notificação"**
- Envia notificação imediatamente
- Ajuda a confirmar que permissão funciona

#### **5. Salvar Preferências**
- Clique **"✅ Salvar Preferências"**
- Valida: permissão concedida? horário válido?
- Salva em banco: `profiles.horario_treino` + `profiles.notif_treino_ativada`
- Agenda notificação automática (via `agendarNotificacaoDiaria()`)
- Redireciona para Settings após sucesso

### 💻 Implementação Técnica

#### **Arquivos**
- `src/pages/NotificationSettings.tsx` — UI principal
- `src/lib/notifications.ts` — Utilitários de notificação
- `src/hooks/useNotificationScheduler.ts` — Hook de agendamento

#### **Funções Core**

**1. `requestNotificationPermission()`**
```typescript
// Solicita permissão ao navegador
// Retorna: true (concedida) | false (negada/bloqueada)
```

**2. `getNotificationPermission()`**
```typescript
// Retorna status: 'granted' | 'denied' | 'default'
```

**3. `agendarNotificacaoDiaria(horario, titulo, opcoes)`**
```typescript
// horario: formato "HH:MM" (ex: "06:30")
// Calcula tempo até próximo disparo
// Se já passou hoje, agenda para amanhã
// Usa setTimeout para primeiro disparo + setInterval para repetição (24h)
```

**4. `enviarNotificacao(titulo, opcoes)`**
```typescript
// Envia notificação imediata
// Auto-fecha após 5 segundos
// onClick → foca janela do app
```

**5. `testarNotificacao()`**
```typescript
// Envia notificação de teste imediatamente
// Para debug/confirmação de permissão
```

#### **Fluxo de Agendamento**
1. Usuária faz login → `useNotificationScheduler()` executa
2. Hook verifica: `profile.notif_treino_ativada === true`?
3. Se sim → chama `agendarNotificacaoDiaria(horario)`
4. App calcula: "tempo até 06:30 amanhã" (se passou)
5. `setTimeout` dispara primeiro lembrete
6. `setInterval` repete a cada 24h

#### **Banco de Dados**
Novos campos na tabela `profiles`:
```sql
horario_treino VARCHAR(5)  -- Formato "HH:MM", padrão "06:30"
notif_treino_ativada BOOLEAN  -- Default: false
```

### 📱 Comportamento em Diferentes Plataformas

| Plataforma | Comportamento | Observações |
|------------|---------------|-------------|
| **Desktop** | Notificação visual no canto | Funciona enquanto navegador aberto |
| **Mobile PWA** | Notificação nativa no topo | Funciona enquanto app aberto |
| **Mobile Web** | Notificação visual em-app | Limitado (não funciona com app fechado) |

### 🚀 Roadmap Futuro

**Fase 1 (Atual)**: Notificações locais (PWA — app aberto)  
**Fase 2 (Monetização)**: Web Push + Service Worker (24/7)  
**Fase 3 (Enterprise)**: Firebase Cloud Messaging (iOS/Android nativo)

### 💡 Benefício para o Usuário
_"Nunca mais esqueça seus treinos! Um lembrete personalizado todos os dias no horário que você escolher. Aumento de retenção comprovado em apps de fitness."_

### 🎬 Descrição para Vídeo Demo
> Usuária entra em Configurações → Notificações. Clica "Conceder" permissão. Define horário: 07:00. Toca "Testar Notificação" → recebe lembrete imediato: "⏰ Hora do Treino! Seu treino está esperando por você 💪". Clica em "Salvar Preferências" e volta para o app.

---

## 🎯 SEÇÃO 10: ADMIN DASHBOARD

*(Mencionado em Settings, mas ainda em desenvolvimento)*

**Será usado para**:
- Moderar posts (pin, hide, delete)
- Visualizar estatísticas (total de usuárias, posts, treinos)
- Gerenciar artigos (criar, editar, publicar)
- Gerenciar notificações (enviar para todas ou grupo)
- Marcar usuárias como admin/ativas

---

## 📊 RESUMO DE DADOS & FLUXO

### Tabelas do Banco (Supabase PostgreSQL)

| Tabela | Colunas principais | Propósito |
|--------|-------------------|-----------|
| `profiles` | user_id, nome, email, peso, altura, fase, objetivo, quiz_completo, is_admin, ativo, horario_treino, notif_treino_ativada | Dados pessoais + role + notif prefs |
| `anamnese_respostas` | user_id, ciclo_menstrual, sintomas, saude, alimentacao | Quiz responses |
| `planos_acao` | user_id, trilha (8w/12w), semana_atual | Exercise plan state |
| `treino_logs` | user_id, data, foco, duracao, local | Logs de exercícios |
| `food_logs` | user_id, data, descricao, kcal, prot, gord, carb, fibras | Logs nutricionais |
| `community_posts` | id, user_id, tipo, texto, curtidas, pinado, oculto | Social posts |
| `artigos` | id, titulo, resumo, conteudo, categoria, data_pub, publicado | News articles |
| `notificacoes` | id, destinatario_id, titulo, mensagem, tipo, lida | Notifications |

### Cache Strategy (LocalStorage)

| Chave | TTL | Propósito |
|-------|-----|-----------|
| `menovitta_profile_{user_id}` | ∞ (until logout) | Perfil do usuário |
| `menovitta_exercicios_{user_id}_{date}` | 1 dia | Checkboxes de treino |
| `menovitta_community_posts` | 1 hora | Posts feed |
| `menovitta_saude_info_{user_id}_{phase}` | 1 dia | IA tips |
| `quiz_done_{user_id}` | ∞ (until new quiz) | Quiz completion flag |

---

## 🎬 SCRIPT DE VÍDEO DE DEMONSTRAÇÃO (1-2 min)

```
[INTRO - 5s]
"Conhece Menovitta 4.0? É o app que entende sua menopausa."

[LOGIN - 10s]
Mostra tela de login limpa. Usuária digita email e senha. Toca "Entrar".

[QUIZ - 20s]
Passa rapidamente pelas 4 etapas:
- Seleção de data de última menstruação
- Emojis de sintomas (fogachos, insônia, ganho de peso)
- Seleção de condições de saúde
- Restrições alimentares

[PROFILE - 10s]
Tela mostra nome, peso, altura, IMC calculado. Dois cards grandes:
"Informações da Sua Fase" e "Plano de Ação".

[HEALTH INFO - 15s]
Mostra hero image. Scroll revela 5 dicas IA geradas. Clica em uma → modal.
"Cada dica é para você especificamente."

[ACTIONPLAN - 20s]
Tab 1 (Treino): Mostra semana com 7 dias, exercícios listados. Marca checkboxes.
Tab 2 (Mentalidade): Expande práticas mentais, mostra vídeo de sono.

[NUTRITION - 20s]
Toca "Tirar Foto" → câmera. Fotografa prato de comida.
IA retorna: "Frango com arroz, 450 kcal, 35g proteína."
Progress bars atualizam em tempo real.

[COMMUNITY - 20s]
Timeline de posts de outras mulheres. Toca coração para curtir.
Mostra ranking com top 10 usuárias do mês.

[OUTRO - 5s]
"Menovitta: Sua jornada da menopausa, personalizada. Baixe agora!"

[TOTAL: 2 minutos]
```

---

## 💡 UNIQUE SELLING PROPOSITIONS (USPs)

1. **Personalização por IA**: Não "dicas genéricas para menopausa" — cada recomendação é específica para VOCÊ (fase + sintomas + objetivo)

2. **Offline-first**: PWA — pode usar mesmo sem internet. Dados sincronizam quando online.

3. **Comunidade real**: Não é só app — é comunidade. Compartilhe vitórias, compita amigavelmente, sinta-se apoiada.

4. **Ciência acessível**: Artigos baseados em pesquisa, mas linguagem simples. Nada de jargão médico.

5. **Design para 40+**: Fonts maiores, cores contrastantes, navegação intuitiva. Respeita limitações físicas dessa fase.

6. **Integração holística**: Exercício + nutrição + sono + mental em um lugar. Não precisa de 5 apps.

7. **Gamificação**: Ranking, badges, progresso visual — mantém motivação sem ser stressante.

---

## 📱 PLATAFORMA & ACESSO

**Como usar**:
1. Acesse em qualquer navegador (mobile, tablet, desktop)
2. Crie conta com email
3. Preencha quiz (2-3 minutos)
4. Comece a usar imediatamente

**Instalação PWA**:
- iPhone: Safari → Share → "Add to Home Screen"
- Android: Chrome → ⋮ → "Install app"
- Desktop: Chrome → ⋮ → "Install Menovitta"

**Funciona sem internet?** Sim! Dados são sincronizados quando você conecta novamente.

---

## 🚀 TECNOLOGIA POR TRÁS

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **IA**: Google Gemini 2.0-flash-lite (vision + text)
- **PWA**: Service Worker + vite-plugin-pwa (offline support)
- **Deploy**: Vercel (auto-update on push)

**Por que essas tecnologias?**
- React: Rápido, responsivo, componentizado
- Tailwind: Design consistente, sem CSS manual
- Supabase: Banco open-source, real-time, seguro
- Gemini: IA gratuita (1500 RPM), visão de imagem
- PWA: Funciona offline, instalável como app nativo
- Vercel: Deploy automático, ultra-rápido globalmente

---

## 📈 MÉTRICAS IMPORTANTES (Para Beta & Launch)

**User Journey KPIs**:
- ✅ Quiz completion rate (% que completam 4 etapas)
- ✅ Daily active users (DAU)
- ✅ Feature adoption (% usando cada aba)
- ✅ Engagement (posts/comments na comunidade)
- ✅ Retention (% voltando após 1 semana/mês)

**Technical KPIs**:
- ✅ Load time (< 2s home, < 5s IA features)
- ✅ Crash rate (< 0.5%)
- ✅ Offline functionality (100% accessible without connection)

---

## 🔒 SEGURANÇA & PRIVACIDADE

### Dados Coletados
**Pessoais**: Nome, email, telefone, data de nascimento  
**Saúde**: Fase menopáusica, peso, altura, sintomas, medicações  
**Atividade**: Refeições registradas, treinos, macros, metas  
**Comunidade**: Posts, fotos, curtidas  

### Proteção de Dados
- **Banco**: Supabase (PostgreSQL) com criptografia AES-256 em repouso
- **Transmissão**: HTTPS/TLS 1.2+ (todos os dados criptografados em trânsito)
- **Acesso**: Você acessa apenas seus dados. Admins acessam dados agregados anônimos
- **Fotos**: Analisadas por Gemini AI, mas NÃO são armazenadas (apenas resultado)

### Retenção
- **Dados ativos**: Mantidos enquanto conta ativa
- **Após exclusão**: Deletados em até 30 dias. Backups (7 dias) depois deletados
- **Dados agregados**: Mantidos para analytics (sem informações pessoais)

### Compartilhamento
**NUNCA compartilhamos com terceiros**. Dados usados apenas por:
- Supabase (armazenamento)
- Gemini API (análise de fotos)
- Seu perfil na comunidade (voluntário — você controla)

### Documentos Legais
- **Política de Privacidade**: Explica detalhadamente como coletamos, usamos e protegemos dados
- **Termos de Serviço**: Condições de uso, isenções de responsabilidade, fase beta
- **Acesso**: Configurações → Legal → [Política / Termos]

### Row Level Security (RLS) Policies
Todas as tabelas em Supabase têm RLS ativado:
- ✅ `profiles` — usuária acessa apenas seu perfil
- ✅ `food_logs` — acesso apenas ao seu histórico
- ✅ `treino_logs` — acesso apenas ao seu histórico
- ✅ `community_posts` — posts públicos, apenas autor pode editar
- ✅ `artigos` — somente leitura para usuárias, admin pode criar/editar

### Isenção de Responsabilidade
**Menovitta NÃO é serviço médico**. O app fornece:
- ✅ Informações educacionais
- ✅ Recomendações gerais de fitness/nutrição
- ✅ Suporte emocional via comunidade

**Não substitui**:
- ❌ Consulta com médico
- ❌ Diagnóstico médico
- ❌ Prescrição de medicação

Usuárias devem consultar profissional de saúde antes de iniciar treinos ou dietas.

### Status Beta
App está em **fase beta**. Isso significa:
- Funcionalidades podem mudar/ser removidas
- Pode haver bugs
- Serviço pode estar indisponível periodicamente
- Dados estão seguros, mas sem garantia de continuidade

---

## 🎯 PRÓXIMAS FEATURES (Roadmap)

1. **Consultoria com nutricionista** (video calls, planos customizados)
2. **Admin dashboard** (moderar comunidade, estatísticas)
3. **Integração com wearables** (Apple Watch, Fitbit para passos/calorias auto)
4. **Grupos privados** (amigas podem conversar juntas)
5. **Prognóstico de sintomas** (IA prediz que você terá fogacho amanhã baseado em padrões)
6. **Video library** (atividades, receitas, relaxamento)

---

## 📞 SUPORTE & FAQ

**P: Meus dados estão seguros?**
R: Sim. Supabase usa encryption em repouso e em trânsito. Você pode ver nossa Política de Privacidade em Configurações.

**P: Posso usar offline?**
R: Sim. O app sincroniza automaticamente quando volta online.

**P: A IA pode estar errada na análise de comida?**
R: Pode. Por isso mostramos "confiança %" em cada análise (ex: 92% confiável). Se desconfiar, ajuste manualmente.

**P: Como contato suporte?**
R: Toque em Configurações → "Falar no WhatsApp". Nos mandamos uma mensagem direto!

---

## 📄 INFORMAÇÕES DO DOCUMENTO

**Última atualização**: 27 de abril de 2026  
**Versão do app**: 4.0 (React 18 + Gemini 2.0-flash-lite + PWA)  
**Status**: Beta pronto para testers 🚀

Este documento é a **fonte única de verdade** para qualquer conteúdo de marketing, vídeo, post ou demo do Menovitta 4.0.

**Use para**:
- 📱 Criar posts em Instagram/TikTok
- 🎥 Scripts de vídeo em YouTube
- 📄 Landing page
- 👥 Onboarding de beta testers
- 🎯 Pitch para investidores
- 🤝 Parcerias (nutricionistas, academias)
