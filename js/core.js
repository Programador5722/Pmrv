/* ---------------------------------------------------------------
   NAMESPACE GLOBAL PMRV - CORE ENGINE
--------------------------------------------------------------- */
window.PMRV = window.PMRV || {};

function core_formatarKM(input) {
  let val = input.value.trim().replace('.', ',');
  if (!val) return;

  if (!val.includes(',')) {
    val += ',000';
  } else {
    const partes = val.split(',');
    partes[1] = (partes[1] + '000').substring(0, 3);
    val = partes[0] + ',' + partes[1];
  }

  input.value = val;
  input.dispatchEvent(new Event('input'));
}

window.core_formatarKM = core_formatarKM;

PMRV.core = (function() {
  const SCREENS = [
    'home', 'assumir', 'sinistro-assistente', 'patrulhamento', 'infracoes', 'envolvidos', 'pmrv', 'danos',
    'relatorio', 'pesos', 'tacografo', 'croqui', 'rodovias-ref', 'docs', 'telefones', 'referencias',
    'guia-ciclomotores', 'guia-estrangeiros', 'prazos-transito', 'prazos-gerais',
    'guia-aet', 'guia-sinistros', 'help', 'ended', 'module-missing', 'calc-cinematica', 'calc-evitabilidade', 'calc-curva'
  ];
  const APP_WIDE_SCREENS = new Set(['infracoes', 'croqui']);
  
  // Registro de ciclo de vida dos módulos
  const MODULE_REGISTRY = {};
  let CURRENT_SCREEN = 'home';

  /**
   * Registra hooks de ciclo de vida para um módulo/tela
   */
  function registerModule(id, hooks) {
    MODULE_REGISTRY[id] = {
      onEnter: hooks.onEnter || null,
      onLeave: hooks.onLeave || null
    };
    console.log(`[PMRV Core] Módulo registrado: ${id}`);
  }

  function getExistingScreen(name) {
    return document.getElementById('screen-' + name) ? name : null;
  }

  function go(name) {
    const requestedTarget = getExistingScreen(name);
    const fallbackTarget = getExistingScreen('module-missing') || 'home';
    const target = requestedTarget || (name === 'home' ? 'home' : fallbackTarget);

    if (!requestedTarget && name !== 'home') {
      const missingModuleName = document.getElementById('missing-module-name');
      if (missingModuleName) missingModuleName.innerText = name;
    }

    // Trigger onLeave do módulo atual
    if (CURRENT_SCREEN && MODULE_REGISTRY[CURRENT_SCREEN]?.onLeave) {
      try {
        MODULE_REGISTRY[CURRENT_SCREEN].onLeave();
      } catch (e) {
        console.error(`[PMRV Core] Erro ao sair do módulo ${CURRENT_SCREEN}:`, e);
      }
    }

    SCREENS.forEach(id => {
      const el = document.getElementById('screen-' + id);
      if (!el) return;

      const isActive = id === target;
      el.classList.toggle('active', isActive);
      if (!isActive) return;

      el.scrollTop = 0;

      setTimeout(() => {
        const heading = el.querySelector('h1, h2, .card-title, .btn');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus();
        }
      }, 250);
    });

    document.querySelectorAll('.nav-item').forEach(btn => {
      const btnId = btn.id.replace('nav-', '');
      btn.classList.toggle('active', btnId === target || (target === 'home' && btnId === 'home'));
    });

    const app = document.querySelector('.app');
    if (app) app.classList.toggle('app-wide', APP_WIDE_SCREENS.has(target));

    const container = document.getElementById('main-container');
    if (container) container.scrollTop = 0;

    // Atualiza estado global da tela atual
    CURRENT_SCREEN = target;

    // Trigger onEnter do novo módulo via Registry
    if (MODULE_REGISTRY[target]?.onEnter) {
      try {
        MODULE_REGISTRY[target].onEnter();
      } catch (e) {
        console.error(`[PMRV Core] Erro ao entrar no módulo ${target}:`, e);
      }
    }

    // Fallbacks para funções legadas (gradualmente migrar para registerModule)
    if (target === 'docs') docs_switchTab('bases');
  }

  function cic_switchTab(tab) {
    const contentRegras = document.getElementById('cic-content-regras');
    const contentDecisao = document.getElementById('cic-content-decisao');
    const tabRegras = document.getElementById('tab-cic-regras');
    const tabDecisao = document.getElementById('tab-cic-decisao');

    if (contentRegras && contentDecisao) {
      contentRegras.classList.toggle('hidden', tab !== 'regras');
      contentDecisao.classList.toggle('hidden', tab !== 'decisao');
      tabRegras?.classList.toggle('btn-primary', tab === 'regras');
      tabDecisao?.classList.toggle('btn-primary', tab === 'decisao');
    }
  }

  function docs_switchTab(tab) {
    const tabs = ['bases', 'ciclomotores', 'estrangeiros', 'aet'];
    tabs.forEach(id => {
      document.getElementById('docs-content-' + id)?.classList.toggle('hidden', id !== tab);
      document.getElementById('tab-docs-' + id)?.classList.toggle('btn-primary', id === tab);
    });

    if (tab === 'ciclomotores') docs_ciclomotoresSwitchTab('');
  }

  function docs_ciclomotoresSwitchTab(tab) {
    const tabs = ['lei', 'fiscalizar', 'como-fazer', 'autuar', 'nao-autuar', 'equipamentos', 'documentos'];
    tabs.forEach(id => {
      document.getElementById('docs-ciclomotores-' + id)?.classList.toggle('hidden', !tab || id !== tab);
      document.getElementById('tab-docs-ciclomotores-' + id)?.classList.toggle('btn-primary', id === tab);
    });
    document.getElementById('docs-ciclomotores-placeholder')?.classList.toggle('hidden', !!tab);
  }

  function sin_zoom(code, title, desc, img) {
    const modal = document.getElementById('sin-zoom-modal');
    const codeEl = document.getElementById('sin-zoom-code');
    const titleEl = document.getElementById('sin-zoom-title');
    const descEl = document.getElementById('sin-zoom-desc');
    const imgEl = document.getElementById('sin-zoom-img');
    if (!modal || !codeEl || !titleEl || !descEl || !imgEl) return;

    codeEl.innerText = code;
    titleEl.innerText = title;
    descEl.innerText = desc;
    imgEl.src = 'img/sinistros/' + img;
    modal.classList.add('show');
  }

  function sin_closeZoom() {
    document.getElementById('sin-zoom-modal')?.classList.remove('show');
  }

  function sin_closeZoomOnBackdrop(event) {
    if (event.target.id === 'sin-zoom-modal') sin_closeZoom();
  }

  async function limparCache() {
    Object.keys(window.localStorage || {})
      .filter(key => key.startsWith('pmrv_'))
      .forEach(key => window.localStorage.removeItem(key));

    Object.keys(window.sessionStorage || {})
      .filter(key => key.startsWith('pmrv_'))
      .forEach(key => window.sessionStorage.removeItem(key));

    if (PMRV.dataManager?.clearCache) {
      await PMRV.dataManager.clearCache();
    }

    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name.startsWith('pmrv-4em1'))
          .map(name => caches.delete(name))
      );
    }
  }

  async function confirmarLimpezaCompleta() {
    const ok = window.confirm('ATENÇÃO: Isso apagará todos os dados salvos e caches offline do app. Deseja continuar?');
    if (!ok) return;

    try {
      await limparCache();
      window.location.reload();
    } catch (err) {
      console.error('[PMRV] Falha ao limpar dados locais.', err);
      window.alert('Não foi possível concluir a limpeza completa dos dados locais.');
    }
  }

  function splitArguments(argsSource) {
    const args = [];
    let current = '';
    let quote = '';

    for (let i = 0; i < argsSource.length; i++) {
      const char = argsSource[i];
      const prev = argsSource[i - 1];

      if ((char === '"' || char === '\'') && prev !== '\\') {
        if (!quote) {
          quote = char;
        } else if (quote === char) {
          quote = '';
        }
        current += char;
        continue;
      }

      if (char === ',' && !quote) {
        args.push(current.trim());
        current = '';
        continue;
      }

      current += char;
    }

    if (current.trim()) args.push(current.trim());
    return args;
  }

  function parseDeclarativeArg(raw, target, event) {
    if (raw === 'this') return target;
    if (raw === 'event') return event;
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    if (raw === 'null') return null;
    if (raw === 'undefined') return undefined;

    if ((raw.startsWith('\'') && raw.endsWith('\'')) || (raw.startsWith('"') && raw.endsWith('"'))) {
      return raw.slice(1, -1).replace(/\\'/g, '\'').replace(/\\"/g, '"');
    }

    if (/^-?\d+(\.\d+)?$/.test(raw)) {
      return Number(raw);
    }

    throw new Error(`Argumento declarativo não suportado: ${raw}`);
  }

  function executeDeclarativeHandler(attr, target, event) {
    const code = target.getAttribute(attr)?.trim();
    if (!code) return;

    const match = code.match(/^([A-Za-z_$][\w$]*)\s*\((.*)\)$/);
    if (!match) {
      throw new Error(`Handler declarativo inválido: ${code}`);
    }

    const fnName = match[1];
    const fn = window[fnName];
    if (typeof fn !== 'function') {
      throw new Error(`Função declarativa não encontrada: ${fnName}`);
    }

    const argsSource = match[2].trim();
    const args = argsSource ? splitArguments(argsSource).map(arg => parseDeclarativeArg(arg, target, event)) : [];
    return fn.apply(window, args);
  }

  function bindDeclarativeHandlers() {
    document.addEventListener('click', event => {
      const target = event.target.closest('[data-click]');
      if (!target) return;
      try {
        executeDeclarativeHandler('data-click', target, event);
      } catch (err) {
        console.error(err);
      }
    });

    document.addEventListener('input', event => {
      const target = event.target.closest('[data-input]');
      if (!target) return;
      try {
        executeDeclarativeHandler('data-input', target, event);
      } catch (err) {
        console.error(err);
      }
    });

    document.addEventListener('change', event => {
      const target = event.target.closest('[data-change]');
      if (!target) return;
      try {
        executeDeclarativeHandler('data-change', target, event);
      } catch (err) {
        console.error(err);
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key !== 'Enter') return;
      const target = event.target.closest('[data-keydown-enter]');
      if (!target) return;
      event.preventDefault();
      try {
        executeDeclarativeHandler('data-keydown-enter', target, event);
      } catch (err) {
        console.error(err);
      }
    });
  }

  function showToast(message, duration = 2000) {
    let toast = document.getElementById('pmrv-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'pmrv-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.85);
        color: white;
        padding: 12px 24px;
        border-radius: 99px;
        font-size: 14px;
        font-weight: 600;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: opacity 0.3s, transform 0.3s;
        pointer-events: none;
        opacity: 0;
      `;
      document.body.appendChild(toast);
    }

    toast.innerText = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
    }, duration);
  }

  async function copyToClipboard(text, btnElement) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast('📋 Copiado para a área de transferência!');
      
      if (btnElement) {
        const originalHtml = btnElement.innerHTML;
        btnElement.innerHTML = '✅ Copiado!';
        btnElement.classList.add('btn-success');
        setTimeout(() => {
          btnElement.innerHTML = originalHtml;
          btnElement.classList.remove('btn-success');
        }, 2000);
      }
    } catch (err) {
      console.error('[PMRV] Falha ao copiar:', err);
      showToast('❌ Erro ao copiar texto.');
    }
  }

  function startSpeechRecognition(targetId, btnElement) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('❌ Ditado por voz não suportado neste navegador.');
      return;
    }

    const target = document.getElementById(targetId);
    if (!target) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const originalHtml = btnElement.innerHTML;
    btnElement.innerHTML = '🛑 Ouvindo...';
    btnElement.classList.add('btn-recording');
    showToast('🎙️ Pode falar agora...');

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const currentValue = target.value.trim();
      target.value = currentValue ? currentValue + ' ' + transcript : transcript;
      target.dispatchEvent(new Event('input')); // Dispara evento para salvar/atualizar
      showToast('✅ Texto adicionado via voz.');
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognition.onend = () => {
      btnElement.innerHTML = originalHtml;
      btnElement.classList.remove('btn-recording');
    };

    recognition.onerror = (event) => {
      console.error('[Speech] Erro:', event.error);
      showToast('❌ Falha no reconhecimento: ' + event.error);
      btnElement.innerHTML = originalHtml;
      btnElement.classList.remove('btn-recording');
    };

    recognition.start();
  }

  return {
    go,
    registerModule,
    cic_switchTab,
    docs_switchTab,
    docs_ciclomotoresSwitchTab,
    sin_zoom,
    sin_closeZoom,
    sin_closeZoomOnBackdrop,
    limparCache,
    confirmarLimpezaCompleta,
    bindDeclarativeHandlers,
    copyToClipboard,
    showToast,
    startSpeechRecognition
  };
})();

window.go = PMRV.core.go;
window.registerModule = PMRV.core.registerModule;
window.cic_switchTab = PMRV.core.cic_switchTab;
window.docs_switchTab = PMRV.core.docs_switchTab;
window.docs_ciclomotoresSwitchTab = PMRV.core.docs_ciclomotoresSwitchTab;
window.sin_zoom = PMRV.core.sin_zoom;
window.sin_closeZoom = PMRV.core.sin_closeZoom;
window.sin_closeZoomOnBackdrop = PMRV.core.sin_closeZoomOnBackdrop;
window.core_limparCache = PMRV.core.limparCache;
window.core_confirmarLimpezaCompleta = PMRV.core.confirmarLimpezaCompleta;
window.copiar = PMRV.core.copyToClipboard;
window.showToast = PMRV.core.showToast;
window.startSpeech = PMRV.core.startSpeechRecognition;

document.addEventListener('DOMContentLoaded', PMRV.core.bindDeclarativeHandlers);
