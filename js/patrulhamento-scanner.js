/**
 * Módulo: Scanner Tático de Placas (Inovação Vertex)
 * Reconhecimento de placas por vídeo em tempo real para patrulhamento em lote.
 */

let SCANNER_STREAM = null;
let SCANNER_INTERVAL = null;
let SCANNER_PLACAS_DETECTADAS = new Set();

// Base local de simulação de alertas (Em produção viria de uma API ou Cache sincronizado)
const SCANNER_ALERTAS_MOCK = {
    'BRA2E19': { tipo: 'ROUBO', motivo: 'Veiculo com registro de Furto/Roubo em 28/04' },
    'QIV8040': { tipo: 'RESTRICAO', motivo: 'Licenciamento Vencido - 2024' },
    'MJC1234': { tipo: 'ROUBO', motivo: 'Alerta de uso em crime (Assalto Banco)' }
};

/**
 * Inicializa ou encerra o scanner de vídeo.
 */
async function scanner_toggle(ativo) {
    const video = document.getElementById('pat_scanner_video');
    const status = document.getElementById('pat_scanner_status');
    const container = document.getElementById('pat-scanner-container');

    if (!ativo) {
        if (SCANNER_STREAM) {
            SCANNER_STREAM.getTracks().forEach(track => track.stop());
            SCANNER_STREAM = null;
        }
        clearInterval(SCANNER_INTERVAL);
        if (status) status.textContent = 'SCANNER DESATIVADO';
        if (container) container.style.borderColor = 'var(--border)';
        return;
    }

    try {
        SCANNER_STREAM = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        video.srcObject = SCANNER_STREAM;
        
        if (status) status.textContent = 'SCANNER ATIVO - BUSCANDO...';
        
        // Inicia o ciclo de captura (a cada 2 segundos para maior agilidade operacional)
        SCANNER_INTERVAL = setInterval(scanner_processarFrame, 2000);

    } catch (err) {
        console.error('Erro ao acessar câmera:', err);
        alert('Não foi possível acessar a câmera para o scanner tático.');
    }
}

/**
 * Captura um frame do vídeo e envia para OCR na IA.
 */
async function scanner_processarFrame() {
    const video = document.getElementById('pat_scanner_video');
    const canvas = document.getElementById('pat_scanner_canvas');
    const status = document.getElementById('pat_scanner_status');
    
    if (!video || video.paused || video.ended) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converte para Blob (JPEG) para envio
    canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('foto', blob, 'frame.jpg');

        try {
            if (status) status.textContent = '🔍 PROCESSANDO...';
            
            const response = await fetch('http://127.0.0.1:5000/ocr_placa', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.sucesso && data.placa) {
                const placa = data.placa;
                
                // 1. Verifica se há alerta crítico para esta placa
                const alerta = SCANNER_ALERTAS_MOCK[placa];
                
                if (alerta) {
                    scanner_notificarAlertaCritico(placa, alerta);
                }

                if (!SCANNER_PLACAS_DETECTADAS.has(placa)) {
                    SCANNER_PLACAS_DETECTADAS.add(placa);
                    if (status && !alerta) {
                        status.textContent = `✅ PLACA: ${placa}`;
                        status.className = 'absolute bottom-2 left-2 bg-green-600 text-white text-[10px] px-2 py-1 rounded-full font-bold animate-bounce';
                        setTimeout(() => {
                            status.className = 'absolute bottom-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full font-bold';
                            status.textContent = 'BUSCANDO PRÓXIMA...';
                        }, 2000);
                    }
                    
                    if (!alerta) scanner_notificarSucesso();
                    
                    // Adiciona automaticamente ao lote de patrulhamento
                    scanner_adicionarAoLote(placa);
                } else {
                    if (status && !alerta) status.textContent = `🔁 PLACA JÁ NO LOTE: ${placa}`;
                }
            } else {
                if (status) {
                    // Mantém status se não houver alerta ativo
                    if (!status.classList.contains('bg-red-600')) {
                        status.textContent = 'AGUARDANDO PLACA...';
                    }
                }
            }
        } catch (e) {
            console.error('Erro OCR:', e);
            if (status) status.textContent = '❌ IA OFFLINE';
        }
    }, 'image/jpeg', 0.8);
}

/**
 * Notificação visual e sonora de ALERTA CRÍTICO (Sirene)
 */
