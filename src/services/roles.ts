import pb from '@/lib/pocketbase/client'

export interface Role {
  id: string
  name: string
  permissions: string[]
  is_system: boolean
  created: string
  updated: string
}

export const PERMISSION_OPTIONS = [
  { value: 'read_users', label: 'Ler Usuários' },
  { value: 'edit_users', label: 'Editar Usuários' },
  { value: 'deactivate_users', label: 'Desativar Usuários' },
  { value: 'delete_users', label: 'Excluir Usuários' },
  { value: 'manage_roles', label: 'Gerenciar Perfis' },
  { value: 'export_csv', label: 'Exportar CSV' },
  { value: 'edit_system_prompt', label: 'Editar Prompt do Sistema' },
  { value: 'access_dashboard', label: 'Acessar Dashboard' },
  { value: 'view_gutenberg', label: 'Acessar Gutenberg AI' },
]

export const getRoles = async (): Promise<Role[]> => {
  const records = await pb.collection('roles').getFullList({ sort: 'name' })
  return records.map((r) => ({
    id: r.id,
    name: r.name || '',
    permissions: Array.isArray(r.permissions) ? r.permissions : [],
    is_system: r.is_system || false,
    created: r.created || '',
    updated: r.updated || '',
  }))
}

export const createRole = (data: { name: string; permissions: string[] }) =>
  pb
    .collection('roles')
    .create<Role>({ name: data.name, permissions: data.permissions, is_system: false })

export const updateRole = (id: string, data: { name?: string; permissions?: string[] }) =>
  pb.collection('roles').update<Role>(id, data)

export const deleteRole = (id: string) => pb.collection('roles').delete(id)
