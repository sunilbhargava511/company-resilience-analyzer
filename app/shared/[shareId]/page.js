'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatResult } from '../../../lib/formatReport';
import { 
  ArrowLeft, 
  Clock, 
  Sparkles, 
  Activity, 
  Building2, 
  AlertCircle,
  Download,
  Share2,
  Copy,
  Loader2,
  ChevronRight
} from 'lucide-react';

export default function SharedReportPage({ params }) {
  const { shareId } = params;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/reports/${shareId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load report');
        }
        
        setReport(data.report);
      } catch (err) {
        setError(err.message || 'Failed to load shared report');
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchReport();
    }
  }, [shareId]);


  const copyShareUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Share link copied to clipboard!');
  };

  const downloadReport = () => {
    if (!report) return;
    
    // Get the formatted report content
    const reportContent = document.querySelector('.prose');
    if (!reportContent) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Write the content to the new window with print styles
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${report.companyName} Resilience Analysis</title>
          <style>
            @media print {
              body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
              .no-print { display: none !important; }
              .score-card { page-break-inside: avoid; }
              h1, h2, h3 { page-break-after: avoid; }
              table { page-break-inside: avoid; }
              .prose { max-width: none !important; }
            }
            body { padding: 20px; line-height: 1.6; }
            h1 { color: #1f2937; margin-bottom: 0.5rem; }
            .generation-date { color: #6b7280; font-size: 0.875rem; margin-bottom: 2rem; }
            ${document.querySelector('style') ? document.querySelector('style').innerHTML : ''}
          </style>
        </head>
        <body>
          <h1>${report.companyName} Resilience Analysis</h1>
          <div class="generation-date">Generated on ${new Date(report.createdAt).toLocaleDateString()}</div>
          ${reportContent.outerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait a moment for content to load, then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading shared analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-4">Report Not Found</h1>
          <p className="text-white/80 mb-8">{error}</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-blue-700 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Analyzer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="flex items-center gap-2 text-white hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Analyzer
            </Link>
            
            <div className="flex items-center gap-4">
              <button
                onClick={copyShareUrl}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Copy share link"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              
              <button
                onClick={downloadReport}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Report Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-8 h-8 text-emerald-400" />
            <div>
              <h1 className="text-3xl font-bold">{report?.companyName} Resilience Analysis</h1>
              <p className="text-white/60 text-sm mt-1">
                Generated on {new Date(report?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          

          {/* Expiration Warning */}
          {report?.isExpired && (
            <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-400/50 text-red-200 rounded-xl mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <div className="font-medium">Analysis Expired</div>
                <div className="text-sm">
                  This analysis is over 3 months old. For the most current insights, 
                  <Link href="/" className="underline hover:text-white ml-1">
                    generate a fresh analysis
                  </Link>.
                </div>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="p-6 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 rounded-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-2">Want to analyze this company yourself?</h3>
                <p className="text-white/80 text-sm">
                  Get fresh insights, interactive chat, and personalized analysis for {report?.companyName}.
                </p>
              </div>
              <Link
                href={`/?company=${encodeURIComponent(report?.companyName || '')}`}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-blue-700 transition-all whitespace-nowrap"
              >
                <Activity className="w-5 h-5" />
                Analyze Now
              </Link>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 lg:p-12">
          <div 
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: formatResult(report?.analysisData || '') }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-white/10 bg-black/20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-white/60">
            Powered by <span className="text-emerald-400 font-semibold">Interactive Resilience Analyzer</span>
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 mt-4 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Try it yourself <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </footer>
    </div>
  );
}