onRecordAfterCreateSuccess((e) => {
  var text = e.record.getString('content')
  if (!text) return e.next()
  try {
    var res = $ai.embed({ input: text })
    var record = $app.findRecordById('knowledge_base', e.record.id)
    record.set('vector', res.data[0].embedding)
    $app.save(record)
  } catch (err) {
    $app.logger().error('embedding failed for KB record', 'id', e.record.id, 'err', err.message)
  }
  return e.next()
}, 'knowledge_base')
