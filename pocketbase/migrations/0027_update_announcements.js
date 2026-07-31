migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('announcements')

    if (!col.fields.getByName('class')) {
      col.fields.add(
        new SelectField({
          name: 'class',
          values: ['Comunicados', 'Processos', 'Diário', 'Pendências'],
          maxSelect: 1,
        }),
      )
    }

    if (!col.fields.getByName('urgency')) {
      col.fields.add(
        new SelectField({
          name: 'urgency',
          values: ['Alta', 'Média', 'Baixa'],
          maxSelect: 1,
        }),
      )
    }

    if (!col.fields.getByName('attachments')) {
      col.fields.add(
        new FileField({
          name: 'attachments',
          maxSelect: 5,
          maxSize: 10485760,
        }),
      )
    }

    if (!col.fields.getByName('reactions')) {
      col.fields.add(
        new JSONField({
          name: 'reactions',
        }),
      )
    }

    app.save(col)

    try {
      var count = app.countRecords('announcements')
      var authorId = ''
      try {
        var user = app.findFirstRecordByData('users', 'email', 'eduardo.guidini@padtec.com.br')
        authorId = user.id
      } catch (_) {}

      if (count === 0 || !app.findFirstRecordByData('announcements', 'class', 'Comunicados')) {
        var rec1 = new Record(col)
        rec1.set('title', 'ATUALIZAÇÃO DE BATIMENTO DE CAIXA')
        rec1.set(
          'content',
          'A partir de hoje (31/07), o processo de batimento de caixa foi atualizado. Por favor, sigam o novo procedimento descrito no anexo e atentem-se aos prazos para conferência.',
        )
        rec1.set('class', 'Comunicados')
        rec1.set('urgency', 'Alta')
        rec1.set('reactions', { like: 12, heart: 8, clap: 5, confirm: 3 })
        if (authorId) rec1.set('author', authorId)
        app.save(rec1)

        var rec2 = new Record(col)
        rec2.set('title', 'NOVO FLUXO DE SOLICITAÇÃO DE ACESSOS')
        rec2.set(
          'content',
          'Estamos implementando um novo fluxo para solicitações de acessos a sistemas. Confira o passo a passo atualizado e em caso de dúvidas, comente aqui no post.',
        )
        rec2.set('class', 'Processos')
        rec2.set('urgency', 'Média')
        rec2.set('reactions', { like: 9, heart: 4, clap: 3, confirm: 2 })
        if (authorId) rec2.set('author', authorId)
        app.save(rec2)

        var rec3 = new Record(col)
        rec3.set('title', 'REUNIÃO DE ALINHAMENTO – 30/07')
        rec3.set(
          'content',
          'Resumo dos principais pontos discutidos na reunião de alinhamento de ontem:\n\n• Atualização dos indicadores operacionais;\n• Escalas do final de semana definidas;\n• Alinhamento do procedimento de transbordo entre turnos.',
        )
        rec3.set('class', 'Diário')
        rec3.set('urgency', 'Baixa')
        rec3.set('reactions', { like: 15, heart: 6, clap: 10, confirm: 8 })
        if (authorId) rec3.set('author', authorId)
        app.save(rec3)
      }
    } catch (e) {
      console.log('Migration 0027 seed note: ' + e.message)
    }
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('announcements')
      if (col.fields.getByName('class')) col.fields.removeByName('class')
      if (col.fields.getByName('urgency')) col.fields.removeByName('urgency')
      if (col.fields.getByName('attachments')) col.fields.removeByName('attachments')
      if (col.fields.getByName('reactions')) col.fields.removeByName('reactions')
      app.save(col)
    } catch (_) {}
  },
)
