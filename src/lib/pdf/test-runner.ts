import { NEW_PAN_CONFIG } from './config/new-pan';
import { PAN_CORRECTION_CONFIG } from './config/pan-correction';
import { TEST_DATA } from './test-data';
import { PanPdfEngine } from './engine';
import fs from 'fs/promises';
import path from 'path';

async function run() {
    try {
        const templatePath = path.resolve(process.cwd(), 'public/templates/pan-correction.pdf');
        
        console.log('Loading template from:', templatePath);
        
        const engine = new PanPdfEngine(PAN_CORRECTION_CONFIG);
        await engine.init(templatePath);
        
        console.log('Template loaded successfully.');
        
        const outputBytes = await engine.generate(TEST_DATA);
        
        const outputPath = path.resolve(process.cwd(), 'public/templates/output.pdf');
        await fs.writeFile(outputPath, outputBytes);
        
        console.log('Generated PDF saved to:', outputPath);
    } catch (e: any) {
        console.error('Error generating PDF:', e);
        await fs.writeFile('test-err.log', e.stack || e.message);
    }
}

run();
