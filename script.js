let map;
let brazilGeoJsonData = null;
let localGeoJsonData = null;
let lastSelectedRegion = null;

const defaultCenter = [-14.2350, -51.9253];
const defaultZoom = 4;
const brazilGeoJSONUrl = 'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';
const localGeoJSONUrl = './parana.geojson';

const soilRecommendations = {
  arenoso: {
    crops: ['Milho', 'Feijão', 'Melancia', 'Tomate', 'Amendoim'],
    methods: ['Plantio em curvas de nível', 'Irrigação por gotejamento', 'Cobertura morta (mulching)'],
    description: 'Solo arenoso drena rápido; prefira culturas que tolerem baixa retenção de água.'
  },
  argiloso: {
    crops: ['Soja', 'Arroz', 'Trigo', 'Cana-de-açúcar', 'Laranja'],
    methods: ['Aeração profunda', 'Drenagem suave', 'Plantio em leiras'],
    description: 'Solo argiloso mantém água e nutrientes. Controle compactação e drenagem.'
  },
  silte: {
    crops: ['Trigo', 'Cevada', 'Aveia', 'Batata', 'Feijão'],
    methods: ['Plantio direto', 'Cobertura vegetal', 'Manejo de matéria orgânica'],
    description: 'Solo siltoso é fértil e deve ser protegido de erosão e encharcamento.'
  },
  misto: {
    crops: ['Soja', 'Milho', 'Feijão', 'Algodão', 'Abóbora'],
    methods: ['Rotação de culturas', 'Plantio direto', 'Cobertura do solo'],
    description: 'Solo misto é versátil; use rotação e práticas conservacionistas.'
  },
  vermelha: {
    crops: ['Café', 'Cana-de-açúcar', 'Milho', 'Soja', 'Citros'],
    methods: ['Adubação verde', 'Plantio direto', 'Drenagem superficial'],
    description: 'Terra vermelha é rica em óxidos de ferro; mantenha a matéria orgânica e evite erosão.'
  }
};

window.addEventListener('DOMContentLoaded', initMap);

async function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl) {
    console.error('Elemento #map não encontrado.');
    return;
  }

  map = L.map('map', {
    minZoom: 4,
    maxZoom: 16,
    zoomControl: false,
    zoomSnap: 0.5,
    zoomDelta: 0.5
  }).setView(defaultCenter, defaultZoom);

  const imagery = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: 'Tiles © Esri — Fonte: Esri, NASA, NGA, USGS, FEMA, GeoEye',
      maxZoom: 19
    }
  ).addTo(map);

  map.createPane('hillshadePane');
  map.getPane('hillshadePane').style.zIndex = 650;
  const hillshade = L.tileLayer(
    'https://tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png',
    {
      attribution: 'Hillshade overlay',
      maxZoom: 15,
      pane: 'hillshadePane'
    }
  ).addTo(map);
  hillshade.setOpacity(0.35);

  L.control.layers({ Imagery: imagery }, { Hillshade: hillshade }, { position: 'topright' }).addTo(map);
  L.control.zoom({ position: 'topright' }).addTo(map);
  if (L.Control.FullScreen) {
    L.control.fullscreen({ position: 'topright' }).addTo(map);
  }

  setupHillshadeSlider(hillshade);
  setupInfoTabToggle();
  setupSoilButton();
  setupSearch();
  setupDetailClose();

  map.on('click', (event) => openDetailPanel(event.latlng));

  await loadGeoJSON();
  renderGeoJSON();
}

