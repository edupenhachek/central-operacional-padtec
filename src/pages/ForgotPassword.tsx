import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { requestPasswordReset } from '@/services/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PadtecEmblem } from '@/components/PadtecLogo'
import { PadtecBackground } from '@/components/PadtecBackground'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIsSubmitting(true)
    try {
      await requestPasswordReset(email.trim())
      setSuccess(true)
    } catch {
      setErrorMsg('Erro ao enviar link de recuperação. Verifique o e-mail informado.')
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
            Recuperar Senha
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Informe seu e-mail para receber o link de redefinição.
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 text-sm text-center font-medium">
              Se o e-mail existir, você receberá um link para redefinir sua senha.
            </div>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs text-center font-medium">
                {errorMsg}
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                E-mail
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@padtec.com.br"
                required
                className="bg-slate-100/80 dark:bg-slate-800/80 border-none text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100 h-11 text-sm rounded-lg"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-[#0B0E14] hover:bg-slate-800 text-white font-medium text-sm rounded-lg shadow-md hover:shadow-lg transition-all mt-2"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar link de redefinição'}
            </Button>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
