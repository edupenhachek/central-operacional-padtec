import { useEffect, useState } from 'react'
import { Users, ShieldCheck, UserCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getUsers, updateUserRole, UserItem } from '@/services/users'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Usuarios() {
  const [users, setUsers] = useState<UserItem[]>([])

  const loadUsers = async () => {
    const list = await getUsers()
    setUsers(list)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleRoleChange = async (id: string, role: 'NOC' | 'COPE' | 'BKO' | 'ADMIN') => {
    await updateUserRole(id, role)
    loadUsers()
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Controle de permissões e perfis de acesso da Central Operacional.
        </p>
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
                    value={u.role || 'BKO'}
                    onValueChange={(val) => handleRoleChange(u.id, val as any)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NOC">NOC</SelectItem>
                      <SelectItem value="COPE">COPE</SelectItem>
                      <SelectItem value="BKO">BKO</SelectItem>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