function scanner_notificarAlertaCritico(placa, alerta) {
    const status = document.getElementById('pat_scanner_status');
    const container = document.getElementById('pat-scanner-container');

    if (status) {
        status.textContent = `🚨 ALERTA: ${placa} (${alerta.tipo})`;
        status.className = 'absolute bottom-2 left-2 bg-red-600 text-white text-[12px] px-3 py-1 rounded-full font-black animate-pulse z-50';
    }
    
    if (container) {
        container.style.borderColor = '#ff0000';
        container.classList.add('animate-pulse');
    }

    // Tocar Sirene Operacional
    scanner_tocarSirene();
    
    // Notificação Toast persistente
    window.showToast(`🚨 PERIGO: Placa ${placa} com queixa de ${alerta.tipo}!`, 5000);
    
    console.warn(`[TÁTICO] ALERTA DE SEGURANÇA: Placa ${placa} - ${alerta.motivo}`);
}

function scanner_tocarSirene() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Simulação de Sirene (Duas notas alternadas)
        const notas = [440, 660];
        let i = 0;
        
        const sireneTimer = setInterval(() => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'square'; // Som mais agressivo
            osc.frequency.setValueAtTime(notas[i % 2], audioCtx.currentTime);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
            i++;
            
            if (i > 6) clearInterval(sireneTimer);
        }, 350);

    } catch (e) {}
}

/**
 * Integra com o módulo de patrulhamento para salvar a placa.
 */
function scanner_adicionarAoLote(placa) {
    const areaPlacas = document.getElementById('pat_lote_placas');
    if (areaPlacas) {
        const atual = areaPlacas.value.trim();
        const novasPlacas = atual ? atual + '\n' + placa : placa;
        areaPlacas.value = novasPlacas;
        
        // Dispara o evento de input para atualizar os contadores do módulo original
        areaPlacas.dispatchEvent(new Event('input'));
        
        console.log(`[TÁTICO] Placa ${placa} adicionada ao lote.`);
    }
}

function scanner_notificarSucesso() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Nota A5
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}
}

/**
 * Processa um arquivo de vídeo da galeria, extraindo frames para OCR.
 */
async function scanner_processarArquivoVideo(input) {
    if (!input.files || !input.files[0]) return;
    
    const file = input.files[0];
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;
    
    window.showToast('🎥 Processando vídeo da galeria...');
    
    video.onloadedmetadata = () => {
        const duration = video.duration;
        const status = document.getElementById('pat_scanner_status');
        
        // Processa um frame a cada segundo do vídeo (até 10 segundos para teste)
        let currentTime = 0;
        const step = 1; 

        const extractFrame = async () => {
            if (currentTime >= Math.min(duration, 15)) {
                window.showToast('✅ Fim do processamento de vídeo.');
                if (status) status.textContent = 'PROCESSAMENTO CONCLUÍDO';
                return;
            }

            video.currentTime = currentTime;
            if (status) status.textContent = `🔍 SCANNER VÍDEO: ${Math.round(currentTime)}s`;
            
            // Aguarda o frame carregar
            video.onseeked = async () => {
                await scanner_processarFrameExterno(video);
                currentTime += step;
                extractFrame();
            };
        };

        extractFrame();
    };
}

/**
 * Processa múltiplas fotos da galeria.
 */
async function scanner_processarGaleria(input) {
    if (!input.files || input.files.length === 0) return;
    
    window.showToast(`🖼️ Processando ${input.files.length} fotos...`);
    
    for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        const img = new Image();
        img.src = URL.createObjectURL(file);
        
        await new Promise(resolve => {
            img.onload = async () => {
                await scanner_processarFrameExterno(img);
                resolve();
            };
        });
    }
    
    window.showToast('✅ Galeria processada.');
}

/**
 * Função auxiliar para processar elementos de imagem/vídeo externos (não stream)
 */
async function scanner_processarFrameExterno(element) {
    const canvas = document.getElementById('pat_scanner_canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = element.videoWidth || element.width;
    canvas.height = element.videoHeight || element.height;
    ctx.drawImage(element, 0, 0, canvas.width, canvas.height);

    return new Promise(resolve => {
        canvas.toBlob(async (blob) => {
            const formData = new FormData();
            formData.append('foto', blob, 'frame.jpg');

            try {
                const response = await fetch('http://127.0.0.1:5000/ocr_placa', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();

                if (data.sucesso && data.placa) {
                    const placa = data.placa;
                    const alerta = SCANNER_ALERTAS_MOCK[placa];
                    
                    if (alerta) scanner_notificarAlertaCritico(placa, alerta);
                    
                    if (!SCANNER_PLACAS_DETECTADAS.has(placa)) {
                        SCANNER_PLACAS_DETECTADAS.add(placa);
                        scanner_adicionarAoLote(placa);
                        if (!alerta) scanner_notificarSucesso();
                    }
                }
            } catch (e) {
                console.error('[Tático] Erro OCR Externo:', e);
            }
            resolve();
        }, 'image/jpeg', 0.8);
    });
}

window.scanner_toggle = scanner_toggle;
window.scanner_processarArquivoVideo = scanner_processarArquivoVideo;
window.scanner_processarGaleria = scanner_processarGaleria;
