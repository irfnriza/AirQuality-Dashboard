loadData().then(data => {
    // Tema warna baru dari referensi
    const colorTheme = {
      primary: "#6cd4c5",
      secondary: "#599e94",
      accent: "#e27c7c",
      dark: "#3c4e4b",
      darker: "#333333",
      light: "#a86464",
      background: "#f9f9f9",
      border: "#466964",
      text: "#503f3f",
      highlight: "#6d4b4b"
    };
  
    // Responsive chart dimensions
    function getChartDimensions(containerId) {
      const container = d3.select(containerId).node();
      const width = container.clientWidth || 900;
      const height = container.clientHeight || 500;
      const margin = {
        top: 40,
        right: 30,
        bottom: 100,
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
      "Musim Dingin": [12, 1, 2],
      "Musim Semi": [3, 4, 5],
      "Musim Panas": [6, 7, 8],
      "Musim Gugur": [9, 10, 11]
    };
  
    // Function to determine season based on month number
    function groupSeason(month) {
      const m = +month;
      return Object.keys(seasonMap).find(season =>
        seasonMap[season].includes(m)
      );
    }
  
    // Function to create a bar chart with enhanced styling
    function createBarChart({ containerId, labels, values, title, xAxisLabel, yAxisLabel }) {
      const container = d3.select(containerId);
      
      // Clear previous chart if any
      container.html("");
      
      const { margin, width, height } = getChartDimensions(containerId);
  
      // Create SVG container with improved styling
      const svg = container
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      // Add decorative background
      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("rx", 8)
        .attr("ry", 8)
        .style("fill", colorTheme.background)
        .style("opacity", 0.6);
        
      // Add subtle pattern overlay for texture
      const defs = svg.append("defs");
      
      // Create pattern
      const pattern = defs.append("pattern")
        .attr("id", "dots-pattern")
        .attr("width", 10)
        .attr("height", 10)
        .attr("patternUnits", "userSpaceOnUse")
        .attr("patternTransform", "rotate(45)");
        
      pattern.append("circle")
        .attr("cx", 2)
        .attr("cy", 2)
        .attr("r", 1)
        .attr("fill", colorTheme.secondary)
        .attr("opacity", 0.3);
        
      // Apply pattern to background
      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "url(#dots-pattern)")
        .attr("opacity", 0.3);
  
      // Add title with enhanced styling
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", colorTheme.dark)
        .text(title);
  
      // Set up scales
      const x = d3.scaleBand()
        .domain(labels)
        .range([0, width])
        .padding(0.4);
  
      const y = d3.scaleLinear()
        .domain([0, d3.max(values) * 1.15]) // Add 15% padding at top
        .nice()
        .range([height, 0]);
      
      // Add grid lines with improved styling
      svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
          .tickSize(-width)
          .tickFormat("")
        )
        .selectAll("line")
        .style("stroke", colorTheme.secondary)
        .style("stroke-opacity", 0.2)
        .style("stroke-dasharray", "3,3");
        
      svg.selectAll(".grid .domain").remove(); // Remove axis line
  
      // Add x-axis with improved styling
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .call(g => g.select(".domain").style("stroke", colorTheme.border))
        .selectAll("text")
        .style("font-size", "12px")
        .style("fill", colorTheme.text)
        .style("font-weight", "bold")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-40)");
  
      // Add y-axis with improved styling
      svg.append("g")
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").style("stroke", colorTheme.border))
        .call(g => g.selectAll(".tick text")
          .style("font-size", "12px")
          .style("fill", colorTheme.text));
  
      // Add x-axis label with improved styling
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 55)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", colorTheme.dark)
        .text(xAxisLabel);
  
      // Add y-axis label with improved styling
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", colorTheme.dark)
        .text(yAxisLabel);
  
      // Define multiple gradients for alternating bars
      const gradients = [
        { id: "bar-gradient-1", colors: [colorTheme.primary, colorTheme.secondary] },
        { id: "bar-gradient-2", colors: [colorTheme.accent, colorTheme.light] }
      ];
      
      gradients.forEach((grad, i) => {
        const gradient = defs.append("linearGradient")
          .attr("id", grad.id)
          .attr("x1", "0%")
          .attr("y1", "0%")
          .attr("x2", "0%")
          .attr("y2", "100%");
          
        gradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", grad.colors[0]);
          
        gradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", grad.colors[1]);
      });
  
      // Add bars with improved animation and styling
      svg.selectAll(".bar")
        .data(values)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d, i) => x(labels[i]))
        .attr("width", x.bandwidth())
        .attr("y", height) // Start from bottom for animation
        .attr("height", 0)
        .attr("rx", 5) // More pronounced rounded corners
        .attr("ry", 5)
        .attr("fill", (d, i) => `url(#bar-gradient-${i % 2 + 1})`) // Alternate gradients
        .attr("stroke", colorTheme.border)
        .attr("stroke-width", 1.5)
        .attr("filter", "drop-shadow(0px 3px 3px rgba(0,0,0,0.2))") // Add shadow
        .transition()
        .duration(1000)
        .delay((d, i) => i * 100)
        .ease(d3.easeBounceOut) // Bouncy animation
        .attr("y", d => y(d))
        .attr("height", d => height - y(d));
        
      // Add data labels with improved styling
      svg.selectAll(".bar-label")
        .data(values)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", (d, i) => x(labels[i]) + x.bandwidth() / 2)
        .attr("y", d => y(d) - 8)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", colorTheme.dark)
        .style("opacity", 0)
        .text(d => d.toFixed(1)) // One decimal place
        .transition()
        .duration(800)
        .delay((d, i) => i * 100 + 500)
        .style("opacity", 1);
        
      // Add enhanced interaction effects
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
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
          const index = values.indexOf(d);
          
          // Enhanced highlight effect
          svg.selectAll(".bar")
            .filter((_, i) => i === index)
            .transition()
            .duration(200)
            .attr("fill", colorTheme.accent)
            .attr("stroke", colorTheme.light)
            .attr("stroke-width", 2.5)
            .attr("filter", "drop-shadow(0px 6px 8px rgba(0,0,0,0.3))");
            
          // Enhance the label
          svg.selectAll(".bar-label")
            .filter((_, i) => i === index)
            .transition()
            .duration(200)
            .style("font-size", "14px")
            .style("fill", colorTheme.light);
            
          // Add tooltip for more info
          svg.append("rect")
            .attr("class", "tooltip-bg")
            .attr("x", x(labels[index]) + x.bandwidth() / 2 - 50)
            .attr("y", y(d) - 40)
            .attr("width", 100)
            .attr("height", 25)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("fill", colorTheme.dark)
            .attr("opacity", 0.9);
            
          svg.append("text")
            .attr("class", "tooltip-text")
            .attr("x", x(labels[index]) + x.bandwidth() / 2)
            .attr("y", y(d) - 25)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .style("font-size", "11px")
            .style("font-weight", "bold")
            .text(`Nilai: ${d.toFixed(2)}`);
        })
        .on("mouseout", function(event, d) {
          const index = values.indexOf(d);
          
          // Restore the bar
          svg.selectAll(".bar")
            .filter((_, i) => i === index)
            .transition()
            .duration(200)
            .attr("fill", `url(#bar-gradient-${index % 2 + 1})`) 
            .attr("stroke", colorTheme.border)
            .attr("stroke-width", 1.5)
            .attr("filter", "drop-shadow(0px 3px 3px rgba(0,0,0,0.2))");
            
          // Restore the label
          svg.selectAll(".bar-label")
            .filter((_, i) => i === index)
            .transition()
            .duration(200)
            .style("font-size", "12px")
            .style("fill", colorTheme.dark);
            
          // Remove tooltip
          svg.selectAll(".tooltip-bg, .tooltip-text").remove();
        })
        .on("click", function(event, d) {
          // Optional click effect for interaction
          const index = values.indexOf(d);
          
          // Create ripple effect
          const x0 = x(labels[index]) + x.bandwidth() / 2;
          const y0 = y(d) + (height - y(d)) / 2;
          
          const ripple = svg.append("circle")
            .attr("cx", x0)
            .attr("cy", y0)
            .attr("r", 0)
            .attr("fill", "none")
            .attr("stroke", colorTheme.accent)
            .attr("stroke-width", 3)
            .attr("opacity", 1);
            
          ripple.transition()
            .duration(600)
            .attr("r", 50)
            .attr("opacity", 0)
            .on("end", function() {
              ripple.remove();
            });
        });
        
      // Add watermark signature
      svg.append("text")
        .attr("x", width - 5)
        .attr("y", height - 5)
        .attr("text-anchor", "end")
        .style("font-size", "10px")
        .style("fill", colorTheme.secondary)
        .style("opacity", 0.7)
        .text("Data Visualization");
    }
  
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
  
      const seasonOrder = ["Musim Dingin", "Musim Semi", "Musim Panas", "Musim Gugur"];
  
      createBarChart({
        containerId: "#chart-season",
        labels: seasonOrder,
        values: seasonOrder.map(season => coBySeason.get(season) || 0),
        title: "Tingkat CO Berdasarkan Musim",
        yAxisLabel: "Level CO",
        xAxisLabel: "Musim"
      });
    }
    
    // Try to load data with error handling
    function loadChartData() {
      d3.csv("data1.csv").then(data => {
        processData(data);
      }).catch(error => {
        console.warn("Could not load data1.csv, using sample data instead:", error);
        
        // Create sample data if CSV fails to load
        const sampleData = [];
        for (let month = 1; month <= 12; month++) {
          sampleData.push({
            month: month,
            CO: Math.random() * 30 + 10
          });
        }
        
        processData(sampleData);
      });
    }
    
    // Initialize charts
    loadChartData();
    
    // Handle window resize with debounce for performance
    let resizeTimer;
    window.addEventListener("resize", function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        loadChartData();
      }, 250);
    });
    
    // Create grouped bar chart for pollutants
    function createGroupedBarChart(containerId) {
      const container = d3.select(containerId);
      container.html("");
      
      const { margin, width, height } = getChartDimensions(containerId);
      
      const svg = container
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      // Add decorative background
      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("rx", 8)
        .attr("ry", 8)
        .style("fill", colorTheme.background)
        .style("opacity", 0.6);
      
      // Add title
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", colorTheme.dark)
        .text("Tingkat Polutan Berdasarkan Stasiun");
      
      // Load data
      d3.csv("data1.csv").then(data => {
        const pollutants = ["PM2.5", "PM10", "SO2", "NO2", "O3"];
        
        // Convert to numeric
        data.forEach(d => {
          pollutants.forEach(p => d[p] = +d[p]);
        });
        
        // Rata-rata per station jika ada duplikasi
        const grouped = d3.groups(data, d => d.station).map(([station, records]) => {
          const avg = { station };
          pollutants.forEach(p => {
            avg[p] = d3.mean(records, r => r[p]);
          });
          return avg;
        });
        
        // Create color scale from theme
        const colorScale = d3.scaleOrdinal()
          .domain(pollutants)
          .range([
            colorTheme.primary,
            colorTheme.secondary,
            colorTheme.accent,
            colorTheme.light,
            colorTheme.highlight
          ]);
        
        const x0 = d3.scaleBand()
          .domain(grouped.map(d => d.station))
          .range([0, width])
          .paddingInner(0.2);
        
        const x1 = d3.scaleBand()
          .domain(pollutants)
          .range([0, x0.bandwidth()])
          .padding(0.1);
        
        const y = d3.scaleLinear()
          .domain([0, d3.max(grouped, d => d3.max(pollutants, p => d[p])) * 1.1])
          .nice()
          .range([height, 0]);
        
        // Add grid lines
        svg.append("g")
          .attr("class", "grid")
          .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat("")
          )
          .selectAll("line")
          .style("stroke", colorTheme.secondary)
          .style("stroke-opacity", 0.2)
          .style("stroke-dasharray", "3,3");
        
        svg.selectAll(".grid .domain").remove();
        
        // Add x-axis
        svg.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x0))
          .call(g => g.select(".domain").style("stroke", colorTheme.border))
          .selectAll("text")
          .style("font-size", "12px")
          .style("fill", colorTheme.text)
          .style("font-weight", "bold")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-40)");
        
        // Add y-axis
        svg.append("g")
          .call(d3.axisLeft(y))
          .call(g => g.select(".domain").style("stroke", colorTheme.border))
          .call(g => g.selectAll(".tick text")
            .style("font-size", "12px")
            .style("fill", colorTheme.text));
        
        // Add axis labels
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", height + 60)
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
          .style("font-weight", "bold")
          .style("fill", colorTheme.dark)
          .text("Stasiun Pemantauan");
        
        svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -margin.left + 15)
          .attr("x", -height / 2)
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
          .style("font-weight", "bold")
          .style("fill", colorTheme.dark)
          .text("Tingkat Polutan");
        
        // Add drop shadows for groups
        const defs = svg.append("defs");
        defs.append("filter")
          .attr("id", "drop-shadow")
          .attr("height", "130%")
          .append("feDropShadow")
          .attr("dx", 0)
          .attr("dy", 4)
          .attr("stdDeviation", 4)
          .attr("flood-color", "rgba(0, 0, 0, 0.3)");
        
        // Add bars with animation
        const stationGroups = svg.selectAll("g.station")
          .data(grouped)
          .enter()
          .append("g")
          .attr("class", "station")
          .attr("transform", d => `translate(${x0(d.station)},0)`);
        
        stationGroups.selectAll("rect")
          .data(d => pollutants.map(p => ({ pollutant: p, value: d[p] })))
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("x", d => x1(d.pollutant))
          .attr("y", height) // Start from bottom
          .attr("width", x1.bandwidth())
          .attr("height", 0)
          .attr("rx", 3)
          .attr("ry", 3)
          .attr("fill", d => colorScale(d.pollutant))
          .attr("stroke", d => d3.color(colorScale(d.pollutant)).darker(0.5))
          .attr("stroke-width", 1)
          .attr("filter", "url(#drop-shadow)")
          .transition()
          .duration(1000)
          .delay((d, i, nodes) => {
            const parentIndex = d3.select(nodes[i].parentNode).datum().station;
            const stationIndex = grouped.findIndex(g => g.station === parentIndex);
            return stationIndex * 200 + i * 50;
          })
          .attr("y", d => y(d.value))
          .attr("height", d => height - y(d.value));
        
        // Add data labels
        stationGroups.selectAll("text")
          .data(d => pollutants.map(p => ({ pollutant: p, value: d[p] })))
          .enter()
          .append("text")
          .attr("x", d => x1(d.pollutant) + x1.bandwidth() / 2)
          .attr("y", d => y(d.value) - 5)
          .attr("text-anchor", "middle")
          .style("font-size", "9px")
          .style("font-weight", "bold")
          .style("fill", d => d3.color(colorScale(d.pollutant)).darker(2))
          .style("opacity", 0)
          .text(d => d.value.toFixed(1))
          .transition()
          .duration(500)
          .delay((d, i, nodes) => {
            const parentIndex = d3.select(nodes[i].parentNode).datum().station;
            const stationIndex = grouped.findIndex(g => g.station === parentIndex);
            return stationIndex * 200 + i * 50 + 500;
          })
          .style("opacity", 1);
        
        // Add enhanced legend
        const legend = svg.append("g")
          .attr("class", "legend")
          .attr("transform", `translate(${width + 20}, 0)`);
        
        // Add legend title
        legend.append("text")
          .attr("x", 0)
          .attr("y", 0)
          .style("font-size", "14px")
          .style("font-weight", "bold")
          .style("fill", colorTheme.dark)
          .text("Polutan");
        
        // Add legend items with enhanced styling
        pollutants.forEach((pollutant, i) => {
          const legendItem = legend.append("g")
            .attr("transform", `translate(0, ${i * 25 + 20})`)
            .style("cursor", "pointer")
            .on("mouseover", function() {
              // Highlight related bars
              svg.selectAll(".bar")
                .filter(d => d.pollutant === pollutant)
                .transition()
                .duration(200)
                .attr("fill", d3.color(colorScale(pollutant)).brighter(0.5))
                .attr("stroke-width", 2);
                
              d3.select(this).select("rect")
                .transition()
                .duration(200)
                .attr("stroke-width", 2)
                .attr("width", 20)
                .attr("height", 20)
                .attr("x", -2.5)
                .attr("y", -2.5);
            })
            .on("mouseout", function() {
              // Restore bars
              svg.selectAll(".bar")
                .filter(d => d.pollutant === pollutant)
                .transition()
                .duration(200)
                .attr("fill", colorScale(pollutant))
                .attr("stroke-width", 1);
                
              d3.select(this).select("rect")
                .transition()
                .duration(200)
                .attr("stroke-width", 1)
                .attr("width", 15)
                .attr("height", 15)
                .attr("x", 0)
                .attr("y", 0);
            });
          
          // Add colored box
          legendItem.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("fill", colorScale(pollutant))
            .attr("stroke", d3.color(colorScale(pollutant)).darker(0.5))
            .attr("stroke-width", 1);
          
          // Add text label
          legendItem.append("text")
            .attr("x", 25)
            .attr("y", 12)
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("fill", colorTheme.text)
            .text(pollutant);
        });
      }).catch(error => {
        console.warn("Could not load data1.csv for grouped chart:", error);
        // Display error message in chart area
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
          .style("fill", colorTheme.accent)
          .text("Data tidak dapat dimuat");
      });
    }
    
    // Initialize the grouped chart if needed
    if (document.querySelector("#chart")) {
      createGroupedBarChart("#chart");
    }
  });