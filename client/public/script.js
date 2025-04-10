window.Telegram.WebApp.ready();

const ws = new WebSocket('wss://crash-backend.vercel.app'); // Ganti dengan URL backend setelah deploy
const multiplierDisplay = document.getElementById('multiplier');
const betBtn = document.getElementById('betBtn');
const cashoutBtn = document.getElementById('cashoutBtn');
const betAmount = document.getElementById('betAmount');
const status = document.getElementById('status');
let currentBet = 0;

const ctx = document.getElementById('crashChart').getContext('2d');
const crashChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Multiplier',
      data: [],
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      fill: false,
      tension: 0.1
    }]
  },
  options: {
    scales: { x: { display: false }, y: { beginAtZero: true, suggestedMax: 10 } },
    animation: false,
    plugins: { legend: { display: false } }
  }
});

let timeStep = 0;
function updateChart(value) {
  crashChart.data.labels.push(timeStep++);
  crashChart.data.datasets[0].data.push(value);
  crashChart.update();
}

function resetChart() {
  crashChart.data.labels = [];
  crashChart.data.datasets[0].data = [];
  timeStep = 0;
  crashChart.update();
}

ws.onopen = () => console.log('Terhubung ke server');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'multiplier') {
    const multiplier = data.value;
    multiplierDisplay.textContent = `${multiplier.toFixed(2)}x`;
    updateChart(multiplier);
  } else if (data.type === 'crash') {
    multiplierDisplay.textContent = 'CRASH!';
    cashoutBtn.disabled = true;
    betBtn.disabled = false;
    if (currentBet > 0) {
      status.textContent = 'Kamu kalah!';
      currentBet = 0;
    }
    setTimeout(resetChart, 2000);
  } else if (data.type === 'bet_accepted') {
    currentBet = data.amount;
    betBtn.disabled = true;
    cashoutBtn.disabled = false;
    status.textContent = `Taruhan diterima: ${currentBet}`;
  }
};

betBtn.onclick = () => {
  const amount = parseFloat(betAmount.value);
  if (amount > 0) {
    ws.send(JSON.stringify({ type: 'bet', amount }));
  }
};

cashoutBtn.onclick = () => {
  const currentMultiplier = parseFloat(multiplierDisplay.textContent);
  const winnings = currentBet * currentMultiplier;
  status.textContent = `Kamu menang: ${winnings.toFixed(2)}!`;
  currentBet = 0;
  cashoutBtn.disabled = true;
  betBtn.disabled = false;
};
