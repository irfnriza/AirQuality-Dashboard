loadData().then(data => {
    // Tema warna yang sama dengan kode sebelumnya
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
  
    const margin = { top: 40, right: 50, bottom: 60, left: 60 },
        width = 570 - margin.left - margin.right,
        height = 390 - margin.top - margin.bottom;
  
    const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
    const workdays = new Set(["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]);
    const weekend = new Set(["Sabtu", "Minggu"]);
  
    // Fungsi bantu: tentukan hari dari year, month, day
    function getDayNameFromParts(y, m, d) {
      const date = new Date(y, m - 1, d); // JS: bulan dimulai dari 0
      const jsDay = date.getDay();       // JS: Minggu=0, Senin=1,...
      return days[jsDay === 0 ? 6 : jsDay - 1]; // Konversi agar Senin=0
    }
  
    function createLineChart(containerId, labels, values, title, xAxisLabel, yAxisLabel) {
      const container = d3.select(containerId);
      
      // Clear previous chart if any
      container.html("");
      
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
        .attr("id", "dots-pattern-line")
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
        .attr("fill", "url(#dots-pattern-line)")
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
  
      const x = d3.scalePoint()
        .domain(labels)
        .range([0, width])
        .padding(0.2);
  
      const y = d3.scaleLinear()
        .domain([0, d3.max(values) * 1.15]) // 15% padding on top
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
        .style("font-weight", "bold");
  
      // Add y-axis with improved styling
      svg.append("g")
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").style("stroke", colorTheme.border))
        .call(g => g.selectAll(".tick text")
          .style("font-size", "12px")
          .style("fill", colorTheme.text));
          
      // Add x-axis label
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", colorTheme.dark)
        .text(xAxisLabel);
  
      // Add y-axis label
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", colorTheme.dark)
        .text(yAxisLabel);
  
      // Define gradient for line
      const lineGradient = defs.append("linearGradient")
        .attr("id", "line-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0)
        .attr("y1", y(d3.min(values)))
        .attr("x2", 0)
        .attr("y2", y(d3.max(values)));
        
      lineGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colorTheme.secondary);
        
      lineGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorTheme.accent);
        
      // Define drop shadow filter
      const filter = defs.append("filter")
        .attr("id", "drop-shadow-line")
        .attr("height", "130%");
      
      filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 3)
        .attr("result", "blur");
        
      filter.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 2)
        .attr("dy", 2)
        .attr("result", "offsetBlur");
        
      const feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "offsetBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");
  
      // Create area under line
      const area = d3.area()
        .x((d, i) => x(labels[i]))
        .y0(height)
        .y1(d => y(d))
        .curve(d3.curveCardinal);
        
      svg.append("path")
        .datum(values)
        .attr("fill", "url(#line-gradient)")
        .attr("fill-opacity", 0.2)
        .attr("d", area);
        
      // Create line with animation
      const line = d3.line()
        .x((d, i) => x(labels[i]))
        .y(d => y(d))
        .curve(d3.curveCardinal); // Make the line smoother
        
      const path = svg.append("path")
        .datum(values)
        .attr("fill", "none")
        .attr("stroke", "url(#line-gradient)")
        .attr("stroke-width", 4)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("filter", "url(#drop-shadow-line)")
        .attr("d", line);
        
      // Animate the line
      const totalLength = path.node().getTotalLength();
      path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1500)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
        
      // Add dots at data points
      svg.selectAll(".dot")
        .data(values)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", (d, i) => x(labels[i]))
        .attr("cy", d => y(d))
        .attr("r", 0) // Start with radius 0 for animation
        .attr("fill", "white")
        .attr("stroke", colorTheme.accent)
        .attr("stroke-width", 2)
        .attr("filter", "url(#drop-shadow-line)")
        .transition()
        .delay((d, i) => 1500 + i * 150)
        .duration(300)
        .attr("r", 6);
        
      // Add data labels
      svg.selectAll(".data-label")
        .data(values)
        .enter()
        .append("text")
        .attr("class", "data-label")
        .attr("x", (d, i) => x(labels[i]))
        .attr("y", d => y(d) - 15)
        .attr("text-anchor", "middle")
        .style("font-size", "0px") // Start with size 0 for animation
        .style("font-weight", "bold")
        .style("fill", colorTheme.dark)
        .text(d => d.toFixed(1))
        .transition()
        .delay((d, i) => 1800 + i * 150)
        .duration(300)
        .style("font-size", "12px");
        
      // Add interaction
      const focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");
        
      focus.append("circle")
        .attr("r", 8)
        .attr("fill", "white")
        .attr("stroke", colorTheme.accent)
        .attr("stroke-width", 3);
        
      focus.append("rect")
        .attr("class", "tooltip")
        .attr("width", 80)
        .attr("height", 40)
        .attr("fill", colorTheme.dark)
        .attr("opacity", 0.9)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("x", -40)
        .attr("y", -55);
        
      focus.append("text")
        .attr("class", "tooltip-date")
        .attr("x", 0)
        .attr("y", -35)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .style("font-size", "12px")
        .style("font-weight", "bold");
        
      focus.append("text")
        .attr("class", "tooltip-value")
        .attr("x", 0)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .style("font-size", "12px")
        .style("font-weight", "bold");
        
      const overlay = svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all");
        
      overlay.on("mouseover", () => focus.style("display", null))
        .on("mouseout", () => focus.style("display", "none"))
        .on("mousemove", mousemove);
        
      function mousemove(event) {
        const bisect = d3.bisector((d, x) => x).left;
        const xPos = d3.pointer(event)[0];
        const x0 = bisect(labels.map(l => x(l)), xPos);
        const i = x0 < labels.length ? x0 : labels.length - 1;
        
        focus.attr("transform", `translate(${x(labels[i])}, ${y(values[i])})`);
        focus.select(".tooltip-date").text(labels[i]);
        focus.select(".tooltip-value").text(`CO: ${values[i].toFixed(2)}`);
      }
      
      // Add watermark
      svg.append("text")
        .attr("x", width - 5)
        .attr("y", height - 5)
        .attr("text-anchor", "end")
        .style("font-size", "10px")
        .style("fill", colorTheme.secondary)
        .style("opacity", 0.7)
        .text("Data Visualization");
    }
  
    function createBarChart(containerId, labels, values, title, xAxisLabel, yAxisLabel) {
      const container = d3.select(containerId);
      
      // Clear previous chart if any
      container.html("");
      
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
        .attr("id", "dots-pattern-bar")
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
        .attr("fill", "url(#dots-pattern-bar)")
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
  
      const x = d3.scaleBand()
        .domain(labels)
        .range([0, width])
        .padding(0.4);
  
      const y = d3.scaleLinear()
        .domain([0, d3.max(values) * 1.15]) // 15% padding on top
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
        .style("font-weight", "bold");
  
      // Add y-axis with improved styling
      svg.append("g")
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").style("stroke", colorTheme.border))
        .call(g => g.selectAll(".tick text")
          .style("font-size", "12px")
          .style("fill", colorTheme.text));
  
      // Add x-axis label
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", colorTheme.dark)
        .text(xAxisLabel);
  
      // Add y-axis label
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
      
      // Add drop shadow filter
      const filter = defs.append("filter")
        .attr("id", "drop-shadow-bar")
        .attr("height", "130%");
      
      filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 3)
        .attr("result", "blur");
        
      filter.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 2)
        .attr("dy", 2)
        .attr("result", "offsetBlur");
        
      const feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "offsetBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");
  
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
        .attr("rx", 5) // Rounded corners
        .attr("ry", 5)
        .attr("fill", (d, i) => `url(#bar-gradient-${i % 2 + 1})`) // Alternate gradients
        .attr("stroke", colorTheme.border)
        .attr("stroke-width", 1.5)
        .attr("filter", "url(#drop-shadow-bar)")
        .transition()
        .duration(1000)
        .delay((d, i) => i * 300)
        .ease(d3.easeBounceOut) // Bouncy animation
        .attr("y", d => y(d))
        .attr("height", d => height - y(d));
        
      // Add data labels
      svg.selectAll(".bar-label")
        .data(values)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", (d, i) => x(labels[i]) + x.bandwidth() / 2)
        .attr("y", d => y(d) - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "0px") // Start with size 0 for animation
        .style("font-weight", "bold")
        .style("fill", colorTheme.dark)
        .text(d => d.toFixed(1))
        .transition()
        .duration(800)
        .delay((d, i) => i * 300 + 500)
        .style("font-size", "14px");
        
      // Add bar interaction
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
            .attr("filter", "url(#drop-shadow-bar)");
            
          // Enhance the label
          svg.selectAll(".bar-label")
            .filter((_, i) => i === index)
            .transition()
            .duration(200)
            .style("font-size", "16px")
            .style("fill", colorTheme.light);
            
          // Add tooltip for more info
          svg.append("rect")
          .attr("class", "tooltip-bg")
          .attr("x", x(labels[index]) + x.bandwidth() / 2 - 60)
          .attr("y", y(d) - 50)
          .attr("width", 120)  // Perlebar width untuk menampung teks lebih panjang
          .attr("height", 30)
          .attr("rx", 5)
          .attr("ry", 5)
          .attr("fill", colorTheme.dark)
          .attr("opacity", 0.9);
            
          svg.append("text")
            .attr("class", "tooltip-text")
            .attr("x", x(labels[index]) + x.bandwidth() / 2)
            .attr("y", y(d) - 30)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text(`CO: ${d.toFixed(2)}`);
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
            .attr("stroke-width", 1.5);
            
          // Restore the label
          svg.selectAll(".bar-label")
            .filter((_, i) => i === index)
            .transition()
            .duration(200)
            .style("font-size", "14px")
            .style("fill", colorTheme.dark);
            
          // Remove tooltip
          svg.selectAll(".tooltip-bg, .tooltip-text").remove();
        });
        
      // Add watermark
      svg.append("text")
        .attr("x", width - 5)
        .attr("y", height - 5)
        .attr("text-anchor", "end")
        .style("font-size", "10px")
        .style("fill", colorTheme.secondary)
        .style("opacity", 0.7)
        .text("Data Visualization");
    }
  
    // Load data and create charts
    d3.csv("data1.csv").then(data => {
      data.forEach(d => {
        d.year = +d.year;
        d.month = +d.month;
        d.day = +d.day;
        d.CO = +d.CO;
  
        d.dayName = getDayNameFromParts(d.year, d.month, d.day);
      });
  
      // === Diagram 1: CO per Hari (Senin–Minggu) ===
      const groupedDays = d3.rollup(data, v => d3.mean(v, d => d.CO), d => d.dayName);
      const weekdayValues = days.map(day => groupedDays.get(day) || 0);
  
      createLineChart(
        "#chart-weekday", 
        days, 
        weekdayValues, 
        "Tingkat CO Berdasarkan Hari", 
        "Hari", 
        "Level CO"
      );
  
      // === Diagram 2: CO Hari Kerja vs Akhir Pekan ===
      const groupedType = {
        "Hari Kerja": d3.mean(data.filter(d => workdays.has(d.dayName)), d => d.CO),
        "Akhir Pekan": d3.mean(data.filter(d => weekend.has(d.dayName)), d => d.CO),
      };
  
      createBarChart(
        "#chart-workweekend", 
        ["Hari Kerja", "Akhir Pekan"], 
        [groupedType["Hari Kerja"], groupedType["Akhir Pekan"]],
        "Perbandingan CO: Hari Kerja vs Akhir Pekan",
        "Tipe Hari",
        "Level CO"
      );
    }).catch(error => {
      console.warn("Could not load data1.csv, using sample data instead:", error);
      
      // Create sample data if CSV fails to load
      const sampleData = [];
      for (let day = 0; day < 7; day++) {
        sampleData.push({
          dayName: days[day],
          CO: Math.random() * 30 + 10
        });
      }
      
      const weekdayValues = days.map(day => {
        const record = sampleData.find(d => d.dayName === day);
        return record ? record.CO : 0;
      });
      
      createLineChart(
        "#chart-weekday", 
        days, 
        weekdayValues, 
        "Tingkat CO Berdasarkan Hari (Data Sampel)", 
        "Hari", 
        "Level CO"
      );
      
      const workdayAvg = d3.mean(sampleData.filter(d => workdays.has(d.dayName)), d => d.CO);
      const weekendAvg = d3.mean(sampleData.filter(d => weekend.has(d.dayName)), d => d.CO);
      
      createBarChart(
        "#chart-workweekend", 
        ["Hari Kerja", "Akhir Pekan"], 
        [workdayAvg, weekendAvg],
        "Perbandingan CO: Hari Kerja vs Akhir Pekan (Data Sampel)",
        "Tipe Hari",
        "Level CO"
      );
    });
    
    // Handle window resize with debounce for performance
    let resizeTimer;
    window.addEventListener("resize", function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        // Reload charts on resize
        d3.csv("data1.csv").then(data => {
          data.forEach(d => {
            d.year = +d.year;
            d.month = +d.month;
            d.day = +d.day;
            d.CO = +d.CO;
            d.dayName = getDayNameFromParts(d.year, d.month, d.day);
          });
      
          const groupedDays = d3.rollup(data, v => d3.mean(v, d => d.CO), d => d.dayName);
          const weekdayValues = days.map(day => groupedDays.get(day) || 0);
      
          createLineChart(
            "#chart-weekday", 
            days, 
            weekdayValues, 
            "Tingkat CO Berdasarkan Hari", 
            "Hari", 
            "Level CO"
          );
      
          const groupedType = {
            "Hari Kerja": d3.mean(data.filter(d => workdays.has(d.dayName)), d => d.CO),
            "Akhir Pekan": d3.mean(data.filter(d => weekend.has(d.dayName)), d => d.CO),
          };
      
          createBarChart(
            "#chart-workweekend", 
            ["Hari Kerja", "Akhir Pekan"], 
            [groupedType["Hari Kerja"], groupedType["Akhir Pekan"]],
            "Perbandingan CO: Hari Kerja vs Akhir Pekan",
            "Tipe Hari",
            "Level CO"
          );
        }).catch(error => {
          console.warn("Could not reload data1.csv on resize:", error);
        });
      }, 250);
    });
  })