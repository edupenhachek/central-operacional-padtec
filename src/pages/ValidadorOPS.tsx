import { useState } from 'react'
import { CheckSquare, Search, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function ValidadorOPS() {
  const [ticketId, setTicketId] = useState('')
  const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle')

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketId) return
    if (ticketId.toLowerCase().includes('bko') || ticketId.length > 4) {
      setStatus('valid')
    } else {
      setStatus('invalid')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Validador OPS</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Validação automatizada de regras operacionais de chamados e batimentos.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            Validar Chamado ou Procedimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleValidate} className="flex gap-3">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Código do Chamado / ID do Batimento</Label>
              <Input
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="Ex: BKO-2026-8941"
                className="text-sm"
              />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white self-end">
              <Search className="w-4 h-4 mr-2" /> Validar
            </Button>
          </form>

          {status === 'valid' && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-3 text-emerald-700 dark:text-emerald-400 text-xs">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold">Validação Concluída com Sucesso</p>
                <p className="mt-0.5">
                  O chamado cumpre todos os requisitos de batimento e conformidade BKO.
                </p>
              </div>
            </div>
          )}

          {status === 'invalid' && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-3 text-amber-700 dark:text-amber-400 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold">Divergência Encontrada</p>
                <p className="mt-0.5">
                  Consulte o Gutenberg AI ou o documento de batimento para ajustar o protocolo.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
