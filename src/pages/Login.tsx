import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PadtecEmblem, PadtecLogo } from '@/components/PadtecLogo'
import { PadtecBackground } from '@/components/PadtecBackground'

export default function Login() {
  const [email, setEmail] = useState('eduardo.guidini@padtec.com.br')
  const [password, setPassword] = useState('Skip@Pass')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIsSubmitting(true)

    const { error } = await signIn(email, password)
    setIsSubmitting(false)

    if (error) {
      setErrorMsg('Credenciais inválidas. Verifique seu e-mail e senha.')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-white dark:bg-slate-950 p-4 overflow-hidden select-none">
      {/* Background Graphic Lines */}
      <PadtecBackground />

      {/* Central Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-8 sm:p-10 transition-all">
        {/* Card Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <PadtecEmblem className="w-12 h-12 text-2xl mb-4 shadow-lg" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Central Operacional BKO
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                E-mail
              </Label>
            </div>
            <div className="relative">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bko.local"
                required
                className="bg-slate-100/80 dark:bg-slate-800/80 border-none text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100 h-11 text-sm rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Senha
              </Label>
            </div>
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

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-[#0B0E14] hover:bg-slate-800 text-white font-medium text-sm rounded-lg shadow-md hover:shadow-lg transition-all mt-2"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>

      {/* Padtec Logo Fixed Bottom Right */}
      <div className="fixed bottom-6 right-8 z-10 pointer-events-none opacity-90">
        <PadtecLogo className="h-8" />
      </div>
    </div>
  )
}
