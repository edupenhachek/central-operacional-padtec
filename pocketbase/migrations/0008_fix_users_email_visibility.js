migrate(
  (app) => {
    try {
      app.db().newQuery('UPDATE users SET emailVisibility = 1').execute()
    } catch (err) {
      console.log('Failed to update emailVisibility on users table:', err)
    }
  },
  (app) => {
    // down
  },
)
