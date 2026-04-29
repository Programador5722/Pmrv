/**
 * Módulo: Relatório Completo (Consolidação de Todos os Módulos)
 */

function relFull_contarEnvolvidos() {
  return document.querySelectorAll('#env_lista .person-card').length;
}

function relFull_contarDanos() {
  return typeof danVeiculosSalvos !== 'undefined' && Array.isArray(danVeiculosSalvos) ? danVeiculosSalvos.length : 0;
}

function relFull_obterContextoSinistro() {
  const local = document.getElementById('pmrv_local')?.value?.trim() || '';
  const ocorrencia = document.getElementById('pmrv_ocorrencia')?.value?.trim() || '';
  const dinamica = document.getElementById('pmrv_dinamica_texto')?.value?.trim() || '';
  const subtipoSelect = document.getElementById('pmrv_subtipo');
  const subtipo = subtipoSelect ? subtipoSelect.options[subtipoSelect.selectedIndex]?.text?.trim() || '' : '';

  if (!local && !ocorrencia && !dinamica && !subtipo) return '';

  let txt = '\n🧭 *CONTEXTO DO SINISTRO*\n';
  if (ocorrencia) txt += `- Natureza: ${ocorrencia}\n`;
  if (subtipo) txt += `- Classificacao: ${subtipo}\n`;
  if (local) txt += `- Local: ${local}\n`;
  if (dinamica) txt += `- Dinamica-base: ${dinamica}\n`;
  return txt;
}

function relFull_obterPendenciasAssistente() {
  try {
    const raw = localStorage.getItem('pmrv_sinistro_assistente');
    if (!raw) return '';
    const state = JSON.parse(raw);
    const pendencias = [];

    if (!state.evidencias?.fotosLocal) pendencias.push('fotos do local');
    if (!state.evidencias?.fotosDanos) pendencias.push('fotos dos danos');
    if (!state.evidencias?.croqui) pendencias.push('croqui tecnico');
    if (!state.dinamica) pendencias.push('dinamica consolidada');

    if (!pendencias.length) return '';
    return '\n📝 *PENDENCIAS OPERACIONAIS*\n- ' + pendencias.join('\n- ') + '\n';
  } catch (error) {
    console.warn('[Relatorio] Falha ao ler pendencias do assistente.', error);
    return '';
  }
}

function relFull_obterRastreabilidadeEvidencias() {
  try {
    const raw = localStorage.getItem('pmrv_sinistro_assistente');
    if (!raw || typeof window.sinAssist_obterRastreabilidadeEvidencias !== 'function') return '';

    const state = JSON.parse(raw);
    const resumo = window.sinAssist_obterRastreabilidadeEvidencias(state);
    if (!resumo?.linhas?.length) return '';

    return '\n📎 *EVIDENCIAS COLETADAS*\n- ' + resumo.linhas.join('\n- ') + '\n';
  } catch (error) {
    console.warn('[Relatorio] Falha ao montar rastreabilidade das evidencias.', error);
    return '';
  }
}

function relFull_obterVinculoRepresentacaoTecnica() {
  try {
    const linhas = [];
    const danosResumo = typeof window.danObterResumoAssistente === 'function'
      ? window.danObterResumoAssistente()
      : null;
    const croquiResumo = typeof window.croqui_obterResumoAssistente === 'function'
      ? window.croqui_obterResumoAssistente()
      : null;

    if (danosResumo?.linhas?.length) {
      danosResumo.linhas.forEach(linha => linhas.push(`Danos: ${linha}`));
    }

    if (croquiResumo?.linhas?.length) {
      croquiResumo.linhas.forEach(linha => linhas.push(`Croqui: ${linha}`));
    }

    if (!linhas.length) return '';
    return '\n🧩 *VINCULO TECNICO DE REPRESENTACAO*\n- ' + linhas.join('\n- ') + '\n';
  } catch (error) {
    console.warn('[Relatorio] Falha ao montar vinculo tecnico de representacao.', error);
    return '';
  }
}

