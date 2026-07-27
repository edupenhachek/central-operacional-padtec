migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    col.emailVisibility = true
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    col.emailVisibility = false
    app.save(col)
  },
)
