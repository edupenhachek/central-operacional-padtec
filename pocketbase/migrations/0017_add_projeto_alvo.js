migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('documents')
    if (!col.fields.getByName('projeto_alvo')) {
      col.fields.add(
        new SelectField({
          name: 'projeto_alvo',
          values: ['NOC', 'COPE', 'BKO', 'TODOS'],
          maxSelect: 4,
        }),
      )
      app.save(col)
    }

    try {
      const records = app.findRecordsByFilter('documents', "id != ''", '', 1000, 0)
      for (const record of records) {
        const current = record.get('projeto_alvo')
        if (!current || (Array.isArray(current) && current.length === 0)) {
          record.set('projeto_alvo', ['TODOS'])
          app.save(record)
        }
      }
    } catch (_) {}
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('documents')
      const field = col.fields.getByName('projeto_alvo')
      if (field) {
        col.fields.remove(field)
        app.save(col)
      }
    } catch (_) {}
  },
)
