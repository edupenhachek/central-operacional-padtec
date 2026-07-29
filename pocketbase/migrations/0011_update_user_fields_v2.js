migrate(
  (app) => {
    var newHorarios = [
      '06H15 ÁS 15H15',
      '08H00 ÁS 17H00',
      '09H00 ÁS 18H00',
      '10H00 ÁS 19H00',
      '11H00 ÁS 20H00',
      '11H30 ÁS 20H30',
      '13H00 ÁS 22H00',
      '15H00 ÁS 23H43',
      '23H30 ÁS 06H30',
    ]

    var usersCol = app.findCollectionByNameOrId('users')

    var roleField = usersCol.fields.getByName('role')
    if (roleField) {
      roleField.values = ['ADMIN', 'USUARIO', 'FOCAL BKO', 'FOCAL NOC', 'FOCAL COPE', 'SUPERADMIN']
    }

    var horarioField = usersCol.fields.getByName('horario_trabalho')
    if (horarioField) {
      horarioField.values = newHorarios
    }

    if (!usersCol.fields.getByName('projeto')) {
      usersCol.fields.add(
        new SelectField({
          name: 'projeto',
          values: ['NOC', 'BKO', 'COPE', 'OHR', 'Radisys'],
          maxSelect: 5,
        }),
      )
    }

    usersCol.updateRule =
      'id = @request.auth.id || @request.auth.role = "ADMIN" || @request.auth.role = "SUPERADMIN"'
    usersCol.deleteRule =
      'id = @request.auth.id || @request.auth.role = "ADMIN" || @request.auth.role = "SUPERADMIN"'

    app.save(usersCol)

    var allUsers = app.findRecordsByFilter('users', 'id != ""', '', 0, 0)
    for (var i = 0; i < allUsers.length; i++) {
      var record = allUsers[i]
      var changed = false

      var oldHorario = record.getString('horario_trabalho')
      if (oldHorario && newHorarios.indexOf(oldHorario) === -1) {
        record.set('horario_trabalho', '')
        changed = true
      }

      var equipeVal = record.getString('equipe')
      if (equipeVal) {
        var existingProjeto = record.get('projeto')
        if (!existingProjeto || (Array.isArray(existingProjeto) && existingProjeto.length === 0)) {
          record.set('projeto', [equipeVal])
          changed = true
        }
      }

      if (changed) {
        app.save(record)
      }
    }

    var usersColFinal = app.findCollectionByNameOrId('users')
    if (usersColFinal.fields.getByName('equipe')) {
      usersColFinal.fields.removeByName('equipe')
    }
    app.save(usersColFinal)
  },
  (app) => {
    var oldHorarios = [
      '07:00 às 16:00',
      '08:00 às 17:00',
      '09:00 às 18:00',
      '13:00 às 22:00',
      '22:00 às 07:00',
      'Escala 12x36',
    ]

    var usersCol = app.findCollectionByNameOrId('users')

    var roleField = usersCol.fields.getByName('role')
    if (roleField) {
      roleField.values = ['ADMIN', 'USUARIO', 'FOCAL BKO', 'FOCAL NOC', 'FOCAL COPE']
    }

    var horarioField = usersCol.fields.getByName('horario_trabalho')
    if (horarioField) {
      horarioField.values = oldHorarios
    }

    if (!usersCol.fields.getByName('equipe')) {
      usersCol.fields.add(
        new SelectField({
          name: 'equipe',
          values: ['NOC', 'BKO', 'COPE', 'OHR', 'Radisys'],
          maxSelect: 1,
        }),
      )
    }

    usersCol.updateRule = 'id = @request.auth.id || @request.auth.role = "ADMIN"'
    usersCol.deleteRule = 'id = @request.auth.id'

    app.save(usersCol)

    var allUsers = app.findRecordsByFilter('users', 'id != ""', '', 0, 0)
    for (var i = 0; i < allUsers.length; i++) {
      var record = allUsers[i]
      var changed = false

      var horario = record.getString('horario_trabalho')
      if (horario && oldHorarios.indexOf(horario) === -1) {
        record.set('horario_trabalho', '')
        changed = true
      }

      var projetoVal = record.get('projeto')
      if (Array.isArray(projetoVal) && projetoVal.length > 0) {
        record.set('equipe', projetoVal[0])
        changed = true
      }

      if (changed) {
        app.save(record)
      }
    }

    var usersColFinal = app.findCollectionByNameOrId('users')
    if (usersColFinal.fields.getByName('projeto')) {
      usersColFinal.fields.removeByName('projeto')
    }
    app.save(usersColFinal)
  },
)
