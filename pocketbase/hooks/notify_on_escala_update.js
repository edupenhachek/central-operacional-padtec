onRecordAfterUpdateSuccess((e) => {
  var userId = e.record.getString('Usuario_ID')
  if (!userId) return e.next()

  var oldStatus = e.record.original().getString('Status')
  var newStatus = e.record.getString('Status')

  if (oldStatus === newStatus) return e.next()

  var data = e.record.getString('Data')
  var pad = function (n) {
    return n < 10 ? '0' + n : '' + n
  }
  var formattedDate = data
  if (data) {
    var parts = data.split(' ')[0].split('-')
    if (parts.length === 3) {
      formattedDate = parts[2] + '/' + parts[1] + '/' + parts[0]
    }
  }

  var isVacation =
    newStatus === 'FÉRIAS' ||
    newStatus === 'Férias' ||
    newStatus === 'Aprovado' ||
    newStatus === 'Aprovada'

  if (isVacation) {
    var cutoffDate = new Date(Date.now() - 30 * 60 * 1000)
    var cutoff =
      cutoffDate.getFullYear() +
      '-' +
      pad(cutoffDate.getMonth() + 1) +
      '-' +
      pad(cutoffDate.getDate()) +
      ' ' +
      pad(cutoffDate.getHours()) +
      ':' +
      pad(cutoffDate.getMinutes()) +
      ':' +
      pad(cutoffDate.getSeconds())

    var existing = []
    try {
      existing = $app.findRecordsByFilter(
        'notifications',
        "user = '" + userId + "' && type = 'vacation_approved' && created > '" + cutoff + "'",
        '-created',
        1,
        0,
      )
    } catch (err) {
      $app.logger().error('dedup check failed', 'err', String(err))
    }

    if (existing.length > 0) return e.next()

    try {
      var col = $app.findCollectionByNameOrId('notifications')
      var record = new Record(col)
      record.set('user', userId)
      record.set('title', 'Férias aprovadas')
      record.set('content', 'Suas férias foram aprovadas para ' + formattedDate)
      record.set('type', 'vacation_approved')
      record.set('read', false)
      $app.save(record)
    } catch (err) {
      $app.logger().error('failed to create vacation notification', 'err', String(err))
    }
  } else {
    try {
      var col2 = $app.findCollectionByNameOrId('notifications')
      var record2 = new Record(col2)
      record2.set('user', userId)
      record2.set('title', 'Escala atualizada')
      record2.set(
        'content',
        'Sua escala foi atualizada para ' + formattedDate + ' — Status: ' + newStatus,
      )
      record2.set('type', 'schedule_updated')
      record2.set('read', false)
      $app.save(record2)
    } catch (err) {
      $app.logger().error('failed to create schedule update notification', 'err', String(err))
    }
  }

  return e.next()
}, 'escalas')
