migrate(
  (app) => {
    if (!app.hasTable('gutenberg_settings')) {
      var settings = new Collection({
        name: 'gutenberg_settings',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: '@request.auth.role = "ADMIN" || @request.auth.role = "SUPERADMIN"',
        updateRule: '@request.auth.role = "ADMIN" || @request.auth.role = "SUPERADMIN"',
        deleteRule: '@request.auth.role = "SUPERADMIN"',
        fields: [
          { name: 'system_prompt', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(settings)
    }

    var settingsCol = app.findCollectionByNameOrId('gutenberg_settings')
    try {
      app.findFirstRecordByFilter('gutenberg_settings', 'id != ""')
    } catch (_) {
      var record = new Record(settingsCol)
      record.set(
        'system_prompt',
        'Voce e o Gutenberg AI, assistente de inteligencia e operacao da Central Operacional Padtec. Responda sempre em Portugues do Brasil, de forma profissional, clara e direta. Utilize as informacoes da base de conhecimento quando aplicavel e cite a especialidade da fonte.',
      )
      app.save(record)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('gutenberg_settings'))
    } catch (_) {}
  },
)
