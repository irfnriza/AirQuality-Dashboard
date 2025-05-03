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
    const margin = { top: 40, right: 30, bottom: 60, left: 60 },
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    createScatterPlot({
        container: "#scatter-cardiovascular",
        xVar: "NormalizedScore",
        yVar: "CardiovascularCases",
        dotColor: "#1f77b4",
        labelX: "Health Impact Score (Normalized)",
        labelY: "Cardiovascular Cases"
    });

    createScatterPlot({
        container: "#scatter-respiratory",
        xVar: "NormalizedScore",
        yVar: "RespiratoryCases",
        dotColor: "#d62728",
        labelX: "Health Impact Score (Normalized)",
        labelY: "Respiratory Cases"
    });

    function createScatterPlot({ container, xVar, yVar, dotColor, labelX, labelY }) {
        const svg = d3.select(container)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom + 20)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear()
            .domain([0, 1])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain(d3.extent(data, d => d[yVar]))
            .nice()
            .range([height, 0]);

        // Axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .call(d3.axisLeft(y));

        // Labels
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 40)
            .attr("text-anchor", "middle")
            .attr("class", "axis-label")
            .text(labelX);

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -45)
            .attr("x", -height / 2)
            .attr("text-anchor", "middle")
            .attr("class", "axis-label")
            .text(labelY);

        // Dots
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d[xVar]))
            .attr("cy", d => y(d[yVar]))
            .attr("r", 3)
            .attr("fill", dotColor);

        // Footnote: Normalization note
        d3.select(container)
            .append("div")
            .attr("style", "font-size: 12px; margin-top: 5px; color: gray; font-style: italic;")
            .text("Skor Health Impact telah dinormalisasi menggunakan Min-Max untuk visualisasi yang lebih informatif.");
    }
});
