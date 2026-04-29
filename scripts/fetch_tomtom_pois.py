import json
import requests
import pandas as pd
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOMTOM_KEY = '3g2ZOIEsJUN2VTkHi6dYW8PuV4kiBTUu'
GPS_DATA_PATH = ROOT / "data" / "gps_data_sc.json"
REFS_JSON_PATH = ROOT / "data" / "referencias_grande_florianopolis_150m.json"

CATEGORIES = {
    '7311': 'Posto de Combustivel',
    '7322': 'SAMU/Ambulancia',
    '7324': 'Bombeiro',
    '7323': 'Policia',
    '9113': 'Borracharia/Oficina',
    '9361009': 'Conveniencia',
    '7321': 'Saude/Hospital',
    '7326': 'Farmacia',
    '7315': 'Restaurante',
    '7315015': 'Pizzaria',
    '7315005': 'Bar/Pub',
    '9361': 'Loja/Comercio',
    '7328': 'Banco',
    'condo': 'Condominio'
}

def fetch_category_search(lat, lon, category_id, category_name):
    # Se for condomínio, usa busca por texto pois não há categoria ID fixa universal simples no TomTom Search V2 para isso
    query_part = f"categorySet={category_id}" if category_id != 'condo' else f"query=condominio"
    url = f"https://api.tomtom.com/search/2/search/{category_name}.json?key={TOMTOM_KEY}&lat={lat}&lon={lon}&radius=2000&limit=15&{query_part}"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return response.json().get('results', [])
    except Exception as e:
        print(f"Erro na busca {category_name}: {e}")
    return []

def main():
    print("Iniciando coleta de POIs de alta precisão...")
    gps_data = json.loads(GPS_DATA_PATH.read_text(encoding="utf-8"))
    
    roads = ["SC-401", "SC-402", "SC-403", "SC-404", "SC-405", "SC-406", "SC-407", "SC-281", "SC-400"]
    all_pois = {}

    for road in roads:
        if road not in gps_data: continue
        print(f"Processando {road}...")
        points = gps_data[road]
        
        # Amostrar a cada 500m para não estourar limite da API mas manter precisão
        search_points = []
        last_km = -999
        for p in points:
            if p['km'] >= last_km + 0.5:
                search_points.append(p)
                last_km = p['km']

        for p in search_points:
            for cat_id, cat_name in CATEGORIES.items():
                results = fetch_category_search(p['lat'], p['lng'], cat_id, cat_name)
                for res in results:
                    poi_id = res['id']
                    if poi_id not in all_pois:
                        poi_lat = res['position']['lat']
                        poi_lon = res['position']['lon']
                        
                        all_pois[poi_id] = {
                            "rodovia": road,
                            "descricao": res['poi']['name'],
                            "categoria": cat_name,
                            "lat": poi_lat,
                            "lng": poi_lon,
                            "km": p['km'], # KM aproximado da rodovia
                            "endereco": res['address'].get('freeformAddress', '')
                        }
                time.sleep(0.1)

    # Exportar como JS para uso offline no App
    js_content = f"window.REFERENCIAS_POIS_TOMTOM = {json.dumps(list(all_pois.values()), indent=2, ensure_ascii=False)};"
    js_path = ROOT / "data" / "referencias_pois_tomtom.js"
    js_path.write_text(js_content, encoding="utf-8")
    
    print(f"Sucesso! {len(all_pois)} POIs salvos para uso offline em: {js_path}")

if __name__ == "__main__":
    main()
