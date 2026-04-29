window.PMRV = window.PMRV || {};

const SIN_ASSIST_STORAGE_KEY = 'pmrv_sinistro_assistente';

const SIN_ASSIST_CROQUI_MODELOS = {
  '1.1': 'transversal',
  '2.3': 'transversal',
  '3.1': 'frontal',
  '3.2': 'traseira',
  '3.3': 'traseira',
  '5.1': 'saida',
  '5.3': 'saida',
  '5.4': 'saida'
};

const SIN_ASSIST_MAX_ENVOLVIDOS = 8;
const SIN_ASSIST_MAX_FOTOS_LOCAL = 4;
const SIN_ASSIST_MAX_FOTOS_ENVOLVIDO = 4;
const SIN_ASSIST_MEDIA = {
  local: [],
  envolvidos: []
};

function sinAssist_nowLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function sinAssist_nowLocalTime() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function sinAssist_createEnvolvidoState(overrides) {
  return {
    tipoVeiculo: 'carro',
    tipoEnvolvido: 'Condutor',
    nome: '',
    contato: '',
    veiculo: '',
    relato: '',
    ...overrides
  };
}

function sinAssist_escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sinAssist_limparMidia() {
  SIN_ASSIST_MEDIA.local = [];
  SIN_ASSIST_MEDIA.envolvidos = [];
}

function sinAssist_mediaEnsureLength(count) {
  while (SIN_ASSIST_MEDIA.envolvidos.length < count) {
    SIN_ASSIST_MEDIA.envolvidos.push([]);
  }
  if (SIN_ASSIST_MEDIA.envolvidos.length > count) {
    SIN_ASSIST_MEDIA.envolvidos = SIN_ASSIST_MEDIA.envolvidos.slice(0, count);
  }
}

function sinAssist_readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => resolve(event.target.result);
    reader.onerror = () => reject(reader.error || new Error('Falha ao ler arquivo de imagem.'));
    reader.readAsDataURL(file);
  });
}

async function sinAssist_appendFotos(target, files, maxAllowed) {
  const restante = Math.max(0, maxAllowed - target.length);
  const fila = Array.from(files || []).slice(0, restante);
  if (!fila.length) return false;

  const imagens = await Promise.all(fila.map(sinAssist_readFileAsDataUrl));
  target.push(...imagens);
  return true;
}

function sinAssist_createFotoWrap(src, onRemove) {
  const wrap = document.createElement('div');
  wrap.className = 'foto-wrap';

  const img = document.createElement('img');
  img.src = src;
  img.alt = 'Evidência fotográfica';
  wrap.appendChild(img);

  const del = document.createElement('button');
  del.className = 'foto-del';
  del.innerHTML = '✕';
  del.onclick = event => {
    event.stopPropagation();
    onRemove();
  };
  wrap.appendChild(del);

  return wrap;
}

function sinAssist_renderGridFotos(grid, actions, fotos, onRemove, onOpenGallery) {
  if (!grid || !actions) return;
  grid.innerHTML = '';

  fotos.forEach((src, index) => {
    const wrap = sinAssist_createFotoWrap(src, () => onRemove(index));
    const img = wrap.querySelector('img');
    img.onclick = () => onOpenGallery();
    grid.appendChild(wrap);
  });

  actions.style.display = fotos.length ? 'flex' : 'none';
}

function sinAssist_abrirGaleriaFotos(titulo, fotos) {
  if (!Array.isArray(fotos) || !fotos.length) {
    window.alert('Nenhuma foto para visualizar.');
    return;
  }

  const overlay = document.getElementById('foto-galeria-overlay');
  if (!overlay) return;

  overlay.querySelector('.foto-galeria-titulo').textContent = titulo;
  const grid = overlay.querySelector('.foto-galeria-grid');
  grid.innerHTML = '';

  fotos.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.onclick = () => env_verFoto(src);
    grid.appendChild(img);
  });

  overlay.dataset.nome = titulo;
  overlay.dataset.veiculo = titulo;
  overlay.dataset.qtd = fotos.length;
  overlay._fotos = fotos.slice();
  overlay.classList.add('open');
}

function sinAssist_renderFotosLocal() {
  const grid = document.getElementById('sin_assist_local_grid');
  const actions = document.getElementById('sin_assist_local_actions');
  sinAssist_renderGridFotos(
    grid,
    actions,
    SIN_ASSIST_MEDIA.local,
    index => {
      SIN_ASSIST_MEDIA.local.splice(index, 1);
      sinAssist_renderFotosLocal();
      sinAssist_atualizarPreview();
    },
    () => sinAssist_abrirGaleriaFotos('📍 Fotos do Local', SIN_ASSIST_MEDIA.local)
  );
}

