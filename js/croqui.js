/**
 * Modulo: Croqui Dinamico de Sinistros
 * Motor de desenho tecnico para pericia rodoviaria
 */

let CROQUI_SELECTED = null;
let CROQUI_SVG = null;
let CROQUI_DRAGGING = false;
let CROQUI_DRAG_OFFSET_X = 0;
let CROQUI_DRAG_OFFSET_Y = 0;
let CROQUI_ASSIST_META = null;
const CROQUI_CANVAS_STORAGE_KEY = 'pmrv_croqui_canvas';
const CROQUI_META_STORAGE_KEY = 'pmrv_croqui_assistente';

const CROQUI_DEFAULT_TRANSFORM = {
  x: 150,
  y: 150,
  rotate: 0,
  scaleX: 1,
  scaleY: 1
};

const CROQUI_MODELO_LABELS = {
  frontal: 'Colisao frontal',
  traseira: 'Colisao traseira',
  transversal: 'Abalroamento transversal',
  saida: 'Saida de pista'
};

const CROQUI_ICON_MAP = {
  v1: { emoji: '🚗', label: 'V1', fontSize: 40 },
  v2: { emoji: '🚘', label: 'V2', fontSize: 40 },
  moto: { emoji: '🏍️', label: 'MOTO', fontSize: 38 },
  caminhao: { emoji: '🚚', label: 'CAMINHAO', fontSize: 40 },
  carreta: { emoji: '🚛', label: 'CARRETA', fontSize: 44 },
  onibus: { emoji: '🚌', label: 'ONIBUS', fontSize: 40 },
  bicicleta: { emoji: '🚲', label: 'BIKE', fontSize: 36 },
  viatura: { emoji: '🚓', label: 'PMRV', fontSize: 40 },
  ambulancia: { emoji: '🚑', label: 'SAMU', fontSize: 40 },
  reboque: { emoji: '🛻', label: 'REBOQUE', fontSize: 38 },
  cone: { emoji: '⚠️', label: 'CONE', fontSize: 28 },
  pare: { emoji: '🛑', label: 'PARE', fontSize: 34 },
  preferencial: { emoji: '🔻', label: 'PREF.', fontSize: 34 },
  semaforo: { emoji: '🚦', label: 'SEMAFORO', fontSize: 34 },
  sem_verde: { emoji: '🟢', label: 'SEM. VERDE', fontSize: 28 },
  sem_vermelho: { emoji: '🔴', label: 'SEM. VERM.', fontSize: 28 },
  arvore: { emoji: '🌳', label: 'ARVORE', fontSize: 34 },
  poste: { emoji: '💡', label: 'POSTE', fontSize: 28 },
  norte: { emoji: '🧭', label: 'NORTE', fontSize: 34 },
  buraco: { emoji: '🕳️', label: 'DEFEITO', fontSize: 30 },
  animal_via: { emoji: '🐄', label: 'ANIMAL', fontSize: 36 },
  pedestre: { emoji: '🚶', label: 'PEDESTRE', fontSize: 34 },
  idoso: { emoji: '👨‍🦳', label: 'IDOSO', fontSize: 30 },
  crianca: { emoji: '🧒', label: 'CRIANCA', fontSize: 30 },
  cadeirante: { emoji: '👨‍🦽', label: 'PCD', fontSize: 30 },
  oleo: { emoji: '🛢️', label: 'OLEO', fontSize: 30 },
  vtr_emergencia: { emoji: '🚨', label: 'EMERG.', fontSize: 30 },
  frenagem: { emoji: '⬛', label: 'FRENAGEM', fontSize: 18, asRect: true }
};

function croqui_getLayer(id) {
  return document.getElementById(id);
}

function croqui_composeTransform({ x, y, rotate, scaleX, scaleY }) {
  return `translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${rotate.toFixed(2)}) scale(${scaleX.toFixed(2)}, ${scaleY.toFixed(2)})`;
}

