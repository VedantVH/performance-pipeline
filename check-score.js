import fs from 'fs';

const reportPath = './lh-report.report.json';
const THRESHOLD = process.env.PERF_THRESHOLD ? parseFloat(process.env.PERF_THRESHOLD) : 0.8; // 80/100

try {
    const reportData = fs.readFileSync(reportPath, 'utf8');
    const report = JSON.parse(reportData);

    // Lighthouse scores are 0.0 to 1.0
    const performanceScore = report.categories.performance.score;

    console.log(`Lighthouse Performance Score: ${Math.round(performanceScore * 100)} / 100`);
    console.log(`Threshold: ${Math.round(THRESHOLD * 100)} / 100`);

    // Append to scores.json
    const scoresFilePath = './public/scores.json';
    try {
        let scoresHistory = [];
        if (fs.existsSync(scoresFilePath)) {
            const historyData = fs.readFileSync(scoresFilePath, 'utf8');
            scoresHistory = JSON.parse(historyData);
        }

        scoresHistory.push({
            timestamp: new Date().toISOString(),
            score: Math.round(performanceScore * 100),
            sha: process.env.GITHUB_SHA || 'local'
        });

        fs.writeFileSync(scoresFilePath, JSON.stringify(scoresHistory, null, 2));
        console.log('✅ Appended score to public/scores.json');
    } catch (err) {
        console.error('⚠️ Could not append score to history:', err.message);
    }

    if (performanceScore < THRESHOLD) {
        console.error(`🚨 Gate Failed: Performance score is below the threshold!`);
        process.exit(1);
    } else {
        console.log(`✅ Gate Passed: Performance code meets the requirement.`);
        process.exit(0);
    }
} catch (error) {
    console.error('Error reading or parsing the Lighthouse report:', error.message);
    process.exit(1);
}
