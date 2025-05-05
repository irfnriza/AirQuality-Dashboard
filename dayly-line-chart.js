loadData().then(data => {
  // Responsive chart dimensions based on your reference visualization
  function getChartDimensions(containerId) {
    const container = d3.select(containerId).node();
    const width = container.clientWidth;
    const height = Math.min(width * 0.7, container.clientHeight || 400);
    
    const margin = {
      top: 35,
      right: width < 500 ? 30 : 80,
      bottom: 80,
      left: 60
    };
    
    return {
      margin,
      width: width - margin.left - margin.right,
      height: height - margin.top - margin.bottom
    };
  }

  // Color palette from your reference
  const colorMap = {
    "PM2.5": "#e27c7c", // Light red
    "PM10": "#a86464",  // Medium red
    "SO2": "#6d4b4b",   // Dark red-brown
    "NO2": "#599e94",   // Medium teal
    "O3": "#6cd4c5",    // Light teal
    "CO": "#466964"     // Dark teal
  };

  const pollutantsOthers = ["PM2.5", "PM10", "SO2", "NO2", "O3"];
  const pollutantCO = "CO";

  // Load data
  d3.csv("data1.csv").then(rawData => {
    rawData.forEach(d => {
      d.hour = +d.hour;
      Object.keys(colorMap).forEach(p => d[p] = +d[p]);
    });

    // Hourly averages
    const grouped = d3.groups(rawData, d => d.hour).map(([hour, values]) => {
      const avg = { hour: +hour };
      Object.keys(colorMap).forEach(p => {
        avg[p] = d3.mean(values, v => v[p]);
      });
      return avg;
    });

    // Chart for other pollutants
    createChart({
      containerId: "#chart-dayly",
      data: grouped,
      pollutants: pollutantsOthers,
      yDomain: [0, 200],
      title: "Pola Harian Polutan (Kecuali CO)"
    });

    // Chart for CO only
    createChart({
      containerId: "#chart-co-dayly",
      data: grouped,
      pollutants: [pollutantCO],
      yDomain: [800, 1600],
      title: "Pola Harian CO"
    });
  });

  function createChart({ containerId, data, pollutants, yDomain, title }) {
    const container = d3.select(containerId);
    
    // Clear previous chart
    container.html("");
    
    const { margin, width, height } = getChartDimensions(containerId);

    // Create SVG
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
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#333333")
      .text(title);

    const x = d3.scaleLinear()
      .domain([0, 23])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain(yDomain)
      .range([height, 0]);

    // Time period backgrounds - matching your reference
    const timeBlocks = [
      { start: 0, end: 6, label: "Dini Hari", color: "#e8e8fc" },
      { start: 6, end: 12, label: "Pagi", color: "#f4f4dc" },
      { start: 12, end: 18, label: "Siang-Sore", color: "#f9e8dc" },
      { start: 18, end: 24, label: "Malam", color: "#e0e8f0" }
    ];

    // Add time period backgrounds
    timeBlocks.forEach(block => {
      svg.append("rect")
        .attr("x", x(block.start))
        .attr("width", x(block.end) - x(block.start))
        .attr("y", 0)
        .attr("height", height)
        .attr("fill", block.color)
        .attr("opacity", 0.5);
        
      // Time period labels
      svg.append("text")
        .attr("x", x(block.start) + (x(block.end) - x(block.start)) / 2)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .style("fill", "#555")
        .text(block.label);
    });

    // Grid lines
    svg.append("g")
      .attr("class", "grid-x")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickValues(d3.range(0, 24, 2)) // Interval 2 jam untuk grid
        .tickSize(-height)
        .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#ccc")
      .style("stroke-dasharray", "3,3")
      .style("stroke-opacity", 0.7);
      
    svg.append("g")
      .attr("class", "grid-y")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#ccc")
      .style("stroke-dasharray", "3,3")
      .style("stroke-opacity", 0.7);

    // Remove grid borders
    svg.selectAll(".grid-x .domain").style("display", "none");
    svg.selectAll(".grid-y .domain").style("display", "none");

    // X axis - dengan interval 2 jam
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickValues(d3.range(0, 24, 2)) // Interval 2 jam
        .tickFormat(d => `${d}:00`))
      .call(g => g.select(".domain").style("stroke", "#999"))
      .selectAll("text")
      .style("font-size", "9px")
      .style("text-anchor", "middle")
      .attr("dy", "1em");

    // Y axis
    svg.append("g")
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").style("stroke", "#999"))
      .call(g => g.selectAll(".tick text")
        .style("font-size", "11px"));
      
    // X-axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#333333")
      .text("Jam");

    // Y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -45)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#333333")
      .text("Level Polutan (ppb)");

    // Draw lines for each pollutant
    pollutants.forEach(pollutant => {
      // Create line path
      const line = d3.line()
        .x(d => x(d.hour))
        .y(d => y(d[pollutant]))
        .curve(d3.curveMonotoneX);
      
      // Add area fill under the line
      const area = d3.area()
        .x(d => x(d.hour))
        .y0(height)
        .y1(d => y(d[pollutant]))
        .curve(d3.curveMonotoneX);
        
      svg.append("path")
        .datum(data)
        .attr("fill", colorMap[pollutant])
        .attr("fill-opacity", 0.2)
        .attr("d", area);
        
      // Add the line path
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", colorMap[pollutant])
        .attr("stroke-width", 2)
        .attr("d", line);
        
      // Add data points
      svg.selectAll(`.point-${pollutant.replace(".", "-")}`)
        .data(data)
        .enter()
        .append("circle")
        .attr("class", `point-${pollutant.replace(".", "-")}`)
        .attr("cx", d => x(d.hour))
        .attr("cy", d => y(d[pollutant]))
        .attr("r", 4)
        .attr("fill", colorMap[pollutant])
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5);
    });

    // Create legend - similar to your reference
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 20}, 10)`);
      
    pollutants.forEach((p, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
        
      // Line symbol
      legendItem.append("line")
        .attr("x1", -30)
        .attr("y1", 8)
        .attr("x2", -10)
        .attr("y2", 8)
        .attr("stroke", colorMap[p])
        .attr("stroke-width", 2);
        
      // Point symbol
      legendItem.append("circle")
        .attr("cx", -20)
        .attr("cy", 8)
        .attr("r", 4)
        .attr("fill", colorMap[p])
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5);
        
      // Text label
      legendItem.append("text")
        .attr("x", -35)
        .attr("y", 8)
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .style("font-size", "11px")
        .style("fill", "#333")
        .text(p);
    });
    
    // Add tooltip for better interactivity
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(255, 255, 255, 0.9)")
      .style("padding", "5px 10px")
      .style("border-radius", "4px")
      .style("box-shadow", "0 0 6px rgba(0, 0, 0, 0.2)")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("font-size", "12px");
      
    // Add hover effects
    pollutants.forEach(pollutant => {
      svg.selectAll(`.point-${pollutant.replace(".", "-")}`)
        .on("mouseover", function(event, d) {
          d3.select(this)
            .attr("r", 6)
            .attr("stroke-width", 2);
            
          tooltip.transition()
            .duration(200)
            .style("opacity", 1);
            
          tooltip.html(`
            <strong>${pollutant}:</strong> ${d[pollutant].toFixed(2)}<br>
            <strong>Jam:</strong> ${d.hour}:00
          `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
          d3.select(this)
            .attr("r", 4)
            .attr("stroke-width", 1.5);
            
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        });
    });
  }
});