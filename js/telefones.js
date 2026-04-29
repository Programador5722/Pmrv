PMRV.telefones = (function() {
  const SECOES = [
    {
      titulo: 'Números de Emergência (Nacional)',
      itens: [
        { nome: 'Polícia Rodoviária Estadual de Santa Catarina', numero: '198', detalhe: 'Ocorrências em rodovias estaduais.' },
        { nome: 'Polícia Militar', numero: '190', detalhe: 'Emergência e crimes em andamento.' },
        { nome: 'SAMU', numero: '192', detalhe: 'Atendimento médico de urgência.' },
        { nome: 'Corpo de Bombeiros', numero: '193', detalhe: 'Incêndios, resgates e desabamentos.' },
        { nome: 'Polícia Rodoviária Federal', numero: '191', detalhe: 'Acidentes em rodovias federais.' },
        { nome: 'Defesa Civil', numero: '199', detalhe: 'Situações de desastre.' },
        { nome: 'Disque Denúncia', numero: '181', detalhe: 'Denúncias anônimas de crimes.' },
        { nome: 'Central de Atendimento à Mulher', numero: '180', detalhe: 'Violência contra a mulher.' },
        { nome: 'Disque Direitos Humanos', numero: '100', detalhe: 'Exploração, maus-tratos e violações de direitos.' },
        { nome: 'Guarda Municipal', numero: '153', detalhe: 'Segurança municipal.' }
      ]
    },
    {
      titulo: 'Nível Estadual – Santa Catarina',
      itens: [
        { nome: 'CELESC', numero: '0800 480 196', detalhe: 'Energia elétrica.', observacao: 'Falta de luz: enviar SMS para 48196 com "sem luz" + nº da unidade consumidora ou CPF.' },
        { nome: 'CASAN', numero: '0800 643 0195', detalhe: 'Água e saneamento.' },
        { nome: 'CIATox/SC', numero: '0800 643 5252', detalhe: 'Orientação 24h sobre intoxicações, produtos químicos e animais peçonhentos.' },
        { nome: 'Monitoramento de Praias', numero: '0800 642 3341', detalhe: 'Animais vivos ou mortos no litoral.', observacao: 'Maus-tratos a animais: registrar Boletim de Ocorrência na Delegacia Virtual.' }
      ]
    },
    {
      titulo: 'Nível Municipal – Florianópolis',
      itens: [
        { nome: 'COMCAP', numero: '3271-6841', detalhe: 'Limpeza de vias públicas.' },
        { nome: 'SMAPDU', numero: '3251-4951', detalhe: 'Terrenos baldios sujos e fiscalização de obras.' },
        { nome: 'FLORAM', numero: '3251-6525', detalhe: 'Poda de árvores, desmatamento, poluição sonora e áreas de preservação.' },
        { nome: 'Floripa Se Liga na Rede', numero: '3251-6327', detalhe: 'Irregularidades no esgotamento sanitário.' },
        { nome: 'SMI', numero: '3232-6599', detalhe: 'Buracos em vias públicas.' },
        { nome: 'DIOPE', numero: '3251-4979', detalhe: 'Lombadas, faixas elevadas, placas e sinalização.' },
        { nome: 'SMTMU', numero: '3251-6939', detalhe: 'Reparo em pontos de ônibus.' },
        { nome: 'COSIP', numero: '3251-6044', detalhe: 'Iluminação pública.' }
      ]
    }
  ];

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function montarTextoCompartilhamento(item, secao) {
    const partes = [
      'Contato útil PMRV-SC',
      secao.titulo,
      `${item.nome}: ${item.numero}`
    ];

    if (item.detalhe) partes.push(item.detalhe);
    if (item.observacao) partes.push(item.observacao);

    return partes.join('\n');
  }

  function compartilhar(secaoIndex, itemIndex) {
    const secao = SECOES[secaoIndex];
    const item = secao?.itens?.[itemIndex];
    if (!secao || !item) return;

    const texto = montarTextoCompartilhamento(item, secao);
    window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank');
  }

  function render() {
    const wrap = document.getElementById('tel_wrap');
    if (!wrap) return;

    wrap.innerHTML = SECOES.map((secao, secaoIndex) => `
      <section class="help-block">
        <h3 class="help-title">${escapeHtml(secao.titulo)}</h3>
        <div style="display:grid; gap:12px;">
          ${secao.itens.map((item, itemIndex) => `
            <article style="border:1px solid var(--border); border-radius:16px; padding:14px; background:rgba(255,255,255,.03);">
              <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start; flex-wrap:wrap;">
                <div style="flex:1; min-width:220px;">
                  <div style="font-size:15px; font-weight:800; color:#fff;">${escapeHtml(item.nome)}</div>
                  <div style="margin-top:4px; font-size:18px; font-weight:900; color:var(--primary);">${escapeHtml(item.numero)}</div>
                  <div style="margin-top:6px; font-size:13px; color:var(--label);">${escapeHtml(item.detalhe || '')}</div>
                  ${item.observacao ? `<div style="margin-top:8px; font-size:12px; color:var(--muted);">${escapeHtml(item.observacao)}</div>` : ''}
                </div>
                <button type="button" class="btn btn-whats" data-click="tel_compartilhar(${secaoIndex}, ${itemIndex})">📲 WhatsApp</button>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `).join('');
  }

  return {
    init: render,
    compartilhar
  };
})();

window.tel_init = PMRV.telefones.init;
window.tel_compartilhar = PMRV.telefones.compartilhar;
