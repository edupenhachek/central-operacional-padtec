routerAdd(
  'POST',
  '/backend/v1/gutenberg/ask-stream',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var userId = e.auth && e.auth.id
      if (!userId) return e.unauthorizedError('Autenticacao necessaria')
      if (!body.message || !body.message.trim()) {
        return e.badRequestError('A mensagem e obrigatoria')
      }

      var systemPrompt = ''
      try {
        var settingsRecord = $app.findFirstRecordByFilter('gutenberg_settings', 'id != ""')
        systemPrompt = settingsRecord.getString('system_prompt') || ''
      } catch (_) {}

      var specialties = body.specialties || []
      if (specialties.length === 0) {
        specialties = ['NOC', 'COPE', 'BKO', 'Global']
      }

      var ragContext = ''
      try {
        var embedRes = $ai.embed({ input: body.message })
        var queryVector = embedRes.data[0].embedding
        var specialtyFilters = []
        for (var i = 0; i < specialties.length; i++) {
          specialtyFilters.push('specialty = "' + specialties[i] + '"')
        }
        var filter = specialtyFilters.join(' || ')
        var results = $vectors.search(e, 'knowledge_base', {
          field: 'vector',
          query: queryVector,
          k: 5,
          filter: filter,
        })
        if (results.items && results.items.length > 0) {
          var chunks = []
          for (var j = 0; j < results.items.length; j++) {
            var item = results.items[j]
            var content = item.getString('content')
            var spec = item.getString('specialty')
            chunks.push('[Base: ' + spec + '] ' + content)
          }
          ragContext = chunks.join('\n\n')
        }
      } catch (ragErr) {
        $app.logger().warn('RAG search failed', 'err', ragErr.message)
      }

      var enhancedMessage = body.message
      if (systemPrompt) {
        enhancedMessage =
          '[Instrucoes adicionais do sistema]\n' + systemPrompt + '\n\n' + enhancedMessage
      }
      if (ragContext) {
        enhancedMessage =
          '[Contexto da base de conhecimento]\n' + ragContext + '\n\n' + enhancedMessage
      }

      var conv = $ai.agent('gutenberg-assistant').getOrCreateConversation({
        user_id: userId,
        id: body.conversation_id || null,
      })

      var iter = $ai.agent('gutenberg-assistant').chat({
        user_id: userId,
        conversation_id: conv.id,
        message: enhancedMessage,
        stream: true,
      })

      e.response.header().set('Content-Type', 'text/event-stream')
      e.response.header().set('Cache-Control', 'no-cache')
      e.response.header().set('X-Conversation-Id', conv.id)
      return $response.stream(e, iter)
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { error: 'Servico de IA indisponivel no momento' })
      }
      if (err instanceof SkipAiAgentsError) {
        var status = err.status || 500
        return e.json(status, { error: status >= 500 ? 'Falha na requisicao da IA' : err.message })
      }
      if (err instanceof SkipAiError) {
        var s2 = err.status || 502
        return e.json(s2, { error: 'Indisponibilidade temporaria do modelo de IA' })
      }
      throw err
    }
  },
  $apis.requireAuth(),
)
