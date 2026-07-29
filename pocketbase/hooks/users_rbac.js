onRecordUpdateRequest((e) => {
  if (!e.auth) {
    return e.next()
  }

  var role = e.auth.getString('role') || ''
  if (role === 'ADMIN' || role === 'SUPERADMIN') {
    return e.next()
  }

  var body = e.requestInfo().body || {}
  var protectedFields = ['role', 'projeto', 'horario_trabalho', 'cargo', 'equipe']

  for (var i = 0; i < protectedFields.length; i++) {
    if (protectedFields[i] in body) {
      return e.badRequestError('Você não tem permissão para alterar o campo: ' + protectedFields[i])
    }
  }

  e.next()
}, 'users')
