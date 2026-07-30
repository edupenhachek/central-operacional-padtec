// @deps xlsx@0.18.5
routerAdd(
  'POST',
  '/backend/v1/import-users',
  (e) => {
    var userId = e.auth ? e.auth.id : ''
    if (!userId) {
      return e.unauthorizedError('Sessão expirada. Faça login novamente.')
    }

    var role = e.auth.getString('role') || ''
    var allowedRoles = ['SUPERADMIN', 'ADMIN', 'FOCAL NOC', 'FOCAL COPE', 'FOCAL BKO']
    if (allowedRoles.indexOf(role) === -1) {
      return e.forbiddenError('Você não tem permissão para importar usuários.')
    }

    var uploadedFiles = e.findUploadedFiles('file')
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return e.badRequestError('Nenhum arquivo enviado.')
    }

    var uploadedFile = uploadedFiles[0]
    var fileName = (uploadedFile.name || uploadedFile.Name || '').toLowerCase()
    if (!fileName.endsWith('.xlsx')) {
      return e.badRequestError('Apenas arquivos .xlsx são suportados.')
    }

    var XLSX = require('xlsx')
    var fileBytes = uploadedFile.bytes || uploadedFile.Bytes
    if (!fileBytes) {
      return e.badRequestError('Não foi possível ler o conteúdo do arquivo.')
    }

    var workbook
    try {
      workbook = XLSX.read(fileBytes, { type: 'array' })
    } catch (err) {
      return e.badRequestError('Erro ao ler o arquivo Excel: ' + String(err))
    }

    var sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      return e.badRequestError('Planilha vazia ou inválida.')
    }

    var sheet = workbook.Sheets[sheetName]
    var rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

    if (!rows || rows.length === 0) {
      return e.badRequestError('Nenhuma linha de dados encontrada na planilha.')
    }

    for (var i = 0; i < rows.length; i++) {
      var keys = Object.keys(rows[i])
      for (var j = 0; j < keys.length; j++) {
        var trimmedKey = keys[j].trim()
        if (trimmedKey !== keys[j]) {
          rows[i][trimmedKey] = rows[i][keys[j]]
          delete rows[i][keys[j]]
        }
      }
    }

    function getField(row, names) {
      for (var i = 0; i < names.length; i++) {
        if (row[names[i]] !== undefined && row[names[i]] !== null) {
          return String(row[names[i]]).trim()
        }
      }
      var rowKeys = Object.keys(row)
      for (var j = 0; j < names.length; j++) {
        var lowerTarget = names[j].toLowerCase()
        for (var k = 0; k < rowKeys.length; k++) {
          if (rowKeys[k].toLowerCase() === lowerTarget) {
            return String(row[rowKeys[k]]).trim()
          }
        }
      }
      return ''
    }

    var validRoles = ['USUARIO', 'ADMIN', 'FOCAL BKO', 'FOCAL NOC', 'FOCAL COPE', 'SUPERADMIN']
    var validProjetos = ['NOC', 'BKO', 'COPE', 'OHR', 'Radisys']
    var validHorarios = [
      '06H15 ÁS 15H15',
      '08H00 ÁS 17H00',
      '09H00 ÁS 18H00',
      '10H00 ÁS 19H00',
      '11H00 ÁS 20H00',
      '11H30 ÁS 20H30',
      '13H00 ÁS 22H00',
      '15H00 ÁS 23H43',
      '23H30 ÁS 06H30',
    ]

    function normalizeHorario(value) {
      if (!value) return ''
      var v = value.toUpperCase().replace(/\s+/g, ' ').trim()
      v = v.replace(/ AS /g, ' ÁS ')
      for (var i = 0; i < validHorarios.length; i++) {
        if (v === validHorarios[i].toUpperCase()) return validHorarios[i]
      }
      return ''
    }

    function normalizeRole(value) {
      if (!value) return ''
      var v = value.trim().toUpperCase()
      for (var i = 0; i < validRoles.length; i++) {
        if (v === validRoles[i].toUpperCase()) return validRoles[i]
      }
      return ''
    }

    function normalizeProjeto(value) {
      if (!value) return []
      var parts = value
        .split(',')
        .map(function (p) {
          return p.trim()
        })
        .filter(function (p) {
          return p.length > 0
        })
      for (var i = 0; i < parts.length; i++) {
        for (var j = 0; j < validProjetos.length; j++) {
          if (parts[i].toUpperCase() === validProjetos[j].toUpperCase()) {
            return [validProjetos[j]]
          }
        }
      }
      return []
    }

    var created = 0
    var updated = 0
    var errors = []
    var processedEmails = {}
    var usersCol = $app.findCollectionByNameOrId('users')

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i]
      var rowNum = i + 2

      var name = getField(row, ['USUÁRIO', 'USUARIO', 'Nome', 'Name'])
      var password = getField(row, ['Senha', 'Password'])
      var email = getField(row, [
        'E-MAIL CORPORATIVO',
        'EMAIL CORPORATIVO',
        'E-MAIL',
        'Email',
        'email',
      ])
      var phone = getField(row, ['TELEFONE', 'Telefone', 'Phone'])
      var cargo = getField(row, ['CARGO', 'Cargo'])
      var roleRaw = getField(row, ['FUNÇÃO NO SISTEMA', 'FUNCAO NO SISTEMA', 'Função', 'Role'])
      var projetoRaw = getField(row, ['PROJETO', 'Projeto', 'Project'])
      var escalaRaw = getField(row, ['ESCALA', 'Escala', 'Horário'])

      if (!email) {
        errors.push('Linha ' + rowNum + ': E-mail não informado. Linha ignorada.')
        continue
      }

      if (processedEmails[email.toLowerCase()]) {
        continue
      }

      var mappedRole = normalizeRole(roleRaw)
      var mappedProjetos = normalizeProjeto(projetoRaw)
      var mappedHorario = normalizeHorario(escalaRaw)

      if (roleRaw && !mappedRole) {
        errors.push(
          'Linha ' + rowNum + ' (' + email + '): Função "' + roleRaw + '" não reconhecida.',
        )
      }
      if (projetoRaw && mappedProjetos.length === 0) {
        errors.push(
          'Linha ' + rowNum + ' (' + email + '): Projeto "' + projetoRaw + '" não reconhecido.',
        )
      }
      if (escalaRaw && !mappedHorario) {
        errors.push(
          'Linha ' + rowNum + ' (' + email + '): Escala "' + escalaRaw + '" não reconhecida.',
        )
      }

      var existingUser = null
      try {
        existingUser = $app.findFirstRecordByFilter('users', 'email = {:email}', email)
      } catch (_) {}

      if (existingUser) {
        try {
          if (name) existingUser.set('name', name)
          existingUser.set('phone', phone)
          existingUser.set('cargo', cargo)
          if (mappedRole) existingUser.set('role', mappedRole)
          if (mappedProjetos.length > 0) existingUser.set('projeto', mappedProjetos)
          if (mappedHorario) existingUser.set('horario_trabalho', mappedHorario)
          $app.save(existingUser)
          updated++
          processedEmails[email.toLowerCase()] = true
        } catch (err) {
          errors.push('Linha ' + rowNum + ' (' + email + '): Erro ao atualizar - ' + String(err))
        }
      } else {
        if (!name) {
          errors.push(
            'Linha ' + rowNum + ' (' + email + '): Nome não informado. Usuário não criado.',
          )
          continue
        }
        if (!password) {
          errors.push(
            'Linha ' + rowNum + ' (' + email + '): Senha não informada. Usuário não criado.',
          )
          continue
        }
        if (password.length < 8) {
          errors.push(
            'Linha ' + rowNum + ' (' + email + '): Senha muito curta (mín. 8 caracteres).',
          )
          continue
        }

        try {
          var newRecord = new Record(usersCol)
          newRecord.setEmail(email)
          newRecord.setPassword(password)
          newRecord.setVerified(true)
          newRecord.set('name', name)
          newRecord.set('emailVisibility', true)
          newRecord.set('role', mappedRole || 'USUARIO')
          newRecord.set('Ativo', true)
          newRecord.set('primeiro_acesso', true)
          newRecord.set('phone', phone)
          newRecord.set('cargo', cargo)
          newRecord.set('projeto', mappedProjetos)
          if (mappedHorario) newRecord.set('horario_trabalho', mappedHorario)
          $app.save(newRecord)
          created++
          processedEmails[email.toLowerCase()] = true
        } catch (err) {
          errors.push('Linha ' + rowNum + ' (' + email + '): Erro ao criar - ' + String(err))
        }
      }
    }

    return e.json(200, {
      success: true,
      created: created,
      updated: updated,
      errors: errors,
      total: rows.length,
    })
  },
  $apis.requireAuth(),
)
