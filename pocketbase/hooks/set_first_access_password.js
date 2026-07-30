routerAdd(
  'POST',
  '/backend/v1/users/set-first-password',
  (e) => {
    var userId = e.auth ? e.auth.id : ''
    if (!userId) {
      return e.unauthorizedError('Sessão expirada. Faça login novamente.')
    }

    var body = e.requestInfo().body || {}
    var password = body.password || ''
    var passwordConfirm = body.passwordConfirm || ''

    if (!password || password.length < 8) {
      return e.badRequestError('A senha deve ter no mínimo 8 caracteres.')
    }

    if (password !== passwordConfirm) {
      return e.badRequestError('As senhas não coincidem.')
    }

    try {
      var userRecord = $app.findRecordById('users', userId)
      userRecord.setPassword(password)
      userRecord.set('primeiro_acesso', false)
      $app.save(userRecord)

      return e.json(200, { success: true })
    } catch (err) {
      return e.json(500, { error: 'Erro ao atualizar senha. Tente novamente.' })
    }
  },
  $apis.requireAuth(),
)
