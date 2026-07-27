import pb from '@/lib/pocketbase/client'

export interface DocumentItem {
  id: string
  title: string
  category?: string
  file?: string
  created: string
  updated: string
}

export const getDocuments = () =>
  pb.collection('documents').getFullList<DocumentItem>({
    sort: '-created',
  })

export const createDocument = (data: FormData | { title: string; category?: string }) =>
  pb.collection('documents').create<DocumentItem>(data)

export const deleteDocument = (id: string) => pb.collection('documents').delete(id)
