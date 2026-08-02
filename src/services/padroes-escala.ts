import pb from '@/lib/pocketbase/client'
import type { PatternConfig } from '@/lib/escala-utils'

export interface PadraoEscalaRecord {
  id: string
  nome: string
  qtd_semanas: number
  configuracao: PatternConfig
  created: string
  updated: string
}

export interface PatternInput {
  nome: string
  qtd_semanas: number
  configuracao: PatternConfig
}

export const getPatterns = async (): Promise<PadraoEscalaRecord[]> => {
  return pb.collection('padroes_escala').getFullList({
    sort: '-created',
  }) as Promise<PadraoEscalaRecord[]>
}

export const createPattern = (data: PatternInput) => pb.collection('padroes_escala').create(data)

export const updatePattern = (id: string, data: PatternInput) =>
  pb.collection('padroes_escala').update(id, data)

export const deletePattern = (id: string) => pb.collection('padroes_escala').delete(id)
