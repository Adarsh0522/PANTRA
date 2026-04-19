import { NextResponse } from 'next/server';
import path from 'path';
import { PanPdfEngine } from '@/lib/pdf/engine';
import { NEW_PAN_CONFIG } from '@/lib/pdf/config/new-pan';
import { PAN_CORRECTION_CONFIG } from '@/lib/pdf/config/pan-correction';
import { mapFormToPDF as mapNewPan } from '@/lib/mapping-layer/new-pan-mapper';
import { mapCorrectionFormToPDF as mapCorrectionPan } from '@/lib/mapping-layer/pan-correction-mapper';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { formData, type } = await req.json();

    if (!formData) {
      return NextResponse.json({ error: 'Form data is required' }, { status: 400 });
    }

    const isCorrection = type === 'correction';
    const templateName = isCorrection ? 'pan-correction.pdf' : 'new-pan.pdf';
    const templatePath = path.join(process.cwd(), 'public', 'templates', templateName);

    // Map the incoming form data to the flat structure expected by the engine
    let mappedData;
    try {
      mappedData = isCorrection ? mapCorrectionPan(formData as any) : mapNewPan(formData as any);
    } catch (e) {
      console.warn("Silent mapping error for live preview", e);
      mappedData = formData; // fallback to raw
    }

    // Initialize the Canvas Text Engine
    const config = isCorrection ? PAN_CORRECTION_CONFIG : NEW_PAN_CONFIG;
    const engine = new PanPdfEngine(config);
    
    try {
      await engine.init(templatePath);
    } catch (e) {
      console.error("Missing PDF template file:", templatePath);
      return NextResponse.json({ error: 'Template missing' }, { status: 404 });
    }

    // Generate PDF bytes on the fly (bypass strict limits by passing isCorrection=false)
    const pdfBytes = await engine.generate(mappedData, false, false); 

    return new NextResponse(pdfBytes as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBytes.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Error in PDF Preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF Preview' },
      { status: 500 }
    );
  }
}