function sinAssist_renderFotosEnvolvidos() {
  document.querySelectorAll('#sin_assist_envolvidos_lista .sin-assist-env-card').forEach(card => {
    const index = Number(card.dataset.index || 0);
    const fotos = SIN_ASSIST_MEDIA.envolvidos[index] || [];
    const grid = card.querySelector('.sin-assist-env-grid');
    const actions = card.querySelector('.sin-assist-env-actions');

    sinAssist_renderGridFotos(
      grid,
      actions,
      fotos,
      fotoIndex => {
        SIN_ASSIST_MEDIA.envolvidos[index].splice(fotoIndex, 1);
        sinAssist_renderFotosEnvolvidos();
        sinAssist_atualizarPreview();
      },
      () => sinAssist_abrirGaleriaFotos(`📸 Evidências — Envolvido ${index + 1}`, fotos)
    );
  });
}

function sinAssist_renderEnvolvidos(items) {
  const lista = document.getElementById('sin_assist_envolvidos_lista');
  if (!lista) return;

  const envolvidos = Array.isArray(items) && items.length
    ? items.map(item => sinAssist_createEnvolvidoState(item))
    : [sinAssist_createEnvolvidoState()];

  sinAssist_mediaEnsureLength(envolvidos.length);

  lista.innerHTML = envolvidos.map((item, index) => `
    <div class="sub-box sin-assist-env-card" data-index="${index}">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:10px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--label);">Envolvido ${index + 1}</div>
        ${envolvidos.length > 1 ? `<button type="button" class="btn btn-sm btn-danger" data-click="sinAssist_removerEnvolvido(${index})">Remover</button>` : ''}
      </div>
      <div class="form-row form-row-2">
        <div class="form-field">
          <label class="field-label">Tipo de veiculo</label>
          <select class="sin-assist-field" data-field="tipoVeiculo">
            <option value="carro" ${item.tipoVeiculo === 'carro' ? 'selected' : ''}>Carro</option>
            <option value="moto" ${item.tipoVeiculo === 'moto' ? 'selected' : ''}>Motocicleta</option>
            <option value="caminhao" ${item.tipoVeiculo === 'caminhao' ? 'selected' : ''}>Caminhao</option>
          </select>
        </div>
        <div class="form-field">
          <label class="field-label">Tipo de envolvido</label>
          <select class="sin-assist-field" data-field="tipoEnvolvido">
            <option value="Condutor" ${item.tipoEnvolvido === 'Condutor' ? 'selected' : ''}>Condutor</option>
            <option value="Passageiro" ${item.tipoEnvolvido === 'Passageiro' ? 'selected' : ''}>Passageiro</option>
            <option value="Pedestre" ${item.tipoEnvolvido === 'Pedestre' ? 'selected' : ''}>Pedestre</option>
            <option value="Testemunha" ${item.tipoEnvolvido === 'Testemunha' ? 'selected' : ''}>Testemunha</option>
          </select>
        </div>
      </div>
      <div class="form-row form-row-2">
        <div class="form-field">
          <label class="field-label">Nome</label>
          <input type="text" class="sin-assist-field" data-field="nome" value="${sinAssist_escapeHtml(item.nome)}" placeholder="Nome do envolvido ${index + 1}">
        </div>
        <div class="form-field">
          <label class="field-label">Contato</label>
          <input type="tel" class="sin-assist-field" data-field="contato" value="${sinAssist_escapeHtml(item.contato)}" placeholder="(00) 00000-0000">
        </div>
      </div>
      <div class="form-field">
        <label class="field-label">Veiculo</label>
        <input type="text" class="sin-assist-field" data-field="veiculo" value="${sinAssist_escapeHtml(item.veiculo)}" placeholder="Marca / modelo / placa">
      </div>
      <div class="form-field">
        <label class="field-label">Relato resumido</label>
        <textarea class="sin-assist-field" data-field="relato" rows="2" placeholder="Versao resumida do envolvido ${index + 1}">${sinAssist_escapeHtml(item.relato)}</textarea>
      </div>
      <div class="form-field">
        <label class="field-label">Evidência fotográfica do envolvido/veículo</label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:4px;">
          <label class="foto-label" style="flex-direction:column;padding:12px 6px;font-size:12px;">
            <span style="font-size:20px;margin-bottom:3px;">📷</span>Tirar Foto
            <input type="file" accept="image/*" capture="environment" multiple style="display:none;" data-change="sinAssist_addFotosEnvolvido(this)">
          </label>
          <label class="foto-label" style="flex-direction:column;padding:12px 6px;font-size:12px;">
            <span style="font-size:20px;margin-bottom:3px;">🖼️</span>Anexar Imagem
            <input type="file" accept="image/*" multiple style="display:none;" data-change="sinAssist_addFotosEnvolvido(this)">
          </label>
        </div>
        <div class="foto-grid sin-assist-env-grid"></div>
        <div class="sin-assist-env-actions" style="display:none;gap:6px;flex-wrap:wrap;margin-top:8px;">
          <button type="button" class="btn btn-sm btn-whats" data-click="sinAssist_compartilharFotosEnvolvido(${index})">📲 Visualizar Fotos</button>
          <button type="button" class="btn btn-sm btn-danger" data-click="sinAssist_limparFotosEnvolvido(${index})">🗑 Remover Fotos</button>
        </div>
      </div>
    </div>
  `).join('');

  sinAssist_renderFotosEnvolvidos();
}