function croqui_parseTransform(element) {
  const transform = element?.getAttribute('transform') || '';
  const translateMatch = /translate\(([-\d.]+)[ ,]+([-\d.]+)\)/.exec(transform);
  const rotateMatch = /rotate\(([-\d.]+)\)/.exec(transform);
  const scaleMatch = /scale\(([-\d.]+)(?:[ ,]+([-\d.]+))?\)/.exec(transform);

  const scaleX = scaleMatch ? parseFloat(scaleMatch[1]) : CROQUI_DEFAULT_TRANSFORM.scaleX;
  const scaleY = scaleMatch && scaleMatch[2] ? parseFloat(scaleMatch[2]) : scaleX;

  return {
    x: translateMatch ? parseFloat(translateMatch[1]) : CROQUI_DEFAULT_TRANSFORM.x,
    y: translateMatch ? parseFloat(translateMatch[2]) : CROQUI_DEFAULT_TRANSFORM.y,
    rotate: rotateMatch ? parseFloat(rotateMatch[1]) : CROQUI_DEFAULT_TRANSFORM.rotate,
    scaleX,
    scaleY
  };
}

function croqui_applyTransform(element, patch) {
  const current = croqui_parseTransform(element);
  const next = { ...current, ...patch };
  element.setAttribute('transform', croqui_composeTransform(next));
}

