import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import viteLogo from '/vite.svg'
import reactLogo from './assets/react.svg'
import './App.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [history, setHistory] = useState([]);
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    fetch('/scores.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setHistory(data);
          setLatest(data[data.length - 1]);
        }
      })
      .catch(err => console.error("Failed to load scores:", err));
  }, []);

  const chartData = {
    labels: history.map(h => new Date(h.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Performance Score',
        data: history.map(h => h.score),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: { min: 0, max: 100, grid: { color: '#334155' } },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { display: false }
    }
  };

  const getMetricStatus = (val, type) => {
    if (type === 'lcp') return val < 2500 ? 'Good' : val < 4000 ? 'Average' : 'Poor';
    if (type === 'tbt') return val < 200 ? 'Good' : val < 600 ? 'Average' : 'Poor';
    if (type === 'cls') return val < 0.1 ? 'Good' : val < 0.25 ? 'Average' : 'Poor';
  };

  const getStatusClass = (status) => {
    if (status === 'Good') return 'status-good';
    if (status === 'Average') return 'status-average';
    return 'status-poor';
  };

  return (
    <div className="app-container">
      <header className="dashboard-header">
        <div className="logo-group">
          <img src={viteLogo} className="mini-logo" alt="Vite" />
          <img src={reactLogo} className="mini-logo" alt="React" />
          <h1>PerfGate Analytics</h1>
        </div>
        <div className="status-badge" style={{ color: latest?.status === 'PASS' ? '#4ade80' : '#f87171' }}>
          システムステータス: {latest?.status || 'UNKNOWN'}
        </div>
      </header>

      {latest && latest.score < (history[history.length - 2]?.score - 5) && (
        <div className="regression-alert">
          <span>⚠️</span>
          <strong>Performance Regression Detected:</strong>
          Your latest score dropped by {history[history.length - 2].score - latest.score} points compared to the last deployment.
        </div>
      )}

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Lighthouse Overall</div>
          <div className="hero-score" style={{ color: latest?.score >= 90 ? '#22c55e' : latest?.score >= 50 ? '#f59e0b' : '#ef4444' }}>
            {latest?.score || '--'}
          </div>
          <p className="text-secondary">Overall Score</p>
        </div>

        <div className="metric-card">
          <div className="metric-label">Largest Contentful Paint</div>
          <div className="metric-value">{latest?.metrics?.lcp ? Math.round(latest.metrics.lcp) + 'ms' : '--'}</div>
          <div className={`metric-status ${getStatusClass(getMetricStatus(latest?.metrics?.lcp, 'lcp'))}`}>
            {getMetricStatus(latest?.metrics?.lcp, 'lcp')}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Total Blocking Time</div>
          <div className="metric-value">{latest?.metrics?.tbt ? Math.round(latest.metrics.tbt) + 'ms' : '--'}</div>
          <div className={`metric-status ${getStatusClass(getMetricStatus(latest?.metrics?.tbt, 'tbt'))}`}>
            {getMetricStatus(latest?.metrics?.tbt, 'tbt')}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Cumulative Layout Shift</div>
          <div className="metric-value">{latest?.metrics?.cls?.toFixed(3) || '--'}</div>
          <div className={`metric-status ${getStatusClass(getMetricStatus(latest?.metrics?.cls, 'cls'))}`}>
            {getMetricStatus(latest?.metrics?.cls, 'cls')}
          </div>
        </div>
      </div>

      <section className="chart-section">
        <h2>Performance Trend</h2>
        <div style={{ height: '300px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </section>

      <section>
        <h2>Deployment History</h2>
        <table className="history-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Score</th>
              <th>Status</th>
              <th>Commit</th>
            </tr>
          </thead>
          <tbody>
            {[...history].reverse().map((h, i) => (
              <tr key={i}>
                <td>{new Date(h.timestamp).toLocaleString()}</td>
                <td><strong>{h.score}</strong></td>
                <td>
                  <span className={`metric-status ${h.status === 'PASS' ? 'status-good' : 'status-poor'}`}>
                    {h.status}
                  </span>
                </td>
                <td>
                  <a href={`https://github.com/VedantVH/performance-pipeline/commit/${h.sha}`} target="_blank" className="sha-link">
                    {h.sha.substring(0, 7)}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default App
