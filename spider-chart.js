loadData2().then(data => {
  // Ukuran dan margin yang disesuaikan untuk card
  const width = 370;
  const height = 370;
  const margin = 25;
  const radius = Math.min(width, height) / 2 - margin;

  const pollutants = ["PM10", "PM2_5", "NO2", "SO2", "O3"];
  
  // Palet warna yang disesuaikan seperti pada gambar
  const colors = ["#e27c7c", "#6cd4c5", "#466964", "#503f3f", "#333333"];

  const classLabels = {
    0: "Very High",
    1: "High",
    2: "Moderate",
    3: "Low",
    4: "Very Low"
  };

  // Gunakan warna dari palet yang lebih sesuai dengan gambar
  const color = d3.scaleOrdinal()
    .domain(Object.values(classLabels))
    .range(colors);

  // Bersihkan chart sebelumnya jika ada
  d3.select("#chart2").select("svg").remove();
  d3.select("body").selectAll(".tooltip-radar").remove();

  // Buat container card dengan styling yang sesuai
  const cardContainer = d3.select("#chart2")
    .style("position", "relative")
    .style("background", "#ffffff")
    .style("border-radius", "8px")
    .style("box-shadow", "0 2px 8px rgba(0,0,0,0.08)")
    .style("overflow", "hidden")
    .style("margin", "20px 0");

  // // Tambahkan header card
  // cardContainer.append("div")
  //   .attr("class", "card-header")
  //   .style("padding", "16px 20px")
  //   .style("border-bottom", "1px solid #f0f0f0")
  //   .style("display", "flex")
  //   .style("justify-content", "space-between")
  //   .style("align-items", "center")
  //   .html(`
  //     <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #333;">Radar Chart: Polutan per Kelas Dampak Kesehatan</h3>
  //     <div style="cursor: pointer;">
  //       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4285F4" stroke-width="2">
  //         <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path>
  //       </svg>
  //     </div>
  //   `);

  // Container untuk chart
  const chartBody = cardContainer.append("div")
    .attr("class", "card-body")
    .style("padding", "20px");

  const svg = chartBody.append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Background untuk chart
  svg.append("circle")
    .attr("r", radius + 10)
    .attr("fill", "#f8f8f8")
    .attr("opacity", 0.7);

  // Tooltip dengan style yang modern
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip-radar")
    .style("position", "absolute")
    .style("padding", "8px 12px")
    .style("background", "#fff")
    .style("border", "1px solid #e0e0e0")
    .style("border-radius", "4px")
    .style("box-shadow", "0px 2px 6px rgba(0,0,0,0.2)")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("font-size", "12px")
    .style("z-index", 1000);

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

    // Grid circles dengan style yang lebih minimalis
    const levels = 4;
    for (let level = 1; level <= levels; level++) {
      const r = radius * level / levels;
      svg.append("circle")
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "#e0e0e0")
        .attr("stroke-dasharray", "3,3")
        .attr("stroke-width", 1);
    }

    // Garis axis dari tengah ke tepi
    pollutants.forEach((p, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      svg.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "#e0e0e0")
        .attr("stroke-dasharray", "3,3")
        .attr("stroke-width", 1);
    });

    // Labels yang lebih clean seperti pada gambar
    pollutants.forEach((p, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = Math.cos(angle) * (radius + 20);
      const y = Math.sin(angle) * (radius + 20);
      
      svg.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(p)
        .style("font-weight", "500")
        .style("font-size", "13px")
        .style("fill", "#555");
    });

    // Tidak perlu judul chart lagi karena sudah ada di header card

    const areas = svg.selectAll(".radar-area")
      .data(grouped)
      .enter()
      .append("g")
      .attr("class", d => `radar-group class-${d.classId}`)
      .attr("data-visible", "true");

    // Area radar dengan styling yang lebih mirip gambar
    areas.append("path")
      .attr("class", "radar-area")
      .attr("fill", d => color(d.class))
      .attr("stroke", d => color(d.class))
      .attr("stroke-width", 2)
      .attr("fill-opacity", 0.25)
      .attr("d", d => {
        const values = pollutants.map(p => d[p]);
        values.push(d[pollutants[0]]); // repeat first to close loop
        const line = d3.lineRadial()
          .radius((v, i) => rScale(values[i]))
          .angle((v, i) => i * angleSlice);
        return line(values);
      })
      .on("mouseover", function(event, d) {
        d3.selectAll(".radar-area").attr("fill-opacity", 0.1);
        d3.select(this).attr("fill-opacity", 0.5);
        
        tooltip.transition().duration(150).style("opacity", 1);
        tooltip.html(`<strong>${d.class}</strong><br>` + 
          pollutants.map(p => `${p}: ${d[p].toFixed(2)}`).join("<br>"))
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", function() {
        d3.selectAll(".radar-area").attr("fill-opacity", 0.25);
        tooltip.transition().duration(200).style("opacity", 0);
      });

    // Titik data dengan style yang sesuai dengan gambar
    areas.selectAll("circle")
      .data(d => pollutants.map(p => ({
        key: p,
        val: d[p],
        class: d.class,
        classId: d.classId
      })))
      .enter()
      .append("circle")
      .attr("r", 4)
      .attr("cx", d => Math.cos(angleSlice * pollutants.indexOf(d.key) - Math.PI / 2) * rScale(d.val))
      .attr("cy", d => Math.sin(angleSlice * pollutants.indexOf(d.key) - Math.PI / 2) * rScale(d.val))
      .attr("fill", d => color(d.class))
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1.5)
      .attr("fill-opacity", 1)
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(150).style("opacity", 1);
        tooltip.html(`<strong>${d.class}</strong><br>${d.key}: ${d.val.toFixed(2)}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");
        
        d3.select(event.target)
          .attr("r", 6)
          .attr("stroke-width", 2);
      })
      .on("mouseout", (event) => {
        tooltip.transition().duration(200).style("opacity", 0);
        
        d3.select(event.target)
          .attr("r", 4)
          .attr("stroke-width", 1.5);
      });

    // Legend dengan style minimalis di dalam card
    const legendContainer = chartBody.append("div")
      .attr("class", "legend-container")
      .style("position", "absolute")
      .style("top", "20px")
      .style("right", "20px")
      .style("background", "rgba(255, 255, 255, 0.9)")
      .style("padding", "10px")
      .style("border-radius", "4px")
      .style("box-shadow", "0 1px 3px rgba(0,0,0,0.08)")
      .style("font-size", "12px");

    const legendItems = legendContainer.selectAll(".legend-item")
      .data(grouped)
      .enter()
      .append("div")
      .attr("class", "legend-item")
      .style("display", "flex")
      .style("align-items", "center")
      .style("margin-bottom", "5px")
      .style("cursor", "pointer");

    // Checkbox untuk legend
    legendItems.append("div")
      .attr("class", d => `checkbox checkbox-${d.classId}`)
      .style("width", "12px")
      .style("height", "12px")
      .style("border-radius", "2px")
      .style("margin-right", "6px")
      .style("background-color", d => color(d.class))
      .on("click", function(event, d) {
        const group = d3.selectAll(`.class-${d.classId}`);
        const isVisible = group.attr("data-visible") === "true";
        
        // Toggle visibility
        group.attr("data-visible", isVisible ? "false" : "true")
            .style("opacity", isVisible ? 0 : 1)
            .style("pointer-events", isVisible ? "none" : "all");
        
        // Update checkbox style
        d3.select(this)
          .style("opacity", isVisible ? 0.3 : 1);
      });

    // Label untuk checkbox
    legendItems.append("span")
      .text(d => d.class)
      .style("font-size", "11px")
      .style("color", "#555")
      .on("click", function(event, d) {
        // Trigger sama dengan klik pada checkbox
        d3.select(this.parentNode).select(".checkbox").dispatch("click");
      });
  });
});