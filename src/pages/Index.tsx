import { useEffect, useState } from 'react'
import { Users, FileText, CheckCircle2, TrendingUp, Megaphone, File } from 'lucide-react'
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-slate-100">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
          Visão consolidada da operação, aprendizagem e comunicados internos.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-border shadow-sm hover:shadow transition-shadow bg-card dark:bg-slate-900">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground dark:text-slate-400">
                Usuários ativos
              </p>
              <h3 className="text-2xl font-bold mt-0.5 text-foreground dark:text-slate-100">3</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm hover:shadow transition-shadow bg-card dark:bg-slate-900">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground dark:text-slate-400">
                Documentos
              </p>
              <h3 className="text-2xl font-bold mt-0.5 text-foreground dark:text-slate-100">
                {documents.length || 2}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm hover:shadow transition-shadow bg-card dark:bg-slate-900">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground dark:text-slate-400">
                Lições concluídas
              </p>
              <h3 className="text-2xl font-bold mt-0.5 text-foreground dark:text-slate-100">10</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm hover:shadow transition-shadow bg-card dark:bg-slate-900">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground dark:text-slate-400">
                Evolução média
              </p>
              <h3 className="text-2xl font-bold mt-0.5 text-foreground dark:text-slate-100">
                23.8%
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-pink-600 dark:text-pink-400" />
          <h2 className="text-base font-bold tracking-tight text-foreground dark:text-slate-100">
            Anúncios
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {announcements.map((item) => (
            <Card
              key={item.id}
              className="border-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between bg-card dark:bg-slate-900"
            >
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-sm font-bold leading-snug text-foreground dark:text-slate-100">
                  {item.title}
                </CardTitle>
                <p className="text-[11px] text-muted-foreground dark:text-slate-400 mt-1">
                  {item.expand?.author?.name || 'Administrador BKO'} •{' '}
                  {new Date(item.created).toLocaleDateString('pt-BR')}
                </p>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4">
                <p className="text-xs text-muted-foreground dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {item.content}
                </p>
                <Button
                  onClick={() => setSelectedAnn(item)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 rounded-md font-medium"
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
        <Card className="border-border shadow-sm bg-card dark:bg-slate-900">
          <CardHeader className="p-5 border-b border-border/50">
            <CardTitle className="text-sm font-bold text-foreground dark:text-slate-100">
              Últimos documentos acessados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 text-xs text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-slate-100 transition-colors"
                >
                  <File className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="truncate">{doc.title}</span>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-3 text-xs text-muted-foreground dark:text-slate-300">
                  <File className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Batimento de Caixa - Procedimentos</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground dark:text-slate-300">
                  <File className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Passo a Passo Batimento de Caixa - Tela Única</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Avisos Internos */}
        <Card className="border-border shadow-sm bg-card dark:bg-slate-900">
          <CardHeader className="p-5 border-b border-border/50">
            <CardTitle className="text-sm font-bold text-foreground dark:text-slate-100">
              Avisos internos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {notices.length > 0 ? (
              notices.map((n) => (
                <p
                  key={n.id}
                  className="text-xs text-muted-foreground dark:text-slate-300 leading-relaxed"
                >
                  {n.content}
                </p>
              ))
            ) : (
              <>
                <p className="text-xs text-muted-foreground dark:text-slate-300">
                  Atualização semanal dos fluxos operacionais publicada.
                </p>
                <p className="text-xs text-muted-foreground dark:text-slate-300">
                  Treinamento GPON recomendado para novos colaboradores.
                </p>
                <p className="text-xs text-muted-foreground dark:text-slate-300">
                  Use o Gutenberg para consultar procedimentos antes de escalar.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Announcement Detail Modal */}
      {selectedAnn && (
        <Dialog open={!!selectedAnn} onOpenChange={() => setSelectedAnn(null)}>
          <DialogContent className="max-w-lg bg-card dark:bg-slate-900 border-border text-card-foreground dark:text-slate-100">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground dark:text-slate-100">
                {selectedAnn.title}
              </DialogTitle>
              <p className="text-xs text-muted-foreground dark:text-slate-400">
                {selectedAnn.expand?.author?.name || 'Administrador BKO'} •{' '}
                {new Date(selectedAnn.created).toLocaleDateString('pt-BR')}
              </p>
            </DialogHeader>
            <div className="mt-4 text-xs leading-relaxed text-foreground dark:text-slate-200 whitespace-pre-wrap">
              {selectedAnn.content}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
