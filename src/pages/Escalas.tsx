import { CalendarDays } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Escalas() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Escalas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Módulo de escalas operacionais — em desenvolvimento.
        </p>
      </div>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" /> Escalas Operacionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Este módulo integrará futuramente as funcionalidades de escalas, transbordo e validador
            OPS como abas dinâmicas baseadas no setor do usuário logado.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