function relFull_atualizarResumo() {
  const envCount = document.getElementById('rel-count-env');
  const danCount = document.getElementById('rel-count-dan');
  if (envCount) envCount.textContent = relFull_contarEnvolvidos().toLocaleString('pt-BR');
  if (danCount) danCount.textContent = relFull_contarDanos().toLocaleString('pt-BR');
}

// Registro no Core
if (typeof window.registerModule === 'function') {
  window.registerModule('relatorio', {
    onEnter: relFull_atualizarResumo
  });
}

function relFull_escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function relFull_coletarImagens(selector) {
  return Array.from(document.querySelectorAll(selector))
    .map(img => img.getAttribute('src') || '')
    .filter(Boolean);
}

function relFull_coletarGaleriasEnvolvidos() {
  return Array.from(document.querySelectorAll('#env_lista .person-card'))
    .map((card, index) => {
      const imagens = Array.from(card.querySelectorAll('.foto-grid img'))
        .map(img => img.getAttribute('src') || '')
        .filter(Boolean);
      if (!imagens.length) return null;

      const tipo = (card.querySelector('.tipo')?.value || `Envolvido ${index + 1}`).trim();
      const nome = (card.querySelector('.nome')?.value || '').trim();
      const veiculo = (card.querySelector('.marca')?.value || '').trim();
      const titulo = [tipo, nome, veiculo].filter(Boolean).join(' - ');

      return {
        titulo: titulo || `Envolvido ${index + 1}`,
        imagens
      };
    })
    .filter(Boolean);
}

function relFull_obterResumoDanosPacote() {
  if (typeof window.danObterResumoAssistente === 'function') {
    const resumo = window.danObterResumoAssistente();
    if (resumo?.linhas?.length) return resumo.linhas;
  }

  if (typeof danVeiculosSalvos === 'undefined' || !Array.isArray(danVeiculosSalvos) || !danVeiculosSalvos.length) {
    return [];
  }

  return danVeiculosSalvos.map((veiculo, index) => {
    const meta = veiculo.assistenteMeta || null;
    const titulo = meta?.rotulo || `Veiculo ${index + 1} (${veiculo.tipo || 'N/I'})`;
    if (veiculo.tipo === 'moto' && veiculo.v360db) {
      const total = ['frente', 'tras', 'direita', 'esquerda'].reduce((acc, tab) => {
        const itens = Array.isArray(veiculo.v360db[tab]) ? veiculo.v360db[tab] : [];
        return acc + itens.filter(item => item.dano !== null).length;
      }, 0);
      return `${titulo}: ${total} avaria(s) registrada(s)`;
    }

    return `${titulo}: ${Object.keys(veiculo.danos || {}).length} avaria(s) registrada(s)`;
  });
}

function relFull_obterCroquiSvgPacote() {
  const svg = document.getElementById('croqui-svg');
  if (!svg) return '';

  const clone = svg.cloneNode(true);
  clone.querySelectorAll('.selected').forEach(node => node.classList.remove('selected'));
  return new XMLSerializer().serializeToString(clone);
}

function relFull_obterDadosPacoteProbatorio() {
  const agora = new Date();
  const relatorio = document.getElementById('rel-result-text').textContent || relFull_gerarTexto();
  const fotosLocal = relFull_coletarImagens('#rel-local-grid img');
  const galeriasEnvolvidos = relFull_coletarGaleriasEnvolvidos();
  const resumoDanos = relFull_obterResumoDanosPacote();
  const croquiResumo = typeof window.croqui_obterResumoAssistente === 'function'
    ? (window.croqui_obterResumoAssistente()?.linhas || [])
    : [];
  const rastreabilidade = relFull_obterRastreabilidadeEvidencias()
    .replace(/\n📎 \*EVIDENCIAS COLETADAS\*\n?/, '')
    .split('\n')
    .map(linha => linha.replace(/^- /, '').trim())
    .filter(Boolean);
  const pendencias = relFull_obterPendenciasAssistente()
    .replace(/\n📝 \*PENDENCIAS OPERACIONAIS\*\n?/, '')
    .split('\n')
    .map(linha => linha.replace(/^- /, '').trim())
    .filter(Boolean);

  let sinistroState = null;
  try {
    const raw = localStorage.getItem('pmrv_sinistro_assistente');
    sinistroState = raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('[Relatorio] Falha ao ler estado do assistente para o pacote.', error);
  }

  return {
    geradoEmIso: agora.toISOString(),
    geradoEmLocal: agora.toLocaleString('pt-BR'),
    relatorio,
    resumoDanos,
    croquiResumo,
    rastreabilidade,
    pendencias,
    fotosLocal,
    galeriasEnvolvidos,
    croquiSvg: relFull_obterCroquiSvgPacote(),
    sinistroState
  };
}

