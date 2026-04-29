/**
 * Modulo: Referencias Inteligentes (Places + Geometria)
 */

(function() {
    // Alternancia de abas
    window.ref_switchTab = function(tab) {
        const isPlaces = tab === 'places';
        document.getElementById('ref-content-tradicional').classList.toggle('hidden', isPlaces);
        document.getElementById('ref-content-places').classList.toggle('hidden', !isPlaces);
        
        document.getElementById('tab-ref-tradicional').classList.toggle('btn-primary', !isPlaces);
        document.getElementById('tab-ref-places').classList.toggle('btn-primary', isPlaces);
        
        // Limpa resultados ao trocar
        document.getElementById('ref_prox_results_area').innerHTML = '';
    };

    // Ouvinte para o seletor de locais do Google
    document.addEventListener('DOMContentLoaded', () => {
        const picker = document.getElementById('ref_place_picker');
        if (!picker) return;

        picker.addEventListener('gmpx-placechange', () => {
            const place = picker.value;
            if (!place || !place.location) return;

            const lat = place.location.lat();
            const lng = place.location.lng();
            const nome = place.displayName || place.formattedAddress;

            console.log('[Places] Local selecionado:', nome, lat, lng);
            vincularLocalARodovia(nome, lat, lng);
        });
    });

    async function vincularLocalARodovia(nomeLocal, lat, lng) {
        const container = document.getElementById('ref_prox_results_area');
        container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--primary);">⏳ Calculando nexo com rodovia...</div>';

        // Usa a base de rodovias para encontrar o ponto mais proximo
        const localizacao = await gps_descreverLocal(lat, lng);
        
        let html = `
            <div class="card" style="border-left:4px solid #3b82f6; background:rgba(59,130,246,0.05);">
                <div style="font-size:10px; color:#3b82f6; font-weight:800; text-transform:uppercase; margin-bottom:5px;">📍 LOCAL SELECIONADO</div>
                <strong style="font-size:18px; display:block;">${nomeLocal}</strong>
                <p style="font-size:13px; color:#aaa; margin-top:5px;">Este local foi vinculado operacionalmente à rodovia:</p>
                
                <div style="margin-top:15px; padding:12px; border-radius:10px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05);">
                    <div style="font-size:18px; font-weight:900; color:var(--primary);">
                        ${localizacao.descricao}
                    </div>
                    <div style="font-size:12px; color:var(--success); margin-top:4px; font-weight:700;">
                        ${localizacao.mensagem}
                    </div>
                </div>

                <div style="display:flex; gap:8px; margin-top:15px;">
                    <button class="btn btn-sm btn-primary" onclick="window.open('https://www.google.com/maps/search/?api=1&query=${lat},${lng}', '_blank')">🌍 Ver no Maps</button>
                    <button class="btn btn-sm" onclick="window.copiar('${nomeLocal} (${localizacao.descricao})')">📋 Copiar Relato</button>
                </div>
            </div>
        `;

        container.innerHTML = html;
        window.showToast('✅ Local vinculado com sucesso.');
    }
})();
