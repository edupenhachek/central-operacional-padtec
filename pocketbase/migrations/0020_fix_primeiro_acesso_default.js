migrate(
  (app) => {
    try {
      var usersCol = app.findCollectionByNameOrId('users')
      if (!usersCol.fields.getByName('primeiro_acesso')) {
        usersCol.fields.add(new BoolField({ name: 'primeiro_acesso' }))
        app.save(usersCol)
      }
    } catch (_) {}

    var allUsers = app.findRecordsByFilter('users', 'id != ""', '', 10000, 0)
    for (var i = 0; i < allUsers.length; i++) {
      allUsers[i].set('primeiro_acesso', false)
      app.save(allUsers[i])
    }
  },
  (app) => {
    try {
      var allUsers = app.findRecordsByFilter('users', 'id != ""', '', 10000, 0)
      for (var i = 0; i < allUsers.length; i++) {
        allUsers[i].set('primeiro_acesso', true)
        app.save(allUsers[i])
      }
    } catch (_) {}
  },
)