function sinAssist_getEnvolvidos() {
  return Array.from(document.querySelectorAll('#sin_assist_envolvidos_lista .sin-assist-env-card')).map(card =>
    sinAssist_createEnvolvidoState({
      tipoVeiculo: card.querySelector('[data-field="tipoVeiculo"]')?.value || 'carro',
      tipoEnvolvido: card.querySelector('[data-field="tipoEnvolvido"]')?.value || 'Condutor',
      nome: card.querySelector('[data-field="nome"]')?.value.trim() || '',
      contato: card.querySelector('[data-field="contato"]')?.value.trim() || '',
      veiculo: card.querySelector('[data-field="veiculo"]')?.value.trim() || '',
      relato: card.querySelector('[data-field="relato"]')?.value.trim() || ''
    })
  );
}

function sinAssist_adicionarEnvolvido() {
  const envolvidos = sinAssist_getEnvolvidos();
  if (envolvidos.length >= SIN_ASSIST_MAX_ENVOLVIDOS) {
    window.alert(`Limite de ${SIN_ASSIST_MAX_ENVOLVIDOS} envolvidos atingido neste assistente.`);
    return;
  }

  envolvidos.push(sinAssist_createEnvolvidoState());
  SIN_ASSIST_MEDIA.envolvidos.push([]);
  sinAssist_renderEnvolvidos(envolvidos);
  sinAssist_atualizarPreview();
}

function sinAssist_removerEnvolvido(index) {
  const envolvidos = sinAssist_getEnvolvidos();
  if (envolvidos.length <= 1) return;

  envolvidos.splice(index, 1);
  SIN_ASSIST_MEDIA.envolvidos.splice(index, 1);
  sinAssist_renderEnvolvidos(envolvidos);
  sinAssist_atualizarPreview();
}

async function sinAssist_addFotosLocal(input) {
  if (!input?.files?.length) return;
  await sinAssist_appendFotos(SIN_ASSIST_MEDIA.local, input.files, SIN_ASSIST_MAX_FOTOS_LOCAL);
  input.value = '';
  sinAssist_renderFotosLocal();
  sinAssist_atualizarPreview();
}

function sinAssist_limparFotosLocal() {
  SIN_ASSIST_MEDIA.local = [];
  sinAssist_renderFotosLocal();
  sinAssist_atualizarPreview();
}

function sinAssist_compartilharFotosLocal() {
  sinAssist_abrirGaleriaFotos('📍 Fotos do Local', SIN_ASSIST_MEDIA.local);
}

async function sinAssist_addFotosEnvolvido(input) {
  const card = input?.closest('.sin-assist-env-card');
  if (!card || !input.files?.length) return;
  const index = Number(card.dataset.index || 0);
  sinAssist_mediaEnsureLength(index + 1);
  await sinAssist_appendFotos(SIN_ASSIST_MEDIA.envolvidos[index], input.files, SIN_ASSIST_MAX_FOTOS_ENVOLVIDO);
  input.value = '';
  sinAssist_renderFotosEnvolvidos();
  sinAssist_atualizarPreview();
}

function sinAssist_limparFotosEnvolvido(index) {
  sinAssist_mediaEnsureLength(index + 1);
  SIN_ASSIST_MEDIA.envolvidos[index] = [];
  sinAssist_renderFotosEnvolvidos();
  sinAssist_atualizarPreview();
}

