import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { canUserDownload, recordDownload } from '@/lib/download-guard';
import { db } from '@/db';
import { pdf_sessions, pan_forms } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { PanPdfEngine } from '@/lib/pdf/engine';
import { NEW_PAN_CONFIG } from '@/lib/pdf/config/new-pan';
import { PAN_CORRECTION_CONFIG } from '@/lib/pdf/config/pan-correction';
import path from 'path';

// Prevent Next.js from caching the route
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { action, formType, data, mode, sessionId } = body;

    // ─── PHASE 1: GENERATE (Session Lock Creation) ───
    if (action === 'generate') {
      const isWatermarkMode = mode === 'watermark';
      
      // 1. Check Limits (only block if not watermark mode and limit exceeded, or fully blocked)
      const check = await canUserDownload(userId);
      if (!check.allowed && !isWatermarkMode) {
        return NextResponse.json({
          reason: check.reason,
          requiresPayment: check.requiresPayment,
          watermarkAvailable: check.watermark,
        }, { status: 402 });
      }

      // 2. Generate PDF via PanPdfEngine
      const isCorrection = formType === 'correction';
      const templateName = isCorrection ? 'pan-correction.pdf' : 'new-pan.pdf';
      const templatePath = path.join(process.cwd(), 'public', 'templates', templateName);

      const config = isCorrection ? PAN_CORRECTION_CONFIG : NEW_PAN_CONFIG;
      const engine = new PanPdfEngine(config);
      await engine.init(templatePath);

      // Watermark logic: apply if requested, or if fallback to watermark is permitted
      const shouldWatermark = isWatermarkMode || (!check.allowed && check.watermark);

      const pdfBytes = await engine.generate(data, false, shouldWatermark);
      const pdfBase64 = "data:application/pdf;base64," + Buffer.from(pdfBytes).toString('base64');

      // 3. Create a draft pan_form record
      // This is required because pdf_sessions has a NOT NULL pan_form_id constraint
      const formId = crypto.randomUUID();
      await db.insert(pan_forms).values({
        id: formId,
        user_id: userId,
        form_type: formType || 'new',
        status: 'draft',
        data: data || {}
      });

      // 4. Create Session Lock
      const newSessionId = crypto.randomUUID();
      await db.insert(pdf_sessions).values({
        id: newSessionId,
        user_id: userId,
        pan_form_id: formId,
        pdf_url: pdfBase64,
        watermarked: shouldWatermark,
        is_consumed: false,
      });

      return NextResponse.json({
        sessionId: newSessionId,
        pdfUrl: pdfBase64,
        watermarked: shouldWatermark
      }, { status: 200 });

    } 
    
    // ─── PHASE 2: CONSUME (DOWNLOAD / PRINT) ───
    else if (action === 'download' || action === 'print') {
      if (!sessionId) {
        return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
      }

      const [pdfSession] = await db.select().from(pdf_sessions).where(eq(pdf_sessions.id, sessionId));
      
      if (!pdfSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      if (pdfSession.user_id !== userId) {
        return NextResponse.json({ error: 'Not authorized for this session' }, { status: 403 });
      }

      if (pdfSession.is_consumed) {
        return NextResponse.json({ error: 'ALREADY_USED', pdfUrl: pdfSession.pdf_url }, { status: 409 });
      }

      // Mark session as consumed
      await db.update(pdf_sessions).set({ is_consumed: true }).where(eq(pdf_sessions.id, sessionId));

      // Record download against quotas
      await recordDownload(userId, pdfSession.pan_form_id, pdfSession.watermarked);

      return NextResponse.json({
        success: true,
        pdfUrl: pdfSession.pdf_url
      }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
