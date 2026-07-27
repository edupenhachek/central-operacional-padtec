migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let adminRecord

    try {
      adminRecord = app.findAuthRecordByEmail('_pb_users_auth_', 'eduardo.guidini@padtec.com.br')
      adminRecord.set('name', 'Administrador BKO')
      adminRecord.set('role', 'ADMIN')
      app.save(adminRecord)
    } catch (_) {
      adminRecord = new Record(users)
      adminRecord.setEmail('eduardo.guidini@padtec.com.br')
      adminRecord.setPassword('Skip@Pass')
      adminRecord.setVerified(true)
      adminRecord.set('name', 'Administrador BKO')
      adminRecord.set('role', 'ADMIN')
      app.save(adminRecord)
    }

    const annCol = app.findCollectionByNameOrId('announcements')
    try {
      app.findFirstRecordByData('announcements', 'title', 'Mudanças no fluxo de Batimento de Caixa')
    } catch (_) {
      const ann = new Record(annCol)
      ann.set('title', 'Mudanças no fluxo de Batimento de Caixa')
      ann.set(
        'content',
        'Olá, pessoal, abaixo segue um descritivo do novo procedimento de batimento. Por favor, certifiquem-se de revisar os passos antes do fechamento do turno.',
      )
      ann.set('author', adminRecord.id)
      app.save(ann)
    }

    const docCol = app.findCollectionByNameOrId('documents')
    try {
      app.findFirstRecordByData('documents', 'title', 'Batimento de Caixa - Procedimentos')
    } catch (_) {
      const doc1 = new Record(docCol)
      doc1.set('title', 'Batimento de Caixa - Procedimentos')
      doc1.set('category', 'Manuais')
      app.save(doc1)
    }

    try {
      app.findFirstRecordByData(
        'documents',
        'title',
        'Passo a Passo Batimento de Caixa - Tela Única',
      )
    } catch (_) {
      const doc2 = new Record(docCol)
      doc2.set('title', 'Passo a Passo Batimento de Caixa - Tela Única')
      doc2.set('category', 'Procedimentos')
      app.save(doc2)
    }

    const noticeCol = app.findCollectionByNameOrId('internal_notices')
    const noticesSeed = [
      { content: 'Atualizacao semanal dos fluxos operacionais publicada.', priority: 'medium' },
      { content: 'Treinamento GPON recomendado para novos colaboradores.', priority: 'low' },
      {
        content: 'Use o Gutenberg para consultar procedimentos antes de escalar.',
        priority: 'high',
      },
    ]

    for (let i = 0; i < noticesSeed.length; i++) {
      try {
        app.findFirstRecordByData('internal_notices', 'content', noticesSeed[i].content)
      } catch (_) {
        const n = new Record(noticeCol)
        n.set('content', noticesSeed[i].content)
        n.set('priority', noticesSeed[i].priority)
        app.save(n)
      }
    }
  },
  (app) => {},
)
