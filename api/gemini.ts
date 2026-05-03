/**
 * api/gemini.ts — Vercel Serverless Function
 *
 * Proxy seguro para o Google Gemini.
 * A chave GEMINI_API_KEY fica APENAS no servidor (variável de ambiente do Vercel),
 * nunca é exposta no bundle do frontend.
 *
 * Endpoints:
 *   POST /api/gemini   { type: 'text', prompt }           → { text }
 *   POST /api/gemini   { type: 'vision', prompt, image, mimeType } → { text }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const MODEL = 'gemini-2.0-flash-lite'
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

// ── CORS helper ──────────────────────────────────────────────────────────────
function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res)

  // Preflight
  if (req.method === 'OPTIONS') return res.status(200).end()

  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Chave não configurada
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY não configurada nas variáveis de ambiente do Vercel')
    return res.status(500).json({ error: 'IA não configurada. Contate o suporte.' })
  }

  const { type, prompt, image, mimeType } = req.body ?? {}

  if (!prompt) {
    return res.status(400).json({ error: 'Campo "prompt" obrigatório' })
  }

  try {
    // ── Monta payload para a API do Gemini ───────────────────────────────────
    let parts: object[]

    if (type === 'vision' && image) {
      // Análise de imagem (scanner de pratos)
      parts = [
        { text: prompt },
        { inlineData: { data: image, mimeType: mimeType || 'image/jpeg' } },
      ]
    } else {
      // Texto puro (geração de receitas)
      parts = [{ text: prompt }]
    }

    const body = {
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }

    const apiRes = await fetch(`${BASE_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!apiRes.ok) {
      const errText = await apiRes.text()
      console.error('Gemini API error:', apiRes.status, errText)

      if (apiRes.status === 429) {
        return res.status(429).json({ error: 'Limite de requisições atingido. Aguarde e tente novamente.' })
      }
      if (apiRes.status === 401 || apiRes.status === 403) {
        return res.status(500).json({ error: 'Chave da IA inválida. Contate o suporte.' })
      }
      return res.status(apiRes.status).json({ error: 'Erro na IA. Tente novamente.' })
    }

    const data = await apiRes.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    return res.status(200).json({ text })

  } catch (err) {
    console.error('api/gemini handler error:', err)
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' })
  }
}
