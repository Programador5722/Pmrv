import requests
import json

def get_pois_around(lat, lon, radius=300):
    api_key = '3g2ZOIEsJUN2VTkHi6dYW8PuV4kiBTUu'
    # Busca por categorias amplas: Restaurantes, Pizzarias, Lojas, Serviços, etc.
    url = f"https://api.tomtom.com/search/2/poiSearch/*.json?key={api_key}&lat={lat}&lon={lon}&radius={radius}&limit=20&language=pt-BR"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            results = response.json().get('results', [])
            return results
        else:
            return f"Erro API: {response.status_code}"
    except Exception as e:
        return str(e)

# Coordenada do P19 (SC-401 KM 9.2) como exemplo central
lat, lon = -27.5028, -48.4905
pois = get_pois_around(lat, lon)

print(f"--- RELATÓRIO DE REFERÊNCIAS (RAIO 300M) ---")
print(f"Ponto Central: {lat}, {lon}\n")

if isinstance(pois, list):
    for i, p in enumerate(pois, 1):
        name = p['poi']['name']
        cat = p['poi'].get('categories', ['Geral'])[0]
        dist = p['dist']
        addr = p['address'].get('freeformAddress', 'N/A')
        p_lat = p['position']['lat']
        p_lon = p['position']['lon']
        
        print(f"{i}. {name}")
        print(f"   Categoria: {cat}")
        print(f"   Distância: {dist:.1f} metros")
        print(f"   Endereço: {addr}")
        print(f"   Coordenadas: {p_lat}, {p_lon}")
        print(f"   Link: https://www.google.com/maps/search/?api=1&query={p_lat},{p_lon}")
        print("-" * 30)
else:
    print(pois)
