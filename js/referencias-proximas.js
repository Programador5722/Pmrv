/**
 * Modulo: Referencias Proximas (Busca Nominal)
 * v4 - Renderização instantânea + Atualização assíncrona (Sem travamento)
 */

(function() {
  let initialized = false;

  window.ref_prox_init = function() {
    if (initialized) return;
    const checkData = setInterval(() => {
      const data100 = window.GRANDE_FLORIANOPOLIS_REFERENCIAS_100M;
      if (data100 && data100.rows) {
        clearInterval(checkData);
        initialized = true;
        refProxPopulateRodovias(data100);
      }
    }, 200);
    setTimeout(() => clearInterval(checkData), 10000);
  };

  function refProxPopulateRodovias(data) {
    const select = document.getElementById('ref_prox_rodovia_select');
    if (!select) return;
    const rodovias = [...new Set(data.rows.map(r => r.rodovia))].sort();
    select.innerHTML = '<option value="">-- Selecione a Rodovia --</option>';
    rodovias.forEach(rod => {
      const opt = document.createElement('option');
      opt.value = rod;
      opt.textContent = rod;
      select.appendChild(opt);
    });
  }

  window.ref_prox_buscar = function() {
    const rodovia = document.getElementById('ref_prox_rodovia_select').value;
    const kmInput = document.getElementById('ref_prox_km_input').value.replace(',', '.');
    const container = document.getElementById('ref_prox_results_area');
    const data100 = window.GRANDE_FLORIANOPOLIS_REFERENCIAS_100M;
    const poisLocal = window.REFERENCIAS_POIS_TOMTOM || [];

    if (!rodovia || !kmInput) {
      window.showToast('⚠️ Informe a rodovia e o KM.');
      return;
    }

    const kmSolicitado = parseFloat(kmInput);
    const rows = data100.rows.filter(r => r.rodovia === rodovia);
    
    let menorDiff = Infinity;
    let melhorMarco = null;

    rows.forEach(ref => {
      const diff = Math.abs(ref.km - kmSolicitado);
      if (diff < menorDiff) {
        menorDiff = diff;
        melhorMarco = ref;
      }
    });

    if (!melhorMarco) {
      window.showToast('❌ Localização não encontrada.');
      return;
    }

    // Tenta POI local (TomTom) para exibição imediata
    const poiLocal = poisLocal.find(p => p.rodovia === rodovia && Math.abs(p.km - kmSolicitado) < 0.15);

    // DADOS INICIAIS (Aparecem na hora)
    let initialTitle = poiLocal ? poiLocal.descricao : melhorMarco.descricao.replace('📍 ', '').split(' (KM')[0];
    let initialSub = poiLocal ? `Ponto conhecido: ${poiLocal.categoria}` : "Marco operacional de rodovia";
    let initialColor = poiLocal ? "#22c55e" : "var(--primary)";
    let initialIcon = poiLocal ? "🏢" : "📍";

    // RENDERIZAÇÃO IMEDIATA
    container.innerHTML = `
        <div class="card" id="ref_main_card" style="border-left:5px solid ${initialColor}; background:#111;">
          <div style="font-size:11px; color:${initialColor}; font-weight:900; text-transform:uppercase; letter-spacing:1px;" id="ref_badge_txt">REFERÊNCIA MAIS PRÓXIMA</div>
          
          <div style="display:flex; align-items:flex-start; gap:12px; margin-top:10px;">
             <div id="ref_main_icon" style="font-size:32px; background:rgba(255,255,255,0.05); width:54px; height:54px; display:flex; align-items:center; justify-content:center; border-radius:12px;">
                ${initialIcon}
             </div>
             <div style="flex:1;">
                <strong id="ref_main_title" style="font-size:22px; line-height:1.2; display:block; color:#fff;">${initialTitle}</strong>
                <div id="ref_main_sub" style="font-size:13px; color:#aaa; margin-top:4px;">${initialSub}</div>
             </div>
          </div>

          <div style="margin-top:16px; padding:10px; background:rgba(255,255,255,0.03); border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
             <span style="font-size:12px; font-weight:700;">${rodovia} • KM ${kmInput.replace('.',',')}</span>
             <span style="font-size:11px; color:var(--label);" id="ref_dist_txt">Aprox. ${Math.round(menorDiff * 1000)}m de distância</span>
          </div>

          <div id="ref_google_extra" style="margin-top:18px; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px; display:none;">
            <div style="font-size:10px; font-weight:800; color:#888; text-transform:uppercase; margin-bottom:10px;">🏘️ REDONDEZAS (GOOGLE)</div>
            <div id="ref_google_list" style="display:grid; grid-template-columns:1fr; gap:6px;"></div>
          </div>

          <div style="display:flex; gap:8px; margin-top:20px;">
            <button class="btn btn-sm btn-primary" style="flex:1;" onclick="window.open('https://www.google.com/maps/search/?api=1&query=${melhorMarco.latitude},${melhorMarco.longitude}', '_blank')">🌍 Mapa</button>
            <button class="btn btn-sm" style="flex:1;" onclick="window.ref_prox_copiar()">📋 Copiar</button>
          </div>
        </div>
    `;

    // Função de cópia atualizada para pegar o que estiver no DOM no momento
    window.ref_prox_copiar = function() {
        const t = document.getElementById('ref_main_title').innerText;
        window.copiar(`${t} (${rodovia} KM ${kmInput})`);
    };

    // BUSCA NO GOOGLE EM SEGUNDO PLANO (Não trava a UI)
    buscarPoisAssincrono(melhorMarco.latitude, melhorMarco.longitude, poiLocal != null);
  };

  async function buscarPoisAssincrono(lat, lng, jaTemPoiLocal) {
    if (!window.google || !window.google.maps) return;

    try {
        const service = new google.maps.places.PlacesService(document.createElement('div'));
        service.nearbySearch({
            location: new google.maps.LatLng(lat, lng),
            radius: 400,
            type: ['store', 'gas_station', 'restaurant', 'bank', 'hospital', 'police', 'establishment', 'food', 'point_of_interest']
        }, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                const pois = results.map(p => {
                    const dist = Math.round(google.maps.geometry.spherical.computeDistanceBetween(
                        new google.maps.LatLng(lat, lng), p.geometry.location
                    ));
                    let icon = '🏢';
                    if (p.types.includes('gas_station')) icon = '⛽';
                    if (p.types.includes('hospital')) icon = '🏥';
                    if (p.types.includes('police')) icon = '👮';
                    if (p.types.includes('restaurant') || p.types.includes('food')) icon = '🍴';
                    return { name: p.name, distance: dist, icon: icon, lat: p.geometry.location.lat(), lng: p.geometry.location.lng() };
                }).sort((a,b) => a.distance - b.distance);

                // 1. Se achou algo muito perto (<150m) e não temos POI local, atualiza o destaque
                if (!jaTemPoiLocal && pois[0].distance <= 150) {
                    const d = pois[0];
                    document.getElementById('ref_main_title').innerText = d.name;
                    document.getElementById('ref_main_sub').innerText = `Estabelecimento a ${d.distance}m do local`;
                    document.getElementById('ref_main_icon').innerText = d.icon;
                    document.getElementById('ref_main_card').style.borderLeftColor = "#3b82f6";
                    document.getElementById('ref_badge_txt').style.color = "#3b82f6";
                    document.getElementById('ref_dist_txt').innerText = `Aprox. ${d.distance}m de distância`;
                }

                // 2. Mostra as redondezas
                const extra = document.getElementById('ref_google_extra');
                const list = document.getElementById('ref_google_list');
                if (extra && list) {
                    extra.style.display = 'block';
                    list.innerHTML = pois.slice(1, 4).map(p => `
                        <div style="font-size:13px; color:#ccc; display:flex; align-items:center; gap:8px;">
                            <span>${p.icon}</span> <strong>${p.name}</strong> <span style="font-size:11px; color:#666;">(${p.distance}m)</span>
                        </div>
                    `).join('');
                }
            }
        });
    } catch(e) { console.warn("Google Places offline ou falhou."); }
  }

})();
