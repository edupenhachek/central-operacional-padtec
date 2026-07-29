import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileCheck, Download, FileWarning } from 'lucide-react'
import type { DocumentItem } from '@/services/documents'
import { getFileUrl, getPreviewType, getFileTypeInfo } from '@/lib/document-utils'

export function DocumentPreviewModal({
  doc,
  onClose,
}: {
  doc: DocumentItem | null
  onClose: () => void
}) {
  const [fileUrl, setFileUrl] = useState('')

  useEffect(() => {
    if (doc?.file && !doc.id.startsWith('demo-')) {
      setFileUrl(getFileUrl(doc))
    } else {
      setFileUrl('')
    }
  }, [doc])

  if (!doc) return null

  const hasFile = !!doc.file && !doc.id.startsWith('demo-')
  const previewType = hasFile ? getPreviewType(doc.file!) : null
  const typeInfo = getFileTypeInfo(doc)

  const renderPreview = () => {
    if (!hasFile || !previewType) {
      return (
        <div className="space-y-4 text-sm">
          <div className="p-3 bg-muted/60 dark:bg-slate-800/60 rounded-lg space-y-1">
            <p>
              <strong className="text-foreground dark:text-slate-200">Categoria:</strong>{' '}
              {doc.category || 'Procedimentos'}
            </p>
            <p>
              <strong className="text-foreground dark:text-slate-200">Data:</strong>{' '}
              {doc.created ? new Date(doc.created).toLocaleDateString('pt-BR') : '—'}
            </p>
            <p>
              <strong className="text-foreground dark:text-slate-200">Tipo:</strong>{' '}
              {typeInfo.label}
            </p>
            <p>
              <strong className="text-foreground dark:text-slate-200">Projeto:</strong>{' '}
              {doc.projeto_alvo?.join(', ') || '—'}
            </p>
          </div>
          <p className="text-muted-foreground dark:text-slate-300 leading-relaxed">
            Este é um documento operacional padronizado da Central Operacional Padtec. Utilize as
            diretrizes contidas neste material para orientar o atendimento de campo e escalonamento.
          </p>
        </div>
      )
    }

    switch (previewType) {
      case 'pdf':
        return (
          <embed
            src={fileUrl}
            type="application/pdf"
            className="w-full min-h-[60vh]"
            style={{ height: '60vh' }}
          />
        )
      case 'video':
        return <video controls src={fileUrl} className="w-full" style={{ maxHeight: '60vh' }} />
      case 'office':
        return (
          <iframe
            src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
            className="w-full border-0"
            style={{ height: '60vh' }}
            title={doc.title}
          />
        )
      case 'image':
        return (
          <img
            src={fileUrl}
            alt={doc.title}
            className="max-w-full mx-auto"
            style={{ maxHeight: '60vh' }}
          />
        )
      default:
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <FileWarning className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Preview não disponível para este tipo de arquivo.
            </p>
            <Button asChild>
              <a href={fileUrl} download>
                <Download className="w-4 h-4 mr-1.5" /> Baixar arquivo
              </a>
            </Button>
          </div>
        )
    }
  }

  return (
    <Dialog open={!!doc} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-card dark:bg-slate-900 border-border text-card-foreground dark:text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-500" />
            {doc.title}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2">{renderPreview()}</div>
      </DialogContent>
    </Dialog>
  )
}
