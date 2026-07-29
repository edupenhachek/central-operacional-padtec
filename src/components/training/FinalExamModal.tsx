import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trophy, CheckCircle2, Award } from 'lucide-react'

interface FinalExamModalProps {
  open: boolean
  onClose: () => void
  onPass: () => void
}

const EXAM_QUESTIONS = [
  {
    q: '1. O que significa GPON na infraestrutura de telecomunicações?',
    opts: [
      'Gigabit Passive Optical Network',
      'General Power Optical Node',
      'Global Protocol Optical Network',
      'Guided Packet Optical Node',
    ],
    a: 0,
  },
  {
    q: '2. Qual a atitude correta diante de um pico de transbordo no NOC?',
    opts: [
      'Ignorar chamados',
      'Seguir o protocolo de transbordo e triagem rápida',
      'Redirecionar todos para o BKO sem análise',
      'Desligar o sistema',
    ],
    a: 1,
  },
  {
    q: '3. Qual ferramenta padronizada é usada para Batimento de Caixa?',
    opts: [
      'Validador OPS Gutenberg',
      'Chat externo não oficial',
      'Planilha manual',
      'Bloco de notas',
    ],
    a: 0,
  },
  {
    q: '4. Como tratar divergência entre CTO física e lógica?',
    opts: [
      'Abrir chamado de auditoria de campo e atualizar cadastro',
      'Ignorar e prosseguir com ativação',
      'Cancelar a porta',
      'Excluir a CTO do sistema',
    ],
    a: 0,
  },
  {
    q: '5. O que deve ser verificado antes de escalar incidente para N2?',
    opts: [
      'Testes de camada física, logs de conectividade e histórico',
      'Apenas o horário',
      'Nome do cliente',
      'Modelo do computador',
    ],
    a: 0,
  },
]

export function FinalExamModal({ open, onClose, onPass }: FinalExamModalProps) {
  const [answers, setAnswers] = useState<number[]>(Array(EXAM_QUESTIONS.length).fill(-1))
  const [finished, setSubmitted] = useState(false)
  const [scorePercent, setScorePercent] = useState(0)

  const handleSelect = (qIdx: number, oIdx: number) => {
    if (finished) return
    const next = [...answers]
    next[qIdx] = oIdx
    setAnswers(next)
  }

  const handleSubmit = () => {
    let correct = 0
    EXAM_QUESTIONS.forEach((q, idx) => {
      if (answers[idx] === q.a) correct++
    })
    const pct = Math.round((correct / EXAM_QUESTIONS.length) * 100)
    setScorePercent(pct)
    setSubmitted(true)
    if (pct >= 70) {
      onPass()
    }
  }

  const handleClose = () => {
    setAnswers(Array(EXAM_QUESTIONS.length).fill(-1))
    setSubmitted(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-500">
            <Trophy className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Exame Final de Aptidão
            </span>
          </div>
          <DialogTitle className="text-xl font-bold">
            Avaliação de Formação Operacional Padtec
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {EXAM_QUESTIONS.map((qItem, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg border border-border bg-slate-50 dark:bg-slate-900/40 space-y-2"
            >
              <p className="text-xs font-bold text-foreground">{qItem.q}</p>
              <div className="grid grid-cols-1 gap-1.5 mt-2">
                {qItem.opts.map((opt, oIdx) => {
                  const isSel = answers[idx] === oIdx
                  const isCorrect = qItem.a === oIdx
                  let cls = 'w-full justify-start text-xs text-left h-auto py-2 px-3 border'

                  if (finished) {
                    if (isCorrect)
                      cls +=
                        ' bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/40'
                    else if (isSel && !isCorrect)
                      cls += ' bg-red-50 border-red-500 text-red-800 dark:bg-red-950/40'
                  } else if (isSel) {
                    cls += ' bg-blue-50 border-blue-600 text-blue-800 dark:bg-blue-950/50'
                  }

                  return (
                    <Button
                      key={oIdx}
                      variant="outline"
                      className={cls}
                      onClick={() => handleSelect(idx, oIdx)}
                    >
                      <span className="mr-2 font-bold">{String.fromCharCode(65 + oIdx)})</span>{' '}
                      {opt}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}

          {finished && (
            <div
              className={`p-5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${scorePercent >= 70 ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30' : 'bg-red-50 border-red-300 dark:bg-red-950/30'}`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2
                  className={`w-10 h-10 ${scorePercent >= 70 ? 'text-emerald-600' : 'text-red-500'}`}
                />
                <div>
                  <h4 className="font-bold text-base text-foreground">
                    {scorePercent >= 70
                      ? 'Aprovado! Badge "Operador Apto" Conquistada!'
                      : 'Reprovado no Exame'}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sua pontuação: <span className="font-bold">{scorePercent}%</span> (Mínimo
                    exigido: 70%).
                  </p>
                </div>
              </div>
              {scorePercent >= 70 && (
                <div className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white font-bold rounded-lg text-xs shadow-sm shrink-0">
                  <Award className="w-4 h-4" /> +300 XP
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {!finished ? (
            <Button
              onClick={handleSubmit}
              disabled={answers.some((a) => a === -1)}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
              Finalizar e Enviar Exame
            </Button>
          ) : (
            <Button onClick={handleClose} className="w-full">
              Fechar Avaliação
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
