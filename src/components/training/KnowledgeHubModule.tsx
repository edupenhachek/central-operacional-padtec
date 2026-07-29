import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Folder, FileText, CheckCircle2, HelpCircle, Lock } from 'lucide-react'
import { QuizModal } from './QuizModal'

interface KnowledgeHubModuleProps {
  unlocked: boolean
  completedDocs: string[]
  onDocCompleted: (docId: string, xp: number) => void
}

const CATEGORIES = [
  {
    id: 'cat1',
    name: 'Conhecendo as ferramentas',
    docs: [
      { id: 'd1', title: 'Visão Geral do Portal Gutenberg & Chat AI', readTime: '5 min' },
      { id: 'd2', title: 'Navegação no Monitoramento OLT & CTOs', readTime: '8 min' },
      { id: 'd3', title: 'Plataforma Integrada de Transbordo', readTime: '6 min' },
    ],
  },
  {
    id: 'cat2',
    name: 'Aprendendo a usar os sistemas',
    docs: [
      { id: 'd4', title: 'Procedimento de Batimento de Caixa Unificado', readTime: '10 min' },
      { id: 'd5', title: 'Validador OPS e Regras de Negócio', readTime: '12 min' },
      { id: 'd6', title: 'Diagnóstico Rápido de GPON & Potência Óptica', readTime: '7 min' },
    ],
  },
  {
    id: 'cat3',
    name: 'Processo passo a passo',
    docs: [
      { id: 'd7', title: 'Escalonamento N2/N3 e Abertura de Tickets', readTime: '9 min' },
      { id: 'd8', title: 'Tratativa de Incidentes Massivos no NOC', readTime: '15 min' },
      { id: 'd9', title: 'Fluxo de Atendimento BKO e Manobra Predial', readTime: '11 min' },
    ],
  },
]

export function KnowledgeHubModule({
  unlocked,
  completedDocs,
  onDocCompleted,
}: KnowledgeHubModuleProps) {
  const [selectedDoc, setSelectedDoc] = useState<{ id: string; title: string } | null>(null)

  if (!unlocked) {
    return (
      <Card className="border-border shadow-sm p-8 text-center bg-card">
        <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <h3 className="font-bold text-base text-foreground">Módulo Bloqueado</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
          Conclua 100% do Checklist de Configuração do Módulo 1 (Onboarding) para desbloquear a Base
          de Conhecimento e Quizzes.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Knowledge Hub & Quizzes</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Estude os documentos operacionais e responda aos quizzes para validar seu conhecimento.
          </p>
        </div>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full border border-blue-200">
          {completedDocs.length} / 9 Quizzes Concluídos
        </span>
      </div>

      <div className="space-y-5">
        {CATEGORIES.map((cat) => (
          <Card key={cat.id} className="border-border shadow-sm bg-card">
            <CardHeader className="p-4 border-b border-border/60 bg-muted/20 flex flex-row items-center gap-2">
              <Folder className="w-4 h-4 text-amber-500" />
              <CardTitle className="text-sm font-bold text-foreground">{cat.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {cat.docs.map((doc) => {
                const isPassed = completedDocs.includes(doc.id)
                return (
                  <div
                    key={doc.id}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${isPassed ? 'bg-emerald-50/40 border-emerald-300 dark:bg-emerald-950/20' : 'bg-card border-border hover:border-blue-300'}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] text-muted-foreground">{doc.readTime}</span>
                      </div>
                      <h4 className="text-xs font-bold text-foreground line-clamp-2">
                        {doc.title}
                      </h4>
                    </div>

                    {isPassed ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" /> Quiz Aprovado (+50 XP)
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setSelectedDoc({ id: doc.id, title: doc.title })}
                        className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                      >
                        <HelpCircle className="w-3.5 h-3.5 mr-1" /> Iniciar Quiz
                      </Button>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedDoc && (
        <QuizModal
          open={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          docTitle={selectedDoc.title}
          onComplete={(xp) => {
            onDocCompleted(selectedDoc.id, xp)
            setSelectedDoc(null)
          }}
        />
      )}
    </div>
  )
}
