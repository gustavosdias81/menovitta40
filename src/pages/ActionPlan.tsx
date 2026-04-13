import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { PlanoAcao, FaseMenopausa, Objetivo } from '../types'
import {
  Dumbbell, Apple, Brain, ClipboardList,
  TrendingUp, Loader2, Flame, Droplets,
  Moon, Heart, ChevronDown, ChevronUp, Star,
  Home, Building2, Zap, Trophy, Lock, Check
} from 'lucide-react'

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
    pre_menopausa: {
      nomePrograma: 'Protocolo Pré-Menopausa',
      semanas: [
        {
          semana: 'Semana 1–2', titulo: '🌱 Fase de Adaptação', descricao: 'Seu corpo se acostumando com a rotina. Foco em aprender os movimentos com segurança.',
          desbloqueada: true,
          dias: [
            { dia: 'Segunda', foco: 'Membros Inferiores', duracao: '40 min', intensidade: 'Leve',
              academia: [
                { nome: 'Leg Press 45°', series: '3×12', obs: 'Peso leve, foco na forma' },
                { nome: 'Cadeira Extensora', series: '3×12' },
                { nome: 'Cadeira Flexora', series: '3×12' },
                { nome: 'Panturrilha sentada', series: '3×15' },
              ],
              casa: [
                { nome: 'Agachamento livre', series: '3×15', obs: 'Pode segurar uma garrafa de água' },
                { nome: 'Afundo alternado', series: '3×10 cada' },
                { nome: 'Elevação de panturrilha', series: '3×20' },
                { nome: 'Ponte de glúteo', series: '3×15' },
              ],
              cardio: { tipo: 'Caminhada leve', duracao: '15 min', fc: '100–120 bpm' },
            },
            { dia: 'Terça', foco: 'Cardio + Mobilidade', duracao: '30 min', intensidade: 'Leve',
              academia: [
                { nome: 'Esteira (caminhada inclinada)', series: '20 min' },
                { nome: 'Alongamento geral', series: '10 min' },
              ],
              casa: [
                { nome: 'Caminhada no bairro', series: '20 min' },
                { nome: 'Alongamento em casa', series: '10 min', obs: 'YouTube: "alongamento menopausa"' },
              ],
              cardio: { tipo: 'Caminhada contínua', duracao: '20 min', fc: '100–120 bpm' },
            },
            { dia: 'Quarta', foco: 'Membros Superiores + Core', duracao: '40 min', intensidade: 'Leve',
              academia: [
                { nome: 'Supino máquina', series: '3×12' },
                { nome: 'Puxada frontal', series: '3×12' },
                { nome: 'Remada baixa', series: '3×12' },
                { nome: 'Prancha abdominal', series: '3×20s' },
              ],
              casa: [
                { nome: 'Flexão de joelhos', series: '3×10' },
                { nome: 'Remada com garrafa de água', series: '3×12' },
                { nome: 'Elevação lateral com garrafas', series: '3×12' },
                { nome: 'Prancha no chão', series: '3×20s' },
              ],
              cardio: { tipo: 'Polichinelos leves', duracao: '5 min' },
            },
            { dia: 'Quinta', foco: 'Descanso Ativo', duracao: '25 min', intensidade: 'Muito Leve',
              academia: [
                { nome: 'Yoga ou Pilates em grupo', series: '25 min' },
              ],
              casa: [
                { nome: 'Yoga em casa', series: '25 min', obs: 'App ou YouTube' },
              ],
            },
            { dia: 'Sexta', foco: 'Full Body Leve', duracao: '40 min', intensidade: 'Leve-Moderada',
              academia: [
                { nome: 'Agachamento Smith', series: '3×12' },
                { nome: 'Supino inclinado', series: '3×12' },
                { nome: 'Puxada pronada', series: '3×12' },
                { nome: 'Abdominal crunch', series: '3×15' },
              ],
              casa: [
                { nome: 'Agachamento sumô', series: '3×15' },
                { nome: 'Flexão inclinada (mesa)', series: '3×10' },
                { nome: 'Remada curvada (mochila)', series: '3×12' },
                { nome: 'Bicicleta abdominal', series: '3×20' },
              ],
              cardio: { tipo: 'Caminhada rápida', duracao: '15 min', fc: '110–130 bpm' },
            },
            { dia: 'Sábado', foco: 'Cardio ao Ar Livre', duracao: '35 min', intensidade: 'Leve',
              academia: [
                { nome: 'Bike ou elíptico', series: '30 min' },
                { nome: 'Alongamento', series: '5 min' },
              ],
              casa: [
                { nome: 'Caminhada ou pedalada', series: '30 min', obs: 'Parque, rua, praça' },
                { nome: 'Alongamento ao ar livre', series: '5 min' },
              ],
              cardio: { tipo: 'Caminhada contínua ao ar livre', duracao: '30 min', fc: '100–125 bpm' },
            },
            { dia: 'Domingo', foco: 'Descanso Total', duracao: '—', intensidade: 'Repouso',
              academia: [{ nome: 'Descanso — seu corpo se recupera e fica mais forte!', series: '🛌' }],
              casa: [{ nome: 'Descanso — aproveite para relaxar e hidratar-se bem!', series: '🛌' }],
            },
          ],
        },
        {
          semana: 'Semana 3–4', titulo: '🔥 Fase de Evolução', descricao: 'Parabéns! Agora aumentamos séries e incluímos mais cardio para fortalecer o coração.',
          desbloqueada: true,
          dias: [
            { dia: 'Segunda', foco: 'Membros Inferiores — Intensificado', duracao: '50 min', intensidade: 'Moderada',
              academia: [
                { nome: 'Agachamento livre ou Smith', series: '4×12', obs: 'Aumente peso 10-20%' },
                { nome: 'Leg Press 45°', series: '4×12' },
                { nome: 'Cadeira Extensora', series: '3×15' },
                { nome: 'Stiff', series: '3×12', obs: 'Posterior de coxa' },
                { nome: 'Panturrilha em pé', series: '4×15' },
              ],
              casa: [
                { nome: 'Agachamento búlgaro', series: '3×10 cada', obs: 'Pé de trás no sofá' },
                { nome: 'Agachamento sumô com peso', series: '4×15', obs: 'Segure mochila ou galão' },
                { nome: 'Ponte de glúteo unilateral', series: '3×12 cada' },
                { nome: 'Panturrilha na escada', series: '4×15' },
              ],
              cardio: { tipo: 'HIIT leve: 1 min rápido + 2 min lento', duracao: '15 min', fc: '120–145 bpm' },
            },
            { dia: 'Terça', foco: 'Cardio Progressivo', duracao: '35 min', intensidade: 'Moderada',
              academia: [
                { nome: 'Esteira: intervalado', series: '25 min', obs: '2 min caminhada + 1 min trote' },
                { nome: 'Alongamento dinâmico', series: '10 min' },
              ],
              casa: [
                { nome: 'Caminhada com subida', series: '25 min', obs: 'Busque ladeiras ou escadas' },
                { nome: 'Alongamento', series: '10 min' },
              ],
              cardio: { tipo: 'Intervalado leve', duracao: '25 min', fc: '120–140 bpm' },
            },
            { dia: 'Quarta', foco: 'Superiores + Core Avançado', duracao: '50 min', intensidade: 'Moderada',
              academia: [
                { nome: 'Supino reto com halter', series: '4×12' },
                { nome: 'Puxada frontal pronada', series: '4×12' },
                { nome: 'Elevação lateral', series: '3×12' },
                { nome: 'Rosca bíceps', series: '3×12' },
                { nome: 'Prancha', series: '3×30s' },
                { nome: 'Abdominal infra', series: '3×15' },
              ],
              casa: [
                { nome: 'Flexão completa (ou joelhos)', series: '4×10' },
                { nome: 'Remada com elástico ou galão', series: '4×12' },
                { nome: 'Elevação frontal + lateral', series: '3×10', obs: 'Com garrafas de 1L' },
                { nome: 'Prancha com toque no ombro', series: '3×10 cada' },
                { nome: 'Tesoura abdominal', series: '3×20' },
              ],
              cardio: { tipo: 'Jumping jacks', duracao: '5 min' },
            },
            { dia: 'Quinta', foco: 'Pilates + Mobilidade', duracao: '40 min', intensidade: 'Leve',
              academia: [{ nome: 'Aula de Pilates ou Yoga', series: '40 min' }],
              casa: [{ nome: 'Pilates em casa', series: '40 min', obs: 'YouTube: "Pilates menopausa 40min"' }],
            },
            { dia: 'Sexta', foco: 'Full Body Intenso', duracao: '50 min', intensidade: 'Moderada-Alta',
              academia: [
                { nome: 'Agachamento + Desenvolvimento', series: '4×10', obs: 'Combinado' },
                { nome: 'Remada curvada', series: '4×12' },
                { nome: 'Avanço com halteres', series: '3×12 cada' },
                { nome: 'Prancha lateral', series: '3×20s cada' },
              ],
              casa: [
                { nome: 'Burpee modificado', series: '3×8', obs: 'Sem pular se preferir' },
                { nome: 'Agachamento + Press (galão)', series: '4×12' },
                { nome: 'Afundo caminhando', series: '3×10 cada' },
                { nome: 'Prancha + Mountain climber', series: '3×10 cada' },
              ],
              cardio: { tipo: 'HIIT: 30s intenso + 60s lento', duracao: '12 min', fc: '130–155 bpm' },
            },
            { dia: 'Sábado', foco: 'Cardio + Ar Livre', duracao: '40 min', intensidade: 'Moderada',
              academia: [
                { nome: 'Bike ou elíptico com resistência', series: '35 min' },
                { nome: 'Alongamento', series: '5 min' },
              ],
              casa: [
                { nome: 'Corrida leve ou caminhada rápida', series: '35 min' },
                { nome: 'Alongamento ao ar livre', series: '5 min' },
              ],
              cardio: { tipo: 'Aeróbico contínuo', duracao: '35 min', fc: '120–140 bpm' },
            },
            { dia: 'Domingo', foco: 'Descanso Merecido', duracao: '—', intensidade: 'Repouso',
              academia: [{ nome: 'Descanso! 💪 Você completou mais uma semana de evolução!', series: '🏆' }],
              casa: [{ nome: 'Descanso! 💪 Você está ficando mais forte a cada semana!', series: '🏆' }],
            },
          ],
        },
        {
          semana: 'Semana 5–6', titulo: '💪 Fase de Força', descricao: 'Seu corpo já se adaptou! Agora vamos construir força real e resistência cardiovascular.',
          desbloqueada: false,
          dias: [],
        },
        {
          semana: 'Semana 7–8', titulo: '🏆 Fase de Resultado', descricao: 'Reta final! Máxima performance e consolidação dos hábitos para a vida toda.',
          desbloqueada: false,
          dias: [],
        },
      ],
    },
    menopausa: {
      nomePrograma: 'Protocolo Menopausa',
      semanas: [
        {
          semana: 'Semana 1–2', titulo: '🌱 Fase de Adaptação', descricao: 'Respeitando seu corpo. Foco em equilíbrio, musculatura e saúde do coração.',
          desbloqueada: true,
          dias: [
            { dia: 'Segunda', foco: 'Glúteos e Coxas', duracao: '40 min', intensidade: 'Leve',
              academia: [
                { nome: 'Leg Press', series: '3×12', obs: 'Peso confortável' },
                { nome: 'Cadeira Abdutora', series: '3×15' },
                { nome: 'Cadeira Adutora', series: '3×15' },
                { nome: 'Ponte na bola suíça', series: '3×15' },
              ],
              casa: [
                { nome: 'Agachamento na cadeira', series: '3×12', obs: 'Sentar e levantar devagar' },
                { nome: 'Abdução lateral em pé', series: '3×12 cada' },
                { nome: 'Ponte de glúteo', series: '3×15' },
                { nome: 'Agachamento na parede', series: '3×20s', obs: 'Isometria' },
              ],
              cardio: { tipo: 'Caminhada leve', duracao: '15 min', fc: '95–115 bpm' },
            },
            { dia: 'Terça', foco: 'Cardio para o Coração', duracao: '30 min', intensidade: 'Leve',
              academia: [
                { nome: 'Bike ergométrica', series: '20 min', obs: 'Resistência leve' },
                { nome: 'Alongamento completo', series: '10 min' },
              ],
              casa: [
                { nome: 'Caminhada no bairro', series: '20 min' },
                { nome: 'Alongamento em casa', series: '10 min' },
              ],
              cardio: { tipo: 'Caminhada contínua', duracao: '20 min', fc: '95–115 bpm' },
            },
            { dia: 'Quarta', foco: 'Parte Superior + Ossos', duracao: '40 min', intensidade: 'Leve',
              academia: [
                { nome: 'Supino máquina', series: '3×12' },
                { nome: 'Puxada frontal', series: '3×12' },
                { nome: 'Remada sentada', series: '3×12' },
                { nome: 'Prancha abdominal', series: '3×15s' },
              ],
              casa: [
                { nome: 'Flexão na parede', series: '3×12' },
                { nome: 'Remada com garrafa 2L', series: '3×12' },
                { nome: 'Elevação lateral (garrafas)', series: '3×10' },
                { nome: 'Prancha no chão', series: '3×15s' },
              ],
              cardio: { tipo: 'Marcha no lugar', duracao: '5 min' },
            },
            { dia: 'Quinta', foco: 'Yoga / Pilates', duracao: '35 min', intensidade: 'Muito Leve',
              academia: [{ nome: 'Aula de Yoga ou Pilates', series: '35 min' }],
              casa: [{ nome: 'Yoga em casa', series: '35 min', obs: 'YouTube: "yoga menopausa"' }],
            },
            { dia: 'Sexta', foco: 'Full Body + Equilíbrio', duracao: '40 min', intensidade: 'Leve-Moderada',
              academia: [
                { nome: 'Agachamento na máquina', series: '3×12' },
                { nome: 'Supino inclinado', series: '3×12' },
                { nome: 'Remada baixa', series: '3×12' },
                { nome: 'Equilíbrio unipodal', series: '3×20s cada' },
              ],
              casa: [
                { nome: 'Agachamento livre', series: '3×15' },
                { nome: 'Flexão de joelhos', series: '3×10' },
                { nome: 'Superman (costas)', series: '3×12' },
                { nome: 'Equilíbrio em um pé', series: '3×20s cada' },
              ],
              cardio: { tipo: 'Caminhada com variação de ritmo', duracao: '10 min' },
            },
            { dia: 'Sábado', foco: 'Cardio Saúde do Coração', duracao: '35 min', intensidade: 'Leve',
              academia: [
                { nome: 'Elíptico ou Bike', series: '30 min' },
                { nome: 'Alongamento', series: '5 min' },
              ],
              casa: [
                { nome: 'Caminhada / Natação / Dança', series: '30 min' },
                { nome: 'Alongamento', series: '5 min' },
              ],
              cardio: { tipo: 'Aeróbico contínuo', duracao: '30 min', fc: '100–125 bpm' },
            },
            { dia: 'Domingo', foco: 'Descanso Total', duracao: '—', intensidade: 'Repouso',
              academia: [{ nome: 'Relaxe! Seu corpo está se fortalecendo!', series: '🛌' }],
              casa: [{ nome: 'Relaxe! Hidrate-se e descanse bem!', series: '🛌' }],
            },
          ],
        },
        {
          semana: 'Semana 3–4', titulo: '🔥 Fase de Evolução', descricao: 'Você está evoluindo! Mais carga, mais cardio, mais confiança.',
          desbloqueada: true,
          dias: [
            { dia: 'Segunda', foco: 'Inferiores Intensificado', duracao: '45 min', intensidade: 'Moderada',
              academia: [
                { nome: 'Agachamento livre/Smith', series: '4×12', obs: '+10-20% de carga' },
                { nome: 'Leg Press', series: '4×12' },
                { nome: 'Stiff', series: '3×12' },
                { nome: 'Panturrilha em pé', series: '4×15' },
              ],
              casa: [
                { nome: 'Agachamento búlgaro', series: '3×10 cada' },
                { nome: 'Ponte unilateral', series: '3×12 cada' },
                { nome: 'Afundo reverso', series: '3×10 cada' },
                { nome: 'Panturrilha na escada', series: '4×15' },
              ],
              cardio: { tipo: 'Intervalado: 2 min rápido + 2 min lento', duracao: '12 min', fc: '115–140 bpm' },
            },
            { dia: 'Terça', foco: 'Cardio Intervalado', duracao: '35 min', intensidade: 'Moderada',
              academia: [
                { nome: 'Esteira intervalada', series: '25 min', obs: '2 min caminhada + 1 min trote' },
                { nome: 'Alongamento', series: '10 min' },
              ],
              casa: [
                { nome: 'Caminhada com subidas', series: '25 min' },
                { nome: 'Alongamento', series: '10 min' },
              ],
              cardio: { tipo: 'Intervalado leve', duracao: '25 min', fc: '115–135 bpm' },
            },
            { dia: 'Quarta', foco: 'Superiores + Core', duracao: '45 min', intensidade: 'Moderada',
              academia: [
                { nome: 'Supino reto halter', series: '4×12' },
                { nome: 'Puxada pronada', series: '4×12' },
                { nome: 'Elevação lateral', series: '3×12' },
                { nome: 'Prancha', series: '3×30s' },
                { nome: 'Crunch', series: '3×15' },
              ],
              casa: [
                { nome: 'Flexão (joelhos ou completa)', series: '4×10' },
                { nome: 'Remada com elástico/galão', series: '4×12' },
                { nome: 'Elevação com garrafas', series: '3×12' },
                { nome: 'Prancha com toque ombro', series: '3×10 cada' },
              ],
              cardio: { tipo: 'Jumping jacks', duracao: '5 min' },
            },
            { dia: 'Quinta', foco: 'Pilates Reformer ou Solo', duracao: '40 min', intensidade: 'Leve',
              academia: [{ nome: 'Pilates com bola ou aparelho', series: '40 min' }],
              casa: [{ nome: 'Pilates solo em casa', series: '40 min', obs: 'Foco no core e postura' }],
            },
            { dia: 'Sexta', foco: 'Full Body Progressivo', duracao: '50 min', intensidade: 'Moderada',
              academia: [
                { nome: 'Agachamento + Press', series: '4×10', obs: 'Combinado com halteres' },
                { nome: 'Remada curvada', series: '4×12' },
                { nome: 'Afundo + Rosca', series: '3×10 cada' },
                { nome: 'Prancha lateral', series: '3×20s cada' },
              ],
              casa: [
                { nome: 'Agachamento + Press (galão)', series: '4×12' },
                { nome: 'Afundo caminhando', series: '3×10 cada' },
                { nome: 'Flexão + Prancha', series: '3×8+15s' },
                { nome: 'Mountain climber leve', series: '3×10 cada' },
              ],
              cardio: { tipo: 'HIIT adaptado: 30s esforço + 90s descanso', duracao: '10 min', fc: '120–145 bpm' },
            },
            { dia: 'Sábado', foco: 'Cardio Longo', duracao: '40 min', intensidade: 'Moderada',
              academia: [
                { nome: 'Bike/Elíptico com resistência', series: '35 min' },
                { nome: 'Alongamento', series: '5 min' },
              ],
              casa: [
                { nome: 'Caminhada rápida ou dança', series: '35 min' },
                { nome: 'Alongamento', series: '5 min' },
              ],
              cardio: { tipo: 'Aeróbico contínuo', duracao: '35 min', fc: '115–135 bpm' },
            },
            { dia: 'Domingo', foco: 'Descanso Merecido', duracao: '—', intensidade: 'Repouso',
              academia: [{ nome: 'Você completou mais uma fase! 💪🏆', series: '🛌' }],
              casa: [{ nome: 'Descanse com orgulho da sua evolução! 💪🏆', series: '🛌' }],
            },
          ],
        },
        {
          semana: 'Semana 5–6', titulo: '💪 Fase de Força', descricao: 'Corpo adaptado! Foco em ganho muscular e resistência cardíaca.',
          desbloqueada: false, dias: [],
        },
        {
          semana: 'Semana 7–8', titulo: '🏆 Fase de Resultado', descricao: 'Reta final! Colha os frutos de 2 meses de dedicação.',
          desbloqueada: false, dias: [],
        },
      ],
    },
    pos_menopausa: {
      nomePrograma: 'Protocolo Pós-Menopausa',
      semanas: [
        {
          semana: 'Semana 1–2', titulo: '🌱 Fase de Adaptação', descricao: 'Movimentos seguros com foco em ossos, equilíbrio e coração.',
          desbloqueada: true,
          dias: [
            { dia: 'Segunda', foco: 'Fortalecimento Ósseo', duracao: '35 min', intensidade: 'Leve',
              academia: [
                { nome: 'Leg Press (leve)', series: '3×12' },
                { nome: 'Cadeira Extensora', series: '3×12' },
                { nome: 'Panturrilha sentada', series: '3×15' },
                { nome: 'Equilíbrio unipodal', series: '3×15s' },
              ],
              casa: [
                { nome: 'Agachamento na cadeira', series: '3×10' },
                { nome: 'Elevação lateral de perna', series: '3×10 cada' },
                { nome: 'Ponte de glúteo', series: '3×12' },
                { nome: 'Equilíbrio em um pé', series: '3×15s cada' },
              ],
              cardio: { tipo: 'Caminhada suave', duracao: '10 min', fc: '90–110 bpm' },
            },
            { dia: 'Terça', foco: 'Cardio Suave', duracao: '30 min', intensidade: 'Muito Leve',
              academia: [
                { nome: 'Bike ergométrica (sem carga)', series: '20 min' },
                { nome: 'Alongamento articular', series: '10 min' },
              ],
              casa: [
                { nome: 'Caminhada leve', series: '20 min' },
                { nome: 'Alongamento sentada', series: '10 min' },
              ],
              cardio: { tipo: 'Caminhada contínua', duracao: '20 min', fc: '90–110 bpm' },
            },
            { dia: 'Quarta', foco: 'Superiores + Postura', duracao: '35 min', intensidade: 'Leve',
              academia: [
                { nome: 'Supino máquina (leve)', series: '3×10' },
                { nome: 'Puxada frontal', series: '3×10' },
                { nome: 'Remada sentada', series: '3×10' },
                { nome: 'Prancha apoiada', series: '3×10s' },
              ],
              casa: [
                { nome: 'Flexão na parede', series: '3×10' },
                { nome: 'Remada com garrafa', series: '3×10' },
                { nome: 'Elevação de braço alternada', series: '3×10 cada' },
                { nome: 'Prancha nos joelhos', series: '3×10s' },
              ],
            },
            { dia: 'Quinta', foco: 'Yoga Restaurativo', duracao: '30 min', intensidade: 'Muito Leve',
              academia: [{ nome: 'Yoga ou Hidroginástica', series: '30 min' }],
              casa: [{ nome: 'Yoga restaurativo em casa', series: '30 min', obs: 'Movimentos suaves' }],
            },
            { dia: 'Sexta', foco: 'Full Body Suave', duracao: '35 min', intensidade: 'Leve',
              academia: [
                { nome: 'Leg Press leve', series: '3×10' },
                { nome: 'Supino máquina', series: '3×10' },
                { nome: 'Remada', series: '3×10' },
                { nome: 'Equilíbrio + Prancha', series: '3×10s' },
              ],
              casa: [
                { nome: 'Agachamento assistido (cadeira)', series: '3×10' },
                { nome: 'Flexão na mesa', series: '3×8' },
                { nome: 'Superman', series: '3×10' },
                { nome: 'Equilíbrio tandem', series: '3×15s' },
              ],
              cardio: { tipo: 'Caminhada', duracao: '10 min' },
            },
            { dia: 'Sábado', foco: 'Cardio Saúde Cardíaca', duracao: '30 min', intensidade: 'Leve',
              academia: [{ nome: 'Hidroginástica ou Natação', series: '30 min' }],
              casa: [{ nome: 'Caminhada ou Dança leve', series: '30 min' }],
              cardio: { tipo: 'Aeróbico contínuo suave', duracao: '30 min', fc: '95–115 bpm' },
            },
            { dia: 'Domingo', foco: 'Descanso', duracao: '—', intensidade: 'Repouso',
              academia: [{ nome: 'Descanse! Cada dia é uma conquista!', series: '🛌' }],
              casa: [{ nome: 'Relaxe! Você está cuidando dos seus ossos!', series: '🛌' }],
            },
          ],
        },
        {
          semana: 'Semana 3–4', titulo: '🔥 Fase de Evolução', descricao: 'Corpo mais firme! Aumentamos a intensidade com segurança.',
          desbloqueada: true, dias: [],
        },
        {
          semana: 'Semana 5–6', titulo: '💪 Fase de Força', descricao: 'Músculos e ossos mais fortes. Equilíbrio e confiança.',
          desbloqueada: false, dias: [],
        },
        {
          semana: 'Semana 7–8', titulo: '🏆 Fase de Resultado', descricao: 'Autonomia total nos movimentos e hábitos consolidados.',
          desbloqueada: false, dias: [],
        },
      ],
    },
  }

  return base[fase].semanas
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

