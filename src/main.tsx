import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { supabase } from './lib/supabase'
import './index.css'

// ─────────────────────────────────────────────────────────────────────────────
// 🔥 WARM-UP DO SUPABASE (fix definitivo do bug de carregamento)
// Dispara um ping mínimo ao banco IMEDIATAMENTE quando o app carrega
// (antes mesmo do React montar). Plano gratuito do Supabase faz cold start
// quando o banco fica inativo — esse ping força o banco a acordar enquanto
// a usuária ainda está vendo a tela de login. Quando ela navegar para
// Perfil/Comunidade/Plano, o banco já estará respondendo rápido.
// Fire-and-forget: não bloqueia, não trava, ignora erros.
// ─────────────────────────────────────────────────────────────────────────────
;(() => {
  try {
    supabase.from('profiles').select('user_id').limit(1).then(
      () => { console.log('[warm-up] Supabase pronto') },
      () => { /* ignora — só importa que enviou o ping */ }
    )
  } catch { /* ignora */ }
})()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
