/**
 * Módulo: Calculadora Cinemática de Velocidade
 * Baseado na fórmula de frenagem: V = sqrt(2 * mu * g * d)
 */

(function() {
    function calcCinematica_calcular() {
        const d = parseFloat(document.getElementById('calc_frenagem').value);
        const mu = parseFloat(document.getElementById('calc_superficie').value);
        const g = 9.81; // Gravidade m/s²

        const resArea = document.getElementById('calc_resultado_area');
        if (!d || d <= 0) {
            resArea.style.display = 'none';
            document.getElementById('calc_justificativa').value = '';
            return;
        }

        // V (m/s) = sqrt(2 * mu * g * d)
        const vMs = Math.sqrt(2 * mu * g * d);
        const vKmh = vMs * 3.6;

        resArea.style.display = 'block';
        document.getElementById('calc_vel_kmh').textContent = Math.floor(vKmh) + ' km/h';
        document.getElementById('calc_vel_ms').textContent = `(${vMs.toFixed(2)} m/s)`;

        // Montar Fundamentação Técnica
        const superficieText = document.getElementById('calc_superficie').options[document.getElementById('calc_superficie').selectedIndex].text;
        
        let txt = `📐 ESTIMATIVA PERICIAL DE VELOCIDADE\n`;
        txt += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        txt += `1. DADOS COLETADOS:\n`;
        txt += `- Marca de frenagem (d): ${d.toFixed(2)} metros\n`;
        txt += `- Superfície: ${superficieText}\n`;
        txt += `- Coeficiente de atrito (μ): ${mu.toFixed(2)}\n\n`;
        txt += `2. CÁLCULO CINEMÁTICO:\n`;
        txt += `Fórmula: V = √(2 ∙ μ ∙ g ∙ d)\n`;
        txt += `Onde g = 9,81 m/s²\n\n`;
        txt += `3. CONCLUSÃO TÉCNICA:\n`;
        txt += `Velocidade mínima estimada: ${Math.floor(vKmh)} km/h (${vMs.toFixed(2)} m/s)\n`;
        txt += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        txt += `Nota: O resultado representa a velocidade no início do bloqueio das rodas, não computando energia dissipada em eventuais colisões posteriores.`;

        document.getElementById('calc_justificativa').value = txt;
    }

    function calcCinematica_limpar() {
        document.getElementById('calc_frenagem').value = '';
        document.getElementById('calc_resultado_area').style.display = 'none';
        document.getElementById('calc_justificativa').value = '';
    }

    function calcCinematica_copiar() {
        const text = document.getElementById('calc_justificativa').value;
        if (!text) {
            window.showToast('⚠️ Nada para copiar.');
            return;
        }
        window.copiar(text, document.querySelector('[data-click="calcCinematica_copiar()"]'));
    }

    // Exportar para o escopo global
    window.calcCinematica_calcular = calcCinematica_calcular;
    window.calcCinematica_limpar = calcCinematica_limpar;
    window.calcCinematica_copiar = calcCinematica_copiar;

})();
