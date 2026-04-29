/**
 * Logica de GPS para identificacao de rodovia/KM e descricao legivel do local.
 * Quando nao houver rodovia mapeada, tenta obter endereco aproximado por reverse geocoding.
 */

const GPS_RODOVIAS_BASE = {
    "SC-401": [
        { km: 0, lat: -27.581512, lng: -48.513470 },
        { km: 19.3, lat: -27.434800, lng: -48.463500 }
    ]
};

const GPS_REVERSE_CACHE = new Map();

function gps_formatarKm(km) {
    return typeof km === 'number' ? km.toFixed(3).replace('.', ',') : '---';
}

function gps_formatarRodoviaKm(rodovia, km) {
    if (!rodovia || typeof km !== 'number') {
        return 'Local nao identificado';
    }

    return `${rodovia}, km ${gps_formatarKm(km)}`;
}

function gps_montarEnderecoLegivel(data) {
    const address = data?.address || {};
    const via = address.road || address.pedestrian || address.cycleway || address.footway || '';
    const numero = address.house_number || '';
    const bairro = address.suburb || address.neighbourhood || address.city_district || address.village || '';
    const cidade = address.city || address.town || address.village || address.municipality || '';
    const uf = address.state_code || address.state || '';

    const linhaVia = [via, numero].filter(Boolean).join(', ');
    const linhaCidade = [bairro, cidade, uf].filter(Boolean).join(' - ');
    const texto = [linhaVia, linhaCidade].filter(Boolean).join(' | ');

    return texto || data?.display_name || 'Endereco aproximado indisponivel';
}

