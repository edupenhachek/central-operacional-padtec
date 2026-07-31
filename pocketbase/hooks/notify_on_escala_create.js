onRecordAfterCreateSuccess((e) => {
  var userId = e.record.getString('Usuario_ID')
  if (!userId) return e.next()

  var status = e.record.getString('Status')
  var data = e.record.getString('Data')
  var turno = e.record.getString('Turno')
  var projeto = e.record.getString('Projeto')
  var isVacation =
    status === 'FÉRIAS' || status === 'Férias' || status === 'Aprovado' || status === 'Aprovada'

  var title, content, type
  if (isVacation) {
    title = 'Férias aprovadas'
    content = 'Suas férias foram lançadas para ' + data
    type = 'vacation_approved'
  } else {
    title = 'Novo plantão criado'
    content = 'Data: ' + data + ' | Turno: ' + turno + ' | Projeto: ' + projeto
    type = 'schedule_created'
  }

  try {
    var col = $app.findCollectionByNameOrId('notifications')
    var record = new Record(col)
    record.set('user', userId)
    record.set('title', title)
    record.set('content', content)
    record.set('type', type)
    record.set('read', false)
    $app.save(record)
  } catch (err) {
    $app.logger().error('failed to create escala-create notification', 'err', err.message)
  }

  return e.next()
}, 'escalas')
