import { useEffect, useState } from 'react'
import { Users, UserPlus, Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserFormDialog } from '@/components/UserFormDialog'
import {
  getUsers,
  updateUserRole,
  createUser,
  updateUser,
  UserItem,
  UserRole,
} from '@/services/users'
import { useRealtime } from '@/hooks/use-realtime'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'

const ROLE_OPTIONS: UserRole[] = ['ADMIN', 'USUARIO', 'FOCAL BKO', 'FOCAL NOC', 'FOCAL COPE']

export default function Usuarios() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserItem | null>(null)
  const [createErrors, setCreateErrors] = useState<FieldErrors>({})
  const [editErrors, setEditErrors] = useState<FieldErrors>({})
  const [saving, setSaving] = useState(false)

  const loadUsers = async () => {
    try {
      setLoading(true)
      setUsers(await getUsers())
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useRealtime('users', () => {
    loadUsers()
  })

  const handleRoleChange = async (id: string, role: UserRole) => {
    try {
      await updateUserRole(id, role)
      toast.success('Perfil atualizado com sucesso')
    } catch {
      toast.error('Erro ao atualizar perfil')
    }
    loadUsers()
  }

  const handleCreate = async (data: {
    name: string
    email: string
    password?: string
    role: UserRole
  }) => {
    setSaving(true)
    setCreateErrors({})
    try {
      await createUser({
        name: data.name,
        email: data.email,
        password: data.password!,
        passwordConfirm: data.password!,
        role: data.role,
      })
      toast.success('Usuário criado com sucesso')
      setCreateOpen(false)
      loadUsers()
    } catch (err) {
      setCreateErrors(extractFieldErrors(err))
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (data: {
    name: string
    email: string
    password?: string
    role: UserRole
  }) => {
    if (!editUser) return
    setSaving(true)
    setEditErrors({})
    try {
      await updateUser(editUser.id, { name: data.name, email: data.email, role: data.role })
      toast.success('Usuário atualizado com sucesso')
      setEditUser(null)
      loadUsers()
    } catch (err) {
      setEditErrors(extractFieldErrors(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Controle de permissões e perfis de acesso da Central Operacional.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Novo Usuário
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Colaboradores Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y border-t border-border">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Carregando usuários...
              </div>
            ) : (
              users.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold text-xs">
                      {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{u.name || 'Sem Nome'}</p>
                      <p className="text-[11px] text-muted-foreground">{u.email || 'Sem e-mail'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-36">
                      <Select
                        value={u.role || 'USUARIO'}
                        onValueChange={(val) => handleRoleChange(u.id, val as UserRole)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditUser(u)}
                      className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                      title="Editar usuário"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <UserFormDialog
        open={createOpen}
        mode="create"
        fieldErrors={createErrors}
        loading={saving}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
      <UserFormDialog
        open={!!editUser}
        mode="edit"
        user={editUser}
        fieldErrors={editErrors}
        loading={saving}
        onClose={() => setEditUser(null)}
        onSubmit={handleEdit}
      />
    </div>
  )
}
