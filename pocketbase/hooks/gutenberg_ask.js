routerAdd(
  'POST',
  '/backend/v1/gutenberg/ask-stream',
  (e) => {
    try {
      const body = e.requestInfo().body || {}
      const userId = e.auth?.id
      if (!userId) return e.unauthorizedError('Autenticação necessária')
      if (!body.message || !body.message.trim()) {
        return e.badRequestError('A mensagem é obrigatória')
      }

      const conv = $ai.agent('gutenberg-assistant').getOrCreateConversation({
        user_id: userId,
        id: body.conversation_id || null,
      })

      const iter = $ai.agent('gutenberg-assistant').chat({
        user_id: userId,
        conversation_id: conv.id,
        message: body.message,
        stream: true,
      })

      e.response.header().set('Content-Type', 'text/event-stream')
      e.response.header().set('Cache-Control', 'no-cache')
      e.response.header().set('X-Conversation-Id', conv.id)
      return $response.stream(e, iter)
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { error: 'Serviço de IA indisponível no momento' })
      }
      if (err instanceof SkipAiAgentsError) {
        const status = err.status || 500
        return e.json(status, { error: status >= 500 ? 'Falha na requisição da IA' : err.message })
      }
      if (err instanceof SkipAiError) {
        const status = err.status || 502
        return e.json(status, { error: 'Indisponibilidade temporária do modelo de IA' })
      }
      throw err
    }
  },
  $apis.requireAuth(),
)
