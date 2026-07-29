import { useEffect, useMemo, useState } from 'react'
import { Users, UserPlus, Pencil, Search, KeyRound } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { UserFormDialog } from '@/components/UserFormDialog'
import {
  getUsers,
  updateUserRole,
  createUser,
  updateUser,
  requestPasswordReset,
  type UserItem,
  type UserRole,
} from '@/services/users'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { extractFieldErrors, getErrorMessage, type FieldErrors } from '@/lib/pocketbase/errors'
import { getRoleOptionsForUser } from '@/lib/user-constants'
import { toast } from 'sonner'

export default function Usuarios() {
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN'

  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserItem | null>(null)
  const [resetTargetEmail, setResetTargetEmail] = useState<string | null>(null)
  const [createErrors, setCreateErrors] = useState<FieldErrors>({})
  const [editErrors, setEditErrors] = useState<FieldErrors>({})
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return users
    return users.filter(
      (u) =>
        (u.name || '').toLowerCase().includes(term) || (u.email || '').toLowerCase().includes(term),
    )
  }, [users, searchTerm])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await getUsers()
      setUsers(data)
    } catch (err) {
      setUsers([])
      toast.error('Erro ao carregar usuários', { description: getErrorMessage(err) })
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
    if (!isAdmin) {
      toast.error('Apenas administradores podem alterar o perfil.')
      return
    }
    try {
      await updateUserRole(id, role)
      toast.success('Perfil atualizado com sucesso')
    } catch (err) {
      toast.error('Erro ao atualizar perfil', { description: getErrorMessage(err) })
    }
    loadUsers()
  }

  const handleCreate = async (data: {
    name: string
    email: string
    password?: string
    role: UserRole
    phone?: string
    projeto?: string[]
    horario_trabalho?: string
    cargo?: string
  }) => {
    if (!isAdmin) {
      toast.error('Apenas administradores podem criar usuários.')
      return
    }
    setSaving(true)
    setCreateErrors({})
    try {
      await createUser({
        name: data.name,
        email: data.email,
        password: data.password!,
        passwordConfirm: data.password!,
        role: data.role,
        phone: data.phone,
        projeto: data.projeto || [],
        horario_trabalho: data.horario_trabalho,
        cargo: data.cargo,
      })
      toast.success('Usuário criado com sucesso')
      setCreateOpen(false)
      loadUsers()
    } catch (err) {
      setCreateErrors(extractFieldErrors(err))
      toast.error('Erro ao criar usuário', { description: getErrorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (data: {
    name: string
    email: string
    password?: string
    role: UserRole
    phone?: string
    projeto?: string[]
    horario_trabalho?: string
    cargo?: string
  }) => {
    if (!editUser) return
    setSaving(true)
    setEditErrors({})
    try {
      if (isAdmin) {
        await updateUser(editUser.id, {
          name: data.name,
          email: data.email,
          role: data.role,
          phone: data.phone,
          projeto: data.projeto,
          horario_trabalho: data.horario_trabalho,
          cargo: data.cargo,
        })
      } else {
        await updateUser(editUser.id, {
          name: data.name,
          email: data.email,
          phone: data.phone,
        })
      }
      toast.success('Usuário atualizado com sucesso')
      setEditUser(null)
      loadUsers()
    } catch (err) {
      setEditErrors(extractFieldErrors(err))
      toast.error('Erro ao atualizar usuário', {
        description: getErrorMessage(err),
      })
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmResetPassword = async (email: string) => {
    if (!email) {
      toast.error('E-mail inválido para redefinição de senha')
      return
    }
    setResetting(true)
    try {
      await requestPasswordReset(email)
      toast.success(`E-mail de redefinição de senha enviado para ${email}`)
      setResetTargetEmail(null)
    } catch (err) {
      toast.error('Erro ao solicitar redefinição de senha', {
        description: getErrorMessage(err),
      })
    } finally {
      setResetting(false)
    }
  }

  const isEditingSelf = editUser?.id === currentUser?.id

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-slate-100">
            Gestão de Usuários
          </h1>
          <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
            Controle de permissões e perfis de acesso da Central Operacional.
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Novo Usuário
          </Button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background dark:bg-slate-900/80 text-foreground dark:text-slate-100 text-sm placeholder:text-muted-foreground dark:placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <Card className="border-border bg-card dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground dark:text-slate-100">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Colaboradores Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y border-t border-border">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground dark:text-slate-400">
                Carregando usuários...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground dark:text-slate-400">
                Nenhum usuário encontrado.
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                      {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground dark:text-slate-100">
                        {u.name || 'Sem Nome'}
                      </p>
                      <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                        {u.email || 'Sem e-mail'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-36">
                      <Select
                        value={u.role || 'USUARIO'}
                        onValueChange={(val) => handleRoleChange(u.id, val as UserRole)}
                        disabled={!isAdmin}
                      >
                        <SelectTrigger className="h-8 text-xs text-foreground dark:text-slate-100 bg-background dark:bg-slate-900/80 border-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover dark:bg-slate-900 text-popover-foreground dark:text-slate-100 border-border">
                          {getRoleOptionsForUser(currentUser?.role).map((r) => (
                            <SelectItem
                              key={r}
                              value={r}
                              className="dark:focus:bg-slate-800 dark:focus:text-white"
                            >
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {(isAdmin || u.id === currentUser?.id) && (
                      <>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setResetTargetEmail(u.email)}
                            className="h-8 w-8 text-muted-foreground dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400"
                            title="Resetar Senha"
                          >
                            <KeyRound className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditUser(u)}
                          className="h-8 w-8 text-muted-foreground dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Editar usuário"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </>
                    )}
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
        currentUserRole={currentUser?.role}
      />
      <UserFormDialog
        open={!!editUser}
        mode="edit"
        user={editUser}
        fieldErrors={editErrors}
        loading={saving}
        onClose={() => setEditUser(null)}
        onSubmit={handleEdit}
        onResetPassword={(email) => setResetTargetEmail(email)}
        currentUserRole={currentUser?.role}
        isSelf={isEditingSelf}
      />

      <AlertDialog
        open={!!resetTargetEmail}
        onOpenChange={(open) => !open && setResetTargetEmail(null)}
      >
        <AlertDialogContent className="bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground dark:text-slate-100">
              Resetar Senha
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground dark:text-slate-300">
              Deseja enviar um e-mail de redefinição de senha para{' '}
              <strong className="text-foreground dark:text-slate-100">{resetTargetEmail}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={resetting}
              className="dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => resetTargetEmail && handleConfirmResetPassword(resetTargetEmail)}
              disabled={resetting}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {resetting ? 'Enviando...' : 'Enviar E-mail'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