async function gps_resolverEndereco(latitude, longitude) {
    const cacheKey = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
    if (GPS_REVERSE_CACHE.has(cacheKey)) {
        return GPS_REVERSE_CACHE.get(cacheKey);
    }

    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=18&addressdetails=1&accept-language=pt-BR`;
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const endereco = gps_montarEnderecoLegivel(data);
        GPS_REVERSE_CACHE.set(cacheKey, endereco);
        return endereco;
    } catch (error) {
        console.warn('Falha ao resolver endereco por GPS:', error);
        return 'Endereco aproximado indisponivel';
    }
}

function gps_atualizarHeaderLocal(texto) {
    const header = document.getElementById('header-gps-txt');
    if (header) {
        header.textContent = texto || 'Local indisponivel';
    }
}

function gps_setResultado(payload) {
    const box = document.getElementById('pmrv_gps_result');
    if (!box) return;

    const accuracy = payload && typeof payload.accuracy === 'number' ? `${payload.accuracy.toFixed(0)} m` : '---';
    const rotuloLocal = payload?.rotuloLocal || 'Nao identificado';
    const km = payload?.encontrado && typeof payload.km === 'number' ? gps_formatarKm(payload.km) : '---';
    const descricao = payload?.descricao || '---';

    document.getElementById('pmrv_gps_rodovia').textContent = rotuloLocal;
    document.getElementById('pmrv_gps_km').textContent = km;
    document.getElementById('pmrv_gps_acc').textContent = accuracy;
    document.getElementById('pmrv_gps_desc').textContent = descricao;
    
    // Alerta de Trecho Crítico (Inovação Vertex)
    const alertaTrecho = gps_verificarTrechoCritico(payload?.rodovia, payload?.km);
    const msgElement = document.getElementById('pmrv_gps_msg');
    if (alertaTrecho) {
        msgElement.textContent = `⚠️ TRECHO CRÍTICO: ${alertaTrecho}`;
        msgElement.className = 'text-red-600 font-bold animate-pulse';
    } else {
        msgElement.textContent = payload?.mensagem || '';
        msgElement.className = 'text-gray-600 italic';
    }

    box.classList.remove('hidden');
}

async function gps_preencherSelects() {
    let banco = GPS_RODOVIAS_BASE;
    try {
        const data = await PMRV.dataManager.loadResource('gps_data', 'data/gps_data_sc.json');
        if (data) {
            window.GPS_RODOVIAS_SC = data;
            banco = data;
        }
    } catch (e) {
        console.error("Erro ao carregar banco GPS:", e);
    }

    // Carrega trechos críticos para alertas preventivos
    try {
        window.PMRV_TRECHOS_CRITICOS = await PMRV.dataManager.loadResource('trechos_criticos', 'data/trechos_criticos.json');
    } catch (e) {
        console.warn("Trechos críticos não carregados:", e);
    }
    }

    /**
    * Verifica se o KM atual da rodovia é considerado um trecho crítico.
    * Inovação Vertex: Alerta preventivo para segurança viária.
    */
    function gps_verificarTrechoCritico(rodovia, km) {
    if (!window.PMRV_TRECHOS_CRITICOS || !rodovia || typeof km !== 'number') return null;

    const trecho = window.PMRV_TRECHOS_CRITICOS.find(t => 
        t.rod.toUpperCase() === rodovia.toUpperCase() && 
        km >= t.kmIni && 
        km <= t.kmFim
    );

    if (trecho) {
        console.log(`%c[ALERTA PMRv] Trecho Crítico Detectado: ${trecho.desc}`, 'background: #ff0000; color: #ffffff; font-weight: bold; padding: 4px;');
        return trecho.desc;
    }
    return null;
    }

    if (!banco) return;

    const selectIds = ['pmrv_rodovia', 'pat_manual_rodovia'];
    const rodovias = Object.keys(banco).sort((a, b) => {
        if (a.startsWith('SC-') && !b.startsWith('SC-')) return -1;
        if (!a.startsWith('SC-') && b.startsWith('SC-')) return 1;
        return a.localeCompare(b);
    });

    selectIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        const valorAtual = el.value;
        el.innerHTML = '';

        if (id === 'pmrv_rodovia') {
            const optNone = document.createElement('option');
            optNone.value = '';
            optNone.textContent = '-- Selecione a Rodovia --';
            el.appendChild(optNone);
        }

        rodovias.forEach(rod => {
            const opt = document.createElement('option');
            opt.value = rod;
            opt.textContent = rod;
            el.appendChild(opt);
        });

        if (id === 'pat_manual_rodovia') {
            const optOutra = document.createElement('option');
            optOutra.value = 'OUTRA';
            optOutra.textContent = 'Outra...';
            el.appendChild(optOutra);
        }

        if (valorAtual) {
            el.value = valorAtual;
        }
    });
}

async function gps_buscarClima(lat, lng) {
    const el = document.getElementById('header-weather-txt');
    if (!el) return;

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
        const response = await fetch(url);
        if (!response.ok) return;

        const data = await response.json();
        const cw = data.current_weather;
        const temp = Math.round(cw.temperature);
        const code = cw.weathercode;

        // Mapeamento WMO Weather Codes
        let icon = '☀️';
        let desc = 'Ceu limpo';
        let alertaChuva = false;

        if (code >= 1 && code <= 3) { icon = '⛅'; desc = 'Parc. nublado'; }
        else if (code >= 45 && code <= 48) { icon = '🌫️'; desc = 'Neblina'; }
        else if (code >= 51 && code <= 67) { icon = '🌧️'; desc = 'Chovendo'; alertaChuva = true; }
        else if (code >= 71 && code <= 77) { icon = '❄️'; desc = 'Neve'; }
        else if (code >= 80 && code <= 82) { icon = '🌦️'; desc = 'Pancadas chuva'; alertaChuva = true; }
        else if (code >= 95 && code <= 99) { icon = '⛈️'; desc = 'Tempestade'; alertaChuva = true; }

        el.innerHTML = `${icon} ${temp}°C · ${desc}`;
        if (alertaChuva) {
            el.style.color = '#ef4444'; // Vermelho se houver chuva
        } else {
            el.style.color = 'var(--accent)';
        }
    } catch (err) {
        console.warn('[Clima] Erro ao buscar:', err);
    }
}

async function gps_descreverLocal(latitude, longitude) {
    gps_buscarClima(latitude, longitude); // Busca o clima em paralelo
    const resultadoRodovia = gps_identificarRodoviaKM(latitude, longitude);
    const endereco = await gps_resolverEndereco(latitude, longitude);

    let infoReferencia = '';
    // Tenta encontrar POI de alta precisao (100m) se as globais estiverem disponiveis
    const baseRefs = window.GRANDE_FLORIANOPOLIS_REFERENCIAS_100M?.rows || [];
    if (baseRefs.length > 0) {
        let melhorRef = null;
        let menorDist = 0.100; // Raio de 100 metros para considerar referencia util

        for (const ref of baseRefs) {
            const d = gps_distancia(latitude, longitude, ref.lat, ref.lng);
            if (d < menorDist) {
                menorDist = d;
                melhorRef = ref;
            }
        }

        if (melhorRef) {
            const distM = Math.round(menorDist * 1000);
            infoReferencia = ` (Prox. a ${melhorRef.descricao} - ${distM}m)`;
        }
    }

    if (resultadoRodovia) {
        const descBase = gps_formatarRodoviaKm(resultadoRodovia.rodovia, resultadoRodovia.km);
        return {
            encontrado: true,
            rodovia: resultadoRodovia.rodovia,
            km: resultadoRodovia.km,
            rotuloLocal: resultadoRodovia.rodovia,
            descricao: descBase + infoReferencia,
            endereco: endereco, // Mantém o endereço para extrair cidade
            mensagem: 'Rodovia e KM identificados com suporte de referencia local.'
        };
    }

    return {
        encontrado: false,
        rodovia: null,
        km: null,
        rotuloLocal: 'Endereco',
        descricao: endereco + infoReferencia,
        endereco: endereco,
        mensagem: 'Endereco obtido via GPS/POI.'
    };
}

function gps_obterLocalizacao() {
    if (!navigator.geolocation) {
        window.showToast('❌ GPS nao suportado pelo seu dispositivo.');
        return;
    }

    const btnHome = document.querySelector('.btn-gps-minimal[data-click="gps_obterLocalizacao()"]');
    const btnPmrv = document.getElementById('btn-gps-localizar-pmrv');
    const activeBtn = btnPmrv || btnHome;

    let originalText = '';
    if (activeBtn) {
        originalText = activeBtn.innerHTML;
        activeBtn.innerHTML = 'Localizando...';
        activeBtn.disabled = true;
    }

    window.showToast('🛰️ Obtendo localizacao...');

    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            const resultado = await gps_descreverLocal(latitude, longitude);

            if (accuracy > 150) {
                window.showToast('⚠️ Baixa precisao. Tente ir para area aberta.');
            }

            // Mapeamento de campos por tela
            const campos = [
                { rod: 'pmrv_rodovia', km: 'pmrv_km', cid: 'pmrv_cidade' },
                { rod: 'sin_assist_rodovia', km: 'sin_assist_km', cid: 'sin_assist_cidade' },
                { rod: 'pat_manual_rodovia', km: 'pat_manual_km', cid: '' },
                { rod: 'pat_local', km: '', cid: '' }
            ];

            campos.forEach(c => {
                const rodEl = document.getElementById(c.rod);
                const kmEl = c.km ? document.getElementById(c.km) : null;
                const cidEl = c.cid ? document.getElementById(c.cid) : null;

                if (rodEl) {
                    if (resultado.rodovia) {
                        if (rodEl.tagName === 'SELECT') {
                            const match = Array.from(rodEl.options).find(o => o.value === resultado.rodovia);
                            if (match) rodEl.value = match.value;
                        } else {
                            rodEl.value = resultado.rodovia;
                        }
                    } else if (c.rod === 'pat_local') {
                        rodEl.value = resultado.descricao;
                    }
                }

                if (kmEl && resultado.km !== null) {
                    kmEl.value = gps_formatarKm(resultado.km);
                }

                if (cidEl && resultado.endereco) {
                    // Extrair cidade do endereço (ex: "Rua tal | Centro - Florianópolis - SC")
                    const partes = resultado.endereco.split(' | ');
                    if (partes.length > 1) {
                        const localidade = partes[1].split(' - ');
                        if (localidade.length >= 2) {
                            // Pega "Florianópolis" e "SC" e junta
                            const cid = localidade[localidade.length - 2].trim();
                            const uf = localidade[localidade.length - 1].trim();
                            cidEl.value = `${cid}/${uf}`;
                        }
                    }
                }
            });

            // Gatilhos de atualização específicos
            if (typeof pmrv_verificarRodovia === 'function') pmrv_verificarRodovia();
            if (typeof pmrv_atualizar === 'function') pmrv_atualizar();
            if (typeof sinAssist_atualizarPreview === 'function') sinAssist_atualizarPreview();

            window.showToast(resultado.encontrado ? '✅ Rodovia/KM identificados.' : '📍 Localizacao obtida.');

            gps_setResultado({
                accuracy,
                rotuloLocal: resultado.rotuloLocal,
                rodovia: resultado.rodovia,
                km: resultado.km,
                descricao: resultado.descricao,
                encontrado: resultado.encontrado,
                mensagem: resultado.mensagem
            });
            gps_atualizarHeaderLocal(resultado.descricao);

            if (activeBtn) {
                activeBtn.innerHTML = originalText;
                activeBtn.disabled = false;
            }
        },
        (err) => {
            console.warn('[GPS] Erro:', err);
            let msg = 'Erro ao obter GPS.';
            if (err.code === 1) msg = 'Permissao de GPS negada.';
            else if (err.code === 2) msg = 'Sinal de GPS indisponivel.';
            else if (err.code === 3) msg = 'Tempo limite esgotado.';

            gps_setResultado({
                encontrado: false,
                rotuloLocal: 'GPS',
                descricao: 'Local indisponivel',
                mensagem: msg
            });
            gps_atualizarHeaderLocal('GPS indisponivel');
            window.showToast('❌ ' + msg);

            if (activeBtn) {
                activeBtn.innerHTML = originalText;
                activeBtn.disabled = false;
            }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
}

function gps_identificarRodoviaKM(lat, lng) {
    let melhorRodovia = null;
    let melhorKm = 0;
    let menorDistanciaSq = Infinity;
    let pontoProjetadoFinal = null;

    const bancoRodovias = window.GPS_RODOVIAS_SC || GPS_RODOVIAS_BASE;
    const thresholdDeg = 0.015;

    for (const rodovia in bancoRodovias) {
        const pontos = bancoRodovias[rodovia];

        for (let i = 0; i < pontos.length - 1; i++) {
            const p1 = pontos[i];
            const p2 = pontos[i + 1];

            const minLat = Math.min(p1.lat, p2.lat) - thresholdDeg;
            const maxLat = Math.max(p1.lat, p2.lat) + thresholdDeg;
            const minLng = Math.min(p1.lng, p2.lng) - thresholdDeg;
            const maxLng = Math.max(p1.lng, p2.lng) + thresholdDeg;

            if (lat < minLat || lat > maxLat || lng < minLng || lng > maxLng) continue;

            const projetado = gps_projetarPonto(lat, lng, p1.lat, p1.lng, p2.lat, p2.lng);
            const dLat = lat - projetado.lat;
            const dLng = lng - projetado.lng;
            const distSq = dLat * dLat + dLng * dLng;

            if (distSq < menorDistanciaSq) {
                menorDistanciaSq = distSq;
                melhorRodovia = rodovia;
                pontoProjetadoFinal = projetado;

                const d12Sq = (p2.lat - p1.lat) * (p2.lat - p1.lat) + (p2.lng - p1.lng) * (p2.lng - p1.lng);
                const d1pSq = (projetado.lat - p1.lat) * (projetado.lat - p1.lat) + (projetado.lng - p1.lng) * (projetado.lng - p1.lng);
                const proporcao = d12Sq > 0 ? Math.sqrt(d1pSq / d12Sq) : 0;
                melhorKm = p1.km + (p2.km - p1.km) * proporcao;
            }
        }
    }

    if (melhorRodovia && pontoProjetadoFinal) {
        const distReal = gps_distancia(lat, lng, pontoProjetadoFinal.lat, pontoProjetadoFinal.lng);
        // Tolerancia de 500 metros para considerar que o usuario esta na rodovia
        if (distReal < 0.5) {
            return { rodovia: melhorRodovia, km: melhorKm };
        }
    }

    return null;
}

function gps_distancia(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function gps_projetarPonto(px, py, ax, ay, bx, by) {
    const r2 = (bx - ax) * (bx - ax) + (by - ay) * (by - ay);
    if (r2 === 0) return { lat: ax, lng: ay };
    let t = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / r2;
    t = Math.max(0, Math.min(1, t));
    return {
        lat: ax + t * (bx - ax),
        lng: ay + t * (by - ay)
    };
}

function gps_projetarPontoParaKm(lat, lng, rodovia, km) {
    const pontos = (window.GPS_RODOVIAS_SC || GPS_RODOVIAS_BASE)[rodovia];
    if (!pontos) return { lat, lng };

    let melhorPonto = pontos[0];
    let menorDiff = Math.abs(pontos[0].km - km);

    for (const p of pontos) {
        const diff = Math.abs(p.km - km);
        if (diff < menorDiff) {
            menorDiff = diff;
            melhorPonto = p;
        }
    }

    return melhorPonto;
}

function gps_simularLocalizacao() {
    const pontosTeste = [
        { lat: -27.5000, lng: -48.4900, msg: 'Simulando SC-401 proximo ao Square' },
        { lat: -27.6550, lng: -48.4980, msg: 'Simulando SC-405 Rio Tavares' },
        { lat: -28.4800, lng: -49.0000, msg: 'Simulando rodovia no Sul de SC' }
    ];

    const ponto = pontosTeste[Math.floor(Math.random() * pontosTeste.length)];
    const resultado = gps_identificarRodoviaKM(ponto.lat, ponto.lng);

    if (resultado) {
        const rodoviaEl = document.getElementById('pmrv_rodovia');
        const kmEl = document.getElementById('pmrv_km');
        if (rodoviaEl) {
            rodoviaEl.value = resultado.rodovia;
            if (typeof pmrv_verificarRodovia === 'function') pmrv_verificarRodovia();
        }
        if (kmEl) {
            kmEl.value = gps_formatarKm(resultado.km);
            if (typeof pmrv_atualizar === 'function') pmrv_atualizar();
        }

        const descricao = gps_formatarRodoviaKm(resultado.rodovia, resultado.km);
        gps_setResultado({
            accuracy: 0,
            rotuloLocal: resultado.rodovia,
            rodovia: resultado.rodovia,
            km: resultado.km,
            descricao,
            encontrado: true,
            mensagem: ponto.msg
        });
        gps_atualizarHeaderLocal(descricao);
        alert(`MODO TESTE\n\n${ponto.msg}\n\n${descricao}`);
    } else {
        gps_setResultado({
            accuracy: 0,
            rotuloLocal: 'Endereco',
            descricao: 'Endereco aproximado indisponivel no modo teste.',
            encontrado: false,
            mensagem: 'Nenhuma rodovia identificada para o ponto de teste.'
        });
        gps_atualizarHeaderLocal('Endereco aproximado indisponivel no modo teste.');
        alert('MODO TESTE\n\nNenhuma rodovia identificada para os pontos de teste.');
    }
}

function gps_iniciarMonitoramentoRodape() {
    if (!navigator.geolocation) {
        console.warn('Geolocalizacao nao suportada para o rodape.');
        return;
    }

    navigator.geolocation.watchPosition(
        async (pos) => {
            const { latitude, longitude } = pos.coords;
            const resultado = await gps_descreverLocal(latitude, longitude);
            gps_atualizarHeaderLocal(resultado.descricao);
        },
        (err) => {
            console.warn('Monitoramento GPS (cabecalho):', err.message);
            gps_atualizarHeaderLocal('GPS indisponivel');
        },
        {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 20000
        }
    );
}

window.gps_preencherSelects = gps_preencherSelects;
window.gps_obterLocalizacao = gps_obterLocalizacao;
window.gps_identificarRodoviaKM = gps_identificarRodoviaKM;
window.gps_simularLocalizacao = gps_simularLocalizacao;
window.gps_descreverLocal = gps_descreverLocal;

document.addEventListener('DOMContentLoaded', () => {
    gps_preencherSelects();
    setTimeout(gps_iniciarMonitoramentoRodape, 1500);
});
