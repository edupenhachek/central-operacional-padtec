import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileCheck, Download, FileWarning, ExternalLink, ShieldCheck, Tag } from 'lucide-react'
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
  const TypeIcon = typeInfo.icon

  const renderPreview = () => {
    if (!hasFile || !previewType) {
      return (
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 pb-2">
              <span className="font-semibold text-foreground dark:text-slate-200 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-500" /> Categoria
              </span>
              <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-medium rounded-full text-xs">
                {doc.category || 'Procedimentos'}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 pb-2">
              <span className="font-semibold text-foreground dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Operação Alvo
              </span>
              <div className="flex gap-1 flex-wrap">
                {(doc.projeto_alvo || ['TODOS']).map((p) => (
                  <span
                    key={p}
                    className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold rounded text-[11px]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground dark:text-slate-200">
                Formato do Documento
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{typeInfo.label}</span>
            </div>
          </div>

          <div className="p-4 bg-blue-50/50 dark:bg-slate-800/40 rounded-xl border border-blue-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-foreground dark:text-slate-100 text-xs sm:text-sm">
              Instruções de Uso do Documento
            </h4>
            <p className="text-muted-foreground dark:text-slate-300 leading-relaxed text-xs">
              Este é um documento operacional padronizado da Central Operacional Gutenberg. Utilize
              as diretrizes contidas neste material para orientar o atendimento de campo, manobras
              técnicas e fluxos de escalonamento NOC / COPE / BKO.
            </p>
          </div>
        </div>
      )
    }

    switch (previewType) {
      case 'pdf':
        return (
          <div className="w-full h-[65vh] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
            <embed src={fileUrl} type="application/pdf" className="w-full h-full" />
          </div>
        )
      case 'video':
        return (
          <div className="w-full max-h-[65vh] flex items-center justify-center bg-black rounded-xl overflow-hidden">
            <video controls src={fileUrl} className="w-full max-h-[65vh] object-contain" />
          </div>
        )
      case 'office':
        return (
          <div className="w-full h-[65vh] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 relative">
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
              className="w-full h-full border-0"
              title={doc.title}
            />
          </div>
        )
      case 'image':
        return (
          <div className="w-full max-h-[65vh] flex items-center justify-center p-2 bg-slate-950 rounded-xl overflow-hidden">
            <img
              src={fileUrl}
              alt={doc.title}
              className="max-w-full max-h-[60vh] object-contain rounded"
            />
          </div>
        )
      default:
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-12 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <FileWarning className="w-12 h-12 text-amber-500" />
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-foreground dark:text-slate-200">
                Visualização direta não suportada no navegador
              </p>
              <p className="text-xs text-muted-foreground dark:text-slate-400">
                Você pode baixar o arquivo diretamente para visualizá-lo em seu computador.
              </p>
            </div>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9">
              <a href={fileUrl} downloadTarget="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" /> Baixar arquivo
              </a>
            </Button>
          </div>
        )
    }
  }

  return (
    <Dialog open={!!doc} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] bg-card dark:bg-slate-900 border-border text-card-foreground dark:text-slate-100 max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 pr-6 line-clamp-1">
            <TypeIcon className={`w-5 h-5 ${typeInfo.iconColor}`} />
            <span className="truncate">{doc.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-3 space-y-3">{renderPreview()}</div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              Criado em:{' '}
              {doc.created ? new Date(doc.created).toLocaleDateString('pt-BR') : '18/07/2026'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasFile && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => window.open(fileUrl, '_blank')}
              >
                <ExternalLink className="w-3.5 h-3.5" /> Abrir em nova aba
              </Button>
            )}

            <Button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-4 font-medium"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
