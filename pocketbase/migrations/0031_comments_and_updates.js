migrate(
  (app) => {
    if (!app.hasTable('comments')) {
      var usersId = '_pb_users_auth_'
      var announcementsCol = app.findCollectionByNameOrId('announcements')

      var comments = new Collection({
        name: 'comments',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule:
          "@request.auth.id != '' && (author = @request.auth.id || @request.auth.role = 'ADMIN' || @request.auth.role = 'SUPERADMIN')",
        deleteRule:
          "@request.auth.id != '' && (author = @request.auth.id || @request.auth.role = 'ADMIN' || @request.auth.role = 'SUPERADMIN')",
        fields: [
          { name: 'content', type: 'text', required: true },
          {
            name: 'author',
            type: 'relation',
            collectionId: usersId,
            maxSelect: 1,
            required: true,
          },
          {
            name: 'announcement',
            type: 'relation',
            collectionId: announcementsCol.id,
            maxSelect: 1,
            required: true,
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_comments_announcement ON comments (announcement)',
          'CREATE INDEX idx_comments_created ON comments (created)',
        ],
      })
      app.save(comments)
    }

    var annCol = app.findCollectionByNameOrId('announcements')
    annCol.updateRule =
      "@request.auth.id != '' && (author = @request.auth.id || @request.auth.role = 'ADMIN' || @request.auth.role = 'SUPERADMIN')"
    annCol.deleteRule =
      "@request.auth.id != '' && (author = @request.auth.id || @request.auth.role = 'ADMIN' || @request.auth.role = 'SUPERADMIN')"
    app.save(annCol)

    var notifCol = app.findCollectionByNameOrId('notifications')
    if (notifCol.fields.getByName('type')) {
      notifCol.fields.removeByName('type')
    }
    notifCol.fields.add(
      new SelectField({
        name: 'type',
        values: ['schedule_created', 'schedule_updated', 'vacation_approved', 'announcement_high'],
        maxSelect: 1,
      }),
    )
    notifCol.deleteRule = 'user = @request.auth.id'
    app.save(notifCol)
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('comments')
      app.delete(col)
    } catch (_) {}
  },
)
