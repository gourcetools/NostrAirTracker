const puppeteer = require('puppeteer');
const sharp = require('sharp');

console.log(`==> Let's take a screenshot`);

async function takeScreenshot(url, output_path, zoom_count, cropSettings) {
  // Launch the browser
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome', // or '/usr/bin/chromium-browser' if you are using Chromium
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Open the URL
  console.log(`==> Open the URL`)
  await page.goto(url, { waitUntil: 'networkidle0' });
  
  // Wait for the map to load
  console.log(`==> Wait for the map to load`)
  await page.waitForTimeout(10000);

  // Zoom in on the map
  console.log(`==> Zooming in`)
  for (let i = 0; i < zoom_count; i++) {
    await page.keyboard.press('+');
    await page.waitForTimeout(1000);
  }

  // Take a screenshot
  console.log(`==> Take a screenshot`)
  const screenshotBuffer = await page.screenshot();

  // Crop the screenshot
  console.log(`==> Save the cropped screenshot`)
  const croppedBuffer = await cropImage(screenshotBuffer, cropSettings);

  // Save the cropped screenshot
  console.log(`==> Close the browser`)
  await sharp(croppedBuffer).toFile(output_path);

  // Close the browser
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

const url = 'https://globe.adsbexchange.com/?icao=a835af';
const output_path = 'screenshot.png';
const zoom_count = 5;

const cropSettings = {
  left: 250,
  top: 300,
  right: 700,
  bottom: 310,
};


(async () => {
  const startTime = Date.now();

  await takeScreenshot(url, output_path, zoom_count, cropSettings);

  const endTime = Date.now();
  const executionTime = (endTime - startTime) / 1000;
  console.log(`==> Execution time: ${executionTime.toFixed(2)} seconds`);
})();
