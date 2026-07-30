import pb from '@/lib/pocketbase/client'

export type UserRole = 'ADMIN' | 'USUARIO' | 'FOCAL BKO' | 'FOCAL NOC' | 'FOCAL COPE' | 'SUPERADMIN'

export interface UserItem {
  id: string
  name: string
  email: string
  role?: UserRole
  phone?: string
  projeto?: string[]
  horario_trabalho?: string
  cargo?: string
  Ativo?: boolean
  primeiro_acesso?: boolean
  participa_escala?: boolean
  created: string
  updated: string
}

export const getUsers = async (): Promise<UserItem[]> => {
  const records = await pb.collection('users').getFullList({
    sort: 'name',
  })
  return records.map((r) => ({
    id: r.id,
    name: r.name || '',
    email: r.email || '',
    role: r.role as UserRole | undefined,
    phone: r.phone || '',
    projeto: Array.isArray(r.projeto) ? r.projeto : r.projeto ? [r.projeto] : [],
    horario_trabalho: r.horario_trabalho || '',
    cargo: r.cargo || '',
    Ativo: r.Ativo !== false,
    primeiro_acesso: r.primeiro_acesso,
    participa_escala: r.participa_escala !== false,
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
  projeto?: string[]
  horario_trabalho?: string
  cargo?: string
  participa_escala?: boolean
}) =>
  pb.collection('users').create<UserItem>({
    name: data.name,
    email: data.email,
    emailConfirm: data.email,
    password: data.password,
    passwordConfirm: data.passwordConfirm,
    role: data.role,
    emailVisibility: true,
    Ativo: true,
    primeiro_acesso: true,
    phone: data.phone || '',
    projeto: data.projeto || [],
    horario_trabalho: data.horario_trabalho || '',
    cargo: data.cargo || '',
    participa_escala: data.participa_escala !== false,
  })

export const updateUser = (
  id: string,
  data: Partial<{
    name: string
    email: string
    role: UserRole
    phone: string
    projeto: string[]
    horario_trabalho: string
    cargo: string
    Ativo: boolean
    avatar: File
    participa_escala: boolean
  }>,
) => {
  const payload: Record<string, any> = {}
  if (data.name !== undefined) payload.name = data.name
  if (data.email !== undefined && data.email.trim() !== '') payload.email = data.email
  if (data.role !== undefined) payload.role = data.role
  if (data.phone !== undefined) payload.phone = data.phone
  if (data.projeto !== undefined) payload.projeto = data.projeto
  if (data.horario_trabalho !== undefined) payload.horario_trabalho = data.horario_trabalho
  if (data.cargo !== undefined) payload.cargo = data.cargo
  if (data.Ativo !== undefined) payload.Ativo = data.Ativo
  if (data.participa_escala !== undefined) payload.participa_escala = data.participa_escala
  if (data.avatar !== undefined) payload.avatar = data.avatar
  return pb.collection('users').update<UserItem>(id, payload)
}

export const deactivateUser = (id: string) =>
  pb.collection('users').update<UserItem>(id, { Ativo: false })

export const reactivateUser = (id: string) =>
  pb.collection('users').update<UserItem>(id, { Ativo: true })

export const deleteUserPermanently = (id: string) => pb.collection('users').delete(id)

export const requestPasswordReset = (email: string) =>
  pb.collection('users').requestPasswordReset(email)

export const batchDeactivateUsers = (ids: string[]) =>
  Promise.allSettled(ids.map((id) => deactivateUser(id)))

export const batchActivateUsers = (ids: string[]) =>
  Promise.allSettled(ids.map((id) => reactivateUser(id)))

export const batchDeleteUsers = (ids: string[]) =>
  Promise.allSettled(ids.map((id) => deleteUserPermanently(id)))
