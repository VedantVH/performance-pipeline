import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  // Intentionally block the main thread to ruin Total Blocking Time (TBT)
  useEffect(() => {
    const start = Date.now();
    while (Date.now() - start < 1500) {
      // block the thread for 1.5 seconds
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
      <h1>Vite + React</h1>
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
