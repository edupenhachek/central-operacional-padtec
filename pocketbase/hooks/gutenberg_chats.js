routerAdd(
  'GET',
  '/backend/v1/gutenberg/chats',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Autenticação necessária')
    const limit = parseInt(e.requestInfo().query?.limit || '20', 10) || 20
    return e.json(
      200,
      $ai.agent('gutenberg-assistant').listConversations({ user_id: userId, limit }),
    )
  },
  $apis.requireAuth(),
)

routerAdd(
  'GET',
  '/backend/v1/gutenberg/chats/{conversationId}/messages',
  (e) => {
    try {
      const userId = e.auth?.id
      if (!userId) return e.unauthorizedError('Autenticação necessária')
      const conversationId = e.request.pathValue('conversationId')
      return e.json(
        200,
        $ai.agent('gutenberg-assistant').listMessages({
          conversation_id: conversationId,
          user_id: userId,
        }),
      )
    } catch (err) {
      if (err instanceof SkipAiAgentsError) {
        const status = err.status || 500
        return e.json(status, { error: status >= 500 ? 'Falha ao buscar histórico' : err.message })
      }
      throw err
    }
  },
  $apis.requireAuth(),
)
