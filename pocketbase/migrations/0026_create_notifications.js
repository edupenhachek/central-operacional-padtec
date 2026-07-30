migrate(
  (app) => {
    if (app.hasTable('notifications')) return

    var usersId = '_pb_users_auth_'

    var notifications = new Collection({
      name: 'notifications',
      type: 'base',
      listRule: 'user = @request.auth.id',
      viewRule: 'user = @request.auth.id',
      createRule: null,
      updateRule: 'user = @request.auth.id',
      deleteRule: null,
      fields: [
        { name: 'user', type: 'relation', collectionId: usersId, maxSelect: 1, required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          values: ['schedule_created', 'schedule_updated', 'vacation_approved'],
          maxSelect: 1,
        },
        { name: 'read', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_notifications_user_created ON notifications (user, created DESC)',
      ],
    })

    app.save(notifications)
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('notifications')
      app.delete(col)
    } catch (_) {}
  },
)
