'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import Link from 'next/link';
import { saveAs } from 'file-saver';
import { UploadCloud, CheckCircle, Loader2, Image as ImageIcon, FileText, AlertCircle, Maximize2, Eraser, User, Download, FileUp, CreditCard, Lock, KeyRound, ArrowRight, RefreshCw, Crop } from 'lucide-react';
import Cropper from 'react-easy-crop';
import * as pdfjsLib from 'pdfjs-dist';
import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';

// Initialize PDF.js worker securely using CDN
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

// ----------------------------------------------------------------------
// Freemium UI Components
// ----------------------------------------------------------------------

const PaywallOverlay = ({ price = 299 }: { price?: number }) => (
  <div className="absolute inset-0 z-50 backdrop-blur-sm bg-white/60 flex flex-col items-center justify-center rounded-xl p-6 text-center shadow-inner">
    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-sm border border-red-100">
      <Lock className="w-8 h-8" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">Access Expired</h3>
    <p className="text-sm text-gray-600 mb-6 max-w-xs">Your free trial or subscription has expired. Upgrade to unlock unlimited document processing tools.</p>
    <Link href="/dashboard/pricing" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 shadow-sm transition-all hover:shadow-md">
      Upgrade Now (₹{price})
    </Link>
  </div>
);

const FreeBadge = ({ days }: { days: number }) => (
  <div className="absolute top-4 right-4 z-40 bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 border border-green-200">
    <span>{days} Days Free Trial</span> 🎁
  </div>
);

// ----------------------------------------------------------------------
// Image Processing & Compression Helpers
// ----------------------------------------------------------------------

const getCroppedImg = (imageSrc: string, pixelCrop: any, targetWidth: number, targetHeight: number, bgColor: string = '#ffffff'): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context is null'));

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        targetWidth,
        targetHeight
      );
      resolve(canvas);
    };
    image.onerror = reject;
    image.src = imageSrc;
  });
};

const compressToTarget = async (canvas: HTMLCanvasElement, targetMinKB: number, targetMaxKB: number): Promise<Blob> => {
  const minBytes = targetMinKB * 1024;
  const maxBytes = targetMaxKB * 1024;

  let quality = 1.0;
  let blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', quality));

  let finalBlob = blob;

  // If the image is naturally larger than maxBytes, use binary search to compress it
  if (blob.size > maxBytes) {
    let minQ = 0.01;
    let maxQ = 1.0;
    let bestBlob = blob;

    for (let i = 0; i < 15; i++) {
      quality = (minQ + maxQ) / 2;
      blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', quality));

      if (blob.size > maxBytes) {
        maxQ = quality;
      } else if (blob.size < minBytes) {
        minQ = quality;
        if (!bestBlob || bestBlob.size > maxBytes || blob.size > bestBlob.size) {
          bestBlob = blob;
        }
      } else {
        finalBlob = blob; // Perfect!
        break;
      }
    }
    // If exact window wasn't found, fallback to the best possible option under maxBytes
    if (finalBlob.size > maxBytes || finalBlob.size < minBytes) {
      finalBlob = (bestBlob && bestBlob.size <= maxBytes) ? bestBlob : blob;
    }
  }

  // Artificial padding: If the image naturally lacks enough data to reach the minimum KB
  // even at 100% quality, we safely pad the end of the JPEG with blank bytes to hit the target.
  if (finalBlob.size < minBytes) {
    const targetBytes = (minBytes + maxBytes) / 2; // Target the exact middle of the range
    const paddingSize = Math.floor(targetBytes - finalBlob.size);
    if (paddingSize > 0) {
      const padding = new Uint8Array(paddingSize);
      finalBlob = new Blob([finalBlob, padding], { type: 'image/jpeg' });
    }
  }

  return finalBlob;
};

const getCanvasBlob = (canvas: HTMLCanvasElement, q: number): Promise<Blob> =>
  new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', q));

const loadPdfPageAsImage = async (file: File, password?: string): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, password: password || undefined }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 3.0 });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context is null');
  await page.render({ canvasContext: ctx, viewport } as any).promise;
  return canvas.toDataURL('image/jpeg', 1.0);
};

// ----------------------------------------------------------------------
// Widget Component
// ----------------------------------------------------------------------

type ProcessingState = 'idle' | 'processing' | 'success' | 'error';
type StepState = 'upload' | 'crop' | 'preview';

interface WidgetProps {
  widgetId: string;
  hasActiveTools: boolean;
  remainingTrialDays: number;
  onProcessSuccess: () => void;

  title: string;
  description: string;
  accept: string;
  icon: React.ReactNode;
  defaultFileName: string;

  isCroppable?: boolean;
  cropAspect?: number;
  cropWidth?: number;
  cropHeight?: number;
  targetMinKB?: number;
  targetMaxKB?: number;

