onRecordCreateRequest((e) => {
  var body = e.requestInfo().body || {}
  if (e.record && !('Ativo' in body)) {
    e.record.set('Ativo', true)
  }
  if (e.record && !('primeiro_acesso' in body)) {
    e.record.set('primeiro_acesso', true)
  }
  var requestedRole = body.role || 'USUARIO'

  if (!e.auth) {
    if (requestedRole !== 'USUARIO') {
      return e.badRequestError('Perfil inválido para auto-registro.')
    }
    return e.next()
  }

  var authRole = e.auth.getString('role') || ''

  if (requestedRole === 'SUPERADMIN' && authRole !== 'SUPERADMIN') {
    return e.badRequestError('Você não tem permissão para criar usuários com perfil SUPERADMIN.')
  }

  e.next()
}, 'users')
