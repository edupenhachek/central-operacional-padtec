migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (!users.fields.getByName('xp')) {
      users.fields.add(new NumberField({ name: 'xp' }))
    }
    if (!users.fields.getByName('level')) {
      users.fields.add(new NumberField({ name: 'level' }))
    }
    if (!users.fields.getByName('streak_days')) {
      users.fields.add(new NumberField({ name: 'streak_days' }))
    }
    if (!users.fields.getByName('last_training_activity')) {
      users.fields.add(new DateField({ name: 'last_training_activity' }))
    }
    app.save(users)

    let trainingModulesCol
    try {
      trainingModulesCol = app.findCollectionByNameOrId('training_modules')
    } catch (_) {
      trainingModulesCol = new Collection({
        name: 'training_modules',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.role = 'ADMIN' || @request.auth.role = 'SUPERADMIN'",
        updateRule: "@request.auth.role = 'ADMIN' || @request.auth.role = 'SUPERADMIN'",
        deleteRule: "@request.auth.role = 'ADMIN' || @request.auth.role = 'SUPERADMIN'",
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'order', type: 'number' },
          {
            name: 'type',
            type: 'select',
            values: ['onboarding', 'hub', 'simulation'],
            maxSelect: 1,
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(trainingModulesCol)
    }

    try {
      app.findCollectionByNameOrId('user_training_progress')
    } catch (_) {
      const progressCol = new Collection({
        name: 'user_training_progress',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          {
            name: 'user',
            type: 'relation',
            required: true,
            collectionId: '_pb_users_auth_',
            cascadeDelete: true,
            maxSelect: 1,
          },
          {
            name: 'module',
            type: 'relation',
            required: true,
            collectionId: trainingModulesCol.id,
            cascadeDelete: true,
            maxSelect: 1,
          },
          {
            name: 'status',
            type: 'select',
            values: ['not_started', 'in_progress', 'completed'],
            maxSelect: 1,
          },
          { name: 'checklist_data', type: 'json' },
          { name: 'completed_docs', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(progressCol)
    }

    try {
      app.findCollectionByNameOrId('simulation_logs')
    } catch (_) {
      const simCol = new Collection({
        name: 'simulation_logs',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          {
            name: 'user',
            type: 'relation',
            required: true,
            collectionId: '_pb_users_auth_',
            cascadeDelete: true,
            maxSelect: 1,
          },
          { name: 'persona_name', type: 'text', required: true },
          { name: 'interaction_log', type: 'json' },
          { name: 'score', type: 'number' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(simCol)
    }

    try {
      app.findCollectionByNameOrId('training_missions')
    } catch (_) {
      const missionsCol = new Collection({
        name: 'training_missions',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.role = 'ADMIN' || @request.auth.role = 'SUPERADMIN'",
        updateRule: "@request.auth.role = 'ADMIN' || @request.auth.role = 'SUPERADMIN'",
        deleteRule: "@request.auth.role = 'ADMIN' || @request.auth.role = 'SUPERADMIN'",
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'xp_reward', type: 'number' },
          { name: 'type', type: 'select', values: ['daily', 'milestone'], maxSelect: 1 },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(missionsCol)
    }

    const tmCol = app.findCollectionByNameOrId('training_modules')
    const modulesData = [
      {
        title: 'Trilha de Formação NOC BKO',
        description:
          'Jornada completa de formação para operadores do BackOffice — da imersão ao domínio operacional.',
        order: 1,
        type: 'onboarding',
      },
      {
        title: 'Base de Conhecimento & Quizzes Ops',
        description:
          'Estudo prático dos sistemas com avaliação contínua em 3 categorias estratégicas.',
        order: 2,
        type: 'hub',
      },
      {
        title: 'Simulador Prático de Atendimento e Exame',
        description:
          'Interações em chat com os clientes Vinícius, Osmar e Junior, e Exame Final de Aptidão.',
        order: 3,
        type: 'simulation',
      },
    ]

    for (const mData of modulesData) {
      try {
        app.findFirstRecordByData('training_modules', 'title', mData.title)
      } catch (_) {
        const rec = new Record(tmCol)
        rec.set('title', mData.title)
        rec.set('description', mData.description)
        rec.set('order', mData.order)
        rec.set('type', mData.type)
        app.save(rec)
      }
    }

    const tmissionsCol = app.findCollectionByNameOrId('training_missions')
    const missionsData = [
      { title: 'Acessar a plataforma', xp_reward: 20, type: 'daily' },
      { title: 'Consultar um documento', xp_reward: 30, type: 'daily' },
      { title: 'Concluir uma aula', xp_reward: 50, type: 'daily' },
      { title: 'Completar 3 aulas', xp_reward: 150, type: 'milestone' },
    ]

    for (const mData of missionsData) {
      try {
        app.findFirstRecordByData('training_missions', 'title', mData.title)
      } catch (_) {
        const rec = new Record(tmissionsCol)
        rec.set('title', mData.title)
        rec.set('xp_reward', mData.xp_reward)
        rec.set('type', mData.type)
        app.save(rec)
      }
    }

    try {
      const allUsers = app.findRecordsByFilter('users', "id != ''", '', 100, 0)
      for (const u of allUsers) {
        if (!u.get('xp')) {
          if (
            u.getString('email').includes('admin') ||
            u.getString('name').toLowerCase().includes('admin')
          ) {
            u.set('xp', 2500)
            u.set('level', 5)
            u.set('streak_days', 5)
          } else {
            u.set('xp', 1250)
            u.set('level', 3)
            u.set('streak_days', 1)
          }
          app.save(u)
        }
      }
    } catch (_) {}
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('training_missions'))
      app.delete(app.findCollectionByNameOrId('simulation_logs'))
      app.delete(app.findCollectionByNameOrId('user_training_progress'))
      app.delete(app.findCollectionByNameOrId('training_modules'))
    } catch (_) {}
  },
)
