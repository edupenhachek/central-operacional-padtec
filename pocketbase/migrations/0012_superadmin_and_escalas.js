migrate(
  (app) => {
    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'eduardo.guidini@padtec.com.br')
      admin.set('role', 'SUPERADMIN')
      app.save(admin)
    } catch (_) {}

    if (!app.hasTable('escalas')) {
      const usersId = '_pb_users_auth_'
      const escalas = new Collection({
        name: 'escalas',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'Data', type: 'date' },
          { name: 'Usuario_ID', type: 'relation', collectionId: usersId, maxSelect: 1 },
          { name: 'Projeto', type: 'text' },
          { name: 'Turno', type: 'text' },
          { name: 'Status', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(escalas)
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('escalas')
      app.delete(col)
    } catch (_) {}
    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'eduardo.guidini@padtec.com.br')
      admin.set('role', 'ADMIN')
      app.save(admin)
    } catch (_) {}
  },
)
