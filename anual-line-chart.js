loadData().then(data => {
  // Responsive sizing
  function getChartDimensions(containerId) {
    const container = d3.select(containerId).node();
    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = {
      top: 30,
      right: width < 500 ? 60 : 100,
      bottom: 80,
      left: 60
    };
    
    return {
      margin,
      width: width - margin.left - margin.right,
      height: height - margin.top - margin.bottom
    };
  }

  // New color palette
  const colorMap = {
    "PM2.5": "#e27c7c",
    "PM10": "#a86464",
    "SO2": "#6d4b4b",
    "NO2": "#599e94",
    "O3": "#6cd4c5",
    "CO": "#466964"
  };

  const pollutantsOthers = ["PM2.5", "PM10", "SO2", "NO2", "O3"];
  const pollutantCO = "CO";

  // Load data
  d3.csv("data1.csv").then(rawData => {
    rawData.forEach(d => {
      d.year = +d.year;
      Object.keys(colorMap).forEach(p => d[p] = +d[p]);
    });

    // Rata-rata per tahun
    const grouped = d3.groups(rawData, d => d.year).map(([year, values]) => {
      const avg = { year: +year };
      Object.keys(colorMap).forEach(p => {
        avg[p] = d3.mean(values, v => v[p]);
      });
      return avg;
    });

    // === CHART UNTUK POLUTAN LAINNYA ===
    createChart({
      containerId: "#chart-others",
      data: grouped,
      pollutants: pollutantsOthers,
      yDomain: [0, 200],
      title: "Tren Polutan Tahunan (Kecuali CO)"
    });

    // === CHART UNTUK CO SAJA ===
    createChart({
      containerId: "#chart-co",
      data: grouped,
      pollutants: [pollutantCO],
      yDomain: [1000, 2000],
      title: "Tren CO Tahunan"
    });
  });

  function createChart({ containerId, data, pollutants, yDomain, title }) {
    const container = d3.select(containerId);
    
    // Clear previous chart if any
    container.html("");
    
    const { margin, width, height } = getChartDimensions(containerId);

    const svg = container
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("class", "chart-title")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text(title);

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain(yDomain)
      .range([height, 0]);

    // Add gradient background
    svg.append("linearGradient")
      .attr("id", "area-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", height)
      .attr("x2", 0).attr("y2", 0)
      .selectAll("stop")
      .data([
        {offset: "0%", color: "#f7f7f7"},
        {offset: "100%", color: "#e8f4f9"}
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);
      
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "url(#area-gradient)");
      
    // Grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#e0e0e0")
      .style("stroke-opacity", 0.7);
      
    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#e0e0e0")
      .style("stroke-opacity", 0.7);

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .call(g => g.select(".domain").style("stroke", "#999"))
      .call(g => g.selectAll(".tick text").style("font-size", "11px"));

    svg.append("g")
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").style("stroke", "#999"))
      .call(g => g.selectAll(".tick text").style("font-size", "11px"));
      
    // X-axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Tahun");
      
    // Y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -45)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Level Polutan");

    // Line generator
    const line = pollutant =>
      d3.line()
        .curve(d3.curveMonotoneX)
        .x(d => x(d.year))
        .y(d => y(d[pollutant]));

    // Draw lines
    pollutants.forEach(p => {
      // Add area under the line
      svg.append("path")
        .datum(data)
        .attr("fill", colorMap[p])
        .attr("fill-opacity", 0.1)
        .attr("d", d3.area()
          .curve(d3.curveMonotoneX)
          .x(d => x(d.year))
          .y0(height)
          .y1(d => y(d[p]))
        );

      // Draw the line
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", colorMap[p])
        .attr("stroke-width", 3)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("class", "line")
        .attr("id", `line-${p.replace(".", "-")}`)
        .attr("d", line(p));
        
      // Add points
      svg.selectAll(`.point-${p.replace(".", "-")}`)
        .data(data)
        .enter()
        .append("circle")
        .attr("class", `point-${p.replace(".", "-")}`)
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d[p]))
        .attr("r", 4)
        .attr("fill", colorMap[p])
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5);
    });

    // Create legend
    const legendGroup = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width + 10}, 0)`);
      
    const legendItems = legendGroup.selectAll(".legend-item")
      .data(pollutants)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 25})`)
      .style("cursor", "pointer")
      .on("click", function(event, d) {
        const lineId = `#line-${d.replace(".", "-")}`;
        const pointClass = `.point-${d.replace(".", "-")}`;
        const line = svg.select(lineId);
        const points = svg.selectAll(pointClass);
        const visible = line.style("display") !== "none";
        
        line.style("display", visible ? "none" : null);
        points.style("display", visible ? "none" : null);
        
        // Toggle opacity of legend item
        d3.select(this).style("opacity", visible ? 0.5 : 1);
      });
      
    legendItems.append("rect")
      .attr("width", 18)
      .attr("height", 3)
      .attr("y", 7)
      .attr("fill", d => colorMap[d]);
      
    legendItems.append("circle")
      .attr("cx", 9)
      .attr("cy", 8)
      .attr("r", 4)
      .attr("fill", d => colorMap[d])
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);
      
    legendItems.append("text")
      .attr("x", 24)
      .attr("y", 11)
      .text(d => d)
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");
  }

  // Handle window resize
  window.addEventListener("resize", function() {
    // Redraw charts with new dimensions
    d3.csv("data1.csv").then(rawData => {
      rawData.forEach(d => {
        d.year = +d.year;
        Object.keys(colorMap).forEach(p => d[p] = +d[p]);
      });
      
      const grouped = d3.groups(rawData, d => d.year).map(([year, values]) => {
        const avg = { year: +year };
        Object.keys(colorMap).forEach(p => {
          avg[p] = d3.mean(values, v => v[p]);
        });
        return avg;
      });
      
      createChart({
        containerId: "#chart-others",
        data: grouped,
        pollutants: pollutantsOthers,
        yDomain: [0, 200],
        title: "Tren Polutan Tahunan (Kecuali CO)"
      });
      
      createChart({
        containerId: "#chart-co",
        data: grouped,
        pollutants: [pollutantCO],
        yDomain: [1000, 2000],
        title: "Tren CO Tahunan"
      });
    });
  });
});