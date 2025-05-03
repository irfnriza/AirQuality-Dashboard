loadData().then(data => {

  const margin = { top: 50, right: 150, bottom: 50, left: 60 },
    width = 900 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  const colorMap = {
    "PM2.5": "#1f77b4",
    "PM10": "#ff7f0e",
    "SO2": "#2ca02c",
    "NO2": "#d62728",
    "O3": "#8c564b",
    "CO": "#9467bd"
  };

  const pollutantsOthers = ["PM2.5", "PM10", "SO2", "NO2", "O3"];
  const pollutantCO = "CO";

  // Load data
  d3.csv("data1.csv").then(rawData => {
    rawData.forEach(d => {
      d.hour = +d.hour;
      Object.keys(colorMap).forEach(p => d[p] = +d[p]);
    });

    // Rata-rata per tahun
    const grouped = d3.groups(rawData, d => d.hour).map(([hour, values]) => {
      const avg = { hour: +hour };
      Object.keys(colorMap).forEach(p => {
        avg[p] = d3.mean(values, v => v[p]);
      });
      return avg;
    });

    // === CHART UNTUK POLUTAN LAINNYA ===
    createChart({
      containerId: "#chart-dayly",
      data: grouped,
      pollutants: pollutantsOthers,
      yDomain: [0, 200]
    });

    // === CHART UNTUK CO SAJA ===
    createChart({
      containerId: "#chart-co-dayly",
      data: grouped,
      pollutants: [pollutantCO],
      yDomain: [800, 1600]
    });
  });


  function createChart({ containerId, data, pollutants, yDomain }) {
    const svg = d3.select(containerId)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.hour))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain(yDomain)
      .range([height, 0]);

    // Background stripes
    svg.selectAll(".bg")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.hour) - (width / data.length) / 2)
      .attr("y", 0)
      .attr("width", width / data.length)
      .attr("height", height)
      .attr("fill", (d, i) => i % 2 === 0 ? "#f7f7f7" : "#e0e0e0");

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g")
      .call(d3.axisLeft(y));

    // Line generator
    const line = pollutant =>
      d3.line()
        .x(d => x(d.hour))
        .y(d => y(d[pollutant]));

    // Draw lines
    pollutants.forEach(p => {
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", colorMap[p])
        .attr("stroke-width", 2)
        .attr("class", "line")
        .attr("id", `line-${p}`)
        .attr("d", line(p));
    });

    // Legend
    svg.selectAll(".legend")
      .data(pollutants)
      .enter()
      .append("text")
      .attr("x", width + 10)
      .attr("y", (d, i) => i * 25)
      .attr("fill", d => colorMap[d])
      .attr("class", "legend")
      .text(d => d)
      .on("click", function (event, d) {
        const line = svg.select(`#line-${d}`);
        const visible = line.style("display") !== "none";
        line.style("display", visible ? "none" : null);
      });
  }


});