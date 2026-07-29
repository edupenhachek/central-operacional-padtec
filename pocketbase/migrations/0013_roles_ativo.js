migrate(
  (app) => {
    if (!app.hasTable('roles')) {
      const roles = new Collection({
        name: 'roles',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: '@request.auth.role = "SUPERADMIN"',
        updateRule: '@request.auth.role = "SUPERADMIN"',
        deleteRule: '@request.auth.role = "SUPERADMIN"',
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'permissions', type: 'json' },
          { name: 'is_system', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE UNIQUE INDEX idx_roles_name ON roles (name)'],
      })
      app.save(roles)
    }

    var rolesCol = app.findCollectionByNameOrId('roles')
    var seedRoles = [
      {
        name: 'ADMIN',
        permissions: [
          'read_users',
          'edit_users',
          'deactivate_users',
          'export_csv',
          'edit_system_prompt',
          'access_dashboard',
          'view_gutenberg',
        ],
        is_system: true,
      },
      { name: 'USUARIO', permissions: ['access_dashboard', 'view_gutenberg'], is_system: true },
      {
        name: 'FOCAL BKO',
        permissions: ['read_users', 'access_dashboard', 'view_gutenberg'],
        is_system: true,
      },
      {
        name: 'FOCAL NOC',
        permissions: ['read_users', 'access_dashboard', 'view_gutenberg'],
        is_system: true,
      },
      {
        name: 'FOCAL COPE',
        permissions: ['read_users', 'access_dashboard', 'view_gutenberg'],
        is_system: true,
      },
      {
        name: 'SUPERADMIN',
        permissions: [
          'read_users',
          'edit_users',
          'deactivate_users',
          'delete_users',
          'manage_roles',
          'export_csv',
          'edit_system_prompt',
          'access_dashboard',
          'view_gutenberg',
        ],
        is_system: true,
      },
    ]

    for (var i = 0; i < seedRoles.length; i++) {
      var r = seedRoles[i]
      try {
        app.findFirstRecordByData('roles', 'name', r.name)
      } catch (_) {
        var record = new Record(rolesCol)
        record.set('name', r.name)
        record.set('permissions', r.permissions)
        record.set('is_system', r.is_system)
        app.save(record)
      }
    }

    var usersCol = app.findCollectionByNameOrId('users')
    if (!usersCol.fields.getByName('Ativo')) {
      usersCol.fields.add(new BoolField({ name: 'Ativo' }))
    }
    if (!usersCol.fields.getByName('user_role')) {
      var rolesId = app.findCollectionByNameOrId('roles').id
      usersCol.fields.add(
        new RelationField({ name: 'user_role', collectionId: rolesId, maxSelect: 1 }),
      )
    }
    app.save(usersCol)

    var allUsers = app.findRecordsByFilter('users', 'id != ""', '', 10000, 0)
    for (var j = 0; j < allUsers.length; j++) {
      var u = allUsers[j]
      var changed = false
      if (!u.get('Ativo')) {
        u.set('Ativo', true)
        changed = true
      }
      if (!u.get('user_role')) {
        var roleName = u.getString('role') || 'USUARIO'
        try {
          var roleRec = app.findFirstRecordByData('roles', 'name', roleName)
          u.set('user_role', roleRec.id)
          changed = true
        } catch (_) {}
      }
      if (changed) app.save(u)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('roles'))
    } catch (_) {}
  },
)
