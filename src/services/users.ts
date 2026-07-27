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

export const getUsers = () =>
  pb.collection('users').getFullList<UserItem>({
    sort: '-created',
  })

export const updateUserRole = (id: string, role: UserRole) =>
  pb.collection('users').update<UserItem>(id, { role })

export const createUser = (data: {
  name: string
  email: string
  password: string
  passwordConfirm: string
  role: UserRole
}) => pb.collection('users').create<UserItem>(data)

export const updateUser = (
  id: string,
  data: Partial<{ name: string; email: string; role: UserRole }>,
) => pb.collection('users').update<UserItem>(id, data)
