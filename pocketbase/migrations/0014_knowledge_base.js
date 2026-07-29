migrate(
  (app) => {
    if (!app.hasTable('knowledge_base')) {
      var kb = new Collection({
        name: 'knowledge_base',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: '@request.auth.role = "ADMIN" || @request.auth.role = "SUPERADMIN"',
        updateRule: '@request.auth.role = "ADMIN" || @request.auth.role = "SUPERADMIN"',
        deleteRule: '@request.auth.role = "ADMIN" || @request.auth.role = "SUPERADMIN"',
        fields: [
          { name: 'content', type: 'text', required: true },
          {
            name: 'specialty',
            type: 'select',
            values: ['NOC', 'COPE', 'BKO', 'Global'],
            maxSelect: 1,
          },
          { name: 'vector', type: 'vector', dimensions: 1536, distance: 'cosine' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(kb)
    }

    var kbCol = app.findCollectionByNameOrId('knowledge_base')
    var seeds = [
      {
        content:
          'Procedimento NOC: Monitoramento de rede optica em tempo real. Verificar alarmes ativos no sistema de gestao. Em caso de falha, seguir o fluxo de escalonamento: N1 -> N2 -> N3. Registrar todo atendimento no sistema de tickets.',
        specialty: 'NOC',
      },
      {
        content:
          'Procedimento NOC: Comutacao de protecao automatica. Quando detectada perda de sinal, o sistema comuta automaticamente para rota de protecao. Confirmar comutacao via painel e registrar no log operacional.',
        specialty: 'NOC',
      },
      {
        content:
          'Procedimento COPE: Gestao de escalas e turnos. A escala e publicada semanalmente. Trocas de turno devem ser solicitadas com 48h de antecedencia. O focal COPE e responsavel por aprovar todas as alteracoes.',
        specialty: 'COPE',
      },
      {
        content:
          'Procedimento COPE: Fechamento operacional diario. Conferir indicadores de SLA, gerar relatorio de produtividade e enviar ao gestor ate as 10h do dia util seguinte.',
        specialty: 'COPE',
      },
      {
        content:
          'Procedimento BKO: Batimento de caixa e conferencia. Conferir notas fiscais contra o sistema ERP. Divergencias devem ser reportadas ao supervisor imediatamente. O batimento e realizado 3x ao dia: 10h, 14h e 18h.',
        specialty: 'BKO',
      },
      {
        content:
          'Procedimento BKO: Tratamento de faturas. Validar dados do fornecedor, conferir valor e vencimento. Apos validacao, encaminhar para aprovacao no fluxo workflow. Faturas urgentes devem ser sinalizadas com flag vermelha.',
        specialty: 'BKO',
      },
      {
        content:
          'Visao Global: A Central Operacional Padtec integra os times NOC, COPE e BKO. O NOC monitora a rede, o COPE gerencia escalas e indicadores, e o BKO cuida do backoffice financeiro. Todos os times utilizam o sistema Gutenberg para gestao operacional.',
        specialty: 'Global',
      },
      {
        content:
          'Visao Global: Diretrizes de atendimento. Todo chamado deve ser respondido em ate 15 minutos. Prioridades: P1 critico (5 min), P2 alto (15 min), P3 medio (1h), P4 baixo (4h). Escalar para gestor caso SLA esteja proximo do vencimento.',
        specialty: 'Global',
      },
    ]

    for (var i = 0; i < seeds.length; i++) {
      var s = seeds[i]
      try {
        app.findFirstRecordByData('knowledge_base', 'content', s.content)
      } catch (_) {
        var record = new Record(kbCol)
        record.set('content', s.content)
        record.set('specialty', s.specialty)
        app.save(record)
      }
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('knowledge_base'))
    } catch (_) {}
  },
)
