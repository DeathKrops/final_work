let loadHistory = [];
let timeLabels = [];
let lineChart;

async function loadData() {
  const url = "./data/realtime.json?t=" + Date.now();
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("HTTP " + res.status);

  const data = await res.json();

  // ✅ 正確結構：data.records
  const records = data.records;
  if (!Array.isArray(records) || records.length < 2) {
    throw new Error("records not found");
  }

  const rawLoad = records[0]?.curr_load;      // "2374.2"
  const rawTime = records[1]?.publish_time;   // "115.01.01(四)23:50"

  const load = parseFloat(String(rawLoad).replace(/,/g, ""));
  if (!Number.isFinite(load)) {
    throw new Error("invalid curr_load: " + rawLoad);
  }

  const time = String(rawTime || new Date().toLocaleString());

  loadHistory.push(load);
  timeLabels.push(time);

  if (loadHistory.length > 20) {
    loadHistory.shift();
    timeLabels.shift();
  }

  const status = document.getElementById("status");
  if (status) {
    status.textContent = "最後更新時間：" + time + "（真實資料，每 5 分鐘更新）";
  }
}

async function renderChart() {
  try {
    await loadData();

    if (lineChart) lineChart.destroy();

    lineChart = new Chart(document.getElementById("lineChart"), {
      type: "line",
      data: {
        labels: timeLabels,
        datasets: [{
          label: "即時用電量 (MW)",
          data: loadHistory,
          borderWidth: 2,
          tension: 0.3,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: false }
        }
      }
    });
  } catch (e) {
    const status = document.getElementById("status");
    if (status) status.textContent = "資料讀取失敗：" + e.message;
  }
}

document.getElementById("export").onclick = () => {
  if (!lineChart) return;
  const a = document.createElement("a");
  a.href = lineChart.toBase64Image();
  a.download = "taipower_realtime.png";
  a.click();
};

renderChart();
setInterval(renderChart, 60000);
