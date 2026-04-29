/**
 * Módulo: Gerador de Referências Dinâmicas (250m)
 * Objetivo: Criar marcos técnicos precisos a cada 250m em rodovias estaduais.
 */

window.PMRV = window.PMRV || {};

PMRV.refGerador = (function() {
    
    /**
     * Calcula a distância entre dois pontos (Haversine)
     */
    function calcularDistancia(lat1, lon1, lat2, lon2) {
        const R = 6371; // Raio da Terra em KM
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Interpola um ponto entre P1 e P2 baseado em uma fração (0 a 1)
     */
    function interpolarPonto(p1, p2, fracao) {
        return {
            lat: p1.lat + (p2.lat - p1.lat) * fracao,
            lng: p1.lng + (p2.lng - p1.lng) * fracao,
            km: p1.km + (p2.km - p1.km) * fracao
        };
    }

    /**
     * Gera marcos a cada 250m (0.250 KM) para uma rodovia específica
     */
    function gerarMarcosParaRodovia(rodovia, pontosBase) {
        if (!pontosBase || pontosBase.length < 2) return [];
        
        const marcos = [];
        const intervaloKm = 0.250; // 250 metros

        for (let i = 0; i < pontosBase.length - 1; i++) {
            const p1 = pontosBase[i];
            const p2 = pontosBase[i+1];
            
            // Adiciona o ponto base original
            marcos.push({
                rodovia: rodovia,
                km: p1.km,
                lat: p1.lat,
                lng: p1.lng,
                descricao: `Marco KM ${p1.km.toFixed(3).replace('.', ',')} (Base)`
            });

            // Calcula quantos marcos de 250m cabem entre p1 e p2
            let kmAtual = Math.floor(p1.km / intervaloKm + 1) * intervaloKm;
            
            while (kmAtual < p2.km) {
                const fracao = (kmAtual - p1.km) / (p2.km - p1.km);
                const pontoInterp = interpolarPonto(p1, p2, fracao);
                
                marcos.push({
                    rodovia: rodovia,
                    km: pontoInterp.km,
                    lat: pontoInterp.lat,
                    lng: pontoInterp.lng,
                    descricao: `Ref. Técnica Operacional — KM ${pontoInterp.km.toFixed(3).replace('.', ',')}`
                });
                
                kmAtual += intervaloKm;
            }
        }

        // Adiciona o último ponto
        const ultimo = pontosBase[pontosBase.length - 1];
        marcos.push({
            rodovia: rodovia,
            km: ultimo.km,
            lat: ultimo.lat,
            lng: ultimo.lng,
            descricao: `Marco KM ${ultimo.km.toFixed(3).replace('.', ',')} (Final)`
        });

        return marcos;
    }

    /**
     * Inicia a geração global e injeta na base de referências do app
     */
    async function inicializar() {
        console.log('[RefGerador] Iniciando geração de marcos de 250m...');
        
        // Aguarda a base de GPS estar carregada
        const gpsData = window.GPS_RODOVIAS_SC || await PMRV.dataManager.loadResource('gps_data', 'data/gps_data_sc.json');
        if (!gpsData) return;

        const rodoviasFoco = ['SC-401', 'SC-402', 'SC-403', 'SC-404', 'SC-405', 'SC-406', 'SC-281', 'SC-407'];
        let todosOsMarcos = [];

        rodoviasFoco.forEach(rod => {
            if (gpsData[rod]) {
                const marcosRod = gerarMarcosParaRodovia(rod, gpsData[rod]);
                todosOsMarcos = todosOsMarcos.concat(marcosRod);
                console.log(`[RefGerador] ${rod}: ${marcosRod.length} marcos gerados.`);
            }
        });

        // Injeta na base global usada pelo modulo de referências
        window.GRANDE_FLORIANOPOLIS_REFERENCIAS = {
            rows: todosOsMarcos
        };

        // Força atualização dos selects na UI
        if (typeof window.ref_prox_init === 'function') {
            window.ref_prox_init();
        }
        
        console.log(`[RefGerador] Concluído! Total de ${todosOsMarcos.length} marcos técnicos ativos.`);
    }

    return {
        inicializar
    };
})();

// Auto-inicialização após carregar
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(PMRV.refGerador.inicializar, 2000);
});
