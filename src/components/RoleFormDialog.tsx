import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { PERMISSION_OPTIONS, type Role } from '@/services/roles'

interface RoleFormDialogProps {
  open: boolean
  role?: Role | null
  loading?: boolean
  onClose: () => void
  onSubmit: (data: { name: string; permissions: string[] }) => void
}

export function RoleFormDialog({ open, role, loading, onClose, onSubmit }: RoleFormDialogProps) {
  const [name, setName] = useState('')
  const [permissions, setPermissions] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      setName(role?.name || '')
      setPermissions(role?.permissions || [])
    }
  }, [open, role])

  const togglePermission = (perm: string) => {
    if (permissions.includes(perm)) {
      setPermissions(permissions.filter((p) => p !== perm))
    } else {
      setPermissions([...permissions, perm])
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-slate-100 font-bold">
            {role ? 'Editar Perfil' : 'Novo Perfil'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Nome do Perfil</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Operador BKO"
              className="h-10 text-sm bg-background dark:bg-slate-900/80 border-input"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Permissões</Label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {PERMISSION_OPTIONS.map((opt) => (
                <div key={opt.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`perm-${opt.value}`}
                    checked={permissions.includes(opt.value)}
                    onCheckedChange={(checked) => checked === true && togglePermission(opt.value)}
                    onClick={() => togglePermission(opt.value)}
                  />
                  <Label htmlFor={`perm-${opt.value}`} className="text-xs cursor-pointer">
                    {opt.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="text-sm">
              Cancelar
            </Button>
            <Button
              onClick={() => onSubmit({ name: name.trim(), permissions })}
              disabled={loading || !name.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
