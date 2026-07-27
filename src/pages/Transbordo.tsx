import { ArrowRightLeft, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Transbordo() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transbordo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestão de transbordo e encaminhamento de chamados entre BKO, NOC e COPE.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-600" /> Fila de Transbordo Operacional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/40 rounded-lg flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-foreground">Chamado #TK-2026-901</p>
              <p className="text-muted-foreground mt-0.5">
                Pendência de validação de link GPON - Nível 2
              </p>
            </div>
            <Button size="sm" className="bg-blue-600 text-white">
              Assumir Chamado
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
