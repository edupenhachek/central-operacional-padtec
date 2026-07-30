import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { importUsers, type ImportResult } from '@/services/user-import'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'

interface BulkImportDialogProps {
  open: boolean
  onClose: () => void
  onImported: () => void
}

export function BulkImportDialog({ open, onClose, onImported }: BulkImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected && selected.name.toLowerCase().endsWith('.xlsx')) {
      setFile(selected)
      setResult(null)
    } else {
      toast.error('Selecione um arquivo .xlsx válido')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files?.[0]
    if (dropped && dropped.name.toLowerCase().endsWith('.xlsx')) {
      setFile(dropped)
      setResult(null)
    } else {
      toast.error('Apenas arquivos .xlsx são aceitos')
    }
  }

  const handleImport = async () => {
    if (!file) return
    setLoading(true)
    setResult(null)
    try {
      const res = await importUsers(file)
      setResult(res)
      if (res.errors.length === 0) {
        toast.success(`Importação concluída: ${res.created} criados, ${res.updated} atualizados`)
      } else {
        toast.warning(`Importação concluída com ${res.errors.length} erro(s)`)
      }
      onImported()
    } catch (err) {
      toast.error('Erro na importação', { description: getErrorMessage(err) })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setResult(null)
    setLoading(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-slate-100 font-bold flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Importar Usuários em Massa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!result && (
            <>
              <div
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileSpreadsheet className="w-8 h-8 text-green-600 dark:text-green-400" />
                    <div className="text-left">
                      <p className="text-xs font-semibold text-foreground dark:text-slate-100">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground dark:text-slate-500 mb-2" />
                    <p className="text-xs font-medium text-foreground dark:text-slate-200">
                      Clique ou arraste um arquivo .xlsx
                    </p>
                    <p className="text-[10px] text-muted-foreground dark:text-slate-400 mt-1">
                      Colunas: USUÁRIO, Senha, E-MAIL CORPORATIVO, TELEFONE, CARGO, FUNÇÃO NO
                      SISTEMA, PROJETO, ESCALA
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="text-xs dark:border-slate-700 dark:text-slate-200"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!file || loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium gap-1.5"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  {loading ? 'Importando...' : 'Importar'}
                </Button>
              </div>
            </>
          )}

          {result && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 mx-auto text-green-600 dark:text-green-400 mb-1" />
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {result.created}
                  </p>
                  <p className="text-[10px] text-green-700 dark:text-green-300">Criados</p>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {result.updated}
                  </p>
                  <p className="text-[10px] text-blue-700 dark:text-blue-300">Atualizados</p>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 mx-auto text-red-600 dark:text-red-400 mb-1" />
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {result.errors.length}
                  </p>
                  <p className="text-[10px] text-red-700 dark:text-red-300">Erros</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {result.errors.map((err, i) => (
                    <div
                      key={i}
                      className="text-[11px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-200 dark:border-red-900"
                    >
                      {err}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
