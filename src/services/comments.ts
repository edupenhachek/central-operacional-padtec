import pb from '@/lib/pocketbase/client'

export interface CommentRecord {
  id: string
  content: string
  author: string
  announcement: string
  expand?: {
    author?: {
      id?: string
      name?: string
      avatar?: string
    }
  }
  created: string
  updated: string
}

export const getComments = () =>
  pb.collection('comments').getFullList<CommentRecord>({
    sort: 'created',
    expand: 'author',
  })

export const getCommentsByAnnouncement = (announcementId: string) =>
  pb.collection('comments').getFullList<CommentRecord>({
    filter: `announcement = "${announcementId}"`,
    sort: 'created',
    expand: 'author',
  })

export const createComment = (data: { content: string; author: string; announcement: string }) =>
  pb.collection('comments').create<CommentRecord>(data)

export const deleteComment = (id: string) => pb.collection('comments').delete(id)
