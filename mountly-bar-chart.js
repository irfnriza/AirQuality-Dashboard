//untuk referensi

loadData().then(data => {
  // Responsive chart dimensions
  function getChartDimensions(containerId) {
    const container = d3.select(containerId).node();
    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = {
      top: 30,
      right: 30,
      bottom: 80,
      left: 60
    };
    
    return {
      margin,
      width: width - margin.left - margin.right,
      height: height - margin.top - margin.bottom
    };
  }

  // Define months for display
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  
  const monthsShort = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];

  // Define seasons and their corresponding months with Indonesian names
  const seasonMap = {
    "Dingin": [12, 1, 2],
    "Semi": [3, 4, 5],
    "Panas": [6, 7, 8],
    "Gugur": [9, 10, 11]
  };

  // Function to determine season based on month number
  function groupSeason(month) {
    const m = +month;
    return Object.keys(seasonMap).find(season =>
      seasonMap[season].includes(m)
    );
  }

  // New color palette
  const colorPalette = ["#e27c7c", "#a86464", "#6d4b4b", "#503f3f", "#333333"];

  // Function to create a bar chart
  function createBarChart({ containerId, labels, values, title, xAxisLabel, yAxisLabel }) {
    const container = d3.select(containerId);
    
    // Clear previous chart if any
    container.html("");
    
    const { margin, width, height } = getChartDimensions(containerId);

    // Create SVG container
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
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text(title);

    // Set up scales
    const x = d3.scaleBand()
      .domain(labels)
      .range([0, width])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(values) * 1.1]) // Add 10% padding at top
      .nice()
      .range([height, 0]);

    // Add gradient background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "#f9f9f9")
      .style("opacity", 0.5);
    
    // Add grid lines
    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#e0e0e0")
      .style("stroke-opacity", 0.7);

    // Add x-axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .call(g => g.select(".domain").style("stroke", "#999"))
      .selectAll("text")
      .style("font-size", "11px")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-35)");

    // Add y-axis
    svg.append("g")
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").style("stroke", "#999"))
      .call(g => g.selectAll(".tick text").style("font-size", "11px"));

    // Add x-axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 50)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(xAxisLabel);

    // Add y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(yAxisLabel);

    // Define gradient for bars
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "bar-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
      
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#599e94");
      
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#6cd4c5");

    // Add bars with animation
    svg.selectAll(".bar")
      .data(values)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d, i) => x(labels[i]))
      .attr("width", x.bandwidth())
      .attr("y", height) // Start from bottom for animation
      .attr("height", 0)
      .attr("rx", 3) // Rounded corners
      .attr("ry", 3)
      .attr("fill", "url(#bar-gradient)")
      .attr("stroke", "#466964")
      .attr("stroke-width", 1)
      .transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .attr("y", d => y(d))
      .attr("height", d => height - y(d));
      
    // Add data labels
    svg.selectAll(".bar-label")
      .data(values)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", (d, i) => x(labels[i]) + x.bandwidth() / 2)
      .attr("y", d => y(d) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style("opacity", 0)
      .text(d => Math.round(d))
      .transition()
      .duration(800)
      .delay((d, i) => i * 50 + 300)
      .style("opacity", 1);
      
    // Add interaction
    svg.selectAll(".bar-interactive")
      .data(values)
      .enter()
      .append("rect")
      .attr("class", "bar-interactive")
      .attr("x", (d, i) => x(labels[i]))
      .attr("width", x.bandwidth())
      .attr("y", 0)
      .attr("height", height)
      .attr("fill", "transparent")
      .on("mouseover", function(event, d, i) {
        const index = values.indexOf(d);
        
        // Highlight the bar
        svg.selectAll(".bar")
          .filter((_, i) => i === index)
          .transition()
          .duration(200)
          .attr("fill", "#e27c7c");
          
        // Enlarge the label
        svg.selectAll(".bar-label")
          .filter((_, i) => i === index)
          .transition()
          .duration(200)
          .style("font-size", "12px");
      })
      .on("mouseout", function(event, d) {
        const index = values.indexOf(d);
        
        // Restore the bar
        svg.selectAll(".bar")
          .filter((_, i) => i === index)
          .transition()
          .duration(200)
          .attr("fill", "url(#bar-gradient)");
          
        // Restore the label
        svg.selectAll(".bar-label")
          .filter((_, i) => i === index)
          .transition()
          .duration(200)
          .style("font-size", "10px");
      });
  }

  // Try to load data, but use sample data if there's an error
  d3.csv("data1.csv").then(data => {
    processData(data);
  }).catch(error => {
    console.warn("Could not load data1.csv, using sample data instead:", error);
    processData(sampleData);
  });

  // Process the data and create charts
  function processData(data) {
    // Convert string values to numbers
    data.forEach(d => {
      d.CO = +d.CO;
      d.month = +d.month;
    });

    // === Chart 1: CO per Month ===
    const coByMonth = d3.rollup(
      data,
      v => d3.mean(v, d => d.CO),
      d => d.month
    );

    const sortedMonths = Array.from(coByMonth.entries())
      .sort((a, b) => a[0] - b[0]);

    createBarChart({
      containerId: "#chart-month",
      labels: sortedMonths.map(([m]) => monthsShort[m - 1]),
      values: sortedMonths.map(([_, v]) => v),
      title: "Tingkat CO Berdasarkan Bulan",
      xAxisLabel: "Bulan",
      yAxisLabel: "Level CO"
    });

    // === Chart 2: CO per Season ===
    const dataWithSeason = data.map(d => ({
      ...d,
      season: groupSeason(d.month)
    }));

    const coBySeason = d3.rollup(
      dataWithSeason,
      v => d3.mean(v, d => d.CO),
      d => d.season
    );

    const seasonOrder = ["Dingin", "Semi", "Panas", "Gugur"];

    createBarChart({
      containerId: "#chart-season",
      labels: seasonOrder,
      values: seasonOrder.map(season => coBySeason.get(season) || 0),
      title: "Tingkat CO Berdasarkan Musim",
      xAxisLabel: "Musim",
      yAxisLabel: "Level CO"
    });
  }
  
  // Handle window resize
  window.addEventListener("resize", function() {
    d3.csv("data1.csv").then(data => {
      processData(data);
    }).catch(error => {
      console.warn("Could not load data1.csv on resize:", error);
    });
  });
});