async function loadGeoJSON() {
  try {
    const [brazilResponse, localResponse] = await Promise.all([
      fetch(brazilGeoJSONUrl),
      fetch(localGeoJSONUrl)
    ]);

    if (!brazilResponse.ok) {
      throw new Error(`Falha ao carregar GeoJSON do Brasil: ${brazilResponse.status} ${brazilResponse.statusText}`);
    }
    if (!localResponse.ok) {
      throw new Error(`Falha ao carregar GeoJSON local: ${localResponse.status} ${localResponse.statusText}`);
    }

    brazilGeoJsonData = await brazilResponse.json();
    localGeoJsonData = await localResponse.json();
    console.log(`Carregadas ${brazilGeoJsonData.features.length} features do GeoJSON do Brasil.`);
    console.log(`Carregadas ${localGeoJsonData.features.filter(f => f.properties && f.properties.type === 'city').length} municípios do GeoJSON local.`);
  } catch (error) {
    console.error('Erro ao carregar GeoJSON:', error);
    displayMapError('Não foi possível carregar os dados do mapa.');
  }
}

function renderGeoJSON() {
  if (!brazilGeoJsonData || !brazilGeoJsonData.features || brazilGeoJsonData.features.length === 0) {
    return;
  }

  const brazilLayer = L.geoJSON(brazilGeoJsonData, {
    style: regionStyle,
    onEachFeature: onEachFeature
  }).addTo(map);

  if (localGeoJsonData && localGeoJsonData.features) {
    const cities = localGeoJsonData.features.filter((feature) => feature.properties && feature.properties.type === 'city');
    if (cities.length > 0) {
      L.geoJSON({ type: 'FeatureCollection', features: cities }, {
        pointToLayer: (feature, latlng) => {
          return L.circleMarker(latlng, {
            radius: 6,
            fillColor: '#f97316',
            color: '#fff',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.95
          });
        },
        onEachFeature: onEachFeature
      }).addTo(map);
    }
  }

  const bounds = brazilLayer.getBounds();
  map.fitBounds(bounds, { padding: [40, 40] });
  map.setMaxBounds(bounds);
  map.setMaxBoundsViscosity(0.9);
}

function displayMapError(message) {
  const mapEl = document.getElementById('map');
  if (mapEl) {
    mapEl.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#7a7a7a;font-weight:600;padding:16px;text-align:center;">${message}</div>`;
  }
}

function regionStyle(feature) {
  return {
    color: '#2c5282',
    weight: 2,
    opacity: 0.8,
    fillColor: '#bee3f8',
    fillOpacity: 0.32
  };
}

function onEachFeature(feature, layer) {
  const props = feature.properties || {};
  const name = props.name || 'Região desconhecida';
  const description = props.description || '';

  if (props.type === 'city') {
    layer.bindPopup(`<strong>${name}</strong><br>População: ${props.population || 'N/A'}`);
    layer.bindTooltip(name, {
      permanent: false,
      direction: 'top',
      className: 'city-label'
    });
  } else {
    layer.bindPopup(`<strong>${name}</strong><br>${description}`);
    layer.bindTooltip(name, {
      permanent: true,
      direction: 'center',
      className: 'state-label'
    });
  }

  layer.on('click', () => {
    const center = feature.geometry.type === 'Point' ? layer.getLatLng() : layer.getBounds().getCenter();
    openDetailPanel(center, props);
  });
}

function setupHillshadeSlider(hillshade) {
  const slider = document.getElementById('hillshade-opacity');
  const value = document.getElementById('hillshade-value');
  if (!slider || !value) return;

  const update = (opacity) => {
    const num = parseFloat(opacity);
    if (!Number.isNaN(num) && hillshade.setOpacity) {
      hillshade.setOpacity(num);
      value.textContent = `${Math.round(num * 100)}%`;
    }
  };

  update(slider.value);
  slider.addEventListener('input', (event) => update(event.target.value));
}

function setupInfoTabToggle() {
  const toggle = document.getElementById('info-tab-toggle');
  const tab = document.getElementById('info-tab');
  if (!toggle || !tab) return;
  toggle.addEventListener('click', () => tab.classList.toggle('collapsed'));
}

