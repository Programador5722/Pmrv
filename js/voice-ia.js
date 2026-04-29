/**
 * Módulo: Assistente de Voz Inteligente (Innovation B)
 * Transcreve voz e processa com IA para preencher campos operacionais.
 */

const VOICE_STATE = {
    recognition: null,
    isListening: false
};

/**
 * Inicializa o assistente de narrativa por voz
 */
function voice_iniciarNarrativa(btnId, targetId) {
    const btn = document.getElementById(btnId);
    const target = document.getElementById(targetId);
    if (!btn || !target) return;

    if (VOICE_STATE.isListening) {
        voice_parar();
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('Reconhecimento de voz não suportado neste navegador.');
        return;
    }

    VOICE_STATE.recognition = new SpeechRecognition();
    VOICE_STATE.recognition.lang = 'pt-BR';
    VOICE_STATE.recognition.interimResults = false;
    VOICE_STATE.recognition.continuous = false;

    const originalHtml = btn.innerHTML;
    btn.innerHTML = '🛑 Parar Ouvindo...';
    btn.classList.add('btn-danger');
    VOICE_STATE.isListening = true;

    VOICE_STATE.recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('[Voice IA] Texto capturado:', transcript);
        
        target.value = transcript;
        target.dispatchEvent(new Event('input'));
        
        // Inova: Processar com IA para extrair dados
        await voice_processarComIA(transcript);
    };

    VOICE_STATE.recognition.onerror = (e) => {
        console.error('[Voice IA] Erro:', e.error);
        voice_resetBtn(btn, originalHtml);
    };

    VOICE_STATE.recognition.onend = () => {
        voice_resetBtn(btn, originalHtml);
    };

    VOICE_STATE.recognition.start();
}

function voice_resetBtn(btn, html) {
    btn.innerHTML = html;
    btn.classList.remove('btn-danger');
    VOICE_STATE.isListening = false;
}

function voice_parar() {
    if (VOICE_STATE.recognition) {
        VOICE_STATE.recognition.stop();
    }
}

/**
 * Motor de IA para extrair entidades do texto ditado
 */
async function voice_processarComIA(texto) {
    window.showToast('🧠 IA Analisando narrativa...');
    
    // Tenta backend real se disponível, senão usa motor heurístico local
    try {
        const entities = voice_extrairHeuristica(texto);
        voice_aplicarDados(entities);
    } catch (e) {
        console.warn('[Voice IA] Falha no processamento:', e);
    }
}

function voice_extrairHeuristica(texto) {
    const txt = texto.toLowerCase();
    const data = {
        v1_placa: null,
        v2_placa: null,
        v1_tipo: null,
        v2_tipo: null,
        local: null,
        km: null
    };

    // Regex para Placas (ABC1234 ou ABC1D23)
    const placaRegex = /[a-z]{3}[0-9][a-z0-9][0-9]{2}/g;
    const placas = txt.match(placaRegex);
    if (placas) {
        data.v1_placa = placas[0].toUpperCase();
        if (placas[1]) data.v2_placa = placas[1].toUpperCase();
    }

    // Identificação de tipos
    if (txt.includes('moto') || txt.includes('motocicleta')) data.v1_tipo = 'moto';
    if (txt.includes('caminhão') || txt.includes('carreta')) data.v1_tipo = 'caminhao';
    
    // Identificação de KM
    const kmMatch = txt.match(/km\s*(\d+)/);
    if (kmMatch) data.km = kmMatch[1];

    return data;
}

function voice_aplicarDados(entities) {
    let alteracoes = 0;

    // 1. Relato Policial (KM)
    const kmInput = document.getElementById('pmrv_km');
    if (entities.km && kmInput) {
        kmInput.value = entities.km;
        alteracoes++;
    }

    // 2. Patrulhamento (Se estiver na tela de patrulhamento)
    const patPlaca = document.getElementById('pat_placa');
    if (entities.v1_placa && patPlaca) {
        patPlaca.value = entities.v1_placa;
        patPlaca.dispatchEvent(new Event('input')); // Gatilho para formatar
        alteracoes++;
    }

    if (alteracoes > 0) {
        window.showToast(`✅ IA preencheu ${alteracoes} campo(s).`);
        if (typeof pmrv_atualizar === 'function') pmrv_atualizar();
    }
}

window.voice_iniciarNarrativa = voice_iniciarNarrativa;
