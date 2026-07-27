import { useEffect, useState } from 'react'
import {
  Users,
  FileText,
  CheckCircle2,
  TrendingUp,
  Megaphone,
  File,
  ShieldAlert,
  Award,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAnnouncements, Announcement } from '@/services/announcements'
import { getDocuments, DocumentItem } from '@/services/documents'
import { getInternalNotices, InternalNotice } from '@/services/notices'
import { useRealtime } from '@/hooks/use-realtime'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function Index() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [notices, setNotices] = useState<InternalNotice[]>([])
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null)

  const loadData = async () => {
    try {
      const [annData, docData, noticeData] = await Promise.all([
        getAnnouncements(),
        getDocuments(),
        getInternalNotices(),
      ])
      setAnnouncements(annData)
      setDocuments(docData)
      setNotices(noticeData)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('announcements', () => {
    loadData()
  })
  useRealtime('documents', () => {
    loadData()
  })
  useRealtime('internal_notices', () => {
    loadData()
  })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visao consolidada da operacao, aprendizagem e comunicados internos.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-border shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Usuarios ativos</p>
              <h3 className="text-2xl font-bold mt-0.5">3</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Documentos</p>
              <h3 className="text-2xl font-bold mt-0.5">{documents.length || 2}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Licoes concluidas</p>
              <h3 className="text-2xl font-bold mt-0.5">10</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Evolucao media</p>
              <h3 className="text-2xl font-bold mt-0.5">23.8%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-pink-600" />
          <h2 className="text-base font-bold tracking-tight">Anúncios</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {announcements.map((item) => (
            <Card
              key={item.id}
              className="border-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-sm font-bold leading-snug">{item.title}</CardTitle>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {item.expand?.author?.name || 'Administrador BKO'} •{' '}
                  {new Date(item.created).toLocaleDateString('pt-BR')}
                </p>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4">
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {item.content}
                </p>
                <Button
                  onClick={() => setSelectedAnn(item)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 rounded-md"
                >
                  Ler mais
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Grid: Last Documents & Internal Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ultimos Documentos */}
        <Card className="border-border shadow-sm">
          <CardHeader className="p-5 border-b border-border/50">
            <CardTitle className="text-sm font-bold">Ultimos documentos acessados</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <File className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{doc.title}</span>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <File className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Batimento de Caixa - Procedimentos</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <File className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Passo a Passo Batimento de Caixa - Tela Única</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Avisos Internos */}
        <Card className="border-border shadow-sm">
          <CardHeader className="p-5 border-b border-border/50">
            <CardTitle className="text-sm font-bold">Avisos internos</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {notices.length > 0 ? (
              notices.map((n) => (
                <p key={n.id} className="text-xs text-muted-foreground leading-relaxed">
                  {n.content}
                </p>
              ))
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  Atualizacao semanal dos fluxos operacionais publicada.
                </p>
                <p className="text-xs text-muted-foreground">
                  Treinamento GPON recomendado para novos colaboradores.
                </p>
                <p className="text-xs text-muted-foreground">
                  Use o Gutenberg para consultar procedimentos antes de escalar.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ranking de Colaboradores */}
      <Card className="border-border shadow-sm">
        <CardHeader className="p-5 border-b border-border/50 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" /> Ranking de colaboradores
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/40">
              <div className="flex items-center gap-3">
                <span className="font-bold w-4 text-center">1</span>
                <span className="font-medium">Eduardo Guidini</span>
              </div>
              <span className="text-blue-600 font-semibold">1,240 pts</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="font-bold w-4 text-center text-muted-foreground">2</span>
                <span className="font-medium">Operador BKO 1</span>
              </div>
              <span className="text-muted-foreground">890 pts</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="font-bold w-4 text-center text-muted-foreground">3</span>
                <span className="font-medium">Analista COPE</span>
              </div>
              <span className="text-muted-foreground">620 pts</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcement Detail Modal */}
      {selectedAnn && (
        <Dialog open={!!selectedAnn} onOpenChange={() => setSelectedAnn(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">{selectedAnn.title}</DialogTitle>
              <p className="text-xs text-muted-foreground">
                {selectedAnn.expand?.author?.name || 'Administrador BKO'} •{' '}
                {new Date(selectedAnn.created).toLocaleDateString('pt-BR')}
              </p>
            </DialogHeader>
            <div className="mt-4 text-xs leading-relaxed text-foreground whitespace-pre-wrap">
              {selectedAnn.content}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