function sinAssist_compartilharFotosEnvolvido(index) {
  sinAssist_mediaEnsureLength(index + 1);
  sinAssist_abrirGaleriaFotos(`📸 Evidências — Envolvido ${index + 1}`, SIN_ASSIST_MEDIA.envolvidos[index]);
}

function sinAssist_getState() {
  const subtipoSelect = document.getElementById('sin_assist_subtipo');
  const subtipoLabel = subtipoSelect ? subtipoSelect.options[subtipoSelect.selectedIndex]?.text || '' : '';

  return {
    sade: document.getElementById('sin_assist_sade')?.value.trim() || '',
    vtr: document.getElementById('sin_assist_vtr')?.value.trim() || '',
    data: document.getElementById('sin_assist_data')?.value || '',
    hora: document.getElementById('sin_assist_hora')?.value || '',
    rodovia: document.getElementById('sin_assist_rodovia')?.value.trim() || '',
    km: document.getElementById('sin_assist_km')?.value.trim() || '',
    cidade: document.getElementById('sin_assist_cidade')?.value.trim() || '',
    ocorrencia: document.getElementById('sin_assist_ocorrencia')?.value || '',
    subtipo: document.getElementById('sin_assist_subtipo')?.value || '3.1',
    subtipoLabel,
    sentido: document.getElementById('sin_assist_sentido')?.value || 'Centro–Bairro',
    sentidoManual: document.getElementById('sin_assist_sentido_manual')?.value.trim() || '',
    conhecimento: document.getElementById('sin_assist_conhecimento')?.value || 'pela Central',
    vitimas: {
      leve: Number(document.getElementById('sin_assist_vitimas_leve')?.value || 0),
      grave: Number(document.getElementById('sin_assist_vitimas_grave')?.value || 0),
      gravissima: Number(document.getElementById('sin_assist_vitimas_gravissima')?.value || 0)
    },
    dinamica: document.getElementById('sin_assist_dinamica')?.value.trim() || '',
    envolvidos: sinAssist_getEnvolvidos(),
    evidencias: {
      fotosLocal: !!document.getElementById('sin_assist_ev_fotos_local')?.checked,
      fotosDanos: !!document.getElementById('sin_assist_ev_fotos_danos')?.checked,
      croqui: !!document.getElementById('sin_assist_ev_croqui')?.checked,
      testemunha: !!document.getElementById('sin_assist_ev_testemunha')?.checked
    }
  };
}

function sinAssist_descreverEnvolvidoEvidencia(item, index) {
  const tipo = String(item?.tipoEnvolvido || 'Envolvido').trim() || 'Envolvido';
  const nome = String(item?.nome || '').trim();
  const veiculo = String(item?.veiculo || '').trim();

  let label = `${tipo} ${index + 1}`;
  if (nome) label += ` (${nome})`;
  if (veiculo) label += ` - ${veiculo}`;
  return label;
}

function sinAssist_obterRastreabilidadeEvidencias(state) {
  const safeState = state || {};
  const envolvidos = Array.isArray(safeState.envolvidos) ? safeState.envolvidos : [];
  const linhas = [];
  const fotosLocal = SIN_ASSIST_MEDIA.local.length;
  const fotosEnvolvidos = SIN_ASSIST_MEDIA.envolvidos.reduce((total, fotos) => total + fotos.length, 0);

  if (fotosLocal) {
    linhas.push(`Fotos do local: ${fotosLocal} arquivo${fotosLocal > 1 ? 's' : ''} anexado${fotosLocal > 1 ? 's' : ''} nesta sessão`);
  } else if (safeState.evidencias?.fotosLocal) {
    linhas.push('Fotos do local: checklist marcado, sem miniaturas carregadas nesta sessão');
  }

  envolvidos.forEach((item, index) => {
    const qtdFotos = SIN_ASSIST_MEDIA.envolvidos[index]?.length || 0;
    if (!qtdFotos) return;
    linhas.push(`${sinAssist_descreverEnvolvidoEvidencia(item, index)}: ${qtdFotos} foto${qtdFotos > 1 ? 's' : ''} vinculada${qtdFotos > 1 ? 's' : ''}`);
  });

  if (!fotosEnvolvidos && safeState.evidencias?.fotosDanos) {
    linhas.push('Danos/veículos: checklist fotográfico marcado, sem miniaturas carregadas nesta sessão');
  }

  if (safeState.evidencias?.croqui) {
    linhas.push('Croqui técnico: indicado como coletado ou validado');
  }

  if (safeState.evidencias?.testemunha) {
    linhas.push('Testemunha: coleta indicada no checklist probatório');
  }

  return {
    fotosLocal,
    fotosEnvolvidos,
    linhas
  };
}

