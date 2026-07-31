import { useEffect, useState } from 'react'
import {
  Users,
  FileText,
  CheckCircle2,
  TrendingUp,
  Megaphone,
  File,
  ArrowRight,
  Play,
  AlertCircle,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getAnnouncements, Announcement } from '@/services/announcements'
import { getDocuments, DocumentItem } from '@/services/documents'
import { getInternalNotices, InternalNotice } from '@/services/notices'
import { getTrainingModules, getUserProgress } from '@/services/training'
import { getTodayEscalas, type EscalaRecord } from '@/services/escalas'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const DEFAULT_RECENT_DOCUMENTS = [
  { id: '1', title: 'Glossário Técnico BKO' },
  { id: '2', title: 'Passo a Passo Batimento de Caixa - Tela Única' },
  { id: '3', title: 'Procedimento GPON v2.1' },
  { id: '4', title: 'Manual de Transbordo NOC/COPE' },
]

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-50 text-red-600 dark:bg-red-950',
  medium: 'bg-amber-50 text-amber-600 dark:bg-amber-950',
  low: 'bg-blue-50 text-blue-600 dark:bg-blue-950',
}

const PRIORITY_LABELS: Record<string, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
}

const CLASS_STYLES: Record<string, string> = {
  Comunicados: 'bg-blue-50 text-blue-600 dark:bg-blue-950',
  Processos: 'bg-purple-50 text-purple-600 dark:bg-purple-950',
  Diário: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Pendências: 'bg-amber-50 text-amber-600 dark:bg-amber-950',
}

const URGENCY_STYLES: Record<string, string> = {
  Alta: 'bg-red-50 text-red-600 dark:bg-red-950',
  Média: 'bg-amber-50 text-amber-600 dark:bg-amber-950',
  Baixa: 'bg-blue-50 text-blue-600 dark:bg-blue-950',
}

