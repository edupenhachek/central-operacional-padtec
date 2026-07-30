migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.updateRule =
      '@request.auth.id = id || @request.auth.role = "ADMIN" || @request.auth.role = "SUPERADMIN"'
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.updateRule = '@request.auth.id = id'
    app.save(col)
  },
)