function setupSoilButton() {
  const button = document.getElementById('apply-soil');
  if (!button) return;

  button.addEventListener('click', () => {
    const soil = document.getElementById('soil-type').value;
    const quick = document.getElementById('info-quick');

    if (!quick) return;
    if (!soil) {
      quick.innerHTML = '<strong>Selecione o tipo de solo antes de gerar recomendações.</strong>';
      return;
    }

    if (!lastSelectedRegion) {
      quick.innerHTML = '<strong>Selecione um estado no mapa antes de gerar recomendações.</strong>';
      return;
    }

    const rec = soilRecommendations[soil];
    if (!rec) {
      quick.innerHTML = '<strong>Tipo de solo não reconhecido.</strong>';
      return;
    }

    quick.innerHTML = `
      <div class="recommendation-card">
        <h4>Recomendações para ${lastSelectedRegion.name || 'a região selecionada'}</h4>
        <p>${rec.description}</p>
        <div class="recommendation-block">
          <strong>O que plantar:</strong>
          <ul>${rec.crops.map((crop) => `<li>${crop}</li>`).join('')}</ul>
        </div>
        <div class="recommendation-block">
          <strong>Métodos de plantio:</strong>
          <ul>${rec.methods.map((method) => `<li>${method}</li>`).join('')}</ul>
        </div>
      </div>
    `;
  });
}

function setupSearch() {
  const input = document.getElementById('search-input');
  const button = document.getElementById('search-btn');
  const results = document.getElementById('search-results');

  if (!input || !button || !results) return;

  button.addEventListener('click', async () => {
    const query = input.value.trim();
    if (!query) return;
    const items = await geocode(query);
    renderSearchResults(items, results);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      button.click();
    }
  });
}

async function geocode(query) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Falha na geocodificação');
    return await response.json();
  } catch (error) {
    console.error('Erro na geocodificação:', error);
    return [];
  }
}

function renderSearchResults(items, container) {
  container.innerHTML = '';
  if (!items || items.length === 0) {
    container.innerHTML = '<div class="result-item">Nenhum resultado encontrado.</div>';
    return;
  }

  items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'result-item';
    row.textContent = item.display_name;
    row.addEventListener('click', () => {
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
        map.setView([lat, lon], 12);
        openDetailPanel({ lat, lng: lon }, { name: item.display_name });
      }
      container.innerHTML = '';
    });
    container.appendChild(row);
  });
}

async function openDetailPanel(latlng, properties = {}) {
  lastSelectedRegion = properties;
  const panel = document.getElementById('detail-panel');
  const content = document.getElementById('detail-content');
  if (!panel || !content) return;
  panel.classList.remove('hidden');

  const title = properties.name || `Lat ${latlng.lat.toFixed(4)}, Lng ${latlng.lng.toFixed(4)}`;
  content.innerHTML = `<h3>${title}</h3><p>Carregando dados...</p>`;

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latlng.lat}&longitude=${latlng.lng}&current_weather=true&timezone=America/Sao_Paulo`);
    const weather = await response.json();
    const temp = weather.current_weather ? `${weather.current_weather.temperature}°C` : 'N/A';
    const wind = weather.current_weather ? `${weather.current_weather.windspeed} km/h` : 'N/A';

    content.innerHTML = `
      <h3>${title}</h3>
      <p><strong>Temperatura:</strong> ${temp}</p>
      <p><strong>Vento:</strong> ${wind}</p>
      <p><strong>Recomendações:</strong></p>
      <ul>
        <li>Verifique o solo antes do plantio.</li>
        <li>Use práticas de conservação de água.</li>
        <li>Adapte a cultura ao clima local.</li>
      </ul>
    `;
  } catch (error) {
    content.innerHTML = `
      <h3>${title}</h3>
      <p>Não foi possível carregar previsões climáticas.</p>
      <p>Use o painel para ver informações do local.</p>
    `;
    console.error('Erro ao carregar dados de clima:', error);
  }
}

function setupDetailClose() {
  const closeButton = document.getElementById('detail-close');
  const panel = document.getElementById('detail-panel');
  if (!closeButton || !panel) return;
  closeButton.addEventListener('click', () => panel.classList.add('hidden'));
}