  isDocumentProcessor?: boolean;
  onProcessDocument?: (file: File) => Promise<Blob>;

  processingText?: string;
  processingSubText?: string;
  showBgColorPicker?: boolean;
}

const Widget: React.FC<WidgetProps> = ({
  widgetId, hasActiveTools, remainingTrialDays, onProcessSuccess,
  title, description, accept, icon, defaultFileName,
  isCroppable, cropAspect, cropWidth, cropHeight, targetMinKB, targetMaxKB,
  isDocumentProcessor, onProcessDocument, processingText, processingSubText, showBgColorPicker
}) => {
  const isLocked = !hasActiveTools;
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<StepState>('upload');

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [bgColor, setBgColor] = useState('#ffffff');

  const [finalBlob, setFinalBlob] = useState<Blob | null>(null);
  const [finalSizeKB, setFinalSizeKB] = useState<number>(0);
  const [fileName, setFileName] = useState(defaultFileName);
  const [status, setStatus] = useState<ProcessingState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const f = e.target.files[0];
      setFile(f);
      setStatus('idle');
      setErrorMsg('');
      setFinalBlob(null);

      if (isCroppable && !f.type.includes('pdf')) {
        const src = URL.createObjectURL(f);
        setImageSrc(src);
        setStep('crop');
        setZoom(1);
        setCrop({ x: 0, y: 0 });
      } else if (isDocumentProcessor && onProcessDocument) {
        // Automatically start heavy processing for Documents
        setStep('preview');
        setStatus('processing');
        try {
          const blob = await onProcessDocument(f);
          setFinalBlob(blob);
          setFinalSizeKB(blob.size / 1024);
          setStatus('idle');
        } catch (error: any) {
          console.error(error);
          setStatus('error');
          setErrorMsg(error.message || 'Error processing document.');
        }
      } else {
        setStep('preview');
      }
    }
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirmCrop = async () => {
    if (!imageSrc || !croppedAreaPixels || !cropWidth || !cropHeight || !targetMinKB || !targetMaxKB) return;
    setStatus('processing');
    try {
      const canvas = await getCroppedImg(imageSrc, croppedAreaPixels, cropWidth, cropHeight, bgColor);
      const blob = await compressToTarget(canvas, targetMinKB, targetMaxKB);
      setFinalBlob(blob);
      setFinalSizeKB(blob.size / 1024);
      setStep('preview');
      setStatus('idle');
    } catch (error: any) {
      console.error(error);
      setErrorMsg('Failed to crop and compress image.');
      setStatus('error');
    }
  };

  const handleDownload = async () => {
    setErrorMsg('');
    try {
      if (finalBlob) {
        // Ensure correct extension
        let finalOutputName = fileName;
        if (finalBlob.type === 'application/pdf' && !finalOutputName.endsWith('.pdf')) {
          finalOutputName += '.pdf';
        } else if (finalBlob.type === 'image/jpeg' && !finalOutputName.endsWith('.jpg')) {
          finalOutputName += '.jpg';
        } else if (finalBlob.type === 'image/png' && !finalOutputName.endsWith('.png')) {
          finalOutputName += '.png';
        }
        saveAs(finalBlob, finalOutputName);
        setStatus('success');
        onProcessSuccess();
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMsg('Failed to download the file.');
    }
  };

  const handleReset = () => {
    setFile(null);
    setStep('upload');
    setImageSrc(null);
    setFinalBlob(null);
    setFinalSizeKB(0);
    setStatus('idle');
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full transition-all hover:shadow-md relative overflow-hidden">
      {isLocked && <PaywallOverlay />}
      {!isLocked && remainingTrialDays > 0 && <FreeBadge days={remainingTrialDays} />}
      <div className={`flex flex-col flex-1 ${isLocked ? 'opacity-30 blur-[2px] pointer-events-none select-none' : ''}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>

        {step === 'upload' && (
          <div
            className="flex-1 border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center my-auto cursor-pointer hover:bg-gray-50 transition-colors min-h-[200px]"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={accept}
              className="hidden"
            />
            <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
            <span className="text-sm font-bold text-gray-600">Click to upload</span>
            <span className="text-xs text-gray-400 mt-1">Accepts {accept}</span>
          </div>
        )}

        {step === 'crop' && imageSrc && (
          <div className="flex flex-col flex-1">
            <div className="relative w-full h-64 bg-slate-900 rounded-lg overflow-hidden mb-4 border border-slate-200">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={cropAspect}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                showGrid={true}
                style={{ containerStyle: { backgroundColor: bgColor } }}
              />
            </div>
            <div className="mb-4 px-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-500"><Maximize2 className="w-4 h-4" /></span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
            {showBgColorPicker && (
              <div className="mb-4 px-2">
                <label className="text-xs font-medium text-gray-700 mb-2 block">Background Color</label>
                <div className="flex gap-2 items-center">
                  {[
                    { name: 'White', value: '#ffffff' },
                    { name: 'Light Blue', value: '#add8e6' },
                    { name: 'Grey', value: '#808080' },
                    { name: 'Red', value: '#ff0000' }
                  ].map((c) => (
                    <button
                      key={c.name}
                      title={c.name}
                      onClick={() => setBgColor(c.value)}
                      className={`w-6 h-6 rounded-full border border-gray-300 transition-transform ${bgColor === c.value ? 'ring-2 ring-offset-1 ring-indigo-600 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                  <div className="w-px h-6 bg-gray-200 mx-1"></div>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                    title="Custom Color"
                  />
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-auto">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCrop}
                disabled={status === 'processing'}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg flex items-center justify-center transition-colors text-sm"
              >
                {status === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Crop'}
              </button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="flex flex-col flex-1 space-y-4">
            <div className="flex-1 border border-gray-100 rounded-lg bg-gray-50 flex flex-col items-center justify-center p-4 relative min-h-[150px]">
              {status === 'processing' && !finalBlob ? (
                <div className="flex flex-col items-center text-center">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                  <span className="text-sm font-medium text-gray-700">{processingText || 'Processing Document...'}</span>
                  <span className="text-xs text-gray-500 mt-1">{processingSubText || 'This might take a few seconds'}</span>
                </div>
              ) : finalBlob ? (
                finalBlob.type === 'application/pdf' ? (
                  <div className="flex flex-col items-center text-center">
                    <FileText className="w-12 h-12 text-red-500 mb-2" />
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{fileName}</span>
                    <span className="text-xs text-green-600 font-bold mt-1">Optimized PDF Generated</span>
                  </div>
                ) : (
                  <img src={URL.createObjectURL(finalBlob)} alt="Preview" className="max-h-32 object-contain rounded shadow-sm border border-gray-200" />
                )
              ) : file ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              ) : null}

              {status !== 'processing' && (
                <button
                  onClick={handleReset}
                  className="absolute top-2 right-2 text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Start Over
                </button>
              )}
            </div>

            {finalSizeKB > 0 && status !== 'processing' && (
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-sm font-bold rounded-full border border-green-100">
                  <CheckCircle className="w-4 h-4" /> Final Size: {finalSizeKB.toFixed(1)} KB
                </span>
              </div>
            )}

            <div className="space-y-3 mt-auto">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Output File Name</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  disabled={status === 'processing'}
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder={defaultFileName}
                />
              </div>

              {status === 'error' && (
                <div className="text-red-500 text-xs text-center">{errorMsg}</div>
              )}

              <button
                onClick={handleDownload}
                disabled={status === 'processing' || !finalBlob}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
              >
                {status === 'processing' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : status === 'success' ? (
                  <>
                    <CheckCircle className="w-4 h-4" /> Saved!
                  </>
                ) : (
                  'Process & Download'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// PDF to Image Converter Widget
// ----------------------------------------------------------------------

interface PdfPage {
  pageNumber: number;
  blob: Blob;
  sizeKB: number;
}

interface PdfToImageWidgetProps {
  widgetId: string;
  hasActiveTools: boolean;
  remainingTrialDays: number;
  onProcessSuccess: () => void;
}

const PdfToImageWidget: React.FC<PdfToImageWidgetProps> = ({ widgetId, hasActiveTools, remainingTrialDays, onProcessSuccess }) => {
  const isLocked = !hasActiveTools;
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<StepState>('upload');
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [status, setStatus] = useState<ProcessingState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const f = e.target.files[0];
      setFile(f);
      setStatus('processing');
      setStep('preview');
      setErrorMsg('');
      setPages([]);

      try {
        const arrayBuffer = await f.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        const newPages: PdfPage[] = [];

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 }); // High quality scale
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas context is null');

          await page.render({ canvasContext: ctx, viewport } as any).promise;

          const blob = await getCanvasBlob(canvas, 0.9); // 90% quality JPEG
          newPages.push({
            pageNumber: i,
            blob,
            sizeKB: blob.size / 1024
          });
        }
        setPages(newPages);
        setStatus('idle');
      } catch (error: any) {
        console.error(error);
        setStatus('error');
        setErrorMsg(error.message || 'Error converting PDF pages.');
      }
    }
  };

  const handleDownload = (page: PdfPage) => {
    const fileName = file ? file.name.replace('.pdf', '') : 'Document';
    saveAs(page.blob, `${fileName}_page_${page.pageNumber}.jpg`);
    onProcessSuccess();
  };

  const handleDownloadAll = () => {
    const fileName = file ? file.name.replace('.pdf', '') : 'Document';
    pages.forEach((page) => {
      saveAs(page.blob, `${fileName}_page_${page.pageNumber}.jpg`);
    });
    onProcessSuccess();
  };

  const handleReset = () => {
    setFile(null);
    setStep('upload');
    setPages([]);
    setStatus('idle');
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full transition-all hover:shadow-md relative overflow-hidden">
      {isLocked && <PaywallOverlay />}
      {!isLocked && remainingTrialDays > 0 && <FreeBadge days={remainingTrialDays} />}
      <div className={`flex flex-col flex-1 ${isLocked ? 'opacity-30 blur-[2px] pointer-events-none select-none' : ''}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">PDF to Image</h3>
            <p className="text-xs text-gray-500">Convert PDF pages to high quality JPGs.</p>
          </div>
        </div>

        {step === 'upload' && (
          <div
            className="flex-1 border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center my-auto cursor-pointer hover:bg-gray-50 transition-colors min-h-[200px]"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf"
              className="hidden"
            />
            <FileUp className="w-10 h-10 text-gray-400 mb-3" />
            <span className="text-sm font-bold text-gray-600">Click to upload PDF</span>
          </div>
        )}

        {step === 'preview' && (
          <div className="flex flex-col flex-1 space-y-4">
            <div className="flex-1 border border-gray-100 rounded-lg bg-gray-50 flex flex-col p-4 relative min-h-[150px] max-h-[300px] overflow-y-auto">
              {status === 'processing' ? (
                <div className="flex flex-col items-center justify-center h-full text-center my-auto pt-6">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                  <span className="text-sm font-medium text-gray-700">Converting PDF...</span>
                </div>
              ) : status === 'error' ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-red-500 pt-6">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <span className="text-sm">{errorMsg}</span>
                </div>
              ) : (
                <div className="space-y-3 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-700">{pages.length} Pages Extracted</span>
                  </div>
                  {pages.map((page) => (
                    <div key={page.pageNumber} className="flex items-center justify-between bg-white p-2 border border-gray-200 rounded shadow-sm">
                      <span className="text-sm font-medium">Page {page.pageNumber}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{page.sizeKB.toFixed(1)} KB</span>
                        <button
                          onClick={() => handleDownload(page)}
                          className="p-1.5 bg-gray-100 hover:bg-indigo-100 text-indigo-600 rounded transition-colors"
                          title="Download JPG"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {status !== 'processing' && (
                <button
                  onClick={handleReset}
                  className="absolute top-2 right-2 text-xs text-gray-400 hover:text-gray-600 underline bg-white px-1"
                >
                  Start Over
                </button>
              )}
            </div>

            <div className="mt-auto pt-2">
              <button
                onClick={handleDownloadAll}
                disabled={status === 'processing' || pages.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <Download className="w-4 h-4" /> Download All Pages
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Universal ID Card Maker Widget
// ----------------------------------------------------------------------

interface IdCardMakerWidgetProps {
  widgetId: string;
  hasActiveTools: boolean;
  remainingTrialDays: number;
  onProcessSuccess: () => void;
}

type IdStepState = 'upload_front' | 'password_front' | 'crop_front' | 'upload_back' | 'password_back' | 'crop_back' | 'preview';

const IdCardMakerWidget: React.FC<IdCardMakerWidgetProps> = ({ widgetId, hasActiveTools, remainingTrialDays, onProcessSuccess }) => {
  const isLocked = !hasActiveTools;
  const [step, setStep] = useState<IdStepState>('upload_front');
  const [status, setStatus] = useState<ProcessingState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [frontPassword, setFrontPassword] = useState('');
  const [frontImageSrc, setFrontImageSrc] = useState<string | null>(null);
  const [frontCrop, setFrontCrop] = useState({ x: 0, y: 0 });
  const [frontZoom, setFrontZoom] = useState(1);
  const [frontCroppedAreaPixels, setFrontCroppedAreaPixels] = useState(null);
  const [frontCanvas, setFrontCanvas] = useState<HTMLCanvasElement | null>(null);
  const [frontCroppedSrc, setFrontCroppedSrc] = useState<string | null>(null);

  const [backFile, setBackFile] = useState<File | null>(null);
  const [backPassword, setBackPassword] = useState('');
  const [backImageSrc, setBackImageSrc] = useState<string | null>(null);
  const [backCrop, setBackCrop] = useState({ x: 0, y: 0 });
  const [backZoom, setBackZoom] = useState(1);
  const [backCroppedAreaPixels, setBackCroppedAreaPixels] = useState(null);
  const [backCanvas, setBackCanvas] = useState<HTMLCanvasElement | null>(null);

  const [finalPdfBlob, setFinalPdfBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (
    file: File,
    passwordStr: string,
    side: 'front' | 'back'
  ) => {
    setStatus('processing');
    setErrorMsg('');
    try {
      let imgSrc = '';
      if (file.type === 'application/pdf') {
        try {
          imgSrc = await loadPdfPageAsImage(file, passwordStr);
        } catch (error: any) {
          if (error.name === 'PasswordException') {
            setStatus('idle');
            setStep(side === 'front' ? 'password_front' : 'password_back');
            return;
          }
          throw error;
        }
      } else {
        imgSrc = URL.createObjectURL(file);
      }

      if (side === 'front') {
        setFrontImageSrc(imgSrc);
        setStep('crop_front');
        setFrontZoom(1);
        setFrontCrop({ x: 0, y: 0 });
      } else {
        setBackImageSrc(imgSrc);
        setStep('crop_back');
        setBackZoom(1);
        setBackCrop({ x: 0, y: 0 });
      }
      setStatus('idle');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || 'Failed to load file.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    if (e.target.files && e.target.files.length > 0) {
      const f = e.target.files[0];
      if (side === 'front') {
        setFrontFile(f);
        setFrontPassword('');
      } else {
        setBackFile(f);
        setBackPassword('');
      }
      handleProcessFile(f, '', side);
    }
  };

  const handleConfirmCrop = async (side: 'front' | 'back') => {
    setStatus('processing');
    try {
      if (side === 'front') {
        if (!frontImageSrc || !frontCroppedAreaPixels) return;
        // Output at maximum 1500px width for incredible print clarity
        const canvas = await getCroppedImg(frontImageSrc, frontCroppedAreaPixels, 1500, Math.round(1500 / 1.585));
        setFrontCanvas(canvas);
        setFrontCroppedSrc(canvas.toDataURL('image/jpeg', 0.8));
        setStep('upload_back');
      } else {
        if (!backImageSrc || !backCroppedAreaPixels) return;
        const canvas = await getCroppedImg(backImageSrc, backCroppedAreaPixels, 1500, Math.round(1500 / 1.585));
        setBackCanvas(canvas);
        await generateFinalPdf(frontCanvas!, canvas);
      }
      setStatus('idle');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg('Failed to crop image.');
    }
  };

  const generateFinalPdf = async (fCanvas: HTMLCanvasElement, bCanvas: HTMLCanvasElement) => {
    const jsPdfDoc = new jsPDF('p', 'mm', 'a4');

    // Extract canvas data at absolute maximum 1.0 Quality with no compression limitations
    const fData = fCanvas.toDataURL('image/jpeg', 1.0);
    jsPdfDoc.addImage(fData, 'JPEG', 62.2, 30, 85.6, 54);

    const bData = bCanvas.toDataURL('image/jpeg', 1.0);
    jsPdfDoc.addImage(bData, 'JPEG', 62.2, 90, 85.6, 54);

    const blob = jsPdfDoc.output('blob');
    setFinalPdfBlob(blob);
    setStep('preview');
  };

  const handleDownload = () => {
    if (finalPdfBlob) {
      const name = frontFile ? frontFile.name.split('.')[0] + '_ID_Card.pdf' : 'ID_Card.pdf';
      saveAs(finalPdfBlob, name);
      onProcessSuccess();
    }
  };

  const handleReset = () => {
    setStep('upload_front');
    setFrontFile(null);
    setBackFile(null);
    setFrontImageSrc(null);
    setBackImageSrc(null);
    setFrontCanvas(null);
    setFrontCroppedSrc(null);
    setBackCanvas(null);
    setFinalPdfBlob(null);
    setStatus('idle');
    setErrorMsg('');
  };

  const renderUploadBox = (title: string, side: 'front' | 'back') => (
    <div
      className="flex-1 border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors min-h-[250px]"
      onClick={() => side === 'front' ? fileInputRef.current?.click() : backFileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={side === 'front' ? fileInputRef : backFileInputRef}
        onChange={(e) => handleFileChange(e, side)}
        accept="image/jpeg, image/png, application/pdf"
        className="hidden"
      />
      <FileUp className="w-12 h-12 text-indigo-400 mb-4" />
      <span className="text-base font-bold text-gray-700">{title}</span>
      <span className="text-sm text-gray-400 mt-2">Upload Image or PDF</span>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full transition-all hover:shadow-md col-span-1 md:col-span-3 relative overflow-hidden">
      {isLocked && <PaywallOverlay />}
      {!isLocked && remainingTrialDays > 0 && <FreeBadge days={remainingTrialDays} />}
      <div className={`flex flex-col flex-1 ${isLocked ? 'opacity-30 blur-[2px] pointer-events-none select-none' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Universal ID Card Maker</h3>
              <p className="text-sm text-gray-500">Perfectly align Front & Back sides on a printable A4 page in maximum quality.</p>
            </div>
          </div>
          {step !== 'upload_front' && (
            <button onClick={handleReset} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
              <RefreshCw className="w-4 h-4" /> Start Over
            </button>
          )}
        </div>

        {step === 'upload_front' && renderUploadBox('Click to upload Front Side', 'front')}

        {step === 'upload_back' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[300px]">
            {/* Left Box: Front Side Preview */}
            <div className="border border-gray-200 rounded-lg p-6 flex flex-col bg-gray-50">
              <h4 className="text-sm font-bold text-gray-700 mb-4">Front Side (Cropped)</h4>
              <div className="flex-1 flex items-center justify-center bg-white rounded-lg border border-gray-200 p-2 overflow-hidden shadow-sm">
                {frontCroppedSrc ? (
                  <img src={frontCroppedSrc} alt="Front Crop Preview" className="w-full h-full object-contain rounded" />
                ) : (
                  <span className="text-xs text-gray-400">Preview not available</span>
                )}
              </div>
            </div>

            {/* Right Box: Back Side Setup */}
            <div className="border border-gray-200 rounded-lg p-6 flex flex-col relative overflow-hidden bg-white">
              {frontImageSrc && (
                <img src={frontImageSrc} alt="Original Document" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" />
              )}
              <div className="relative z-10 flex flex-col h-full">
                <h4 className="text-sm font-bold text-gray-700 mb-4">Back Side</h4>
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
                  <span className="text-base font-semibold text-gray-800">Ready to crop the back side?</span>
                  <p className="text-sm text-gray-600 mb-2">You can select a different area from the same document, or upload a new file.</p>
                  <button
                    onClick={() => {
                      setBackFile(frontFile);
                      setBackPassword(frontPassword);
                      setBackImageSrc(frontImageSrc);
                      setStep('crop_back');
                      setBackZoom(1);
                      setBackCrop({ x: 0, y: 0 });
                    }}
                    className="w-full max-w-[200px] px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <Crop className="w-4 h-4" /> Select Area
                  </button>
                  <div className="flex items-center gap-2 w-full max-w-[200px] my-1">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="text-xs font-medium text-gray-400 uppercase">Or</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>
                  <button
                    onClick={() => backFileInputRef.current?.click()}
                    className="w-full max-w-[200px] px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <FileUp className="w-4 h-4" /> Upload New File
                  </button>
                  <input
                    type="file"
                    ref={backFileInputRef}
                    onChange={(e) => handleFileChange(e, 'back')}
                    accept="image/jpeg, image/png, application/pdf"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {(step === 'password_front' || step === 'password_back') && (
          <div className="flex-1 border border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-gray-50 min-h-[250px]">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-gray-800 mb-2">Encrypted Document</h4>
            <p className="text-sm text-gray-500 mb-6 max-w-sm">This PDF requires a password to open. Please enter it below.</p>
            <div className="flex w-full max-w-sm gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={step === 'password_front' ? frontPassword : backPassword}
                  onChange={(e) => step === 'password_front' ? setFrontPassword(e.target.value) : setBackPassword(e.target.value)}
                  className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Document Password"
                />
              </div>
              <button
                onClick={() => handleProcessFile(step === 'password_front' ? frontFile! : backFile!, step === 'password_front' ? frontPassword : backPassword, step === 'password_front' ? 'front' : 'back')}
                disabled={status === 'processing'}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
              >
                {status === 'processing' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Unlock'}
              </button>
            </div>
            {status === 'error' && <p className="text-red-500 text-sm mt-4 font-medium">{errorMsg}</p>}
          </div>
        )}

        {(step === 'crop_front' || step === 'crop_back') && (
          <div className="flex flex-col flex-1 min-h-[400px]">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-gray-700">
                Crop {step === 'crop_front' ? 'Front Side' : 'Back Side'}
              </span>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-medium">Standard CR-80 Ratio (85.6mm x 54mm)</span>
            </div>
            <div className="relative w-full h-[400px] flex-1 bg-slate-900 rounded-lg overflow-hidden border border-slate-200 mb-4">
              <Cropper
                image={step === 'crop_front' ? frontImageSrc! : backImageSrc!}
                crop={step === 'crop_front' ? frontCrop : backCrop}
                zoom={step === 'crop_front' ? frontZoom : backZoom}
                aspect={1.585} // 85.6 / 54
                onCropChange={step === 'crop_front' ? setFrontCrop : setBackCrop}
                onCropComplete={(_, croppedAreaPixels) => step === 'crop_front' ? setFrontCroppedAreaPixels(croppedAreaPixels as any) : setBackCroppedAreaPixels(croppedAreaPixels as any)}
                onZoomChange={step === 'crop_front' ? setFrontZoom : setBackZoom}
                showGrid={true}
              />
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-xs font-medium text-gray-500"><Maximize2 className="w-4 h-4" /></span>
              <input
                type="range"
                value={step === 'crop_front' ? frontZoom : backZoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => step === 'crop_front' ? setFrontZoom(Number(e.target.value)) : setBackZoom(Number(e.target.value))}
                className="w-48 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex-1"></div>
              <button
                onClick={() => handleConfirmCrop(step === 'crop_front' ? 'front' : 'back')}
                disabled={status === 'processing'}
                className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
              >
                {status === 'processing' ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirm Crop <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="flex flex-col items-center justify-center p-8 border border-green-200 bg-green-50 rounded-lg">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">ID Card PDF Ready!</h3>
            <p className="text-gray-600 mb-8 text-center max-w-md">Your ID Card has been perfectly aligned on an A4 layout in maximum print quality.</p>
            <button
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-sm transition-all hover:shadow-md"
            >
              <Download className="w-5 h-5" /> Download Printable PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Main Application Component
// ----------------------------------------------------------------------

export default function DocResizer({ hasActiveTools = false, remainingTrialDays = 0 }: { hasActiveTools?: boolean, remainingTrialDays?: number }) {
  const handleUsageIncrement = useCallback((widgetId: string) => {
    // Analytics tracking could go here, usage limit logic removed.
  }, []);

  const processRemoveBackground = async (file: File): Promise<Blob> => {
    // 1. Unblock the main thread so the browser can paint the "Loading AI Model" UI
    await new Promise(resolve => setTimeout(resolve, 100));

    let objectUrl = '';
    try {
      // 2. Pre-Downscale Before AI
      objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = objectUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      let targetWidth = img.width;
      let targetHeight = img.height;
      const MAX_DIMENSION = 1024;

      if (Math.max(targetWidth, targetHeight) > MAX_DIMENSION) {
        if (targetWidth > targetHeight) {
          targetHeight = Math.round((targetHeight * MAX_DIMENSION) / targetWidth);
          targetWidth = MAX_DIMENSION;
        } else {
          targetWidth = Math.round((targetWidth * MAX_DIMENSION) / targetHeight);
          targetHeight = MAX_DIMENSION;
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          const downscaledBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas toBlob failed'));
            }, file.type || 'image/jpeg', 0.9);
          });

          // 3. Process the downscaled image with AI
          return await imglyRemoveBackground(downscaledBlob);
        }
      }

      // If already small enough, process the original file
      return await imglyRemoveBackground(file);

    } finally {
      // 4. Memory Management: Cleanup object URL
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    }
  };

  const processDocumentPDF = async (file: File): Promise<Blob> => {
    const targetMaxKB = 98; // STRICT Safe Margin
    const targetMaxBytes = targetMaxKB * 1024;

    const jsPdfDoc = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = jsPdfDoc.internal.pageSize.getWidth();
    const pdfHeight = jsPdfDoc.internal.pageSize.getHeight();

    const appendToPdf = (imgData: string) => {
      const imgProps = jsPdfDoc.getImageProperties(imgData);
      const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
      const w = imgProps.width * ratio;
      const h = imgProps.height * ratio;
      const x = (pdfWidth - w) / 2;
      const y = (pdfHeight - h) / 2;
      jsPdfDoc.addImage(imgData, 'JPEG', x, y, w, h);
    };

    if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const pageTargetBytes = targetMaxBytes / numPages;

      for (let i = 1; i <= numPages; i++) {
        if (i > 1) jsPdfDoc.addPage();

        const page = await pdf.getPage(i);
        let scale = 2.0; // Higher quality for the start
        let quality = 1.0;
        let finalPageImgData = '';

        while (scale >= 0.3) {
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("Canvas context is null");

          await page.render({ canvasContext: ctx, viewport } as any).promise;

          let q = quality;
          let blobFound = false;
          while (q >= 0.2) {
            const blob = await getCanvasBlob(canvas, q);
            if (blob.size <= pageTargetBytes) {
              finalPageImgData = canvas.toDataURL('image/jpeg', q);
              blobFound = true;
              break;
            }
            q -= 0.2;
          }

          if (blobFound) break;
          scale *= 1; // Scale down by 10% increments
        }

        if (!finalPageImgData) {
          // Ultimate fallback if it stubbornly won't shrink
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (ctx) await page.render({ canvasContext: ctx, viewport } as any).promise;
          finalPageImgData = canvas.toDataURL('image/jpeg', 0.2);
        }

        appendToPdf(finalPageImgData);
      }
    } else {
      // It's an image
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }

      let scale = 1.0;
      let finalImgData = '';

      while (scale >= 0.1) {
        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = canvas.width * scale;
        scaledCanvas.height = canvas.height * scale;
        const sCtx = scaledCanvas.getContext('2d');
        if (sCtx) {
          sCtx.fillStyle = '#ffffff';
          sCtx.fillRect(0, 0, scaledCanvas.width, scaledCanvas.height);
          sCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
        }

        let q = 1.0;
        let blobFound = false;
        while (q >= 0.1) {
          const blob = await getCanvasBlob(scaledCanvas, q);
          if (blob.size <= targetMaxBytes) {
            finalImgData = scaledCanvas.toDataURL('image/jpeg', q);
            blobFound = true;
            break;
          }
          q -= 0.1;
        }

        if (blobFound) break;
        scale *= 0.9; // Scale down by 10%
      }

      if (!finalImgData) {
        finalImgData = canvas.toDataURL('image/jpeg', 0.1);
      }

      appendToPdf(finalImgData);
    }

    let pdfBlob = jsPdfDoc.output('blob');
    const minBytes = 95 * 1024;

    // Artificial padding if the generated PDF is smaller than 95KB
    if (pdfBlob.size < minBytes) {
      const targetBytes = (minBytes + targetMaxBytes) / 2; // Target middle, ~96.5KB
      const paddingSize = Math.floor(targetBytes - pdfBlob.size);
      if (paddingSize > 0) {
        const padding = new Uint8Array(paddingSize); // Blank bytes
        pdfBlob = new Blob([pdfBlob, padding], { type: 'application/pdf' });
      }
    }

    return pdfBlob;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Smart Document Resizer</h2>
        <p className="text-gray-500 mt-1">100% Client-Side processing. Your files never leave your browser securely.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Widget
          widgetId="photoProcessor"
          hasActiveTools={hasActiveTools}
          remainingTrialDays={remainingTrialDays}
          onProcessSuccess={() => handleUsageIncrement('photoProcessor')}
          title="Photo Processor"
          description="Manual crop, exact 160x200px, Upto 20KB."
          accept="image/jpeg, image/png, image/webp"
          icon={<ImageIcon className="w-6 h-6" />}
          defaultFileName="Photo.jpg"
          isCroppable={true}
          cropAspect={160 / 200}
          cropWidth={160}
          cropHeight={200}
          targetMinKB={18}
          targetMaxKB={19.5}
          showBgColorPicker={true}
        />

        <Widget
          widgetId="signatureProcessor"
          hasActiveTools={hasActiveTools}
          remainingTrialDays={remainingTrialDays}
          onProcessSuccess={() => handleUsageIncrement('signatureProcessor')}
          title="Signature Processor"
          description="Manual crop, exact 256x64px, Upto 20KB."
          accept="image/jpeg, image/png, image/webp"
          icon={<ImageIcon className="w-6 h-6" />}
          defaultFileName="signature.jpg"
          isCroppable={true}
          cropAspect={256 / 64}
          cropWidth={256}
          cropHeight={64}
          targetMinKB={18}
          targetMaxKB={19.5}
          showBgColorPicker={true}
        />

        <Widget
          widgetId="docResizer"
          hasActiveTools={hasActiveTools}
          remainingTrialDays={remainingTrialDays}
          onProcessSuccess={() => handleUsageIncrement('docResizer')}
          title="Document Resizer"
          description="image/PDF to PDF upto 98KB safely."
          accept="image/jpeg, image/png, application/pdf"
          icon={<FileText className="w-6 h-6" />}
          defaultFileName="document.pdf"
          isDocumentProcessor={true}
          onProcessDocument={processDocumentPDF}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Widget
          widgetId="bgRemover"
          hasActiveTools={hasActiveTools}
          remainingTrialDays={remainingTrialDays}
          onProcessSuccess={() => handleUsageIncrement('bgRemover')}
          title="AI Background Remover"
          description="Output as transparent PNG."
          accept="image/jpeg, image/png, image/webp"
          icon={<Eraser className="w-6 h-6" />}
          defaultFileName="no_bg.png"
          isDocumentProcessor={true}
          onProcessDocument={processRemoveBackground}
          processingText="Loading AI Model..."
          processingSubText="This might take a few seconds on first run."
        />

        <Widget
          widgetId="passportMaker"
          hasActiveTools={hasActiveTools}
          remainingTrialDays={remainingTrialDays}
          onProcessSuccess={() => handleUsageIncrement('passportMaker')}
          title="Passport Size Photo Maker"
          description="Exact 1:1 ratio, 600x600 px."
          accept="image/jpeg, image/png, image/webp"
          icon={<User className="w-6 h-6" />}
          defaultFileName="passport.jpg"
          isCroppable={true}
          cropAspect={1}
          cropWidth={600}
          cropHeight={600}
          targetMinKB={20}
          targetMaxKB={98}
          showBgColorPicker={true}
        />

        <PdfToImageWidget
          widgetId="pdfToImage"
          hasActiveTools={hasActiveTools}
          remainingTrialDays={remainingTrialDays}
          onProcessSuccess={() => handleUsageIncrement('pdfToImage')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <IdCardMakerWidget
          widgetId="idCardMaker"
          hasActiveTools={hasActiveTools}
          remainingTrialDays={remainingTrialDays}
          onProcessSuccess={() => handleUsageIncrement('idCardMaker')}
        />
      </div>
    </div>
  );
}