// ── MENTALIDADE POR FASE ──────────────────────────────────────────────────────
const MENTALIDADE_POR_FASE: Record<FaseMenopausa, { praticas: { titulo: string; desc: string; icon: string }[] }> = {
  pre_menopausa: {
    praticas: [
      { titulo: 'Meditação Matinal', desc: '10 minutos para centrar a mente e reduzir ansiedade.', icon: '🧘‍♀️' },
      { titulo: 'Diário de Gratidão', desc: '3 coisas positivas ao final do dia.', icon: '📓' },
      { titulo: 'Sono de Qualidade', desc: '7–8h. Evite telas 1h antes de dormir.', icon: '🌙' },
      { titulo: 'Conexão Social', desc: 'Vínculos afetivos protegem a saúde mental.', icon: '💗' },
    ],
  },
  menopausa: {
    praticas: [
      { titulo: 'Respiração 4-7-8', desc: 'Inspire 4s, segure 7s, expire 8s. Alivia fogachos.', icon: '🫁' },
      { titulo: 'Mindfulness', desc: '15 min/dia reduz sintomas em até 30%.', icon: '🧘‍♀️' },
      { titulo: 'Autocuidado', desc: 'Banho relaxante, leitura, música — sem culpa.', icon: '✨' },
      { titulo: 'Reformulação Positiva', desc: 'Menopausa é transição, não fim.', icon: '💪' },
    ],
  },
  pos_menopausa: {
    praticas: [
      { titulo: 'Estimulação Cognitiva', desc: 'Jogos de memória e leitura protegem o cérebro.', icon: '🧠' },
      { titulo: 'Vida Social Ativa', desc: 'Grupos e atividades reduzem depressão.', icon: '🤝' },
      { titulo: 'Propósito de Vida', desc: 'Hobbies e metas aumentam felicidade.', icon: '🌟' },
      { titulo: 'Relaxamento Diário', desc: 'Estresse crônico acelera envelhecimento.', icon: '🌸' },
    ],
  },
}

