import { useEffect, useState } from 'react'
import {
  Trophy,
  Flame,
  Award,
  CheckCircle2,
  Play,
  ChevronRight,
  Lock,
  BookOpen,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getTrainingModules,
  getUserProgress,
  saveUserProgress,
  getLeaderboard,
  addXPToUser,
  TrainingModule,
  LeaderboardUser,
} from '@/services/training'
import { OnboardingModule } from '@/components/training/OnboardingModule'
import { KnowledgeHubModule } from '@/components/training/KnowledgeHubModule'
import { ChatSimulatorModule } from '@/components/training/ChatSimulatorModule'

export default function Treinamentos() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'track' | 'm1' | 'm2' | 'm3'>('track')
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [mod1Done, setMod1Done] = useState(false)
  const [completedDocs, setCompletedDocs] = useState<string[]>([])
  const [mod2Done, setMod2Done] = useState(false)
  const [mod3Done, setMod3Done] = useState(false)

  const loadData = async () => {
    try {
      const [mList, lb] = await Promise.all([getTrainingModules(), getLeaderboard()])
      setModules(mList)
      setLeaderboard(lb)

      if (user?.id) {
        const prog = await getUserProgress(user.id)
        prog.forEach((p) => {
          if (p.module && p.status === 'completed') {
            const mod = mList.find((m) => m.id === p.module)
            if (mod?.type === 'onboarding') setMod1Done(true)
            if (mod?.type === 'hub') {
              setMod2Done(true)
              if (p.completed_docs) setCompletedDocs(p.completed_docs)
            }
            if (mod?.type === 'simulation') setMod3Done(true)
          }
        })
      }
    } catch (err) {
      console.error('Error loading training data:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  useRealtime('users', () => {
    loadData()
  })

  const currentUserData = leaderboard.find((u) => u.id === user?.id) || {
    xp: user?.xp || 1250,
    level: user?.level || 3,
    streak_days: user?.streak_days || 1,
  }

  const handleMod1Complete = async () => {
    setMod1Done(true)
    if (user?.id && modules[0]) {
      await saveUserProgress(user.id, modules[0].id, { status: 'completed' })
      await addXPToUser(user.id, 100)
    }
  }

  const handleDocCompleted = async (docId: string, xp: number) => {
    const updated = [...completedDocs, docId]
    setCompletedDocs(updated)
    if (user?.id) {
      await addXPToUser(user.id, xp)
      if (updated.length >= 9 && modules[1]) {
        setMod2Done(true)
        await saveUserProgress(user.id, modules[1].id, {
          status: 'completed',
          completed_docs: updated,
        })
      }
    }
  }

  const handleMod3Complete = async () => {
    setMod3Done(true)
    if (user?.id && modules[2]) {
      await saveUserProgress(user.id, modules[2].id, { status: 'completed' })
      await addXPToUser(user.id, 300)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Treinamentos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Evolua suas habilidades operacionais com as trilhas recomendadas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Left Column (70%) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hero Card matching screenshot 2 */}
          <Card className="border-border shadow-sm overflow-hidden bg-card relative">
            <div className="h-1 bg-gradient-to-r from-orange-400 via-pink-500 to-blue-600" />
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-full border border-blue-200">
                    Trilha em Andamento
                  </span>
                  <h2 className="text-lg font-bold text-foreground mt-2">
                    Trilha de Formação NOC BKO
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    16h restantes | Semana 2 | Próxima: Conceitos de Associação
                  </p>
                  <div className="flex items-center gap-3 mt-3 max-w-xs">
                    <span className="text-xs font-semibold text-muted-foreground">Progresso</span>
                    <Progress
                      value={mod3Done ? 100 : mod2Done ? 66 : mod1Done ? 33 : 0}
                      className="h-2 flex-1"
                    />
                    <span className="text-xs font-bold">
                      {mod3Done ? '100%' : mod2Done ? '66%' : mod1Done ? '33%' : '0%'}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => setActiveTab(!mod1Done ? 'm1' : !mod2Done ? 'm2' : 'm3')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-10 px-6 rounded-lg shrink-0"
                >
                  <Play className="w-4 h-4 mr-1.5" /> Continuar trilha
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Module Selector Tabs */}
          <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
            <Button
              variant={activeTab === 'track' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('track')}
              className="text-xs h-8"
            >
              Trilhas Disponíveis
            </Button>
            <Button
              variant={activeTab === 'm1' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('m1')}
              className="text-xs h-8"
            >
              Módulo 1: Onboarding
            </Button>
            <Button
              variant={activeTab === 'm2' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('m2')}
              className="text-xs h-8"
            >
              Módulo 2: Knowledge Hub {!mod1Done && <Lock className="w-3 h-3 ml-1" />}
            </Button>
            <Button
              variant={activeTab === 'm3' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('m3')}
              className="text-xs h-8"
            >
              Módulo 3: Simulador AI {!mod2Done && <Lock className="w-3 h-3 ml-1" />}
            </Button>
          </div>

          {activeTab === 'track' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                TRILHAS DISPONÍVEIS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card
                  onClick={() => setActiveTab('m1')}
                  className="border-border shadow-sm hover:shadow-md transition-all cursor-pointer p-5 bg-card"
                >
                  <div className="p-2.5 w-fit rounded-lg bg-blue-50 text-blue-600 mb-3">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground">Trilha de Formação NOC BKO</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    Jornada completa de formação para operadores do BackOffice — da imersão ao
                    domínio operacional.
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs">
                    <span className="text-muted-foreground">4 semanas</span>
                    <span className="text-blue-600 font-bold flex items-center">
                      Começar <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'm1' && <OnboardingModule onComplete={handleMod1Complete} />}
          {activeTab === 'm2' && (
            <KnowledgeHubModule
              unlocked={mod1Done}
              completedDocs={completedDocs}
              onDocCompleted={handleDocCompleted}
            />
          )}
          {activeTab === 'm3' && (
            <ChatSimulatorModule unlocked={mod2Done} onComplete={handleMod3Complete} />
          )}
        </div>

        {/* Right Column (30%) - Gamification Widgets matching screenshot 2 */}
        <div className="lg:col-span-3 space-y-5">
          {/* User Level Card */}
          <Card className="border-border shadow-sm bg-card p-5">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full border-2 border-red-400 text-red-600 flex items-center justify-center text-2xl font-bold mb-2">
                {currentUserData.level}
              </div>
              <h3 className="font-bold text-sm text-foreground">Especialista GPON</h3>
              <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Top 1 no ranking</p>

              <div className="w-full space-y-2 mt-4 pt-4 border-t border-border text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">XP Total</span>
                  <span className="font-bold text-foreground">
                    {currentUserData.xp.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center">
                    <Flame className="w-3.5 h-3.5 text-orange-500 mr-1" /> Ofensiva
                  </span>
                  <span className="font-bold text-foreground">
                    {currentUserData.streak_days} dias
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Próximo nível</span>
                  <span className="font-bold text-foreground">2500 XP</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Active Missions Widget */}
          <Card className="border-border shadow-sm bg-card p-5 space-y-3">
            <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-600" /> Missões Ativas
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <span>Acessar a plataforma</span>
                <span className="font-bold text-blue-600">+20 XP</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <span>Consultar um documento</span>
                <span className="font-bold text-blue-600">+30 XP</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <span>Concluir uma aula</span>
                <span className="font-bold text-blue-600">+50 XP</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Completar 3 aulas</span>
                <span className="font-bold text-blue-600">+150 XP</span>
              </div>
            </div>
          </Card>

          {/* Leaderboard Ranking Widget */}
          <Card className="border-border shadow-sm bg-card p-5 space-y-3">
            <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" /> Ranking
            </h4>
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((u, idx) => (
                <div
                  key={u.id}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs ${u.id === user?.id ? 'bg-amber-50 border border-amber-200 dark:bg-amber-950/30' : 'bg-muted/30'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-muted-foreground w-4">{idx + 1}</span>
                    <span className="font-semibold text-foreground truncate max-w-[110px]">
                      {u.name}
                    </span>
                  </div>
                  <span className="font-bold text-muted-foreground">{u.xp} XP</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
