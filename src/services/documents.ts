import pb from '@/lib/pocketbase/client'

export interface DocumentItem {
  id: string
  title: string
  category?: string
  file?: string
  file_type?: string
  projeto_alvo?: string[]
  created: string
  updated: string
}

export interface DocumentFavorite {
  id: string
  user: string
  document: string
  created: string
}

export const getDocuments = () =>
  pb.collection('documents').getFullList<DocumentItem>({
    sort: '-created',
  })

export const createDocument = async (
  data: { title: string; category?: string; file?: File | null; projetoAlvo?: string[] } | FormData,
) => {
  if (data instanceof FormData) {
    return pb.collection('documents').create<DocumentItem>(data)
  }

  const formData = new FormData()
  formData.append('title', data.title)
  if (data.category) {
    formData.append('category', data.category)
  }
  if (data.file) {
    formData.append('file', data.file)
  }
  if (data.projetoAlvo && data.projetoAlvo.length > 0) {
    data.projetoAlvo.forEach((p) => formData.append('projeto_alvo', p))
  }

  return pb.collection('documents').create<DocumentItem>(formData)
}

export const deleteDocument = (id: string) => pb.collection('documents').delete(id)

export const getUserFavorites = async (userId: string): Promise<DocumentFavorite[]> => {
  if (!userId) return []
  try {
    return await pb.collection('document_favorites').getFullList<DocumentFavorite>({
      filter: `user = "${userId}"`,
    })
  } catch (err) {
    console.error('Error fetching favorites:', err)
    return []
  }
}

export const addFavorite = async (userId: string, documentId: string) => {
  return pb.collection('document_favorites').create<DocumentFavorite>({
    user: userId,
    document: documentId,
  })
}

export const removeFavorite = async (favoriteId: string) => {
  return pb.collection('document_favorites').delete(favoriteId)
}
