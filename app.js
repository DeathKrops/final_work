let loadHistory = [];
let timeLabels = [];
let lineChart;

async function loadData() {
  const url = "https://www.taipower.com.tw/d006/loadGraph/loadGraph/data/loadpara.json";
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
  if (status) status.textContent = "最後更新時間：" + time;
}

async function renderRealtime() {
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
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  } catch (e) {
    const status = document.getElementById("status");
    if (status) status.textContent = "即時資料讀取失敗（請用 Live Server / GitHub Pages）";
  }
}

document.getElementById("export").onclick = () => {
  if (!lineChart) return;
  const a = document.createElement("a");
  a.href = lineChart.toBase64Image();
  a.download = "realtime_power.png";
  a.click();
};

renderRealtime();
setInterval(renderRealtime, 60000);
