loadData2().then(data => {
    const margin = { top: 40, right: 150, bottom: 50, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    const svg = d3.select("#chart-histogram")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Mapping kelas dampak kesehatan
    const classNames = {
        0: 'Very High',
        1: 'High',
        2: 'Moderate',
        3: 'Low',
        4: 'Very Low'
    };

    // Warna untuk masing-masing kelas
    const colorMap = {
        0: "#8b0000",  // Dark red for Very High
        1: "#d62728",  // Red for High
        2: "#ff7f0e",  // Orange for Moderate
        3: "#2ca02c",  // Green for Low
        4: "#1f77b4"   // Blue for Very Low
    };

    // Tambahkan nama kelas ke data
    data.forEach(d => {
        d.HealthImpactClassName = classNames[d.HealthImpactClass];
    });

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.AQI))
        .nice()
        .range([0, width]);

    const histogram = d3.histogram()
        .value(d => d.AQI)
        .domain(x.domain())
        .thresholds(x.ticks(30));

    // Pisahkan per kelas dampak
    const binsByClass = {};
    Object.keys(classNames).forEach(c => {
        const filtered = data.filter(d => d.HealthImpactClass === +c);
        binsByClass[c] = histogram(filtered);
    });

    const y = d3.scaleLinear()
        .domain([
            0,
            d3.max(Object.values(binsByClass), bins =>
                d3.max(bins, d => d.length)
            )
        ])
        .nice()
        .range([height, 0]);

    // Sumbu X
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .append("text")
        .attr("x", width)
        .attr("y", -10)
        .attr("fill", "#000")
        .attr("text-anchor", "end")
        .text("AQI Value");

    // Sumbu Y
    svg.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .text("Frequency");

    // Judul
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("AQI Distribution by Health Impact Class");

    // Gambar batang
    const barWidth = x(binsByClass[0][0].x1) - x(binsByClass[0][0].x0);
    const classKeys = Object.keys(classNames);

    classKeys.forEach((cls, i) => {
        svg.selectAll(`.bar-${cls}`)
            .data(binsByClass[cls])
            .enter()
            .append("rect")
            .attr("class", `bar bar-${cls}`)
            .attr("x", d => x(d.x0) + i * (barWidth / classKeys.length))
            .attr("y", d => y(d.length))
            .attr("width", barWidth / classKeys.length)
            .attr("height", d => height - y(d.length))
            .attr("fill", colorMap[cls]);
    });

    // Legend
    const legend = svg.selectAll(".legend")
        .data(classKeys)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width + 20}, ${i * 20})`);

    legend.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => colorMap[d]);

    legend.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(d => classNames[d])
        .style("font-size", "12px");
});