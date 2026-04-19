const { PanPdfEngine } = require('./src/lib/pdf/engine');
const { NEW_PAN_CONFIG } = require('./src/lib/pdf/config/new-pan');
const fs = require('fs');
const path = require('path');

async function test() {
  const engine = new PanPdfEngine(NEW_PAN_CONFIG);
  await engine.init(path.join(__dirname, 'public/templates/new-pan.pdf'));
  const bytes = await engine.generate({ first_name: 'ADARSH' });
  console.log("Bytes length:", bytes.length);
}

test().catch(console.error);
