import { useEffect, useState } from 'react'
import { UserPlus, Pencil, Trash2, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RoleFormDialog } from '@/components/RoleFormDialog'
import { getRoles, createRole, updateRole, deleteRole, type Role } from '@/services/roles'
import { useRealtime } from '@/hooks/use-realtime'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'

export function RolesTab() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editRole, setEditRole] = useState<Role | null>(null)
  const [saving, setSaving] = useState(false)

  const loadRoles = async () => {
    try {
      setLoading(true)
      const data = await getRoles()
      setRoles(data)
    } catch (err) {
      toast.error('Erro ao carregar perfis', { description: getErrorMessage(err) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoles()
  }, [])
  useRealtime('roles', () => loadRoles())

  const handleSubmit = async (data: { name: string; permissions: string[] }) => {
    setSaving(true)
    try {
      if (editRole) {
        await updateRole(editRole.id, data)
        toast.success('Perfil atualizado')
      } else {
        await createRole(data)
        toast.success('Perfil criado')
      }
      setDialogOpen(false)
      setEditRole(null)
      loadRoles()
    } catch (err) {
      toast.error('Erro ao salvar perfil', { description: getErrorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (role: Role) => {
    if (role.is_system) return
    try {
      await deleteRole(role.id)
      toast.success('Perfil excluído')
      loadRoles()
    } catch (err) {
      toast.error('Erro ao excluir perfil', { description: getErrorMessage(err) })
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground dark:text-slate-100">Perfis de Acesso</h2>
        <Button
          onClick={() => {
            setEditRole(null)
            setDialogOpen(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm gap-2"
        >
          <UserPlus className="w-4 h-4" /> Novo Perfil
        </Button>
      </div>
      <Card className="border-border bg-card dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground dark:text-slate-100">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Perfis Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y border-t border-border">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Carregando...</div>
            ) : roles.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Nenhum perfil encontrado.
              </div>
            ) : (
              roles.map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-foreground dark:text-slate-100">
                        {r.name}
                      </p>
                      {r.is_system && (
                        <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded">
                          SISTEMA
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                      {r.permissions.length} permissão(ões)
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditRole(r)
                        setDialogOpen(true)
                      }}
                      className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(r)}
                      disabled={r.is_system}
                      className="h-8 w-8 text-muted-foreground hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      <RoleFormDialog
        open={dialogOpen}
        role={editRole}
        loading={saving}
        onClose={() => {
          setDialogOpen(false)
          setEditRole(null)
        }}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