function sinAssist_mapearVeiculosParaDanos(state) {
  const safeState = state || {};
  const envolvidos = Array.isArray(safeState.envolvidos) ? safeState.envolvidos : [];

  return envolvidos
    .map((item, index) => ({
      tipo: item?.tipoVeiculo || 'carro',
      rotulo: sinAssist_descreverEnvolvidoEvidencia(item, index),
      nome: String(item?.nome || '').trim(),
      veiculo: String(item?.veiculo || '').trim(),
      fotos: SIN_ASSIST_MEDIA.envolvidos[index]?.length || 0,
      ordem: index + 1
    }))
    .filter(item => item.veiculo);
}

function sinAssist_setState(state) {
  const safe = state || {};
  document.getElementById('sin_assist_sade').value = safe.sade || '';
  document.getElementById('sin_assist_vtr').value = safe.vtr || '';
  document.getElementById('sin_assist_data').value = safe.data || sinAssist_nowLocalDate();
  document.getElementById('sin_assist_hora').value = safe.hora || sinAssist_nowLocalTime();
  document.getElementById('sin_assist_rodovia').value = safe.rodovia || '';
  document.getElementById('sin_assist_km').value = safe.km || '';
  document.getElementById('sin_assist_cidade').value = safe.cidade || '';
  document.getElementById('sin_assist_ocorrencia').value = safe.ocorrencia || 'Sinistro de trânsito com danos materiais';
  document.getElementById('sin_assist_subtipo').value = safe.subtipo || '3.1';
  document.getElementById('sin_assist_sentido').value = safe.sentido || 'Centro–Bairro';
  document.getElementById('sin_assist_sentido_manual').value = safe.sentidoManual || '';
  document.getElementById('sin_assist_conhecimento').value = safe.conhecimento || 'pela Central';
  document.getElementById('sin_assist_vitimas_leve').value = safe.vitimas?.leve ?? 0;
  document.getElementById('sin_assist_vitimas_grave').value = safe.vitimas?.grave ?? 0;
  document.getElementById('sin_assist_vitimas_gravissima').value = safe.vitimas?.gravissima ?? 0;
  document.getElementById('sin_assist_dinamica').value = safe.dinamica || '';
  sinAssist_renderEnvolvidos(safe.envolvidos);
  sinAssist_renderFotosLocal();

  document.getElementById('sin_assist_ev_fotos_local').checked = !!safe.evidencias?.fotosLocal;
  document.getElementById('sin_assist_ev_fotos_danos').checked = !!safe.evidencias?.fotosDanos;
  document.getElementById('sin_assist_ev_croqui').checked = !!safe.evidencias?.croqui;
  document.getElementById('sin_assist_ev_testemunha').checked = !!safe.evidencias?.testemunha;

  sinAssist_toggleSentidoManual();
  sinAssist_toggleVitimas();
}

function sinAssist_toggleSentidoManual() {
  const field = document.getElementById('sin_assist_sentido_manual');
  const shouldShow = document.getElementById('sin_assist_sentido')?.value === 'MANUAL';
  field?.classList.toggle('hidden', !shouldShow);
}

function sinAssist_toggleVitimas() {
  const box = document.getElementById('sin_assist_vitimas_box');
  const ocorrencia = document.getElementById('sin_assist_ocorrencia')?.value || '';
  const show = ocorrencia !== 'Sinistro de trânsito com danos materiais';
  box?.classList.toggle('hidden', !show);
}

function sinAssist_detectarCroquiModelo(subtipo) {
  return SIN_ASSIST_CROQUI_MODELOS[subtipo] || '';
}

