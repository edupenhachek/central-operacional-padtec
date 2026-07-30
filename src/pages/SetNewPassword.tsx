import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PadtecEmblem } from '@/components/PadtecLogo'
import { PadtecBackground } from '@/components/PadtecBackground'

export default function SetNewPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (password.length < 8) {
      setErrorMsg('A senha deve ter no mínimo 8 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.')
      return
    }

    setIsSubmitting(true)
    try {
      await pb.send('/backend/v1/users/set-first-password', {
        method: 'POST',
        body: JSON.stringify({ password, passwordConfirm: confirmPassword }),
        headers: { 'Content-Type': 'application/json' },
      })

      pb.authStore.clear()
      toast({
        title: 'Senha atualizada com sucesso! Redirecionando...',
        className:
          'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400',
      })
      setTimeout(() => navigate('/login', { replace: true }), 2000)
    } catch (err: any) {
      const status = err?.status || 0
      if (status === 401 || status === 403) {
        setErrorMsg('Sessão expirada. Faça login novamente.')
        setTimeout(() => navigate('/login', { replace: true }), 2000)
      } else {
        setErrorMsg('Erro ao atualizar senha. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-white dark:bg-slate-950 p-4 overflow-hidden select-none">
      <PadtecBackground />
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-8 sm:p-10 transition-all">
        <div className="flex flex-col items-center text-center mb-8">
          <PadtecEmblem className="w-12 h-12 text-2xl mb-4 shadow-lg" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Defina sua nova senha
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Por segurança, é necessário definir uma nova senha no primeiro acesso.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nova Senha
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-slate-100/80 dark:bg-slate-800/80 border-none text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100 h-11 text-sm rounded-lg pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Confirmar Senha
            </Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-slate-100/80 dark:bg-slate-800/80 border-none text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100 h-11 text-sm rounded-lg pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-[#0B0E14] hover:bg-slate-800 text-white font-medium text-sm rounded-lg shadow-md hover:shadow-lg transition-all mt-2"
          >
            {isSubmitting ? 'Atualizando...' : 'Definir Nova Senha'}
          </Button>
        </form>
      </div>
    </div>
  )
}
