loadData().then(data => {

  // Set up the dimensions and margins for the chart
  const margin = { top: 40, right: 30, bottom: 50, left: 60 },
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // Define months for display
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Define seasons and their corresponding months
  const seasonMap = {
    "Winter": [12, 1, 2],
    "Spring": [3, 4, 5],
    "Summer": [6, 7, 8],
    "Autumn": [9, 10, 11]
  };

  // Function to determine season based on month number
  function groupSeason(month) {
    const m = +month;
    return Object.keys(seasonMap).find(season =>
      seasonMap[season].includes(m)
    );
  }

  // Function to create a bar chart
  function createBarChart({ containerId, labels, values, title }) {
    // Create SVG container
    const svg = d3.select(containerId)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales
    const x = d3.scaleBand()
      .domain(labels)
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(values) * 1.1]) // Add 10% padding at top
      .nice()
      .range([height, 0]);

    // Add x-axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Add y-axis
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .text("CO Level");

    // Add bars
    svg.selectAll(".bar")
      .data(values)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d, i) => x(labels[i]))
      .attr("y", d => y(d))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d))
      .attr("fill", "#1f77b4");
  }

  // Try to load data, but use sample data if there's an error
  d3.csv("data1.csv").then(data => {
    processData(data);
  }).catch(error => {
    console.warn("Could not load data1.csv, using sample data instead:", error);
    processData(sampleData);
  });

  // Process the data and create charts
  function processData(data) {
    // Convert string values to numbers
    data.forEach(d => {
      d.CO = +d.CO;
      d.month = +d.month;
    });

    // === Chart 1: CO per Month ===
    const coByMonth = d3.rollup(
      data,
      v => d3.mean(v, d => d.CO),
      d => d.month
    );

    const sortedMonths = Array.from(coByMonth.entries())
      .sort((a, b) => a[0] - b[0]);

    createBarChart({
      containerId: "#chart-month",
      labels: sortedMonths.map(([m]) => months[m - 1]),
      values: sortedMonths.map(([_, v]) => v),
      title: "CO Levels by Month"
    });

    // === Chart 2: CO per Season ===
    const dataWithSeason = data.map(d => ({
      ...d,
      season: groupSeason(d.month)
    }));

    const coBySeason = d3.rollup(
      dataWithSeason,
      v => d3.mean(v, d => d.CO),
      d => d.season
    );

    const seasonOrder = ["Winter", "Spring", "Summer", "Autumn"];

    createBarChart({
      containerId: "#chart-season",
      labels: seasonOrder,
      values: seasonOrder.map(season => coBySeason.get(season) || 0),
      title: "CO Levels by Season"
    });
  }

});