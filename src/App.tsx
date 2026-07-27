import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'

import Index from '@/pages/Index'
import Login from '@/pages/Login'
import ValidadorOPS from '@/pages/ValidadorOPS'
import Documentacao from '@/pages/Documentacao'
import Treinamentos from '@/pages/Treinamentos'
import GutenbergChat from '@/pages/GutenbergChat'
import Transbordo from '@/pages/Transbordo'
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

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Index />} />
            <Route path="/validador-ops" element={<ValidadorOPS />} />
            <Route path="/documentacao" element={<Documentacao />} />
            <Route path="/treinamentos" element={<Treinamentos />} />
            <Route path="/gutenberg" element={<GutenbergChat />} />
            <Route path="/transbordo" element={<Transbordo />} />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Usuarios />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