function sinAssist_buildPreviewText(state) {
  const envolvidos = state.envolvidos.filter(item => item.nome || item.veiculo || item.relato);
  const veiculos = state.envolvidos.filter(item => item.veiculo);
  const modeloCroqui = sinAssist_detectarCroquiModelo(state.subtipo);
  const fotosLocal = SIN_ASSIST_MEDIA.local.length;
  const fotosEnvolvidos = SIN_ASSIST_MEDIA.envolvidos.reduce((total, fotos) => total + fotos.length, 0);
  const pendencias = [];

  if (!state.dinamica) pendencias.push('descrever a dinamica-base');
  if (!state.evidencias.fotosLocal && !fotosLocal) pendencias.push('coletar fotos do local');
  if (!state.evidencias.fotosDanos && !fotosEnvolvidos) pendencias.push('coletar fotos dos danos');
  if (!state.evidencias.croqui) pendencias.push('validar ou completar o croqui');
  if (!envolvidos.length) pendencias.push('identificar pelo menos um envolvido');

  let text = '*ASSISTENTE DE SINISTRO ORIENTADO POR EVIDENCIA*\n';
  text += `Natureza: ${state.ocorrencia || 'N/I'}\n`;
  text += `Classificacao: ${state.subtipoLabel || state.subtipo}\n`;
  text += `Local-base: ${(state.rodovia || '---')}${state.km ? `, km ${state.km}` : ''}${state.cidade ? ` - ${state.cidade}` : ''}\n`;
  text += `Envolvidos mapeados: ${envolvidos.length}\n`;
  text += `Veiculos para danos: ${Math.min(veiculos.length, 5)}${veiculos.length > 5 ? ' (limitado aos 5 primeiros)' : ''}\n`;
  text += `Fotos do local: ${fotosLocal}\n`;
  text += `Fotos vinculadas a envolvidos: ${fotosEnvolvidos}\n`;
  text += `Modelo inicial de croqui: ${modeloCroqui || 'manual'}\n`;
  text += `Relatorio PMRV: ${state.dinamica ? 'pronto para pre-preenchimento' : 'dependente da dinamica-base'}\n`;

  if (pendencias.length) {
    text += '\nPendencias imediatas:\n';
    pendencias.forEach(item => { text += `- ${item}\n`; });
  } else {
    text += '\nPendencias imediatas:\n- nenhuma pendencia critica detectada no pre-cadastro\n';
  }

  text += '\nAplique aos modulos para distribuir os dados iniciais e depois refine danos e croqui nos fluxos especializados.';
  return text.trim();
}

function sinAssist_salvarLocal(state) {
  localStorage.setItem(SIN_ASSIST_STORAGE_KEY, JSON.stringify(state));
}

function sinAssist_restaurarLocal() {
  try {
    const raw = localStorage.getItem(SIN_ASSIST_STORAGE_KEY);
    if (!raw) return false;
    sinAssist_setState(JSON.parse(raw));
    return true;
  } catch (error) {
    console.warn('[SinAssist] Falha ao restaurar estado salvo.', error);
    return false;
  }
}

function sinAssist_atualizarPreview() {
  if (SIN_ASSIST_MEDIA.local.length) {
    const checkbox = document.getElementById('sin_assist_ev_fotos_local');
    if (checkbox) checkbox.checked = true;
  }
  if (SIN_ASSIST_MEDIA.envolvidos.some(fotos => fotos.length)) {
    const checkbox = document.getElementById('sin_assist_ev_fotos_danos');
    if (checkbox) checkbox.checked = true;
  }

  const state = sinAssist_getState();
  sinAssist_salvarLocal(state);
  const preview = document.getElementById('sin-assist-preview');
  if (preview) preview.textContent = sinAssist_buildPreviewText(state);
}

