const map = L.map("map", {
    center: [39.9, 116.4],
    zoom: 11,
    minZoom: 9,
    maxZoom: 16,
    maxBounds: [
      [39.5, 115.8], // Southwest
      [40.5, 117.2]  // Northeast
    ]
  });
  
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
  
  let stationData = {};
  let geojsonLayer;
  let currentPollutant = "PM2.5";
  
  // Load pollution data first
  d3.csv("data1.csv").then(data => {
    data.forEach(d => {
      stationData[d.station] = {
        "PM2.5": +d["PM2.5"],
        "PM10": +d["PM10"],
        "SO2": +d["SO2"],
        "NO2": +d["NO2"],
        "O3": +d["O3"],
        "CO": +d["CO"]
      };
    });
  
    drawMap(currentPollutant);
  });
  
  function getColor(val) {
    return val > 2000 ? "#800026" :
           val > 1000 ? "#BD0026" :
           val > 500  ? "#E31A1C" :
           val > 200  ? "#FC4E2A" :
           val > 100  ? "#FD8D3C" :
           val > 50   ? "#FEB24C" :
           val > 25   ? "#FED976" :
                        "#91cf60";
  }
  
  function drawMap(pollutant) {
    if (geojsonLayer) map.removeLayer(geojsonLayer);
  
    d3.json("stations.geojson").then(geo => {
      geojsonLayer = L.geoJSON(geo, {
        pointToLayer: (feature, latlng) => {
          const name = feature.properties.station;
          const val = stationData[name] ? stationData[name][pollutant] : null;
  
          if (!val) return;
  
          const circle = L.circleMarker(latlng, {
            radius: 9,
            fillColor: getColor(val),
            color: "#444",
            weight: 1,
            fillOpacity: 0.8
          });
  
          const props = stationData[name];
          const popupContent = `
            <strong>${name}</strong><br/>
            PM2.5: ${props["PM2.5"]}<br/>
            PM10: ${props["PM10"]}<br/>
            SO2: ${props["SO2"]}<br/>
            NO2: ${props["NO2"]}<br/>
            O3: ${props["O3"]}<br/>
            CO: ${props["CO"]}
          `;
          circle.bindPopup(popupContent);
          return circle;
        }
      }).addTo(map);
    });
  }
  
  d3.select("#pollutantSelect").on("change", function () {
    currentPollutant = this.value;
    drawMap(currentPollutant);
  });
  
  document.getElementById("resetBtn").addEventListener("click", () => {
    map.setView([39.9, 116.4], 11);
  });
  