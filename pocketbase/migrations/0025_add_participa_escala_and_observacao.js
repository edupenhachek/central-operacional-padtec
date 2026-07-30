migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('users')
    if (!usersCol.fields.getByName('participa_escala')) {
      usersCol.fields.add(new BoolField({ name: 'participa_escala' }))
    }
    app.save(usersCol)

    var allUsers = app.findRecordsByFilter('users', 'id != ""', '', 0, 0)
    for (var i = 0; i < allUsers.length; i++) {
      var rec = allUsers[i]
      if (!rec.get('participa_escala')) {
        rec.set('participa_escala', true)
        app.save(rec)
      }
    }

    var escalasCol = app.findCollectionByNameOrId('escalas')
    if (!escalasCol.fields.getByName('observacao')) {
      escalasCol.fields.add(new TextField({ name: 'observacao' }))
    }
    app.save(escalasCol)
  },
  (app) => {
    var usersCol = app.findCollectionByNameOrId('users')
    var peField = usersCol.fields.getByName('participa_escala')
    if (peField) usersCol.fields.remove(peField)
    app.save(usersCol)

    var escalasCol = app.findCollectionByNameOrId('escalas')
    var obsField = escalasCol.fields.getByName('observacao')
    if (obsField) escalasCol.fields.remove(obsField)
    app.save(escalasCol)
  },
)