function croqui_createGroup(idPrefix, type, transform) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  element.setAttribute('id', `${idPrefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
  element.setAttribute('data-type', type);
  element.setAttribute('transform', croqui_composeTransform(transform));
  element.style.cursor = 'move';
  return element;
}

function croqui_persistirMetaAssistente() {
  try {
    if (!CROQUI_ASSIST_META) {
      localStorage.removeItem(CROQUI_META_STORAGE_KEY);
      return;
    }
    localStorage.setItem(CROQUI_META_STORAGE_KEY, JSON.stringify(CROQUI_ASSIST_META));
  } catch (error) {
    console.warn('[Croqui] Falha ao persistir metadados do assistente.', error);
  }
}

function croqui_restaurarMetaAssistente() {
  try {
    const raw = localStorage.getItem(CROQUI_META_STORAGE_KEY);
    if (!raw) return false;
    const meta = JSON.parse(raw);
    CROQUI_ASSIST_META = meta && typeof meta === 'object' ? meta : null;
    return !!CROQUI_ASSIST_META;
  } catch (error) {
    console.warn('[Croqui] Falha ao restaurar metadados do assistente.', error);
    localStorage.removeItem(CROQUI_META_STORAGE_KEY);
    CROQUI_ASSIST_META = null;
    return false;
  }
}

function croqui_serializarLayer(layer) {
  if (!layer) return '';
  const clone = layer.cloneNode(true);
  clone.querySelectorAll('.selected').forEach(node => node.classList.remove('selected'));
  return clone.innerHTML;
}

function croqui_persistirCanvas() {
  try {
    const vias = croqui_getLayer('croqui-vias');
    const objetos = croqui_getLayer('croqui-objetos');
    const payload = {
      vias: croqui_serializarLayer(vias),
      objetos: croqui_serializarLayer(objetos)
    };

    if (!payload.vias && !payload.objetos) {
      localStorage.removeItem(CROQUI_CANVAS_STORAGE_KEY);
      return;
    }

    localStorage.setItem(CROQUI_CANVAS_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('[Croqui] Falha ao persistir canvas.', error);
  }
}

function croqui_restaurarCanvas() {
  try {
    const raw = localStorage.getItem(CROQUI_CANVAS_STORAGE_KEY);
    if (!raw) return false;

    const state = JSON.parse(raw);
    const vias = croqui_getLayer('croqui-vias');
    const objetos = croqui_getLayer('croqui-objetos');
    if (!vias || !objetos) return false;

    vias.innerHTML = String(state?.vias || '');
    objetos.innerHTML = String(state?.objetos || '');
    croqui_clearSelection();
    return !!(vias.innerHTML || objetos.innerHTML);
  } catch (error) {
    console.warn('[Croqui] Falha ao restaurar canvas.', error);
    localStorage.removeItem(CROQUI_CANVAS_STORAGE_KEY);
    return false;
  }
}

function croqui_init() {
  CROQUI_SVG = document.getElementById('croqui-svg');
  if (!CROQUI_SVG || CROQUI_SVG.dataset.bound === 'true') return;

  CROQUI_SVG.dataset.bound = 'true';
  CROQUI_SVG.addEventListener('mousedown', croqui_onStart);
  CROQUI_SVG.addEventListener('mousemove', croqui_onMove);
  CROQUI_SVG.addEventListener('mouseup', croqui_onEnd);
  CROQUI_SVG.addEventListener('mouseleave', croqui_onEnd);

  CROQUI_SVG.addEventListener('touchstart', croqui_onStart, { passive: false });
  CROQUI_SVG.addEventListener('touchmove', croqui_onMove, { passive: false });
  CROQUI_SVG.addEventListener('touchend', croqui_onEnd, { passive: false });
  CROQUI_SVG.addEventListener('touchcancel', croqui_onEnd, { passive: false });
  
  croqui_restaurarCanvas();
  croqui_restaurarMetaAssistente();
}

// Registro no Core
if (typeof window.registerModule === 'function') {
  window.registerModule('croqui', {
    onEnter: croqui_init
  });
}

function croqui_buildCurvaMarkup(tipo) {
  const curvas = {
    'curva': { d: 'M 0 220 Q 0 0 220 0', x: 100, y: 100 },
    'curva-aberta-esquerda': { d: 'M 0 220 Q 25 25 220 0', x: 100, y: 100 },
    'curva-aberta-direita': { d: 'M 220 220 Q 195 25 0 0', x: 100, y: 100 },
    'curva-acentuada-esquerda': { d: 'M 0 220 Q -30 -40 220 0', x: 100, y: 100 },
    'curva-acentuada-direita': { d: 'M 220 220 Q 250 -40 0 0', x: 100, y: 100 }
  };

  return curvas[tipo] || null;
}

function croqui_buildViaRetaMarkup(config = {}) {
  const width = config.width || 300;
  const laneCount = config.laneCount || 2;
  const laneHeight = config.laneHeight || 50;
  const shoulder = config.shoulder || 5;
  const roadHeight = laneCount * laneHeight;
  const centerY = roadHeight / 2;
  const lines = [
    `<rect width="${width}" height="${roadHeight}" fill="#333" rx="4" />`,
    `<line x1="0" y1="${shoulder}" x2="${width}" y2="${shoulder}" stroke="white" stroke-width="2" />`,
    `<line x1="0" y1="${roadHeight - shoulder}" x2="${width}" y2="${roadHeight - shoulder}" stroke="white" stroke-width="2" />`
  ];

  if (laneCount % 2 === 0) {
    lines.push(`<line x1="0" y1="${centerY}" x2="${width}" y2="${centerY}" stroke="yellow" stroke-width="2" stroke-dasharray="10,10" />`);
  } else {
    lines.push(`<line x1="0" y1="${centerY}" x2="${width}" y2="${centerY}" stroke="white" stroke-width="2" />`);
  }

  for (let index = 1; index < laneCount; index += 1) {
    const y = index * laneHeight;
    if (Math.abs(y - centerY) < 0.1) continue;
    lines.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="white" stroke-width="1.5" stroke-dasharray="10,10" opacity="0.9" />`);
  }

  if (config.bridge) {
    lines.push(`<rect x="-10" y="-8" width="${width + 20}" height="8" fill="#9ca3af" rx="3" />`);
    lines.push(`<rect x="-10" y="${roadHeight}" width="${width + 20}" height="8" fill="#9ca3af" rx="3" />`);
    lines.push(`<line x1="8" y1="-4" x2="${width - 8}" y2="-4" stroke="#e5e7eb" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.8" />`);
    lines.push(`<line x1="8" y1="${roadHeight + 4}" x2="${width - 8}" y2="${roadHeight + 4}" stroke="#e5e7eb" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.8" />`);
  }

  return {
    x: config.x ?? 50,
    y: config.y ?? 150,
    markup: lines.join('\n')
  };
}

