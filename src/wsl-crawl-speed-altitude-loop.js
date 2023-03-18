const puppeteer = require('puppeteer');
const fs = require('fs');

// Define the minimum and maximum delay times (in milliseconds) for the loop
// and the ICAO ID for the aircraft to track
// Configuration object for application settings

const CONFIG = {
  // Minimum delay in minutes between each check (default: 1 minutes)
  MIN_DELAY: (parseInt(process.env.MIN_DELAY, 10) || 1) * 60 * 1000,

  // Maximum delay in minutes between each check (default: 15 minutes)
  MAX_DELAY: (parseInt(process.env.MAX_DELAY, 10) || 1) * 60 * 1000,
};


// Read the ICAO ID from config-icao-id.txt
const ICAO_ID = fs.readFileSync('../config/ICAO-ID.txt', 'utf8').trim();

console.log('╔═════════════════════════════════════════╗');
console.log('║ 👋  Welcome to NostrAirTracker          ║');
console.log('╚═════════════════════════════════════════╝'); 
console.log(' Check for updates at:'); 
console.log(' https://github.com/gourcetools/NostrAirTracker'); 
console.log(` `);
console.log(` `);
console.log(` `);
console.log(` Let's see what's happening with ${ICAO_ID}...`);
console.log(` `);

// Create an async function that will contain a while loop
(async () => {
  // Variables to store previous altitude and speed
  let prevAltitude = 0;
  let prevSpeed = 0;
  let prevStatus = 'Parked';
  let retries = 0;
  const MAX_RETRIES = 99;

  // Update status function
  function updateStatus(newStatus) {
    if (newStatus === prevStatus) {
      return;
    }
    prevStatus = newStatus;
  }

  // Enter an infinite while loop
  while (true) {
    try {
      // Initialize some variables
      let isOnGround = true;
      let isGettingData = false;
      let wasOnGround = true;
      let wasGettingData = false;

      // Set the maximum number of retries...
      const MAX_RETRIES = 99;
      console.log(`  Crawling... `);
      const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome', // Replace with your path to Chromium browser executable
        headless: true
      });
      const page = await browser.newPage();

      // [Browser setup and navigation]



        const userAgentList = [
          // Chrome for Windows
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
          // Chrome for macOS
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
          // Firefox for Windows
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:85.0) Gecko/20100101 Firefox/85.0',
          // Firefox for macOS
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:85.0) Gecko/20100101 Firefox/85.0',
          // Safari for macOS
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
          // Opera for Windows
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36 OPR/74.0.3911.218'
        ];
        
        function getRandomUserAgent() {
          return userAgentList[Math.floor(Math.random() * userAgentList.length)];
        }

        // Set a random user-agent
        await page.setUserAgent(getRandomUserAgent());

      // Visit the website with the specified ICAO ID
      while (true) {
        try {
          await page.goto(`https://globe.adsbexchange.com/?icao=${ICAO_ID}`);
          break;
        } catch (error) {
          if (retries < MAX_RETRIES) {
            console.log(`Navigation timeout. Retrying... (${retries + 1}/${MAX_RETRIES})`);
            retries++;
          } else {
            throw error;
          }
        }
      }


      retries = 0;

      // Wait for 10 seconds
      await page.waitForTimeout(10000);

      // Click the "X" button to stop any loading process on the page
      await page.evaluate(() => window.stop());


      // Extract the required data
      const altitudeData = await page.$eval('#selected_altitude1', span => span.textContent);
      let ALTITUDE;

      if (altitudeData.trim().toLowerCase() === "on ground") {
        ALTITUDE = 0;
        isOnGround = true;
      } else {
        ALTITUDE = parseInt(altitudeData.replace(/[^\d]/g, ''), 10);
        isOnGround = false;
      }

      const speedData = await page.$eval('#selected_speed1', span => span.textContent);
      const SPEED = parseFloat(speedData);

      if (!isNaN(SPEED) && !isNaN(ALTITUDE)) {
        isGettingData = true;
      } else {
        isGettingData = false;
      }

      const infoSeenPos = await page.$eval('#selected_seen_pos', span => span.textContent);
      const LAST_SEEN = infoSeenPos.trim();

      // Determine the aircraft's status based on altitude, speed changes, and previous status
      if (isGettingData) {
        if (prevStatus === 'Flying' && ALTITUDE <= 100 && SPEED <= 100) {
          updateStatus('Landed');
        } else if ((prevStatus === 'Parked' || prevStatus === 'Landed') && ALTITUDE > 100 && SPEED > 100) {
          updateStatus('Took Off');
        } else if ((prevStatus === 'Took Off' || prevStatus === 'Flying') && ALTITUDE > 100 && SPEED > 100) {
          updateStatus('Flying');
        } else if (prevStatus === 'Landed' && ALTITUDE <= 100 && SPEED <= 10) {
          updateStatus('Parked');
        }
      } else {
        if (prevStatus === '') {
          updateStatus('Parked');
        } else {
          updateStatus('Offline');
        }
      }

      // Save "Took Off" or "Landed" events to the STATUS.txt file
      if (prevStatus === 'Took Off' || prevStatus === 'Landed') {
        fs.writeFileSync('../data/STATUS.txt', prevStatus);
      }

      // Update the variables for the next iteration
      wasOnGround = isOnGround;
      wasGettingData = isGettingData;
      prevAltitude = ALTITUDE;
      prevSpeed = SPEED;

      // Echo data to console
      console.log(` ╔═ icao id:  ${ICAO_ID}  ══════`);
      console.log(` ║  🌐  STATUS: ${prevStatus} `);
      console.log(` ║  🏔️   ALTITUDE: ${ALTITUDE} `);
      console.log(` ║  💨  SPEED: ${SPEED}`);
      console.log(` ║  👀  LAST SEEN: ${LAST_SEEN}`);

      fs.writeFileSync('../data/STATUS.txt', prevStatus);

      // Close the browser after completing the current iteration
      await browser.close();
    } catch (error) {
      console.error('An error occurred:', error);
      console.log('Continuing to the next iteration...');
    }

    // Wait for a random delay time between MIN_DELAY and MAX_DELAY
    const delay = Math.floor(Math.random() * (CONFIG.MAX_DELAY - CONFIG.MIN_DELAY + 1)) + CONFIG.MIN_DELAY;
    const delayMinutes = Math.floor(delay / 60000);
    const delaySeconds = Math.floor((delay % 60000) / 1000);
    console.log(` ║    Next check: ${delayMinutes}m ${delaySeconds}s.`);
    console.log(` ╚══════════════════════ `);

    await new Promise(resolve => setTimeout(resolve, delay));
  }
})();
