import pb from '@/lib/pocketbase/client'

export type AnnouncementClass = 'Comunicados' | 'Processos' | 'Diário' | 'Pendências'
export type AnnouncementUrgency = 'Alta' | 'Média' | 'Baixa'

export interface Announcement {
  id: string
  title: string
  content: string
  class?: AnnouncementClass
  urgency?: AnnouncementUrgency
  attachments?: string[] | string
  reactions?: Record<string, number>
  author?: string
  expand?: {
    author?: {
      id?: string
      name?: string
      email?: string
      avatar?: string
    }
  }
  created: string
  updated: string
}

export const getAnnouncements = () =>
  pb.collection('announcements').getFullList<Announcement>({
    sort: '-created',
    expand: 'author',
  })

export const getAnnouncement = (id: string) =>
  pb.collection('announcements').getOne<Announcement>(id, {
    expand: 'author',
  })

export const createAnnouncement = (data: FormData | Partial<Announcement>) =>
  pb.collection('announcements').create<Announcement>(data)

export const updateAnnouncementReactions = (id: string, reactions: Record<string, number>) =>
  pb.collection('announcements').update<Announcement>(id, { reactions })

export const deleteAnnouncement = (id: string) => pb.collection('announcements').delete(id)