function sinAssist_applyPmrv(state) {
  const setValue = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.value = value;
  };

  setValue('pmrv_sade', state.sade);
  setValue('pmrv_vtr', state.vtr);
  setValue('pmrv_cidade', state.cidade || 'Florianópolis/SC');
  setValue('pmrv_km', state.km);
  setValue('pmrv_conhecimento', state.conhecimento);
  setValue('pmrv_ocorrencia', state.ocorrencia);
  setValue('pmrv_subtipo', state.subtipo);
  setValue('pmrv_dinamica_texto', state.dinamica);
  setValue('pmrv_qtd_leve', state.vitimas.leve);
  setValue('pmrv_qtd_grave', state.vitimas.grave);
  setValue('pmrv_qtd_gravissima', state.vitimas.gravissima);

  const rodoviaSelect = document.getElementById('pmrv_rodovia');
  if (rodoviaSelect) {
    const normalized = String(state.rodovia || '').trim().toUpperCase();
    const match = Array.from(rodoviaSelect.options).find(option => option.value.toUpperCase() === normalized);
    if (match) rodoviaSelect.value = match.value;
  }

  const sentidoSelect = document.getElementById('pmrv_sentido');
  const sentidoManual = document.getElementById('pmrv_sentido_manual');
  if (sentidoSelect) {
    const match = Array.from(sentidoSelect.options).find(option => option.value === state.sentido);
    if (match && state.sentido !== 'MANUAL') {
      sentidoSelect.value = state.sentido;
      if (sentidoManual) sentidoManual.value = '';
    } else {
      sentidoSelect.value = 'MANUAL';
      if (sentidoManual) sentidoManual.value = state.sentidoManual || state.sentido || '';
    }
  }

  const horaAuto = document.getElementById('pmrv_hora_auto');
  const horaManual = document.getElementById('pmrv_hora_manual');
  const inputHora = document.getElementById('pmrv_input_hora');
  if (state.hora && horaManual && horaAuto && inputHora) {
    horaManual.checked = true;
    horaAuto.checked = false;
    inputHora.value = state.hora;
  }

  if (typeof pmrv_verificarRodovia === 'function') pmrv_verificarRodovia();
  if (typeof pmrv_verificarVitimas === 'function') pmrv_verificarVitimas();
  if (typeof pmrv_toggleSentidoManual === 'function') pmrv_toggleSentidoManual();
  if (typeof pmrv_mudarSubtipo === 'function') pmrv_mudarSubtipo();
  if (typeof pmrv_atualizar === 'function') pmrv_atualizar();
}

function sinAssist_applyEnvolvidos(state) {
  const lista = document.getElementById('env_lista');
  if (!lista || typeof env_adicionar !== 'function') return;

  lista.innerHTML = '';
  const registros = state.envolvidos.filter(item => item.nome || item.veiculo || item.relato || item.contato);
  const itens = registros.length ? registros : [{ tipoEnvolvido: 'Condutor', nome: '', contato: '', veiculo: '', relato: '', tipoVeiculo: 'carro' }];

  itens.forEach((item, index) => {
    env_adicionar();
    const card = lista.lastElementChild;
    if (!card) return;

    const tipo = card.querySelector('.tipo');
    const nome = card.querySelector('.nome');
    const contato = card.querySelector('.contato');
    const marca = card.querySelector('.marca');
    const relato = card.querySelector('.relato');

    if (tipo) tipo.value = item.tipoEnvolvido || 'Condutor';
    if (nome) nome.value = item.nome || '';
    if (contato) contato.value = item.contato || '';
    if (marca) marca.value = item.veiculo || '';
    if (relato) relato.value = item.relato || '';

    const fotos = SIN_ASSIST_MEDIA.envolvidos[index] || [];
    const fotoGrid = card.querySelector('.foto-grid');
    const fotoActions = card.querySelector('.foto-actions');
    if (fotoGrid && fotoActions && fotos.length) {
      fotoGrid.innerHTML = '';
      fotos.forEach(src => {
        const wrap = document.createElement('div');
        wrap.className = 'foto-wrap';
        const img = document.createElement('img');
        img.src = src;
        img.onclick = () => env_abrirGaleria(card);
        const del = document.createElement('button');
        del.className = 'foto-del';
        del.innerHTML = '✕';
        del.onclick = ev => {
          ev.stopPropagation();
          wrap.remove();
          if (!fotoGrid.querySelectorAll('.foto-wrap').length) fotoActions.style.display = 'none';
        };
        wrap.appendChild(img);
        wrap.appendChild(del);
        fotoGrid.appendChild(wrap);
      });
      fotoActions.style.display = 'flex';
    }
  });
}

function sinAssist_applyDanos(state) {
  if (typeof window.danAplicarAssistenteSinistro !== 'function') return;

  const veiculos = sinAssist_mapearVeiculosParaDanos(state).slice(0, 5);

  if (!veiculos.length) return;
  window.danAplicarAssistenteSinistro(veiculos);
}

async function sinAssist_applyCroqui(state) {
  if (typeof window.croqui_aplicarModeloAssistente !== 'function') return;
  const modelo = sinAssist_detectarCroquiModelo(state.subtipo);
  if (!modelo) return;

  const local = [state.rodovia, state.km ? `km ${state.km}` : '', state.cidade].filter(Boolean).join(' - ');
  const titulo = [state.subtipoLabel || 'SINISTRO', local].filter(Boolean).join(' | ');
  const veiculos = sinAssist_mapearVeiculosParaDanos(state).slice(0, 5).map(item => item.rotulo);
  await window.croqui_aplicarModeloAssistente(modelo, titulo, {
    subtipo: state.subtipo,
    subtipoLabel: state.subtipoLabel,
    local,
    envolvidos: veiculos
  });
}

