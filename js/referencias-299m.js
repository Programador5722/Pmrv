/**
 * Modulo: Referencias 299m - Inteligencia Contextual (Google Cloud Integration)
 * Especialista Perito Mobilidade
 */

(function() {
    let initialized = false;

    window.ref299m_init = function() {
        if (initialized) return;
        console.log('[Ref299m] Inicializando modulo context...');
        
        const checkData = setInterval(() => {
            if (window.REFERENCIAS_299M && window.REFERENCIAS_299M.rows) {
                clearInterval(checkData);
                initialized = true;
                ref299m_populateRodovias();
            }
        }, 200);

        setTimeout(() => clearInterval(checkData), 10000); // Limite de 10s
    };

    function ref299m_populateRodovias() {
        const select = document.getElementById('ref299m_rodovia_select');
        if (!select) return;
        const data = window.REFERENCIAS_299M;
        const rodovias = [...new Set(data.rows.map(r => r.rodovia))].sort();
        select.innerHTML = '<option value="">-- Selecione --</option>';
        rodovias.forEach(rod => {
            const opt = document.createElement('option');
            opt.value = rod;
            opt.textContent = rod;
            select.appendChild(opt);
        });
    }

    window.ref299m_popularKM = function() {
        const rodovia = document.getElementById('ref299m_rodovia_select').value;
        const kmSelect = document.getElementById('ref299m_km_select');
        if (!rodovia || !kmSelect) return;
        const data = window.REFERENCIAS_299M.rows.filter(r => r.rodovia === rodovia);
        kmSelect.innerHTML = '<option value="">-- Selecione o KM --</option>';
        data.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.km;
            opt.textContent = `KM ${r.km_label}`;
            kmSelect.appendChild(opt);
        });
    }

    window.ref299m_mostrarRef = async function() {
        const rodovia = document.getElementById('ref299m_rodovia_select').value;
        const kmVal = parseFloat(document.getElementById('ref299m_km_select').value);
        const container = document.getElementById('ref299m_result_area');

        if (!rodovia || isNaN(kmVal)) {
            window.showToast('⚠️ Selecione a rodovia e o KM.');
            return;
        }

        const ref = window.REFERENCIAS_299M.rows.find(r => r.rodovia === rodovia && Math.abs(r.km - kmVal) < 0.001);
        if (!ref) return;

        container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--primary);">⏳ Consultando estabelecimentos reais via Google...</div>';

        // Busca estabelecimentos via Google Places (Raio 300m)
        let htmlPois = '';
        try {
            const pois = await buscarRedondezasGoogle(ref.latitude, ref.longitude);
            const poiDestaque = pois.length > 0 ? pois[0] : null;

            let titulo = ref.descricao;
            let sub = "Marco operacional";
            
            if (poiDestaque && poiDestaque.distance <= 100) {
                titulo = `📍 ${poiDestaque.name}`;
                sub = `Estabelecimento proximo a ${poiDestaque.distance}m do marco`;
            }

            if (pois.length > 0) {
                htmlPois = `
                    <div style="margin-top:16px; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">
                        <div style="font-size:10px; font-weight:800; color:#f97316; text-transform:uppercase; margin-bottom:10px;">🏙️ Redondezas e Pontos de Apoio</div>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            ${pois.map(p => `
                                <div style="display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.04); padding:10px; border-radius:10px;">
                                    <div style="font-size:18px;">${p.icon}</div>
                                    <div style="flex:1;">
                                        <div style="font-size:14px; font-weight:700;">${p.name}</div>
                                        <div style="font-size:11px; color:#888;">${p.type} • a ${p.distance}m</div>
                                    </div>
                                    <button class="btn btn-sm" onclick="window.open('https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}', '_blank')">🌍 Ver</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>`;
            }

            container.innerHTML = `
                <div class="card" style="border-left:4px solid #22c55e; background:#111;">
                    <div style="display:flex; justify-content:space-between; align-items:start;">
                        <div>
                            <div style="font-size:11px; color:#22c55e; font-weight:800; text-transform:uppercase;">Localizacao Especifica</div>
                            <strong style="font-size:20px; color:#fff;">${titulo}</strong>
                            <div style="font-size:13px; color:#aaa; margin-top:4px;">${sub}</div>
                            <div style="margin-top:8px; display:inline-block; padding:2px 8px; background:rgba(34,197,94,0.1); border-radius:4px; font-size:12px; color:#22c55e; font-weight:700;">
                                ${ref.rodovia} • KM ${ref.km_label}
                            </div>
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="window.copiar('${titulo.replace('📍 ','')} (${ref.rodovia} KM ${ref.km_label})')">📋 Copiar</button>
                    </div>
                    ${htmlPois}
                </div>
            `;
        } catch (e) {
            console.error(e);
            window.showToast('❌ Erro ao buscar redondezas.');
        }
    };

    async function buscarRedondezasGoogle(lat, lng) {
        return new Promise((resolve) => {
            if (!window.google || !window.google.maps) return resolve([]);
            const service = new google.maps.places.PlacesService(document.createElement('div'));
            service.nearbySearch({
                location: new google.maps.LatLng(lat, lng),
                radius: 300,
                type: ['store', 'gas_station', 'restaurant', 'bank', 'hospital', 'police']
            }, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    const list = results.slice(0, 6).map(p => {
                        const dist = Math.round(google.maps.geometry.spherical.computeDistanceBetween(
                            new google.maps.LatLng(lat, lng), p.geometry.location
                        ));
                        let icon = '🏢';
                        if (p.types.includes('gas_station')) icon = '⛽';
                        if (p.types.includes('hospital')) icon = '🏥';
                        if (p.types.includes('police')) icon = '👮';
                        if (p.types.includes('restaurant')) icon = '🍴';
                        return { name: p.name, distance: dist, type: p.types[0].replace('_', ' '), lat: p.geometry.location.lat(), lng: p.geometry.location.lng(), icon: icon };
                    });
                    resolve(list.sort((a,b) => a.distance - b.distance));
                } else resolve([]);
            });
        });
    }
})();
