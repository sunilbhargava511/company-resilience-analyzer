'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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

  // Enhanced formatting function for better display
  const formatResult = (text) => {
    if (!text) return '';
    
    // First, let's clean up the text and handle tables
    let formattedText = text;
    
    // Handle markdown tables
    const tableRegex = /\|(.+?)\|\n\|[-\s|]+\|\n((?:\|.+?\|\n?)+)/gm;
    formattedText = formattedText.replace(tableRegex, (match, header, rows) => {
      const headerCells = header.split('|').map(cell => cell.trim()).filter(Boolean);
      const rowLines = rows.trim().split('\n');
      
      let tableHtml = '<div style="overflow-x: auto; margin: 2rem 0;"><table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">';
      
      // Header
      tableHtml += '<thead><tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">';
      headerCells.forEach(cell => {
        tableHtml += `<th style="padding: 12px 16px; text-align: left; font-weight: 600; font-size: 0.9rem;">${cell}</th>`;
      });
      tableHtml += '</tr></thead>';
      
      // Body
      tableHtml += '<tbody>';
      rowLines.forEach((row, index) => {
        if (row.trim()) {
          const cells = row.split('|').map(cell => cell.trim()).filter(Boolean);
          const bgColor = index % 2 === 0 ? '#f8fafc' : '#ffffff';
          tableHtml += `<tr style="background: ${bgColor}; border-bottom: 1px solid #e2e8f0;">`;
          cells.forEach(cell => {
            tableHtml += `<td style="padding: 12px 16px; border-right: 1px solid #e2e8f0; font-size: 0.85rem; line-height: 1.5;">${cell}</td>`;
          });
          tableHtml += '</tr>';
        }
      });
      tableHtml += '</tbody></table></div>';
      
      return tableHtml;
    });
    
    // Handle headers with proper hierarchy
    formattedText = formattedText
      .replace(/#### ([^\n]+)/g, '<h4 style="color: #7c3aed; font-weight: 700; font-size: 1.25rem; margin: 1.5rem 0 1rem 0; border-left: 4px solid #7c3aed; padding-left: 1rem;">$1</h4>')
      .replace(/### ([^\n]+)/g, '<h3 style="color: #10b981; font-weight: 700; font-size: 1.5rem; margin: 2rem 0 1rem 0; display: flex; align-items: center;"><span style="background: linear-gradient(135deg, #10b981, #059669); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">$1</span></h3>')
      .replace(/## ([^\n]+)/g, '<h2 style="color: #3b82f6; font-weight: 700; font-size: 1.75rem; margin: 2.5rem 0 1.5rem 0; border-bottom: 3px solid #3b82f6; padding-bottom: 0.5rem; background: linear-gradient(135deg, #3b82f6, #1d4ed8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">$1</h2>')
      .replace(/# ([^\n]+)/g, '<h1 style="color: #8b5cf6; font-weight: 800; font-size: 2.25rem; margin: 3rem 0 2rem 0; text-align: center; background: linear-gradient(135deg, #8b5cf6, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">$1</h1>');
    
    // Handle bold text with better styling
    formattedText = formattedText.replace(/\*\*(.+?)\*\*/g, '<strong style="color: #dc2626; font-weight: 700; background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 2px 6px; border-radius: 4px; display: inline-block; margin: 1px;">$1</strong>');
    
    // Handle paragraphs - convert double newlines to paragraph breaks
    formattedText = formattedText.replace(/\n\n/g, '</p><p style="margin: 1rem 0; line-height: 1.7; color: #374151;">');
    formattedText = '<p style="margin: 1rem 0; line-height: 1.7; color: #374151;">' + formattedText + '</p>';
    
    // Handle lists with better formatting
    const lines = formattedText.split('\n');
    let inList = false;
    let listType = '';
    const processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.match(/^[•\-\*]\s+(.+)/)) {
        if (!inList) {
          processedLines.push('<ul style="margin: 1rem 0; padding-left: 2rem; list-style-type: none;">');
          inList = true;
          listType = 'ul';
        }
        const content = line.replace(/^[•\-\*]\s+/, '');
        processedLines.push(`<li style="margin: 0.5rem 0; padding-left: 0.5rem; position: relative; line-height: 1.6; color: #374151;"><span style="position: absolute; left: -1.5rem; color: #10b981; font-weight: bold;">•</span>${content}</li>`);
      } else if (line.match(/^\d+\.\s+(.+)/)) {
        if (!inList || listType !== 'ol') {
          if (inList) processedLines.push(`</${listType}>`);
          processedLines.push('<ol style="margin: 1rem 0; padding-left: 2rem; counter-reset: item;">');
          inList = true;
          listType = 'ol';
        }
        const content = line.replace(/^\d+\.\s+/, '');
        processedLines.push(`<li style="margin: 0.5rem 0; padding-left: 0.5rem; counter-increment: item; position: relative; line-height: 1.6; color: #374151;"><span style="position: absolute; left: -2rem; color: #3b82f6; font-weight: bold;">\${item}.</span>${content}</li>`);
      } else {
        if (inList) {
          processedLines.push(`</${listType}>`);
          inList = false;
          listType = '';
        }
        if (line) {
          processedLines.push(line);
        }
      }
    }
    
    if (inList) {
      processedLines.push(`</${listType}>`);
    }
    
    return processedLines.join('\n');
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Share link copied to clipboard!');
  };

  const downloadReport = () => {
    if (!report) return;
    
    const element = document.createElement('a');
    const file = new Blob([report.analysisData], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${report.companyName.replace(/\\s+/g, '_')}_Shared_Analysis.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
            <h1 className="text-3xl font-bold">{report?.companyName} Resilience Analysis</h1>
          </div>
          
          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl border border-white/20">
              {report?.isExpired ? (
                <AlertCircle className="w-6 h-6 text-red-400" />
              ) : (
                <Clock className="w-6 h-6 text-yellow-400" />
              )}
              <div>
                <div className="font-medium">Generated</div>
                <div className="text-sm text-white/70">
                  {new Date(report?.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl border border-white/20">
              <Activity className="w-6 h-6 text-blue-400" />
              <div>
                <div className="font-medium">Model</div>
                <div className="text-sm text-white/70">{report?.modelUsed}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl border border-white/20">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <div>
                <div className="font-medium">Version</div>
                <div className="text-sm text-white/70">v{report?.version}</div>
              </div>
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