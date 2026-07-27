import pb from '@/lib/pocketbase/client'

export interface UserItem {
  id: string
  name: string
  email: string
  role?: 'NOC' | 'COPE' | 'BKO' | 'ADMIN'
  created: string
  updated: string
}

export const getUsers = () =>
  pb.collection('users').getFullList<UserItem>({
    sort: '-created',
  })

export const updateUserRole = (id: string, role: 'NOC' | 'COPE' | 'BKO' | 'ADMIN') =>
  pb.collection('users').update<UserItem>(id, { role })
