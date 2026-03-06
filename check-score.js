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
