onRecordAfterCreateSuccess((e) => {
  var urgency = e.record.getString('urgency')
  if (urgency !== 'Alta') return e.next()

  var title = e.record.getString('title')

  try {
    var activeUsers = $app.findRecordsByFilter('users', 'Ativo = true', 'name', 0, 0)
    var notifCol = $app.findCollectionByNameOrId('notifications')

    for (var i = 0; i < activeUsers.length; i++) {
      var userId = activeUsers[i].id
      var record = new Record(notifCol)
      record.set('user', userId)
      record.set('title', 'Comunicado de alta urgência')
      record.set('content', title)
      record.set('type', 'announcement_high')
      record.set('read', false)
      $app.save(record)
    }
  } catch (err) {
    $app.logger().error('failed to create high-urgency notifications', 'err', err.message)
  }

  return e.next()
}, 'announcements')
