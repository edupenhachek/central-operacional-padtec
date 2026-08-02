migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('escalas')
    col.addIndex('idx_escalas_data', false, 'Data', '')
    col.addIndex('idx_escalas_usuario', false, 'Usuario_ID', '')
    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('escalas')
    col.removeIndex('idx_escalas_data')
    col.removeIndex('idx_escalas_usuario')
    app.save(col)
  },
)
