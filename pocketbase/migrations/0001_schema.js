migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')
    if (!usersCol.fields.getByName('role')) {
      usersCol.fields.add(
        new SelectField({
          name: 'role',
          values: ['NOC', 'COPE', 'BKO', 'ADMIN'],
        }),
      )
      app.save(usersCol)
    }

    const usersId = '_pb_users_auth_'

    if (!app.hasTable('announcements')) {
      const announcements = new Collection({
        name: 'announcements',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'content', type: 'text', required: true },
          { name: 'author', type: 'relation', collectionId: usersId, maxSelect: 1 },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(announcements)
    }

    if (!app.hasTable('documents')) {
      const documents = new Collection({
        name: 'documents',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'file', type: 'file', maxSelect: 1, maxSize: 10485760 },
          { name: 'category', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(documents)
    }

    if (!app.hasTable('internal_notices')) {
      const notices = new Collection({
        name: 'internal_notices',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'content', type: 'text', required: true },
          { name: 'priority', type: 'select', values: ['low', 'medium', 'high'] },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(notices)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('internal_notices'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('documents'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('announcements'))
    } catch (_) {}
  },
)
