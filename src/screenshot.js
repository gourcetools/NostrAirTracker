const puppeteer = require('puppeteer');
const sharp = require('sharp');
const fs = require('fs');

const ICAO_ID = fs.readFileSync('../config/ICAO-ID.txt', 'utf8').trim();

const closeZoom = 9;
const farZoom = 3;

const cropSettings = {
  left: 400,
  top: 300,
  right: 850,
  bottom: 310,
};

const url = `https://globe.adsbexchange.com/?icao=${ICAO_ID}`;

console.log(`==> Let's take screenshots`);

async function takeScreenshots(url, closeOutputPath, farOutputPath, closeZoom, farZoom, cropSettings) {
  // Launch the browser
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome', // or '/usr/bin/chromium-browser' if you are using Chromium
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Open the URL
  console.log(`==> Open the URL`);
  await page.goto(url, { waitUntil: 'networkidle0' });

  // Wait for the map to load
  console.log(`==> Wait for the map to load`);
  await page.waitForTimeout(5000);

  // Zoom in on the map and take a close-up screenshot
  console.log(`==> Zooming in and taking a close-up screenshot`);
  for (let i = 0; i < closeZoom; i++) {
    await page.keyboard.press('+');
    await page.waitForTimeout(2000);
  }
  const closeScreenshotBuffer = await page.screenshot();
  const closeCroppedBuffer = await cropImage(closeScreenshotBuffer, cropSettings);
  await sharp(closeCroppedBuffer).toFile(closeOutputPath);

  // Zoom out and take a far-away screenshot
  console.log(`==> Zooming out and taking a far-away screenshot`);
  for (let i = 0; i < closeZoom + farZoom; i++) {
    await page.keyboard.press('-');
    await page.waitForTimeout(2000);
  }
  const farScreenshotBuffer = await page.screenshot();
  const farCroppedBuffer = await cropImage(farScreenshotBuffer, cropSettings);
  await sharp(farCroppedBuffer).toFile(farOutputPath);

  // Close the browser
  console.log(`==> Close the browser`);
  await browser.close();
}

async function cropImage(imageBuffer, cropSettings) {
  const { left, top, right, bottom } = cropSettings;
  const originalImage = sharp(imageBuffer);
  const { width, height } = await originalImage.metadata();

  const croppedWidth = width - left - right;
  const croppedHeight = height - top - bottom;

  return originalImage.extract({ left, top, width: croppedWidth, height: croppedHeight }).toBuffer();
}

(async () => {
  const startTime = Date.now();

  await takeScreenshots(url, 'close.png', 'far.png', closeZoom, farZoom, cropSettings);

  const endTime = Date.now();
  const executionTime = (endTime - startTime) / 1000;
  console.log(`==> Execution time: ${executionTime.toFixed(2)} seconds`);
})();


