onRecordAfterUpdateSuccess((e) => {
  var userId = e.record.getString('Usuario_ID')
  if (!userId) return e.next()

  var oldStatus = e.record.original().getString('Status')
  var newStatus = e.record.getString('Status')

  if (oldStatus === newStatus) return e.next()
  if (
    newStatus !== 'FÉRIAS' &&
    newStatus !== 'Férias' &&
    newStatus !== 'Aprovado' &&
    newStatus !== 'Aprovada'
  )
    return e.next()

  var data = e.record.getString('Data')

  try {
    var col = $app.findCollectionByNameOrId('notifications')
    var record = new Record(col)
    record.set('user', userId)
    record.set('title', 'Férias aprovadas')
    record.set('content', 'Suas férias foram aprovadas para ' + data)
    record.set('type', 'vacation_approved')
    record.set('read', false)
    $app.save(record)
  } catch (err) {
    $app.logger().error('failed to create vacation-approval notification', 'err', err.message)
  }

  return e.next()
}, 'escalas')
