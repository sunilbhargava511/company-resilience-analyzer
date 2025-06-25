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
  Copy
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
  const [tokenLimit, setTokenLimit] = useState('4000');
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
    { value: '2000', label: 'Concise (2K tokens)', description: 'Brief analysis - fastest & lowest cost (~$0.08)' },
    { value: '4000', label: 'Standard (4K tokens)', description: 'Comprehensive analysis - works with all models (~$0.15)' },
    { value: '8000', label: 'Extended (8K tokens)', description: 'Maximum depth - requires Claude 3.5 Sonnet (~$0.30)' }
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

  // Fixed and simplified formatResult function
  const formatResult = (text) => {
    if (!text) return '';
    
    let html = text;
    
    // Remove standalone # symbols that are formatting artifacts
    html = html.replace(/^\s*#\s*$/gm, '');
    html = html.replace(/\n\s*#\s*\n/g, '\n\n');
    
    // Extract and handle the overall resilience score FIRST
    html = html.replace(/(?:###\s*1\.\s*)?Overall Resilience Score:?\s*(\d+(?:\.\d+)?)\s*\/\s*10/gi, (match, score) => {
      const numScore = parseFloat(score);
      const percentage = numScore * 10;
      let bgGradient = 'from-red-600 to-red-700';
      let scoreLabel = 'Fragile';
      
      if (numScore >= 8) {
        bgGradient = 'from-green-600 to-green-700';
        scoreLabel = 'Highly Resilient';
      } else if (numScore >= 6) {
        bgGradient = 'from-blue-600 to-blue-700';
        scoreLabel = 'Solid Resilience';
      } else if (numScore >= 4) {
        bgGradient = 'from-yellow-600 to-yellow-700';
        scoreLabel = 'Moderate Resilience';
      }
      
      return `
        <div class="my-8 p-8 rounded-2xl bg-gradient-to-br ${bgGradient} shadow-2xl text-white text-center transform hover:scale-105 transition-transform">
          <h2 class="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
            🏆 Overall Resilience Score
          </h2>
          <div class="text-7xl font-black mb-4 animate-pulse">${score}/10</div>
          <div class="text-2xl font-semibold mb-2">${scoreLabel}</div>
          <div class="text-lg opacity-90">${percentage}% Resilient</div>
          <div class="mt-6 max-w-md mx-auto">
            <div class="w-full bg-black/20 rounded-full h-4 overflow-hidden">
              <div class="h-full bg-white/80 rounded-full transition-all duration-1000" style="width: ${percentage}%"></div>
            </div>
          </div>
        </div>
      `;
    });
    
    // Handle Company Overview section with better parsing
    html = html.replace(/###\s*📊\s*Company Overview([\s\S]*?)(?=###|##|$)/gi, (match, content) => {
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
          <div class="my-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-700 shadow-lg">
            <h3 class="text-3xl font-bold mb-6 text-purple-800 dark:text-purple-300 flex items-center gap-3">
              📊 Company Overview
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        `;
        
        // Order the fields logically
        const orderedKeys = ['Company', 'Industry', 'Founded', 'Headquarters', 'Employees', 'Market Position', 'Customer Base', 'Business Model', 'Key Products/Services'];
        const fullWidthKeys = ['Business Model', 'Market Position', 'Key Products/Services', 'Customer Base'];
        
        orderedKeys.forEach(key => {
          if (companyData[key]) {
            const isFullWidth = fullWidthKeys.includes(key);
            const colSpan = isFullWidth ? 'md:col-span-2' : '';
            
            overviewHtml += `
              <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${colSpan}">
                <div class="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase mb-2">${key}</div>
                <div class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">${companyData[key]}</div>
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
      
      return match; // Return original if parsing fails
    });
    
    // Handle main section headers with emojis
    html = html.replace(/###\s+([🔋⚠️🎯🚀📈📊💡🔄].*?)$/gm, (match, content) => {
      return `<h3 class="text-2xl font-bold mt-12 mb-6 text-gray-900 dark:text-white border-b-2 border-purple-600 pb-3 flex items-center gap-2">${content}</h3>`;
    });
    
    // Handle subsection headers
    html = html.replace(/####\s+(.+)$/gm, (match, content) => {
      return `<h4 class="text-xl font-bold mt-8 mb-4 text-purple-700 dark:text-purple-300">${content}</h4>`;
    });
    
    // Handle other section headers
    html = html.replace(/###\s+(.+)$/gm, (match, content) => {
      return `<h3 class="text-xl font-bold mt-10 mb-6 text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600 pb-2">${content}</h3>`;
    });
    
    html = html.replace(/##\s+(.+)$/gm, 
      '<h2 class="text-3xl font-bold mt-12 mb-8 text-gray-900 dark:text-white border-b-2 border-purple-600 pb-3">$1</h2>');
    
    // Enhanced table formatting
    html = html.replace(/\n\|([^\n]+)\|\n\|[\s:|-]+\|\n((?:\|[^\n]+\|\n?)*)/g, (match, headerLine, bodyLines) => {
      const headers = headerLine.split('|').filter(h => h.trim()).map(h => h.trim());
      const rows = bodyLines.trim().split('\n').filter(line => line.trim()).map(line => 
        line.split('|').filter(cell => cell.trim()).map(cell => cell.trim())
      );
      
      if (headers.length === 0 || rows.length === 0) return match;
      
      let tableHtml = `
        <div class="overflow-x-auto my-8 rounded-xl shadow-lg">
          <table class="w-full border-collapse bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            <thead>
              <tr class="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
      `;
      
      headers.forEach((header) => {
        tableHtml += `<th class="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">${header}</th>`;
      });
      
      tableHtml += `
              </tr>
            </thead>
            <tbody>
      `;
      
      rows.forEach((row, index) => {
        const isTotalRow = row[0]?.toLowerCase().includes('total');
        const bgClass = index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800';
        
        tableHtml += `<tr class="${bgClass} hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors ${isTotalRow ? 'font-bold border-t-2 border-purple-200 dark:border-purple-700' : ''}">`;
        
        row.forEach((cell, cellIdx) => {
          let cellContent = cell
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-600 dark:text-purple-400">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
          
          // Style percentages and scores
          if (cell.includes('%') && !isNaN(parseFloat(cell.replace('%', '')))) {
            const val = parseFloat(cell.replace('%', ''));
            const colorClass = val >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
            cellContent = `<span class="${colorClass} font-semibold">${cellContent}</span>`;
          }
          
          if (cellIdx > 0 && cell.includes('/') && !isNaN(cell.split('/')[0])) {
            cellContent = `<strong class="text-purple-600 dark:text-purple-400">${cellContent}</strong>`;
          }
          
          const cellClass = cellIdx === 0 ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300';
          tableHtml += `<td class="px-6 py-4 text-sm ${cellClass}">${cellContent}</td>`;
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
    
    // Handle bullet points - convert to proper list format
    html = html.replace(/^[-•]\s+(.+)$/gm, '<li class="mb-2 text-gray-700 dark:text-gray-300 leading-relaxed">$1</li>');
    
    // Group consecutive list items
    html = html.replace(/(<li[^>]*>.*?<\/li>[\s\n]*)+/gs, (match) => {
      return `<ul class="list-disc list-inside space-y-2 mb-6 ml-4">${match}</ul>`;
    });
    
    // Handle special sections
    html = html.replace(/🎯\s*Bottom Line:/g, 
      `<div class="my-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-l-4 border-blue-500 shadow-lg">
        <h4 class="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
          🎯 Bottom Line
        </h4>
        <div class="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">`);
    
    html = html.replace(/💡\s*Portfolio Positioning Recommendation:/g, 
      `</div></div><div class="my-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-l-4 border-purple-500 shadow-lg">
        <h4 class="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
          💡 Portfolio Positioning Recommendation
        </h4>
        <div class="space-y-3">`);
    
    html = html.replace(/🔄\s*Key Scenarios to Monitor:/g, 
      `</div></div><div class="my-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border-l-4 border-amber-500 shadow-lg">
        <h4 class="text-xl font-bold text-amber-700 dark:text-amber-400 mb-4 flex items-center gap-2">
          🔄 Key Scenarios to Monitor
        </h4>
        <div class="space-y-4">`);
    
    // Handle checkboxes
    html = html.replace(/^\[\s*\]\s+(.+)$/gm, 
      '<div class="flex items-center gap-3 mb-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"><input type="checkbox" disabled class="w-4 h-4" /> <span class="text-gray-700 dark:text-gray-300">$1</span></div>');
    
    html = html.replace(/^\[x\]\s+(.+)$/gim, 
      '<div class="flex items-center gap-3 mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700"><input type="checkbox" disabled checked class="w-4 h-4 text-green-600" /> <span class="text-green-700 dark:text-green-300 font-semibold">$1</span></div>');
    
    // Format bold and italic text
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-purple-700 dark:text-purple-300">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-gray-600 dark:text-gray-400">$1</em>');
    
    // Convert paragraphs
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
        return `<p class="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">${paragraph}</p>`;
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
    
    return `<div class="prose max-w-none">${html}</div>`;
  };

  const shareAnalysis = async () => {
    const scoreMatch = result.match(/Overall Resilience Score:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
    const score = scoreMatch ? scoreMatch[1] : 'N/A';
    
    const shareData = {
      title: `${companyName} Resilience Analysis`,
      text: `Complexity investing analysis of ${companyName}. Resilience Score: ${score}/10`,
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
          Complexity Investing Analysis
        </h1>
        <p className="text-xl text-purple-300 max-w-2xl mx-auto leading-relaxed">
          Evaluate companies through adaptability, innovation, and value creation using NZS Capital&apos;s framework.
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
              placeholder="e.g., Apple, Microsoft, Tesla, DoorDash"
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
                    AI Model
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
                    Analysis Depth
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
                      8K tokens requires Claude 3.5 Sonnet
                    </p>
                  )}
                </div>
              </section>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-400/50 text-red-200 rounded-xl mb-6">
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
                  <BarChart3 className="w-6 h-6" />
                  Analyze {companyName || 'Company'} Resilience
                </>
              )}
            </button>
          </form>

          {/* Feature badges */}
          <div className="flex flex-wrap gap-3 mt-8 pt-8 border-t border-white/20 justify-center">
            <div className="flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium">
              <Shield className="w-4 h-4" />
              100-Point Scoring
            </div>
            <div className="flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium">
              <Target className="w-4 h-4" />
              Adjacent Markets
            </div>
            <div className="flex items-center gap-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-full text-sm font-medium">
              <Users className="w-4 h-4" />
              Competitive Analysis
            </div>
            <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              NZS Capital Framework
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <section className="mt-8">
            {/* Sticky header with actions */}
            <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 -mx-6 px-6 py-4 mb-8 rounded-t-xl">
              <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Award className="text-yellow-400 w-8 h-8" />
                  {companyName} Analysis Results
                </h2>
                <div className="flex gap-3 flex-wrap">
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
            
            {/* Main results content */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
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
          Your API key is never stored • Built with Claude&apos;s API • Powered by Next.js
        </div>
        <p className="text-xs text-purple-400">
          Complexity Investing framework inspired by NZS Capital&apos;s philosophy
        </p>
      </footer>
    </div>
  );
}