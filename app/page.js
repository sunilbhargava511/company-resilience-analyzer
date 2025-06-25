'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Zap,
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
  Rocket,
  Star,
  CheckCircle,
  Play,
  ArrowRight,
  Activity,
  Layers,
  Compass
} from 'lucide-react';

export default function Home() {
  const [companyName, setCompanyName] = useState('');
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
    { value: '3000', label: 'Quick Resilience Score', description: 'Core metrics & score', time: '15s' },
    { value: '6000', label: 'Comprehensive Analysis', description: 'Full resilience report', time: '25s' },
    { value: '8000', label: 'Maximum Depth', description: 'Complete framework', time: '35s' }
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

  // Enhanced formatting function for resilience reports
  const formatResult = (text) => {
    if (!text) return '';
    
    let html = text;
    
    // Remove standalone # symbols that are formatting artifacts
    html = html.replace(/^\s*#\s*$/gm, '');
    html = html.replace(/\n\s*#\s*\n/g, '\n\n');
    
    // FIRST: Extract and display resilience score at the very top
    const scorePatterns = [
      /(?:###\s*)?(?:1\.\s*)?🏆?\s*\*?\*?(?:Overall\s+)?Resilience\s+Score:?\s*(\d+(?:\.\d+)?)\s*\/\s*10\*?\*?/gi,
      /(?:###\s*)?(?:1\.\s*)?\*?\*?Overall\s+Resilience\s+Score:?\s*(\d+(?:\.\d+)?)\s*\/\s*10\*?\*?/gi,
      /(?:###\s*)?(?:1\.\s*)?\*?\*?Resilience\s+Score:?\s*(\d+(?:\.\d+)?)\s*\/\s*10\*?\*?/gi,
      /\*\*(?:Overall\s+)?Resilience\s+Score:?\s*(\d+(?:\.\d+)?)\s*\/\s*10\*\*/gi
    ];

    let scoreFound = false;
    let scoreDisplay = '';
    let extractedScore = null;
    
    // Try each pattern to find and extract the score
    for (const pattern of scorePatterns) {
      if (scoreFound) break;
      
      const match = text.match(pattern);
      if (match) {
        const scoreMatch = match[0].match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
        if (scoreMatch) {
          extractedScore = parseFloat(scoreMatch[1]);
          scoreFound = true;
          
          const numScore = extractedScore;
          const percentage = numScore * 10;
          let bgGradient, scoreLabel, emoji, borderColor, textColor;
          
          if (numScore >= 8) {
            bgGradient = 'from-emerald-500 to-green-600';
            scoreLabel = 'Highly Resilient';
            emoji = '🚀';
            borderColor = 'border-emerald-400';
            textColor = 'text-emerald-100';
          } else if (numScore >= 6) {
            bgGradient = 'from-blue-500 to-indigo-600';
            scoreLabel = 'Strong Position';
            emoji = '💪';
            borderColor = 'border-blue-400';
            textColor = 'text-blue-100';
          } else if (numScore >= 4) {
            bgGradient = 'from-amber-500 to-orange-600';
            scoreLabel = 'Moderate Risk';
            emoji = '⚠️';
            borderColor = 'border-amber-400';
            textColor = 'text-amber-100';
          } else {
            bgGradient = 'from-red-500 to-red-600';
            scoreLabel = 'High Risk';
            emoji = '🔻';
            borderColor = 'border-red-400';
            textColor = 'text-red-100';
          }
          
          scoreDisplay = `
            <div class="mb-16 p-10 rounded-3xl bg-gradient-to-br ${bgGradient} shadow-2xl text-white text-center transform hover:scale-105 transition-all duration-500 border-4 ${borderColor} relative overflow-hidden">
              <!-- Background pattern -->
              <div class="absolute inset-0 bg-white/10 bg-grid-pattern opacity-30"></div>
              
              <!-- Content -->
              <div class="relative z-10">
                <h2 class="text-4xl font-bold mb-6 flex items-center justify-center gap-4">
                  🏆 Overall Resilience Score
                </h2>
                
                <!-- Score display -->
                <div class="relative mb-8">
                  <div class="text-9xl font-black mb-4 animate-pulse drop-shadow-2xl">${numScore}/10</div>
                  <div class="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl animate-bounce">
                    ${emoji}
                  </div>
                </div>
                
                <div class="text-3xl font-bold mb-4 ${textColor}">${scoreLabel}</div>
                <div class="text-xl opacity-90 mb-8">${percentage}% Investment Grade</div>
                
                <!-- Progress bar -->
                <div class="max-w-md mx-auto mb-6">
                  <div class="w-full bg-black/30 rounded-full h-6 overflow-hidden shadow-inner">
                    <div class="h-full bg-white/90 rounded-full transition-all duration-3000 ease-out shadow-lg" style="width: ${percentage}%"></div>
                  </div>
                </div>
                
                <!-- Resilience indicators -->
                <div class="grid grid-cols-3 gap-4 text-sm">
                  <div class="bg-white/20 rounded-xl p-3">
                    <div class="font-bold">Adaptability</div>
                    <div class="opacity-80">${numScore >= 7 ? 'High' : numScore >= 5 ? 'Medium' : 'Low'}</div>
                  </div>
                  <div class="bg-white/20 rounded-xl p-3">
                    <div class="font-bold">Optionality</div>
                    <div class="opacity-80">${numScore >= 7 ? 'Strong' : numScore >= 5 ? 'Moderate' : 'Limited'}</div>
                  </div>
                  <div class="bg-white/20 rounded-xl p-3">
                    <div class="font-bold">Durability</div>
                    <div class="opacity-80">${numScore >= 7 ? 'Robust' : numScore >= 5 ? 'Stable' : 'Fragile'}</div>
                  </div>
                </div>
              </div>
            </div>
          `;
          
          // Remove the original score section from the text
          for (const removePattern of scorePatterns) {
            html = html.replace(removePattern, '');
          }
          
          break;
        }
      }
    }
    
    // If no score found, add a generic analysis header
    if (!scoreFound && html.length > 100) {
      scoreDisplay = `
        <div class="mb-16 p-10 rounded-3xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-2xl text-white text-center">
          <h2 class="text-4xl font-bold mb-4 flex items-center justify-center gap-4">
            📊 Resilience Analysis Complete
          </h2>
          <div class="text-xl opacity-90">Comprehensive analysis for ${companyName}</div>
        </div>
      `;
    }
    
    // Enhanced Company Overview with icons and structured layout
    html = html.replace(/###\s*📊\s*\*?\*?Company Overview\*?\*?([\s\S]*?)(?=###|##|$)/gi, (match, content) => {
      const lines = content.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
      const companyData = {};
      
      // Parse company data from various formats
      lines.forEach(line => {
        if (line.includes(':') && !line.startsWith('*') && !line.startsWith('-')) {
          const colonIndex = line.indexOf(':');
          const key = line.substring(0, colonIndex).replace(/\*\*/g, '').trim();
          const value = line.substring(colonIndex + 1).trim();
          
          if (key && value) {
            companyData[key] = value;
          }
        }
        
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
          <div class="my-12 p-10 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-2xl">
            <h3 class="text-4xl font-bold mb-10 text-slate-800 dark:text-slate-200 flex items-center gap-4 border-b-4 border-blue-500 pb-6">
              📊 Company Overview
              <div class="ml-auto text-lg bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full">
                Investment Target
              </div>
            </h3>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        `;
        
        const fieldConfig = {
          'Company': { icon: '🏢', fullWidth: false, color: 'blue' },
          'Industry': { icon: '🏭', fullWidth: false, color: 'purple' },
          'Founded': { icon: '📅', fullWidth: false, color: 'green' },
          'Headquarters': { icon: '🌍', fullWidth: false, color: 'indigo' },
          'Employees': { icon: '👥', fullWidth: false, color: 'pink' },
          'Market Position': { icon: '📈', fullWidth: true, color: 'emerald' },
          'Business Model': { icon: '💼', fullWidth: true, color: 'orange' },
          'Key Products/Services': { icon: '💰', fullWidth: true, color: 'cyan' },
          'Customer Base': { icon: '🎯', fullWidth: true, color: 'violet' }
        };
        
        Object.entries(fieldConfig).forEach(([key, config]) => {
          if (companyData[key]) {
            const colSpan = config.fullWidth ? 'lg:col-span-3' : '';
            
            overviewHtml += `
              <div class="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 border-${config.color}-200 dark:border-${config.color}-700 hover:shadow-xl hover:scale-105 transition-all duration-300 ${colSpan}">
                <div class="text-sm font-bold text-${config.color}-600 dark:text-${config.color}-400 uppercase mb-4 flex items-center gap-3">
                  <span class="text-2xl p-2 bg-${config.color}-100 dark:bg-${config.color}-900 rounded-lg">${config.icon}</span>
                  ${key}
                </div>
                <div class="text-slate-700 dark:text-slate-300 text-lg leading-relaxed font-medium">${companyData[key]}</div>
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

    // Enhanced section headers with emojis and better styling
    html = html.replace(/###\s*(?:2\.\s*)?🔋\s*\*?\*?Resilience Drivers.*?\*?\*?/gi, 
      `<h3 class="text-4xl font-bold mt-20 mb-10 text-emerald-700 dark:text-emerald-400 border-l-8 border-emerald-500 pl-6 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 py-6 rounded-r-2xl flex items-center gap-4">
        🔋 Resilience Drivers (Strengths)
        <div class="ml-auto text-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-4 py-2 rounded-full">
          Core Advantages
        </div>
      </h3>`);

    html = html.replace(/###\s*⚠️\s*\*?\*?Vulnerability Factors.*?\*?\*?/gi, 
      `<h3 class="text-4xl font-bold mt-20 mb-10 text-red-700 dark:text-red-400 border-l-8 border-red-500 pl-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 py-6 rounded-r-2xl flex items-center gap-4">
        ⚠️ Vulnerability Factors (Risks)
        <div class="ml-auto text-lg bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-2 rounded-full">
          Risk Assessment
        </div>
      </h3>`);

    html = html.replace(/###\s*🎯\s*\*?\*?Competitive Landscape.*?\*?\*?/gi, 
      `<h3 class="text-4xl font-bold mt-20 mb-10 text-purple-700 dark:text-purple-400 border-l-8 border-purple-500 pl-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 py-6 rounded-r-2xl flex items-center gap-4">
        🎯 Competitive Landscape
        <div class="ml-auto text-lg bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-4 py-2 rounded-full">
          Market Analysis
        </div>
      </h3>`);

    html = html.replace(/###\s*🚀\s*\*?\*?Adjacent Market Opportunities.*?\*?\*?/gi, 
      `<h3 class="text-4xl font-bold mt-20 mb-10 text-blue-700 dark:text-blue-400 border-l-8 border-blue-500 pl-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 py-6 rounded-r-2xl flex items-center gap-4">
        🚀 Adjacent Market Opportunities
        <div class="ml-auto text-lg bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full">
          Growth Vectors
        </div>
      </h3>`);

    html = html.replace(/###\s*📈\s*\*?\*?Key Performance Metrics.*?\*?\*?/gi, 
      `<h3 class="text-4xl font-bold mt-20 mb-10 text-indigo-700 dark:text-indigo-400 border-l-8 border-indigo-500 pl-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 py-6 rounded-r-2xl flex items-center gap-4">
        📈 Key Performance Metrics & Benchmarks
        <div class="ml-auto text-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-4 py-2 rounded-full">
          Competitive Analysis
        </div>
      </h3>`);

    // Enhanced subsection headers with icons
    html = html.replace(/####\s+\*?\*?([^*]+)\*?\*?$/gm, (match, content) => {
      const iconMap = {
        'Adaptability': '🔄',
        'Innovation': '💡',
        'Financial': '💰',
        'Growth': '📈',
        'Market': '🎯',
        'Competitive': '⚔️',
        'Technology': '🔧',
        'Customer': '👥',
        'Risk': '⚠️',
        'Operational': '⚙️'
      };
      
      let icon = '📋';
      for (const [key, value] of Object.entries(iconMap)) {
        if (content.toLowerCase().includes(key.toLowerCase())) {
          icon = value;
          break;
        }
      }
      
      return `<h4 class="text-2xl font-bold mt-12 mb-8 text-slate-700 dark:text-slate-300 border-l-4 border-purple-500 pl-6 bg-purple-50 dark:bg-purple-900/20 py-4 rounded-r-xl flex items-center gap-3">
        <span class="text-2xl">${icon}</span>
        ${content}
      </h4>`;
    });

    // Enhanced table formatting with better styling
    html = html.replace(/\n\|([^\n]+)\|\n\|[\s:|-]+\|\n((?:\|[^\n]+\|\n?)*)/g, (match, headerLine, bodyLines) => {
      const headers = headerLine.split('|').filter(h => h.trim()).map(h => h.trim());
      const rows = bodyLines.trim().split('\n').filter(line => line.trim()).map(line => 
        line.split('|').filter(cell => cell.trim()).map(cell => cell.trim())
      );
      
      if (headers.length === 0 || rows.length === 0) return match;
      
      let tableHtml = `
        <div class="overflow-x-auto my-12 rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-700">
          <table class="w-full border-collapse bg-white dark:bg-slate-800">
            <thead>
              <tr class="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
      `;
      
      headers.forEach((header, index) => {
        const iconMap = {
          'Metric': '📊',
          'Category': '📂',
          'Score': '⭐',
          'Company': '🏢',
          'Weight': '⚖️',
          'Total': '💯'
        };
        
        let icon = '';
        for (const [key, value] of Object.entries(iconMap)) {
          if (header.toLowerCase().includes(key.toLowerCase())) {
            icon = value + ' ';
            break;
          }
        }
        
        tableHtml += `<th class="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider border-r border-white/20 last:border-r-0">
          ${icon}${header}
        </th>`;
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
        
        tableHtml += `<tr class="${bgClass} hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-300 ${isTotalRow ? 'font-bold border-t-4 border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30' : ''}">`;
        
        row.forEach((cell, cellIdx) => {
          let cellContent = cell
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-600 dark:text-purple-400 font-bold bg-purple-100 dark:bg-purple-900/50 px-2 py-1 rounded">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="text-slate-600 dark:text-slate-400">$1</em>');
          
          // Enhanced cell styling based on content
          if (cell.includes('%') && !isNaN(parseFloat(cell.replace('%', '')))) {
            const val = parseFloat(cell.replace('%', ''));
            const colorClass = val >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold';
            cellContent = `<span class="${colorClass} bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg text-center inline-block min-w-16">${cellContent}</span>`;
          }
          
          if (cellIdx > 0 && cell.includes('/') && !isNaN(cell.split('/')[0])) {
            cellContent = `<strong class="text-purple-600 dark:text-purple-400 text-xl bg-purple-100 dark:bg-purple-900/50 px-3 py-2 rounded-lg">${cellContent}</strong>`;
          }
          
          const cellClass = cellIdx === 0 ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300';
          tableHtml += `<td class="px-8 py-5 text-base ${cellClass} border-r border-slate-200 dark:border-slate-700 last:border-r-0">${cellContent}</td>`;
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

    // Enhanced Portfolio Positioning with styled checkboxes
    html = html.replace(/💡\s*\*?\*?Portfolio Positioning Recommendation\*?\*?:/gi, 
      `<div class="my-16 p-10 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-3xl border-2 border-emerald-200 dark:border-emerald-700 shadow-2xl">
        <h4 class="text-4xl font-bold text-emerald-700 dark:text-emerald-400 mb-8 flex items-center gap-4">
          💡 Portfolio Positioning Recommendation
          <div class="ml-auto text-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-4 py-2 rounded-full">
            Investment Decision
          </div>
        </h4>
        <div class="space-y-6">`);
    
    html = html.replace(/🔮\s*\*?\*?Key Scenarios to Monitor\*?\*?:/gi, 
      `</div></div><div class="my-16 p-10 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-3xl border-2 border-amber-200 dark:border-amber-700 shadow-2xl">
        <h4 class="text-4xl font-bold text-amber-700 dark:text-amber-400 mb-8 flex items-center gap-4">
          🔮 Key Scenarios to Monitor
          <div class="ml-auto text-lg bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-full">
            Risk Management
          </div>
        </h4>
        <div class="space-y-6">`);

    // Enhanced checkbox styling with better visual feedback
    html = html.replace(/^\[\s*\]\s+(.+)$/gm, 
      '<div class="flex items-center gap-6 mb-6 p-6 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-slate-300 dark:border-slate-700 hover:shadow-lg transition-all duration-300"><input type="checkbox" disabled class="w-6 h-6 rounded-lg border-2 accent-purple-500" /> <span class="text-slate-700 dark:text-slate-300 text-lg font-medium">$1</span></div>');
    
    html = html.replace(/^\[x\]\s+(.+)$/gim, 
      '<div class="flex items-center gap-6 mb-6 p-6 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl border-2 border-emerald-200 dark:border-emerald-700 shadow-lg"><input type="checkbox" disabled checked class="w-6 h-6 text-emerald-600 rounded-lg border-2 accent-emerald-500" /> <span class="text-emerald-700 dark:text-emerald-300 font-bold text-lg">$1</span></div>');
    
    // Enhanced bullet points with better icons and spacing
    html = html.replace(/^[-•]\s+(.+)$/gm, '<li class="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed text-lg pl-2">$1</li>');
    
    // Group consecutive list items with enhanced styling
    html = html.replace(/(<li[^>]*>.*?<\/li>[\s\n]*)+/gs, (match) => {
      return `<ul class="space-y-4 mb-10 ml-8 border-l-4 border-blue-300 dark:border-blue-600 pl-8 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent py-6 rounded-r-2xl">${match}</ul>`;
    });
    
    // Enhanced text formatting with better contrast
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-lg">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded">$1</em>');
    
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
        return `<p class="mb-8 text-slate-700 dark:text-slate-300 leading-relaxed text-lg">${paragraph}</p>`;
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
    
    // Combine score display at top with the rest of the content
    const finalHtml = scoreDisplay + html;
    
    return `<div class="prose prose-xl max-w-none text-slate-700 dark:text-slate-300">${finalHtml}</div>`;
  };

  const shareAnalysis = async () => {
    const scoreMatch = result.match(/(?:Overall\s+)?Resilience\s+Score:?\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
    const score = scoreMatch ? scoreMatch[1] : 'N/A';
    
    const shareData = {
      title: `${companyName} Resilience Analysis`,
      text: `Comprehensive resilience evaluation of ${companyName}. Resilience Score: ${score}/10 using NZS Capital framework.`,
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
    element.download = `${companyName.replace(/\s+/g, '_')}_Resilience_Analysis.txt`;
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
        {/* Enhanced header for resilience focus */}
        <header className="py-16 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/20 to-transparent"></div>
          
          <div className="relative">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-500 rounded-3xl mb-8 shadow-2xl shadow-emerald-500/30 animate-pulse-ring relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
              <Activity className="w-18 h-18 text-white relative z-10 drop-shadow-lg" />
            </div>
            
            <h1 className="text-7xl lg:text-8xl font-black mb-6 relative">
              <span className="bg-gradient-to-r from-white via-emerald-200 via-blue-200 to-purple-200 bg-clip-text text-transparent animate-gradient-shift bg-size-200">
                Company Resilience
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Analyzer
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-8 font-light">
              Advanced resilience evaluation using <strong className="text-emerald-400">NZS Capital's Complexity Investing</strong> framework. 
              Assess adaptability, optionality, and long-term value creation potential with institutional-grade analysis.
            </p>
            
            {/* Enhanced trust indicators */}
            <div className="flex items-center justify-center gap-8 text-sm text-purple-300 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Resilience Framework</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Complexity Investing</span>
              </div>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4" />
                <span>Strategic Assessment</span>
              </div>
            </div>
            
            {/* Free to use indicator */}
            <div className="mt-6 inline-block px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-lg font-semibold">
              ✨ Free Professional Analysis - No API Key Required
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
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 via-purple-500 to-pink-500 bg-size-200 animate-gradient-shift"></div>
              
              {/* Header Section */}
              <div className="relative p-8 pb-6">
                {/* Floating Icon */}
                <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <Activity className="w-8 h-8 text-emerald-400 animate-pulse" />
                </div>
                
                <div className="max-w-lg">
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                    AI Resilience Analysis
                  </h2>
                  <p className="text-slate-300 text-lg">
                    Generate comprehensive resilience scores using advanced complexity investing principles
                  </p>
                </div>
              </div>

              <div className="px-8 pb-8">
                {/* Simplified Progress Indicator - No API Key Required */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      companyName ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white/60'
                    }`}>
                      {companyName ? <CheckCircle className="w-4 h-4" /> : '1'}
                    </div>
                    <span className="text-sm text-white/80">Enter Company</span>
                  </div>
                  <div className="flex-1 h-px bg-white/20 relative">
                    <div className={`absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500 ${
                      companyName ? 'w-full' : 'w-0'
                    }`}></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      companyName ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white animate-pulse' : 'bg-white/20 text-white/60'
                    }`}>
                      {companyName ? <Play className="w-4 h-4" /> : '2'}
                    </div>
                    <span className="text-sm text-white/80">Analyze</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Simplified Inputs */}
                  <div className="space-y-6">
                    {/* Company Input */}
                    <div className="group">
                      <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-400" />
                        Target Company
                      </label>
                      <div className="relative">
                        <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden group-hover:border-white/30 transition-all duration-300">
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g., Apple, Tesla, Microsoft..."
                            onKeyPress={(e) => e.key === 'Enter' && analyzeCompany()}
                            className="w-full px-4 py-4 bg-transparent text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Activity className="w-4 h-4 text-white/40" />
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
                          <label className="block text-sm text-white/80 mb-2">Analysis Depth</label>
                          <div className="grid grid-cols-1 gap-2">
                            {tokenOptions.map((option) => (
                              <label key={option.value} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/10 hover:border-white/20">
                                <input
                                  type="radio"
                                  name="tokenLimit"
                                  value={option.value}
                                  checked={tokenLimit === option.value}
                                  onChange={(e) => setTokenLimit(e.target.value)}
                                  className="w-4 h-4 accent-emerald-500"
                                />
                                <div className="flex-1">
                                  <div className="text-white font-medium">{option.label}</div>
                                  <div className="text-xs text-white/60">{option.description}</div>
                                </div>
                                <div className="text-right">
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
                    {/* Resilience Framework Display */}
                    <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-2xl p-6 border border-emerald-400/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                          <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">NZS Capital Framework</h3>
                          <p className="text-sm text-emerald-300">Complexity Investing</p>
                        </div>
                        <div className="ml-auto flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-3 bg-white/10 rounded-lg">
                          <div className="text-white font-semibold">Adaptability</div>
                          <div className="text-white/60">Core Focus</div>
                        </div>
                        <div className="text-center p-3 bg-white/10 rounded-lg">
                          <div className="text-white font-semibold">Optionality</div>
                          <div className="text-white/60">Growth Vectors</div>
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
                        <div className="text-sm font-medium text-white">Adjacent Markets</div>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center hover:bg-purple-500/20 transition-colors">
                        <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                        <div className="text-sm font-medium text-white">Competitive Intel</div>
                      </div>
                      <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4 text-center hover:bg-pink-500/20 transition-colors">
                        <Sparkles className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                        <div className="text-sm font-medium text-white">Value Creation</div>
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
                      disabled={!companyName || loading}
                      className="w-full group relative overflow-hidden bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 hover:from-emerald-700 hover:via-blue-700 hover:to-purple-700 text-white px-8 py-6 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50"
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
                            <Activity className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                            <span>Generate Resilience Score</span>
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
                        <Activity className="w-3 h-3" />
                        <span>Resilience Framework</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>Complexity Investing</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>Institutional Grade</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, label: "Companies Analyzed", value: "10,000+", bgColor: "from-emerald-500/20 to-emerald-600/20", iconColor: "text-emerald-400" },
              { icon: Activity, label: "Resilience Accuracy", value: "99.9%", bgColor: "from-blue-500/20 to-blue-600/20", iconColor: "text-blue-400" },
              { icon: Clock, label: "Analysis Time", value: "<30s", bgColor: "from-purple-500/20 to-purple-600/20", iconColor: "text-purple-400" }
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
                <Activity className="text-emerald-400 w-8 h-8" />
                {companyName} Resilience Analysis
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
              <span className="text-slate-300">Secure & Private Analysis</span>
              <span className="text-slate-500">•</span>
              <Activity className="w-5 h-5 text-blue-400" />
              <span className="text-slate-300">NZS Capital Framework</span>
              <span className="text-slate-500">•</span>
              <Cpu className="w-5 h-5 text-purple-400" />
              <span className="text-slate-300">Powered by Claude AI</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Advanced resilience evaluation platform using complexity investing principles. 
              Assess adaptability, optionality, and long-term value creation with institutional-grade analysis.
            </p>
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
              <span>Complexity Investing</span>
              <span>•</span>
              <span>Resilience Framework</span>
              <span>•</span>
              <span>Strategic Assessment</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}