function relFull_renderGaleriasPacote(secoes) {
  if (!secoes.length) {
    return '<div class="empty">Nenhuma evidência visual disponível nesta sessão.</div>';
  }

  return secoes.map(secao => `
    <section class="gallery-block">
      <h3>${relFull_escapeHtml(secao.titulo)}</h3>
      <div class="gallery-grid">
        ${secao.imagens.map((src, index) => `<figure class="gallery-item"><img src="${src}" alt="${relFull_escapeHtml(secao.titulo)} ${index + 1}"><figcaption>${relFull_escapeHtml(secao.titulo)} ${index + 1}</figcaption></figure>`).join('')}
      </div>
    </section>
  `).join('');
}

function relFull_montarPacoteProbatorioHtml(dados) {
  const secoesGaleria = [];
  if (dados.fotosLocal.length) {
    secoesGaleria.push({ titulo: 'Fotos do Local do Sinistro', imagens: dados.fotosLocal });
  }
  dados.galeriasEnvolvidos.forEach(item => secoesGaleria.push(item));

  const manifest = {
    geradoEmIso: dados.geradoEmIso,
    resumoDanos: dados.resumoDanos,
    croquiResumo: dados.croquiResumo,
    rastreabilidade: dados.rastreabilidade,
    pendencias: dados.pendencias,
    sinistro: dados.sinistroState
  };

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Pacote Probatorio PMRv</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #eef2f7;
      --card: #ffffff;
      --ink: #172033;
      --muted: #5b6475;
      --line: #d7deea;
      --accent: #c56d1f;
      --accent-2: #214f9a;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: linear-gradient(180deg, #f6f8fb 0%, var(--bg) 100%);
      color: var(--ink);
      font: 15px/1.55 "Segoe UI", Tahoma, sans-serif;
    }
    .wrap {
      max-width: 1080px;
      margin: 0 auto;
      padding: 28px 18px 60px;
    }
    .hero, .card {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 18px;
      box-shadow: 0 14px 30px rgba(23, 32, 51, 0.08);
    }
    .hero {
      padding: 22px;
      margin-bottom: 18px;
      border-left: 6px solid var(--accent);
    }
    h1, h2, h3, p { margin: 0; }
    .hero h1 { font-size: 28px; margin-bottom: 6px; }
    .hero p { color: var(--muted); }
    .hero-meta { margin-top: 10px; font-size: 13px; color: var(--muted); }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 14px;
      margin-bottom: 18px;
    }
    .card {
      padding: 18px;
      margin-bottom: 18px;
    }
    .label {
      font-size: 12px;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 8px;
      font-weight: 700;
    }
    .stat {
      font-size: 28px;
      font-weight: 800;
      color: var(--accent-2);
    }
    .list {
      margin: 0;
      padding-left: 18px;
    }
    .list li + li { margin-top: 6px; }
    .pre {
      white-space: pre-wrap;
      font-family: "Consolas", "Courier New", monospace;
      font-size: 13px;
      background: #f7f9fc;
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 16px;
      overflow-wrap: anywhere;
    }
    .gallery-block + .gallery-block { margin-top: 18px; }
    .gallery-block h3 {
      font-size: 16px;
      margin-bottom: 10px;
    }
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
    }
    .gallery-item {
      margin: 0;
      background: #f8fafc;
      border: 1px solid var(--line);
      border-radius: 14px;
      overflow: hidden;
    }
    .gallery-item img {
      display: block;
      width: 100%;
      aspect-ratio: 4 / 3;
      object-fit: cover;
      background: #dde4ef;
    }
    .gallery-item figcaption {
      padding: 8px 10px 10px;
      font-size: 12px;
      color: var(--muted);
    }
    .croqui-box {
      background: #222;
      border-radius: 16px;
      padding: 12px;
      overflow: auto;
    }
    .croqui-box svg {
      width: 100%;
      height: auto;
      display: block;
    }
    details summary {
      cursor: pointer;
      font-weight: 700;
      color: var(--accent-2);
      margin-bottom: 10px;
    }
    .empty {
      color: var(--muted);
      font-style: italic;
    }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <h1>Pacote Probatorio PMRv</h1>
      <p>Consolidacao exportavel do atendimento, com relatorio, vinculos tecnicos, croqui e evidencias presentes na sessao.</p>
      <div class="hero-meta">Gerado em ${relFull_escapeHtml(dados.geradoEmLocal)}</div>
    </section>

    <section class="grid">
      <article class="card">
        <div class="label">Envolvidos com foto</div>
        <div class="stat">${dados.galeriasEnvolvidos.length}</div>
      </article>
      <article class="card">
        <div class="label">Fotos do local</div>
        <div class="stat">${dados.fotosLocal.length}</div>
      </article>
      <article class="card">
        <div class="label">Veiculos com danos</div>
        <div class="stat">${relFull_contarDanos()}</div>
      </article>
    </section>

    <section class="card">
      <div class="label">Relatorio Consolidado</div>
      <div class="pre">${relFull_escapeHtml(dados.relatorio)}</div>
    </section>

    <section class="grid">
      <article class="card">
        <div class="label">Resumo de Danos</div>
        ${dados.resumoDanos.length ? `<ul class="list">${dados.resumoDanos.map(linha => `<li>${relFull_escapeHtml(linha)}</li>`).join('')}</ul>` : '<div class="empty">Nenhum dano consolidado.</div>'}
      </article>
      <article class="card">
        <div class="label">Croqui Tecnico</div>
        ${dados.croquiResumo.length ? `<ul class="list">${dados.croquiResumo.map(linha => `<li>${relFull_escapeHtml(linha)}</li>`).join('')}</ul>` : '<div class="empty">Nenhum metadado tecnico do croqui foi localizado.</div>'}
      </article>
    </section>

    <section class="grid">
      <article class="card">
        <div class="label">Rastreabilidade</div>
        ${dados.rastreabilidade.length ? `<ul class="list">${dados.rastreabilidade.map(linha => `<li>${relFull_escapeHtml(linha)}</li>`).join('')}</ul>` : '<div class="empty">Nenhuma rastreabilidade adicional registrada.</div>'}
      </article>
      <article class="card">
        <div class="label">Pendencias Operacionais</div>
        ${dados.pendencias.length ? `<ul class="list">${dados.pendencias.map(linha => `<li>${relFull_escapeHtml(linha)}</li>`).join('')}</ul>` : '<div class="empty">Sem pendencias operacionais registradas.</div>'}
      </article>
    </section>

    <section class="card">
      <div class="label">Croqui Atual</div>
      ${dados.croquiSvg ? `<div class="croqui-box">${dados.croquiSvg}</div>` : '<div class="empty">Nenhum croqui disponivel nesta sessao.</div>'}
    </section>

    <section class="card">
      <div class="label">Galeria de Evidencias</div>
      ${relFull_renderGaleriasPacote(secoesGaleria)}
    </section>

    <section class="card">
      <div class="label">Manifesto Tecnico</div>
      <details>
        <summary>Exibir dados estruturados do pacote</summary>
        <div class="pre">${relFull_escapeHtml(JSON.stringify(manifest, null, 2))}</div>
      </details>
    </section>
  </main>
