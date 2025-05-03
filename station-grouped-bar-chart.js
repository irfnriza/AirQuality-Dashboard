loadData().then(data => {

    const margin = { top: 40, right: 150, bottom: 60, left: 60 },
        width = 900 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const pollutants = ["PM2.5", "PM10", "SO2", "NO2", "O3"];

    const color = d3.scaleOrdinal()
        .domain(pollutants)
        .range(d3.schemeCategory10);

    // Load data
    d3.csv("data1.csv").then(data => {
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

        const x0 = d3.scaleBand()
            .domain(grouped.map(d => d.station))
            .range([0, width])
            .paddingInner(0.1);

        const x1 = d3.scaleBand()
            .domain(pollutants)
            .range([0, x0.bandwidth()])
            .padding(0.05);

        const y = d3.scaleLinear()
            .domain([0, d3.max(grouped, d => d3.max(pollutants, p => d[p]))])
            .nice()
            .range([height, 0]);

        // Axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x0));

        svg.append("g")
            .call(d3.axisLeft(y));

        // Bars
        svg.selectAll("g.station")
            .data(grouped)
            .enter()
            .append("g")
            .attr("class", "station")
            .attr("transform", d => `translate(${x0(d.station)},0)`)
            .selectAll("rect")
            .data(d => pollutants.map(p => ({ pollutant: p, value: d[p] })))
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x1(d.pollutant))
            .attr("y", d => y(d.value))
            .attr("width", x1.bandwidth())
            .attr("height", d => height - y(d.value))
            .attr("fill", d => color(d.pollutant));

        // Legend
        const legend = svg.selectAll(".legend")
            .data(pollutants)
            .enter()
            .append("g")
            .attr("transform", (d, i) => `translate(${width + 20}, ${i * 20})`);

        legend.append("rect")
            .attr("x", 0)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", d => color(d));

        legend.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .text(d => d)
            .attr("class", "legend");
    });

});