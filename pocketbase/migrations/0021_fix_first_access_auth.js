migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('users')
    usersCol.updateRule = '@request.auth.id = id'
    app.save(usersCol)
  },
  (app) => {
    var usersCol = app.findCollectionByNameOrId('users')
    usersCol.updateRule =
      'id = @request.auth.id || @request.auth.role = "ADMIN" || @request.auth.role = "SUPERADMIN"'
    app.save(usersCol)
  },
)
