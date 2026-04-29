/**
 * Módulo: Inteligência Pericial (Inovação Vertex)
 * Integração com Gemini 1.5 Flash para geração de narrativas técnicas.
 */

const INTEL_URL_BASE = 'http://127.0.0.1:5000';

/**
 * Coleta dados de todos os módulos e solicita à IA a redação do histórico.
 */
async function intel_gerarNarrativaIA() {
    const btn = document.getElementById('btn-gerar-narrativa-ia');
    if (btn) {
        btn.disabled = true;
        btn.textContent = '🤖 Redigindo...';
    }

    try {
        // Coleta de dados do Local/GPS
        const local = document.getElementById('header-gps-txt')?.textContent || 'Não identificado';
        const natureza = document.getElementById('pmrv_ocorrencia')?.value || 'Sinistro de Trânsito';
        
        // Coleta de Danos
        const danosResumo = typeof window.danObterResumoAssistente === 'function' 
            ? window.danObterResumoAssistente() 
            : { linhas: [] };
        
        // Coleta de Cinemática (se houver cálculos feitos)
        const cinematicaTxt = document.getElementById('res-cinematica')?.textContent || 'Sem dados de cálculo';

        // Dinâmica base digitada pelo usuário
        const dinamicaBase = document.getElementById('pmrv_dinamica_texto')?.value || '';

        const payload = {
            natureza: natureza,
            local: local,
            clima: document.getElementById('pmrv_clima')?.value || 'Bom',
            pista: document.getElementById('pmrv_pista_tipo')?.value || 'Seca',
            danos: danosResumo.linhas.join('; '),
            dinamica_base: dinamicaBase,
            cinematica: cinematicaTxt
        };

        const response = await fetch(`${INTEL_URL_BASE}/gerar_narrativa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.sucesso) {
            const output = document.getElementById('pmrv_dinamica_ia');
            if (output) {
                output.value = data.narrativa;
                output.classList.remove('hidden');
                alert('✨ Narrativa técnica gerada com sucesso pela IA Vertex!');
            }
        } else {
            throw new Error(data.erro);
        }

    } catch (error) {
        console.error('Erro na IA:', error);
        alert('Falha ao gerar narrativa pela IA: ' + error.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = '✨ Gerar Narrativa IA (Vertex)';
        }
    }
}

window.intel_gerarNarrativaIA = intel_gerarNarrativaIA;
