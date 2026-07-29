import pb from '@/lib/pocketbase/client'

export interface TrainingModule {
  id: string
  title: string
  description: string
  order: number
  type: 'onboarding' | 'hub' | 'simulation'
}

export interface UserTrainingProgress {
  id: string
  user: string
  module: string
  status: 'not_started' | 'in_progress' | 'completed'
  checklist_data?: Record<string, boolean>
  completed_docs?: string[]
}

export interface SimulationLog {
  id: string
  user: string
  persona_name: string
  interaction_log: any
  score: number
  created?: string
}

export interface TrainingMission {
  id: string
  title: string
  xp_reward: number
  type: 'daily' | 'milestone'
}

export interface LeaderboardUser {
  id: string
  name: string
  email: string
  xp: number
  level: number
  streak_days: number
  role: string
  avatar?: string
}

export const getTrainingModules = async (): Promise<TrainingModule[]> => {
  return await pb.collection('training_modules').getFullList<TrainingModule>({
    sort: 'order',
  })
}

export const getUserProgress = async (userId: string): Promise<UserTrainingProgress[]> => {
  return await pb.collection('user_training_progress').getFullList<UserTrainingProgress>({
    filter: `user = "${userId}"`,
  })
}

export const saveUserProgress = async (
  userId: string,
  moduleId: string,
  data: Partial<UserTrainingProgress>,
) => {
  const existing = await pb
    .collection('user_training_progress')
    .getList<UserTrainingProgress>(1, 1, {
      filter: `user = "${userId}" && module = "${moduleId}"`,
    })

  if (existing.items.length > 0) {
    return await pb.collection('user_training_progress').update(existing.items[0].id, data)
  } else {
    return await pb.collection('user_training_progress').create({
      user: userId,
      module: moduleId,
      status: 'in_progress',
      ...data,
    })
  }
}

export const getTrainingMissions = async (): Promise<TrainingMission[]> => {
  return await pb.collection('training_missions').getFullList<TrainingMission>()
}

export const getLeaderboard = async (): Promise<LeaderboardUser[]> => {
  const users = await pb.collection('users').getList(1, 10, {
    sort: '-xp',
  })
  return users.items.map((u: any) => ({
    id: u.id,
    name: u.name || u.email?.split('@')[0] || 'Operador',
    email: u.email,
    xp: u.xp || 0,
    level: u.level || 1,
    streak_days: u.streak_days || 0,
    role: u.role || 'USUARIO',
    avatar: u.avatar,
  }))
}

export const addXPToUser = async (userId: string, xpAmount: number) => {
  try {
    const user = await pb.collection('users').getOne(userId)
    const currentXP = user.xp || 0
    const newXP = currentXP + xpAmount
    const newLevel = Math.floor(newXP / 500) + 1
    await pb.collection('users').update(userId, {
      xp: newXP,
      level: newLevel,
      last_training_activity: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Error updating user XP:', err)
  }
}

export const saveSimulationLog = async (data: Partial<SimulationLog>) => {
  return await pb.collection('simulation_logs').create(data)
}

export const sendSimulatorMessage = async (
  persona: string,
  message: string,
  history: Array<{ role: string; content: string }>,
) => {
  try {
    return await pb.send('/backend/v1/training/simulate', {
      method: 'POST',
      body: JSON.stringify({ persona, message, history }),
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return {
      persona,
      content:
        persona === 'Vinicius' || persona === 'Vinícius'
          ? 'Precisamos resolver este chamado do circuito GPON agora! Onde está o log da OLT?'
          : persona === 'Osmar'
            ? 'Confirmando as medições da CTO 14, o sinal óptico está em -19.2 dBm. Conforme normas Padtec, está tudo ok!'
            : 'Entendido! Já verifiquei a associação e atualizei a ordenação dos pares.',
    }
  }
}
