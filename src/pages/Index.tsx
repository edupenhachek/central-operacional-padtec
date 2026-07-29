import { useEffect, useState } from 'react'
import {
  Users,
  FileText,
  CheckCircle2,
  TrendingUp,
  Megaphone,
  File,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAnnouncements, Announcement } from '@/services/announcements'
import { getDocuments, DocumentItem } from '@/services/documents'
import { getInternalNotices, InternalNotice } from '@/services/notices'
import { useRealtime } from '@/hooks/use-realtime'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Link } from 'react-router-dom'

// Default Featured Announcement matching specification
const FEATURED_ANNOUNCEMENT: Announcement = {
  id: 'ann-featured',
  title: 'Mudanças no fluxo de Batimento de Caixa',
  content:
    'Olá, pessoal, abaixo segue um descritivo do novo procedimento de batimento de caixa unificado para a equipe de BKO e NOC. Favor verificar o novo passo a passo detalhado na seção de documentação e alinhar com os coordenadores de turno.',
  created: '2026-07-27T10:00:00.000Z',
  updated: '2026-07-27T10:00:00.000Z',
  expand: {
    author: {
      name: 'Eduardo Guidini Penhachek',
    },
  },
}

// Default recent documents fallback
const DEFAULT_RECENT_DOCUMENTS = [
  { id: '1', title: 'Teste' },
  { id: '2', title: 'passo a passo mvp' },
  { id: '3', title: 'Passo a Passo Batimento de Caixa - Tela Única' },
  { id: '4', title: 'Batimento de Caixa - Procedimentos' },
]

// Default internal notices fallback
const DEFAULT_INTERNAL_NOTICES = [
  'Use o Gutenberg para consultar procedimentos antes de escalar.',
  'Atualização semanal dos fluxos operacionais publicada.',
  'Treinamento GPON recomendado para novos colaboradores.',
]

export default function Index() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([FEATURED_ANNOUNCEMENT])
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

      if (annData && annData.length > 0) {
        setAnnouncements(annData)
      } else {
        setAnnouncements([FEATURED_ANNOUNCEMENT])
      }

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

  // Ensure primary announcement is featured
  const featured = announcements[0] || FEATURED_ANNOUNCEMENT

  return (
    <div className="space-y-8 animate-fade-in pb-10">
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
                {documents.length || 4}
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
                  {item.expand?.author?.name || 'Eduardo Guidini Penhachek'} •{' '}
                  {item.created ? new Date(item.created).toLocaleDateString('pt-BR') : '27/07/2026'}
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
        {/* Ultimos Documentos Acessados */}
        <Card className="border-border shadow-sm bg-card dark:bg-slate-900">
          <CardHeader className="p-5 border-b border-border/50 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-foreground dark:text-slate-100">
              Últimos documentos acessados
            </CardTitle>
            <Link
              to="/documentacao"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {documents.length > 0
              ? documents.slice(0, 4).map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 text-xs text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-slate-100 transition-colors py-0.5"
                  >
                    <File className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="truncate font-medium">{doc.title}</span>
                  </div>
                ))
              : DEFAULT_RECENT_DOCUMENTS.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 text-xs text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-slate-100 transition-colors py-0.5"
                  >
                    <File className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="truncate font-medium">{doc.title}</span>
                  </div>
                ))}
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
            {notices.length > 0
              ? notices.map((n) => (
                  <p
                    key={n.id}
                    className="text-xs text-muted-foreground dark:text-slate-300 leading-relaxed border-l-2 border-blue-500 pl-3 py-0.5"
                  >
                    {n.content}
                  </p>
                ))
              : DEFAULT_INTERNAL_NOTICES.map((notice, idx) => (
                  <p
                    key={idx}
                    className="text-xs text-muted-foreground dark:text-slate-300 leading-relaxed border-l-2 border-blue-500 pl-3 py-0.5"
                  >
                    {notice}
                  </p>
                ))}
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
              <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">
                {selectedAnn.expand?.author?.name || 'Eduardo Guidini Penhachek'} •{' '}
                {selectedAnn.created
                  ? new Date(selectedAnn.created).toLocaleDateString('pt-BR')
                  : '27/07/2026'}
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
