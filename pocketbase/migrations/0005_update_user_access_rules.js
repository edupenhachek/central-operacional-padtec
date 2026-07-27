migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')
    let changed = false

    if (usersCol.listRule !== "@request.auth.id != ''") {
      usersCol.listRule = "@request.auth.id != ''"
      changed = true
    }
    if (usersCol.viewRule !== "@request.auth.id != ''") {
      usersCol.viewRule = "@request.auth.id != ''"
      changed = true
    }
    if (usersCol.updateRule !== 'id = @request.auth.id || @request.auth.role = "ADMIN"') {
      usersCol.updateRule = 'id = @request.auth.id || @request.auth.role = "ADMIN"'
      changed = true
    }

    if (changed) {
      app.save(usersCol)
    }
  },
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')
    usersCol.listRule = 'id = @request.auth.id'
    usersCol.viewRule = 'id = @request.auth.id'
    usersCol.updateRule = 'id = @request.auth.id'
    app.save(usersCol)
  },
)