function croqui_adicionarVia(tipo) {
  const layer = croqui_getLayer('croqui-vias');
  if (!layer) return null;

  let element = null;

  if (tipo === 'reta') {
    const via = croqui_buildViaRetaMarkup({ laneCount: 2, width: 300, laneHeight: 50, shoulder: 5, x: 50, y: 150 });
    element = croqui_createGroup('via', 'via', { x: via.x, y: via.y, rotate: 0, scaleX: 1, scaleY: 1 });
    element.innerHTML = via.markup;
  } else if (tipo === 'pista-2-faixas') {
    const via = croqui_buildViaRetaMarkup({ laneCount: 2, width: 320, laneHeight: 46, shoulder: 5, x: 45, y: 150 });
    element = croqui_createGroup('via', 'via', { x: via.x, y: via.y, rotate: 0, scaleX: 1, scaleY: 1 });
    element.innerHTML = via.markup;
  } else if (tipo === 'pista-3-faixas') {
    const via = croqui_buildViaRetaMarkup({ laneCount: 3, width: 320, laneHeight: 34, shoulder: 5, x: 45, y: 135 });
    element = croqui_createGroup('via', 'via', { x: via.x, y: via.y, rotate: 0, scaleX: 1, scaleY: 1 });
    element.innerHTML = via.markup;
  } else if (tipo === 'ponte-4-faixas') {
    const via = croqui_buildViaRetaMarkup({ laneCount: 4, width: 340, laneHeight: 26, shoulder: 6, bridge: true, x: 35, y: 130 });
    element = croqui_createGroup('via', 'via', { x: via.x, y: via.y, rotate: 0, scaleX: 1, scaleY: 1 });
    element.innerHTML = via.markup;
  } else if (tipo === 'curva' || tipo.startsWith('curva-')) {
    const curva = croqui_buildCurvaMarkup(tipo);
    if (!curva) return null;
    element = croqui_createGroup('via', 'via', { x: curva.x, y: curva.y, rotate: 0, scaleX: 1, scaleY: 1 });
    element.innerHTML = `
      <path d="${curva.d}" fill="none" stroke="#333" stroke-width="100" stroke-linecap="round" stroke-linejoin="round" />
      <path d="${curva.d}" fill="none" stroke="yellow" stroke-width="2" stroke-dasharray="10,10" stroke-linecap="round" stroke-linejoin="round" />
    `;
  } else if (tipo === 'cruzamento') {
    element = croqui_createGroup('via', 'via', { x: 100, y: 100, rotate: 0, scaleX: 1, scaleY: 1 });
    element.innerHTML = `
      <rect x="80" y="0" width="100" height="260" fill="#333" />
      <rect x="0" y="80" width="260" height="100" fill="#333" />
      <line x1="130" y1="0" x2="130" y2="260" stroke="yellow" stroke-width="2" stroke-dasharray="10,10" />
      <line x1="0" y1="130" x2="260" y2="130" stroke="yellow" stroke-width="2" stroke-dasharray="10,10" />
    `;
  }

  if (!element) return null;
  layer.appendChild(element);
  croqui_selecionar(element);
  croqui_persistirCanvas();
  croqui_fecharModal(); // Fecha o modal após adicionar
  return element;
}

function croqui_abrirModalIcones() {
  const modal = document.getElementById('croqui-modal-icones');
  if (!modal) return;
  modal.classList.remove('hidden');
  croqui_filtrarIcones('veiculo'); // Força inicialização na categoria veiculos
}

function croqui_fecharModal() {
  document.getElementById('croqui-modal-icones')?.classList.add('hidden');
}

function croqui_fecharModalOnBackdrop(event) {
  if (event.target.id === 'croqui-modal-icones') croqui_fecharModal();
}

function croqui_filtrarIcones(category) {
  console.log('[Croqui] Filtrando categoria:', category);
  
  const items = document.querySelectorAll('.croqui-icon-item');
  console.log('[Croqui] Total de itens encontrados:', items.length);

  items.forEach(item => {
    const hasCategory = item.classList.contains(category);
    item.classList.toggle('hidden', !hasCategory);
  });

  document.querySelectorAll('.croqui-icon-tabs .btn').forEach(btn => {
    const clickAttr = btn.getAttribute('data-click') || '';
    const isActive = clickAttr.includes(`'${category}'`) || clickAttr.includes(`"${category}"`);
    btn.classList.toggle('btn-primary', isActive);
  });
}

function croqui_buildIconContent(config) {
  if (config.asRect) {
    return '<rect x="-18" y="0" width="36" height="6" fill="#555" rx="2" />';
  }

  return `<text y="10" font-size="${config.fontSize}" text-anchor="middle">${config.emoji}</text>`;
}

function croqui_inserirIcone(tipo) {
  const layer = croqui_getLayer('croqui-objetos');
  if (!layer) return null;

  const config = CROQUI_ICON_MAP[tipo];
  if (!config) {
    console.warn(`[Croqui] Icone nao mapeado: ${tipo}`);
    alert(`Icone indisponivel: ${tipo}`);
    return null;
  }

  const element = croqui_createGroup('obj', 'objeto', { ...CROQUI_DEFAULT_TRANSFORM });
  element.innerHTML = `
    <g class="icon-body">
      ${croqui_buildIconContent(config)}
    </g>
    <text y="-25" font-size="10" font-weight="bold" fill="rgba(255,255,255,0.8)" text-anchor="middle" class="icon-label">${config.label}</text>
  `;

  layer.appendChild(element);
  croqui_fecharModal();
  croqui_selecionar(element);
  croqui_persistirCanvas();
  return element;
}

