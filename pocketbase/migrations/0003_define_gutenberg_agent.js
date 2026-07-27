migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'gutenberg-assistant',
      name: 'Gutenberg AI',
      description: 'Assistente de Inteligência e Operação do BackOffice Padtec.',
      systemPrompt:
        'Você é o Gutenberg, assistente virtual inteligente da Central Operacional BackOffice da Padtec. Sua função é auxiliar a equipe operacional respondendo a dúvidas técnicas, detalhando procedimentos operacionais, analisando documentos e comunicados internos e guiando novos colaboradores. Responda em Português de forma profissional, direta, amigável e precisa.',
      tier: 'fast',
      tools: [
        { collection: 'documents', perms: { list: true, read: true } },
        { collection: 'announcements', perms: { list: true, read: true } },
        { collection: 'internal_notices', perms: { list: true, read: true } },
      ],
      memory: [
        {
          type: 'text',
          payload: {
            text: 'Procedimento de Batimento de Caixa Padtec: O batimento de caixa deve ser realizado ao final de cada turno via Tela Única do sistema BKO. Todos os comprovantes físicos e digitais devem ser validados antes da homologação final.',
          },
        },
        {
          type: 'text',
          payload: {
            text: 'Níveis de Acesso BKO: NOC (Monitoramento), COPE (Operações Especiais), BKO (BackOffice Geral), ADMIN (Administrador Geral com privilégios de gestão de usuários).',
          },
        },
      ],
    })
  },
  (app) => {
    $ai.agents.delete(app, 'gutenberg-assistant')
  },
)
