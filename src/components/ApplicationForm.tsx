'use client';

import { useState } from 'react';

interface OperatorProfile {
  ao_area_code?: string;
  fullAddress?: string; // Construct this from your profile API before passing to the form
}

export default function ApplicationForm({ operatorProfile }: { operatorProfile?: OperatorProfile }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form state
  // Operator profile fields act as defaults but remain editable
  const [formData, setFormData] = useState({
    applicantName: '',
    applicantMobile: '',
    aoCode: operatorProfile?.ao_area_code || '',
    officeAddress: operatorProfile?.fullAddress || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGeneratePdf = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!formData.applicantName || !formData.applicantMobile) {
      setError('Applicant Name and Mobile are required.');
      return;
    }

    try {
      setIsDownloading(true);

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the complete mapped data to our Route Handler
        body: JSON.stringify(formData), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download PDF');
      }

      // Read the PDF binary output from the server
      const blob = await response.blob();

      // Create a temporary object URL in memory
      const downloadUrl = window.URL.createObjectURL(blob);

      // Create an invisible anchor to force the browser download prompt
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      // Extract a filename from state dynamically
      anchor.download = `${formData.applicantName.replace(/\s+/g, '_')}_application.pdf`;
      
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(downloadUrl);

    } catch (err) {
      console.error('Download failed:', err);
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">New Application Form</h2>
      
      <form onSubmit={handleGeneratePdf} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
            Applicant Name *
          </label>
          <input
            type="text"
            name="applicantName"
            value={formData.applicantName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
            Applicant Mobile *
          </label>
          <input
            type="text"
            name="applicantMobile"
            value={formData.applicantMobile}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
            placeholder="9876543210"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
            AO Code (Pre-filled from Operator Profile)
          </label>
          <input
            type="text"
            name="aoCode"
            value={formData.aoCode}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
            Office Address (Pre-filled from Operator Profile)
          </label>
          <textarea
            name="officeAddress"
            value={formData.officeAddress}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
          />
        </div>

        <button 
          type="submit"
          disabled={isDownloading}
          className="w-full mt-4 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isDownloading ? 'Generating PDF...' : 'Generate & Download PDF'}
        </button>
      </form>
    </div>
  );
}
