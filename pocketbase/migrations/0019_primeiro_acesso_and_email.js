migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('users')
    if (!usersCol.fields.getByName('primeiro_acesso')) {
      usersCol.fields.add(new BoolField({ name: 'primeiro_acesso' }))
    }
    app.save(usersCol)

    var allUsers = app.findRecordsByFilter('users', 'id != ""', '', 10000, 0)
    for (var i = 0; i < allUsers.length; i++) {
      if (!allUsers[i].get('primeiro_acesso')) {
        allUsers[i].set('primeiro_acesso', true)
        app.save(allUsers[i])
      }
    }

    try {
      var settings = app.settings()
      if (settings.meta) {
        settings.meta.senderName = 'Central Operacional Padtec'
        app.save(settings)
      }
    } catch (_) {}
  },
  (app) => {
    try {
      var usersCol = app.findCollectionByNameOrId('users')
      var field = usersCol.fields.getByName('primeiro_acesso')
      if (field) usersCol.fields.remove(field)
      app.save(usersCol)
    } catch (_) {}
  },
)
