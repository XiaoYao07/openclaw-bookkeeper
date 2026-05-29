// ============================================
// 个人财务看板 — 前端逻辑
// ============================================

const DATA_URL = '/api/ledger';
let categoryChart = null;
let trendChart = null;

// 分类颜色映射
const CATEGORY_COLORS = {
  '餐饮': '#f97316',
  '交通': '#3b82f6',
  '购物': '#ec4899',
  '住房': '#8b5cf6',
  '娱乐': '#06b6d4',
  '医疗': '#ef4444',
  '人情': '#eab308',
  '收入': '#22c55e',
  '其他': '#6b7280'
};

// 分类图标
const CATEGORY_ICONS = {
  '餐饮': '🍜',
  '交通': '🚗',
  '购物': '🛍️',
  '住房': '🏠',
  '娱乐': '🎮',
  '医療': '🏥',
  '人情': '🎁',
  '收入': '💰',
  '其他': '📦'
};

async function fetchData() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch (err) {
    console.error('Failed to load ledger:', err);
    return { records: [], insights: [] };
  }
}

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
}

function getLast30Days() {
  const dates = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function updateOverview(records) {
  const { start, end } = getMonthRange();
  const monthRecords = records.filter(r => r.date >= start && r.date <= end);

  const totalExpense = monthRecords
    .filter(r => r.type !== 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalIncome = monthRecords
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  const balance = totalIncome - totalExpense;

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = Math.min(now.getDate(), daysInMonth);
  const dailyAvg = daysPassed > 0 ? totalExpense / daysPassed : 0;

  document.getElementById('total-expense').textContent = `¥ ${totalExpense.toFixed(2)}`;
  document.getElementById('total-income').textContent = `¥ ${totalIncome.toFixed(2)}`;
  document.getElementById('total-balance').textContent = `¥ ${balance.toFixed(2)}`;
  document.getElementById('daily-avg').textContent = `¥ ${dailyAvg.toFixed(2)}`;

  const balanceCard = document.querySelector('.card.balance .value');
  balanceCard.className = 'value ' + (balance >= 0 ? 'positive' : 'negative');
}

function updateCategoryChart(records) {
  const { start, end } = getMonthRange();
  const monthRecords = records.filter(r => r.date >= start && r.date <= end && r.type !== 'income');

  const byCategory = {};
  monthRecords.forEach(r => {
    byCategory[r.category] = (byCategory[r.category] || 0) + r.amount;
  });

  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map(([cat]) => cat);
  const data = sorted.map(([, amt]) => amt);
  const colors = sorted.map(([cat]) => CATEGORY_COLORS[cat] || '#6b7280');

  const ctx = document.getElementById('category-chart').getContext('2d');
  if (categoryChart) categoryChart.destroy();

  if (data.length === 0) {
    categoryChart = null;
    return;
  }

  categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            padding: 16,
            usePointStyle: true,
            font: { size: 13 }
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ¥${ctx.raw.toFixed(2)}`
          }
        }
      }
    }
  });
}

function updateTrendChart(records) {
  const last30 = getLast30Days();
  const expenseByDay = {};
  last30.forEach(d => { expenseByDay[d] = 0; });
  records.forEach(r => {
    if (r.type !== 'income' && expenseByDay.hasOwnProperty(r.date)) {
      expenseByDay[r.date] += r.amount;
    }
  });

  const labels = last30.map(d => d.slice(5));
  const data = last30.map(d => expenseByDay[d]);

  const ctx = document.getElementById('trend-chart').getContext('2d');
  if (trendChart) trendChart.destroy();

  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '日支出',
        data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointHitRadius: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ¥${ctx.raw.toFixed(2)}`
          }
        }
      },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 10,
            font: { size: 11 }
          },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: v => '¥' + v,
            font: { size: 11 }
          },
          grid: { color: '#f0f0f0' }
        }
      }
    }
  });
}

function updateInsight(insights) {
  const section = document.getElementById('insight-section');
  const text = document.getElementById('insight-text');
  if (insights && insights.length > 0) {
    const latest = insights[insights.length - 1];
    text.textContent = latest.content;
    section.style.display = 'block';
  } else {
    section.style.display = 'none';
  }
}

function updateRecentTable(records) {
  const tbody = document.querySelector('#recent-table tbody');
  const recent = [...records]
    .sort((a, b) => b.date.localeCompare(a.date) || b.time?.localeCompare(a.time || ''))
    .slice(0, 10);

  if (recent.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">暂无记录，通过微信发送记账信息开始使用</td></tr>';
    return;
  }

  tbody.innerHTML = recent.map(r => {
    const cls = r.type === 'income' ? 'income-row' : 'expense-row';
    const sign = r.type === 'income' ? '+' : '-';
    return `
      <tr class="${cls}">
        <td>${r.date.slice(5)}</td>
        <td><span class="cat-tag" style="background:${CATEGORY_COLORS[r.category] || '#6b7280'}20;color:${CATEGORY_COLORS[r.category] || '#6b7280'}">${CATEGORY_ICONS[r.category] || ''} ${r.category}</span></td>
        <td>${escHtml(r.item)}</td>
        <td class="amount">${sign}¥${r.amount.toFixed(2)}</td>
        <td class="note">${escHtml(r.note || '')}</td>
      </tr>
    `;
  }).join('');
}

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function refresh() {
  const ledger = await fetchData();
  const records = ledger.records || [];
  updateOverview(records);
  updateCategoryChart(records);
  updateTrendChart(records);
  updateInsight(ledger.insights);
  updateRecentTable(records);
}

// 初始化
refresh();

// 每 30 秒自动刷新
setInterval(refresh, 30000);
