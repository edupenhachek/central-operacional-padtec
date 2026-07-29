import { useEffect, useState } from 'react'
import {
  Users,
  FileText,
  CheckCircle2,
  TrendingUp,
  Megaphone,
  File,
  ArrowRight,
  Flame,
  Award,
  Play,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAnnouncements, Announcement } from '@/services/announcements'
import { getDocuments, DocumentItem } from '@/services/documents'
import { getInternalNotices, InternalNotice } from '@/services/notices'
import { useRealtime } from '@/hooks/use-realtime'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

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

const DEFAULT_RECENT_DOCUMENTS = [
  { id: '1', title: 'Glossário Técnico BKO' },
  { id: '2', title: 'Passo a Passo Batimento de Caixa - Tela Única' },
  { id: '3', title: 'Procedimento GPON v2.1' },
  { id: '4', title: 'Manual de Transbordo NOC/COPE' },
]

export default function Index() {
  const { user } = useAuth()
  const navigate = useNavigate()
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

  const userName = user?.name ? user.name.split(' ')[0] : 'Carlos'
  const userXP = user?.xp || 1250
  const userLevel = user?.level || 3

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Olá, {userName}!</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Aqui está o resumo da sua operação hoje.
        </p>
      </div>

      {/* Gamification KPI Cards Row matching Screenshot 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-border shadow-sm bg-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Progresso de XP</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-foreground">
              {userXP} <span className="text-sm font-normal text-muted-foreground">/ 2750</span>
            </h3>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-purple-600"
                style={{ width: `${(userXP / 2750) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-right text-muted-foreground font-medium mt-1">
              1500 XP para subir
            </p>
          </div>
        </Card>

        <Card className="border-border shadow-sm bg-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Nível Atual</span>
            <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
              L{userLevel}
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-foreground">{userLevel}</h3>
            <p className="text-xs text-blue-600 font-semibold mt-1">Operador</p>
          </div>
        </Card>

        <Card className="border-border shadow-sm bg-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Dias Consecutivos</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-foreground">{user?.streak_days || 1}</h3>
            <p className="text-[11px] text-muted-foreground font-medium mt-1">Recorde: 12 dias</p>
          </div>
        </Card>

        <Card className="border-border shadow-sm bg-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Últimas Medalhas</span>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-foreground">1</h3>
            <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold mt-1">
              🏅
            </div>
          </div>
        </Card>
      </div>

      {/* Hero Card "Continue de onde parou" matching Screenshot 1 */}
      <Card className="border-border shadow-sm overflow-hidden bg-card relative">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 text-blue-600">
              <Play className="w-4 h-4 fill-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Continue de onde parou
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Trilha de Formação NOC BKO</p>
            <h3 className="text-lg font-bold text-foreground">Conceitos de Associação</h3>
            <p className="text-xs text-muted-foreground">🕒 16h restantes • 0% concluído</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-full border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-xs text-muted-foreground">
              0%
            </div>
            <Button
              onClick={() => navigate('/treinamentos')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-10 px-6 rounded-lg shadow-sm"
            >
              Continuar Aula
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Announcements & Recent Activity / Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Left Column - Comunicados Recentes (60%) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-pink-600" />
              <h2 className="text-base font-bold text-foreground">Comunicados Recentes</h2>
            </div>
            <Link to="#" className="text-xs text-blue-600 hover:underline font-semibold">
              Ver todos &gt;
            </Link>
          </div>

          <div className="space-y-3">
            {announcements.map((item) => (
              <Card
                key={item.id}
                className="border-border shadow-sm p-4 bg-card hover:border-blue-300 transition-all"
              >
                <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                  <span className="font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                    Procedimento
                  </span>
                  <span>
                    {item.created
                      ? new Date(item.created).toLocaleDateString('pt-BR')
                      : '20 jul às 16:22'}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.content}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column - Documentos Recentes & Atividade Recente (40%) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border shadow-sm bg-card p-5">
            <CardHeader className="p-0 pb-3 border-b border-border/50">
              <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" /> Documentos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-3 space-y-2 text-xs">
              {DEFAULT_RECENT_DOCUMENTS.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground py-1"
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
                <TrendingUp className="w-4 h-4 text-blue-600" /> Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-4 space-y-4 text-xs">
              <div className="border-l-2 border-blue-500 pl-3 space-y-0.5">
                <p className="font-semibold text-foreground">Login realizado</p>
                <p className="text-[10px] text-muted-foreground">18 jul 16:26</p>
              </div>
              <div className="border-l-2 border-blue-500 pl-3 space-y-0.5">
                <p className="font-semibold text-foreground">
                  Documento consultado: Glossário Técnico BKO
                </p>
                <p className="text-[10px] text-muted-foreground">18 jul 16:26</p>
              </div>
              <div className="border-l-2 border-blue-500 pl-3 space-y-0.5">
                <p className="font-semibold text-foreground">
                  Aula concluída: Introdução à Rede Óptica
                </p>
                <p className="text-[10px] font-bold text-blue-600">+50 XP • 18 jul 15:26</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedAnn && (
        <Dialog open={!!selectedAnn} onOpenChange={() => setSelectedAnn(null)}>
          <DialogContent className="max-w-lg bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">{selectedAnn.title}</DialogTitle>
            </DialogHeader>
            <p className="text-xs leading-relaxed mt-2">{selectedAnn.content}</p>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
