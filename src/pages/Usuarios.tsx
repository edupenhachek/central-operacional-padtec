import { useEffect, useMemo, useState } from 'react'
import {
  Users,
  UserPlus,
  Pencil,
  Search,
  KeyRound,
  Download,
  UserX,
  UserCheck,
  Trash2,
  ShieldCheck,
  Upload,
} from 'lucide-react'
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
import { BulkImportDialog } from '@/components/BulkImportDialog'
import { RolesTab } from '@/components/RolesTab'
import {
  getUsers,
  updateUserRole,
  createUser,
  updateUser,
  deactivateUser,
  reactivateUser,
  deleteUserPermanently,
  requestPasswordReset,
  type UserItem,
  type UserRole,
} from '@/services/users'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { extractFieldErrors, getErrorMessage, type FieldErrors } from '@/lib/pocketbase/errors'
import {
  getRoleOptionsForUser,
  canImportUsers,
  PROJETO_OPTIONS,
  ROLE_OPTIONS,
} from '@/lib/user-constants'
import { toast } from 'sonner'

export default function Usuarios() {
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN'
  const isSuperAdmin = currentUser?.role === 'SUPERADMIN'

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'roles'>('users')
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'ativos' | 'desativados'>('ativos')

  const [createOpen, setCreateOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserItem | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<UserItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null)
  const [resetTargetEmail, setResetTargetEmail] = useState<string | null>(null)

  const [createErrors, setCreateErrors] = useState<FieldErrors>({})
  const [editErrors, setEditErrors] = useState<FieldErrors>({})
  const [saving, setSaving] = useState(false)
  const [deactivating, setDeactivating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [projectFilter, setProjectFilter] = useState<string>('Todos')
  const [roleFilter, setRoleFilter] = useState<string>('Todos')

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

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return users
      .filter((u) => {
        const matchesStatus = statusFilter === 'ativos' ? u.Ativo !== false : u.Ativo === false
        if (!matchesStatus) return false
        if (projectFilter !== 'Todos') {
          const projetos = Array.isArray(u.projeto) ? u.projeto : []
          if (!projetos.includes(projectFilter)) return false
        }
        if (roleFilter !== 'Todos') {
          if ((u.role || '') !== roleFilter) return false
        }
        if (!term) return true
        return (
          (u.name || '').toLowerCase().includes(term) ||
          (u.email || '').toLowerCase().includes(term) ||
          (u.cargo || '').toLowerCase().includes(term)
        )
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'))
  }, [users, searchTerm, statusFilter, projectFilter, roleFilter])

  const activeCount = useMemo(() => users.filter((u) => u.Ativo !== false).length, [users])
  const inactiveCount = useMemo(() => users.filter((u) => u.Ativo === false).length, [users])

  const handleRoleChange = async (id: string, role: UserRole) => {
    if (!isAdmin) {
      toast.error('Apenas administradores podem alterar o perfil.')
      return
    }
    if (role === 'SUPERADMIN' && currentUser?.role !== 'SUPERADMIN') {
      toast.error('Apenas SuperAdmins podem atribuir o perfil SUPERADMIN.')
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
    if (data.role === 'SUPERADMIN' && currentUser?.role !== 'SUPERADMIN') {
      toast.error('Apenas SuperAdmins podem criar usuários com perfil SUPERADMIN.')
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
    if (data.role === 'SUPERADMIN' && currentUser?.role !== 'SUPERADMIN') {
      toast.error('Apenas SuperAdmins podem atribuir o perfil SUPERADMIN.')
      return
    }
    setSaving(true)
    setEditErrors({})
    try {
      await updateUser(editUser.id, {
        name: data.name,
        role: isAdmin ? data.role : undefined,
        phone: data.phone,
        projeto: data.projeto,
        horario_trabalho: data.horario_trabalho,
        cargo: data.cargo,
      })
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

  const handleEmailChange = async (userId: string, newEmail: string) => {
    setSaving(true)
    try {
      await updateUser(userId, { email: newEmail })
      toast.success('E-mail atualizado com sucesso!')
      loadUsers()
      setEditUser((prev) => (prev && prev.id === userId ? { ...prev, email: newEmail } : prev))
    } catch (err) {
      toast.error('Erro ao atualizar e-mail', { description: getErrorMessage(err) })
      throw err
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async () => {
    if (!deactivateTarget) return
    setDeactivating(true)
    try {
      await deactivateUser(deactivateTarget.id)
      toast.success(`Usuário ${deactivateTarget.name || deactivateTarget.email} desativado.`)
      setDeactivateTarget(null)
      loadUsers()
    } catch (err) {
      toast.error('Erro ao desativar usuário', { description: getErrorMessage(err) })
    } finally {
      setDeactivating(false)
    }
  }

  const handleReactivate = async (u: UserItem) => {
    try {
      await reactivateUser(u.id)
      toast.success(`Usuário ${u.name || u.email} reativado.`)
      loadUsers()
    } catch (err) {
      toast.error('Erro ao reativar usuário', { description: getErrorMessage(err) })
    }
  }

  const handleDeletePermanently = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteUserPermanently(deleteTarget.id)
      toast.success(`Usuário ${deleteTarget.name || deleteTarget.email} excluído definitivamente.`)
      setDeleteTarget(null)
      loadUsers()
    } catch (err) {
      toast.error('Erro ao excluir definitivamente', { description: getErrorMessage(err) })
    } finally {
      setDeleting(false)
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
      toast.success(`E-mail de redefinição enviado para ${email}`)
      setResetTargetEmail(null)
    } catch (err) {
      toast.error('Erro ao solicitar redefinição de senha', {
        description: getErrorMessage(err),
      })
    } finally {
      setResetting(false)
    }
  }

  const handleExportCSV = () => {
    if (!isSuperAdmin) {
      toast.error('Apenas SuperAdmins podem exportar a base de usuários.')
      return
    }
    const headers = [
      'Nome',
      'Email',
      'Perfil',
      'Cargo',
      'Projeto',
      'Horario de Trabalho',
      'Telefone',
      'Status',
      'Data Criacao',
    ]
    const rows = users.map((u) => [
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${(u.role || '').replace(/"/g, '""')}"`,
      `"${(u.cargo || '').replace(/"/g, '""')}"`,
      `"${(Array.isArray(u.projeto) ? u.projeto.join('; ') : '').replace(/"/g, '""')}"`,
      `"${(u.horario_trabalho || '').replace(/"/g, '""')}"`,
      `"${(u.phone || '').replace(/"/g, '""')}"`,
      `"${u.Ativo !== false ? 'Ativo' : 'Desativado'}"`,
      `"${u.created ? new Date(u.created).toLocaleDateString('pt-BR') : ''}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `base_usuarios_gutenberg_${new Date().toISOString().slice(0, 10)}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Base de usuários exportada com sucesso!')
  }

  const isEditingSelf = editUser?.id === currentUser?.id

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-slate-100">
            Gestão de Usuários & Perfis
          </h1>
          <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">
            Controle de colaboradores, permissões e perfis de acesso da Central Operacional.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="text-xs font-medium gap-1.5 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar Base (CSV)
            </Button>
          )}

          {canImportUsers(currentUser?.role) && activeSubTab === 'users' && (
            <Button
              variant="outline"
              onClick={() => setImportOpen(true)}
              className="text-xs font-medium gap-1.5 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Upload className="w-3.5 h-3.5" />
              Importar Usuários
            </Button>
          )}

          {isAdmin && activeSubTab === 'users' && (
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              Novo Usuário
            </Button>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeSubTab === 'users'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4" />
            Usuários
          </button>
          <button
            onClick={() => setActiveSubTab('roles')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeSubTab === 'roles'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Perfis de Acesso
          </button>
        </div>
      )}

      {activeSubTab === 'roles' ? (
        <RolesTab />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, e-mail ou cargo..."
                  className="w-full h-9 pl-9 pr-4 rounded-lg border border-input bg-background dark:bg-slate-900/80 text-foreground dark:text-slate-100 text-xs placeholder:text-muted-foreground dark:placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-32 h-9 text-xs text-foreground dark:text-slate-100 bg-background dark:bg-slate-900/80 border-input">
                    <SelectValue placeholder="Projeto" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover dark:bg-slate-900 text-popover-foreground dark:text-slate-100 border-border">
                    <SelectItem
                      value="Todos"
                      className="dark:focus:bg-slate-800 dark:focus:text-white"
                    >
                      Todos
                    </SelectItem>
                    {PROJETO_OPTIONS.map((p) => (
                      <SelectItem
                        key={p}
                        value={p}
                        className="dark:focus:bg-slate-800 dark:focus:text-white"
                      >
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-36 h-9 text-xs text-foreground dark:text-slate-100 bg-background dark:bg-slate-900/80 border-input">
                    <SelectValue placeholder="Função" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover dark:bg-slate-900 text-popover-foreground dark:text-slate-100 border-border">
                    <SelectItem
                      value="Todos"
                      className="dark:focus:bg-slate-800 dark:focus:text-white"
                    >
                      Todos
                    </SelectItem>
                    {ROLE_OPTIONS.map((r) => (
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
            </div>

            <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-lg border border-border shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setStatusFilter('ativos')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  statusFilter === 'ativos'
                    ? 'bg-background dark:bg-slate-800 text-foreground dark:text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Usuários Ativos ({activeCount})
              </button>
              <button
                onClick={() => setStatusFilter('desativados')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  statusFilter === 'desativados'
                    ? 'bg-background dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Usuários Desativados ({inactiveCount})
              </button>
            </div>
          </div>

          <Card className="border-border bg-card dark:bg-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground dark:text-slate-100">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                {statusFilter === 'ativos' ? 'Colaboradores Ativos' : 'Contas Desativadas'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y border-t border-border">
                {loading ? (
                  <div className="p-8 text-center text-xs text-muted-foreground dark:text-slate-400">
                    Carregando colaboradores...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground dark:text-slate-400">
                    Nenhum usuário encontrado.
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const isDeactivated = u.Ativo === false
                    const canPermanentlyDelete = isSuperAdmin || (isAdmin && isDeactivated)

                    return (
                      <div
                        key={u.id}
                        className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isDeactivated ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isDeactivated
                                ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-foreground dark:text-slate-100">
                                {u.name || 'Sem Nome'}
                              </p>
                              {isDeactivated && (
                                <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 rounded">
                                  DESATIVADO
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                              {u.email || 'Sem e-mail'} {u.cargo ? `• ${u.cargo}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <div className="w-36">
                            <Select
                              value={u.role || 'USUARIO'}
                              onValueChange={(val) => handleRoleChange(u.id, val as UserRole)}
                              disabled={!isAdmin || isDeactivated}
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditUser(u)}
                              className="h-8 w-8 text-muted-foreground dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                              title="Editar usuário"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setResetTargetEmail(u.email)}
                              className="h-8 w-8 text-muted-foreground dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400"
                              title="Resetar Senha"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          {isAdmin && (
                            <>
                              {!isDeactivated ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeactivateTarget(u)}
                                  className="h-8 w-8 text-muted-foreground dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400"
                                  title="Desativar Conta"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleReactivate(u)}
                                  className="h-8 w-8 text-muted-foreground dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
                                  title="Reativar Conta"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </>
                          )}

                          {canPermanentlyDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget(u)}
                              className="h-8 w-8 text-muted-foreground dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                              title="Excluir Definitivamente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <BulkImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={loadUsers}
      />

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
        onChangeEmail={handleEmailChange}
        currentUserRole={currentUser?.role}
        isSelf={isEditingSelf}
      />

      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
      >
        <AlertDialogContent className="bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground dark:text-slate-100">
              Desativar Conta de Usuário
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground dark:text-slate-300">
              Deseja desativar o acesso de{' '}
              <strong className="text-foreground dark:text-slate-100">
                {deactivateTarget?.name || deactivateTarget?.email}
              </strong>
              ? O usuário não conseguirá realizar login até ser reativado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deactivating}
              className="dark:border-slate-700 dark:text-slate-200"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={deactivating}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {deactivating ? 'Desativando...' : 'Confirmar Desativação'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground dark:text-slate-100 text-red-600 dark:text-red-400">
              Excluir Definitivamente
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground dark:text-slate-300">
              Atenção: Esta ação é irreversível. Deseja remover permanentemente do banco de dados o
              usuário{' '}
              <strong className="text-foreground dark:text-slate-100">
                {deleteTarget?.name || deleteTarget?.email}
              </strong>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleting}
              className="dark:border-slate-700 dark:text-slate-200"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePermanently}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Excluindo...' : 'Excluir Definitivamente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              className="dark:border-slate-700 dark:text-slate-200"
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
