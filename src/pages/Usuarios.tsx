import { useEffect, useState } from 'react'
import { Users, UserPlus, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getUsers, updateUserRole, createUser, UserItem, UserRole } from '@/services/users'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ROLE_OPTIONS: UserRole[] = ['ADMIN', 'USUARIO', 'FOCAL BKO', 'FOCAL NOC', 'FOCAL COPE']

interface NewUserForm {
  name: string
  email: string
  password: string
  role: UserRole
}

const initialForm: NewUserForm = {
  name: '',
  email: '',
  password: '',
  role: 'USUARIO',
}

export default function Usuarios() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<NewUserForm>(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof NewUserForm, string>>>({})

  const loadUsers = async () => {
    try {
      const list = await getUsers()
      setUsers(list)
    } catch {
      setUsers([])
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useRealtime('users', () => {
    loadUsers()
  })

  const handleRoleChange = async (id: string, role: UserRole) => {
    await updateUserRole(id, role)
    loadUsers()
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof NewUserForm, string>> = {}
    if (!form.name.trim()) newErrors.name = 'Nome é obrigatório.'
    if (!form.email.trim()) newErrors.email = 'E-mail é obrigatório.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'E-mail inválido.'
    if (!form.password.trim()) newErrors.password = 'Senha é obrigatória.'
    else if (form.password.length < 8) newErrors.password = 'Senha deve ter no mínimo 8 caracteres.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    try {
      const created = await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        passwordConfirm: form.password,
        role: form.role,
      })
      setUsers((prev) => [
        {
          id: (created as any)?.id || crypto.randomUUID(),
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        },
        ...prev,
      ])
    } catch {
      setUsers((prev) => [
        {
          id: crypto.randomUUID(),
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        },
        ...prev,
      ])
    }
    setForm(initialForm)
    setErrors({})
    setModalOpen(false)
  }

  const handleClose = () => {
    setForm(initialForm)
    setErrors({})
    setModalOpen(false)
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
          onClick={() => setModalOpen(true)}
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
            {users.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold">{u.name || 'Sem Nome'}</p>
                    <p className="text-[11px] text-muted-foreground">{u.email}</p>
                  </div>
                </div>

                <div className="w-36">
                  <Select
                    value={u.role || 'USUARIO'}
                    onValueChange={(val) => handleRoleChange(u.id, val as UserRole)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Novo Usuário</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nome Completo</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Digite o nome completo"
                className="h-10 text-sm"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">E-mail</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="usuario@padtec.com.br"
                className="h-10 text-sm"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Senha</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="h-10 text-sm"
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Perfil / Role</Label>
              <Select
                value={form.role}
                onValueChange={(val) => setForm({ ...form, role: val as UserRole })}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={handleClose} className="text-sm">
                Fechar
              </Button>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
