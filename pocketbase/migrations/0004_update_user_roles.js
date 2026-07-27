migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')
    const roleField = usersCol.fields.getByName('role')

    if (roleField) {
      roleField.values = ['ADMIN', 'USUARIO', 'FOCAL BKO', 'FOCAL NOC', 'FOCAL COPE']
    } else {
      usersCol.fields.add(
        new SelectField({
          name: 'role',
          values: ['ADMIN', 'USUARIO', 'FOCAL BKO', 'FOCAL NOC', 'FOCAL COPE'],
        }),
      )
    }
    app.save(usersCol)

    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'eduardo.guidini@padtec.com.br')
      admin.set('role', 'ADMIN')
      app.save(admin)
    } catch (_) {}
  },
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')
    const roleField = usersCol.fields.getByName('role')
    if (roleField) {
      roleField.values = ['NOC', 'COPE', 'BKO', 'ADMIN']
    } else {
      usersCol.fields.add(
        new SelectField({
          name: 'role',
          values: ['NOC', 'COPE', 'BKO', 'ADMIN'],
        }),
      )
    }
    app.save(usersCol)
  },
)