function croqui_inserirTextoTitulo() {
  croqui_saveHistory();
  const layer = croqui_getLayer('croqui-objetos');
  if (!layer) return null;

  const texto = window.prompt('Digite o titulo do croqui:', 'TITULO DO CROQUI');
  if (!texto) return null;

  const valor = texto.trim();
  if (!valor) return null;

  const element = croqui_createGroup('txt', 'texto', { x: 210, y: 35, rotate: 0, scaleX: 1, scaleY: 1 });
  element.setAttribute('data-texto', valor);
  element.innerHTML = `
    <text
      y="0"
      text-anchor="middle"
      font-size="18"
      font-weight="800"
      letter-spacing="0.8"
      fill="#ffffff"
      paint-order="stroke"
      stroke="rgba(0,0,0,0.55)"
      stroke-width="2"
      class="croqui-texto-titulo">${valor}</text>
  `;

  layer.appendChild(element);
  croqui_selecionar(element);
  croqui_persistirCanvas();
  return element;
}

function croqui_inserirTextoLivre(valor) {
  const layer = croqui_getLayer('croqui-objetos');
  const texto = String(valor || '').trim();
  if (!layer || !texto) return null;

  const element = croqui_createGroup('txt', 'texto', { x: 210, y: 35, rotate: 0, scaleX: 1, scaleY: 1 });
  element.setAttribute('data-texto', texto);
  element.innerHTML = `
    <text
      y="0"
      text-anchor="middle"
      font-size="18"
      font-weight="800"
      letter-spacing="0.8"
      fill="#ffffff"
      paint-order="stroke"
      stroke="rgba(0,0,0,0.55)"
      stroke-width="2"
      class="croqui-texto-titulo">${texto}</text>
  `;

  layer.appendChild(element);
  croqui_selecionar(element);
  croqui_persistirCanvas();
  return element;
}

function croqui_editarTextoSelecionado() {
  if (!CROQUI_SELECTED || CROQUI_SELECTED.getAttribute('data-type') !== 'texto') {
    alert('Selecione um texto do croqui para editar.');
    return;
  }

  const atual = CROQUI_SELECTED.getAttribute('data-texto') || '';
  const novoTexto = window.prompt('Editar texto do croqui:', atual);
  if (novoTexto === null) return;

  const valor = novoTexto.trim();
  if (!valor) {
    alert('O texto nao pode ficar vazio.');
    return;
  }

  const textNode = CROQUI_SELECTED.querySelector('.croqui-texto-titulo');
  if (!textNode) return;

  CROQUI_SELECTED.setAttribute('data-texto', valor);
  textNode.textContent = valor;
  croqui_persistirCanvas();
}

