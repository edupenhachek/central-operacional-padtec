import type { UserItem } from '@/services/users'

export function exportUsersToCSV(users: UserItem[]): void {
  const headers = ['Nome', 'E-mail', 'Telefone', 'Cargo', 'Função', 'Projeto', 'Escala', 'Ativo']
  const rows = users.map((u) => [
    `"${(u.name || '').replace(/"/g, '""')}"`,
    `"${(u.email || '').replace(/"/g, '""')}"`,
    `"${(u.phone || '').replace(/"/g, '""')}"`,
    `"${(u.cargo || '').replace(/"/g, '""')}"`,
    `"${(u.role || '').replace(/"/g, '""')}"`,
    `"${(Array.isArray(u.projeto) ? u.projeto.join('; ') : '').replace(/"/g, '""')}"`,
    `"${(u.horario_trabalho || '').replace(/"/g, '""')}"`,
    `"${u.Ativo !== false ? 'Ativo' : 'Desativado'}"`,
  ])
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute(
    'download',
    `usuarios_selecionados_${new Date().toISOString().slice(0, 10)}.csv`,
  )
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