export default function Index() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [notices, setNotices] = useState<InternalNotice[]>([])
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [trainingTrackName, setTrainingTrackName] = useState('Trilha de Formação')
  const [todayEscalas, setTodayEscalas] = useState<EscalaRecord[]>([])

  const loadData = async () => {
    try {
      const [annData, docData, noticeData, escalaData] = await Promise.all([
        getAnnouncements(),
        getDocuments(),
        getInternalNotices(),
        getTodayEscalas().catch(() => []),
      ])
      setAnnouncements(annData || [])
      setDocuments(docData || [])
      setNotices(noticeData || [])
      setTodayEscalas((escalaData as unknown as EscalaRecord[]) || [])

      if (user?.id) {
        try {
          const [modules, progress] = await Promise.all([
            getTrainingModules(),
            getUserProgress(user.id),
          ])
          if (modules.length > 0) {
            const inProgress = progress.find((p) => p.status === 'in_progress')
            const mod = inProgress ? modules.find((m) => m.id === inProgress.module) : modules[0]
            if (mod) setTrainingTrackName(mod.title)
            const completed = progress.filter((p) => p.status === 'completed').length
            setTrainingProgress(Math.round((completed / modules.length) * 100))
          }
        } catch {
          // Training data unavailable
        }
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.id])

  useRealtime('announcements', () => loadData())
  useRealtime('documents', () => loadData())
  useRealtime('internal_notices', () => loadData())
  useRealtime('escalas', () => loadData())

  const userName = user?.name ? user.name.split(' ')[0] : 'Carlos'
  const recentDocs = documents.length > 0 ? documents.slice(0, 5) : DEFAULT_RECENT_DOCUMENTS
  const latestAnnouncement = announcements[0]

  const kpis = [
    {
      label: 'Usuários Ativos',
      value: '128',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Documentos',
      value: String(documents.length || 42),
      icon: FileText,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950',
    },
    {
      label: 'Comunicados',
      value: String(announcements.length || 7),
      icon: CheckCircle2,
      color: 'text-pink-600',
      bg: 'bg-pink-50 dark:bg-pink-950',
    },
    {
      label: 'Tendência',
      value: '+12%',
      icon: TrendingUp,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950',
    },
  ]

  const handleNavigateToPublication = (id: string) => {
    navigate(`/transbordo?highlight=${id}#announcement-${id}`)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Olá, {userName}!</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Aqui está o resumo da sua operação hoje.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.label} className="border-border shadow-sm bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{kpi.label}</span>
                <div
                  className={`w-9 h-9 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mt-3">{kpi.value}</h3>
            </Card>
          )
        })}
      </div>

      {latestAnnouncement && (
        <Card
          onClick={() => handleNavigateToPublication(latestAnnouncement.id)}
          className="border-border border-l-4 border-l-blue-600 shadow-sm bg-card p-5 hover:shadow-md hover:border-blue-500 transition-all cursor-pointer group"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                Última publicação
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                  CLASS_STYLES[latestAnnouncement.class || 'Comunicados'] ||
                  CLASS_STYLES.Comunicados
                }`}
              >
                {latestAnnouncement.class || 'Comunicados'}
              </span>
              <span
                className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                  URGENCY_STYLES[latestAnnouncement.urgency || 'Média'] || URGENCY_STYLES.Média
                }`}
              >
                {latestAnnouncement.urgency || 'Média'}
              </span>
              <span className="text-muted-foreground text-[11px]">
                {latestAnnouncement.created
                  ? formatDistanceToNow(new Date(latestAnnouncement.created), {
                      addSuffix: true,
                      locale: ptBR,
                    })
                  : ''}
              </span>
            </div>
          </div>

          <div className="pt-3 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground group-hover:text-blue-600 transition-colors uppercase">
                {latestAnnouncement.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {latestAnnouncement.content}
              </p>
              <div className="flex items-center gap-2 pt-2 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {latestAnnouncement.expand?.author?.name || 'Beatriz Haralambos'}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 gap-1 shrink-0"
            >
              Ver publicação <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        </Card>
      )}

      <Card className="border-border shadow-sm bg-card p-5">
        <CardHeader className="p-0 pb-3 border-b border-border/50">
          <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" /> Operação Agora
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-3 space-y-2">
          {todayEscalas.length > 0 ? (
            todayEscalas.map((item) => {
              const u = item.expand?.Usuario_ID
              const avatarUrl = u?.avatar
                ? `${import.meta.env.VITE_POCKETBASE_URL}/api/files/users/${u.id}/${u.avatar}`
                : null
              return (
                <div key={item.id} className="flex items-center gap-3 py-1">
                  <Avatar className="w-8 h-8">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={u?.name} />}
                    <AvatarFallback className="text-xs">
                      {u?.name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {u?.name || '-'}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">{item.Projeto}</span>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className="text-[10px] text-muted-foreground">{item.Turno}</span>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">Nenhum plantão hoje</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-pink-600" />
            <h2 className="text-base font-bold text-foreground">Anúncios Recentes</h2>
          </div>
          <div className="space-y-3">
            {announcements.length > 0 ? (
              announcements.slice(0, 4).map((item) => (
                <Card
                  key={item.id}
                  onClick={() => handleNavigateToPublication(item.id)}
                  className="border-border shadow-sm p-4 bg-card hover:border-blue-300 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                    <span className="font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                      {item.class || 'Comunicado'}
                    </span>
                    <span>
                      {item.created ? new Date(item.created).toLocaleDateString('pt-BR') : ''}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.content}</p>
                </Card>
              ))
            ) : (
              <Card className="border-border shadow-sm p-4 bg-card">
                <p className="text-xs text-muted-foreground">Nenhum comunicado disponível.</p>
              </Card>
            )}
          </div>
        </div>

        <Card className="border-border shadow-sm bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Play className="w-4 h-4 fill-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Continue de onde parou
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Trilha de Formação</p>
              <h3 className="text-lg font-bold text-foreground">{trainingTrackName}</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-semibold text-foreground">{trainingProgress}%</span>
              </div>
              <Progress value={trainingProgress} className="h-2" />
            </div>
            <Button
              onClick={() => navigate('/treinamentos')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-10 rounded-lg shadow-sm"
            >
              Continuar trilha
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm bg-card p-5">
          <CardHeader className="p-0 pb-3 border-b border-border/50">
            <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" /> Últimos documentos acessados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-3 space-y-2 text-xs">
            {recentDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground py-1 cursor-pointer"
                onClick={() => navigate('/documentacao')}
              >
                <File className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">{doc.title}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm bg-card p-5">
          <CardHeader className="p-0 pb-3 border-b border-border/50">
            <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" /> Avisos internos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-3 space-y-3 text-xs">
            {notices.length > 0 ? (
              notices.slice(0, 4).map((notice) => (
                <div key={notice.id} className="flex items-start gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${PRIORITY_STYLES[notice.priority || 'low'] || PRIORITY_STYLES.low}`}
                  >
                    {PRIORITY_LABELS[notice.priority || 'low'] || 'Baixa'}
                  </span>
                  <p className="text-muted-foreground line-clamp-2">{notice.content}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Nenhum aviso interno no momento.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
