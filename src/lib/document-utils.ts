import {
  FileText,
  Presentation,
  FileCode,
  FileSpreadsheet,
  Building2,
  BookOpen,
  Wrench,
  KeyRound,
  Landmark,
  ClipboardList,
  GraduationCap,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import type { DocumentItem } from '@/services/documents'

export type ViewMode = 'grid' | 'list' | 'icons'

export interface CategoryOption {
  label: string
  value: string
  icon: any
}

export const CATEGORIES: CategoryOption[] = [
  { label: 'Corporativo', value: 'Corporativo', icon: Building2 },
  { label: 'Diário de Bordo', value: 'Diário de Bordo', icon: BookOpen },
  { label: 'Ferramentas', value: 'Ferramentas', icon: Wrench },
  { label: 'Gestão de Acessos', value: 'Gestão de Acessos', icon: KeyRound },
  { label: 'Institucional', value: 'Institucional', icon: Landmark },
  { label: 'Procedimentos', value: 'Procedimentos', icon: ClipboardList },
  { label: 'Treinamentos', value: 'Treinamentos', icon: GraduationCap },
]

export const PROJETO_ALVO_OPTIONS = ['TODOS', 'NOC', 'COPE', 'BKO']

export type PreviewType = 'pdf' | 'video' | 'office' | 'image' | 'unknown'

export const getFileExtension = (filename?: string): string => {
  if (!filename) return ''
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : ''
}

export const getPreviewType = (filename: string): PreviewType => {
  const ext = getFileExtension(filename)
  if (['pdf'].includes(ext)) return 'pdf'
  if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return 'video'
  if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'csv'].includes(ext)) return 'office'
  if (['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(ext)) return 'image'
  return 'unknown'
}

export const getFileUrl = (doc: DocumentItem): string => {
  if (!doc.file || doc.id.startsWith('demo-')) return ''
  return pb.files.getURL(doc, doc.file)
}

export interface FileTypeInfo {
  label: string
  bgColor: string
  iconColor: string
  badgeColor: string
  icon: any
}

export const getFileTypeInfo = (doc: DocumentItem): FileTypeInfo => {
  const title = doc.title.toLowerCase()
  const fileName = doc.file?.toLowerCase() || ''
  const customType = doc.file_type?.toUpperCase()
  const ext = getFileExtension(fileName)

  if (customType) {
    if (customType.includes('WORD') || customType.includes('DOC')) {
      return {
        label: 'WORD',
        bgColor: 'bg-blue-50/80 dark:bg-blue-950/40',
        iconColor: 'text-blue-600 dark:text-blue-400',
        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
        icon: FileText,
      }
    }
    if (customType.includes('APRESENTAÇÃO') || customType.includes('PPT')) {
      return {
        label: 'PPT',
        bgColor: 'bg-amber-50/80 dark:bg-amber-950/40',
        iconColor: 'text-amber-600 dark:text-amber-400',
        badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
        icon: Presentation,
      }
    }
    if (customType.includes('EXCEL') || customType.includes('XLS')) {
      return {
        label: 'EXCEL',
        bgColor: 'bg-emerald-50/80 dark:bg-emerald-950/40',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
        icon: FileSpreadsheet,
      }
    }
    return {
      label: 'PDF',
      bgColor: 'bg-red-50/80 dark:bg-red-950/40',
      iconColor: 'text-red-600 dark:text-red-400',
      badgeColor: 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300',
      icon: FileCode,
    }
  }

  if (['doc', 'docx'].includes(ext) || title.includes('manual') || title.includes('relatório')) {
    return {
      label: 'WORD',
      bgColor: 'bg-blue-50/80 dark:bg-blue-950/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
      icon: FileText,
    }
  }

  if (['ppt', 'pptx'].includes(ext) || title.includes('fluxo') || title.includes('apresentação')) {
    return {
      label: 'PPT',
      bgColor: 'bg-amber-50/80 dark:bg-amber-950/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
      icon: Presentation,
    }
  }

  if (
    ['xls', 'xlsx', 'csv'].includes(ext) ||
    title.includes('planilha') ||
    title.includes('escala')
  ) {
    return {
      label: 'EXCEL',
      bgColor: 'bg-emerald-50/80 dark:bg-emerald-950/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
      icon: FileSpreadsheet,
    }
  }

  return {
    label: 'PDF',
    bgColor: 'bg-red-50/80 dark:bg-red-950/40',
    iconColor: 'text-red-600 dark:text-red-400',
    badgeColor: 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300',
    icon: FileCode,
  }
}
