migrate(
  (app) => {
    if (app.hasTable('feriados')) return

    const managementRule =
      "@request.auth.role = 'ADMIN' || @request.auth.role = 'SUPERADMIN' || @request.auth.role = 'FOCAL NOC' || @request.auth.role = 'FOCAL BKO' || @request.auth.role = 'FOCAL COPE'"

    const collection = new Collection({
      name: 'feriados',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: managementRule,
      updateRule: managementRule,
      deleteRule: managementRule,
      fields: [
        { name: 'data', type: 'date', required: true },
        { name: 'nome', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_feriados_data ON feriados (data)'],
    })
    app.save(collection)
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('feriados')
      app.delete(col)
    } catch (_) {}
  },
)
