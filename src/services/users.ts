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
    ...data,
    emailConfirm: data.email,
  })

export const updateUser = (
  id: string,
  data: Partial<{ name: string; email: string; role: UserRole }>,
) => {
  const payload: Record<string, any> = { ...data }
  if (payload.email) {
    payload.emailConfirm = payload.email
  }
  return pb.collection('users').update<UserItem>(id, payload)
}
