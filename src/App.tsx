import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Components
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Login from './pages/Login'
import Quiz from './pages/Quiz'
import HealthInfo from './pages/HealthInfo'
import Profile from './pages/Profile'
import ActionPlan from './pages/ActionPlan'
import NutritionalAI from './pages/NutritionalAI'
import Community from './pages/Community'
import Settings from './pages/Settings'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminAddUser from './pages/admin/AddUser'
import AdminEditUser from './pages/admin/EditUser'
import AdminArtigos from './pages/admin/Artigos'

function AppRoutes() {
  const { user, loading, quizCompleto } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-rosa-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Carregando Menovitta...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={
        user ? <Navigate to="/perfil" replace /> : <Login />
      } />

      {/* Quiz (sem layout — tela cheia) */}
      {/* Se quiz já foi feito, redireciona direto para o plano */}
      <Route path="/quiz" element={
        <ProtectedRoute>
          {quizCompleto ? <Navigate to="/plano" replace /> : <Quiz />}
        </ProtectedRoute>
      } />

      {/* Health Info (sem layout — tela cheia) */}
      <Route path="/saude-info" element={
        <ProtectedRoute>
          <HealthInfo />
        </ProtectedRoute>
      } />

      {/* App principal (com BottomNav layout) */}
      <Route element={
        <ProtectedRoute>
          {!quizCompleto ? <Navigate to="/quiz" replace /> : <Layout />}
        </ProtectedRoute>
      }>
        <Route path="/perfil" element={<Profile />} />
        <Route path="/plano" element={<ActionPlan />} />
        <Route path="/scanner" element={<NutritionalAI />} />
        <Route path="/comunidade" element={<Community />} />
        <Route path="/configuracoes" element={<Settings />} />
      </Route>

      {/* Admin (com BottomNav oculto — tela própria) */}
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/nova-aluna" element={
        <ProtectedRoute requireAdmin>
          <AdminAddUser />
        </ProtectedRoute>
      } />
      <Route path="/admin/aluna/:userId" element={
        <ProtectedRoute requireAdmin>
          <AdminEditUser />
        </ProtectedRoute>
      } />
      <Route path="/admin/artigos" element={
        <ProtectedRoute requireAdmin>
          <AdminArtigos />
        </ProtectedRoute>
      } />

      {/* Redirect */}
      <Route path="*" element={<Navigate to={user ? "/perfil" : "/login"} replace />} />
    </Routes>
  )
}

export default function App() {
  return <AppRoutes />
}
