loadData2().then(data => {
    const margin = { top: 70, right: 30, bottom: 80, left: 80 },
        width = 700,
        height = 700;

    // Daftar variabel yang akan dianalisis
    const variables = ["AQI", "Temperature", "Humidity", "WindSpeed", "PM10", "PM2_5", "NO2", "SO2", "O3"];
    
    // Normalisasi nama kolom (ubah PM2_5 menjadi PM2.5 jika perlu)
    const normalizeColumnNames = (data) => {
        return data.map(d => {
            const newD = {};
            Object.keys(d).forEach(key => {
                const newKey = key.replace(/\./g, '_'); // Ubah titik menjadi underscore
                newD[newKey] = d[key];
            });
            return newD;
        });
    };

    // Normalisasi data
    const normalizedData = normalizeColumnNames(data);
    
    // Konversi ke numerik dan bersihkan data
    normalizedData.forEach(d => {
        variables.forEach(v => {
            // Handle kemungkinan perbedaan penulisan nama kolom
            const colName = v === "PM2_5" ? "PM2_5" : v;
            d[v] = +d[colName] || 0;
            
            // Pastikan tidak ada nilai NaN atau Infinite
            if (isNaN(d[v]) || !isFinite(d[v])) {
                d[v] = 0;
            }
        });
    });

    // Fungsi korelasi Pearson yang lebih robust
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
            const values1 = normalizedData.map(d => d[var1]);
            const values2 = normalizedData.map(d => d[var2]);
            
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

    // Gambar heatmap
    drawCorrelationHeatmap(correlationMatrix, variables, width, height, margin);

    function drawCorrelationHeatmap(matrix, vars, width, height, margin) {
        const container = d3.select("#heatmaps").html("");
        
        const svg = container.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const gridSize = Math.min(width, height) / vars.length;
        
        // Skala warna diverging untuk korelasi
        const colorScale = d3.scaleDiverging(d3.interpolateRdBu)
            .domain([-1, 0, 1]);
        
        // Sumbu X
        svg.append("g")
            .selectAll(".x-label")
            .data(vars)
            .enter()
            .append("text")
            .attr("x", (d, i) => i * gridSize + gridSize / 2)
            .attr("y", -10)
            .style("font-size", "10px")
            .style("text-anchor", "middle")
            .text(d => d)
            .attr("transform", "rotate(-45)")
            .style("fill", "#555");

        // Sumbu Y
        svg.append("g")
            .selectAll(".y-label")
            .data(vars)
            .enter()
            .append("text")
            .attr("x", -15)
            .attr("y", (d, i) => i * gridSize + gridSize / 2)
            .style("font-size", "10px")
            .style("text-anchor", "end")
            .text(d => d)
            .style("fill", "#555");

        // Sel Heatmap
        svg.selectAll(".cell")
            .data(matrix)
            .enter()
            .append("rect")
            .attr("x", d => vars.indexOf(d.x) * gridSize)
            .attr("y", d => vars.indexOf(d.y) * gridSize)
            .attr("width", gridSize - 1)
            .attr("height", gridSize - 1)
            .style("fill", d => colorScale(d.value))
            .style("stroke", "#fff")
            .style("stroke-width", 0.5)
            .style("opacity", 0.8);

        // Teks nilai korelasi (hanya untuk nilai signifikan)
        svg.selectAll(".corr-value")
            .data(matrix.filter(d => Math.abs(d.value) > 0.2)) // Threshold bisa disesuaikan
            .enter()
            .append("text")
            .attr("x", d => vars.indexOf(d.x) * gridSize + gridSize / 2)
            .attr("y", d => vars.indexOf(d.y) * gridSize + gridSize / 2 + 4)
            .style("font-size", "9px")
            .style("text-anchor", "middle")
            .text(d => d.value.toFixed(2))
            .style("fill", d => Math.abs(d.value) > 0.5 ? "#fff" : "#333")
            .style("font-weight", d => Math.abs(d.value) > 0.7 ? "bold" : "normal");

        // Legend
        const legendWidth = 200;
        const legendHeight = 20;
        const legend = svg.append("g")
            .attr("transform", `translate(${width/2 - legendWidth/2},${height + 40})`);

        const legendScale = d3.scaleLinear()
            .domain([-1, 1])
            .range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendScale)
            .ticks(5);

        legend.append("g")
            .selectAll("rect")
            .data(d3.range(legendWidth))
            .enter()
            .append("rect")
            .attr("x", d => d)
            .attr("width", 1)
            .attr("height", legendHeight)
            .style("fill", d => colorScale(legendScale.invert(d)));

        legend.append("g")
            .attr("transform", `translate(0,${legendHeight})`)
            .call(legendAxis);

        legend.append("text")
            .attr("x", legendWidth / 2)
            .attr("y", legendHeight + 20)
            .style("text-anchor", "middle")
            .text("Korelasi Pearson");
    }
}).catch(error => {
    console.error("Error loading or processing data:", error);
});