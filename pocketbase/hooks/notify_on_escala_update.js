onRecordAfterUpdateSuccess((e) => {
  var userId = e.record.getString('Usuario_ID')
  if (!userId) return e.next()

  var oldStatus = e.record.original().getString('Status')
  var newStatus = e.record.getString('Status')
  var isVacation = newStatus === 'FÉRIAS' || newStatus === 'Férias' || newStatus === 'Aprovado' || newStatus === 'Aprovada'

  if (oldStatus !== newStatus && isVacation) return e.next()
  if (isVacation) return e.next()

  var fields = ['Data', 'Usuario_ID', 'Projeto', 'Turno', 'Status', 'observacao']
  var anyChanged = false
  for (var i = 0; i < fields.length; i++) {
    if (e.record.original().getString(fields[i]) !== e.record.getString(fields[i])) {
      anyChanged = true
      break
    }
  }
  if (!anyChanged) return e.next()

  var data = e.record.getString('Data')
  var turno = e.record.getString('Turno')
  var projeto = e.record.getString('Projeto')

  try {
    var col = $app.findCollectionByNameOrId('notifications')
    var record = new Record(col)
    record.set('user', userId)
    record.set('title', 'Plantão atualizado')
    record.set('content', 'Data: ' + data + ' | Turno: ' + turno + ' | Projeto: ' + projeto)
    record.set('type', 'schedule_updated')
    record.set('read', false)
    $app.save(record)
  } catch (err) {
    $app.logger().error('failed to create escala-update notification', 'err', err.message)
  }

  return e.next()
}, 'escalas')
