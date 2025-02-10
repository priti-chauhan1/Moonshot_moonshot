let barChart = null;
let lineChart = null;
let data = [];
let filtersApplied = false; // Track if filters have been applied

fetch("output.json")
  .then((response) => response.json())
  .then((jsonData) => {
    data = jsonData;
    initializeCharts();
    applyFiltersFromURL();
  })
  .catch((err) => console.error("Failed to load JSON data:", err));

function initializeCharts() {
  const defaultData = processData(data);
  createBarChart(defaultData);
  createLineChart(defaultData);
}

function createBarChart(chartData) {
  const ctx = document.getElementById("barChart").getContext("2d");
  if (barChart) barChart.destroy();
  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: chartData.map((item) => item.feature),
      datasets: [
        {
          label: "Total Time Spent",
          data: chartData.map((item) => item.value),
          backgroundColor: "rgba(2, 177, 177, 0.5)",
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function createLineChart(chartData) {
  const ctx = document.getElementById("lineChart").getContext("2d");
  if (lineChart) lineChart.destroy();
  lineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: chartData.map((item) => item.day),
      datasets: [
        {
          label: "Time Trend",
          data: chartData.map((item) => item.value),
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
          ticks: { display: false },
          grid: { display: false },
        },
        y: {
          title: { display: true, text: "Axis Title" },
        },
      },
      plugins: {
        title: { display: true, text: "Chart Title" },
      },
    },
  });
}
document.getElementById("applyFilters").addEventListener("click", () => {
  if (!filtersApplied) {
    filtersApplied = true; // First click sets the flag but doesn't update data
    return;
  }

  updateChartsWithFilters();
});

function updateChartsWithFilters() {
  const ageFilter = document.getElementById("ageGroup").value;
  const genderFilter = document.getElementById("genderFilter").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  let filteredData = data.filter(
    (item) =>
      (ageFilter === "all" || item.age === ageFilter) &&
      (genderFilter === "all" || item.gender === genderFilter) &&
      (!startDate || item.day >= startDate) &&
      (!endDate || item.day <= endDate)
  );

  const featureTotals = processData(filteredData);
  createBarChart(featureTotals);
  createLineChart(featureTotals);

  const url = new URL(window.location);
  url.searchParams.set("age", ageFilter);
  url.searchParams.set("gender", genderFilter);
  url.searchParams.set("startDate", startDate);
  url.searchParams.set("endDate", endDate);
  window.history.pushState({}, "", url);
}

// Detect changes in filter values and update charts only after first apply click
document
  .querySelectorAll("#ageGroup, #genderFilter, #startDate, #endDate")
  .forEach((filter) => {
    filter.addEventListener("change", () => {
      if (filtersApplied) {
        updateChartsWithFilters();
      }
    });
  });

document.getElementById("resetFilters").addEventListener("click", () => {
  document.getElementById("ageGroup").value = "all";
  document.getElementById("genderFilter").value = "all";
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";

  const url = new URL(window.location);
  url.searchParams.delete("age");
  url.searchParams.delete("gender");
  url.searchParams.delete("startDate");
  url.searchParams.delete("endDate");
  window.history.pushState({}, "", url);

  filtersApplied = false; // Reset the flag
  initializeCharts();
});

function applyFiltersFromURL() {
  const urlParams = new URLSearchParams(window.location.search);

  document.getElementById("ageGroup").value = urlParams.get("age") || "all";
  document.getElementById("genderFilter").value =
    urlParams.get("gender") || "all";
  document.getElementById("startDate").value = urlParams.get("startDate") || "";
  document.getElementById("endDate").value = urlParams.get("endDate") || "";

  document.getElementById("applyFilters").click();
}

function processData(inputData) {
  return ["A", "B", "C", "D", "E", "F"].map((feature) => ({
    feature,
    value: inputData.reduce((sum, item) => sum + (item[feature] || 0), 0),
    day: inputData.map((item) => item.day),
  }));
}
