import fs from 'fs';

const reportPath = './lh-report.report.json';
const THRESHOLD = process.env.PERF_THRESHOLD ? parseFloat(process.env.PERF_THRESHOLD) : 0.8; // 80/100
const scoresFilePath = './public/scores.json';

try {
    const reportData = fs.readFileSync(reportPath, 'utf8');
    const report = JSON.parse(reportData);

    // Lighthouse scores are 0.0 to 1.0
    const performanceScore = report.categories.performance.score;
    const scorePct = Math.round(performanceScore * 100);

    // Extract Core Web Vitals
    // Note: Scores are 0-1, numericValue is the actual metric (ms, etc)
    const metrics = {
        lcp: report.audits['largest-contentful-paint'].numericValue,
        tbt: report.audits['total-blocking-time'].numericValue,
        cls: report.audits['cumulative-layout-shift'].numericValue,
    };

    console.log(`Lighthouse Performance Score: ${scorePct} / 100`);
    console.log(`Metrics: LCP: ${Math.round(metrics.lcp)}ms | TBT: ${Math.round(metrics.tbt)}ms | CLS: ${metrics.cls.toFixed(3)}`);

    let regressionDetected = false;
    let regressionValue = 0;

    // Read history to check for regressions
    try {
        let scoresHistory = [];
        if (fs.existsSync(scoresFilePath)) {
            const historyData = fs.readFileSync(scoresFilePath, 'utf8');
            scoresHistory = JSON.parse(historyData);
        }

        if (scoresHistory.length > 0) {
            const lastScore = scoresHistory[scoresHistory.length - 1].score;
            if (scorePct < lastScore - 5) {
                regressionDetected = true;
                regressionValue = lastScore - scorePct;
                console.error(`🚨 REGRESSION DETECTED: Score dropped from ${lastScore} to ${scorePct} (Loss of ${regressionValue} points)`);
            }
        }

        // Append to history
        scoresHistory.push({
            timestamp: new Date().toISOString(),
            score: scorePct,
            metrics: metrics,
            sha: process.env.GITHUB_SHA || 'local',
            status: scorePct < (THRESHOLD * 100) || regressionDetected ? 'FAIL' : 'PASS'
        });

        fs.writeFileSync(scoresFilePath, JSON.stringify(scoresHistory, null, 2));
        console.log('✅ Updated performance history in public/scores.json');
    } catch (err) {
        console.error('⚠️ Could not update history:', err.message);
    }

    // Pass/Fail Logic
    if (performanceScore < THRESHOLD) {
        console.error(`🚨 Gate Failed: Performance score (${scorePct}) is below the threshold (${THRESHOLD * 100})!`);
        process.exit(1);
    } else if (regressionDetected) {
        console.error(`🚨 Gate Failed: Performance regression detected! Drop of ${regressionValue} points is too high.`);
        process.exit(1);
    } else {
        console.log(`✅ Gate Passed: Performance code meets all requirements.`);
        process.exit(0);
    }
} catch (error) {
    console.error('Error reading or parsing the Lighthouse report:', error.message);
    process.exit(1);
}
