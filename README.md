# Performance-Gated CI/CD Pipeline

[![Performance-Gated Deploy](https://github.com/VEDANTHONNANGI/performance-pipeline/actions/workflows/deploy.yml/badge.svg)](https://github.com/VEDANTHONNANGI/performance-pipeline/actions/workflows/deploy.yml)

Most projects focus on "Does it deploy?". This project focuses on **"Is it fast enough to deploy?"**

This repository demonstrates a **"Performance as Code"** concept by explicitly blocking deployments if the Lighthouse Performance Score falls below a configurable threshold (e.g., 80/100).

## 🚀 Features
- **Vite React Demo App**: Contains a Chart.js dashboard visualizing score history.
- **Lighthouse CLI Integration**: Headless performance auditing during the CI/CD phase.
- **Custom Performance Gate (`check-score.js`)**: A Node.js script that strictly enforces performance standards by failing the CI build if the threshold is not met.
- **Score History Dashboard**: Historical performance tracking over time.

## 🚦 How the Gate Works
1. Code is pushed to `main`.
2. GitHub Actions builds the project and starts a local server.
3. `lighthouse` CLI audits the local server and generates a JSON report.
4. `check-score.js` parses the report. If `score < 80`, `process.exit(1)` runs, immediately failing the pipeline and preventing bad code from reaching production.

## 📖 Architecture
See [ARCHITECTURE.md](./ARCHITECTURE.md) for a detailed breakdown of the system design and workflow.

## 🛠️ Local Setup
1. `npm install`
2. `npm run dev` (to run the app)
3. `npm run build && npx vite preview --port 5000` (to prep for local audit)
4. `npx lighthouse http://localhost:5000 --output html --output json --output-path ./lh-report --view`
5. `node check-score.js`

## ⚙️ Configuration
You can configure the passing threshold by setting a GitHub Actions Repository Variable named `PERF_THRESHOLD` (e.g., `0.9` for 90/100). The default is `0.8`.