async function croqui_loadSvgMarkup(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Falha ao carregar ${path}: HTTP ${response.status}`);
  }

  const svgText = await response.text();
  if (!svgText.includes('<svg')) {
    throw new Error(`Arquivo SVG invalido: ${path}`);
  }

  return svgText.replace(/<svg[^>]*>/i, '').replace(/<\/svg>/i, '').trim();
}

async function croqui_inserirSvg(filename, fromRoot = false) {
  const layer = croqui_getLayer('croqui-objetos');
  if (!layer) return null;

  const element = croqui_createGroup('svg', 'objeto', { ...CROQUI_DEFAULT_TRANSFORM });
  const path = fromRoot ? filename : `img/sinistros/${filename}`;

  try {
    const markup = await croqui_loadSvgMarkup(path);
    element.innerHTML = `
      <g class="icon-body" transform="translate(-18, -18) scale(1.6, 1.6)" style="filter: invert(1); transform-origin: center;">
        ${markup}
      </g>
    `;
    layer.appendChild(element);
    croqui_fecharModal();
    croqui_selecionar(element);
    croqui_persistirCanvas();
    return element;
  } catch (err) {
    console.error('[Croqui] Erro ao inserir SVG.', err);
    alert(`Nao foi possivel carregar o SVG: ${filename}`);
    return null;
  }
}

async function croqui_inserirPistaSvg(filename) {
  const layer = croqui_getLayer('croqui-vias');
  if (!layer) return null;

  const element = croqui_createGroup('pista', 'via', { x: 210, y: 160, rotate: 0, scaleX: 0.5, scaleY: 0.5 });

  try {
    const markup = await croqui_loadSvgMarkup(filename);
    element.innerHTML = `
      <g class="pista-body" style="filter: brightness(0.8); transform-origin: center;">
        ${markup}
      </g>
    `;
    layer.appendChild(element);
    croqui_fecharModal();
    croqui_selecionar(element);
    croqui_persistirCanvas();
    return element;
  } catch (err) {
    console.error('[Croqui] Erro ao inserir pista SVG.', err);
    alert(`Nao foi possivel carregar a pista: ${filename}`);
    return null;
  }
}

function croqui_selecionar(element) {
  if (CROQUI_SELECTED) {
    CROQUI_SELECTED.classList.remove('selected');
  }

  CROQUI_SELECTED = element;
  if (CROQUI_SELECTED) {
    CROQUI_SELECTED.classList.add('selected');
  }
}

function croqui_clearSelection() {
  if (CROQUI_SELECTED) {
    CROQUI_SELECTED.classList.remove('selected');
  }
  CROQUI_SELECTED = null;
}

function croqui_getCoords(event) {
  if (!CROQUI_SVG) return { x: 0, y: 0 };

  const ctm = CROQUI_SVG.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };

  const point = event.touches ? event.touches[0] : event;
  return {
    x: (point.clientX - ctm.e) / ctm.a,
    y: (point.clientY - ctm.f) / ctm.d
  };
}

function croqui_onStart(event) {
  if (event.cancelable) {
    event.preventDefault();
  }

  const target = event.target.closest('g[id]');
  if (!target) {
    croqui_clearSelection();
    return;
  }

  croqui_selecionar(target);
  CROQUI_DRAGGING = true;

  const coords = croqui_getCoords(event);
  const transform = croqui_parseTransform(target);
  CROQUI_DRAG_OFFSET_X = coords.x - transform.x;
  CROQUI_DRAG_OFFSET_Y = coords.y - transform.y;
}

function croqui_onMove(event) {
  if (!CROQUI_DRAGGING || !CROQUI_SELECTED) return;
  event.preventDefault();

  const coords = croqui_getCoords(event);
  croqui_applyTransform(CROQUI_SELECTED, {
    x: coords.x - CROQUI_DRAG_OFFSET_X,
    y: coords.y - CROQUI_DRAG_OFFSET_Y
  });
}

function croqui_onEnd() {
  if (CROQUI_DRAGGING) croqui_persistirCanvas();
  CROQUI_DRAGGING = false;
}

function croqui_girar() {
  if (!CROQUI_SELECTED) return;
  const transform = croqui_parseTransform(CROQUI_SELECTED);
  croqui_applyTransform(CROQUI_SELECTED, { rotate: (transform.rotate + 15) % 360 });
  croqui_persistirCanvas();
}

function croqui_escala(delta) {
  if (!CROQUI_SELECTED) return;
  const transform = croqui_parseTransform(CROQUI_SELECTED);
  croqui_applyTransform(CROQUI_SELECTED, {
    scaleX: Math.max(0.2, transform.scaleX + delta),
    scaleY: Math.max(0.2, transform.scaleY + delta)
  });
  croqui_persistirCanvas();
}

function croqui_espelhar() {
  if (!CROQUI_SELECTED) return;
  const transform = croqui_parseTransform(CROQUI_SELECTED);
  croqui_applyTransform(CROQUI_SELECTED, { scaleX: transform.scaleX * -1 });
  croqui_persistirCanvas();
}

function croqui_camada(dir) {
  if (!CROQUI_SELECTED || !CROQUI_SELECTED.parentNode) return;

  const parent = CROQUI_SELECTED.parentNode;
  if (dir === 'frente') {
    const next = CROQUI_SELECTED.nextElementSibling;
    if (next) {
      parent.insertBefore(next, CROQUI_SELECTED);
    }
  } else if (dir === 'tras') {
    const previous = CROQUI_SELECTED.previousElementSibling;
    if (previous) {
      parent.insertBefore(CROQUI_SELECTED, previous);
    }
  }
  croqui_persistirCanvas();
}

function croqui_limpar() {
  if (!confirm('Deseja limpar todo o croqui?')) return;
  croqui_getLayer('croqui-vias').innerHTML = '';
  croqui_getLayer('croqui-objetos').innerHTML = '';
  CROQUI_ASSIST_META = null;
  croqui_clearSelection();
  croqui_persistirCanvas();
  croqui_persistirMetaAssistente();
}

async function croqui_exportar() {
  if (!CROQUI_SVG) return;

  const svgData = new XMLSerializer().serializeToString(CROQUI_SVG);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const image = new Image();

  canvas.width = CROQUI_SVG.clientWidth * 2;
  canvas.height = CROQUI_SVG.clientHeight * 2;

  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  image.onload = () => {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `Croqui_PMRv_${Date.now()}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  image.onerror = () => {
    URL.revokeObjectURL(url);
    alert('Nao foi possivel exportar o croqui.');
  };

  image.src = url;
}

