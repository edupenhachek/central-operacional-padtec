import pb from '@/lib/pocketbase/client'

export interface GutenbergSettings {
  id: string
  system_prompt: string
}

export const getGutenbergSettings = async (): Promise<GutenbergSettings> => {
  const records = await pb.collection('gutenberg_settings').getFullList()
  if (records.length === 0) return { id: '', system_prompt: '' }
  const r = records[0]
  return { id: r.id, system_prompt: r.system_prompt || '' }
}

export const updateGutenbergSettings = (id: string, systemPrompt: string) =>
  pb.collection('gutenberg_settings').update(id, { system_prompt: systemPrompt })
