import pb from '@/lib/pocketbase/client'

export type NotificationType =
  | 'schedule_created'
  | 'schedule_updated'
  | 'vacation_approved'
  | 'announcement_high'

export interface NotificationRecord {
  id: string
  user: string
  title: string
  content: string
  type: NotificationType
  read: boolean
  created: string
  updated: string
}

export const getNotifications = async (): Promise<NotificationRecord[]> =>
  pb.collection('notifications').getFullList<NotificationRecord>({
    sort: '-created',
  })

export const getUnreadCount = async (): Promise<number> => {
  const res = await pb.collection('notifications').getList(1, 1, {
    filter: 'read = false',
  })
  return res.totalItems
}

export const markAllAsRead = async (): Promise<void> => {
  const unread = await pb.collection('notifications').getFullList({
    filter: 'read = false',
  })
  await Promise.all(unread.map((n) => pb.collection('notifications').update(n.id, { read: true })))
}

export const markAsRead = async (id: string): Promise<void> =>
  pb.collection('notifications').update(id, { read: true })

export const deleteNotification = (id: string) => pb.collection('notifications').delete(id)

export const deleteNotifications = async (ids: string[]) => {
  await Promise.allSettled(ids.map((id) => pb.collection('notifications').delete(id)))
}
