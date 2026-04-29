/**
 * Modulo: Analise de Evitabilidade (Fase 4)
 * Estudo tecnico comparativo de distancia de parada total.
 */

(function() {
    function ev_calcular() {
        const vRealKmh = parseFloat(document.getElementById('ev_vel_real').value);
        const vPermKmh = parseFloat(document.getElementById('ev_vel_perm').value);
        const mu = parseFloat(document.getElementById('ev_superficie').value);
        const tempoReacao = parseFloat(document.getElementById('ev_reacao').value) || 1.5;
        const g = 9.81;

        const resArea = document.getElementById('ev_resultado_area');
        if (!vRealKmh || !vPermKmh || !mu) {
            resArea.style.display = 'none';
            return;
        }

        function calcularDistanciaParada(vKmh) {
            const vMs = vKmh / 3.6;
            const dReacao = vMs * tempoReacao;
            const dFrenagem = (vMs * vMs) / (2 * mu * g);
            return {
                reacao: dReacao,
                frenagem: dFrenagem,
                total: dReacao + dFrenagem
            };
        }

        const dadosReal = calcularDistanciaParada(vRealKmh);
        const dadosPerm = calcularDistanciaParada(vPermKmh);
        const diferenca = dadosReal.total - dadosPerm.total;

        resArea.style.display = 'block';

        // Atualizar UI
        document.getElementById('ev_res_total_real').textContent = dadosReal.total.toFixed(1) + ' m';
        document.getElementById('ev_res_total_perm').textContent = dadosPerm.total.toFixed(1) + ' m';
        
        const elDiff = document.getElementById('ev_res_diff');
        elDiff.textContent = Math.abs(diferenca).toFixed(1) + ' metros';
        
        // Texto de Conclusao Pericial
        let conclusao = `⚠️ ANALISE TECNICA DE EVITABILIDADE\n`;
        conclusao += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        conclusao += `1. CENARIO REAL (${vRealKmh} km/h):\n`;
        conclusao += `- Reacao (${tempoReacao}s): ${dadosReal.reacao.toFixed(1)}m\n`;
        conclusao += `- Frenagem: ${dadosReal.frenagem.toFixed(1)}m\n`;
        conclusao += `- ESPACO TOTAL: ${dadosReal.total.toFixed(1)}m\n\n`;

        conclusao += `2. CENARIO NORMATIVO (${vPermKmh} km/h):\n`;
        conclusao += `- Reacao (${tempoReacao}s): ${dadosPerm.reacao.toFixed(1)}m\n`;
        conclusao += `- Frenagem: ${dadosPerm.frenagem.toFixed(1)}m\n`;
        conclusao += `- ESPACO TOTAL: ${dadosPerm.total.toFixed(1)}m\n\n`;

        conclusao += `3. DIAGNOSTICO:\n`;
        if (diferenca > 0) {
            conclusao += `Caso o condutor estivesse na velocidade permitida (${vPermKmh} km/h), teria imobilizado o veiculo ${diferenca.toFixed(1)} metros ANTES do ponto de repouso real, indicando que o excesso de velocidade foi fator determinante para a ocorrencia ou gravidade do sinistro.`;
        } else {
            conclusao += `A velocidade praticada estava abaixo ou igual ao limite. O espaco de parada total era compativel com as normas da via.`;
        }
        
        document.getElementById('ev_justificativa').value = conclusao;
    }

    function ev_limpar() {
        document.getElementById('ev_vel_real').value = '';
        document.getElementById('ev_resultado_area').style.display = 'none';
        document.getElementById('ev_justificativa').value = '';
    }

    function ev_copiar() {
        window.copiar(document.getElementById('ev_justificativa').value, document.querySelector('[data-click="ev_copiar()"]'));
    }

    window.ev_calcular = ev_calcular;
    window.ev_limpar = ev_limpar;
    window.ev_copiar = ev_copiar;
})();
