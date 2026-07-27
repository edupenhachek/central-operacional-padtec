import pb from '@/lib/pocketbase/client'

export type UserRole = 'ADMIN' | 'USUARIO' | 'FOCAL BKO' | 'FOCAL NOC' | 'FOCAL COPE'

export interface UserItem {
  id: string
  name: string
  email: string
  role?: UserRole
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
}) =>
  pb.collection('users').create<UserItem>({
    name: data.name,
    email: data.email,
    emailConfirm: data.email,
    password: data.password,
    passwordConfirm: data.passwordConfirm,
    role: data.role,
    emailVisibility: true,
  })

export const updateUser = (id: string, data: Partial<{ name: string; role: UserRole }>) => {
  const payload: Record<string, any> = {}
  if (data.name !== undefined) payload.name = data.name
  if (data.role !== undefined) payload.role = data.role
  return pb.collection('users').update<UserItem>(id, payload)
}

export const requestPasswordReset = (email: string) =>
  pb.collection('users').requestPasswordReset(email)
