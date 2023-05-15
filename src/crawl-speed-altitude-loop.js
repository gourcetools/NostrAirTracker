const puppeteer = require('puppeteer');
const readline = require('readline');
const fs = require('fs');



// Define the minimum and maximum delay times (in milliseconds) for the loop
// and the ICAO ID for the aircraft to track
// Configuration object for application settings

const CONFIG = {
  // Minimum delay in minutes between each check (default: 1 minutes)
  MIN_DELAY: (parseInt(process.env.MIN_DELAY, 10) || 1) * 60 * 1000,

  // Maximum delay in minutes between each check (default: 15 minutes)
  MAX_DELAY: (parseInt(process.env.MAX_DELAY, 10) || 10) * 60 * 1000,
};



// Read the ICAO ID from config-icao-id.txt
const ICAO_ID = fs.readFileSync('../config/ICAO-ID.txt', 'utf8').trim();
const PUP_BROWSER_LOCATION = fs.readFileSync('../config/PUP-BROWSER-LOCATION.txt', 'utf8').trim();


console.log('╔═════════════════════════════════════════╗');
console.log('║ 👋  Welcome to NostrAirTracker          ║');
console.log('╚═════════════════════════════════════════╝'); 
console.log(' Check for updates at:'); 
console.log(' https://github.com/gourcetools/NostrAirTracker'); 
console.log(` `);
console.log(` ICAO SET TO: ${ICAO_ID}...`);
console.log(` `);


// Function to wait for any key press
function waitForAnyKey(promptMessage) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(promptMessage, () => {
      rl.close();
      process.stdin.removeAllListeners('end');
      process.stdin.removeAllListeners('error');
      process.stdin.removeAllListeners('keypress');
      process.stdout.removeAllListeners('resize');
      resolve();
    });
  });
}





// Create an async function that will contain a while loop
(async () => {

  // Variables to store previous altitude and speed
  let prevAltitude = 0;
  let prevSpeed = 0;
  let prevStatus = 'Parked';
  let retries = 0;

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
      const browser = await puppeteer.launch({
        executablePath: PUP_BROWSER_LOCATION,
        headless:  "new"
      });
      const page = await browser.newPage();

      // Record the start time
      const startTime = new Date().getTime();
  


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


function lastSeenToMinutes(lastSeen) {
  const units = lastSeen.split(' ');
  const value = parseFloat(units[0]);
  let minutes = 0;

  if (units[1] === 's') {
    minutes = value / 60;
  } else if (units[1] === 'min') {
    minutes = value;
  } else if (units[1] === 'h') {
    minutes = value * 60;
  }

  return minutes;
}

const lastSeenMinutes = lastSeenToMinutes(LAST_SEEN);


// Calculate time difference between now and the last seen time
const lastSeenTime = new Date(LAST_SEEN);
console.log(`${lastSeenMinutes} - ${LAST_SEEN} `);


// Determine the aircraft's status based on altitude, time since last seen, and previous status

// If the previous status was 'Flying', the current altitude is less than or equal to 15000 or N/A,
// and the last seen time is more than 5 minutes ago, the aircraft has landed near
if (prevStatus === 'Flying' && (isNaN(ALTITUDE) || ALTITUDE <= 15000) && lastSeenMinutes > 20) {
  updateStatus('Landed near');
  console.log('Last seen < 20 min, plane is under 15000 - Landed near');

// If the previous status was 'Flying' and the current altitude is 500 or below and speed is 150 or below, the aircraft has landed
} else if (prevStatus === 'Flying' && ALTITUDE <= 500 && SPEED <= 150) {
  updateStatus('Landed');
  console.log('Altitude under 500 and speed is under 150 - Landed');

// If the previous status was 'Parked' or 'Landed', and the current altitude is above 500 and speed is above 150, the aircraft has taken off
} else if ((prevStatus === 'Parked' || prevStatus === 'Landed') && ALTITUDE > 500 && SPEED > 150) {
  updateStatus('Took Off');
  console.log('Last status was Parked or Landed, plane is above 500 and speed is above 150 - Took Off');

// If the previous status was 'Took Off' or 'Flying' and the current altitude is above 500 and speed is above 150, the aircraft is flying
} else if ((prevStatus === 'Took Off' || prevStatus === 'Flying') && ALTITUDE > 500 && SPEED > 150) {
  updateStatus('Flying');
  console.log('Already took off, now flying.');

// If the previous status was 'Landed' and the current altitude is 500 or below and speed is 10 or below, the aircraft is parked
} else if ((prevStatus === 'Landed' || prevStatus === 'Landed near') && ALTITUDE <= 500 && SPEED <= 10) {
  updateStatus('Parked');
  console.log('Now Parked');
} else {
  if (prevStatus === '') {
    // If there's no previous status and no data, set the status to 'Parked'
    updateStatus('Parked');
    console.log('No previous status and no data - Parked');
  } else {
    // If the aircraft is offline, set the status to the last known status and continue the loop
    updateStatus(prevStatus);
    console.log('Aircraft is offline - Not changing status');
  }
}


// Save "Took Off" or "Landed" or "Landed near" events to the STATUS.txt file
if (prevStatus === 'Took Off' || prevStatus === 'Landed' || prevStatus === 'Landed near') {
  fs.writeFileSync('../data/STATUS.txt', prevStatus);
}


      // Update the variables for the next iteration
      wasOnGround = isOnGround;
      wasGettingData = isGettingData;
      prevAltitude = ALTITUDE;
      prevSpeed = SPEED;

// Calculate elapsed time
const endTime = new Date().getTime();
const elapsedTime = endTime - startTime;
const elapsedTimeSeconds = (elapsedTime / 1000).toFixed(2);



// Echo data to console
console.log(` ╔═ icao id:  ${ICAO_ID}  ══════`);
console.log(` ║  🌐  STATUS: ${prevStatus} `);
console.log(` ║  🏔️   ALTITUDE: ${ALTITUDE} `);
console.log(` ║  💨  SPEED: ${SPEED}`);
console.log(` ║  👀  LAST SEEN: ${LAST_SEEN}`);
console.log(` ║  ⏱️   CRAWL PROCESS TOOK ${elapsedTimeSeconds}s`) ;
fs.writeFileSync('../data/STATUS.txt', prevStatus);


// Close the browser after completing the current iteration
await browser.close();

// Custom timeouts
let timeout = 20 * 60 * 1000;

} catch (error) {
  console.error('An error occurred:', error);
  console.log('Continuing to the next iteration...');
}

// Wait for a random delay time between MIN_DELAY and MAX_DELAY
const delay = Math.floor(Math.random() * (CONFIG.MAX_DELAY - CONFIG.MIN_DELAY + 1)) + CONFIG.MIN_DELAY;
const delayMinutes = Math.floor(delay / 60000);
const delaySeconds = Math.floor((delay % 60000) / 1000);
console.log(` ║   ... next check: ${delayMinutes}m ${delaySeconds}s `);
console.log(` ╚════> or press ENTER to check now.`);

// Wait for a custom delay or a key press
await Promise.race([
  new Promise((resolve) => setTimeout(resolve, delay)), // Replace 'timeout' with 'delay'
  waitForAnyKey(''),
]);

  }
})();
