migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')
    usersCol.listRule = "@request.auth.id != ''"
    usersCol.viewRule = "@request.auth.id != ''"
    usersCol.updateRule = 'id = @request.auth.id || @request.auth.role = "ADMIN"'

    const roleField = usersCol.fields.getByName('role')
    if (roleField) {
      roleField.values = ['ADMIN', 'USUARIO', 'FOCAL BKO', 'FOCAL NOC', 'FOCAL COPE']
    }

    app.save(usersCol)
  },
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')
    usersCol.listRule = "@request.auth.id != ''"
    usersCol.viewRule = "@request.auth.id != ''"
    usersCol.updateRule = 'id = @request.auth.id || @request.auth.role = "ADMIN"'
    app.save(usersCol)
  },
)
