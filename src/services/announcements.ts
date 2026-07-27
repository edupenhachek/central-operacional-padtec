import pb from '@/lib/pocketbase/client'

export interface Announcement {
  id: string
  title: string
  content: string
  author?: string
  expand?: {
    author?: {
      name?: string
      email?: string
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

export const createAnnouncement = (data: { title: string; content: string; author?: string }) =>
  pb.collection('announcements').create<Announcement>(data)

export const deleteAnnouncement = (id: string) => pb.collection('announcements').delete(id)
