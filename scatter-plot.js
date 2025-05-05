function loadData2() {
    return new Promise((resolve, reject) => {
        d3.csv("data2.csv").then(data => {
            data.forEach(d => {
                d.HealthImpactScore = +d.HealthImpactScore;
                d.CardiovascularCases = +d.CardiovascularCases;
                d.RespiratoryCases = +d.RespiratoryCases;
            });

            // Normalisasi HealthImpactScore
            const minScore = d3.min(data, d => d.HealthImpactScore);
            const maxScore = d3.max(data, d => d.HealthImpactScore);

            data.forEach(d => {
                d.NormalizedScore = (d.HealthImpactScore - minScore) / (maxScore - minScore);
            });

            resolve(data);
        }).catch(reject);
    });
}

loadData2().then(data => {
    // Ukuran dan margin yang disesuaikan untuk kartu
    const margin = { top: 40, right: 30, bottom: 60, left: 60 },
        width = 550 - margin.left - margin.right,
        height = 380 - margin.top - margin.bottom;
    
    // Palet warna dari referensi
    const colors = ["#e27c7c", "#a86464", "#6d4b4b", "#503f3f", "#333333", "#3c4e4b", "#466964", "#599e94", "#6cd4c5"];

    createScatterPlot({
        container: "#scatter-cardiovascular",
        xVar: "NormalizedScore",
        yVar: "CardiovascularCases",
        dotColor: colors[8], // Menggunakan warna dari palet
        labelX: "Health Impact Score (Normalized)",
        labelY: "Cardiovascular Cases",
        title: "Dampak Kesehatan pada Kasus Kardiovaskular"
    });

    createScatterPlot({
        container: "#scatter-respiratory",
        xVar: "NormalizedScore",
        yVar: "RespiratoryCases",
        dotColor: colors[0], // Menggunakan warna dari palet
        labelX: "Health Impact Score (Normalized)",
        labelY: "Respiratory Cases",
        title: "Dampak Kesehatan pada Kasus Pernapasan"
    });

    function createScatterPlot({ container, xVar, yVar, dotColor, labelX, labelY, title }) {
        // Hapus SVG yang ada jika ada
        d3.select(container).select("svg").remove();
        d3.select(container).select(".tooltip").remove();
        
        const svg = d3.select(container)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Background area dengan warna gradien
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#f5f5f5")
            .attr("opacity", 0.5)
            .attr("rx", 5)
            .attr("ry", 5);

        const x = d3.scaleLinear()
            .domain([0, 1])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain(d3.extent(data, d => d[yVar]))
            .nice()
            .range([height, 0]);

        // Grid lines
        svg.append("g")
            .attr("class", "grid")
            .attr("transform", `translate(0,${height})`)
            .call(
                d3.axisBottom(x)
                    .tickSize(-height)
                    .tickFormat("")
            )
            .selectAll("line")
            .attr("stroke", "#dddddd")
            .attr("stroke-dasharray", "3,3");

        svg.append("g")
            .attr("class", "grid")
            .call(
                d3.axisLeft(y)
                    .tickSize(-width)
                    .tickFormat("")
            )
            .selectAll("line")
            .attr("stroke", "#dddddd")
            .attr("stroke-dasharray", "3,3");

        // Hapus garis axis dan ticks yang tidak diinginkan
        svg.selectAll(".grid path").attr("stroke", "none");
        svg.selectAll(".grid .domain").remove();
        svg.selectAll(".grid .tick line").attr("stroke", "#dddddd");

        // Axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .attr("class", "axis")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("font-size", "12px")
            .attr("fill", "#333333");

        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .attr("font-size", "12px")
            .attr("fill", "#333333");

        // Judul
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -15)
            .attr("text-anchor", "middle")
            .attr("class", "title")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .attr("fill", "#333333")
            .text(title);

        // Labels
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 40)
            .attr("text-anchor", "middle")
            .attr("class", "axis-label")
            .attr("font-size", "14px")
            .attr("fill", "#333333")
            .text(labelX);

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -45)
            .attr("x", -height / 2)
            .attr("text-anchor", "middle")
            .attr("class", "axis-label")
            .attr("font-size", "14px")
            .attr("fill", "#333333")
            .text(labelY);

        // Trendline jika d3.regressionLinear tersedia
        try {
            if (typeof d3.regressionLinear === 'function') {
                const regression = d3.regressionLinear()
                    .x(d => d[xVar])
                    .y(d => d[yVar]);
                
                const regressionData = regression(data);
                
                const line = d3.line()
                    .x(d => x(d[0]))
                    .y(d => y(d[1]));
                
                svg.append("path")
                    .datum(regressionData)
                    .attr("fill", "none")
                    .attr("stroke", colors[3])
                    .attr("stroke-width", 2)
                    .attr("stroke-dasharray", "5,5")
                    .attr("d", line);
            }
        } catch (e) {
            console.log("Regression line couldn't be added:", e);
            // Alternativa: Simple trend line
            const xValues = data.map(d => d[xVar]);
            const yValues = data.map(d => d[yVar]);
            
            // Simplified linear regression
            const n = data.length;
            const sumX = xValues.reduce((a, b) => a + b, 0);
            const sumY = yValues.reduce((a, b) => a + b, 0);
            const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0);
            const sumXX = xValues.reduce((acc, x) => acc + x * x, 0);
            
            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;
            
            const lineData = [
                [0, intercept],
                [1, slope + intercept]
            ];
            
            const line = d3.line()
                .x(d => x(d[0]))
                .y(d => y(d[1]));
            
            svg.append("path")
                .datum(lineData)
                .attr("fill", "none")
                .attr("stroke", colors[3])
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "5,5")
                .attr("d", line);
        }

        // Dots dengan border
        svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d[xVar]))
            .attr("cy", d => y(d[yVar]))
            .attr("r", 6)
            .attr("fill", dotColor)
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0.8);

        // Tooltip
        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "1px solid #ddd")
            .style("border-radius", "4px")
            .style("padding", "8px")
            .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("z-index", 1000);

        svg.selectAll(".dot")
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .attr("r", 8)
                    .attr("stroke-width", 2);
                
                tooltip
                    .style("opacity", 1)
                    .html(`
                        <strong>${labelY}:</strong> ${d[yVar]}<br>
                        <strong>Score:</strong> ${d[xVar].toFixed(2)}
                    `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .attr("r", 6)
                    .attr("stroke-width", 1.5);
                
                tooltip.style("opacity", 0);
            });

        // Data Visualization watermark
        svg.append("text")
            .attr("x", width - 5)
            .attr("y", height - 5)
            .attr("text-anchor", "end")
            .attr("font-size", "10px")
            .attr("font-style", "italic")
            .attr("fill", "#999999")
            .text("Data Visualization");
    }
});