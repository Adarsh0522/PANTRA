const sharp = require('sharp');
const path = require('path');

async function processLogo() {
  const imagePath = path.join(__dirname, 'public/pantra-logo.png');
  const image = sharp(imagePath);
  const { width, height } = await image.metadata();

  // Convert to RGBA buffer
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  let minX1 = width, maxX1 = 0, minY1 = height, maxY1 = 0;
  let minX2 = width, maxX2 = 0, minY2 = height, maxY2 = 0;
  
  const thresholdY = Math.floor(height / 2);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    
    // Convert to luminescence to kill white
    const avg = (r + g + b) / 3;
    if (avg >= 240) {
       data[i + 3] = 0; // transparent
    } else {
       // Keep it, set full opacity for text just to be safe
       data[i + 3] = 255;
       
       const x = Math.floor((i / 4) % width);
       const y = Math.floor((i / 4) / width);
       
       // Top half bounding box (Long Logo probably)
       if (y < thresholdY) {
          if (x < minX1) minX1 = x;
          if (x > maxX1) maxX1 = x;
          if (y < minY1) minY1 = y;
          if (y > maxY1) maxY1 = y;
       } else {
          // Bottom half bounding box (Square Icon probably)
          if (x < minX2) minX2 = x;
          if (x > maxX2) maxX2 = x;
          if (y < minY2) minY2 = y;
          if (y > maxY2) maxY2 = y;
       }
    }
  }

  const processedImage = sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  });

  // Extract Top Logo
  if (maxX1 > minX1 && maxY1 > minY1) {
    await processedImage
      .extract({ left: minX1, top: minY1, width: maxX1 - minX1 + 1, height: maxY1 - minY1 + 1 })
      .png()
      .toFile(path.join(__dirname, 'public/logo-header.png'));
    console.log("Extracted logo-header.png");
  }

  // Extract Bottom Icon
  if (maxX2 > minX2 && maxY2 > minY2) {
    await processedImage
      .extract({ left: minX2, top: minY2, width: maxX2 - minX2 + 1, height: maxY2 - minY2 + 1 })
      .png()
      .toFile(path.join(__dirname, 'public/logo-icon.png'));
    console.log("Extracted logo-icon.png");
  }
}

processLogo().catch(console.error);
