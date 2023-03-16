const puppeteer = require('puppeteer');
const fs = require('fs');

const RESTART_INTERVAL = 10000; // 10 seconds in milliseconds

(async function runScript() {
  try {
    // Read the ICAO ID from config-icao-id.txt
    const ICAO_ID = fs.readFileSync('../config/ICAO-ID.txt', 'utf8').trim();

    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser', // Replace with your path to Chromium browser executable
      headless: true
    });
    const page = await browser.newPage();

    // Set user-agent to Opera for Windows 10 Pro
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 OPR/45.0.2552.635');

    // Visit the website with the specified ICAO ID
    page.goto(`https://globe.adsbexchange.com/?icao=${ICAO_ID}`);

    // Wait for 10 seconds
    await page.waitForTimeout(10000);

    // Click the "X" button to stop any loading process on the page
    await page.evaluate(() => window.stop());

    // Extract the required data
    const infoData = await page.$eval('#selected_position', span => span.textContent);
    const [LAT, LONG] = infoData.split(',');

    console.log(`Latitude: ${LAT.trim()}`);
    console.log(`Longitude: ${LONG.trim()}`);

    // Write data to files
    fs.writeFileSync('../data/LAT.txt', LAT.trim().slice(0, -1));
    fs.writeFileSync('../data/LONG.txt', LONG.trim().slice(0, -1));

    await browser.close();
  } catch (error) {
    console.error(error);
    // Restart the script after a certain interval
    setTimeout(runScript, RESTART_INTERVAL);
  }
})();
