let loadHistory = [];
let timeLabels = [];
let lineChart;

async function loadData() {
  const url = "./data/realtime.json?t=" + Date.now();
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("HTTP " + res.status);

  const data = await res.json();

  const load = Number(data.CurrLoad);
  const time = data.PublishTime || new Date().toLocaleString();

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
  await loadData();

  if (lineChart) lineChart.destroy();

  lineChart = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels: timeLabels,
      datasets: [{
        label: "即時用電量（MW）",
        data: loadHistory,
        borderWidth: 2,
        tension: 0.3,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// 匯出 PNG
document.getElementById("export").onclick = () => {
  if (!lineChart) return;
  const a = document.createElement("a");
  a.href = lineChart.toBase64Image();
  a.download = "taipower_realtime.png";
  a.click();
};

// 初始載入
renderChart();

// 每 60 秒刷新畫面（資料來源 5 分鐘更新一次）
setInterval(renderChart, 60000);
