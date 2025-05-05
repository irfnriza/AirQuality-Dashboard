loadData().then(data => {
    // Ukuran yang disesuaikan untuk diagram
    const margin = { top: 10, right: 100, bottom: 70, left: 100 },
        width = 320,
        height = 320;

    // Daftar variabel yang akan dianalisis
    const variables = ["PM2.5", "PM10", "NO2", "SO2", "O3", "CO", "PRES", "DEWP", "TEMP", "RAIN", "WSPM"];
    
    // Konversi ke numerik dan bersihkan data
    data.forEach(d => {
        variables.forEach(v => {
            d[v] = +d[v] || 0;
            
            // Pastikan tidak ada nilai NaN atau Infinite
            if (isNaN(d[v]) || !isFinite(d[v])) {
                d[v] = 0;
            }
        });
    });

    // Fungsi korelasi Pearson
    function pearsonCorrelation(x, y) {
        const n = x.length;
        if (n !== y.length || n === 0) return 0;
        
        const meanX = d3.mean(x);
        const meanY = d3.mean(y);
        
        let numerator = 0;
        let denomX = 0;
        let denomY = 0;
        
        for (let i = 0; i < n; i++) {
            const xDiff = x[i] - meanX;
            const yDiff = y[i] - meanY;
            numerator += xDiff * yDiff;
            denomX += xDiff * xDiff;
            denomY += yDiff * yDiff;
        }
        
        const denominator = Math.sqrt(denomX * denomY);
        return denominator === 0 ? 0 : numerator / denominator;
    }

    // Hitung matriks korelasi
    const correlationMatrix = [];
    variables.forEach(var1 => {
        variables.forEach(var2 => {
            const values1 = data.map(d => d[var1]);
            const values2 = data.map(d => d[var2]);
            
            // Filter nilai yang valid
            const cleanPairs = values1.map((v1, i) => ({v1, v2: values2[i]}))
                .filter(d => !isNaN(d.v1) && !isNaN(d.v2) && isFinite(d.v1) && isFinite(d.v2));
            
            const cleanX = cleanPairs.map(d => d.v1);
            const cleanY = cleanPairs.map(d => d.v2);
            
            const corr = pearsonCorrelation(cleanX, cleanY);
            correlationMatrix.push({
                x: var1,
                y: var2,
                value: corr,
                absValue: Math.abs(corr)
            });
        });
    });

    // Gambar heatmap tanpa card tambahan
    drawCorrelationHeatmap(correlationMatrix, variables, width, height, margin);

    function drawCorrelationHeatmap(matrix, vars, width, height, margin) {
        // Bersihkan container terlebih dahulu
        d3.select("#heatmaps").html("");
        
        // Buat SVG langsung tanpa card container
        const svg = d3.select("#heatmaps")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const gridSize = Math.min(width, height) / vars.length;
        
        // Palette warna baru dengan 7 warna
        const customColors = ["#76c8c8", "#98d1d1", "#badbdb", "#dedad2", "#e4bcad", "#df979e", "#d7658b"];
        
        // Buat color scale dari palet kustom dengan interpolasi
        const colorScale = d3.scaleSequential()
            .domain([-1, 1])
            .interpolator(d3.interpolateRgbBasis(customColors));
        
        // Label Y (sebelah kiri)
        svg.append("g")
            .selectAll(".y-label")
            .data(vars)
            .enter()
            .append("text")
            .attr("class", "y-label")
            .attr("x", -10)
            .attr("y", (d, i) => i * gridSize + gridSize / 2)
            .style("font-size", "10px")
            .style("text-anchor", "end")
            .style("alignment-baseline", "middle")
            .style("fill", "#555")
            .text(d => d);

        // Label X (di bawah, vertikal)
        svg.append("g")
            .selectAll(".x-label")
            .data(vars)
            .enter()
            .append("text")
            .attr("class", "x-label")
            .attr("x", (d, i) => i * gridSize + gridSize / 2)
            .attr("y", vars.length * gridSize + 20)
            .style("font-size", "10px")
            .style("text-anchor", "start")
            .style("alignment-baseline", "middle")
            .attr("transform", (d, i) => `rotate(90, ${i * gridSize + gridSize / 2}, ${vars.length * gridSize + 20})`)
            .style("fill", "#555")
            .text(d => d);

        // Sel Heatmap dengan hover effect
        const cells = svg.selectAll(".cell")
            .data(matrix)
            .enter()
            .append("rect")
            .attr("class", "cell")
            .attr("x", d => vars.indexOf(d.x) * gridSize)
            .attr("y", d => vars.indexOf(d.y) * gridSize)
            .attr("width", gridSize - 1)
            .attr("height", gridSize - 1)
            .style("fill", d => colorScale(d.value))
            .style("stroke", "#fff")
            .style("stroke-width", 0.5)
            .style("opacity", 1)
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .style("stroke", "#333")
                    .style("stroke-width", 1.5);
                
                // Tampilkan tooltip
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                    
                tooltip.html(`
                    <strong>${d.x} vs ${d.y}</strong><br>
                    Korelasi: ${d.value.toFixed(3)}
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .style("stroke", "#fff")
                    .style("stroke-width", 0.5);
                    
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Teks nilai korelasi (tampilkan semua nilai)
        svg.selectAll(".corr-value")
            .data(matrix)
            .enter()
            .append("text")
            .attr("class", "corr-value")
            .attr("x", d => vars.indexOf(d.x) * gridSize + gridSize / 2)
            .attr("y", d => vars.indexOf(d.y) * gridSize + gridSize / 2 + 3)
            .style("font-size", "8px")
            .style("text-anchor", "middle")
            .style("pointer-events", "none")
            .text(d => d.value.toFixed(2))
            .style("fill", d => {
                // Pilih warna teks yang kontras dengan background
                const bgColor = colorScale(d.value);
                // Cek kecerahan warna background
                const r = parseInt(bgColor.slice(1, 3), 16);
                const g = parseInt(bgColor.slice(3, 5), 16);
                const b = parseInt(bgColor.slice(5, 7), 16);
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                return brightness > 128 ? "#000" : "#fff";
            })
            .style("font-weight", "normal");

        // Legend vertikal di sebelah kanan
        const legendWidth = 20;
        const legendHeight = 200;
        const legendX = width + 20;
        const legendY = (height - legendHeight) / 2;
        
        const legend = svg.append("g")
            .attr("transform", `translate(${legendX}, ${legendY})`);

        // Buat gradient untuk legend
        const defs = svg.append("defs");
        const linearGradient = defs.append("linearGradient")
            .attr("id", "correlation-gradient")
            .attr("x1", "0%")
            .attr("y1", "100%")  // Mulai dari bawah (nilai -1)
            .attr("x2", "0%")
            .attr("y2", "0%");   // Ke atas (nilai 1)
            
        // Tambahkan color stops untuk gradient
        const gradientStops = [
            { offset: "0%", value: -1 },
            { offset: "16.67%", value: -0.666 },
            { offset: "33.33%", value: -0.333 },
            { offset: "50%", value: 0 },
            { offset: "66.67%", value: 0.333 },
            { offset: "83.33%", value: 0.666 },
            { offset: "100%", value: 1 }
        ];
        
        gradientStops.forEach(stop => {
            linearGradient.append("stop")
                .attr("offset", stop.offset)
                .attr("stop-color", colorScale(stop.value));
        });
        
        // Tambahkan rectangle gradient untuk legend
        legend.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#correlation-gradient)");
            
        // Axis untuk legend
        const legendScale = d3.scaleLinear()
            .domain([-1, 1])
            .range([legendHeight, 0]);
            
        const legendAxis = d3.axisRight(legendScale)
            .ticks(5)
            .tickFormat(d3.format(".1f"));
            
        legend.append("g")
            .attr("transform", `translate(${legendWidth}, 0)`)
            .call(legendAxis);
            

        // Tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("padding", "8px 12px")
            .style("background", "#fff")
            .style("border", "1px solid #e0e0e0")
            .style("border-radius", "4px")
            .style("box-shadow", "0px 2px 6px rgba(0,0,0,0.2)")
            .style("pointer-events", "none")
            .style("font-size", "12px")
            .style("z-index", 1000);
            
        // Tambahkan judul heatmap
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -30)
            .style("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text("Matriks Korelasi Polutan");
    }
}).catch(error => {
    console.error("Error loading or processing data:", error);
});