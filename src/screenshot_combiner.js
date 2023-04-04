  const sharp = require('sharp');

async function combineImagesWithLineAndBorder(image1Path, image2Path, outputImagePath) {
  // Load the two images
  const image1 = sharp(image1Path);
  const image2 = sharp(image2Path);

  // Get the metadata of the two images
  const [metadata1, metadata2] = await Promise.all([image1.metadata(), image2.metadata()]);

  // Ensure the images have the same height
  if (metadata1.height !== metadata2.height) {
    throw new Error('The two images have different heights');
  }

  // Create a 1px black vertical line
  const verticalLineWidth = 4;
  const verticalLine = await sharp({
    create: {
      width: verticalLineWidth,
      height: metadata1.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  }).png().toBuffer();

  // Convert the two images to buffers
  const image1Buffer = await image1.toBuffer();
  const image2Buffer = await image2.toBuffer();

  // Combine the two images with a vertical line between them
  const combinedImage = await sharp({
    create: {
      width: metadata1.width + metadata2.width + verticalLineWidth,
      height: metadata1.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: image1Buffer, left: 0, top: 0 },
      { input: verticalLine, left: metadata1.width, top: 0 },
      { input: image2Buffer, left: metadata1.width + verticalLineWidth, top: 0 },
    ])
    .jpeg()
    .toBuffer();

  // Add a 1px black border around the combined image
  const borderWidth = 1;
  const borderedImage = await sharp(combinedImage)
    .extend({
      top: borderWidth,
      bottom: borderWidth,
      left: borderWidth,
      right: borderWidth,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    })
    .toBuffer();

  // Save the bordered image to the output path
  await sharp(borderedImage).toFile(outputImagePath);
}

const image1Path = 'close.png';
const image2Path = 'far.png';
const outputImagePath = 'combined.png';

combineImagesWithLineAndBorder(image1Path, image2Path, outputImagePath)
  .then(() => console.log(`Combined images with border saved as ${outputImagePath}`))
  .catch((error) => console.error(error));
