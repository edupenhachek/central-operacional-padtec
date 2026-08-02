migrate(
  (app) => {
    if (app.hasTable('padroes_escala')) return

    const managementRule =
      "@request.auth.role = 'ADMIN' || @request.auth.role = 'SUPERADMIN' || @request.auth.role = 'FOCAL NOC' || @request.auth.role = 'FOCAL BKO' || @request.auth.role = 'FOCAL COPE'"

    const collection = new Collection({
      name: 'padroes_escala',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: managementRule,
      updateRule: managementRule,
      deleteRule: managementRule,
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'qtd_semanas', type: 'number', required: true, min: 1, max: 8, onlyInt: true },
        { name: 'configuracao', type: 'json', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)

    var col = app.findCollectionByNameOrId('padroes_escala')

    try {
      app.findFirstRecordByData('padroes_escala', 'nome', 'COPE 3 Semanas')
    } catch (_) {
      var cope = new Record(col)
      cope.set('nome', 'COPE 3 Semanas')
      cope.set('qtd_semanas', 3)
      cope.set(
        'configuracao',
        JSON.stringify({
          semana_1: { seg: 'T', ter: 'F', qua: 'T', qui: 'T', sex: 'T', sab: 'F', dom: 'F' },
          semana_2: { seg: 'T', ter: 'T', qua: 'F', qui: 'T', sex: 'T', sab: 'T', dom: 'T' },
          semana_3: { seg: 'F', ter: 'T', qua: 'T', qui: 'F', sex: 'T', sab: 'T', dom: 'T' },
        }),
      )
      app.save(cope)
    }

    try {
      app.findFirstRecordByData('padroes_escala', 'nome', 'Ponto Focal 2 Semanas')
    } catch (_) {
      var pf = new Record(col)
      pf.set('nome', 'Ponto Focal 2 Semanas')
      pf.set('qtd_semanas', 2)
      pf.set(
        'configuracao',
        JSON.stringify({
          semana_1: { seg: 'T', ter: 'T', qua: 'T', qui: 'T', sex: 'T', sab: 'F', dom: 'F' },
          semana_2: { seg: 'T', ter: 'T', qua: 'T', qui: 'T', sex: 'F', sab: 'T', dom: 'F' },
        }),
      )
      app.save(pf)
    }
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('padroes_escala')
      app.delete(col)
    } catch (_) {}
  },
)
