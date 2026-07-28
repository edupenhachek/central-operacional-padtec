import pb from '@/lib/pocketbase/client'

export type UserRole = 'ADMIN' | 'USUARIO' | 'FOCAL BKO' | 'FOCAL NOC' | 'FOCAL COPE'

export interface UserItem {
  id: string
  name: string
  email: string
  role?: UserRole
  phone?: string
  equipe?: string
  horario_trabalho?: string
  cargo?: string
  created: string
  updated: string
}

export const getUsers = async (): Promise<UserItem[]> => {
  const records = await pb.collection('users').getFullList({
    sort: '-created',
  })
  return records.map((r) => ({
    id: r.id,
    name: r.name || '',
    email: r.email || '',
    role: r.role as UserRole | undefined,
    phone: r.phone || '',
    equipe: r.equipe || '',
    horario_trabalho: r.horario_trabalho || '',
    cargo: r.cargo || '',
    created: r.created || '',
    updated: r.updated || '',
  }))
}

export const updateUserRole = (id: string, role: UserRole) =>
  pb.collection('users').update<UserItem>(id, { role })

export const createUser = (data: {
  name: string
  email: string
  password: string
  passwordConfirm: string
  role: UserRole
  phone?: string
  equipe?: string
  horario_trabalho?: string
  cargo?: string
}) =>
  pb.collection('users').create<UserItem>({
    name: data.name,
    email: data.email,
    emailConfirm: data.email,
    password: data.password,
    passwordConfirm: data.passwordConfirm,
    role: data.role,
    emailVisibility: true,
    phone: data.phone || '',
    equipe: data.equipe || '',
    horario_trabalho: data.horario_trabalho || '',
    cargo: data.cargo || '',
  })

export const updateUser = (
  id: string,
  data: Partial<{
    name: string
    role: UserRole
    phone: string
    equipe: string
    horario_trabalho: string
    cargo: string
  }>,
) => {
  const payload: Record<string, any> = {}
  if (data.name !== undefined) payload.name = data.name
  if (data.role !== undefined) payload.role = data.role
  if (data.phone !== undefined) payload.phone = data.phone
  if (data.equipe !== undefined) payload.equipe = data.equipe
  if (data.horario_trabalho !== undefined) payload.horario_trabalho = data.horario_trabalho
  if (data.cargo !== undefined) payload.cargo = data.cargo
  return pb.collection('users').update<UserItem>(id, payload)
}

export const requestPasswordReset = (email: string) =>
  pb.collection('users').requestPasswordReset(email)