function sinAssist_applyFotosLocalRelatorio() {
  const grid = document.getElementById('rel-local-grid');
  const actions = document.getElementById('rel-local-actions');
  if (!grid || !actions) return;

  grid.innerHTML = '';
  SIN_ASSIST_MEDIA.local.forEach(src => {
    const wrap = document.createElement('div');
    wrap.className = 'foto-wrap';
    const img = document.createElement('img');
    img.src = src;
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
  });

  actions.style.display = SIN_ASSIST_MEDIA.local.length ? 'flex' : 'none';
}

async function sinAssist_aplicarTudo() {
  const state = sinAssist_getState();
  sinAssist_salvarLocal(state);
  sinAssist_applyPmrv(state);
  sinAssist_applyEnvolvidos(state);
  sinAssist_applyDanos(state);
  await sinAssist_applyCroqui(state);
  sinAssist_applyFotosLocalRelatorio();

  if (typeof window.relFull_atualizarResumo === 'function') {
    window.relFull_atualizarResumo();
  }

  sinAssist_atualizarPreview();
  window.alert('Dados iniciais aplicados aos modulos de PMRV, envolvidos, danos e croqui.');
}

function sinAssist_limpar() {
  localStorage.removeItem(SIN_ASSIST_STORAGE_KEY);
  localStorage.removeItem('pmrv_danos_estado');
  localStorage.removeItem('pmrv_croqui_canvas');
  localStorage.removeItem('pmrv_croqui_assistente');
  sinAssist_limparMidia();
  sinAssist_setState({
    data: sinAssist_nowLocalDate(),
    hora: sinAssist_nowLocalTime(),
    ocorrencia: 'Sinistro de trânsito com danos materiais',
    subtipo: '3.1',
    sentido: 'Centro–Bairro',
    conhecimento: 'pela Central',
    vitimas: { leve: 0, grave: 0, gravissima: 0 },
    envolvidos: [sinAssist_createEnvolvidoState(), sinAssist_createEnvolvidoState()],
    evidencias: { fotosLocal: false, fotosDanos: false, croqui: false, testemunha: false }
  });
  sinAssist_renderFotosLocal();
  sinAssist_atualizarPreview();
}

function sinAssist_init() {
  const form = document.getElementById('sin-assist-form');
  if (!form || form.dataset.bound === 'true') return;
  form.dataset.bound = 'true';

  form.addEventListener('input', sinAssist_atualizarPreview);
  form.addEventListener('change', event => {
    if (event.target.id === 'sin_assist_ocorrencia') sinAssist_toggleVitimas();
    if (event.target.id === 'sin_assist_sentido') sinAssist_toggleSentidoManual();
    sinAssist_atualizarPreview();
  });

  if (!sinAssist_restaurarLocal()) {
    sinAssist_limpar();
    return;
  }

  sinAssist_toggleVitimas();
  sinAssist_toggleSentidoManual();
  sinAssist_renderFotosLocal();
  sinAssist_renderFotosEnvolvidos();
  sinAssist_atualizarPreview();
}

// Registro no Core
if (typeof window.registerModule === 'function') {
  window.registerModule('sinistro-assistente', {
    onEnter: sinAssist_init
  });
}

window.sinAssist_init = sinAssist_init;
window.sinAssist_adicionarEnvolvido = sinAssist_adicionarEnvolvido;
window.sinAssist_removerEnvolvido = sinAssist_removerEnvolvido;
window.sinAssist_addFotosLocal = sinAssist_addFotosLocal;
window.sinAssist_limparFotosLocal = sinAssist_limparFotosLocal;
window.sinAssist_compartilharFotosLocal = sinAssist_compartilharFotosLocal;
window.sinAssist_addFotosEnvolvido = sinAssist_addFotosEnvolvido;
window.sinAssist_limparFotosEnvolvido = sinAssist_limparFotosEnvolvido;
window.sinAssist_compartilharFotosEnvolvido = sinAssist_compartilharFotosEnvolvido;
window.sinAssist_obterRastreabilidadeEvidencias = sinAssist_obterRastreabilidadeEvidencias;
window.sinAssist_atualizarPreview = sinAssist_atualizarPreview;
window.sinAssist_aplicarTudo = sinAssist_aplicarTudo;
window.sinAssist_limpar = sinAssist_limpar;

document.addEventListener('DOMContentLoaded', sinAssist_init);
