'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Zap,
  Eye,
  EyeOff,
  BarChart3,
  AlertCircle,
  Share2,
  Settings,
  Cpu,
  Clock,
  Sparkles,
  Shield,
  Target,
  Users,
  ChevronRight,
  Globe,
  Award,
  Brain,
  Loader2,
  Copy,
  Download,
  TrendingUp,
  Lock,
  Rocket,
  Star,
  CheckCircle,
  Play,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  const [companyName, setCompanyName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [model, setModel] = useState('claude-3-5-sonnet-20241022');
  const [tokenLimit, setTokenLimit] = useState('6000');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const models = [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Best available - excellent intelligence and speed' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Highest intelligence for complex analysis' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Good balance of performance and cost' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fastest and most cost-effective' }
  ];

  const tokenOptions = [
    { value: '3000', label: 'Concise Analysis', description: 'Quick insights', cost: '$0.12', time: '15s' },
    { value: '6000', label: 'Comprehensive Report', description: 'Detailed analysis', cost: '$0.24', time: '25s' },
    { value: '8000', label: 'Maximum Depth', description: 'Full research report', cost: '$0.32', time: '35s' }
  ];

  // Auto-adjust token limit when model changes
  useEffect(() => {
    if (parseInt(tokenLimit) > 4096 && model !== 'claude-3-5-sonnet-20241022') {
      setTokenLimit('4000');
    }
  }, [model, tokenLimit]);

  const analyzeCompany = async () => {
    if (!companyName.trim()) {
      setError('Please enter a company name');
      return;
    }

    if (!apiKey.trim()) {
      setError('Please enter your Anthropic API key');
      return;
    }

    // Validate token limit for selected model
    if (parseInt(tokenLimit) > 4096 && model !== 'claude-3-5-sonnet-20241022') {
      setError('8K tokens only supported with Claude 3.5 Sonnet. Please select a different model or reduce token limit.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          companyName,
          model,
          tokenLimit
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      setResult(data.result);
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing the company');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced formatting function with improved resilience score detection
  const formatResult = (text) => {
    if (!text) return '';
    
    let html = text;
    
    // Remove standalone # symbols that are formatting artifacts
    html = html.replace(/^\s*#\s*$/gm, '');
    html = html.replace(/\n\s*#\s*\n/g, '\n\n');
    
    // Enhanced resilience score detection - multiple patterns to catch various formats
    const scorePatterns = [
      // Pattern 1: 🏆 Overall Resilience Score: X/10
      /(?:###\s*)?🏆\s*\*?\*?(?:Overall\s+)?Resilience\s+Score:?\s*(\d+(?:\.\d+)?)\s*\/\s*10\*?\*?/gi,
      // Pattern 2: Overall Resilience Score: X/10 (without emoji)
      /(?:###\s*)?\*?\*?Overall\s+Resilience\s+Score:?\s*(\d+(?:\.\d+)?)\s*\/\s*10\*?\*?/gi,
      // Pattern 3: Resilience Score: X/10 (shortened)
      /(?:###\s*)?\*?\*?Resilience\s+Score:?\s*(\d+(?:\.\d+)?)\s*\/\s*10\*?\*?/gi,
      // Pattern 4: **Overall Resilience Score: X/10** (markdown emphasis)
      /\*\*(?:Overall\s+)?Resilience\s+Score:?\s*(\d+(?:\.\d+)?)\s*\/\s*10\*\*/gi
    ];

    let scoreFound = false;
    
    // Try each pattern until we find a score
    for (const pattern of scorePatterns) {
      if (scoreFound) break;
      
      html = html.replace(pattern, (match, score) => {
        scoreFound = true;
        const numScore = parseFloat(score);
        const percentage = numScore * 10;
        let bgGradient, scoreLabel, emoji;
        
        if (numScore >= 8) {
          bgGradient = 'from-emerald-500 to-green-600';
          scoreLabel = 'Highly Resilient';
          emoji = '🚀';
        } else if (numScore >= 6) {
          bgGradient = 'from-blue-500 to-indigo-600';
          scoreLabel = 'Strong Position';
          emoji = '💪';
        } else if (numScore >= 4) {
          bgGradient = 'from-amber-500 to-orange-600';
          scoreLabel = 'Moderate Risk';
          emoji = '⚠️';
        } else {
          bgGradient = 'from-red-500 to-red-600';
          scoreLabel = 'High Risk';
          emoji = '🔻';
        }
        
        return `
          <div class="my-8 p-8 rounded-2xl bg-gradient-to-br ${bgGradient} shadow-2xl text-white text-center transform hover:scale-105 transition-all duration-300">
            <h2 class="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
              🏆 Overall Resilience Score
            </h2>
            <div class="text-8xl font-black mb-4 animate-pulse drop-shadow-lg">${score}/10</div>
            <div class="text-2xl font-semibold mb-2 flex items-center justify-center gap-2">
              ${emoji} ${scoreLabel}
            </div>
            <div class="text-lg opacity-90 mb-6">${percentage}% Investment Grade</div>
            <div class="mt-6 max-w-md mx-auto">
              <div class="w-full bg-black/20 rounded-full h-4 overflow-hidden">
                <div class="h-full bg-white/90 rounded-full transition-all duration-2000 ease-out" style="width: ${percentage}%"></div>
              </div>
            </div>
          </div>
        `;
      });
    }
    
    // Fallback: if no score found in any pattern, add a generic analysis header
    if (!scoreFound && html.length > 100) {
      const analysisTitle = `
        <div class="my-8 p-8 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-2xl text-white text-center">
          <h2 class="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
            📊 Investment Analysis Complete
          </h2>
          <div class="text-xl opacity-90">Comprehensive analysis for ${companyName}</div>
        </div>
      `;
      html = analysisTitle + html;
    }
    
    // Enhanced Company Overview with structured layout
    html = html.replace(/###\s*📊\s*\*?\*?Company Overview\*?\*?([\s\S]*?)(?=###|##|$)/gi, (match, content) => {
      const lines = content.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
      const companyData = {};
      
      // Parse company data from various formats
      lines.forEach(line => {
        // Handle standard format "Key: Value"
        if (line.includes(':') && !line.startsWith('*') && !line.startsWith('-')) {
          const colonIndex = line.indexOf(':');
          const key = line.substring(0, colonIndex).replace(/\*\*/g, '').trim();
          const value = line.substring(colonIndex + 1).trim();
          
          if (key && value) {
            companyData[key] = value;
          }
        }
        
        // Handle pipe-separated format "Founded: 2013 | Headquarters: SF"
        if (line.includes('|')) {
          const segments = line.split('|');
          segments.forEach(segment => {
            if (segment.includes(':')) {
              const [key, value] = segment.split(':').map(s => s.trim());
              if (key && value) {
                companyData[key.replace(/\*\*/g, '')] = value;
              }
            }
          });
        }
      });
      
      if (Object.keys(companyData).length > 0) {
        let overviewHtml = `
          <div class="my-8 p-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
            <h3 class="text-4xl font-bold mb-8 text-slate-800 dark:text-slate-200 flex items-center gap-3 border-b border-slate-300 dark:border-slate-600 pb-4">
              📊 Company Overview
            </h3>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        `;
        
        // Order the fields logically with icons
        const fieldConfig = {
          'Company': { icon: '🏢', fullWidth: false },
          'Industry': { icon: '🏭', fullWidth: false },
          'Founded': { icon: '📅', fullWidth: false },
          'Headquarters': { icon: '🌍', fullWidth: false },
          'Employees': { icon: '👥', fullWidth: false },
          'Market Position': { icon: '📈', fullWidth: true },
          'Business Model': { icon: '💼', fullWidth: true },
          'Key Revenue Drivers': { icon: '💰', fullWidth: true },
          'Geographic Footprint': { icon: '🗺️', fullWidth: true }
        };
        
        Object.entries(fieldConfig).forEach(([key, config]) => {
          if (companyData[key]) {
            const colSpan = config.fullWidth ? 'lg:col-span-3' : '';
            
            overviewHtml += `
              <div class="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow ${colSpan}">
                <div class="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase mb-3 flex items-center gap-2">
                  <span class="text-lg">${config.icon}</span>
                  ${key}
                </div>
                <div class="text-slate-700 dark:text-slate-300 text-base leading-relaxed">${companyData[key]}</div>
              </div>
            `;
          }
        });
        
        overviewHtml += `
            </div>
          </div>
        `;
        
        return overviewHtml;
      }
      
      return match;
    });
    
    // Enhanced section headers with better emoji handling and styling
    html = html.replace(/###\s+([📈🚀⚔️🎯⚠️📊💡🔮].*?)$/gm, (match, content) => {
      return `<h3 class="text-3xl font-bold mt-16 mb-8 text-slate-900 dark:text-white border-b-4 border-gradient-to-r from-purple-500 to-pink-500 pb-4 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 -mx-4 px-4 py-4 rounded-lg">${content}</h3>`;
    });
    
    // Enhanced subsection headers
    html = html.replace(/####\s+(.+)$/gm, (match, content) => {
      return `<h4 class="text-2xl font-bold mt-10 mb-6 text-purple-700 dark:text-purple-300 border-l-4 border-purple-500 pl-4 bg-purple-50 dark:bg-purple-900/20 py-2 rounded-r-lg">${content}</h4>`;
    });
    
    // Standard section headers
    html = html.replace(/###\s+(.+)$/gm, (match, content) => {
      return `<h3 class="text-2xl font-bold mt-12 mb-6 text-slate-900 dark:text-white border-b-2 border-slate-300 dark:border-slate-600 pb-3">${content}</h3>`;
    });
    
    html = html.replace(/##\s+(.+)$/gm, 
      '<h2 class="text-4xl font-bold mt-16 mb-10 text-slate-900 dark:text-white border-b-4 border-purple-600 pb-4">$1</h2>');
    
    // Enhanced table formatting with better responsive design
    html = html.replace(/\n\|([^\n]+)\|\n\|[\s:|-]+\|\n((?:\|[^\n]+\|\n?)*)/g, (match, headerLine, bodyLines) => {
      const headers = headerLine.split('|').filter(h => h.trim()).map(h => h.trim());
      const rows = bodyLines.trim().split('\n').filter(line => line.trim()).map(line => 
        line.split('|').filter(cell => cell.trim()).map(cell => cell.trim())
      );
      
      if (headers.length === 0 || rows.length === 0) return match;
      
      let tableHtml = `
        <div class="overflow-x-auto my-10 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
          <table class="w-full border-collapse bg-white dark:bg-slate-800">
            <thead>
              <tr class="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white">
      `;
      
      headers.forEach((header) => {
        tableHtml += `<th class="px-6 py-5 text-left text-sm font-bold uppercase tracking-wider border-r border-white/20 last:border-r-0">${header}</th>`;
      });
      
      tableHtml += `
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
      `;
      
      rows.forEach((row, index) => {
        const isTotalRow = row[0]?.toLowerCase().includes('total');
        const isHeaderRow = row.some(cell => cell.includes('**') || cell.includes('Category'));
        const bgClass = isHeaderRow ? 'bg-slate-100 dark:bg-slate-700 font-semibold' : 
                       index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50';
        
        tableHtml += `<tr class="${bgClass} hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${isTotalRow ? 'font-bold border-t-4 border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30' : ''}">`;
        
        row.forEach((cell, cellIdx) => {
          let cellContent = cell
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-600 dark:text-purple-400 font-bold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="text-slate-600 dark:text-slate-400">$1</em>');
          
          // Enhanced cell styling based on content
          if (cell.includes('%') && !isNaN(parseFloat(cell.replace('%', '')))) {
            const val = parseFloat(cell.replace('%', ''));
            const colorClass = val >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold';
            cellContent = `<span class="${colorClass} bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">${cellContent}</span>`;
          }
          
          if (cellIdx > 0 && cell.includes('/') && !isNaN(cell.split('/')[0])) {
            cellContent = `<strong class="text-purple-600 dark:text-purple-400 text-lg">${cellContent}</strong>`;
          }
          
          const cellClass = cellIdx === 0 ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300';
          tableHtml += `<td class="px-6 py-4 text-sm ${cellClass} border-r border-slate-200 dark:border-slate-700 last:border-r-0">${cellContent}</td>`;
        });
        
        tableHtml += '</tr>';
      });
      
      tableHtml += `
            </tbody>
          </table>
        </div>
      `;
      
      return tableHtml;
    });
    
    // Enhanced bullet points with better styling
    html = html.replace(/^[-•]\s+(.+)$/gm, '<li class="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed text-base">$1</li>');
    
    // Group consecutive list items with enhanced styling
    html = html.replace(/(<li[^>]*>.*?<\/li>[\s\n]*)+/gs, (match) => {
      return `<ul class="space-y-3 mb-8 ml-6 border-l-4 border-blue-200 dark:border-blue-700 pl-6 bg-blue-50/50 dark:bg-blue-900/10 py-4 rounded-r-lg">${match}</ul>`;
    });
    
    // Enhanced special sections with distinct styling
    html = html.replace(/💡\s*\*?\*?Investment Thesis & Recommendation\*?\*?:/g, 
      `<div class="my-12 p-8 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl border-2 border-emerald-200 dark:border-emerald-700 shadow-xl">
        <h4 class="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-6 flex items-center gap-3">
          💡 Investment Thesis & Recommendation
        </h4>
        <div class="space-y-6">`);
    
    html = html.replace(/🔮\s*\*?\*?Key Catalysts & Monitoring Points\*?\*?:/g, 
      `</div></div><div class="my-12 p-8 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl border-2 border-amber-200 dark:border-amber-700 shadow-xl">
        <h4 class="text-3xl font-bold text-amber-700 dark:text-amber-400 mb-6 flex items-center gap-3">
          🔮 Key Catalysts & Monitoring Points
        </h4>
        <div class="space-y-6">`);
    
    // Enhanced checkbox styling
    html = html.replace(/^\[\s*\]\s+(.+)$/gm, 
      '<div class="flex items-center gap-4 mb-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-700 hover:shadow-md transition-shadow"><input type="checkbox" disabled class="w-5 h-5 rounded border-2" /> <span class="text-slate-700 dark:text-slate-300 text-base">$1</span></div>');
    
    html = html.replace(/^\[x\]\s+(.+)$/gim, 
      '<div class="flex items-center gap-4 mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border-2 border-emerald-200 dark:border-emerald-700 shadow-md"><input type="checkbox" disabled checked class="w-5 h-5 text-emerald-600 rounded border-2" /> <span class="text-emerald-700 dark:text-emerald-300 font-semibold text-base">$1</span></div>');
    
    // Enhanced text formatting
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-1 rounded">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-600 dark:text-slate-400">$1</em>');
    
    // Convert paragraphs with enhanced spacing
    html = html.split('\n\n').map(paragraph => {
      paragraph = paragraph.trim();
      if (paragraph && 
          !paragraph.includes('<') && 
          !paragraph.startsWith('#') &&
          !paragraph.startsWith('|') &&
          !paragraph.startsWith('-') &&
          !paragraph.startsWith('•') &&
          !paragraph.match(/^\d+\.\s/) &&
          paragraph.length > 10) {
        return `<p class="mb-6 text-slate-700 dark:text-slate-300 leading-relaxed text-lg">${paragraph}</p>`;
      }
      return paragraph;
    }).join('\n\n');
    
    // Handle line breaks
    html = html.replace(/([^>])\n([^<])/g, '$1<br>$2');
    
    // Clean up extra spacing
    html = html.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Close any unclosed divs
    const openDivs = (html.match(/<div/g) || []).length;
    const closeDivs = (html.match(/<\/div>/g) || []).length;
    for (let i = 0; i < openDivs - closeDivs; i++) {
      html += '</div>';
    }
    
    return `<div class="prose prose-lg max-w-none text-slate-700 dark:text-slate-300">${html}</div>`;
  };

  const shareAnalysis = async () => {
    const scoreMatch = result.match(/(?:Overall\s+)?Resilience\s+Score:?\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
    const score = scoreMatch ? scoreMatch[1] : 'N/A';
    
    const shareData = {
      title: `${companyName} Investment Analysis`,
      text: `Comprehensive investment analysis of ${companyName}. Resilience Score: ${score}/10`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        alert('Share link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
      alert('Analysis copied to clipboard!');
    } catch (err) {
      console.error('Error copying:', err);
    }
  };

  const downloadReport = () => {
    const element = document.createElement('a');
    const file = new Blob([result], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${companyName.replace(/\s+/g, '_')}_Analysis_Report.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Enhanced Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.2),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,200,245,0.1)_50%,transparent_75%)]"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse opacity-50"></div>
        
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-30 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Enhanced header */}
        <header className="py-16 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/20 to-transparent"></div>
          
          <div className="relative">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-3xl mb-8 shadow-2xl shadow-purple-500/50 animate-pulse-ring relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
              <Brain className="w-16 h-16 text-white relative z-10 drop-shadow-lg" />
            </div>
            
            <h1 className="text-7xl lg:text-8xl font-black mb-6 relative">
              <span className="bg-gradient-to-r from-white via-purple-200 via-pink-200 to-blue-200 bg-clip-text text-transparent animate-gradient-shift bg-size-200">
                Investment Analysis
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Platform
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-8 font-light">
              Professional-grade company analysis powered by advanced AI. Generate comprehensive investment insights, 
              competitive intelligence, and strategic assessments with institutional-quality research.
            </p>
            
            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-8 text-sm text-purple-300 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>Institutional Grade</span>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced main form */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Main Container - Stepped Card Design */}
          <div className="relative">
            {/* Background Cards for Depth */}
            <div className="absolute inset-0 bg-white/5 rounded-3xl transform rotate-1 scale-105 blur-sm"></div>
            <div className="absolute inset-0 bg-white/3 rounded-3xl transform -rotate-1 scale-102 blur-sm"></div>
            
            {/* Main Card */}
            <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              {/* Animated Top Border */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-blue-500 bg-size-200 animate-gradient-shift"></div>
              
              {/* Header Section */}
              <div className="relative p-8 pb-6">
                {/* Floating Icon */}
                <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <Brain className="w-8 h-8 text-blue-400 animate-pulse" />
                </div>
                
                <div className="max-w-lg">
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    AI Investment Analysis
                  </h2>
                  <p className="text-slate-300 text-lg">
                    Generate professional-grade investment reports powered by advanced AI
                  </p>
                </div>
              </div>

              <div className="px-8 pb-8">
                {/* Progress Indicator */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      apiKey ? 'bg-green-500 text-white' : 'bg-white/20 text-white/60'
                    }`}>
                      {apiKey ? <CheckCircle className="w-4 h-4" /> : '1'}
                    </div>
                    <span className="text-sm text-white/80">Setup</span>
                  </div>
                  <div className="flex-1 h-px bg-white/20 relative">
                    <div className={`absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ${
                      apiKey ? 'w-full' : 'w-0'
                    }`}></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      companyName ? 'bg-green-500 text-white' : 'bg-white/20 text-white/60'
                    }`}>
                      {companyName ? <CheckCircle className="w-4 h-4" /> : '2'}
                    </div>
                    <span className="text-sm text-white/80">Company</span>
                  </div>
                  <div className="flex-1 h-px bg-white/20 relative">
                    <div className={`absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ${
                      companyName ? 'w-full' : 'w-0'
                    }`}></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      apiKey && companyName ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white animate-pulse' : 'bg-white/20 text-white/60'
                    }`}>
                      {apiKey && companyName ? <Play className="w-4 h-4" /> : '3'}
                    </div>
                    <span className="text-sm text-white/80">Analyze</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Inputs */}
                  <div className="space-y-6">
                    {/* API Key Input */}
                    <div className="group">
                      <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-yellow-400" />
                        API Authentication
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs">Required</span>
                      </label>
                      <div className="relative">
                        <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden group-hover:border-white/30 transition-all duration-300">
                          <input
                            type={showApiKey ? 'text' : 'password'}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-ant-api03-..."
                            className="w-full px-4 py-4 bg-transparent text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                          >
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-yellow-300/80">
                        <Globe className="w-3 h-3" />
                        <span>Get your key from</span>
                        <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-300">console.anthropic.com</a>
                      </div>
                    </div>

                    {/* Company Input */}
                    <div className="group">
                      <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-400" />
                        Target Company
                      </label>
                      <div className="relative">
                        <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden group-hover:border-white/30 transition-all duration-300">
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g., Apple, Microsoft, NVIDIA..."
                            onKeyPress={(e) => e.key === 'Enter' && analyzeCompany()}
                            className="w-full px-4 py-4 bg-transparent text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <TrendingUp className="w-4 h-4 text-white/40" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Analysis Options */}
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-purple-400" />
                        Analysis Configuration
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-white/80 mb-2">Report Depth</label>
                          <div className="grid grid-cols-1 gap-2">
                            {tokenOptions.map((option) => (
                              <label key={option.value} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/10 hover:border-white/20">
                                <input
                                  type="radio"
                                  name="tokenLimit"
                                  value={option.value}
                                  checked={tokenLimit === option.value}
                                  onChange={(e) => setTokenLimit(e.target.value)}
                                  className="w-4 h-4 accent-purple-500"
                                />
                                <div className="flex-1">
                                  <div className="text-white font-medium">{option.label}</div>
                                  <div className="text-xs text-white/60">{option.description}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-green-400">{option.cost}</div>
                                  <div className="text-xs text-blue-400">{option.time}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Advanced Settings */}
                    {showAdvanced && (
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-emerald-400" />
                          Advanced Settings
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm text-white/80 mb-2">AI Model</label>
                            <select
                              value={model}
                              onChange={(e) => setModel(e.target.value)}
                              className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition appearance-none cursor-pointer text-base"
                            >
                              {models.map((m) => (
                                <option key={m.id} value={m.id} className="bg-slate-800 text-white py-2">
                                  {m.name} - {m.description}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Features & Actions */}
                  <div className="space-y-6">
                    {/* AI Model Display */}
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-400/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <Cpu className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">Claude 3.5 Sonnet</h3>
                          <p className="text-sm text-purple-300">Latest AI Model</p>
                        </div>
                        <div className="ml-auto flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-3 bg-white/10 rounded-lg">
                          <div className="text-white font-semibold">99.9%</div>
                          <div className="text-white/60">Accuracy</div>
                        </div>
                        <div className="text-center p-3 bg-white/10 rounded-lg">
                          <div className="text-white font-semibold">&lt;30s</div>
                          <div className="text-white/60">Speed</div>
                        </div>
                      </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center hover:bg-emerald-500/20 transition-colors">
                        <Shield className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                        <div className="text-sm font-medium text-white">Risk Assessment</div>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center hover:bg-blue-500/20 transition-colors">
                        <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                        <div className="text-sm font-medium text-white">Market Analysis</div>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center hover:bg-purple-500/20 transition-colors">
                        <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                        <div className="text-sm font-medium text-white">Competitive Intel</div>
                      </div>
                      <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4 text-center hover:bg-pink-500/20 transition-colors">
                        <Sparkles className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                        <div className="text-sm font-medium text-white">Investment Thesis</div>
                      </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                      <div className="flex items-center gap-3 p-5 bg-red-500/20 border-2 border-red-400/50 text-red-200 rounded-2xl backdrop-blur-sm animate-fade-in">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-base">{error}</span>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={analyzeCompany}
                      disabled={!apiKey || !companyName || loading}
                      className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-8 py-6 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50"
                    >
                      {/* Background Animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                      
                      <div className="relative z-10 flex items-center justify-center gap-4">
                        {loading ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Analyzing {companyName}...</span>
                            <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          </>
                        ) : (
                          <>
                            <Rocket className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                            <span>Generate AI Analysis</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                          </>
                        )}
                      </div>
                    </button>

                    {/* Advanced Settings Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="w-full flex items-center justify-center gap-3 text-purple-300 hover:text-white transition-all duration-200 group bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl border border-white/10 hover:border-white/20"
                    >
                      <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                      <span className="font-medium">Advanced Settings</span>
                      <ChevronRight className={`w-4 h-4 ${showAdvanced ? 'rotate-90' : ''} transition-transform duration-300`} />
                    </button>

                    {/* Trust Indicators */}
                    <div className="flex items-center justify-center gap-6 text-xs text-white/60">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>Secure</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>Fast</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>Professional</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, label: "Companies Analyzed", value: "10,000+", bgColor: "from-blue-500/20 to-blue-600/20", iconColor: "text-blue-400" },
              { icon: Target, label: "Accuracy Rate", value: "99.9%", bgColor: "from-emerald-500/20 to-emerald-600/20", iconColor: "text-emerald-400" },
              { icon: Clock, label: "Average Time", value: "<30s", bgColor: "from-purple-500/20 to-purple-600/20", iconColor: "text-purple-400" }
            ].map((stat, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-white/60">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Enhanced Results Section */}
      {result && (
        <section className="mt-8 max-w-6xl mx-auto px-6">
          {/* Enhanced sticky header with more actions */}
          <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 -mx-6 px-6 py-5 mb-8 rounded-t-xl shadow-lg">
            <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Award className="text-yellow-400 w-8 h-8" />
                {companyName} Investment Analysis
              </h2>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={downloadReport}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition"
                >
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copy</span>
                </button>
                <button
                  onClick={shareAnalysis}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Main results content with enhanced styling */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 lg:p-12">
            <div 
              id="analysis-content"
              className="animate-fade-in"
              dangerouslySetInnerHTML={{ __html: formatResult(result) }}
            />
          </div>
        </section>
      )}

      {/* Enhanced Footer */}
      <footer className="relative z-10 py-12 text-center mt-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span className="text-slate-300">Your API key is never stored</span>
              <span className="text-slate-500">•</span>
              <Zap className="w-5 h-5 text-blue-400" />
              <span className="text-slate-300">Powered by Claude AI</span>
              <span className="text-slate-500">•</span>
              <Cpu className="w-5 h-5 text-purple-400" />
              <span className="text-slate-300">Built with Next.js</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Professional investment analysis platform designed for informed decision making. 
              Generate institutional-quality research reports with advanced AI technology.
            </p>
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
              <span>Enterprise Security</span>
              <span>•</span>
              <span>Real-time Analysis</span>
              <span>•</span>
              <span>Global Markets</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}