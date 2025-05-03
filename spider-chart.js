loadData2().then(data => {
  const width = 650;
  const height = 650;
  const margin = 90;
  const radius = Math.min(width, height) / 2 - margin;

  const pollutants = ["PM10", "PM2_5", "NO2", "SO2", "O3"];

  const classLabels = {
    0: "Very High",
    1: "High",
    2: "Moderate",
    3: "Low",
    4: "Very Low"
  };

  const color = d3.scaleOrdinal()
    .domain(Object.values(classLabels))
    .range(d3.schemeCategory10);

  const svg = d3.select("#chart2")
    .append("svg")
    .attr("width", width)
    .attr("height", height + 50)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Tooltip
  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("padding", "6px 12px")
    .style("background", "#fff")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("box-shadow", "0px 0px 4px rgba(0,0,0,0.3)")
    .style("pointer-events", "none")
    .style("opacity", 0);

  d3.csv("data2.csv").then(data => {
    data.forEach(d => {
      d.HealthImpactClass = +d.HealthImpactClass;
      pollutants.forEach(p => d[p] = +d[p]);
    });

    const grouped = d3.groups(data, d => d.HealthImpactClass)
      .map(([cls, records]) => {
        const avg = { classId: cls, class: classLabels[cls] };
        pollutants.forEach(p => {
          avg[p] = d3.mean(records, r => r[p]);
        });
        return avg;
      });

    const maxVal = d3.max(grouped, d => d3.max(pollutants, p => d[p]));
    const rScale = d3.scaleLinear().domain([0, maxVal]).range([0, radius]);
    const angleSlice = (2 * Math.PI) / pollutants.length;

    // Grid
    const levels = 5;
    for (let level = 1; level <= levels; level++) {
      const r = radius * level / levels;
      svg.append("circle")
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "#ddd");
    }

    // Labels
    pollutants.forEach((p, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = Math.cos(angle) * (radius + 20);
      const y = Math.sin(angle) * (radius + 20);
      svg.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("class", "axisLabel")
        .text(p)
        .style("font-weight", "bold")
        .style("fill", "#444")
        .style("text-anchor", "middle");
    });

    const areas = svg.selectAll(".radar-area")
      .data(grouped)
      .enter()
      .append("g")
      .attr("class", d => `radar-group class-${d.classId}`);

    // --- PERBAIKAN UTAMA: Tutup area dengan menambahkan titik pertama di akhir ---
    areas.append("path")
      .attr("class", "radar-area")
      .attr("fill", d => color(d.class))
      .attr("stroke", d => color(d.class))
      .attr("stroke-width", 2)
      .attr("fill-opacity", 0.1)
      .attr("d", d => {
        const values = pollutants.map(p => d[p]);
        values.push(d[pollutants[0]]); // repeat first to close loop
        const line = d3.lineRadial()
          .radius((v, i) => rScale(values[i]))
          .angle((v, i) => i * angleSlice);
        return line(values);
      })
      .on("mouseover", function (event, d) {
        d3.selectAll(".radar-area").attr("fill-opacity", 0.05);
        d3.select(this).attr("fill-opacity", 0.3);
      })
      .on("mouseout", function () {
        d3.selectAll(".radar-area").attr("fill-opacity", 0.1);
      });

    // Titik
    areas.selectAll("circle")
      .data(d => pollutants.map(p => ({
        key: p,
        val: d[p],
        class: d.class
      })))
      .enter()
      .append("circle")
      .attr("r", 4)
      .attr("cx", d => Math.cos(angleSlice * pollutants.indexOf(d.key) - Math.PI / 2) * rScale(d.val))
      .attr("cy", d => Math.sin(angleSlice * pollutants.indexOf(d.key) - Math.PI / 2) * rScale(d.val))
      .attr("fill", d => color(d.class))
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(150).style("opacity", 1);
        tooltip.html(`<strong>${d.class}</strong><br>${d.key}: ${d.val.toFixed(2)}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", () => tooltip.transition().duration(200).style("opacity", 0));

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${-(width / 2) + 10}, ${-height / 2 + 10})`);

    grouped.forEach((d, i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${i * 25})`);

      g.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", color(d.class))
        .style("cursor", "pointer")
        .on("click", () => toggleVisibility(d.classId));

      g.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(d.class)
        .style("font-size", "13px")
        .style("cursor", "pointer")
        .on("click", () => toggleVisibility(d.classId));
    });

    function toggleVisibility(classId) {
      const group = d3.selectAll(`.class-${classId}`);
      const visible = group.style("display") !== "none";
      group.style("display", visible ? "none" : null);
    }
  });
});
