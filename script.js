let barChart, lineChart; 
let data = []; 
let filtersApplied = false; // Flag 

// Fetching data from JSON file
fetch("output.json")
  .then((response) => response.json()) // Converts the response to JSON format
  .then((jsonData) => {
    data = jsonData; // Stores the fetched dat
    initializeCharts(); 
    applyFiltersFromURL(); 
  })
  .catch((err) => console.error("Failed to load JSON data:", err));

// Initializes charts when the page loads
function initializeCharts() {
  const defaultData = processData(data); // Processes data for visualization
  createBarChart(defaultData); 
  createLineChart(defaultData);
}

// Creating the Bar Chart
function createBarChart(chartData) {
  const ctx = document.getElementById("barChart").getContext("2d");
  if (barChart) barChart.destroy(); // Destroys the existing chart before creating a new one
  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: chartData.map((item) => item.feature), // Setting labels for X-axis
      datasets: [
        {
          label: "Total Time Spent",
          data: chartData.map((item) => item.value), // Setting values for Y-axis
          backgroundColor: "rgba(2, 177, 177, 0.5)",
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false, // Allows flexible resizing
    },
  });
}

// Creating the Line Chart
function createLineChart(chartData) {
  const ctx = document.getElementById("lineChart").getContext("2d");
  if (lineChart) lineChart.destroy(); 
  Chart.register(ChartZoom); // Registers zoom functionality
  lineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: chartData.map((item) => item.day), // Setting X-axis labels
      datasets: [
        {
          label: "Time Trend",
          data: chartData.map((item) => item.value), // Setting Y-axis values
          borderColor: "rgba(153, 102, 255, 0.8)",
          pointBackgroundColor: "rgba(153, 102, 255, 1)",
          borderWidth: 2,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { display: false }, // Hides x-axis labels
          grid: { display: false },
        },
        y: {
          title: { display: true, text: "Axis Title" },
        },
      },
      plugins: {
        title: { display: true, text: "Chart Title" },
        zoom: {
          pan: {
            enabled: true, // Enables panning
            mode: "x", // Pans only in the x-axis direction
          },
          zoom: {
            wheel: { enabled: true }, 
            pinch: { enabled: true }, 
            mode: "x", // Zooms only in the x-axis direction
          },
        },
      },
    },
  });
}

// Applying filters when the button is clicked
document.getElementById("applyFilters").addEventListener("click", () => {
  if (!filtersApplied) {
    filtersApplied = true;
    return;
  }
  updateChartsWithFilters(); 
});

// Updating charts based on filters
function updateChartsWithFilters() {
  const ageFilter = document.getElementById("ageGroup").value;
  const genderFilter = document.getElementById("genderFilter").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  // Filtering data based on user selections
  let filteredData = data.filter(
    (item) =>
      (ageFilter === "all" || item.age === ageFilter) &&
      (genderFilter === "all" || item.gender === genderFilter) &&
      (!startDate || item.day >= startDate) &&
      (!endDate || item.day <= endDate)
  );

  const featureTotals = processData(filteredData); // Processing filtered data
  createBarChart(featureTotals); 
  createLineChart(featureTotals);

  // Updating URL with selected filters
  const url = new URL(window.location);
  url.searchParams.set("age", ageFilter);
  url.searchParams.set("gender", genderFilter);
  url.searchParams.set("startDate", startDate);
  url.searchParams.set("endDate", endDate);
  window.history.pushState({}, "", url);
}

// Listening for filter changes and updating charts accordingly
document
  .querySelectorAll("#ageGroup, #genderFilter, #startDate, #endDate")
  .forEach((filter) => {
    filter.addEventListener("change", () => {
      if (filtersApplied) {
        updateChartsWithFilters();
      }
    });
  });

// Resetting filters when reset button is clicked
document.getElementById("resetFilters").addEventListener("click", () => {
  document.getElementById("ageGroup").value = "all";
  document.getElementById("genderFilter").value = "all";
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";

  // Clearing filters from URL
  const url = new URL(window.location);
  url.searchParams.delete("age");
  url.searchParams.delete("gender");
  url.searchParams.delete("startDate");
  url.searchParams.delete("endDate");
  window.history.pushState({}, "", url);

  filtersApplied = false;
  initializeCharts(); 
});

// Applying filters based on URL parameters (if any)
function applyFiltersFromURL() {
  const urlParams = new URLSearchParams(window.location.search);

  document.getElementById("ageGroup").value = urlParams.get("age") || "all";
  document.getElementById("genderFilter").value =
    urlParams.get("gender") || "all";
  document.getElementById("startDate").value = urlParams.get("startDate") || "";
  document.getElementById("endDate").value = urlParams.get("endDate") || "";

  document.getElementById("applyFilters").click(); // Triggers filter application
}

// Processing data for visualization
function processData(inputData) {
  return ["A", "B", "C", "D", "E", "F"].map((feature) => ({
    feature,
    value: inputData.reduce((sum, item) => sum + (item[feature] || 0), 0), // Summing values for each feature
    day: inputData.map((item) => item.day),
  }));
}
