import pb from '@/lib/pocketbase/client'

export interface ImportResult {
  success: boolean
  created: number
  updated: number
  errors: string[]
  total: number
}

export const importUsers = async (file: File): Promise<ImportResult> => {
  const formData = new FormData()
  formData.append('file', file)

  return pb.send('/backend/v1/import-users', {
    method: 'POST',
    body: formData,
  })
}
