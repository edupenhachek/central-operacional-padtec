import pb from '@/lib/pocketbase/client'

export interface InternalNotice {
  id: string
  content: string
  priority?: 'low' | 'medium' | 'high'
  created: string
  updated: string
}

export const getInternalNotices = () =>
  pb.collection('internal_notices').getFullList<InternalNotice>({
    sort: '-created',
  })

export const createInternalNotice = (data: {
  content: string
  priority?: 'low' | 'medium' | 'high'
}) => pb.collection('internal_notices').create<InternalNotice>(data)

export const deleteInternalNotice = (id: string) => pb.collection('internal_notices').delete(id)