function croqui_whatsapp() {
  alert("Dica: use 'Salvar PNG' e anexe a imagem no WhatsApp.");
}

function croqui_resetCanvas() {
  croqui_getLayer('croqui-vias').innerHTML = '';
  croqui_getLayer('croqui-objetos').innerHTML = '';
  CROQUI_ASSIST_META = null;
  croqui_clearSelection();
  croqui_persistirCanvas();
  croqui_persistirMetaAssistente();
}

function croqui_placeSelected(transform) {
  if (!CROQUI_SELECTED) return;
  croqui_applyTransform(CROQUI_SELECTED, transform);
  croqui_persistirCanvas();
}

function croqui_placeElement(element, transform) {
  if (!element) return null;
  croqui_applyTransform(element, transform);
  croqui_persistirCanvas();
  return element;
}

async function croqui_aplicarModelo(tipo, skipConfirm) {
  if (!skipConfirm && !confirm('Isso ira limpar o desenho atual para aplicar o modelo. Continuar?')) return;

  croqui_resetCanvas();

  if (tipo === 'frontal') {
    croqui_adicionarVia('reta');
    const v1 = croqui_inserirIcone('v1');
    croqui_placeElement(v1, { x: 80, y: 185 });
    const v2 = croqui_inserirIcone('v2');
    croqui_placeElement(v2, { x: 220, y: 185, rotate: 180 });
    const impacto = await croqui_inserirSvg('3.1-colisao-frontal.svg');
    croqui_placeElement(impacto, { x: 150, y: 185 });
  } else if (tipo === 'traseira') {
    croqui_adicionarVia('reta');
    const v1 = croqui_inserirIcone('v1');
    croqui_placeElement(v1, { x: 200, y: 185 });
    const v2 = croqui_inserirIcone('v2');
    croqui_placeElement(v2, { x: 100, y: 185 });
    const impacto = await croqui_inserirSvg('3.2-colisao-traseira.svg');
    croqui_placeElement(impacto, { x: 180, y: 185 });
  } else if (tipo === 'transversal') {
    croqui_adicionarVia('cruzamento');
    const v1 = croqui_inserirIcone('v1');
    croqui_placeElement(v1, { x: 130, y: 220, rotate: -90 });
    const v2 = croqui_inserirIcone('v2');
    croqui_placeElement(v2, { x: 220, y: 130, rotate: 180 });
    const impacto = await croqui_inserirSvg('2.3-abalroamento-transversal.svg');
    croqui_placeElement(impacto, { x: 130, y: 130 });
  } else if (tipo === 'saida') {
    croqui_adicionarVia('curva-acentuada-direita');
    const v1 = croqui_inserirIcone('v1');
    croqui_placeElement(v1, { x: 100, y: 100, rotate: 45 });
    const impacto = await croqui_inserirSvg('5.3-saida-pista-capotamento.svg');
    croqui_placeElement(impacto, { x: 120, y: 120 });
  }

  croqui_fecharModal();
}

async function croqui_aplicarModeloAssistente(tipo, titulo) {
  if (!tipo) return;
  await croqui_aplicarModelo(tipo, true);
  if (titulo) croqui_inserirTextoLivre(titulo);
  const meta = arguments.length > 2 ? arguments[2] : null;
  CROQUI_ASSIST_META = {
    modelo: tipo,
    titulo: titulo || '',
    subtipo: meta?.subtipo || '',
    subtipoLabel: meta?.subtipoLabel || '',
    local: meta?.local || '',
    envolvidos: Array.isArray(meta?.envolvidos) ? meta.envolvidos.slice() : []
  };
  croqui_persistirMetaAssistente();
}

