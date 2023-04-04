const puppeteer = require('puppeteer');
const fs = require('fs');

const RESTART_INTERVAL = 10000; // 10 seconds in milliseconds
const PUP_BROWSER_LOCATION = fs.readFileSync('../config/PUP-BROWSER-LOCATION.txt', 'utf8').trim();

    console.log(`==== crawl-position.js ====`);
    console.log(` `);

(async function runScript() {
  const startTime = process.hrtime();

  try {
    // Read the ICAO ID from config-icao-id.txt
    const ICAO_ID = fs.readFileSync('../config/ICAO-ID.txt', 'utf8').trim();

    const browser = await puppeteer.launch({
      executablePath: PUP_BROWSER_LOCATION,
      headless: true
    });
    const page = await browser.newPage();

    // Set user-agent to Opera for Windows 10 Pro
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 OPR/45.0.2552.635');

    // Visit the website with the specified ICAO ID
    await page.goto(`https://globe.adsbexchange.com/?icao=${ICAO_ID}`, { waitUntil: 'networkidle2' });

    // Wait for the #selected_position element to load
    await page.waitForSelector('#selected_position');

    // Extract the required data
    const infoData = await page.$eval('#selected_position', span => span.textContent);
    const [LAT, LONG] = infoData.split(',');

    console.log(`=> Latitude: ${LAT.trim()}`);
    console.log(`=> Longitude: ${LONG.trim()}`);

    // Write data to files
    fs.writeFileSync('../data/LAT.txt', LAT.trim().slice(0, -1));
    fs.writeFileSync('../data/LONG.txt', LONG.trim().slice(0, -1));

    await browser.close();

    const elapsedTime = process.hrtime(startTime);
    const elapsedTimeInSeconds = (elapsedTime[0] + elapsedTime[1] / 1e9).toFixed(2);
    console.log(`Script completed in ${elapsedTimeInSeconds} seconds.`);
    console.log(`====================================================`);
    console.log(` `);
  } catch (error) {
    console.error(error);
    console.log('An error occurred. Restarting the script after a certain interval...');
    // Restart the script after a certain interval
    setTimeout(runScript, RESTART_INTERVAL);
  }
})();
