import type { ComponentType } from 'react'
import {
  FileText,
  FileCode,
  Presentation,
  Folder,
  Building2,
  BookOpen,
  Wrench,
  KeyRound,
  Landmark,
  ClipboardList,
  GraduationCap,
} from 'lucide-react'
import type { DocumentItem } from '@/services/documents'

export type ViewMode = 'grade' | 'lista' | 'icones'

export interface FileTypeInfo {
  label: string
  bgColor: string
  iconColor: string
  icon: ComponentType<{ className?: string }>
}

export const CATEGORIES = [
  { name: 'Todos', icon: Folder },
  { name: 'Corporativo', icon: Building2 },
  { name: 'Diário de Bordo', icon: BookOpen },
  { name: 'Ferramentas', icon: Wrench },
  { name: 'Gestão de Acessos', icon: KeyRound },
  { name: 'Institucional', icon: Landmark },
  { name: 'Procedimentos', icon: ClipboardList },
  { name: 'Treinamentos', icon: GraduationCap },
] as const

export const PROJETO_ALVO_OPTIONS = ['NOC', 'COPE', 'BKO', 'TODOS']

export function getFileTypeInfo(doc: DocumentItem): FileTypeInfo {
  const title = doc.title.toLowerCase()
  const fileName = doc.file?.toLowerCase() || ''
  const customType = doc.file_type?.toUpperCase()

  if (customType) {
    if (customType.includes('WORD') || customType.includes('DOC')) {
      return {
        label: 'WORD',
        bgColor: 'bg-blue-50/80 dark:bg-blue-950/30',
        iconColor: 'text-blue-500',
        icon: FileText,
      }
    }
    if (customType.includes('APRESENTA') || customType.includes('PPT')) {
      return {
        label: 'APRESENTAÇÃO',
        bgColor: 'bg-amber-50/80 dark:bg-amber-950/30',
        iconColor: 'text-amber-500',
        icon: Presentation,
      }
    }
    return {
      label: 'PDF',
      bgColor: 'bg-red-50/80 dark:bg-red-950/30',
      iconColor: 'text-red-500',
      icon: FileCode,
    }
  }

  if (fileName.endsWith('.doc') || fileName.endsWith('.docx') || title.includes('manual')) {
    return {
      label: 'WORD',
      bgColor: 'bg-blue-50/80 dark:bg-blue-950/30',
      iconColor: 'text-blue-500',
      icon: FileText,
    }
  }
  if (
    fileName.endsWith('.ppt') ||
    fileName.endsWith('.pptx') ||
    title.includes('fluxo') ||
    title.includes('apresenta')
  ) {
    return {
      label: 'APRESENTAÇÃO',
      bgColor: 'bg-amber-50/80 dark:bg-amber-950/30',
      iconColor: 'text-amber-500',
      icon: Presentation,
    }
  }
  return {
    label: 'PDF',
    bgColor: 'bg-red-50/80 dark:bg-red-950/30',
    iconColor: 'text-red-500',
    icon: FileCode,
  }
}

export function getFileUrl(doc: DocumentItem): string {
  if (!doc.file) return ''
  return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/documents/${doc.id}/${doc.file}`
}

export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || ''
}

export type PreviewType = 'pdf' | 'video' | 'office' | 'image' | 'unsupported'

export function getPreviewType(fileName: string): PreviewType {
  const ext = getFileExtension(fileName)
  if (ext === 'pdf') return 'pdf'
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) return 'video'
  if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) return 'office'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image'
  return 'unsupported'
}
