import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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
  Legend,
  Filler
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  }
};

function App() {
  const [history, setHistory] = useState([]);
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}scores.json`)
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
        label: 'Performance',
        data: history.map(h => h.score),
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#22d3ee',
        pointBorderColor: '#fff',
        pointHoverRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { family: 'Rajdhani', weight: 600 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { family: 'Rajdhani', weight: 600 } }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { family: 'Rajdhani' },
        bodyFont: { family: 'Inter' },
        padding: 12,
        borderColor: 'rgba(34, 211, 238, 0.3)',
        borderWidth: 1
      }
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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="app-container"
    >
      <header className="dashboard-header">
        <motion.div variants={itemVariants} className="logo-group">
          <img src={`${import.meta.env.BASE_URL}vite.svg`} className="mini-logo" alt="Vite" />
          <img src={reactLogo} className="mini-logo" alt="React" />
          <h1>PerfGate Analytics</h1>
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="status-badge"
          style={{ color: latest?.status === 'PASS' ? '#4ade80' : '#f87171' }}
        >
          SYSTEM STATUS: {latest?.status || 'INITIALIZING'}
        </motion.div>
      </header>

      <AnimatePresence>
        {latest && latest.score < (history[history.length - 2]?.score - 5) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="regression-alert"
          >
            <span>🚨</span>
            <div>
              <strong>CRITICAL REGRESSION DETECTED</strong><br />
              Latest score dropped by {history[history.length - 2].score - latest.score} points. Deployment Gated.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="metric-grid">
        <motion.div variants={itemVariants} className="metric-card" whileHover={{ y: -10, boxShadow: '0 0 30px rgba(34, 211, 238, 0.2)' }}>
          <div className="metric-label">Global Health</div>
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="hero-score"
            style={{ color: latest?.score >= 90 ? '#4ade80' : latest?.score >= 50 ? '#fbbf24' : '#f87171' }}
          >
            {latest?.score || '--'}
          </motion.div>
          <div className="metric-status" style={{ marginTop: '1rem' }}>Performance Audit</div>
        </motion.div>

        <motion.div variants={itemVariants} className="metric-card" whileHover={{ y: -10 }}>
          <div className="metric-label">LCP (Load Performance)</div>
          <div className="metric-value">{latest?.metrics?.lcp ? Math.round(latest.metrics.lcp) + 'ms' : '--'}</div>
          <div className={`metric-status ${getStatusClass(getMetricStatus(latest?.metrics?.lcp, 'lcp'))}`}>
            {getMetricStatus(latest?.metrics?.lcp, 'lcp')}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="metric-card" whileHover={{ y: -10 }}>
          <div className="metric-label">TBT (Interactivity)</div>
          <div className="metric-value">{latest?.metrics?.tbt ? Math.round(latest.metrics.tbt) + 'ms' : '--'}</div>
          <div className={`metric-status ${getStatusClass(getMetricStatus(latest?.metrics?.tbt, 'tbt'))}`}>
            {getMetricStatus(latest?.metrics?.tbt, 'tbt')}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="metric-card" whileHover={{ y: -10 }}>
          <div className="metric-label">CLS (Visual Stability)</div>
          <div className="metric-value">{latest?.metrics?.cls?.toFixed(3) || '--'}</div>
          <div className={`metric-status ${getStatusClass(getMetricStatus(latest?.metrics?.cls, 'cls'))}`}>
            {getMetricStatus(latest?.metrics?.cls, 'cls')}
          </div>
        </motion.div>
      </div>

      <motion.section variants={itemVariants} className="chart-section">
        <h2>Performance Analytics Trend</h2>
        <div style={{ height: '350px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </motion.section>

      <motion.section variants={itemVariants}>
        <h2>Deployment History Log</h2>
        <table className="history-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Score</th>
              <th>Status</th>
              <th>Artifact</th>
            </tr>
          </thead>
          <tbody>
            {[...history].reverse().map((h, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <td>{new Date(h.timestamp).toLocaleString()}</td>
                <td><strong style={{ fontSize: '1.25rem', color: h.score >= 90 ? '#4ade80' : '#fbbf24' }}>{h.score}</strong></td>
                <td>
                  <span className={`metric-status ${h.status === 'PASS' ? 'status-good' : 'status-poor'}`}>
                    {h.status}
                  </span>
                </td>
                <td>
                  <a href={`https://github.com/VedantVH/performance-pipeline/commit/${h.sha}`} target="_blank" className="sha-link">
                    VIEW COMMIT {h.sha.substring(0, 7)}
                  </a>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.section>
    </motion.div>
  )
}

export default App
