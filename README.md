# 🌱 Agrinho 2026 - Consultor Agrícola Sustentável do Paraná

Um site interativo que ajuda produtores rurais a tomarem decisões sobre plantio sustentável, baseado em sua localização, tipo de terra e condições climáticas.

## 📋 Características

- **Mapa Interativo**: Baseado em Leaflet.js e OpenStreetMap
- **Dados Geoespaciais**: Utiliza arquivo GeoJSON para regiões e cidades
- **Previsão de Tempo**: Integração com API Open-Meteo em tempo real
- **Recomendações Personalizadas**: Sugestões de culturas, métodos de plantio e práticas sustentáveis
- **Regras Agrinho 2026**: Informações sobre sustentabilidade ambiental, responsabilidade social e inovação
- **Design Responsivo**: Funciona em desktop, tablet e mobile

## 📁 Estrutura do Projeto

```
agrinho-2026/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Lógica JavaScript
├── parana.geojson      # Dados geoespaciais (regiões e cidades)
└── README.md          # Este arquivo
```

## 🗺️ Arquivo GeoJSON

O arquivo `parana.geojson` contém:

### Regiões (Polygons)
- **Norte**: Maringá, Londrina, região de culturas de verão
- **Nordeste**: Santo Antônio da Platina, Jacarezinho
- **Centro-Oeste**: Guarapuava, Cascavel, região de transição climática
- **Sudeste**: Altitude elevada, clima temperado
- **Sul**: Curitiba, Ponta Grossa, ideal para culturas de inverno

### Cidades (Points)
- 21 cidades mapeadas
- Coordenadas precisas (latitude/longitude)
- População e informações regionais
- Fácil de adicionar mais cidades

## 🚀 Como Usar

### 1. Clonar o Repositório
```bash
git clone https://github.com/vitortokarskinascimento/agrinho-2026.git
cd agrinho-2026
```

### 2. Rodar o Servidor
Opção A - Python:
```bash
python -m http.server 8000
```

Opção B - Node.js:
```bash
npx http-server -p 8000
```

### 3. Acessar o Site
Abra o navegador em: `http://localhost:8000`

## 📊 Como Funciona

1. **Selecione uma Cidade**: Clique em qualquer ponto no mapa
2. **Veja o Clima**: A previsão do tempo é carregada automaticamente
3. **Escolha o Tipo de Terra**: Selecione entre Arenoso, Argiloso, Siltoso ou Misto
4. **Obtenha Recomendações**: Clique em "Gerar Recomendações" para ver:
   - Culturas ideais para sua região e solo
   - Métodos de plantio recomendados
   - Práticas sustentáveis
   - Cuidados importantes

## 🌍 Dados Geoespaciais

O arquivo `parana.geojson` usa o formato padrão GeoJSON (RFC 7946) e inclui:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [-51.4289, -23.4250] },
      "properties": {
        "type": "city",
        "name": "Maringá",
        "region": "norte",
        "population": 423561
      }
    }
  ]
}
```

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Design responsivo e animações
- **JavaScript Vanilla**: Lógica da aplicação
- **Leaflet.js**: Biblioteca de mapas interativos
- **OpenStreetMap**: Dados de mapa abertos
- **Open-Meteo API**: Previsão de tempo em tempo real
- **GeoJSON**: Formato padrão para dados geoespaciais

## 📱 Requisitos de Compatibilidade

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Conexão com internet (para mapas e previsão do tempo)
- Suporte a GeoJSON nativo

## 🌱 Regras do Agrinho 2026

O site promove 4 pilares principais:

1. **🌍 Sustentabilidade Ambiental**: Preservação de solo, água e biodiversidade
2. **👨‍🌾 Responsabilidade Social**: Condições justas de trabalho e desenvolvimento rural
3. **💡 Inovação Tecnológica**: Tecnologias limpas e agricultura de precisão
4. **🔄 Economia Circular**: Reaproveitamento de resíduos e integração lavoura-pecuária

## 📊 Recomendações por Região

Cada região tem recomendações específicas para 4 tipos de solo:
- Arenoso
- Argiloso
- Siltoso
- Misto

## 🔧 Adicionar Novas Cidades

Para adicionar uma nova cidade ao mapa, edite `parana.geojson`:

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [-51.0, -24.0]
  },
  "properties": {
    "type": "city",
    "name": "Nome da Cidade",
    "region": "norte",
    "population": 50000
  }
}
```

## 📝 Licença

Projeto Agrinho 2026 - Educação para sustentabilidade

## 👤 Autor

Desenvolvido por: vitortokarskinascimento

## 📧 Suporte

Para dúvidas ou sugestões sobre o projeto, abra uma issue no repositório.