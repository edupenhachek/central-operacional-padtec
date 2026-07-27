import { GraduationCap, CheckCircle2, Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export default function Treinamentos() {
  const courses = [
    {
      title: 'Treinamento GPON Básica e Avançada',
      progress: 100,
      lessons: 10,
      status: 'Concluído',
    },
    {
      title: 'Procedimentos de Batimento BKO 2026',
      progress: 60,
      lessons: 5,
      status: 'Em Progresso',
    },
    {
      title: 'Gestão de Crises e Transbordo NOC/COPE',
      progress: 0,
      lessons: 8,
      status: 'Não Iniciado',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Treinamentos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Capacitação operacional contínua para equipes de suporte e engenharia.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {courses.map((course, i) => (
          <Card key={i} className="border-border shadow-sm flex flex-col justify-between">
            <CardHeader className="p-5">
              <div className="p-2.5 w-fit rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 mb-3">
                <GraduationCap className="w-5 h-5" />
              </div>
              <CardTitle className="text-sm font-bold">{course.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>{course.status}</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-1.5" />
              </div>

              <Button variant="outline" className="w-full text-xs h-9">
                <Play className="w-3.5 h-3.5 mr-1.5" /> Continuar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
