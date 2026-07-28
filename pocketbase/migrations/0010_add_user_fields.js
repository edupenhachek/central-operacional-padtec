migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')

    if (!usersCol.fields.getByName('phone')) {
      usersCol.fields.add(new TextField({ name: 'phone' }))
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
    if (!usersCol.fields.getByName('horario_trabalho')) {
      usersCol.fields.add(
        new SelectField({
          name: 'horario_trabalho',
          values: [
            '07:00 às 16:00',
            '08:00 às 17:00',
            '09:00 às 18:00',
            '13:00 às 22:00',
            '22:00 às 07:00',
            'Escala 12x36',
          ],
          maxSelect: 1,
        }),
      )
    }
    if (!usersCol.fields.getByName('cargo')) {
      usersCol.fields.add(new TextField({ name: 'cargo' }))
    }

    app.save(usersCol)
  },
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')

    const phoneField = usersCol.fields.getByName('phone')
    if (phoneField) usersCol.fields.remove(phoneField)

    const equipeField = usersCol.fields.getByName('equipe')
    if (equipeField) usersCol.fields.remove(equipeField)

    const horarioField = usersCol.fields.getByName('horario_trabalho')
    if (horarioField) usersCol.fields.remove(horarioField)

    const cargoField = usersCol.fields.getByName('cargo')
    if (cargoField) usersCol.fields.remove(cargoField)

    app.save(usersCol)
  },
)
