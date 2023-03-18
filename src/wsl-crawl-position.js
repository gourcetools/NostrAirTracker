const puppeteer = require('puppeteer');
const fs = require('fs');

const RESTART_INTERVAL = 10000; // 10 seconds in milliseconds

(async function runScript() {
  const startTime = process.hrtime();

  try {
    console.log('Reading ICAO ID from file...');
    // Read the ICAO ID from config-icao-id.txt
    const ICAO_ID = fs.readFileSync('../config/ICAO-ID.txt', 'utf8').trim();

    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome', // Replace with your path to Chromium browser executable
      headless: true,
      args: ['--disable-dev-shm-usage'] // Disable /dev/shm usage to reduce memory usage
    });
    const page = await browser.newPage();

    console.log('Setting user-agent...');
    // Set user-agent to Opera for Windows 10 Pro
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 OPR/45.0.2552.635');

    console.log(`Navigating to https://globe.adsbexchange.com/?icao=${ICAO_ID}...`);
    // Visit the website with the specified ICAO ID
    await page.goto(`https://globe.adsbexchange.com/?icao=${ICAO_ID}`, { waitUntil: 'networkidle2' });

    console.log('Waiting for #selected_position element to load...');
    // Wait for the #selected_position element to load
    await page.waitForSelector('#selected_position');

    console.log('Extracting required data...');
    // Extract the required data
    const infoData = await page.$eval('#selected_position', span => span.textContent);
    const [LAT, LONG] = infoData.split(',');

    console.log(`Latitude: ${LAT.trim()}`);
    console.log(`Longitude: ${LONG.trim()}`);

    console.log('Writing data to files...');
    // Write data to files
    fs.writeFileSync('../data/LAT.txt', LAT.trim().slice(0, -1));
    fs.writeFileSync('../data/LONG.txt', LONG.trim().slice(0, -1));

    console.log('Closing browser...');
    await page.close();
    await browser.close();

    const elapsedTime = process.hrtime(startTime);
    const elapsedTimeInSeconds = (elapsedTime[0] + elapsedTime[1] / 1e9).toFixed(2);
    console.log(`Script completed in ${elapsedTimeInSeconds} seconds.`);
  } catch (error) {
    console.error(error);
  } finally {
    console.log('Freeing up resources...');
    // Free up resources
    global.gc(); // Run garbage collector
    setTimeout(runScript, RESTART_INTERVAL); // Restart the script after a certain interval
  }
})();
