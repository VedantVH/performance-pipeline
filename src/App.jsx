import { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Chart from 'chart.js/auto'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const chartRef = useRef(null)
  const canvasRef = useRef(null)

  // Intentionally block the main thread to ruin Total Blocking Time (TBT)
  useEffect(() => {
    const start = Date.now();
    while (Date.now() - start < 1500) {
      // block the thread for 1.5 seconds
    }
  }, []);

  // Fetch and render score history chart
  useEffect(() => {
    fetch('/scores.json')
      .then(res => res.json())
      .then(data => {
        if (!data || data.length === 0) return;

        const ctx = canvasRef.current.getContext('2d');
        if (chartRef.current) {
          chartRef.current.destroy();
        }

        chartRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
            datasets: [{
              label: 'Lighthouse Performance Score',
              data: data.map(d => d.score),
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
              fill: false
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                min: 0,
                max: 100
              }
            },
            plugins: {
              annotation: { // using basic plugin or drawing line directly
                afterDraw: (chart) => {
                  const ctx = chart.ctx;
                  const yAxis = chart.scales.y;
                  const xAxis = chart.scales.x;
                  const y = yAxis.getPixelForValue(80);

                  ctx.save();
                  ctx.beginPath();
                  ctx.moveTo(xAxis.left, y);
                  ctx.lineTo(xAxis.right, y);
                  ctx.lineWidth = 2;
                  ctx.strokeStyle = 'red';
                  ctx.setLineDash([5, 5]);
                  ctx.stroke();
                  ctx.restore();

                  ctx.fillStyle = 'red';
                  ctx.fillText('Pass Threshold (80)', xAxis.right - 100, y - 5);
                }
              }
            }
          },
          plugins: [{
            id: 'thresholdLine',
            afterDraw: (chart) => {
              const yAxis = chart.scales.y;
              const xAxis = chart.scales.x;
              const y = yAxis.getPixelForValue(80);
              const ctx = chart.ctx;
              ctx.save();
              ctx.beginPath();
              ctx.moveTo(xAxis.left, y);
              ctx.lineTo(xAxis.right, y);
              ctx.lineWidth = 2;
              ctx.strokeStyle = 'red';
              ctx.setLineDash([5, 5]);
              ctx.stroke();
              ctx.restore();
              ctx.fillStyle = 'red';
              ctx.fillText('Pass Threshold (80)', xAxis.right - 120, y - 5);
            }
          }]
        });
      })
      .catch(err => console.error("Could not fetch score history:", err));

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    }
  }, []);

  return (
    <>
      <div>
        {/* Massive unoptimized image without width/height to cause layout shifts and bad LCP */}
        <img
          src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=3000&auto=format&fit=crop"
          alt="Massive unoptimized bg"
          style={{ width: '100%', maxWidth: '800px', display: 'block' }}
        />
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React (Demo)</h1>

      <div className="dashboard-container" style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem', background: '#f5f5f5', borderRadius: '8px', color: '#333' }}>
        <h2>Performance Score History</h2>
        <canvas ref={canvasRef}></canvas>
      </div>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
