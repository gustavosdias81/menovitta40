import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, saveTreinoLog, getTreinoLogs } from '../lib/supabase'
import type { PlanoAcao, FaseMenopausa, Objetivo, TreinoLog } from '../types'
import {
  Dumbbell, Apple, Brain, ClipboardList,
  TrendingUp, Loader2, Flame, Droplets,
  Moon, Heart, ChevronDown, ChevronUp, Star,
  Home, Building2, Zap, Trophy, Lock, Check,
  PlayCircle, CheckCircle2, Calendar, X
} from 'lucide-react'

// (lógica de vídeo movida para dentro do componente)

// ── TIPOS ─────────────────────────────────────────────────────────────────────
type Exercicio = { nome: string; series: string; obs?: string }
type DiaDetalhe = {
  dia: string
  foco: string
  duracao: string
  intensidade: string
  academia: Exercicio[]
  casa: Exercicio[]
  cardio?: { tipo: string; duracao: string; fc?: string }
}

type SemanaProgressao = {
  semana: string
  titulo: string
  descricao: string
  desbloqueada: boolean
  dias: DiaDetalhe[]
}

// ── TREINOS POR FASE (4 semanas de progressão) ─────────────────────────────
function gerarPrograma(fase: FaseMenopausa): SemanaProgressao[] {
  const base: Record<FaseMenopausa, { nomePrograma: string; semanas: SemanaProgressao[] }> = {

    // ════════════════════════════════════════════════════════════
    // PRÉ-MENOPAUSA
    // ════════════════════════════════════════════════════════════
    pre_menopausa: {
      nomePrograma: 'Protocolo Pré-Menopausa',
      semanas: [
        {
          semana: 'Semana 1–2', titulo: '🌱 Fase de Adaptação',
          descricao: 'Aprenda os movimentos com segurança. Foco na técnica, não no peso.',
          desbloqueada: true,
          dias: [
            {
              dia: 'Segunda', foco: 'Membros Inferiores', duracao: '45 min', intensidade: 'Leve',
              academia: [
                { nome: 'Leg Press 45°', series: '3×12', obs: 'Pés na largura dos ombros na plataforma. Desça até 90° e empurre pelos calcanhares. Não trave o joelho no final.' },
                { nome: 'Cadeira Extensora', series: '3×12', obs: 'Suba controlado (2s), desça devagar (3s). Não use momentum. Contrai o quadríceps no topo.' },
                { nome: 'Cadeira Flexora', series: '3×12', obs: 'Flexione o joelho trazendo o calcanhar em direção ao glúteo. Quadril fixo no banco, não levante.' },
                { nome: 'Panturrilha sentada', series: '3×15', obs: 'Suba na ponta dos pés o máximo possível, segure 1s no topo, desça lentamente. Amplitude total.' },
              ],
              casa: [
                { nome: 'Agachamento livre', series: '3×15', obs: 'Pés na largura dos ombros, pontas dos pés levemente abertas. Desça como se fosse sentar, joelhos alinhados com os pés. Pode segurar uma garrafa de água.' },
                { nome: 'Afundo alternado', series: '3×10 cada', obs: 'Dê um passo à frente, desça o joelho traseiro quase no chão. Joelho da frente não ultrapassa a ponta do pé. Volte e alterne.' },
                { nome: 'Elevação de panturrilha em pé', series: '3×20', obs: 'Use uma parede para equilíbrio. Suba nas pontas dos pés, segure 1s, desça controlado. Máxima amplitude.' },
                { nome: 'Ponte de glúteo', series: '3×15', obs: 'Deite de costas, pés apoiados no chão próximos ao glúteo. Empurre os quadris para cima, contraia o glúteo no topo por 2s e desça.' },
              ],
              cardio: { tipo: 'Caminhada leve', duracao: '15 min', fc: '100–120 bpm' },
            },
            {
              dia: 'Terça', foco: 'Cardio + Mobilidade Ativa', duracao: '30 min', intensidade: 'Leve',
              academia: [
                { nome: 'Esteira — caminhada inclinada', series: '20 min', obs: 'Inclinação de 3–5%. Ritmo confortável onde você consegue conversar. Postura ereta, braços balançando.' },
                { nome: 'Alongamento dinâmico', series: '10 min', obs: 'Círculos de ombro, rotação de quadril, elevação de joelhos, giro de tronco. Movimentos fluidos, sem forçar.' },
              ],
              casa: [
                { nome: 'Caminhada ao ar livre', series: '20 min', obs: 'Ritmo leve a moderado. Mantenha postura ereta, olhe para frente, não para o chão. Respire pelo nariz.' },
                { nome: 'Mobilidade articular', series: '10 min', obs: 'Círculos de ombro (10 cada), rotação de quadril (10 cada lado), rotação de tornozelo (10 cada). Movimentos suaves e controlados.' },
              ],
              cardio: { tipo: 'Caminhada contínua', duracao: '20 min', fc: '100–120 bpm' },
            },
            {
              dia: 'Quarta', foco: 'Membros Superiores + Core', duracao: '45 min', intensidade: 'Leve',
              academia: [
                { nome: 'Supino máquina', series: '3×12', obs: 'Assento na altura do peitoral. Empurre com o peito, não com os ombros. Desça controlado, cotoveloe a 45° do tronco.' },
                { nome: 'Puxada frontal', series: '3×12', obs: 'Pegada um pouco mais larga que os ombros. Puxe a barra até a altura do queixo, cotovelos apontando para baixo. Não balance o tronco.' },
                { nome: 'Remada baixa sentada', series: '3×12', obs: 'Costas retas, puxe o cabo até o umbigo trazendo os cotovelos para trás. Sinta a contração entre as escápulas. Não arredonde as costas.' },
                { nome: 'Prancha frontal', series: '3×20s', obs: 'Apoio nos antebraços e pontas dos pés. Abdômen contraído, quadril em linha com o tronco. Não deixe cair nem subir o quadril. Respire normalmente.' },
              ],
              casa: [
                { nome: 'Flexão de joelhos', series: '3×10', obs: 'Joelhos no chão, mãos na largura dos ombros. Desça o peito até quase tocar o chão, cotovelos a 45°. Corpo em linha reta do joelho ao ombro.' },
                { nome: 'Remada com garrafa de água', series: '3×12', obs: 'Incline o tronco a 45°, costas retas. Puxe as garrafas até as costelas, cotovelos próximos ao corpo. Sinta as costas trabalhando.' },
                { nome: 'Elevação lateral com garrafas', series: '3×12', obs: 'Cotovelos levemente dobrados, eleve os braços lateralmente até a altura dos ombros. Não balance o corpo. Desça controlado.' },
                { nome: 'Prancha no chão', series: '3×20s', obs: 'Mesma técnica da prancha na academia. Abdômen rígido, respire normalmente. Aumente 5s a cada treino.' },
              ],
              cardio: { tipo: 'Agitação no lugar', duracao: '5 min', fc: '110–125 bpm' },
            },
            {
              dia: 'Quinta', foco: 'Bíceps + Core + Funcional', duracao: '35 min', intensidade: 'Leve',
              academia: [
                { nome: 'Rosca direta com barra/halter', series: '3×12', obs: 'Cotovelos fixos ao lado do corpo. Flexione apenas o antebraço. Não balance o tronco para dar impulso. Desça controlado.' },
                { nome: 'Rosca concentrada', series: '3×12 cada', obs: 'Sente, apoie o cotovelo na parte interna da coxa. Flexione o antebraço até o ombro, sinta o pico de contração.' },
                { nome: 'Crunch abdominal', series: '3×15', obs: 'Mãos atrás da cabeça sem puxar o pescoço. Suba apenas o tronco superior, contraia o abdômen. Não sente totalmente.' },
                { nome: 'Prancha lateral', series: '3×20s cada', obs: 'Apoio no antebraço e lateral do pé. Quadril elevado, corpo em linha reta. Olhe para frente, respire.' },
              ],
              casa: [
                { nome: 'Rosca com garrafas de água', series: '3×12', obs: 'Cotovelos fixos, flexione apenas o antebraço. Faça alternado (uma de cada vez) para melhor concentração.' },
                { nome: 'Superman', series: '3×12', obs: 'Deite de bruços, braços estendidos à frente. Eleve simultaneamente braços e pernas do chão, contraia as costas. Segure 2s e desça.' },
                { nome: 'Dead Bug', series: '3×10 cada', obs: 'De costas, braços e pernas a 90°. Estenda o braço esquerdo e a perna direita ao mesmo tempo sem tocar no chão. Lombar colada no chão.' },
                { nome: 'Prancha lateral', series: '3×20s cada', obs: 'No chão, apoio no antebraço e lateral do pé (ou joelho). Quadril em linha com o corpo. Contraia o oblíquo.' },
              ],
            },
            {
              dia: 'Sexta', foco: 'Full Body Leve', duracao: '45 min', intensidade: 'Leve-Moderada',
              academia: [
                { nome: 'Agachamento Smith', series: '3×12', obs: 'Barra na parte alta das costas (trapézio). Desça lento (3s), suba explosivo (1s). Joelhos alinhados com os pés o tempo todo.' },
                { nome: 'Supino inclinado máquina', series: '3×12', obs: 'Inclinação a 30–45°. Foca no peitoral superior. Empurre para frente e ligeiramente para cima. Escápulas retraídas.' },
                { nome: 'Puxada pronada', series: '3×12', obs: 'Pegada pronada (palmas para fora). Puxe até o queixo, cotovelos para baixo. Contrai as costas no final do movimento.' },
                { nome: 'Abdominal crunch', series: '3×15', obs: 'Pés apoiados no chão ou banco. Suba apenas o tronco superior, não o lombar. Expire na subida, inspire na descida.' },
              ],
              casa: [
                { nome: 'Agachamento sumô', series: '3×15', obs: 'Pés bem abertos, pontas para fora. Desça com joelhos na direção dos pés, tronco mais ereto que no agachamento normal. Ativa glúteo e adutores.' },
                { nome: 'Flexão inclinada na mesa', series: '3×10', obs: 'Mãos na borda da mesa, corpo em linha reta. Desça o peito até a mesa, empurre. Mais fácil que a flexão no chão, ótima para iniciantes.' },
                { nome: 'Remada curvada com mochila', series: '3×12', obs: 'Incline 45°, costas retas. Use uma mochila com peso ou galão de água. Puxe até as costelas, cotovelos para trás.' },
                { nome: 'Bicicleta abdominal', series: '3×20', obs: 'De costas, mãos na cabeça. Traga o joelho direito enquanto gira o tronco para a direita, alternando lentamente. Foco na rotação.' },
              ],
              cardio: { tipo: 'Caminhada rápida', duracao: '15 min', fc: '110–130 bpm' },
            },
            {
              dia: 'Sábado', foco: 'Cardio para o Coração', duracao: '35 min', intensidade: 'Leve',
              academia: [
                { nome: 'Bike ou Elíptico', series: '30 min', obs: 'Resistência leve a moderada. Mantenha cadência constante. Postura ereta, não se apoie demais no guidão.' },
                { nome: 'Alongamento de membros inferiores', series: '5 min', obs: 'Quadríceps, posterior de coxa, panturrilha e quadril. Segure cada posição por 20–30s. Respire profundo.' },
              ],
              casa: [
                { nome: 'Caminhada ou pedalada ao ar livre', series: '30 min', obs: 'Ritmo que eleve levemente a frequência cardíaca. Parque, praça ou bairro. Aproveite o sol para vitamina D.' },
                { nome: 'Alongamento ao ar livre', series: '5 min', obs: 'Estique quadríceps, posterior de coxa e panturrilha. Posições estáticas por 20–30s cada.' },
              ],
              cardio: { tipo: 'Aeróbico contínuo ao ar livre', duracao: '30 min', fc: '100–125 bpm' },
            },
            {
              dia: 'Domingo', foco: 'Descanso Total', duracao: '—', intensidade: 'Repouso',
              academia: [{ nome: '🛌 Descanso — seu corpo se recupera e fica mais forte hoje!', series: '—', obs: 'O descanso é parte do treino. Hidrate-se bem, durma bem e prepare-se para a próxima semana.' }],
              casa: [{ nome: '🛌 Descanso — aproveite para relaxar e recarregar as energias!', series: '—', obs: 'Coma bem, durma pelo menos 7h e planeje seus treinos da próxima semana.' }],
            },
          ],
        },

        {
          semana: 'Semana 3–4', titulo: '🔥 Fase de Evolução',
          descricao: 'Parabéns! Agora aumentamos a carga 10–20% e incluímos mais cardio.',
          desbloqueada: true,
          dias: [
            {
              dia: 'Segunda', foco: 'Membros Inferiores — Intensificado', duracao: '50 min', intensidade: 'Moderada',
              academia: [
                { nome: 'Agachamento livre ou Smith', series: '4×12', obs: 'Aumente o peso 10–20% em relação às semanas 1-2. Foco na descida lenta (3s) e subida controlada. Joelhos alinhados.' },
                { nome: 'Leg Press 45°', series: '4×12', obs: 'Mesma técnica, mais carga. Pés na largura dos ombros. Desça até 90° e empurre pelos calcanhares sem travar.' },
                { nome: 'Stiff (levantamento terra romeno)', series: '3×12', obs: 'Segure o halter à frente das coxas. Incline o tronco mantendo as costas retas, sinta o alongamento no posterior de coxa. Volte subindo com o quadril.' },
                { nome: 'Panturrilha em pé', series: '4×15', obs: 'Use o aparelho ou segure halteres. Amplitude máxima: calcanhar abaixo do degrau até a ponta do pé bem acima. Segure 1s no topo.' },
              ],
              casa: [
                { nome: 'Agachamento búlgaro', series: '3×10 cada', obs: 'Pé traseiro no sofá ou cadeira. Desça o joelho traseiro quase no chão, joelho da frente não ultrapassa o pé. Excelente para glúteo.' },
                { nome: 'Agachamento sumô com peso', series: '4×15', obs: 'Segure galão de água ou mochila pesada. Pés bem abertos, desça com o tronco ereto. Ativa glúteo, adutores e quadríceps.' },
                { nome: 'Ponte de glúteo unilateral', series: '3×12 cada', obs: 'Uma perna estendida, suba com a perna apoiada no chão. Muito mais desafiador que a ponte bilateral. Contrai o glúteo no topo.' },
                { nome: 'Panturrilha na escada', series: '4×15', obs: 'Apoie a ponta do pé na borda do degrau, calcanhar no ar. Desce o calcanhar abaixo do degrau e sobe na ponta. Amplitude máxima.' },
              ],
              cardio: { tipo: 'HIIT leve: 1 min rápido + 2 min lento', duracao: '15 min', fc: '120–145 bpm' },
            },
            {
              dia: 'Terça', foco: 'Cardio Progressivo', duracao: '35 min', intensidade: 'Moderada',
              academia: [
                { nome: 'Esteira — intervalado progressivo', series: '25 min', obs: '2 min caminhada normal → 1 min trote leve → repita. A cada 5 min, aumente levemente a velocidade do trote.' },
                { nome: 'Alongamento dinâmico pós-cardio', series: '10 min', obs: 'Quadríceps, posterior de coxa, panturrilha e quadril. Cada posição 20–30s. Aproveite para baixar a FC gradualmente.' },
              ],
              casa: [
                { nome: 'Caminhada com subidas/escadas', series: '25 min', obs: 'Busque ladeiras, escadas ou subidas. Mantenha ritmo que dificulte conversar. Postura ereta, core ativado.' },
                { nome: 'Alongamento pós-atividade', series: '10 min', obs: 'Posterior de coxa (sentada, alcance os pés), panturrilha (mão na parede), quadríceps (em pé, segure o tornozelo).' },
              ],
              cardio: { tipo: 'Intervalado leve', duracao: '25 min', fc: '120–140 bpm' },
            },
            {
              dia: 'Quarta', foco: 'Superiores + Core Avançado', duracao: '50 min', intensidade: 'Moderada',
              academia: [
                { nome: 'Supino reto com halter', series: '4×12', obs: 'Halteres nas mãos, desça controlado até o nível do peito com cotovelos a 45°. Empurre para cima e levemente para dentro.' },
                { nome: 'Puxada frontal pronada', series: '4×12', obs: 'Pegada larga, pronada. Puxe até o queixo, cotovelos apontando para baixo e para os lados. Não balance o tronco.' },
                { nome: 'Elevação lateral com halter', series: '3×12', obs: 'Cotovelos levemente dobrados. Eleve até a altura dos ombros apenas, não acima. Controle a descida — não deixe cair.' },
                { nome: 'Rosca bíceps alternada', series: '3×12 cada', obs: 'Uma mão de cada vez. Cotovelo fixo ao corpo. Gire levemente o pulso na subida (supinação). Sinta o bíceps contrair.' },
                { nome: 'Prancha frontal', series: '3×30s', obs: 'Antebraços no chão, corpo em linha reta. Abdômen contraído, não deixe o quadril cair. Respire ritmicamente.' },
                { nome: 'Abdominal infra (elevação de pernas)', series: '3×15', obs: 'De costas, lombar colada no chão. Eleve as pernas juntas até 90° e desça controlado sem tocar no chão.' },
              ],
              casa: [
                { nome: 'Flexão completa (ou de joelhos)', series: '4×10', obs: 'Mãos na largura dos ombros. Se não conseguir completa, use os joelhos. Peito quase toca o chão, cotovelos a 45°.' },
                { nome: 'Remada com elástico ou galão', series: '4×12', obs: 'Incline 45°, puxe até as costelas com os cotovelos para trás. Se usar elástico, pise no centro e puxe com as duas mãos.' },
                { nome: 'Elevação frontal + lateral com garrafas', series: '3×10', obs: 'Frontal: levante à frente até a altura dos ombros. Lateral: eleve para os lados. Faça alternado ou em sequência.' },
                { nome: 'Prancha com toque no ombro', series: '3×10 cada', obs: 'Em posição de prancha alta (braços estendidos). Toque o ombro oposto com a mão alternadamente. Quadril estável.' },
                { nome: 'Tesoura abdominal', series: '3×20', obs: 'De costas, pernas estendidas a 45° do chão. Abra e feche as pernas como uma tesoura. Lombar colada no chão.' },
              ],
              cardio: { tipo: 'Jumping jacks', duracao: '5 min', fc: '115–130 bpm' },
            },
            {
              dia: 'Quinta', foco: 'Costas + Bíceps', duracao: '40 min', intensidade: 'Leve-Moderada',
              academia: [
                { nome: 'Puxada supina (pegada invertida)', series: '4×12', obs: 'Palmas voltadas para você, pegada na largura dos ombros. Puxe até o queixo, cotovelos próximos ao corpo. Trabalha o bíceps junto.' },
                { nome: 'Remada unilateral com halter', series: '3×12 cada', obs: 'Apoie uma mão e joelho no banco. Coluna reta, paralela ao chão. Puxe o halter até as costelas, cotovelo vai para cima e para trás.' },
                { nome: 'Rosca bíceps com barra', series: '3×12', obs: 'Cotovelos fixos ao lado do corpo, pegada na largura dos ombros. Suba controlado e desça lentamente (3s). Não balance o tronco.' },
                { nome: 'Crunch inverso', series: '3×15', obs: 'De costas, pernas a 90°. Eleve o quadril do chão contraindo o abdominal inferior. Não use balanço — o movimento é pequeno e controlado.' },
              ],
              casa: [
                { nome: 'Remada curvada com elástico/galão', series: '4×12', obs: 'Incline 45° com costas retas. Se usar elástico, pise no centro. Puxe até as costelas, cotovelos para trás. Sinta as costas.' },
                { nome: 'Rosca concentrada com garrafa', series: '3×12 cada', obs: 'Sente, cotovelo apoiado na coxa interna. Flexione o antebraço completamente. Use garrafa de 1,5L ou mais.' },
                { nome: 'Superman com pausa', series: '3×10', obs: 'Deite de bruços, eleve braços e pernas simultaneamente. Segure 3s no ar. Sinta toda a cadeia posterior (costas e glúteos).' },
                { nome: 'Crunch inverso', series: '3×15', obs: 'Deite de costas, pernas a 90°. Eleve o quadril usando o abdômen inferior. Lombar cola no chão. Sem impulso.' },
              ],
            },
            {
              dia: 'Sexta', foco: 'Full Body Intenso', duracao: '50 min', intensidade: 'Moderada-Alta',
              academia: [
                { nome: 'Agachamento + Desenvolvimento (combinado)', series: '4×10', obs: 'Segure halteres na altura dos ombros. Agache, suba e, no final da subida, pressione os halteres acima da cabeça. Exercício composto poderoso.' },
                { nome: 'Remada curvada com halter', series: '4×12', obs: 'Incline 45°, coluna neutra. Puxe os dois halteres simultaneamente até as costelas. Escápulas se aproximam no final.' },
                { nome: 'Avanço (afundo) com halteres', series: '3×12 cada', obs: 'Dê um passo largo à frente. Desça o joelho traseiro quase no chão. Joelho da frente alinhado com o pé. Empurre para voltar.' },
                { nome: 'Prancha lateral', series: '3×20s cada', obs: 'Antebraço no chão, pés empilhados. Quadril elevado e em linha com o corpo. Oblíquos trabalhando. Não deixe o quadril cair.' },
              ],
              casa: [
                { nome: 'Agachamento + Press com galão', series: '4×12', obs: 'Segure o galão de água à frente do peito. Agache completo, suba e, ao chegar no topo, empurre o galão acima da cabeça.' },
                { nome: 'Afundo caminhando', series: '3×10 cada', obs: 'Caminhe dando passos de afundo. Alterne as pernas sem parar entre as repetições. Joelhos alinhados, tronco ereto.' },
                { nome: 'Flexão + Prancha', series: '3×8+15s', obs: 'Faça 8 flexões, então mantenha a prancha alta por 15s. Sem descanso entre os dois. Um dos exercícios mais completos.' },
                { nome: 'Mountain climber leve', series: '3×10 cada', obs: 'Em posição de prancha, traga um joelho por vez em direção ao peito. Ritmo controlado para manter a forma. Core ativado.' },
              ],
              cardio: { tipo: 'HIIT: 30s intenso + 60s lento', duracao: '12 min', fc: '130–155 bpm' },
            },
            {
              dia: 'Sábado', foco: 'Cardio + Força do Coração', duracao: '40 min', intensidade: 'Moderada',
              academia: [
                { nome: 'Bike ou Elíptico com resistência', series: '35 min', obs: 'Resistência moderada. Mantenha cadência de 70–90 RPM. Intercale 2 min leve + 2 min moderado.' },
                { nome: 'Alongamento muscular completo', series: '5 min', obs: 'Todos os grupos musculares trabalhados na semana. 20–30s cada posição. Aproveite para uma respiração profunda.' },
              ],
              casa: [
                { nome: 'Corrida leve ou caminhada rápida', series: '35 min', obs: 'Ritmo onde você consegue falar frases curtas, mas não conversar longamente. Postura ereta, passadas naturais.' },
                { nome: 'Alongamento ao ar livre', series: '5 min', obs: 'Aproveite o ambiente. Estique quadríceps, posterior, panturrilha e ombros. Respire fundo, relaxe.' },
              ],
              cardio: { tipo: 'Aeróbico contínuo', duracao: '35 min', fc: '120–140 bpm' },
            },
            {
              dia: 'Domingo', foco: 'Descanso Merecido', duracao: '—', intensidade: 'Repouso',
              academia: [{ nome: '🏆 Parabéns! Você completou mais uma semana de evolução!', series: '—', obs: 'Descanse, alimente-se bem e celebre cada treino concluído. Você está mais forte!' }],
              casa: [{ nome: '🏆 Incrível! Você está ficando mais forte a cada semana!', series: '—', obs: 'Hidrate-se, cuide da alimentação e prepare-se para a próxima fase. Você merece!' }],
            },
          ],
        },

        { semana: 'Semana 5–6', titulo: '💪 Fase de Força', descricao: 'Corpo adaptado! Agora vamos construir força real e resistência cardiovascular.', desbloqueada: false, dias: [] },
        { semana: 'Semana 7–8', titulo: '🏆 Fase de Resultado', descricao: 'Reta final! Máxima performance e consolidação dos hábitos para a vida toda.', desbloqueada: false, dias: [] },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // MENOPAUSA
    // ════════════════════════════════════════════════════════════
    menopausa: {
      nomePrograma: 'Protocolo Menopausa',
      semanas: [
        {
          semana: 'Semana 1–2', titulo: '🌱 Fase de Adaptação',
          descricao: 'Respeite seu corpo. Foco em técnica, equilíbrio e saúde óssea.',
          desbloqueada: true,
          dias: [
            {
              dia: 'Segunda', foco: 'Glúteos e Coxas', duracao: '40 min', intensidade: 'Leve',
              academia: [
                { nome: 'Leg Press', series: '3×12', obs: 'Peso confortável. Pés centralizados na plataforma. Desça até 90° sem deixar o lombar sair do banco. Empurre pelos calcanhares.' },
                { nome: 'Cadeira Abdutora', series: '3×15', obs: 'Abra as pernas contra a resistência, segure 1s no ponto de maior abertura e volte controlado. Sente o glúteo médio trabalhando.' },
                { nome: 'Cadeira Adutora', series: '3×15', obs: 'Feche as pernas controladamente. Ótimo para face interna das coxas. Desça devagar para sentir o alongamento.' },
                { nome: 'Ponte de glúteo', series: '3×15', obs: 'Pés apoiados perto do glúteo. Suba empurrando pelos calcanhares, contraia o glúteo no topo por 2s. Desça controlado.' },
              ],
              casa: [
                { nome: 'Agachamento na cadeira', series: '3×12', obs: 'Use uma cadeira como guia. Sente lentamente até tocar a cadeira, imediatamente suba. Não "sente de verdade". Joelhos alinhados.' },
                { nome: 'Abdução lateral em pé', series: '3×12 cada', obs: 'Use parede para equilíbrio. Eleve a perna lateralmente a 45°, segure 1s, desça controlado. Não incline o tronco.' },
                { nome: 'Ponte de glúteo', series: '3×15', obs: 'Mesma técnica — empurre pelos calcanhares, contraia o glúteo no topo. Pode colocar um livro pesado no quadril para progressão.' },
                { nome: 'Agachamento isométrico na parede', series: '3×20s', obs: 'Costas na parede, desça até 90° e segure. Quadríceps trabalhando de forma isométrica. Excelente para joelhos.' },
              ],
              cardio: { tipo: 'Caminhada leve', duracao: '15 min', fc: '95–115 bpm' },
            },
            {
              dia: 'Terça', foco: 'Cardio para o Coração', duracao: '30 min', intensidade: 'Leve',
              academia: [
                { nome: 'Bike ergométrica', series: '20 min', obs: 'Resistência leve. Mantenha cadência confortável (60–80 RPM). Postura ereta, não se curve sobre o guidão.' },
                { nome: 'Alongamento completo', series: '10 min', obs: 'Quadríceps, posterior de coxa, panturrilha, peitoral e ombros. 20–30s cada. Respiração lenta e profunda.' },
              ],
              casa: [
                { nome: 'Caminhada no bairro', series: '20 min', obs: 'Ritmo confortável. Mantenha postura ereta. Sapato adequado. Evite horários de calor intenso.' },
                { nome: 'Alongamento em casa', series: '10 min', obs: 'Sentada ou em pé. Alcance os pés, estique os ombros, gire o pescoço suavemente. Relaxe e respire.' },
              ],
              cardio: { tipo: 'Caminhada contínua', duracao: '20 min', fc: '95–115 bpm' },
            },
            {
              dia: 'Quarta', foco: 'Parte Superior + Saúde Óssea', duracao: '40 min', intensidade: 'Leve',
              academia: [
                { nome: 'Supino máquina', series: '3×12', obs: 'Assento regulado para que os pegadores fiquem na linha do peitoral. Empurre com o peito. Escápulas retraídas durante o movimento.' },
                { nome: 'Puxada frontal', series: '3×12', obs: 'Pegada um pouco mais larga que os ombros. Puxe a barra em direção ao queixo. Cotovelos apontam para baixo. Tronco levemente inclinado.' },
                { nome: 'Remada sentada no cabo', series: '3×12', obs: 'Costas eretas, não arredonde. Puxe o cabo até o umbigo trazendo os cotovelos para trás. Sinta as escápulas se aproximarem.' },
                { nome: 'Prancha abdominal', series: '3×15s', obs: 'Antebraços no chão. Corpo em linha reta. Abdômen rígido. Respire normalmente. Aumente o tempo a cada treino.' },
              ],
              casa: [
                { nome: 'Flexão na parede', series: '3×12', obs: 'Mãos na parede, um passo atrás. Cotovelos dobram a 45° ao descer. Mais fácil que no chão, perfeita para começar. Progrida para a mesa depois.' },
                { nome: 'Remada com garrafa 2L', series: '3×12', obs: 'Incline 45°, uma garrafa em cada mão. Puxe até as costelas simultaneamente. Costas retas o tempo todo.' },
                { nome: 'Elevação lateral com garrafas', series: '3×10', obs: 'Cotovelos levemente dobrados. Eleve os braços lateralmente até a altura dos ombros. Não suba acima disso — protege o manguito.' },
                { nome: 'Prancha no chão', series: '3×15s', obs: 'Antebraços e pontas dos pés. Quadril em linha com o tronco. Não deixe cair. Respire normalmente.' },
              ],
              cardio: { tipo: 'Marcha no lugar', duracao: '5 min', fc: '100–115 bpm' },
            },
            {
              dia: 'Quinta', foco: 'Ombros + Tríceps + Core', duracao: '35 min', intensidade: 'Leve',
              academia: [
                { nome: 'Desenvolvimento com halter (ombros)', series: '3×12', obs: 'Sentada, costas apoiadas. Halteres na altura dos ombros, pressione acima da cabeça. Não trave os cotovelos no topo. Cotovelos a 90° na descida.' },
                { nome: 'Tríceps polia alta', series: '3×12', obs: 'Cotovelos fixos ao lado do corpo. Estenda os antebraços para baixo. Sinta o tríceps contrair. Não use os ombros para ajudar.' },
                { nome: 'Elevação frontal', series: '3×10', obs: 'Segure halteres leves. Eleve os braços à frente até a altura dos ombros, palmas para baixo. Desça controlado. Trabalha deltóide anterior.' },
                { nome: 'Prancha com alcance', series: '3×10 cada', obs: 'Em prancha frontal, estenda um braço à frente alternadamente. Quadril estável — não rotacione. Core ativado.' },
              ],
              casa: [
                { nome: 'Desenvolvimento com garrafas', series: '3×10', obs: 'Sentada numa cadeira. Garrafas de 1L ou mais. Pressione acima da cabeça controladamente. Protege os ombros na menopausa.' },
                { nome: 'Tríceps no banco/cadeira', series: '3×10', obs: 'Mãos na borda do banco, pernas estendidas. Desça dobrando os cotovelos a 90° e empurre de volta. Muito eficaz sem equipamento.' },
                { nome: 'Elevação lateral com garrafas', series: '3×10', obs: 'Em pé, cotovelos levemente dobrados. Eleve lateralmente até a altura dos ombros. Controle a descida.' },
                { nome: 'Prancha com alcance de braço', series: '3×10 cada', obs: 'Posição de prancha no chão. Estenda um braço à frente por 2s, volte. Quadril firme, sem rotação.' },
              ],
            },
            {
              dia: 'Sexta', foco: 'Full Body + Equilíbrio', duracao: '40 min', intensidade: 'Leve-Moderada',
              academia: [
                { nome: 'Agachamento na máquina/Smith', series: '3×12', obs: 'Adicione um pouco mais de carga que na Segunda. Desça até 90°, foco na técnica. Joelhos alinhados com os pés.' },
                { nome: 'Supino inclinado', series: '3×12', obs: 'Inclinação a 30°. Trabalha peitoral superior. Empurre para cima e para dentro. Cotovelos a 45° do tronco.' },
                { nome: 'Remada baixa no cabo', series: '3×12', obs: 'Costas eretas, puxe o cabo até o umbigo. Cotovelos para trás. Sinta a contração entre as escápulas.' },
                { nome: 'Equilíbrio unipodal', series: '3×20s cada', obs: 'Fique em um pé por 20s. Se fácil, feche os olhos. Fundamental para prevenir quedas na menopausa. Use parede se precisar.' },
              ],
              casa: [
                { nome: 'Agachamento livre', series: '3×15', obs: 'Pés na largura dos ombros. Desça lento (3s), suba controlado. Adicione peso (mochila, galão) se necessário para desafio.' },
                { nome: 'Flexão de joelhos', series: '3×10', obs: 'Joelhos no chão, mãos na largura dos ombros. Peito quase toca o chão. Cotovelos a 45°. Ótima progressão para a flexão completa.' },
                { nome: 'Superman', series: '3×12', obs: 'De bruços, eleve braços e pernas ao mesmo tempo. Segure 2s. Fortalece toda a cadeia posterior — crucial para postura na menopausa.' },
                { nome: 'Equilíbrio em um pé', series: '3×20s cada', obs: 'Fique em um pé junto à parede para segurança. Olhar fixo em um ponto. Progrida para olhos fechados quando ficar fácil.' },
              ],
              cardio: { tipo: 'Caminhada com variação de ritmo', duracao: '10 min', fc: '105–125 bpm' },
            },
            {
              dia: 'Sábado', foco: 'Cardio — Saúde do Coração', duracao: '35 min', intensidade: 'Leve',
              academia: [
                { nome: 'Elíptico ou Bike', series: '30 min', obs: 'Intensidade leve a moderada. O elíptico é excelente para menopausa — aeróbico eficiente com baixo impacto nas articulações.' },
                { nome: 'Alongamento muscular', series: '5 min', obs: 'Posterior de coxa, quadríceps, panturrilha, peitoral e ombros. Aproveite o momento para respirar fundo e relaxar.' },
              ],
              casa: [
                { nome: 'Caminhada, natação ou dança', series: '30 min', obs: 'Qualquer atividade aeróbica que você goste. A dança é excelente — trabalha coordenação, humor e coração ao mesmo tempo!' },
                { nome: 'Alongamento', series: '5 min', obs: 'Todos os grupos musculares. 20–30s cada. Termine com respiração profunda — inspire pelo nariz, expire pela boca.' },
              ],
              cardio: { tipo: 'Aeróbico contínuo', duracao: '30 min', fc: '100–125 bpm' },
            },
            {
              dia: 'Domingo', foco: 'Descanso Total', duracao: '—', intensidade: 'Repouso',
              academia: [{ nome: '🛌 Recuperação ativa — seu corpo está ficando mais forte!', series: '—', obs: 'Hidrate-se bem. O descanso é quando os músculos crescem. Durma pelo menos 7–8h.' }],
              casa: [{ nome: '🛌 Relaxe e prepare-se para mais uma semana incrível!', series: '—', obs: 'Alimentação rica em proteínas ajuda na recuperação muscular. Aproveite para preparar as refeições da semana.' }],
            },
          ],
        },

        {
          semana: 'Semana 3–4', titulo: '🔥 Fase de Evolução',
          descricao: 'Você está evoluindo! Mais carga, mais cardio, mais confiança.',
          desbloqueada: true,
          dias: [
            {
              dia: 'Segunda', foco: 'Inferiores — Intensificado', duracao: '45 min', intensidade: 'Moderada',
              academia: [
                { nome: 'Agachamento livre/Smith', series: '4×12', obs: 'Aumente a carga 10–20%. Descida em 3s, subida explosiva em 1s. O aumento progressivo de carga é o que gera força real.' },
                { nome: 'Leg Press', series: '4×12', obs: 'Mais peso que nas semanas 1-2. Descida controlada, empurre pelos calcanhares. Não trave o joelho no topo.' },
                { nome: 'Stiff com halter', series: '3×12', obs: 'Segure halteres à frente das coxas. Incline o tronco com costas retas, sentindo o alongamento no posterior. Suba com o quadril, não com as costas.' },
                { nome: 'Panturrilha em pé', series: '4×15', obs: 'No aparelho ou segurando halteres. Amplitude máxima — suba bem alto e desça abaixo do nível. Segure 2s no topo.' },
              ],
              casa: [
                { nome: 'Agachamento búlgaro', series: '3×10 cada', obs: 'Pé traseiro no sofá. Glúteo da perna da frente é o motor do movimento. Joelho da frente não ultrapassa o pé.' },
                { nome: 'Ponte unilateral', series: '3×12 cada', obs: 'Uma perna levantada, empurre com a perna no chão. Muito mais intenso que a ponte bilateral. Ótimo para glúteo.' },
                { nome: 'Afundo reverso', series: '3×10 cada', obs: 'Passo para trás em vez de para frente. Mais seguro para os joelhos. Tronco ereto, descida controlada.' },
                { nome: 'Panturrilha na escada', series: '4×15', obs: 'Ponta do pé na borda do degrau. Calcanhar abaixo → ponta bem acima. Máxima amplitude. Segure 2s no topo.' },
              ],
              cardio: { tipo: 'Intervalado: 2 min rápido + 2 min lento', duracao: '12 min', fc: '115–140 bpm' },
            },
            {
              dia: 'Terça', foco: 'Cardio Intervalado', duracao: '35 min', intensidade: 'Moderada',
              academia: [
                { nome: 'Esteira — intervalado', series: '25 min', obs: 'Alterne 2 min de caminhada normal com 1 min de trote. A cada bloco, aumente 0,5 km/h no trote. Trabalha o coração progressivamente.' },
                { nome: 'Alongamento pós-cardio', series: '10 min', obs: 'Fundamental após o cardio. Posterior de coxa, panturrilha, quadríceps e quadril. Permita que a FC caia gradualmente.' },
              ],
              casa: [
                { nome: 'Caminhada com subidas', series: '25 min', obs: 'Busque escadas, rampas ou ladeiras. As subidas elevam a FC e ativam glúteo e coxas. Ritmo que dificulte conversar.' },
                { nome: 'Alongamento', series: '10 min', obs: 'Posterior de coxa (sentada, alcance os pés), panturrilha (parede), quadríceps (em pé). 20–30s cada.' },
              ],
              cardio: { tipo: 'Intervalado leve', duracao: '25 min', fc: '115–135 bpm' },
            },
            {
              dia: 'Quarta', foco: 'Superiores + Core', duracao: '45 min', intensidade: 'Moderada',
              academia: [
                { nome: 'Supino reto com halter', series: '4×12', obs: 'Halteres com mais carga. Desça controlado até o nível do peito. Cotovelos a 45°. Empurre e junte levemente os halteres no topo.' },
                { nome: 'Puxada pronada', series: '4×12', obs: 'Pegada larga, palmas para fora. Puxe até o queixo, sentindo as costas trabalhar. Não balance o tronco.' },
                { nome: 'Elevação lateral', series: '3×12', obs: 'Mais carga que nas semanas 1-2. Eleve até os ombros, não acima. Controle total na descida para maximizar o estímulo.' },
                { nome: 'Prancha frontal', series: '3×30s', obs: 'Aumento de 10s em relação às semanas anteriores. Abdômen rígido. Respire normalmente. Progrida para 45s na próxima semana.' },
                { nome: 'Crunch abdominal', series: '3×15', obs: 'Mãos atrás da cabeça, suba apenas o tronco superior. Expire ao subir. Foco na qualidade — não na velocidade.' },
              ],
              casa: [
                { nome: 'Flexão (joelhos ou completa)', series: '4×10', obs: 'Se já faz de joelhos, tente 2–3 completas. Progredir é fundamental. Cotovelos a 45°, peito quase toca o chão.' },
                { nome: 'Remada com elástico ou galão', series: '4×12', obs: 'Mais resistência que antes. Puxe até as costelas, cotovelos para trás. Sinta as costas trabalhar.' },
                { nome: 'Elevação com garrafas', series: '3×12', obs: 'Use garrafas mais cheias para mais resistência. Frontal e lateral. Controle a descida.' },
                { nome: 'Prancha com toque no ombro', series: '3×10 cada', obs: 'Desafiador para o core. Mantenha o quadril estável enquanto toca o ombro oposto. Não rotacione o tronco.' },
              ],
              cardio: { tipo: 'Jumping jacks', duracao: '5 min', fc: '110–130 bpm' },
            },
            {
              dia: 'Quinta', foco: 'Costas + Core Avançado', duracao: '40 min', intensidade: 'Leve-Moderada',
              academia: [
                { nome: 'Puxada triângulo (pegada neutra)', series: '4×12', obs: 'Pegada neutra (palmas se olhando). Puxe o triângulo até o peito, cotovelos para baixo. Trabalha dorsal e bíceps.' },
                { nome: 'Extensão de coluna (banco romano)', series: '3×12', obs: 'Ajuste o banco na altura do quadril. Desça o tronco a 90° e suba até a posição neutra da coluna. Não hiperextenda.' },
                { nome: 'Tríceps corda (polia)', series: '3×12', obs: 'Cotovelos fixos ao lado do corpo. Estenda os antebraços para baixo abrindo levemente a corda. Sinta o tríceps contrair.' },
                { nome: 'Abdominal infra', series: '3×15', obs: 'De costas, pernas a 90°. Eleve o quadril do chão usando o abdômen inferior. Movimento pequeno e controlado, sem impulso.' },
              ],
              casa: [
                { nome: 'Remada curvada bilateral', series: '4×12', obs: 'Incline 45°, galão ou garrafas em ambas as mãos. Puxe simultaneamente até as costelas. Excelente para costas sem academia.' },
                { nome: 'Superman com pausa 3s', series: '3×10', obs: 'Eleve braços e pernas de bruços, segure 3s. Fortalece lombares, glúteos e músculos paravertebrais — essenciais para postura.' },
                { nome: 'Tríceps no banco', series: '3×10', obs: 'Mãos na borda do banco, pernas estendidas. Desça dobrando cotovelos a 90°. Empurre para voltar. Fortalece o tríceps.' },
                { nome: 'Prancha lateral com elevação de quadril', series: '3×8 cada', obs: 'Na posição de prancha lateral, desça o quadril quase no chão e suba. Oblíquos trabalhando muito.' },
              ],
            },
            {
              dia: 'Sexta', foco: 'Full Body Progressivo', duracao: '50 min', intensidade: 'Moderada',
              academia: [
                { nome: 'Agachamento + Press com halter', series: '4×10', obs: 'Agache com halteres nos ombros, ao subir, pressione acima da cabeça. Exercício composto que trabalha pernas, ombros e core.' },
                { nome: 'Remada curvada com barra/halter', series: '4×12', obs: 'Incline 45°, barra ou halteres. Puxe até o umbigo. Escápulas se aproximam. Costas retas — não arredonde.' },
                { nome: 'Afundo + Rosca bíceps', series: '3×10 cada', obs: 'No afundo, faça a rosca simultaneamente. Combina duas articulações, queima mais calorias e melhora coordenação.' },
                { nome: 'Prancha lateral', series: '3×20s cada', obs: 'Antebraços ou mão estendida. Quadril elevado, corpo em linha reta. Oblíquos trabalhando. Fundamental para coluna.' },
              ],
              casa: [
                { nome: 'Agachamento + Press com galão', series: '4×12', obs: 'Galão de água nos ombros. Agache e ao subir, pressione acima da cabeça. Legs + shoulders em um único movimento.' },
                { nome: 'Afundo caminhando', series: '3×10 cada', obs: 'Caminhe fazendo afundos consecutivos. Mais dinâmico e desafiador. Ativa glúteos, quadríceps e core.' },
                { nome: 'Flexão + Prancha', series: '3×8+15s', obs: 'Faça 8 flexões e imediatamente mantenha a prancha alta por 15s. Combinação brutal para peitoral, tríceps e core.' },
                { nome: 'Mountain climber controlado', series: '3×10 cada', obs: 'Em prancha, traga os joelhos alternados ao peito. Ritmo moderado para manter a forma. Core ativado.' },
              ],
              cardio: { tipo: 'HIIT adaptado: 30s esforço + 90s descanso', duracao: '10 min', fc: '120–145 bpm' },
            },
            {
              dia: 'Sábado', foco: 'Cardio Longo', duracao: '40 min', intensidade: 'Moderada',
              academia: [
                { nome: 'Bike ou Elíptico com resistência', series: '35 min', obs: 'Resistência moderada. Alterne 5 min leve + 5 min moderado. Excelente para saúde cardiovascular sem impacto.' },
                { nome: 'Alongamento muscular completo', series: '5 min', obs: 'Todos os grupos musculares. Respire fundo. Este momento pós-cardio é excelente para ganho de flexibilidade.' },
              ],
              casa: [
                { nome: 'Caminhada rápida ou dança', series: '35 min', obs: 'Ritmo que eleve a FC. Dança é especialmente boa — libera endorfina, alivia sintomas da menopausa e é divertida!' },
                { nome: 'Alongamento', series: '5 min', obs: 'Posterior de coxa, quadríceps, panturrilha, ombros. 20–30s cada posição. Termine com respiração profunda.' },
              ],
              cardio: { tipo: 'Aeróbico contínuo', duracao: '35 min', fc: '115–135 bpm' },
            },
            {
              dia: 'Domingo', foco: 'Descanso Merecido', duracao: '—', intensidade: 'Repouso',
              academia: [{ nome: '💪🏆 Você completou mais uma fase! Descanse com orgulho!', series: '—', obs: 'Recuperação é treino. Durma bem, alimente-se com proteínas e prepare-se para mais!' }],
              casa: [{ nome: '💪🏆 Incrível! Descanse — você merece muito!', series: '—', obs: 'Hidrate-se, coma bem e celebre cada semana concluída. Você está transformando seu corpo!' }],
            },
          ],
        },

        { semana: 'Semana 5–6', titulo: '💪 Fase de Força', descricao: 'Corpo adaptado! Foco em ganho muscular e resistência cardíaca.', desbloqueada: false, dias: [] },
        { semana: 'Semana 7–8', titulo: '🏆 Fase de Resultado', descricao: 'Reta final! Colha os frutos de 2 meses de dedicação.', desbloqueada: false, dias: [] },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // PÓS-MENOPAUSA
    // ════════════════════════════════════════════════════════════
    pos_menopausa: {
      nomePrograma: 'Protocolo Pós-Menopausa',
      semanas: [
        {
          semana: 'Semana 1–2', titulo: '🌱 Fase de Adaptação',
          descricao: 'Movimentos seguros. Foco em ossos, equilíbrio e coração.',
          desbloqueada: true,
          dias: [
            {
              dia: 'Segunda', foco: 'Fortalecimento Ósseo — Inferiores', duracao: '35 min', intensidade: 'Leve',
              academia: [
                { nome: 'Leg Press (carga leve)', series: '3×12', obs: 'Carga confortável. O treino de força com carga gera estímulo mecânico nos ossos, fundamental na pós-menopausa. Técnica perfeita.' },
                { nome: 'Cadeira Extensora', series: '3×12', obs: 'Amplitude completa. Suba controlado contraindo o quadríceps, desça em 3s. Fortalece o joelho e o fêmur.' },
                { nome: 'Panturrilha sentada', series: '3×15', obs: 'Suba na ponta dos pés com amplitude máxima. Fortalece a tíbia e a fíbula. Importante para equilíbrio e prevenção de quedas.' },
                { nome: 'Equilíbrio unipodal', series: '3×15s cada', obs: 'Fique em um pé por 15s. Use o aparelho para apoio se precisar. Estimula ossos do pé e tornozelo. Essencial para evitar quedas.' },
              ],
              casa: [
                { nome: 'Agachamento na cadeira', series: '3×10', obs: 'Use uma cadeira sólida. Sente lentamente até tocar e suba imediatamente. Joelhos alinhados. Fundamental para manter independência funcional.' },
                { nome: 'Elevação lateral de perna em pé', series: '3×10 cada', obs: 'Use a parede para apoio. Eleve a perna lateralmente a 30–45°. Fortalece glúteo médio, fundamental para equilíbrio.' },
                { nome: 'Ponte de glúteo', series: '3×12', obs: 'Empurre pelos calcanhares, contraia glúteo no topo. Fortalece quadril e lombar — regiões mais afetadas por osteoporose.' },
                { nome: 'Equilíbrio em um pé', series: '3×15s cada', obs: 'Mão na parede para segurança. Progrida para sem apoio. Reduz risco de quedas em até 40% quando praticado regularmente.' },
              ],
              cardio: { tipo: 'Caminhada suave', duracao: '10 min', fc: '90–110 bpm' },
            },
            {
              dia: 'Terça', foco: 'Cardio Suave', duracao: '30 min', intensidade: 'Muito Leve',
              academia: [
                { nome: 'Bike ergométrica (resistência baixa)', series: '20 min', obs: 'Resistência muito leve. Cadência confortável (50–70 RPM). Aeróbico de baixo impacto — ideal para articulações na pós-menopausa.' },
                { nome: 'Mobilidade articular suave', series: '10 min', obs: 'Círculos de ombro, quadril, tornozelo e pescoço. Movimentos lentos e suaves. Lubrifica as articulações e previne rigidez matinal.' },
              ],
              casa: [
                { nome: 'Caminhada leve', series: '20 min', obs: 'Ritmo bem confortável. A caminhada é o exercício aeróbico mais seguro e mais benéfico para ossos, coração e humor na pós-menopausa.' },
                { nome: 'Mobilidade articular sentada', series: '10 min', obs: 'Sentada numa cadeira: círculos de tornozelo, abertura dos braços, rotação suave do pescoço. Ideal para dias em que o corpo está mais rígido.' },
              ],
              cardio: { tipo: 'Caminhada contínua', duracao: '20 min', fc: '90–110 bpm' },
            },
            {
              dia: 'Quarta', foco: 'Superiores + Postura', duracao: '35 min', intensidade: 'Leve',
              academia: [
                { nome: 'Supino máquina (carga leve)', series: '3×10', obs: 'Carga muito leve para começar. Empurre com o peitoral, escápulas retraídas. Fortalece peitoral, ombros e tríceps para autonomia funcional.' },
                { nome: 'Puxada frontal', series: '3×10', obs: 'Puxe até o queixo, cotovelos para baixo. Fortalece dorsal e bíceps. Fundamental para postura — combate a cifose pós-menopausa.' },
                { nome: 'Remada sentada no cabo', series: '3×10', obs: 'Costas eretas, puxe até o umbigo. Ativa rombóides e trapézio médio — músculos essenciais para postura ereta.' },
                { nome: 'Prancha apoiada nos joelhos', series: '3×10s', obs: 'Joelhos no chão, antebraços apoiados. Abdômen contraído. Versão mais acessível da prancha. Protege o lombar.' },
              ],
              casa: [
                { nome: 'Flexão na parede', series: '3×10', obs: 'Mãos na parede, um passo atrás. Cotovelos dobram levemente ao se aproximar da parede. Fortalece peitoral e braços com baixíssimo impacto.' },
                { nome: 'Remada com garrafa', series: '3×10', obs: 'Incline 45°, garrafa em cada mão. Puxe até as costelas. Costas retas. Ativa dorsal e bíceps para melhorar postura.' },
                { nome: 'Elevação de braço alternada', series: '3×10 cada', obs: 'Em pé ou sentada. Eleve um braço à frente até a altura dos ombros, desça e alterne. Ativa deltóide anterior com baixa sobrecarga.' },
                { nome: 'Prancha nos joelhos', series: '3×10s', obs: 'Joelhos no chão, antebraços apoiados. Abdômen contraído. Aumente 5s a cada treino. Core forte previne dores lombares.' },
              ],
            },
            {
              dia: 'Quinta', foco: 'Funcional + Equilíbrio', duracao: '35 min', intensidade: 'Leve',
              academia: [
                { nome: 'Desenvolvimento com halter leve', series: '3×10', obs: 'Sentada, costas apoiadas. Pressione halteres leves acima da cabeça. Fortalece ombros para atividades do dia a dia (pegar objetos em altura).' },
                { nome: 'Extensão de costas no aparelho', series: '3×10', obs: 'Aparelho de hiperextensão. Desça o tronco suavemente e suba até a posição neutra. Fortalece eretores da coluna — crucial na pós-menopausa.' },
                { nome: 'Rosca bíceps com halter leve', series: '3×10', obs: 'Cotovelo fixo ao corpo. Movimentos de compras, subir escadas, carregar objetos ficam mais fáceis com bíceps fortes.' },
                { nome: 'Equilíbrio com peso', series: '3×15s cada', obs: 'Fique em um pé segurando um halter leve. Desafio maior para propriocepção. Essencial para prevenção de quedas.' },
              ],
              casa: [
                { nome: 'Desenvolvimento com garrafas (sentada)', series: '3×10', obs: 'Sentada, costas apoiadas. Pressione garrafas de 1L acima da cabeça. Seguro e eficaz para ombros.' },
                { nome: 'Superman suave', series: '3×10', obs: 'De bruços, eleve apenas os braços ou apenas as pernas. Versão mais suave para pós-menopausa. Fortalece lombares sem sobrecarga.' },
                { nome: 'Rosca com garrafa', series: '3×10', obs: 'Uma garrafa de 1,5L em cada mão. Cotovelos fixos. Fortalece bíceps para atividades funcionais do dia a dia.' },
                { nome: 'Equilíbrio tandem', series: '3×15s', obs: 'Fique com um pé na frente do outro (como andar na linha). Muito desafiador para equilíbrio. Use a parede se precisar.' },
              ],
            },
            {
              dia: 'Sexta', foco: 'Full Body Suave', duracao: '35 min', intensidade: 'Leve',
              academia: [
                { nome: 'Leg Press (carga leve)', series: '3×10', obs: 'Revisão da técnica. Adicione um pouco mais de carga se a semana 1-2 foi confortável. Mantenha controle total.' },
                { nome: 'Supino máquina', series: '3×10', obs: 'Revisão. Foco em sentir o peitoral trabalhando. Escápulas retraídas durante todo o movimento.' },
                { nome: 'Remada sentada', series: '3×10', obs: 'Revisão. Puxe até o umbigo, cotovelos para trás. Sinta as escápulas se aproximarem.' },
                { nome: 'Equilíbrio + Prancha', series: '3×10s', obs: 'Alterne: 10s de equilíbrio unipodal + 10s de prancha nos joelhos. Dois exercícios fundamentais para pós-menopausa.' },
              ],
              casa: [
                { nome: 'Agachamento assistido na cadeira', series: '3×10', obs: 'Use a cadeira como referência. Desça lento, toque levemente e suba. A versão assistida é mais segura e ainda muito eficaz.' },
                { nome: 'Flexão na mesa', series: '3×8', obs: 'Mãos na borda da mesa, corpo inclinado. Mais desafiador que na parede, mas mais fácil que no chão. Progressão gradual.' },
                { nome: 'Superman suave', series: '3×10', obs: 'Eleve apenas um braço e a perna oposta de cada vez. Versão mais controlada. Fortalece lombar sem sobrecarregar.' },
                { nome: 'Equilíbrio tandem', series: '3×15s', obs: 'Um pé na frente do outro. Progrida para olhos fechados quando ficar fácil. Estimula cerebelo e propriocepção.' },
              ],
              cardio: { tipo: 'Caminhada leve', duracao: '10 min', fc: '90–110 bpm' },
            },
            {
              dia: 'Sábado', foco: 'Cardio — Saúde do Coração', duracao: '30 min', intensidade: 'Leve',
              academia: [
                { nome: 'Caminhada na esteira ou bike', series: '30 min', obs: 'Ritmo confortável. Na pós-menopausa, 150 min/semana de aeróbico moderado reduz risco cardiovascular em até 35%.' },
              ],
              casa: [
                { nome: 'Caminhada ao ar livre', series: '30 min', obs: 'Ambiente agradável, companhia se possível. Sol da manhã para vitamina D. Ritmo que eleve levemente a respiração.' },
              ],
              cardio: { tipo: 'Aeróbico contínuo suave', duracao: '30 min', fc: '95–115 bpm' },
            },
            {
              dia: 'Domingo', foco: 'Descanso', duracao: '—', intensidade: 'Repouso',
              academia: [{ nome: '🛌 Cada treino é uma conquista! Descanse com orgulho.', series: '—', obs: 'O descanso é parte fundamental do programa. Hidrate-se, durma bem e prepare-se para continuar evoluindo.' }],
              casa: [{ nome: '🛌 Relaxe! Você está cuidando dos seus ossos, músculos e coração.', series: '—', obs: 'Alimentação rica em proteína e cálcio hoje ajuda na recuperação muscular e óssea para a próxima semana.' }],
            },
          ],
        },

        {
          semana: 'Semana 3–4', titulo: '🔥 Fase de Evolução',
          descricao: 'Corpo mais firme! Aumentamos a intensidade com segurança.',
          desbloqueada: true,
          dias: [
            {
              dia: 'Segunda', foco: 'Inferiores — Progressão', duracao: '40 min', intensidade: 'Leve-Moderada',
              academia: [
                { nome: 'Leg Press (mais carga)', series: '3×12', obs: 'Aumente 5–10% a carga. A progressão de carga é o estímulo que gera densidade óssea e força muscular.' },
                { nome: 'Cadeira Extensora', series: '3×12', obs: 'Aumente levemente a carga. Suba em 2s, desça em 3s. Fortalece o quadríceps — fundamental para subir e descer escadas.' },
                { nome: 'Stiff com halter leve', series: '3×10', obs: 'Introdução ao stiff. Halteres leves. Incline o tronco com costas retas, sinta o posterior de coxa. Volte erguendo com o quadril.' },
                { nome: 'Panturrilha em pé', series: '3×15', obs: 'Use aparelho ou segure halteres. Amplitude máxima. Fortalece gastrocnêmio e sóleo — músculos do equilíbrio.' },
              ],
              casa: [
                { nome: 'Agachamento livre (sem cadeira)', series: '3×10', obs: 'Progressão do agachamento na cadeira. Tente sem o apoio. Se necessário, tenha a cadeira por perto por segurança.' },
                { nome: 'Ponte unilateral', series: '3×10 cada', obs: 'Progressão da ponte bilateral. Uma perna levantada. Fortalece glúteo e lombar unilateralmente — melhora equilíbrio.' },
                { nome: 'Afundo reverso suave', series: '3×8 cada', obs: 'Passo para trás, mais seguro para joelhos. Tronco ereto. Use a parede para apoio inicial.' },
                { nome: 'Panturrilha na escada', series: '3×15', obs: 'Ponta do pé na borda. Calcanhar abaixo → ponta bem acima. Amplitude máxima. Fortalece panturrilha e tornozelo.' },
              ],
              cardio: { tipo: 'Caminhada com leve aceleração', duracao: '15 min', fc: '100–120 bpm' },
            },
            {
              dia: 'Terça', foco: 'Cardio Progressivo', duracao: '35 min', intensidade: 'Leve',
              academia: [
                { nome: 'Bike ou Elíptico', series: '25 min', obs: 'Aumente levemente a resistência em relação à semana 1-2. O elíptico é especialmente bom — sem impacto, mas muito eficaz.' },
                { nome: 'Mobilidade articular suave', series: '10 min', obs: 'Ombros, quadril, coluna. Movimentos circulares e de alongamento. Melhora amplitude de movimento e reduz rigidez.' },
              ],
              casa: [
                { nome: 'Caminhada com subidas leves', series: '25 min', obs: 'Busque pequenas subidas. Eleva a FC suavemente. Ativa glúteo e panturrilha mais do que na caminhada plana.' },
                { nome: 'Mobilidade em casa', series: '10 min', obs: 'Círculos de quadril, rotação de ombros, flexão lateral de tronco. Movimentos suaves e controlados.' },
              ],
              cardio: { tipo: 'Aeróbico contínuo leve', duracao: '25 min', fc: '95–115 bpm' },
            },
            {
              dia: 'Quarta', foco: 'Superiores + Postura Avançada', duracao: '40 min', intensidade: 'Leve',
              academia: [
                { nome: 'Supino máquina (mais carga)', series: '3×12', obs: 'Adicione 5% de carga. Empurre com o peitoral. Não use os ombros. Amplitude completa — fundamental para postura.' },
                { nome: 'Puxada frontal', series: '3×12', obs: 'Mais carga que nas semanas 1-2. Puxe até o queixo. Fortalece dorsal — combate a postura curvada comum na pós-menopausa.' },
                { nome: 'Elevação lateral com halter leve', series: '3×10', obs: 'Adicione halteres leves (2–4kg). Cotovelos levemente dobrados, eleve até os ombros. Fortalece deltóide médio.' },
                { nome: 'Prancha frontal', series: '3×15s', obs: 'Progressão da prancha nos joelhos. Tente a prancha completa (pontas dos pés). Se difícil, alterne entre as duas.' },
              ],
              casa: [
                { nome: 'Flexão na mesa (mais inclinada)', series: '3×10', obs: 'Posicione as mãos numa superfície mais baixa (banco, cadeira firme) para mais dificuldade. Progressão gradual.' },
                { nome: 'Remada curvada com galão', series: '3×10', obs: 'Use um galão de 5L. Incline 45°, puxe até as costelas. Mais resistência que as garrafas — progressão ideal.' },
                { nome: 'Desenvolvimento com garrafas maiores', series: '3×10', obs: 'Garrafas de 1,5–2L. Pressione acima da cabeça. Fortalece ombros para autonomia nas atividades diárias.' },
                { nome: 'Prancha frontal (tentativa)', series: '3×10s', obs: 'Tente a prancha completa nos pés. 10s é o objetivo inicial. Abdômen contraído, quadril em linha com o corpo.' },
              ],
            },
            {
              dia: 'Quinta', foco: 'Bíceps + Costas + Core', duracao: '35 min', intensidade: 'Leve',
              academia: [
                { nome: 'Rosca direta com halter', series: '3×10', obs: 'Cotovelos fixos ao corpo. Flexione controladamente. Fortalece bíceps — essencial para carregar sacolas e objetos no dia a dia.' },
                { nome: 'Puxada supina (pegada invertida)', series: '3×10', obs: 'Palmas voltadas para você. Puxe até o queixo. Trabalha bíceps e dorsal simultaneamente.' },
                { nome: 'Extensão de coluna', series: '3×10', obs: 'No aparelho ou no chão (Superman). Fortalece eretores da coluna — previne dor lombar e melhora postura.' },
                { nome: 'Crunch abdominal', series: '3×12', obs: 'Suba apenas o tronco superior. Expire ao subir. Core forte protege a coluna e melhora equilíbrio.' },
              ],
              casa: [
                { nome: 'Rosca com garrafas (sentada)', series: '3×10', obs: 'Sentada para mais segurança. Cotovelos fixos. Garrafas de 1,5–2L. Fortalece bíceps funcionalmente.' },
                { nome: 'Superman', series: '3×10', obs: 'De bruços, eleve braços e pernas simultaneamente. Segure 2s. Fundamental para costas e prevenção de cifose.' },
                { nome: 'Remada curvada', series: '3×10', obs: 'Galão ou garrafas. Incline, puxe até as costelas. Costas retas. Melhora postura e fortalece dorsal.' },
                { nome: 'Crunch suave', series: '3×12', obs: 'Mãos nas têmporas (não atrás da cabeça). Suba apenas o tronco superior. Lombar colada no chão.' },
              ],
            },
            {
              dia: 'Sexta', foco: 'Full Body — Progressão', duracao: '40 min', intensidade: 'Leve-Moderada',
              academia: [
                { nome: 'Agachamento Smith (leve)', series: '3×12', obs: 'Introdução ao agachamento guiado. Mais seguro que o livre. Carga muito leve. Foco na técnica perfeita.' },
                { nome: 'Supino máquina', series: '3×10', obs: 'Full body significa revisitar todos os grupos musculares. Foco na conexão mente-músculo — sinta o peitoral trabalhando.' },
                { nome: 'Remada sentada', series: '3×10', obs: 'Revisão e progressão. Puxe até o umbigo, escápulas se aproximam. Costas retas.' },
                { nome: 'Equilíbrio + Prancha alternados', series: '3×(15s+10s)', obs: '15s de equilíbrio unipodal + 10s de prancha nos joelhos. Os dois exercícios mais importantes para pós-menopausa.' },
              ],
              casa: [
                { nome: 'Agachamento livre', series: '3×12', obs: 'Já sem a cadeira como apoio. Descida lenta (3s), subida controlada. Adicione a mochila para progressão.' },
                { nome: 'Flexão na mesa', series: '3×8', obs: 'Use uma mesa baixa para mais dificuldade. Progredindo para o banco e depois o chão.' },
                { nome: 'Superman', series: '3×10', obs: 'Eleve completamente, segure 3s. Costas mais fortes a cada semana.' },
                { nome: 'Equilíbrio tandem olhos fechados', series: '3×10s', obs: 'Avançado! Um pé na frente do outro, olhos fechados. Use a parede ao lado por segurança.' },
              ],
              cardio: { tipo: 'Caminhada moderada', duracao: '12 min', fc: '100–118 bpm' },
            },
            {
              dia: 'Sábado', foco: 'Cardio + Saúde Cardíaca', duracao: '35 min', intensidade: 'Leve',
              academia: [
                { nome: 'Caminhada na esteira ou bike', series: '35 min', obs: 'Mais duração que nas semanas 1-2. Ritmo confortável mas constante. 35 min de aeróbico é excelente para o coração.' },
              ],
              casa: [
                { nome: 'Caminhada ou dança leve', series: '35 min', obs: 'Aumentamos 5 min em relação às semanas anteriores. Qualquer atividade aeróbica que você goste. Celebre cada minuto!' },
              ],
              cardio: { tipo: 'Aeróbico contínuo', duracao: '35 min', fc: '95–115 bpm' },
            },
            {
              dia: 'Domingo', foco: 'Descanso', duracao: '—', intensidade: 'Repouso',
              academia: [{ nome: '🏆 Fase de Evolução concluída! Você está mais forte!', series: '—', obs: 'Descanse com orgulho. Cada treino é um ato de amor por você mesma. Continue!' }],
              casa: [{ nome: '🏆 Parabéns! Mais uma semana transformando seu corpo e saúde!', series: '—', obs: 'Hidrate-se, alimente-se bem e prepare-se para as próximas fases. O melhor ainda está por vir!' }],
            },
          ],
        },

        { semana: 'Semana 5–6', titulo: '💪 Fase de Força', descricao: 'Músculos e ossos mais fortes. Equilíbrio e confiança crescendo.', desbloqueada: false, dias: [] },
        { semana: 'Semana 7–8', titulo: '🏆 Fase de Resultado', descricao: 'Autonomia total nos movimentos e hábitos consolidados para a vida!', desbloqueada: false, dias: [] },
      ],
    },
  }

  return base[fase].semanas
}

// ── TRILHAS DE LONGA DURAÇÃO ──────────────────────────────────────────────────
type TrilhaAtiva = '8sem' | '90d' | '180d' | '360d'

type FaseTrilhaLonga = {
  periodo: string
  titulo: string
  icone: string
  descricao: string
  foco_treino: string[]
  foco_nutricao: string[]
  meta: string
  desbloqueada: boolean
}

const TRILHAS_LONGAS: Record<Exclude<TrilhaAtiva, '8sem'>, {
  label: string
  duracao: string
  descricao: string
  imagem: string
  fases: FaseTrilhaLonga[]
}> = {
  '90d': {
    label: '90 Dias — Transformação Completa',
    duracao: '3 meses',
    descricao: 'Do zero ao novo hábito. Corpo e mente transformados em 90 dias de consistência.',
    imagem: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    fases: [
      {
        periodo: 'Mês 1',
        titulo: 'Construindo a Base',
        icone: '🌱',
        descricao: 'Aprenda os movimentos, ajuste a alimentação e estabeleça a rotina de treino.',
        foco_treino: ['Força 3×/semana', 'Técnica e postura', 'Cardio leve 2×/semana'],
        foco_nutricao: ['Proteína 1,2g/kg', 'Hidratação 2L+/dia', 'Redução de ultraprocessados'],
        meta: 'Dominar os movimentos básicos · -2 a 3kg · Mais energia no dia a dia',
        desbloqueada: true,
      },
      {
        periodo: 'Mês 2',
        titulo: 'Intensificando',
        icone: '🔥',
        descricao: 'Carga aumentada, novo cardio estratégico e refinamento nutricional.',
        foco_treino: ['Força 4×/semana', 'Carga +20%', 'HIIT 1×/semana'],
        foco_nutricao: ['Proteína 1,4g/kg', 'Pré e pós-treino', 'Ciclo de carboidratos'],
        meta: '-3 a 4kg adicionais · +15% força · Sono regulado',
        desbloqueada: false,
      },
      {
        periodo: 'Mês 3',
        titulo: 'Performance e Resultado',
        icone: '💪',
        descricao: 'Periodização avançada e consolidação definitiva dos hábitos.',
        foco_treino: ['Força 4×/semana', 'Periodização ondulatória', 'Aeróbico 150min/semana'],
        foco_nutricao: ['Nutrição peri-treino', 'Suplementação estratégica', 'Refeed semanal'],
        meta: 'Corpo transformado · Hábitos consolidados · Nova composição corporal',
        desbloqueada: false,
      },
    ],
  },
  '180d': {
    label: '180 Dias — Nova Você',
    duracao: '6 meses',
    descricao: 'Meio ano de evolução progressiva. Resultados visíveis, duráveis e sustentáveis.',
    imagem: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    fases: [
      {
        periodo: 'Meses 1–3',
        titulo: 'Fundação e Adaptação',
        icone: '🌱',
        descricao: 'Base sólida de técnica, alimentação e consistência nos treinos.',
        foco_treino: ['Força 3-4×/semana', 'Todos os grupos musculares', 'Cardio progressivo'],
        foco_nutricao: ['Proteína 1,2-1,4g/kg', 'Déficit calórico moderado', 'Hidratação e fibras'],
        meta: '-5 a 7kg · Força real percebida · Energia e sono melhorados',
        desbloqueada: true,
      },
      {
        periodo: 'Meses 4–6',
        titulo: 'Transformação Profunda',
        icone: '🚀',
        descricao: 'Sculpting, força avançada e recomposição corporal completa.',
        foco_treino: ['Força 4-5×/semana', 'Divisão avançada', 'HIIT 2×/semana'],
        foco_nutricao: ['Periodização nutricional', 'Proteína 1,6g/kg', 'Suplementação completa'],
        meta: '-10 a 12kg totais · Massa muscular visível · Hábitos automáticos',
        desbloqueada: false,
      },
    ],
  },
  '360d': {
    label: '360 Dias — Jornada Completa',
    duracao: '1 ano · 4 trimestres',
    descricao: 'A transformação mais profunda e duradoura. Quatro trimestres, quatro versões de você.',
    imagem: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    fases: [
      {
        periodo: 'Trimestre 1 · Meses 1–3',
        titulo: 'Fundação',
        icone: '🌱',
        descricao: 'Estabeleça a base sólida de treino, alimentação e mentalidade.',
        foco_treino: ['Força 3×/semana', 'Técnica e mobilidade', 'Cardio leve 2×/semana'],
        foco_nutricao: ['Proteína 1,2g/kg', 'Redução de ultraprocessados', 'Hidratação'],
        meta: '-3 a 5kg · Domínio técnico · Rotina estabelecida',
        desbloqueada: true,
      },
      {
        periodo: 'Trimestre 2 · Meses 4–6',
        titulo: 'Consolidação',
        icone: '🔥',
        descricao: 'Aumento de carga, cardio estratégico e refinamento nutricional.',
        foco_treino: ['Força 4×/semana', 'Carga progressiva', 'HIIT semanal'],
        foco_nutricao: ['Periodização calórica', 'Pré e pós-treino', 'Micronutrientes'],
        meta: '-8 a 10kg totais · Força elevada · Composição corporal melhorada',
        desbloqueada: false,
      },
      {
        periodo: 'Trimestre 3 · Meses 7–9',
        titulo: 'Performance',
        icone: '💪',
        descricao: 'Força avançada, sculpting e longevidade celular ativa.',
        foco_treino: ['Força 4-5×/semana', 'Periodização avançada', 'Aeróbico 200min+/semana'],
        foco_nutricao: ['Suplementação estratégica', 'Proteína 1,6g/kg', 'Dieta anti-inflamatória'],
        meta: '-12 a 15kg totais · Massa muscular visível · Exames laboratoriais melhorados',
        desbloqueada: false,
      },
      {
        periodo: 'Trimestre 4 · Meses 10–12',
        titulo: 'Maestria',
        icone: '🏆',
        descricao: 'Autonomia total. Você é sua própria treinadora e nutricionista.',
        foco_treino: ['Força 5×/semana', 'Especialização por grupo', 'Esporte ou atividade de prazer'],
        foco_nutricao: ['Nutrição intuitiva', 'Flexibilidade alimentar', 'Manutenção inteligente'],
        meta: 'Corpo e saúde transformados · Hábitos permanentes · Longevidade ativa',
        desbloqueada: false,
      },
    ],
  },
}

// ── NUTRIÇÃO POR FASE ─────────────────────────────────────────────────────────
const NUTRICAO_POR_FASE: Record<FaseMenopausa, { dicas: string[]; alimentos: string[]; evitar: string[] }> = {
  pre_menopausa: {
    dicas: ['Priorize 25–30g de proteína por refeição', 'Inclua fibras em cada refeição', 'Mínimo 2L de água por dia', 'Refeições a cada 3–4 horas'],
    alimentos: ['Frango e peixe', 'Ovos', 'Quinoa e aveia', 'Frutas vermelhas', 'Folhosos verdes', 'Azeite extra-virgem'],
    evitar: ['Açúcar refinado', 'Ultra processados', 'Álcool em excesso', 'Excesso de sódio'],
  },
  menopausa: {
    dicas: ['Proteína: 1,3–1,5g por kg/dia', 'Priorize cálcio e Vitamina D', 'Reduza carboidratos simples', 'Inclua fitoestrógenos (soja, linhaça)'],
    alimentos: ['Sardinha e salmão', 'Iogurte grego', 'Linhaça e chia', 'Grão-de-bico', 'Tofu', 'Couve e brócolis'],
    evitar: ['Cafeína excessiva', 'Alimentos picantes', 'Álcool', 'Farinhas brancas'],
  },
  pos_menopausa: {
    dicas: ['Proteína: 1,4–1,6g/kg contra sarcopenia', 'Cálcio + Vit D diariamente', 'Ômega-3 para coração e cérebro', 'Refeições menores e frequentes'],
    alimentos: ['Peixes gordurosos', 'Ovos caipiras', 'Laticínios com Ca', 'Vegetais coloridos', 'Sementes', 'Chá verde'],
    evitar: ['Sódio elevado', 'Gordura saturada', 'Álcool', 'Açúcar refinado'],
  },
}

// ── MENTALIDADE POR FASE (com detalhes para modal) ───────────────────────────
type PraticaMente = { titulo: string; desc: string; icon: string; detalhe: string }
const MENTALIDADE_POR_FASE: Record<FaseMenopausa, { praticas: PraticaMente[] }> = {
  pre_menopausa: {
    praticas: [
      {
        titulo: 'Meditação Matinal', icon: '🧘‍♀️',
        desc: '10 minutos ao acordar para centrar a mente.',
        detalhe: 'Reserve os primeiros 10 minutos do dia para sentar em silêncio, fechar os olhos e focar na respiração. Quando pensamentos aparecerem, observe-os sem julgamento e volte ao foco. Essa prática regula o cortisol matinal — hormônio do estresse que está elevado nesta fase — e prepara a mente para o dia com mais clareza e menos ansiedade. Estudos mostram redução de 40% nos episódios de ansiedade em mulheres na pré-menopausa que praticam meditação diária por 8 semanas.',
      },
      {
        titulo: 'Diário de Gratidão', icon: '📓',
        desc: 'Anote 3 coisas positivas ao final do dia.',
        detalhe: 'Antes de dormir, escreva 3 coisas pelas quais você é grata hoje — podem ser simples como uma boa refeição, uma conversa agradável ou um momento de sol. Essa prática re-treina o cérebro para notar o positivo, combatendo o viés negativo natural da mente. Melhora a qualidade do sono, reduz ruminação e aumenta a sensação de bem-estar. Em 21 dias de prática, é possível notar mudança significativa no humor e na perspectiva sobre a vida.',
      },
      {
        titulo: 'Sono de Qualidade', icon: '🌙',
        desc: '7–8h com rotina consistente de horários.',
        detalhe: 'O sono é quando o corpo produz GH (hormônio do crescimento), repara músculos e consolida memórias. Na pré-menopausa, as flutuações hormonais já começam a prejudicar o sono. Estratégias: mantenha horários fixos (mesmo nos fins de semana), elimine telas 60 min antes de dormir, mantenha o quarto fresco (18–20°C), escuro e silencioso. Evite cafeína após 14h e álcool à noite. Suplemento de magnésio glicina (300mg) e melatonina de baixa dose (0,5–1mg) podem ajudar com orientação médica.',
      },
      {
        titulo: 'Conexão Social', icon: '💗',
        desc: 'Vínculos afetivos protegem o cérebro e o coração.',
        detalhe: 'Isolamento social é fator de risco equivalente a fumar 15 cigarros por dia para saúde cardiovascular e cognitiva. Cultive relações próximas: ligue para amigas regularmente, participe de grupos (treino, leitura, hobbies), agende encontros presenciais. Relações de qualidade reduzem cortisol, aumentam ocitocina e serotonina, e são um dos maiores preditores de longevidade. Uma boa rede social também cria responsabilidade social para manter hábitos saudáveis.',
      },
    ],
  },
  menopausa: {
    praticas: [
      {
        titulo: 'Respiração 4-7-8', icon: '🫁',
        desc: 'Técnica comprovada para aliviar fogachos na hora.',
        detalhe: 'Inspire pelo nariz por 4 segundos → segure o ar por 7 segundos → expire lentamente pela boca por 8 segundos. Repita 4 vezes. Esta técnica ativa o sistema nervoso parassimpático, revertendo a resposta de "luta ou fuga" que desencadeia os fogachos. Ao sentir um fogacho chegando, inicie imediatamente a respiração: estudos mostram redução de 39% na intensidade dos episódios. Pratique também diariamente (manhã e noite) para treinamento do sistema nervoso autônomo.',
      },
      {
        titulo: 'Mindfulness', icon: '🧘‍♀️',
        desc: '15 min/dia reduz sintomas da menopausa em até 30%.',
        detalhe: 'Mindfulness é a prática de focar completamente no momento presente, sem julgamento. Diferente de meditação formal, pode ser feito em qualquer atividade: comer com atenção plena, lavar louça observando as sensações, caminhar percebendo cada passo. Estudos específicos em mulheres na menopausa mostram redução de 30% em fogachos, 40% em insônia e 50% em irritabilidade com 8 semanas de prática. O app gratuito "Insight Timer" tem guias em português para iniciantes.',
      },
      {
        titulo: 'Autocuidado Intencional', icon: '✨',
        desc: 'Rituais de cuidado próprio sem culpa — você merece.',
        detalhe: 'Autocuidado não é egoísmo: é manutenção. Nas mulheres na menopausa, o cortisol elevado acelera o envelhecimento, prejudica o sono e amplifica os sintomas. Rituais de prazer reduzem cortisol e aumentam serotonina. Exemplos: banho quente com sal de Epsom (magnésio pela pele), leitura de prazer por 20 min, música que você ama, massagem nos pés, skincare cuidadoso, jardinagem. O segredo é a regularidade — escolha 1 ou 2 rituais e faça todo dia, mesmo que por poucos minutos.',
      },
      {
        titulo: 'Reformulação Positiva', icon: '💪',
        desc: 'Menopausa é transição de poder, não de fim.',
        detalhe: 'A forma como você pensa sobre a menopausa afeta diretamente sua experiência física dela. Culturas que veem a menopausa como libertação (fim de menstruação, gravidez) reportam significativamente menos sintomas do que culturas que a veem como declínio. Pratique substituir pensamentos negativos ("estou ficando velha", "estou perdendo feminilidade") por perspectivas de crescimento ("estou ganhando sabedoria", "meu corpo está se adaptando", "esta fase traz liberdade"). Journaling e terapia cognitivo-comportamental são ferramentas poderosas aqui.',
      },
    ],
  },
  pos_menopausa: {
    praticas: [
      {
        titulo: 'Estimulação Cognitiva', icon: '🧠',
        desc: 'Exercite o cérebro diariamente para prevenir declínio.',
        detalhe: 'O cérebro tem neuroplasticidade — capacidade de criar novas conexões — em qualquer idade, mas precisa de desafios para isso. Atividades que exigem aprendizado novo são as mais protetoras: aprender um instrumento, idioma, artesanato, culinária nova, programação. Jogos de memória, palavras cruzadas e sudoku ajudam mas têm efeito limitado se forem sempre os mesmos. Combine estimulação cognitiva com exercício físico: a combinação de aeróbico + força + aprendizado reduz o risco de Alzheimer em até 60%.',
      },
      {
        titulo: 'Vida Social Ativa', icon: '🤝',
        desc: 'Socializar é tão importante quanto exercício para longevidade.',
        detalhe: 'Após a menopausa, quando filhos crescem, carreiras mudam e relacionamentos evoluem, o isolamento social pode surgir de forma gradual e perigosa. Mulheres socialmente ativas vivem em média 7 anos mais e têm 50% menos risco de demência. Ações práticas: participe de um grupo de treino presencial (duplo benefício: social + físico), faça voluntariado, ingresse em grupos de interesses (leitura, culinária, viagem), mantenha contato semanal com amigas próximas. Qualidade supera quantidade: 3-4 relações profundas protegem mais que muitos conhecidos.',
      },
      {
        titulo: 'Propósito e Significado', icon: '🌟',
        desc: 'Ter um "por quê" aumenta longevidade e felicidade.',
        detalhe: 'O conceito japonês "Ikigai" (razão de ser) é um dos fatores explicativos da longevidade em Okinawa. Mulheres com forte senso de propósito têm 2,4x menos risco de doença cardiovascular. Propósito não precisa ser grandioso: pode ser cultivar um jardim, apoiar a família, ensinar algo que sabe, criar artesanato, cuidar de animais. Reflita: o que te faz levantar com vontade? O que você faria mesmo sem pagamento? O que o mundo precisa que você pode oferecer? Esse cruzamento é seu propósito.',
      },
      {
        titulo: 'Relaxamento Profundo', icon: '🌸',
        desc: 'Estresse crônico acelera envelhecimento — controle é possível.',
        detalhe: 'O estresse crônico eleva cortisol continuamente, o que na pós-menopausa (sem o efeito protetor do estrogênio) acelera inflamação, encurtamento de telômeros (marcadores de envelhecimento celular), perda óssea e muscular. Técnicas de relaxamento profundo: yoga restaurativa (posições passivas por 5–10 min), body scan (varredura corporal de atenção dos pés à cabeça), banho de floresta (caminhada lenta em natureza por 20 min), respiração diafragmática. Consistência é mais importante que duração — 10 min diários superam 1h semanal.',
      },
    ],
  },
}

// ── GAMIFICAÇÃO ───────────────────────────────────────────────────────────────
const NIVEIS = [
  { nivel: 1, nome: 'Semente',     icone: '🌱', cor: 'from-green-400 to-green-600',    minXP: 0    },
  { nivel: 2, nome: 'Ativa',       icone: '⚡', cor: 'from-yellow-400 to-amber-500',   minXP: 100  },
  { nivel: 3, nome: 'Determinada', icone: '💪', cor: 'from-blue-400 to-blue-600',      minXP: 250  },
  { nivel: 4, nome: 'Guerreira',   icone: '🔥', cor: 'from-rosa-400 to-rosa-600',      minXP: 500  },
  { nivel: 5, nome: 'Campeã',      icone: '🏆', cor: 'from-ouro-300 to-ouro-500',      minXP: 1000 },
]

interface Badge { id: string; icon: string; titulo: string; desc: string; conquistada: boolean }

function calcularXP(logs: TreinoLog[]): number {
  if (!logs.length) return 0
  let xp = 0
  // 10 XP por treino base
  xp += logs.length * 10
  // +5 XP por treino com duração ≥45 min
  logs.forEach(l => {
    const minutos = parseInt(l.duracao || '0')
    if (minutos >= 45) xp += 5
  })
  // Agrupar por semana ISO
  const porSemana: Record<string, number> = {}
  logs.forEach(l => {
    const d = new Date(l.data + 'T12:00:00')
    const jan1 = new Date(d.getFullYear(), 0, 1)
    const sem = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
    const chave = `${d.getFullYear()}-${sem}`
    porSemana[chave] = (porSemana[chave] || 0) + 1
  })
  Object.values(porSemana).forEach(qtd => {
    if (qtd >= 3) xp += 20   // semana com ≥3 treinos
    if (qtd >= 5) xp += 15   // bônus semana completa (≥5)
  })
  return xp
}

function getNivel(xp: number) {
  let nivel = NIVEIS[0]
  for (const n of NIVEIS) { if (xp >= n.minXP) nivel = n }
  return nivel
}

function calcularBadges(logs: TreinoLog[], streak: number): Badge[] {
  const total = logs.length
  const academiaCount = logs.filter(l => l.local === 'academia').length
  const mesAtual = new Date().toISOString().slice(0, 7)
  const treinesMes = logs.filter(l => l.data.startsWith(mesAtual)).length
  const temSemanaCheia = (() => {
    const porSemana: Record<string, number> = {}
    logs.forEach(l => {
      const d = new Date(l.data + 'T12:00:00')
      const jan1 = new Date(d.getFullYear(), 0, 1)
      const sem = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
      const chave = `${d.getFullYear()}-${sem}`
      porSemana[chave] = (porSemana[chave] || 0) + 1
    })
    return Object.values(porSemana).some(q => q >= 5)
  })()

  return [
    { id: 'primeiro',   icon: '🌟', titulo: 'Primeiro Passo',   desc: 'Complete seu 1º treino',          conquistada: total >= 1      },
    { id: 'cincoTreinos', icon: '💪', titulo: 'Em Ritmo',       desc: '5 treinos concluídos',             conquistada: total >= 5      },
    { id: 'streak7',    icon: '🔥', titulo: 'Semana de Fogo',   desc: '7 dias consecutivos',             conquistada: streak >= 7     },
    { id: 'semanaCheia',icon: '⭐', titulo: 'Semana Perfeita',  desc: '5 treinos numa semana',           conquistada: temSemanaCheia  },
    { id: '30treinos',  icon: '🎯', titulo: 'Comprometida',     desc: '30 treinos no total',             conquistada: total >= 30     },
    { id: 'academia20', icon: '🏋️', titulo: 'Academia Pro',     desc: '20 treinos na academia',          conquistada: academiaCount >= 20 },
    { id: 'desafio',    icon: '📅', titulo: 'Desafiante',       desc: '12 treinos num mês',              conquistada: treinesMes >= 12},
    { id: '50treinos',  icon: '🦁', titulo: 'Leoa',             desc: '50 treinos concluídos',           conquistada: total >= 50     },
    { id: '100treinos', icon: '🏆', titulo: 'Campeã',           desc: '100 treinos — lenda!',            conquistada: total >= 100    },
  ]
}

function calcularDesafioMensal(logs: TreinoLog[]) {
  const mesAtual = new Date().toISOString().slice(0, 7)
  const feitos = logs.filter(l => l.data.startsWith(mesAtual)).length
  const meta = 12
  return { feitos, meta, pct: Math.min(100, Math.round((feitos / meta) * 100)) }
}

// ── QUERIES DE VÍDEO OTIMIZADAS POR EXERCÍCIO ────────────────────────────────
// Garante que cada exercício mostre o vídeo correto, sem ambiguidade
const QUERY_EXERCICIOS: Record<string, string> = {
  // ── INFERIORES ──
  'Leg Press 45°': 'leg press 45 graus academia como fazer tutorial passo a passo',
  'Cadeira Extensora': 'cadeira extensora quadríceps academia como fazer tutorial',
  'Cadeira Flexora': 'cadeira flexora isquiotibiais academia como fazer tutorial',
  'Panturrilha sentada': 'panturrilha sentada aparelho academia como fazer tutorial',
  'Panturrilha em pé': 'panturrilha em pé academia como fazer tutorial',
  'Panturrilha na escada': 'panturrilha na escada em casa exercício tutorial',
  'Elevação de panturrilha em pé': 'elevação de panturrilha em pé sem equipamento tutorial',
  'Agachamento livre': 'agachamento livre execução correta tutorial passo a passo',
  'Agachamento Smith': 'agachamento no smith machine academia como fazer tutorial',
  'Agachamento livre ou Smith': 'agachamento livre academia execução correta tutorial',
  'Agachamento livre/Smith': 'agachamento livre ou smith machine academia tutorial',
  'Agachamento na máquina/Smith': 'agachamento na máquina smith academia tutorial',
  'Agachamento Smith (leve)': 'agachamento smith machine iniciante carga leve tutorial',
  'Agachamento sumô': 'agachamento sumô execução correta tutorial passo a passo',
  'Agachamento sumô com peso': 'agachamento sumô com halter ou kettlebell tutorial',
  'Agachamento na cadeira': 'agachamento assistido sentando na cadeira exercício tutorial',
  'Agachamento isométrico na parede': 'agachamento isométrico na parede wall sit tutorial',
  'Agachamento búlgaro': 'agachamento búlgaro exercício perna como fazer tutorial',
  'Agachamento livre (sem cadeira)': 'agachamento livre iniciante execução tutorial',
  'Afundo alternado': 'afundo alternado com passada exercício perna tutorial passo a passo',
  'Afundo caminhando': 'afundo caminhando walking lunge exercício em casa tutorial passo a passo',
  'Afundo reverso': 'afundo reverso passada para trás exercício perna tutorial',
  'Afundo reverso suave': 'afundo reverso passada para trás iniciante exercício tutorial',
  'Avanço (afundo) com halteres': 'afundo avanço com halteres academia exercício perna tutorial',
  'Afundo + Rosca bíceps': 'afundo com rosca bíceps exercício funcional combinado tutorial',
  'Stiff (levantamento terra romeno)': 'stiff levantamento terra romeno com halter isquiotibial tutorial',
  'Stiff com halter': 'stiff levantamento terra romeno com halter academia tutorial',
  'Stiff com halter leve': 'stiff levantamento terra romeno iniciante carga leve tutorial',
  'Ponte de glúteo': 'ponte de glúteo exercício em casa tutorial passo a passo',
  'Ponte de glúteo unilateral': 'ponte de glúteo unilateral uma perna exercício tutorial',
  'Ponte unilateral': 'ponte glúteo unilateral uma perna exercício tutorial',
  'Abdução lateral em pé': 'abdução de quadril lateral em pé exercício tutorial',
  'Cadeira Abdutora': 'cadeira abdutora academia como fazer tutorial',
  'Cadeira Adutora': 'cadeira adutora academia como fazer tutorial',
  'Elevação lateral de perna em pé': 'elevação lateral de perna em pé glúteo exercício tutorial',
  // ── SUPERIORES ──
  'Supino máquina': 'supino máquina peitoral academia como fazer tutorial',
  'Supino reto com halter': 'supino reto com halter peitoral academia como fazer tutorial',
  'Supino inclinado máquina': 'supino inclinado máquina peitoral academia como fazer tutorial',
  'Supino inclinado': 'supino inclinado peitoral academia como fazer tutorial',
  'Puxada frontal': 'puxada frontal costas academia como fazer tutorial passo a passo',
  'Puxada frontal pronada': 'puxada frontal pegada pronada costas academia tutorial',
  'Puxada pronada': 'puxada pronada costas latíssimo academia tutorial',
  'Puxada supina (pegada invertida)': 'puxada supina pegada invertida bíceps costas academia tutorial',
  'Puxada triângulo (pegada neutra)': 'puxada triângulo pegada neutra costas academia tutorial',
  'Remada baixa sentada': 'remada baixa sentada cabo costas academia como fazer tutorial',
  'Remada sentada no cabo': 'remada sentada cabo costas academia como fazer tutorial',
  'Remada baixa no cabo': 'remada baixa cabo costas academia como fazer tutorial',
  'Remada unilateral com halter': 'remada unilateral com halter costas academia como fazer tutorial',
  'Remada curvada com halter': 'remada curvada com halter costas como fazer tutorial',
  'Remada curvada com barra/halter': 'remada curvada com barra ou halter costas academia tutorial',
  'Remada curvada com elástico/galão': 'remada curvada com elástico em casa como fazer tutorial',
  'Remada curvada com elástico ou galão': 'remada curvada com elástico galão em casa tutorial',
  'Remada curvada com mochila': 'remada curvada com mochila em casa exercício tutorial',
  'Remada curvada bilateral': 'remada curvada bilateral exercício costas tutorial',
  'Remada curvada com galão': 'remada curvada com galão de água em casa tutorial',
  'Remada curvada': 'remada curvada costas exercício como fazer tutorial',
  'Remada com garrafa de água': 'remada curvada com garrafa de água em casa tutorial',
  'Remada com garrafa 2L': 'remada curvada com garrafa 2 litros em casa exercício tutorial',
  'Remada com garrafa': 'remada curvada com garrafa em casa exercício tutorial',
  'Remada com elástico ou galão': 'remada com elástico galão em casa tutorial',
  'Desenvolvimento com halter (ombros)': 'desenvolvimento com halter ombros como fazer tutorial',
  'Desenvolvimento com halter leve': 'desenvolvimento ombros halter leve iniciante tutorial',
  'Desenvolvimento com garrafas': 'desenvolvimento ombros com garrafas em casa tutorial',
  'Desenvolvimento com garrafas (sentada)': 'desenvolvimento ombros garrafas sentada em casa tutorial',
  'Desenvolvimento com garrafas maiores': 'desenvolvimento ombros com garrafas em casa tutorial',
  'Elevação lateral com halter': 'elevação lateral ombros com halter academia como fazer tutorial',
  'Elevação lateral com halter leve': 'elevação lateral ombros halter leve iniciante tutorial',
  'Elevação lateral com garrafas': 'elevação lateral ombros com garrafa em casa tutorial',
  'Elevação lateral': 'elevação lateral ombros academia como fazer tutorial',
  'Elevação frontal': 'elevação frontal ombros como fazer tutorial',
  'Elevação frontal com halter': 'elevação frontal com halter ombros academia tutorial',
  'Elevação frontal + lateral com garrafas': 'elevação frontal lateral ombros garrafas em casa tutorial',
  'Elevação de braço alternada': 'elevação frontal de braço alternada ombros exercício tutorial',
  'Rosca direta com barra/halter': 'rosca direta barra halter bíceps academia como fazer tutorial',
  'Rosca bíceps com barra': 'rosca direta barra bíceps academia como fazer tutorial',
  'Rosca bíceps alternada': 'rosca alternada com halter bíceps academia como fazer tutorial',
  'Rosca direta com halter': 'rosca direta com halter bíceps academia como fazer tutorial',
  'Rosca concentrada': 'rosca concentrada bíceps com halter academia como fazer tutorial',
  'Rosca com garrafas de água': 'rosca bíceps com garrafa de água em casa como fazer tutorial',
  'Rosca com garrafa': 'rosca bíceps com garrafa em casa exercício tutorial',
  'Rosca com garrafas (sentada)': 'rosca bíceps garrafa sentada em casa como fazer tutorial',
  'Tríceps polia alta': 'tríceps polia alta corda extensão academia como fazer tutorial',
  'Tríceps corda (polia)': 'tríceps corda polia extensão academia como fazer tutorial',
  'Tríceps no banco/cadeira': 'tríceps no banco mergulho exercício como fazer tutorial',
  'Tríceps no banco': 'tríceps no banco mergulho exercício como fazer tutorial',
  'Extensão de coluna (banco romano)': 'extensão de coluna banco romano academia como fazer tutorial',
  'Extensão de costas no aparelho': 'extensão de costas lombar aparelho academia tutorial',
  'Extensão de coluna': 'extensão de coluna banco romano como fazer tutorial',
  // ── CORE ──
  'Prancha frontal': 'prancha abdominal frontal exercício como fazer tutorial',
  'Prancha no chão': 'prancha abdominal no chão exercício como fazer tutorial',
  'Prancha abdominal': 'prancha abdominal exercício como fazer tutorial',
  'Prancha com toque no ombro': 'prancha com toque no ombro core exercício tutorial',
  'Prancha com alcance': 'prancha com alcance de braço core exercício tutorial',
  'Prancha com alcance de braço': 'prancha com alcance de braço core exercício tutorial',
  'Prancha lateral': 'prancha lateral oblíquo exercício como fazer tutorial',
  'Prancha lateral com elevação de quadril': 'prancha lateral com elevação de quadril exercício tutorial',
  'Prancha apoiada nos joelhos': 'prancha de joelhos iniciante exercício abdominal tutorial',
  'Prancha nos joelhos': 'prancha de joelhos iniciante exercício abdominal tutorial',
  'Prancha frontal (tentativa)': 'prancha frontal abdominal exercício como fazer tutorial',
  'Crunch abdominal': 'crunch abdominal execução correta como fazer tutorial',
  'Crunch inverso': 'crunch inverso elevação de pernas abdominal exercício tutorial',
  'Abdominal crunch': 'crunch abdominal execução correta como fazer tutorial',
  'Abdominal infra (elevação de pernas)': 'abdominal infra elevação de pernas exercício tutorial',
  'Bicicleta abdominal': 'bicicleta abdominal exercício oblíquo tutorial passo a passo',
  'Tesoura abdominal': 'tesoura abdominal exercício core como fazer tutorial',
  'Dead Bug': 'dead bug exercício core abdominal estabilização tutorial',
  'Superman': 'superman exercício costas lombar em casa como fazer tutorial',
  'Superman com pausa': 'superman com pausa exercício costas lombar tutorial',
  'Superman suave': 'superman exercício costas lombar suave iniciante tutorial',
  'Mountain climber leve': 'mountain climber exercício cardio funcional como fazer tutorial',
  'Mountain climber controlado': 'mountain climber controlado exercício tutorial passo a passo',
  // ── FUNCIONAIS/COMBINADOS ──
  'Agachamento + Desenvolvimento (combinado)': 'agachamento com desenvolvimento ombros exercício funcional combinado tutorial',
  'Agachamento + Press com halter': 'agachamento com press ombros halter exercício funcional academia tutorial',
  'Agachamento + Press com galão': 'agachamento com press ombros galão em casa exercício funcional tutorial',
  'Flexão de joelhos': 'flexão de braço de joelhos iniciante como fazer tutorial',
  'Flexão inclinada na mesa': 'flexão inclinada na mesa exercício como fazer tutorial',
  'Flexão na parede': 'flexão na parede exercício iniciante como fazer tutorial',
  'Flexão na mesa': 'flexão inclinada na mesa exercício como fazer tutorial',
  'Flexão na mesa (mais inclinada)': 'flexão inclinada mesa maior inclinação exercício tutorial',
  'Flexão completa (ou de joelhos)': 'flexão de braço completa ou de joelhos como fazer tutorial',
  'Flexão + Prancha': 'flexão de braço com prancha exercício funcional combinado tutorial',
  // ── CARDIO / MOBILIDADE ──
  'Bike ou Elíptico': 'bike ergométrica elíptico academia cardio tutorial',
  'Bike ou Elíptico com resistência': 'bike ergométrica com resistência cardio academia tutorial',
  'Bike ergométrica': 'bike ergométrica exercício cardio como usar tutorial',
  'Bike ergométrica (resistência baixa)': 'bike ergométrica iniciante cardio academia tutorial',
  'Esteira — caminhada inclinada': 'caminhada na esteira inclinação exercício como fazer tutorial',
  'Esteira — intervalado progressivo': 'treino intervalado na esteira academia tutorial',
  'Esteira — intervalado': 'treino intervalado na esteira academia tutorial',
  'Caminhada na esteira ou bike': 'caminhada na esteira academia exercício tutorial',
  'Caminhada ao ar livre': 'caminhada ao ar livre exercício saúde benefícios tutorial',
  'Caminhada no bairro': 'caminhada ao ar livre exercício saúde como caminhar tutorial',
  'Caminhada ou pedalada ao ar livre': 'caminhada ao ar livre exercício aeróbico tutorial',
  'Caminhada com subidas/escadas': 'caminhada com subidas escadas exercício cardio tutorial',
  'Caminhada com subidas': 'caminhada com subidas aeróbico exercício tutorial',
  'Caminhada rápida ou dança': 'caminhada rápida exercício aeróbico saúde tutorial',
  'Corrida leve ou caminhada rápida': 'corrida leve ou caminhada rápida exercício cardio tutorial',
  'Caminhada, natação ou dança': 'caminhada ao ar livre exercício aeróbico saúde tutorial',
  'Equilíbrio unipodal': 'exercício equilíbrio em um pé unipodal tutorial como fazer',
  'Equilíbrio em um pé': 'exercício equilíbrio em um pé tutorial como fazer',
  'Equilíbrio tandem': 'exercício equilíbrio tandem pé na frente do outro tutorial',
  'Equilíbrio tandem olhos fechados': 'exercício equilíbrio tandem olhos fechados tutorial',
  'Equilíbrio + Prancha': 'exercício equilíbrio prancha funcional tutorial',
  'Equilíbrio com peso': 'exercício equilíbrio com peso funcional tutorial',
  'Mobilidade articular': 'exercício mobilidade articular aquecimento tutorial',
  'Mobilidade articular suave': 'mobilidade articular suave exercício tutorial',
  'Mobilidade articular sentada': 'mobilidade articular sentada exercício tutorial',
  'Mobilidade em casa': 'exercício mobilidade articular em casa tutorial',
  'Alongamento dinâmico': 'alongamento dinâmico exercício pré-treino tutorial',
  'Alongamento dinâmico pós-cardio': 'alongamento dinâmico pós-treino exercício tutorial',
  'Alongamento de membros inferiores': 'alongamento perna coxa panturrilha tutorial',
  'Alongamento muscular': 'alongamento muscular completo pós-treino tutorial',
  'Alongamento muscular completo': 'alongamento muscular completo corpo pós-treino tutorial',
  'Alongamento ao ar livre': 'alongamento ao ar livre exercício tutorial',
  'Alongamento pós-atividade': 'alongamento após exercício recuperação tutorial',
  'Alongamento em casa': 'alongamento em casa exercício tutorial',
  'Alongamento completo': 'alongamento completo corpo inteiro tutorial',
}

const intensidadeColor = (i: string) => {
  if (i === 'Muito Leve' || i === 'Repouso') return 'bg-blue-50 text-blue-600'
  if (i === 'Leve' || i === 'Leve-Moderada') return 'bg-green-50 text-green-600'
  if (i === 'Moderada') return 'bg-ouro-50 text-ouro-600'
  return 'bg-rosa-50 text-rosa-600'
}

const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
// ── helpers de streak ────────────────────────────────────────────────────────
function calcularStreak(logs: TreinoLog[]): number {
  if (!logs.length) return 0
  const datas = [...new Set(logs.map(l => l.data))].sort().reverse()
  const hoje = new Date().toISOString().split('T')[0]
  let streak = 0
  let esperado = hoje
  for (const data of datas) {
    if (data === esperado) {
      streak++
      const d = new Date(esperado + 'T12:00:00')
      d.setDate(d.getDate() - 1)
      esperado = d.toISOString().split('T')[0]
    } else if (data < esperado) {
      break
    }
  }
  return streak
}

function streakLabel(n: number): string {
  if (n === 0) return 'Comece hoje!'
  if (n === 1) return '1 dia seguido 🌱'
  if (n < 7)  return `${n} dias seguidos 💪`
  if (n < 14) return `${n} dias — incrível! 🔥`
  if (n < 30) return `${n} dias — você é imparável! 🔥🔥`
  return `${n} dias — lenda! 🏆`
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ActionPlan() {
  const { user, profile } = useAuth()
  const [plano, setPlano] = useState<PlanoAcao | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'treino' | 'mentalidade'>('treino')
  const [menteTab, setMenteTab] = useState<'praticas' | 'sono'>('praticas')
  const [menteModal, setMenteModal] = useState<PraticaMente | null>(null)
  const [local, setLocal] = useState<'academia' | 'casa'>('academia')
  const [trilhaAtiva, setTrilhaAtiva] = useState<TrilhaAtiva>('8sem')
  const [semanaAtiva, setSemanaAtiva] = useState(0)
  const [expandedDia, setExpandedDia] = useState<number | null>(null)

  // Streak & registro diário
  const [treinoLogs, setTreinoLogs] = useState<TreinoLog[]>([])
  const [marcando, setMarcando] = useState(false)

  // Checkboxes de exercícios: chave = `${diaIndex}-${local}-${exercicioIndex}`
  const [exerciciosMarcados, setExerciciosMarcados] = useState<Record<string, boolean>>({})

  // Modal de vídeo embutido
  const [videoModal, setVideoModal] = useState<{ nome: string; videoId: string | null; erro: boolean } | null>(null)

  const abrirVideo = async (exercicio: string, localExercicio: 'academia' | 'casa') => {
    setVideoModal({ nome: exercicio, videoId: null, erro: false })
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY
    if (!apiKey) { setVideoModal({ nome: exercicio, videoId: null, erro: true }); return }
    try {
      // Usa query otimizada do dicionário ou gera com contexto de local
      const queryCustom = QUERY_EXERCICIOS[exercicio]
      const queryFallback = localExercicio === 'casa'
        ? `${exercicio} exercício em casa sem equipamento como fazer tutorial`
        : `${exercicio} academia como fazer exercício tutorial passo a passo`
      const q = encodeURIComponent(queryCustom || queryFallback)
      const url = `https://www.googleapis.com/youtube/v3/search?part=id&type=video&maxResults=1&q=${q}&key=${apiKey}&relevanceLanguage=pt&regionCode=BR&videoDuration=short`
      const res = await fetch(url)
      const data = await res.json()
      const videoId = data.items?.[0]?.id?.videoId
      if (videoId) {
        setVideoModal({ nome: exercicio, videoId, erro: false })
      } else {
        setVideoModal({ nome: exercicio, videoId: null, erro: true })
      }
    } catch {
      setVideoModal({ nome: exercicio, videoId: null, erro: true })
    }
  }

  useEffect(() => {
    let mounted = true
    if (user) {
      loadData(mounted)
    } else {
      // Sem usuário: não há o que carregar — libera o spinner imediatamente
      setLoading(false)
    }
    return () => { mounted = false }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async (mounted = true) => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    try {
      const [planoRes, logsRes] = await Promise.all([
        supabase.from('planos_acao').select('*').eq('user_id', user.id).maybeSingle(),
        getTreinoLogs(user.id, 60),
      ])
      if (!mounted) return // componente desmontado durante o fetch — ignora
      if (planoRes.data) {
        setPlano(planoRes.data as PlanoAcao)
        if (planoRes.data.trilha_ativa) setTrilhaAtiva(planoRes.data.trilha_ativa as TrilhaAtiva)
      }
      if (logsRes.data) setTreinoLogs(logsRes.data as TreinoLog[])
    } catch (e) {
      console.error('ActionPlan loadData error:', e)
    } finally {
      if (mounted) setLoading(false)
    }
  }

  const salvarTrilha = async (nova: TrilhaAtiva) => {
    setTrilhaAtiva(nova)
    if (!user || !plano) return
    await supabase
      .from('planos_acao')
      .update({ trilha_ativa: nova, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
  }

  const marcarTreinoConcluido = async (foco: string, duracao: string) => {
    if (!user || marcando) return
    setMarcando(true)
    const hoje = new Date().toISOString().split('T')[0]
    await saveTreinoLog({ user_id: user.id, data: hoje, foco, duracao, local })
    const { data } = await getTreinoLogs(user.id, 60)
    if (data) setTreinoLogs(data as TreinoLog[])
    setMarcando(false)
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-rosa-500 animate-spin" />
      </div>
    )
  }

  const fase = (profile?.fase_menopausa || 'menopausa') as FaseMenopausa
  const objetivo = (profile?.objetivo || 'saude') as Objetivo
  const programa = gerarPrograma(fase)
  const nutricao = NUTRICAO_POR_FASE[fase]
  const mentalidade = MENTALIDADE_POR_FASE[fase]
  const semana = programa[semanaAtiva]

  const metas = {
    calorias: plano?.meta_calorias || (objetivo === 'emagrecer' ? 1400 : objetivo === 'hipertrofia' ? 1900 : 1600),
    proteinas: plano?.meta_proteinas || (fase === 'pos_menopausa' ? 100 : 85),
    gorduras: plano?.meta_gorduras || 55,
    carboidratos: plano?.meta_carboidratos || 160,
  }

  const hojeIndex = new Date().getDay()
  const diaHoje = diasSemana[hojeIndex]
  const treinoHoje = semana.desbloqueada ? semana.dias.find(d => d.dia === diaHoje) : null
  const trilhaSelecionada = trilhaAtiva !== '8sem' ? TRILHAS_LONGAS[trilhaAtiva] : null

  // Streak
  const hoje = new Date().toISOString().split('T')[0]
  const streak = calcularStreak(treinoLogs)
  const treinoHojeConcluido = treinoLogs.some(l => l.data === hoje)

  // Gamificação
  const xpTotal = calcularXP(treinoLogs)
  const nivel = getNivel(xpTotal)
  const nivelIndex = NIVEIS.findIndex(n => n.nivel === nivel.nivel)
  const proximoNivel = NIVEIS[nivelIndex + 1] || null
  const xpParaProximo = proximoNivel ? proximoNivel.minXP - nivel.minXP : 0
  const xpNoNivel = proximoNivel ? xpTotal - nivel.minXP : xpParaProximo
  const pctXP = proximoNivel ? Math.min(100, Math.round((xpNoNivel / xpParaProximo) * 100)) : 100
  const badges = calcularBadges(treinoLogs, streak)
  const desafio = calcularDesafioMensal(treinoLogs)

  // Mini-calendário: últimos 21 dias
  const ultimos21 = Array.from({ length: 21 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (20 - i))
    return d.toISOString().split('T')[0]
  })
  const diasFeitos = new Set(treinoLogs.map(l => l.data))

  const tabs = [
    { key: 'treino' as const, label: 'Treino', icon: <Dumbbell size={16} /> },
    { key: 'mentalidade' as const, label: 'Mente', icon: <Brain size={16} /> },
  ]

  return (
    <div className="page-container">
      <h1 className="page-title">Plano de Ação</h1>
      <p className="page-subtitle">
        {fase === 'pre_menopausa' ? 'Pré-Menopausa' : fase === 'menopausa' ? 'Menopausa' : 'Pós-Menopausa'}
        {' · '}Sua jornada de evolução
      </p>

      {/* ── STREAK BANNER ── */}
      <div className={`mb-4 rounded-2xl p-4 flex items-center gap-4 ${
        streak >= 7 ? 'bg-gradient-to-r from-ouro-400 to-orange-400' :
        streak >= 1 ? 'bg-gradient-to-r from-rosa-400 to-rosa-500' :
        'bg-gray-100'
      }`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${
          streak >= 1 ? 'bg-white/20' : 'bg-gray-200'
        }`}>
          {streak >= 7 ? '🏆' : streak >= 1 ? '🔥' : '💤'}
        </div>
        <div className="flex-1">
          <p className={`font-bold text-base ${streak >= 1 ? 'text-white' : 'text-gray-500'}`}>
            {streak >= 1 ? `${streak} dia${streak > 1 ? 's' : ''} consecutivo${streak > 1 ? 's' : ''}!` : 'Nenhum treino registrado'}
          </p>
          <p className={`text-xs ${streak >= 1 ? 'text-white/80' : 'text-gray-400'}`}>
            {streakLabel(streak)}
          </p>
        </div>
        {treinoHojeConcluido && (
          <div className="bg-white/20 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-white" />
            <span className="text-xs font-bold text-white">Hoje ✓</span>
          </div>
        )}
      </div>

      {/* ── MINI CALENDÁRIO (21 dias) ── */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={15} className="text-rosa-400" />
          <span className="text-sm font-semibold text-gray-700">Histórico de Treinos</span>
          <span className="ml-auto text-xs text-gray-400">{treinoLogs.length} treino{treinoLogs.length !== 1 ? 's' : ''} registrados</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {['D','S','T','Q','Q','S','S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] text-gray-400 font-semibold">{d}</div>
          ))}
          {ultimos21.map((data, i) => {
            const feito = diasFeitos.has(data)
            const ehHoje = data === hoje
            return (
              <div key={i} title={data}
                className={`h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                  ehHoje
                    ? feito
                      ? 'bg-green-500 text-white ring-2 ring-green-300'
                      : 'bg-rosa-100 text-rosa-600 ring-2 ring-rosa-300'
                    : feito
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-50 text-gray-300'
                }`}>
                {feito ? '✓' : new Date(data + 'T12:00:00').getDate()}
              </div>
            )
          })}
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          Verde = treino feito · Rosa = hoje
        </p>
      </div>

      {/* ── GAMIFICAÇÃO CARD ── */}
      <div className="card mb-4 overflow-hidden">
        {/* Nível + XP */}
        <div className={`-mx-4 -mt-4 mb-4 bg-gradient-to-r ${nivel.cor} px-4 pt-4 pb-5`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shrink-0">
              {nivel.icone}
            </div>
            <div className="flex-1">
              <p className="text-white/70 text-[10px] font-semibold uppercase tracking-wider">Nível {nivel.nivel}</p>
              <p className="text-white font-bold text-lg leading-tight">{nivel.nome}</p>
              <p className="text-white/80 text-xs">{xpTotal} XP total</p>
            </div>
            {proximoNivel && (
              <div className="text-right">
                <p className="text-white/60 text-[10px]">próximo</p>
                <p className="text-white text-sm font-bold">{proximoNivel.icone} {proximoNivel.nome}</p>
                <p className="text-white/70 text-[10px]">{proximoNivel.minXP - xpTotal} XP</p>
              </div>
            )}
          </div>
          {/* Barra de XP */}
          <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-700"
              style={{ width: `${pctXP}%` }}
            />
          </div>
          <p className="text-white/60 text-[10px] mt-1 text-right">{pctXP}% para {proximoNivel?.nome || 'máximo'}</p>
        </div>

        {/* Desafio mensal */}
        <div className="mb-4 p-3 bg-rosa-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              <div>
                <p className="text-sm font-bold text-gray-800">Desafio do Mês</p>
                <p className="text-xs text-gray-500">{desafio.feitos} de {desafio.meta} treinos</p>
              </div>
            </div>
            <span className={`text-sm font-bold ${desafio.feitos >= desafio.meta ? 'text-green-600' : 'text-rosa-600'}`}>
              {desafio.feitos >= desafio.meta ? '✅ Completo!' : `${desafio.pct}%`}
            </span>
          </div>
          <div className="h-2 bg-rosa-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${desafio.feitos >= desafio.meta ? 'bg-green-500' : 'bg-rosa-500'}`}
              style={{ width: `${desafio.pct}%` }}
            />
          </div>
        </div>

        {/* Medalhas */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-2">
            🏅 Medalhas <span className="text-xs font-normal text-gray-400">({badges.filter(b => b.conquistada).length}/{badges.length})</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {badges.map(badge => (
              <div
                key={badge.id}
                className={`rounded-xl p-2 flex flex-col items-center gap-1 text-center transition-all ${
                  badge.conquistada
                    ? 'bg-ouro-50 border border-ouro-200'
                    : 'bg-gray-50 border border-gray-100 opacity-50 grayscale'
                }`}
              >
                <span className="text-xl">{badge.icon}</span>
                <p className="text-[10px] font-bold text-gray-700 leading-tight">{badge.titulo}</p>
                <p className="text-[9px] text-gray-400 leading-tight">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Treino de hoje — destaque com imagem + botão marcar */}
      {treinoHoje && treinoHoje.foco !== 'Descanso Total' && treinoHoje.foco !== 'Descanso Merecido' && treinoHoje.foco !== 'Descanso' && (
        <div className="mb-4 rounded-2xl overflow-hidden relative">
          <img
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80"
            alt="Treino de hoje"
            className="w-full h-36 object-cover object-center"
          />
          <div className="absolute inset-0 p-4 flex flex-col justify-end"
            style={{ background: 'linear-gradient(to top, rgba(183,110,121,0.95) 40%, rgba(183,110,121,0.3) 100%)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Star size={14} className="text-ouro-300" />
              <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Treino de Hoje — {diaHoje}</span>
            </div>
            <p className="font-bold text-lg text-white mb-1">{treinoHoje.foco}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-white/80">
                <span>⏱ {treinoHoje.duracao}</span>
                <span className="w-px h-3 bg-white/30" />
                <span>💪 {treinoHoje.intensidade}</span>
                {treinoHoje.cardio && (
                  <>
                    <span className="w-px h-3 bg-white/30" />
                    <span>❤️ {treinoHoje.cardio.duracao}</span>
                  </>
                )}
              </div>
              {/* Status */}
              {treinoHojeConcluido ? (
                <div className="flex items-center gap-1.5 bg-green-400/90 rounded-xl px-3 py-1.5">
                  <CheckCircle2 size={15} className="text-white" />
                  <span className="text-xs font-bold text-white">Concluído!</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-1.5">
                  <span className="text-xs font-bold text-white/80">Abra ↓ e marque</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-4">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.key ? 'bg-white text-rosa-500 shadow-sm' : 'text-gray-500'
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ ABA TREINO ═══ */}
      {activeTab === 'treino' && (
        <div className="space-y-3">
          {plano?.treino_descricao ? (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-2">Protocolo da Consultora</h3>
              <p className="text-base text-gray-600 leading-relaxed whitespace-pre-wrap">{plano.treino_descricao}</p>
            </div>
          ) : (
            <>
              {/* ── Seletor de Jornada ── */}
              <div className="card pb-3">
                <h3 className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-2">
                  <TrendingUp size={15} className="text-ouro-500" /> Sua Jornada de Evolução
                </h3>
                <div className="grid grid-cols-4 gap-1.5">
                  {([
                    { id: '8sem' as TrilhaAtiva, label: '8 sem' },
                    { id: '90d' as TrilhaAtiva, label: '90 dias' },
                    { id: '180d' as TrilhaAtiva, label: '180 dias' },
                    { id: '360d' as TrilhaAtiva, label: '1 ano' },
                  ]).map(t => (
                    <button key={t.id} onClick={() => salvarTrilha(t.id)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        trilhaAtiva === t.id
                          ? 'bg-rosa-500 text-white shadow-sm'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── TRILHA 8 SEMANAS (padrão) ── */}
              {trilhaAtiva === '8sem' && (
                <>
                  {/* Toggle Academia / Casa */}
                  <div className="flex gap-2 mb-1">
                    <button onClick={() => setLocal('academia')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                        local === 'academia' ? 'bg-rosa-500 text-white shadow-md' : 'bg-white border-2 border-gray-200 text-gray-500'
                      }`}>
                      <Building2 size={16} /> Academia
                    </button>
                    <button onClick={() => setLocal('casa')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                        local === 'casa' ? 'bg-rosa-500 text-white shadow-md' : 'bg-white border-2 border-gray-200 text-gray-500'
                      }`}>
                      <Home size={16} /> Em Casa
                    </button>
                  </div>

                  {/* Progressão — Seletor de semana */}
                  <div className="card">
                    <h3 className="font-semibold text-gray-800 text-base mb-3 flex items-center gap-2">
                      <Trophy size={16} className="text-ouro-500" /> Progressão de 8 Semanas
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {programa.map((sem, i) => (
                        <button key={i} onClick={() => sem.desbloqueada && setSemanaAtiva(i)}
                          className={`relative p-3 rounded-xl text-left transition-all ${
                            !sem.desbloqueada
                              ? 'bg-gray-50 opacity-60 cursor-not-allowed'
                              : semanaAtiva === i
                                ? 'bg-rosa-50 border-2 border-rosa-400'
                                : 'bg-white border-2 border-gray-100 hover:border-gray-200'
                          }`}>
                          {!sem.desbloqueada && (
                            <Lock size={12} className="absolute top-2 right-2 text-gray-300" />
                          )}
                          {sem.desbloqueada && semanaAtiva === i && (
                            <Check size={12} className="absolute top-2 right-2 text-rosa-500" />
                          )}
                          <p className="text-xs text-gray-400 font-medium">{sem.semana}</p>
                          <p className="text-sm font-bold text-gray-700 mt-0.5">{sem.titulo}</p>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center italic">{semana.descricao}</p>
                  </div>

                  {/* Lista de dias da semana selecionada */}
                  {semana.desbloqueada && semana.dias.length > 0 && semana.dias.map((d, i) => {
                    const exercicios = local === 'academia' ? d.academia : d.casa
                    return (
                      <div key={i}
                        className={`card cursor-pointer transition-all ${d.dia === diaHoje ? 'border-rosa-300 border-2' : ''}`}
                        onClick={() => setExpandedDia(expandedDia === i ? null : i)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {d.dia === diaHoje && <div className="w-2.5 h-2.5 rounded-full bg-rosa-500 animate-pulse flex-shrink-0" />}
                            <div>
                              <p className={`font-semibold text-base ${d.dia === diaHoje ? 'text-rosa-600' : 'text-gray-800'}`}>
                                {d.dia} {d.dia === diaHoje ? '· Hoje' : ''}
                              </p>
                              <p className="text-sm text-gray-500">{d.foco}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${intensidadeColor(d.intensidade)}`}>
                              {d.intensidade}
                            </span>
                            {expandedDia === i ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                          </div>
                        </div>

                        {expandedDia === i && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            {/* Info */}
                            <div className="flex gap-3 text-sm text-gray-500 mb-3">
                              <span>⏱ {d.duracao}</span>
                              {d.cardio && <span>❤️ Cardio: {d.cardio.duracao}</span>}
                            </div>

                            {/* Exercícios */}
                            {(() => {
                              const todosFeitos = exercicios
                                .filter(ex => !ex.nome.startsWith('🛌'))
                                .every((_, j) => exerciciosMarcados[`${i}-${local}-${j}`])
                              const algumExercicio = exercicios.some(ex => !ex.nome.startsWith('🛌'))
                              const ehHojeExpanded = d.dia === diaHoje
                              const jaConcluido = ehHojeExpanded && treinoHojeConcluido
                              return (
                                <div className="space-y-3">
                                  {exercicios.map((ex, j) => {
                                    const isDescanso = ex.nome.startsWith('🛌') || ex.nome.startsWith('🏆') || ex.nome.startsWith('💪')
                                    const chave = `${i}-${local}-${j}`
                                    const marcado = !!exerciciosMarcados[chave]
                                    return (
                                      <div key={j} className={`rounded-xl px-3 pt-2.5 pb-3 transition-all ${marcado && !isDescanso ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                                        {/* Nome + séries + checkbox */}
                                        <div className="flex items-center gap-2 mb-2">
                                          {!isDescanso && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                setExerciciosMarcados(prev => ({ ...prev, [chave]: !prev[chave] }))
                                              }}
                                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                                marcado
                                                  ? 'bg-green-500 border-green-500'
                                                  : 'border-gray-300 bg-white'
                                              }`}
                                            >
                                              {marcado && <Check size={13} className="text-white" />}
                                            </button>
                                          )}
                                          <p className={`text-sm font-semibold flex-1 ${marcado && !isDescanso ? 'text-green-700 line-through opacity-70' : 'text-gray-800'}`}>{ex.nome}</p>
                                          <span className="text-sm font-bold text-rosa-500 ml-1 shrink-0 bg-rosa-50 px-2 py-0.5 rounded-lg">{ex.series}</span>
                                        </div>
                                        {/* Como fazer */}
                                        {ex.obs && !isDescanso && !marcado && (
                                          <div className="mb-2.5 p-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                              <span>📋</span> Como fazer
                                            </p>
                                            <p className="text-xs text-gray-700 leading-relaxed">{ex.obs}</p>
                                          </div>
                                        )}
                                        {/* Botão YouTube */}
                                        {!isDescanso && !marcado && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              abrirVideo(ex.nome, local)
                                            }}
                                            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white text-sm font-bold shadow-sm"
                                          >
                                            <PlayCircle size={17} />
                                            ▶ Ver vídeo demonstrativo
                                          </button>
                                        )}
                                      </div>
                                    )
                                  })}

                                  {/* Botão de conclusão do treino */}
                                  {algumExercicio && (
                                    <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                                      {jaConcluido ? (
                                        <div className="flex items-center justify-center gap-2 py-3 bg-green-50 rounded-xl">
                                          <CheckCircle2 size={18} className="text-green-500" />
                                          <span className="text-sm font-bold text-green-600">Treino registrado no calendário! ✓</span>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            marcarTreinoConcluido(d.foco, d.duracao)
                                          }}
                                          disabled={!todosFeitos || marcando}
                                          className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                                            todosFeitos
                                              ? 'bg-green-500 text-white shadow-md hover:bg-green-600 active:scale-95'
                                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                          }`}
                                        >
                                          {marcando
                                            ? <Loader2 size={16} className="animate-spin" />
                                            : <CheckCircle2 size={16} />
                                          }
                                          {todosFeitos
                                            ? '🏆 Registrar Treino no Calendário'
                                            : (() => {
                                                const total = exercicios.filter(ex => !ex.nome.startsWith('🛌')).length
                                                const feitos = Object.keys(exerciciosMarcados).filter(k => k.startsWith(`${i}-${local}-`) && exerciciosMarcados[k]).length
                                                return `Marque todos os exercícios (${feitos}/${total} feitos)`
                                              })()
                                          }
                                        </button>
                                      )}
                                      {!todosFeitos && !jaConcluido && (
                                        <p className="text-[10px] text-gray-400 text-center mt-1.5">
                                          ✓ Marque cada exercício acima ao concluí-lo
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            })()}

                            {/* Cardio */}
                            {d.cardio && (
                              <div className="mt-3 bg-red-50 rounded-xl p-3 flex items-center gap-3">
                                <Heart size={18} className="text-red-400 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-semibold text-red-600">Cardio: {d.cardio.tipo}</p>
                                  <p className="text-xs text-red-400">
                                    {d.cardio.duracao} {d.cardio.fc && `· FC alvo: ${d.cardio.fc}`}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Semana bloqueada */}
                  {!semana.desbloqueada && (
                    <div className="card text-center py-8">
                      <Lock size={32} className="mx-auto text-gray-300 mb-3" />
                      <p className="font-semibold text-gray-600 mb-1">Fase Bloqueada</p>
                      <p className="text-sm text-gray-400">Complete as semanas anteriores para desbloquear esta fase.</p>
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <Zap size={14} className="text-ouro-500" />
                        <span className="text-xs text-ouro-600 font-medium">Continue treinando — você está quase lá!</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── TRILHAS DE LONGA DURAÇÃO (90d / 180d / 360d) ── */}
              {trilhaSelecionada && (
                <>
                  {/* Hero Banner */}
                  <div className="relative rounded-2xl overflow-hidden h-32">
                    <img
                      src={trilhaSelecionada.imagem}
                      alt={trilhaSelecionada.label}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end p-4"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 100%)' }}>
                      <p className="font-bold text-white text-base leading-tight">{trilhaSelecionada.label}</p>
                      <p className="text-white/75 text-xs mt-0.5">{trilhaSelecionada.descricao}</p>
                    </div>
                  </div>

                  {/* Fases da Trilha */}
                  {trilhaSelecionada.fases.map((ft, i) => (
                    <div key={i} className={`card transition-all ${!ft.desbloqueada ? 'opacity-80' : ''}`}>
                      <div className="flex items-start gap-3">
                        {/* Ícone / Status */}
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
                          ft.desbloqueada ? 'bg-rosa-50' : 'bg-gray-50'
                        }`}>
                          {ft.desbloqueada
                            ? <span>{ft.icone}</span>
                            : <Lock size={16} className="text-gray-300" />
                          }
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <p className="text-[11px] text-gray-400 font-medium">{ft.periodo}</p>
                            {!ft.desbloqueada && (
                              <span className="text-[10px] bg-ouro-50 text-ouro-600 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                                🔓 Assinatura ativa
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-gray-800 text-sm">{ft.icone} {ft.titulo}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{ft.descricao}</p>

                          {/* Detalhes — apenas ft desbloqueada */}
                          {ft.desbloqueada && (
                            <div className="mt-3 space-y-2">
                              <div className="bg-rosa-50 rounded-xl p-2.5">
                                <p className="text-[11px] font-semibold text-rosa-700 mb-1.5">🏋️‍♀️ Foco de Treino</p>
                                <div className="flex flex-wrap gap-1">
                                  {ft.foco_treino.map((f, j) => (
                                    <span key={j} className="text-[10px] bg-white text-rosa-600 px-2 py-0.5 rounded-full border border-rosa-100">{f}</span>
                                  ))}
                                </div>
                              </div>
                              <div className="bg-green-50 rounded-xl p-2.5">
                                <p className="text-[11px] font-semibold text-green-700 mb-1.5">🥗 Foco Nutricional</p>
                                <div className="flex flex-wrap gap-1">
                                  {ft.foco_nutricao.map((f, j) => (
                                    <span key={j} className="text-[10px] bg-white text-green-600 px-2 py-0.5 rounded-full border border-green-100">{f}</span>
                                  ))}
                                </div>
                              </div>
                              <div className="bg-ouro-50 rounded-xl p-2.5">
                                <p className="text-[11px] font-semibold text-ouro-700 mb-1">🎯 Resultado Esperado</p>
                                <p className="text-[11px] text-ouro-600 leading-relaxed">{ft.meta}</p>
                              </div>
                            </div>
                          )}

                          {/* Preview bloqueada */}
                          {!ft.desbloqueada && (
                            <p className="text-[11px] text-gray-400 mt-1.5">🎯 {ft.meta}</p>
                          )}
                        </div>
                      </div>

                      {/* Conector vertical entre fases */}
                      {i < trilhaSelecionada.fases.length - 1 && (
                        <div className="ml-5 mt-3 flex items-center gap-1">
                          <div className="w-px h-4 bg-gray-200 ml-0.5" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* CTA Assinatura */}
                  <div className="card text-center py-5" style={{ background: 'linear-gradient(135deg, #fdf6e3 0%, #fdf0f3 100%)' }}>
                    <Star size={22} className="mx-auto text-ouro-500 mb-2" />
                    <p className="font-bold text-gray-800 text-base mb-1">Continue sua jornada!</p>
                    <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                      Mantenha sua assinatura ativa e as fases vão sendo desbloqueadas automaticamente conforme você avança.
                    </p>
                    <div className="flex items-center justify-center gap-2 bg-white rounded-xl py-2.5 px-4 border border-ouro-100">
                      <Check size={14} className="text-green-500 flex-shrink-0" />
                      <span className="text-xs text-green-700 font-medium">Assinatura ativa · Próxima fase desbloqueada em breve</span>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ═══ ABA MENTE ═══ */}
      {activeTab === 'mentalidade' && (
        <div className="space-y-3">
          {plano?.mentalidade_descricao ? (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-2">Orientações da Consultora</h3>
              <p className="text-base text-gray-600 leading-relaxed whitespace-pre-wrap">{plano.mentalidade_descricao}</p>
            </div>
          ) : (
            <>
              {/* Banner */}
              <div className="relative rounded-2xl overflow-hidden h-32 mb-1">
                <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
                  alt="Mente" className="w-full h-full object-cover object-top" />
                <div className="absolute inset-0 flex flex-col justify-end p-4"
                  style={{ background: 'linear-gradient(to top, rgba(88,28,135,0.75) 0%, transparent 100%)' }}>
                  <p className="font-serif text-lg font-bold text-white">🧘‍♀️ Mente em Equilíbrio</p>
                  <p className="text-white/80 text-xs">Toque em cada prática para saber mais</p>
                </div>
              </div>

              {/* Sub-tabs: Práticas | Higiene do Sono */}
              <div className="flex gap-1 bg-gray-100 rounded-2xl p-1">
                {([
                  { key: 'praticas' as const, label: '🧠 Práticas Mentais' },
                  { key: 'sono' as const, label: '🌙 Higiene do Sono' },
                ]).map(t => (
                  <button key={t.key} onClick={() => setMenteTab(t.key)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                      menteTab === t.key ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── PRÁTICAS MENTAIS ── */}
              {menteTab === 'praticas' && (
                <div className="space-y-2">
                  {mentalidade.praticas.map((p, i) => (
                    <button key={i} onClick={() => setMenteModal(p)}
                      className="card w-full text-left flex items-center gap-4 active:scale-[0.98] transition-transform">
                      <span className="text-3xl flex-shrink-0">{p.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm">{p.titulo}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{p.desc}</p>
                      </div>
                      <ChevronDown size={16} className="text-gray-300 flex-shrink-0 -rotate-90" />
                    </button>
                  ))}
                </div>
              )}

              {/* ── HIGIENE DO SONO ── */}
              {menteTab === 'sono' && (
                <div className="space-y-3">
                  <div className="card border-2 border-dashed border-purple-200 bg-purple-50/50 text-center py-6">
                    <p className="text-3xl mb-2">🌙</p>
                    <p className="font-semibold text-purple-700 text-sm mb-1">Protocolo de Higiene do Sono</p>
                    <p className="text-xs text-purple-500 leading-relaxed px-4">
                      Em breve você terá acesso ao protocolo completo de higiene do sono,
                      desenvolvido especialmente para esta fase.
                    </p>
                  </div>

                  {/* Dicas gerais de sono enquanto o protocolo não está disponível */}
                  {[
                    { hora: '20h', dica: 'Pare de comer 2–3h antes de dormir', icon: '🍽️' },
                    { hora: '21h', dica: 'Diminua luzes e evite telas brilhantes', icon: '💡' },
                    { hora: '21h30', dica: 'Banho morno ajuda a baixar a temperatura corporal', icon: '🚿' },
                    { hora: '22h', dica: 'Leitura leve, meditação ou respiração 4-7-8', icon: '📖' },
                    { hora: '22h30', dica: 'Quarto fresco (18–20°C), escuro e silencioso', icon: '❄️' },
                    { hora: '22h', dica: 'Horário alvo de dormir — consistência é chave!', icon: '😴' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
                      <div className="w-12 text-center flex-shrink-0">
                        <p className="text-[10px] text-purple-500 font-bold">{item.hora}</p>
                      </div>
                      <span className="text-xl flex-shrink-0">{item.icon}</span>
                      <p className="text-sm text-gray-600 leading-snug">{item.dica}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ═══ MODAL DETALHE PRÁTICA MENTAL ═══ */}
      {menteModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={() => setMenteModal(null)}>
          <div className="bg-white w-full max-w-md rounded-t-3xl max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{menteModal.icon}</span>
                <h2 className="font-semibold text-gray-800 text-base">{menteModal.titulo}</h2>
              </div>
              <button onClick={() => setMenteModal(null)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-500 mb-3 italic">{menteModal.desc}</p>
              <div className="h-px bg-gray-100 mb-4" />
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{menteModal.detalhe}</p>
            </div>
          </div>
        </div>
      )}

      {/* Notas da consultora */}
      {plano?.notas_admin && (
        <div className="card mt-4 border-l-4 border-ouro-400">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <ClipboardList size={16} className="text-ouro-400" /> Notas da Consultora
          </h3>
          <p className="text-base text-gray-600 whitespace-pre-wrap">{plano.notas_admin}</p>
        </div>
      )}

      {/* Histórico */}
      {plano?.progresso_notas && Array.isArray(plano.progresso_notas) && plano.progresso_notas.length > 0 && (
        <div className="card mt-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-rosa-500" /> Histórico
          </h3>
          <div className="space-y-3">
            {(plano.progresso_notas as Array<{ data: string; nota: string; autor: string }>).map((nota, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">{new Date(nota.data).toLocaleDateString('pt-BR')}</span>
                  <span className="text-xs bg-rosa-100 text-rosa-600 px-2 py-0.5 rounded-full">
                    {nota.autor === 'admin' ? 'Consultora' : 'Sistema'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{nota.nota}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ MODAL VÍDEO YOUTUBE ═══ */}
      {videoModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-black/90">
            <button
              onClick={() => setVideoModal(null)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 flex-shrink-0"
            >
              <X size={18} className="text-white" />
            </button>
            <p className="text-white text-sm font-semibold line-clamp-1 flex-1">{videoModal.nome}</p>
          </div>

          {/* Conteúdo */}
          {videoModal.videoId ? (
            /* iframe do YouTube — ocupa a tela toda */
            <iframe
              className="flex-1 w-full"
              src={`https://www.youtube.com/embed/${videoModal.videoId}?autoplay=1&rel=0`}
              title={videoModal.nome}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : videoModal.erro ? (
            /* Vídeo não encontrado */
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
              <PlayCircle size={48} className="text-white/30" />
              <p className="text-white/60 text-sm text-center">
                Não foi possível encontrar o vídeo.{'\n'}Tente novamente.
              </p>
              <button
                onClick={() => setVideoModal(null)}
                className="px-6 py-2.5 bg-white/10 rounded-full text-white text-sm font-medium"
              >
                Fechar
              </button>
            </div>
          ) : (
            /* Carregando */
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Loader2 size={36} className="text-white animate-spin" />
              <p className="text-white/60 text-sm">Carregando vídeo...</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
