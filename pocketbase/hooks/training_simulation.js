routerAdd(
  'POST',
  '/backend/v1/training/simulate',
  (e) => {
    try {
      const body = e.requestInfo().body || {}
      const persona = body.persona || 'Junior'
      const userMessage = body.message || ''
      const history = body.history || []

      let systemPrompt = ''
      if (persona === 'Vinicius' || persona === 'Vinícius') {
        systemPrompt =
          'Você é Vinícius, um cliente/operador do NOC Padtec impaciente e exigente. Você tem urgência crítica, fala em tom ríspido, exige resolução imediata e às vezes fornece evidências incompletas de propósito. Desafie o operador. Responda em Português de forma curta e reativa.'
      } else if (persona === 'Osmar') {
        systemPrompt =
          'Você é Osmar, um técnico de campo experiente, educado e calmo. Você é muito detalhista e colaborativo, fornecendo relatórios e medições corretas quando solicitado. Responda em tom profissional em Português.'
      } else {
        systemPrompt =
          'Você é Junior, um jovem operador do BKO iniciante. Você é muito simpático, entusiasmado, responde rapidamente e aceita todas as orientações com facilidade. Responda de forma leve e colaborativa em Português.'
      }

      const messages = [{ role: 'system', content: systemPrompt }]
      for (const h of history) {
        messages.push({ role: h.role, content: h.content })
      }
      messages.push({ role: 'user', content: userMessage })

      const reply = $ai.chat({
        model: 'fast',
        messages: messages,
      })

      const replyText =
        reply.choices?.[0]?.message?.content ||
        'Certo, entendi o procedimento. Como prossigo agora?'
      return e.json(200, { content: replyText, persona })
    } catch (err) {
      return e.json(500, { error: err.message || 'Erro na simulação' })
    }
  },
  $apis.requireAuth(),
)
