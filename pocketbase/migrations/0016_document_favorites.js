migrate(
  (app) => {
    if (!app.hasTable('document_favorites')) {
      const docsCol = app.findCollectionByNameOrId('documents')
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

      const collection = new Collection({
        name: 'document_favorites',
        type: 'base',
        listRule: "@request.auth.id != '' && user = @request.auth.id",
        viewRule: "@request.auth.id != '' && user = @request.auth.id",
        createRule: "@request.auth.id != '' && user = @request.auth.id",
        updateRule: "@request.auth.id != '' && user = @request.auth.id",
        deleteRule: "@request.auth.id != '' && user = @request.auth.id",
        fields: [
          {
            name: 'user',
            type: 'relation',
            required: true,
            collectionId: usersCol.id,
            cascadeDelete: true,
            maxSelect: 1,
          },
          {
            name: 'document',
            type: 'relation',
            required: true,
            collectionId: docsCol.id,
            cascadeDelete: true,
            maxSelect: 1,
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_doc_fav_user_doc ON document_favorites (user, document)',
        ],
      })
      app.save(collection)
    }
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('document_favorites')
      app.delete(collection)
    } catch (_) {}
  },
)
