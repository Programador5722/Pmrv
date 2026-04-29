const https = require('https');

const API_KEY = '3g2ZOIEsJUN2VTkHi6dYW8PuV4kiBTUu';
const LAT = -27.614067;
const LON = -48.643156;
const RADIUS = 500;

const url = `https://api.tomtom.com/search/2/poiSearch/*.json?key=${API_KEY}&lat=${LAT}&lon=${LON}&radius=${RADIUS}&limit=20&language=pt-BR`;

console.log(`--- SCAN DE REFERÊNCIAS (RAIO 300M) ---`);
console.log(`Ponto Central: ${LAT}, ${LON}\n`);

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const results = JSON.parse(data).results;
            if (!results || results.length === 0) {
                console.log("Nenhum local encontrado neste raio.");
                return;
            }
            results.forEach((p, i) => {
                const name = p.poi.name;
                const cat = p.poi.categories ? p.poi.categories[0] : 'Geral';
                const dist = p.dist;
                const addr = p.address.freeformAddress || 'N/A';
                const pLat = p.position.lat;
                const pLon = p.position.lon;

                console.log(`${i + 1}. ${name}`);
                console.log(`   Categoria: ${cat}`);
                console.log(`   Distância: ${dist.toFixed(1)} metros`);
                console.log(`   Endereço: ${addr}`);
                console.log(`   Link: https://www.google.com/maps/search/?api=1&query=${pLat},${pLon}`);
                console.log("-".repeat(30));
            });
        } catch (e) {
            console.log("Erro ao processar dados: " + e.message);
        }
    });
}).on('error', (e) => {
    console.log("Erro na requisição: " + e.message);
});