</body>
</html>`;
}

function relFull_gerarTexto() {
  relFull_atualizarResumo();
  const data = new Date().toLocaleDateString('pt-BR');
  let txt = '📋 *RELATÓRIO OPERACIONAL CONSOLIDADO — PMRv SC*\n';
  txt += 'Data: ' + data + '\n';
  txt += '━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

  // ── 🚔 PATRULHAMENTO (Lote de Infrações) ───────────────────
  if (typeof PAT_VEICULOS !== 'undefined' && PAT_VEICULOS.length > 0) {
    txt += '\n🚔 *INFRAÇÕES EM LOTE (PATRULHAMENTO)*\n';
    PAT_VEICULOS.forEach((v, i) => {
      txt += `${i+1}. [${v.placa}] - ${v.infracao.nome} (${v.hora})\n`;
    });
    txt += '──────────────────────────\n';
  }

  txt += relFull_obterContextoSinistro();

  // ── 👥 ENVOLVIDOS (Sinistro) ────────────────────────────────
  txt += '\n👥 *ENVOLVIDOS NO SINISTRO*\n';
  const cards = document.querySelectorAll('#env_lista .person-card');
  if (!cards.length) {
    txt += '(nenhum envolvido registrado)\n';
  } else {
    cards.forEach(function(c, i) {
      const nome     = (c.querySelector('.nome')?.value     || '').trim().toUpperCase();
      const marca    = (c.querySelector('.marca')?.value    || '').trim().toUpperCase();
      const relato   = (c.querySelector('.relato')?.value   || '').trim();
      const tipo     = (c.querySelector('.tipo')?.value     || 'ENVOLVIDO').toUpperCase();
      txt += `\n*${tipo} ${i+1}:* ${nome || 'N/I'}\n`;
      if (marca)  txt += `- Veículo: ${marca}\n`;
      if (relato) txt += `- Relato: ${relato}\n`;
    });
  }

  // ── 🚗 DANOS APARENTES ──────────────────────────────────────
  if (typeof danVeiculosSalvos !== 'undefined' && danVeiculosSalvos.length > 0) {
    txt += '\n🚗 *DANOS APARENTES*\n';
    danVeiculosSalvos.forEach(function(v, idx) {
      txt += `\n*V${idx+1} (${v.tipo.toUpperCase()}):* `;
      let danosArr = [];
      if (v.tipo === 'moto' && v.v360db) {
        ['frente', 'tras', 'direita', 'esquerda'].forEach(tab => {
          (v.v360db[tab] || []).forEach(item => {
            if (item.dano !== null) danosArr.push(`${item.nome}:${item.dano}`);
          });
        });
      } else {
        danosArr = Object.entries(v.danos || {}).map(([id, tipo]) => `${id}:${tipo}`);
      }
      txt += danosArr.length ? danosArr.join(', ') : 'Sem avarias registradas.';
      txt += '\n';
    });
  }

  // ── ⚖️ PESOS E DIMENSÕES ────────────────────────────────────
  const pbtVal = document.getElementById('res_pbt_apurado')?.innerText;
  if (pbtVal && pbtVal !== '0 kg') {
    txt += '\n⚖️ *PESOS E DIMENSÕES*\n';
    txt += `- PBT Apurado: ${pbtVal}\n`;
    const alertaDesc = document.getElementById('pes_alerta_desc')?.innerText;
    if (alertaDesc) txt += `- Status: ${alertaDesc.split('\n')[0]}\n`;
  }

  // ── ⏱️ TACÓGRAFO E JORNADA ──────────────────────────────────
  const tacDesc = document.getElementById('tac_desc_res')?.innerText;
  const tacCond = document.getElementById('tac_cond_res')?.innerText;
  if (tacDesc || tacCond) {
    txt += '\n⏱️ *ANÁLISE DE TACÓGRAFO*\n';
    if (tacDesc) txt += `- Descanso: ${tacDesc}\n`;
    if (tacCond) txt += `- Condução: ${tacCond}\n`;
  }

  txt += relFull_obterVinculoRepresentacaoTecnica();
  txt += relFull_obterRastreabilidadeEvidencias();
  txt += relFull_obterPendenciasAssistente();

  txt += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  txt += '_Gerado via App PMRv Operacional_';
  return txt;
}

function relFull_gerar() {
  const sade = document.getElementById('pmrv_sade')?.value?.trim();
  const vtr = document.getElementById('pmrv_vtr')?.value?.trim();
  
  if (!sade || !vtr) {
    if (!confirm('Atenção: Protocolo SADE ou Viatura não preenchidos. Deseja gerar o relatório assim mesmo?')) {
      return;
    }
  }

  const texto = relFull_gerarTexto();
  const resText = document.getElementById('rel-result-text');
  const resArea = document.getElementById('rel-result-area');
  
  if (resText) resText.textContent = texto;
  if (resArea) {
    resArea.style.display = 'block';
    resArea.scrollIntoView({ behavior: 'smooth' });
  }
}

function relFull_fotoMiniatura(input) {
  const grid = document.getElementById('rel-local-grid');
  const actions = document.getElementById('rel-local-actions');
  if (!grid || !input?.files) return;

  const existentes = grid.querySelectorAll('.foto-wrap').length;
  const limiteRestante = Math.max(0, 2 - existentes);
  const arquivos = Array.from(input.files).slice(0, limiteRestante);

  arquivos.forEach(arquivo => {
    const reader = new FileReader();
    reader.onload = event => {
      const wrap = document.createElement('div');
      wrap.className = 'foto-wrap';

      const img = document.createElement('img');
      img.src = event.target.result;
      img.alt = 'Foto do local do sinistro';

      const del = document.createElement('button');
      del.className = 'foto-del';
      del.innerHTML = '✕';
      del.onclick = ev => {
        ev.stopPropagation();
        wrap.remove();
        if (!grid.querySelector('.foto-wrap')) actions.style.display = 'none';
      };

      wrap.appendChild(img);
      wrap.appendChild(del);
      grid.appendChild(wrap);
      actions.style.display = 'flex';
    };
    reader.readAsDataURL(arquivo);
  });

  input.value = '';
}

function relFull_limparFotosLocal() {
  const grid = document.getElementById('rel-local-grid');
  const actions = document.getElementById('rel-local-actions');
  if (grid) grid.innerHTML = '';
  if (actions) actions.style.display = 'none';
}

function relFull_baixar() {
  const texto = document.getElementById('rel-result-text').textContent || relFull_gerarTexto();
  const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `relatorio-pmrv-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function relFull_baixarPacoteProbatorio() {
  const dados = relFull_obterDadosPacoteProbatorio();
  const html = relFull_montarPacoteProbatorioHtml(dados);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pacote-probatorio-pmrv-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function relFull_compartilharFotos() {
  const imagens = Array.from(document.querySelectorAll('#rel-local-grid img'));
  if (!imagens.length) {
    window.alert('Nenhuma foto do local foi adicionada ainda.');
    return;
  }

  const arquivos = imagens.map((img, index) => {
    const arr = img.src.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
    return new File([u8arr], `local-sinistro-${index + 1}.jpg`, { type: mime });
  });

  const texto = 'Fotos do local do sinistro registradas no app PMRv Operacional.';
  if (navigator.canShare && navigator.canShare({ files: arquivos })) {
    navigator.share({
      title: 'Fotos do local do sinistro',
      text: texto,
      files: arquivos
    }).catch(() => {});
    return;
  }

  arquivos.forEach(file => {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

function relFull_copiar(btn) {
  const text = document.getElementById('rel-result-text').textContent;
  window.copiar(text, btn);
}

function relFull_whatsapp() {
  const texto = document.getElementById('rel-result-text').textContent || relFull_gerarTexto();
  window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank');
}

// Funções de fotos mantidas conforme original para compatibilidade
window.relFull_gerar = relFull_gerar;
window.relFull_fotoMiniatura = relFull_fotoMiniatura;
window.relFull_limparFotosLocal = relFull_limparFotosLocal;
window.relFull_baixar = relFull_baixar;
window.relFull_baixarPacoteProbatorio = relFull_baixarPacoteProbatorio;
window.relFull_compartilharFotos = relFull_compartilharFotos;
window.relFull_copiar = relFull_copiar;
window.relFull_whatsapp = relFull_whatsapp;
window.relFull_gerarTexto = relFull_gerarTexto;
window.relFull_atualizarResumo = relFull_atualizarResumo;

document.addEventListener('DOMContentLoaded', relFull_atualizarResumo);
