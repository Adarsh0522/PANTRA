const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function getFields() {
  const bytes = fs.readFileSync('public/templates/new-pan.pdf');
  const pdfDoc = await PDFDocument.load(bytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  console.log(`Found ${fields.length} fields`);
  fields.forEach(field => {
    const type = field.constructor.name;
    const name = field.getName();
    console.log(`${type}: ${name}`);
  });
}

getFields();
