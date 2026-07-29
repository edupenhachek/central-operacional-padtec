import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, HelpCircle, Award } from 'lucide-react'

interface QuizModalProps {
  open: boolean
  onClose: () => void
  docTitle: string
  onComplete: (xpEarned: number) => void
}

const SAMPLE_QUESTIONS = [
  {
    question: 'Qual o procedimento padrão ao identificar atenuação alta no sinal óptico da CTO?',
    options: [
      'Encaminhar para troca imediata sem testes',
      'Verificar limpeza dos conectores e validar potência na porta da OLT',
      'Solicitar cancelamento do cliente no BKO',
      'Reiniciar o roteador do cliente remotamente',
    ],
    answer: 1,
  },
  {
    question: 'No processo de Batimento de Caixa, qual o sistema principal de conciliação?',
    options: [
      'Gutenberg Validador OPS',
      'Excel local do turno',
      'Anotação em bloco de notas',
      'E-mail para coordenação',
    ],
    answer: 0,
  },
  {
    question: 'Qual a tolerância aceitável de potência óptica no conector de entrada do cliente?',
    options: [
      'Entre -8 dBm e -25 dBm',
      'Entre 0 dBm e +10 dBm',
      'Menor que -35 dBm',
      'Qualquer valor positivo',
    ],
    answer: 0,
  },
]

export function QuizModal({ open, onClose, docTitle, onComplete }: QuizModalProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([-1, -1, -1])
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (submitted) return
    const newAnswers = [...selectedAnswers]
    newAnswers[qIdx] = optIdx
    setSelectedAnswers(newAnswers)
  }

  const handleSubmit = () => {
    let correct = 0
    SAMPLE_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) correct++
    })
    setScore(correct)
    setSubmitted(true)
    if (correct >= 2) {
      onComplete(50)
    }
  }

  const handleReset = () => {
    setSelectedAnswers([-1, -1, -1])
    setSubmitted(false)
    setScore(0)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleReset}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-blue-600">
            <HelpCircle className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Quiz de Fixação</span>
          </div>
          <DialogTitle className="text-lg font-bold">{docTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {SAMPLE_QUESTIONS.map((q, qIdx) => (
            <div
              key={qIdx}
              className="space-y-2 p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-900/50"
            >
              <p className="text-xs font-semibold text-foreground">
                {qIdx + 1}. {q.question}
              </p>
              <div className="space-y-1.5 mt-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[qIdx] === optIdx
                  const isCorrect = q.answer === optIdx
                  let btnCls = 'w-full justify-start text-xs text-left h-auto py-2 px-3 border'

                  if (submitted) {
                    if (isCorrect)
                      btnCls +=
                        ' bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                    else if (isSelected && !isCorrect)
                      btnCls +=
                        ' bg-red-50 border-red-500 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                  } else if (isSelected) {
                    btnCls +=
                      ' bg-blue-50 border-blue-600 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200'
                  }

                  return (
                    <Button
                      key={optIdx}
                      variant="outline"
                      className={btnCls}
                      onClick={() => handleSelect(qIdx, optIdx)}
                    >
                      <span className="mr-2 font-bold">{String.fromCharCode(65 + optIdx)})</span>
                      <span className="flex-1">{opt}</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}

          {submitted && (
            <div
              className={`p-4 rounded-xl flex items-center justify-between ${score >= 2 ? 'bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30' : 'bg-amber-50 border border-amber-200 dark:bg-amber-950/30'}`}
            >
              <div className="flex items-center gap-3">
                {score >= 2 ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-amber-600" />
                )}
                <div>
                  <p className="font-bold text-sm text-foreground">
                    {score >= 2 ? 'Aprovado no Quiz!' : 'Necessário Revisar'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Você acertou {score} de 3 questões.{' '}
                    {score >= 2 ? '+50 XP creditados!' : 'Tente novamente.'}
                  </p>
                </div>
              </div>
              {score >= 2 && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/50 px-3 py-1.5 rounded-full">
                  <Award className="w-4 h-4" /> +50 XP
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {!submitted ? (
            <Button
              onClick={handleSubmit}
              disabled={selectedAnswers.some((a) => a === -1)}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            >
              Enviar Respostas
            </Button>
          ) : (
            <Button onClick={handleReset} className="w-full sm:w-auto">
              Concluir Quiz
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
