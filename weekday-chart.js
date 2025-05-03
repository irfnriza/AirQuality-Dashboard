loadData().then(data => {

    const margin = { top: 40, right: 30, bottom: 50, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
    const workdays = new Set(["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]);
    const weekend = new Set(["Sabtu", "Minggu"]);

    // Fungsi bantu: tentukan hari dari year, month, day
    function getDayNameFromParts(y, m, d) {
        const date = new Date(y, m - 1, d); // JS: bulan dimulai dari 0
        const jsDay = date.getDay();       // JS: Minggu=0, Senin=1,...
        return days[jsDay === 0 ? 6 : jsDay - 1]; // Konversi agar Senin=0
    }

    function createLineChart(containerId, labels, values) {
        const svg = d3.select(containerId)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scalePoint()
            .domain(labels)
            .range([0, width])
            .padding(0.5);

        const y = d3.scaleLinear()
            .domain([0, d3.max(values)])
            .nice()
            .range([height, 0]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append("g").call(d3.axisLeft(y));

        const line = d3.line()
            .x((d, i) => x(labels[i]))
            .y(d => y(d));

        svg.append("path")
            .datum(values)
            .attr("fill", "none")
            .attr("stroke", "#1f77b4")
            .attr("stroke-width", 3)
            .attr("d", line);
    }

    function createBarChart(containerId, labels, values) {
        const svg = d3.select(containerId)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(labels)
            .range([0, width])
            .padding(0.3);

        const y = d3.scaleLinear()
            .domain([0, d3.max(values)])
            .nice()
            .range([height, 0]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.selectAll(".bar")
            .data(values)
            .enter()
            .append("rect")
            .attr("x", (d, i) => x(labels[i]))
            .attr("y", d => y(d))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d))
            .attr("fill", "#ff7f0e");
    }

    // Load data
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

        createLineChart("#chart-weekday", days, weekdayValues);

        // === Diagram 2: CO Hari Kerja vs Akhir Pekan ===
        const groupedType = {
            "Hari Kerja": d3.mean(data.filter(d => workdays.has(d.dayName)), d => d.CO),
            "Akhir Pekan": d3.mean(data.filter(d => weekend.has(d.dayName)), d => d.CO),
        };

        createBarChart("#chart-workweekend", ["Hari Kerja", "Akhir Pekan"], [
            groupedType["Hari Kerja"], groupedType["Akhir Pekan"]
        ]);
    });


});