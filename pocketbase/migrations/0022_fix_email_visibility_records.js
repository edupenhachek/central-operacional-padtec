migrate(
  (app) => {
    try {
      app
        .db()
        .newQuery(
          'UPDATE users SET emailVisibility = 1 WHERE emailVisibility = 0 OR emailVisibility IS NULL',
        )
        .execute()
    } catch (err) {
      console.log('Failed to update emailVisibility on users records:', err)
    }

    try {
      var col = app.findCollectionByNameOrId('users')
      col.emailVisibility = true
      app.save(col)
    } catch (err) {
      console.log('Failed to set collection emailVisibility:', err)
    }
  },
  (app) => {
    // down — no-op; reverting email visibility to hidden is not desired
  },
)
