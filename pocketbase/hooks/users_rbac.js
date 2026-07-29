onRecordUpdateRequest((e) => {
  if (!e.auth) {
    return e.next()
  }

  var role = e.auth.getString('role') || ''
  var body = e.requestInfo().body || {}

  if (body.role === 'SUPERADMIN' && role !== 'SUPERADMIN') {
    return e.badRequestError('Você não tem permissão para atribuir o perfil SUPERADMIN.')
  }

  if (role === 'ADMIN' || role === 'SUPERADMIN') {
    return e.next()
  }

  var protectedFields = [
    'role',
    'projeto',
    'horario_trabalho',
    'cargo',
    'equipe',
    'Ativo',
    'user_role',
  ]

  for (var i = 0; i < protectedFields.length; i++) {
    if (protectedFields[i] in body) {
      return e.badRequestError('Você não tem permissão para alterar o campo: ' + protectedFields[i])
    }
  }

  e.next()
}, 'users')
