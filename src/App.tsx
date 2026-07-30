import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { ProtectedRoute, FirstAccessRoute } from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'

import Index from '@/pages/Index'
import Login from '@/pages/Login'
import ForgotPassword from '@/pages/ForgotPassword'
import SetNewPassword from '@/pages/SetNewPassword'
import ValidadorOPS from '@/pages/ValidadorOPS'
import Documentacao from '@/pages/Documentacao'
import Treinamentos from '@/pages/Treinamentos'
import GutenbergPage from '@/pages/Gutenberg'

import Transbordo from '@/pages/Transbordo'
import Escalas from '@/pages/Escalas'
import Usuarios from '@/pages/Usuarios'
import NotFound from '@/pages/NotFound'

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/set-new-password"
            element={
              <FirstAccessRoute>
                <SetNewPassword />
              </FirstAccessRoute>
            }
          />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Index />} />
            <Route path="/escalas" element={<Escalas />} />
            <Route path="/validador-ops" element={<ValidadorOPS />} />
            <Route path="/documentacao" element={<Documentacao />} />
            <Route path="/treinamentos" element={<Treinamentos />} />
            <Route path="/gutenberg" element={<GutenbergPage />} />
            <Route path="/transbordo" element={<Transbordo />} />
            <Route path="/usuarios" element={<Usuarios />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
