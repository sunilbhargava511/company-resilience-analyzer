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
  TrendingUp
} from 'lucide-react';

// Reusable styled Input component
function Input({ label, icon: Icon, type = 'text', value, onChange, placeholder, showToggle, isVisible, onToggle, onKeyPress }) {
  return (
    <div className="mb-6">
      <label className="flex items-center text-white font-semibold mb-2">
        {Icon && <Icon className="w-5 h-5 mr-2 text-purple-300" />}
        <span>{label}</span>
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-1"
          >
            {isVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
}

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
    { value: '3000', label: 'Concise (3K tokens)', description: 'Brief analysis - fastest & lowest cost (~$0.12)' },
    { value: '6000', label: 'Comprehensive (6K tokens)', description: 'Detailed analysis - recommended (~$0.24)' },
    { value: '8000', label: 'Maximum Depth (8K tokens)', description: 'Most thorough - requires Claude 3.5 Sonnet (~$0.32)' }
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

  // Enhanced formatting function for better report structure
  const formatResult = (text) => {
    if (!text) return '';
    
    let html = text;
    
    // Remove standalone # symbols that are formatting artifacts
    html = html.replace(/^\s*#\s*$/gm, '');
    html = html.replace(/\n\s*#\s*\n/g, '\n\n');
    
    // Extract and format the resilience score with enhanced styling
    html = html.replace(/(?:###\s*)?🏆\s*\*?\*?Overall Resilience Score:?\s*(\d+(?:\.\d+)?)\s*\/\s*10\*?\*?/gi, (match, score) => {
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
    const scoreMatch = result.match(/Overall Resilience Score:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
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
    <div className="min-h-screen text-gray-100">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <header className="relative z-10 py-12 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mb-8 shadow-2xl shadow-purple-500/30 animate-pulse">
          <Brain className="w-14 h-14 text-white" />
        </div>
        <h1 className="text-6xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
          Investment Analysis Platform
        </h1>
        <p className="text-xl text-purple-300 max-w-3xl mx-auto leading-relaxed">
          Professional-grade company analysis powered by AI. Get comprehensive investment insights, competitive positioning, and resilience scoring.
        </p>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <form onSubmit={(e) => {
            e.preventDefault();
            analyzeCompany();
          }}>
            <Input
              label="Anthropic API Key"
              icon={Zap}
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              showToggle
              isVisible={showApiKey}
              onToggle={() => setShowApiKey(!showApiKey)}
            />
            <p className="text-sm text-purple-300 -mt-4 mb-6 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Get your API key from{' '}
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline transition-colors">
                console.anthropic.com
              </a>
            </p>

            <Input
              label="Company Name"
              icon={Building2}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Apple, Microsoft, NVIDIA, DoorDash, Tesla"
              onKeyPress={(e) => e.key === 'Enter' && analyzeCompany()}
            />

            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors"
              >
                <Settings className="w-5 h-5" />
                Advanced Settings
                <ChevronRight className={`w-4 h-4 ${showAdvanced ? 'rotate-90' : ''} transition-transform`} />
              </button>
            </div>

            {showAdvanced && (
              <section className="p-6 bg-white/10 rounded-xl mb-6 space-y-6">
                <div>
                  <label className="flex items-center text-white font-semibold mb-3">
                    <Cpu className="w-5 h-5 mr-2 text-purple-300" />
                    AI Model Selection
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.id} className="bg-gray-900 text-white">
                        {m.name} - {m.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center text-white font-semibold mb-3">
                    <Clock className="w-5 h-5 mr-2 text-purple-300" />
                    Analysis Depth & Quality
                  </label>
                  <select
                    value={tokenLimit}
                    onChange={(e) => setTokenLimit(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  >
                    {tokenOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                        {opt.label} - {opt.description}
                      </option>
                    ))}
                  </select>
                  {model !== 'claude-3-5-sonnet-20241022' && parseInt(tokenLimit) > 4096 && (
                    <p className="mt-2 text-sm text-amber-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      8K tokens requires Claude 3.5 Sonnet for optimal performance
                    </p>
                  )}
                </div>
              </section>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-400/50 text-red-200 rounded-xl mb-6 backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!apiKey || !companyName || loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 transform hover:scale-[1.02] shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Analyzing {companyName}...
                </>
              ) : (
                <>
                  <TrendingUp className="w-6 h-6" />
                  Generate Investment Analysis
                </>
              )}
            </button>
          </form>

          {/* Enhanced feature badges */}
          <div className="flex flex-wrap gap-3 mt-8 pt-8 border-t border-white/20 justify-center">
            <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium">
              <Shield className="w-4 h-4" />
              Resilience Scoring
            </div>
            <div className="flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium">
              <Target className="w-4 h-4" />
              Market Analysis
            </div>
            <div className="flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium">
              <Users className="w-4 h-4" />
              Competitive Intel
            </div>
            <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Investment Thesis
            </div>
          </div>
        </div>

        {/* Enhanced Results Section */}
        {result && (
          <section className="mt-8">
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
      </main>

      <footer className="relative z-10 py-8 text-center text-sm text-purple-300 mt-16">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="w-4 h-4" />
          Your API key is never stored • Powered by Claude AI • Built with Next.js
        </div>
        <p className="text-xs text-purple-400">
          Professional investment analysis platform for informed decision making
        </p>
      </footer>
    </div>
  );
}