const intensidadeColor = (i: string) => {
  if (i === 'Muito Leve' || i === 'Repouso') return 'bg-blue-50 text-blue-600'
  if (i === 'Leve' || i === 'Leve-Moderada') return 'bg-green-50 text-green-600'
  if (i === 'Moderada') return 'bg-ouro-50 text-ouro-600'
  return 'bg-rosa-50 text-rosa-600'
}

const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function ActionPlan() {
  const { user, profile } = useAuth()
  const [plano, setPlano] = useState<PlanoAcao | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'treino' | 'nutricao' | 'mentalidade'>('treino')
  const [local, setLocal] = useState<'academia' | 'casa'>('academia')
  const [semanaAtiva, setSemanaAtiva] = useState(0)
  const [expandedDia, setExpandedDia] = useState<number | null>(null)

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('planos_acao').select('*').eq('user_id', user.id).maybeSingle()
    if (data) setPlano(data as PlanoAcao)
    setLoading(false)
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

  const tabs = [
    { key: 'treino' as const, label: 'Treino', icon: <Dumbbell size={16} /> },
    { key: 'nutricao' as const, label: 'Nutrição', icon: <Apple size={16} /> },
    { key: 'mentalidade' as const, label: 'Mente', icon: <Brain size={16} /> },
  ]

  return (
    <div className="page-container">
      <h1 className="page-title">Plano de Ação</h1>
      <p className="page-subtitle">
        {fase === 'pre_menopausa' ? 'Pré-Menopausa' : fase === 'menopausa' ? 'Menopausa' : 'Pós-Menopausa'}
        {' · '}Programa de 8 semanas
      </p>

      {/* Treino de hoje — destaque */}
      {treinoHoje && treinoHoje.foco !== 'Descanso Total' && treinoHoje.foco !== 'Descanso Merecido' && treinoHoje.foco !== 'Descanso' && (
        <div className="mb-4 rounded-2xl p-4 text-white"
          style={{ background: 'linear-gradient(135deg, #B76E79 0%, #9d5a64 100%)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Star size={14} className="text-ouro-300" />
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Treino de Hoje — {diaHoje}</span>
          </div>
          <p className="font-bold text-lg mb-1">{treinoHoje.foco}</p>
          <div className="flex items-center gap-3 text-sm text-white/80">
            <span>⏱ {treinoHoje.duracao}</span>
            <span className="w-px h-3 bg-white/30" />
            <span>💪 {treinoHoje.intensidade}</span>
            {treinoHoje.cardio && (
              <>
                <span className="w-px h-3 bg-white/30" />
                <span>❤️ {treinoHoje.cardio.duracao} cardio</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Metas nutricionais */}
      <div className="card mb-4">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Flame size={16} className="text-orange-500" /> Metas Diárias
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Calorias', valor: metas.calorias, unidade: 'kcal', color: 'bg-orange-50 text-orange-600', icon: <Flame size={16} /> },
            { label: 'Proteínas', valor: metas.proteinas, unidade: 'g', color: 'bg-red-50 text-red-500', icon: <Dumbbell size={16} /> },
            { label: 'Gorduras', valor: metas.gorduras, unidade: 'g', color: 'bg-yellow-50 text-yellow-600', icon: <Droplets size={16} /> },
            { label: 'Carboidratos', valor: metas.carboidratos, unidade: 'g', color: 'bg-blue-50 text-blue-500', icon: <Apple size={16} /> },
          ].map((m, i) => (
            <div key={i} className={`rounded-2xl p-3 ${m.color}`}>
              <div className="flex items-center gap-1.5 mb-1 opacity-70">
                {m.icon}
                <span className="text-xs font-medium">{m.label}</span>
              </div>
              <p className="text-2xl font-bold">{m.valor}</p>
              <p className="text-xs opacity-60">{m.unidade} / dia</p>
            </div>
          ))}
        </div>
      </div>

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
                        <div className="space-y-2">
                          {exercicios.map((ex, j) => (
                            <div key={j} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700">{ex.nome}</p>
                                {ex.obs && <p className="text-xs text-gray-400 mt-0.5">{ex.obs}</p>}
                              </div>
                              <span className="text-sm font-bold text-rosa-500 ml-2">{ex.series}</span>
                            </div>
                          ))}
                        </div>

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
        </div>
      )}

      {/* ═══ ABA NUTRIÇÃO ═══ */}
      {activeTab === 'nutricao' && (
        <div className="space-y-4">
          {plano?.nutricao_descricao ? (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-2">Protocolo da Consultora</h3>
              <p className="text-base text-gray-600 leading-relaxed whitespace-pre-wrap">{plano.nutricao_descricao}</p>
            </div>
          ) : (
            <>
              <div className="card">
                <h3 className="font-semibold text-gray-800 text-base mb-3 flex items-center gap-2">
                  <Heart size={16} className="text-rosa-500" /> Dicas Essenciais
                </h3>
                <div className="space-y-2.5">
                  {nutricao.dicas.map((dica, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-rosa-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-rosa-600 font-bold">{i + 1}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{dica}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3 className="font-semibold text-gray-800 text-base mb-3 flex items-center gap-2">
                  <Apple size={16} className="text-green-500" /> Priorize
                </h3>
                <div className="flex flex-wrap gap-2">
                  {nutricao.alimentos.map((a, i) => (
                    <span key={i} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">✓ {a}</span>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3 className="font-semibold text-gray-800 text-base mb-3 flex items-center gap-2">
                  <Moon size={16} className="text-red-400" /> Evite
                </h3>
                <div className="flex flex-wrap gap-2">
                  {nutricao.evitar.map((a, i) => (
                    <span key={i} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-full text-sm font-medium">✗ {a}</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ ABA MENTALIDADE ═══ */}
      {activeTab === 'mentalidade' && (
        <div className="space-y-3">
          {plano?.mentalidade_descricao ? (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-2">Orientações da Consultora</h3>
              <p className="text-base text-gray-600 leading-relaxed whitespace-pre-wrap">{plano.mentalidade_descricao}</p>
            </div>
          ) : (
            mentalidade.praticas.map((p, i) => (
              <div key={i} className="card flex items-start gap-4">
                <span className="text-3xl">{p.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-base mb-1">{p.titulo}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))
          )}
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
    </div>
  )
}
