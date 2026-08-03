import { useState } from 'react'
import { FileText, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ImageLightbox } from '@/components/transbordo/ImageLightbox'

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp']

function getFileExt(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

function isImageFile(filename: string): boolean {
  return IMAGE_EXTENSIONS.includes(getFileExt(filename))
}

const DOC_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pdf: {
    label: 'PDF',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/40',
  },
  pptx: {
    label: 'PPTX',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
  },
  ppt: {
    label: 'PPT',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
  },
  docx: {
    label: 'DOCX',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
  },
  doc: {
    label: 'DOC',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
  },
  xls: {
    label: 'XLS',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/40',
  },
  xlsx: {
    label: 'XLSX',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/40',
  },
}

interface AttachmentListProps {
  attachments: string[]
  announcementId: string
}

export function AttachmentList({ attachments, announcementId }: AttachmentListProps) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  if (!attachments.length) return null

  const baseUrl = import.meta.env.VITE_POCKETBASE_URL
  const fileUrl = (file: string) => `${baseUrl}/api/files/announcements/${announcementId}/${file}`

  const images = attachments.filter(isImageFile)
  const docs = attachments.filter((f) => !isImageFile(f))

  return (
    <div className="mt-3 space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {images.map((file, idx) => (
            <div
              key={`img-${idx}`}
              className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer"
              onClick={() => setLightboxSrc(fileUrl(file))}
            >
              <img src={fileUrl(file)} alt={file} className="w-full h-auto object-contain" />
            </div>
          ))}
        </div>
      )}

      {docs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {docs.map((file, idx) => {
            const ext = getFileExt(file)
            const config = DOC_TYPE_CONFIG[ext] || {
              label: ext.toUpperCase() || 'FILE',
              color: 'text-slate-600 dark:text-slate-400',
              bg: 'bg-slate-100 dark:bg-slate-800',
            }
            return (
              <div
                key={`doc-${idx}`}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                      config.bg,
                    )}
                  >
                    <FileText className={cn('w-4 h-4', config.color)} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {file}
                    </p>
                    <p className="text-[10px] text-slate-400">{config.label}</p>
                  </div>
                </div>
                <a
                  href={fileUrl(file)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            )
          })}
        </div>
      )}

      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          alt="Anexo"
          isOpen={!!lightboxSrc}
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </div>
  )
}
