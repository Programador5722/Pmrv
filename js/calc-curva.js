/**
 * Modulo: Calculadora de Raio de Curva (Fase 5)
 * Determina o raio via Corda/Flecha e a Velocidade Critica de Derrapagem.
 */

(function() {
    function curva_calcular() {
        const c = parseFloat(document.getElementById('curva_corda').value);
        const f = parseFloat(document.getElementById('curva_flecha').value);
        const mu = parseFloat(document.getElementById('curva_atrito').value) || 0.7;
        const g = 9.81;

        const resArea = document.getElementById('curva_resultado_area');
        if (!c || !f || f <= 0) {
            resArea.style.display = 'none';
            return;
        }

        // 1. Calcular Raio (Geometria: R = (c^2 / 8f) + f/2)
        const raio = (Math.pow(c, 2) / (8 * f)) + (f / 2);

        // 2. Calcular Velocidade Critica (V = sqrt(mu * g * R))
        const vMs = Math.sqrt(mu * g * raio);
        const vKmh = vMs * 3.6;

        resArea.style.display = 'block';

        // Atualizar UI
        document.getElementById('curva_res_raio').textContent = raio.toFixed(2) + ' m';
        document.getElementById('curva_res_vel').textContent = Math.floor(vKmh) + ' km/h';
        
        // Texto Tecnico
        let txt = `📐 ESTUDO GEOMETRICO DE CURVATURA\n`;
        txt += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        txt += `1. MEDICOES DE CAMPO:\n`;
        txt += `- Comprimento da Corda (c): ${c.toFixed(2)}m\n`;
        txt += `- Flecha/Sagitado (f): ${f.toFixed(2)}m\n`;
        txt += `- Coeficiente de Atrito (μ): ${mu.toFixed(2)}\n\n`;

        txt += `2. RESULTADOS:\n`;
        txt += `- Raio Calculado: ${raio.toFixed(2)} metros\n`;
        txt += `- Velocidade Critica (Derrapagem): ${Math.floor(vKmh)} km/h\n\n`;

        txt += `3. ANALISE PERICIAL:\n`;
        txt += `O raio de ${raio.toFixed(2)}m indica uma curva de ${raio < 100 ? 'pequeno' : 'medio/grande'} raio. A velocidade limite para manter a estabilidade lateral (sem considerar inclinacao/superelevacao) e de aproximadamente ${Math.floor(vKmh)} km/h. Velocidades superiores a esta resultariam em perda de aderencia e saida tangencial da pista.`;

        document.getElementById('curva_justificativa').value = txt;
    }

    function curva_limpar() {
        document.getElementById('curva_corda').value = '';
        document.getElementById('curva_flecha').value = '';
        document.getElementById('curva_resultado_area').style.display = 'none';
        document.getElementById('curva_justificativa').value = '';
    }

    function curva_copiar() {
        window.copiar(document.getElementById('curva_justificativa').value, document.querySelector('[data-click="curva_copiar()"]'));
    }

    window.curva_calcular = curva_calcular;
    window.curva_limpar = curva_limpar;
    window.curva_copiar = curva_copiar;

})();