function croqui_obterResumoAssistente() {
  if (!CROQUI_ASSIST_META) return { linhas: [] };

  const linhas = [];
  const modelo = CROQUI_MODELO_LABELS[CROQUI_ASSIST_META.modelo] || CROQUI_ASSIST_META.modelo || 'modelo manual';

  linhas.push(`Croqui-base aplicado: ${modelo}`);
  if (CROQUI_ASSIST_META.subtipoLabel) linhas.push(`Classificacao representada: ${CROQUI_ASSIST_META.subtipoLabel}`);
  if (CROQUI_ASSIST_META.local) linhas.push(`Referencia espacial do croqui: ${CROQUI_ASSIST_META.local}`);
  if (CROQUI_ASSIST_META.titulo) linhas.push(`Titulo operacional do desenho: ${CROQUI_ASSIST_META.titulo}`);
  if (CROQUI_ASSIST_META.envolvidos.length) linhas.push(`Envolvidos/veiculos refletidos no modelo: ${CROQUI_ASSIST_META.envolvidos.join(' | ')}`);

  return { linhas };
}

function croqui_removerSelecionado() {
  if (!CROQUI_SELECTED) {
    alert('Selecione um elemento para excluir.');
    return;
  }
  if (!confirm('Deseja excluir o elemento selecionado?')) return;
  CROQUI_SELECTED.remove();
  CROQUI_SELECTED = null;
  croqui_persistirCanvas();
}

function croqui_alternarGrade() {
  const grid = document.getElementById('croqui-grid-rect');
  if (!grid) return;
  const isHidden = grid.style.display === 'none';
  grid.style.display = isHidden ? 'block' : 'none';
}

window.croqui_removerSelecionado = croqui_removerSelecionado;
window.croqui_alternarGrade = croqui_alternarGrade;
window.croqui_init = croqui_init;
window.croqui_adicionarVia = croqui_adicionarVia;
window.croqui_abrirModalIcones = croqui_abrirModalIcones;
window.croqui_fecharModal = croqui_fecharModal;
window.croqui_fecharModalOnBackdrop = croqui_fecharModalOnBackdrop;
window.croqui_filtrarIcones = croqui_filtrarIcones;
window.croqui_inserirIcone = croqui_inserirIcone;
window.croqui_inserirTextoTitulo = croqui_inserirTextoTitulo;
window.croqui_inserirTextoLivre = croqui_inserirTextoLivre;
window.croqui_editarTextoSelecionado = croqui_editarTextoSelecionado;
window.croqui_inserirSvg = croqui_inserirSvg;
window.croqui_inserirPistaSvg = croqui_inserirPistaSvg;
window.croqui_girar = croqui_girar;
window.croqui_escala = croqui_escala;
window.croqui_espelhar = croqui_espelhar;
window.croqui_camada = croqui_camada;
window.croqui_limpar = croqui_limpar;
window.croqui_exportar = croqui_exportar;
window.croqui_whatsapp = croqui_whatsapp;
window.croqui_aplicarModelo = croqui_aplicarModelo;
window.croqui_aplicarModeloAssistente = croqui_aplicarModeloAssistente;
window.croqui_obterResumoAssistente = croqui_obterResumoAssistente;

/**
 * Calcula o Azimute (0-360°) entre dois pontos no croqui.
 * Inovação Vertex: Permite determinar trajetórias de colisão com precisão pericial.
 * @param {number} x1, y1 - Ponto de origem (ex: Ponto de Repouso)
 * @param {number} x2, y2 - Ponto de destino (ex: Ponto de Impacto)
 */
function croqui_calcularAzimute(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  // No SVG, Y cresce para baixo. Invertemos dy para alinhar com o Norte Cartográfico (para cima).
  let angulo = Math.atan2(dx, -dy) * (180 / Math.PI);
  if (angulo < 0) angulo += 360;
  return parseFloat(angulo.toFixed(2));
}

window.croqui_calcularAzimute = croqui_calcularAzimute;

document.addEventListener('DOMContentLoaded', croqui_init);
