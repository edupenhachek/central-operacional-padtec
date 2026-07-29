import type { ComponentType } from 'react'
import Index from '@/pages/Index'
import Escalas from '@/pages/Escalas'
import ValidadorOPS from '@/pages/ValidadorOPS'
import Documentacao from '@/pages/Documentacao'
import Treinamentos from '@/pages/Treinamentos'

import Transbordo from '@/pages/Transbordo'
import Usuarios from '@/pages/Usuarios'

export interface TabConfigItem {
  path: string
  title: string
  component: ComponentType
  requiredRole?: string
}

export const TAB_CONFIG: TabConfigItem[] = [
  { path: '/', title: 'Dashboard', component: Index },
  { path: '/escalas', title: 'Escalas', component: Escalas },
  { path: '/validador-ops', title: 'Validador OPS', component: ValidadorOPS },
  { path: '/documentacao', title: 'Documentação', component: Documentacao },
  { path: '/treinamentos', title: 'Treinamentos', component: Treinamentos },

  { path: '/transbordo', title: 'Transbordo', component: Transbordo },
  { path: '/usuarios', title: 'Usuários', component: Usuarios, requiredRole: 'ADMIN' },
]

export function getTabConfig(path: string): TabConfigItem | undefined {
  return TAB_CONFIG.find((c) => c.path === path)
}
