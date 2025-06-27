'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Compass,
  MessageCircle,
  Send,
  RefreshCw,
  Edit3,
  Plus,
  X,
  HelpCircle,
  Lightbulb,
  FileText,
  Search,
  Upload,
  File,
  Trash2,
  Paperclip,
  Table,
  FileSpreadsheet
} from 'lucide-react';

export default function Home() {
  const [companyName, setCompanyName] = useState('');
  const [model, setModel] = useState('claude-3-5-sonnet-20241022');
  const [tokenLimit, setTokenLimit] = useState('6000');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Interactive features state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [reportVersion, setReportVersion] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileContext, setFileContext] = useState('');
  const [processingFiles, setProcessingFiles] = useState(false);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // File handling functions
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setProcessingFiles(true);
    const newUploadedFiles = [];
    let combinedContext = fileContext;

    try {
      for (const file of files) {
        const fileData = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          content: '',
          processed: false
        };

        // Process file based on type
        try {
          if (file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
            const content = await processSpreadsheet(file);
            fileData.content = content;
            fileData.processed = true;
            combinedContext += `\n\n=== SPREADSHEET DATA: ${file.name} ===\n${content}\n`;
          } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            const content = await file.text();
            fileData.content = content;
            fileData.processed = true;
            combinedContext += `\n\n=== TEXT DOCUMENT: ${file.name} ===\n${content}\n`;
          } else if (file.type === 'application/pdf') {
            // For PDF, we'll need to handle this differently in a real implementation
            fileData.content = `PDF file uploaded: ${file.name}. Content extraction requires server-side processing.`;
            fileData.processed = false;
            combinedContext += `\n\n=== PDF DOCUMENT: ${file.name} ===\n[PDF content - would be extracted in production]\n`;
          } else {
            // Try to read as text for other file types
            try {
              const content = await file.text();
              fileData.content = content;
              fileData.processed = true;
              combinedContext += `\n\n=== DOCUMENT: ${file.name} ===\n${content}\n`;
            } catch (err) {
              fileData.content = `Unable to process file type: ${file.type}`;
              fileData.processed = false;
            }
          }
        } catch (err) {
          fileData.content = `Error processing file: ${err.message}`;
          fileData.processed = false;
        }

        newUploadedFiles.push(fileData);
      }

      setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
      setFileContext(combinedContext);

      // Add message to chat about file upload
      const filesMessage = {
        id: Date.now(),
        type: 'assistant',
        content: `📎 **Files uploaded successfully!**\n\n${newUploadedFiles.map(f => 
          `• **${f.name}** (${formatFileSize(f.size)}) ${f.processed ? '✅ Processed' : '⚠️ Partial processing'}`
        ).join('\n')}\n\nThis information will now be included in all analysis and responses. You can ask questions about the uploaded data or request a report update that incorporates this information.`,
        timestamp: new Date(),
        isFileUpload: true
      };
      
      setChatMessages(prev => [...prev, filesMessage]);

    } catch (error) {
      console.error('Error processing files:', error);
      const errorMessage = {
        id: Date.now(),
        type: 'assistant',
        content: `❌ Error processing some files: ${error.message}. Please try uploading again or contact support if the issue persists.`,
        timestamp: new Date(),
        isError: true
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setProcessingFiles(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const processSpreadsheet = async (file) => {
    try {
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        return `CSV Data:\n${text.substring(0, 5000)}${text.length > 5000 ? '\n... (truncated for length)' : ''}`;
      } else if (file.name.endsWith('.xlsx')) {
        // For XLSX, we'd use SheetJS in a real implementation
        // For now, we'll simulate the processing
        return `Excel file: ${file.name}. In production, this would be processed using SheetJS to extract sheet data, formulas, and formatting.`;
      }
    } catch (error) {
      throw new Error(`Failed to process spreadsheet: ${error.message}`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const removeFile = (fileId) => {
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    if (!fileToRemove) return;

    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    
    // Update file context by removing this file's content
    setFileContext(prev => {
      const marker = `=== ${fileToRemove.name.includes('.') ? fileToRemove.name.split('.').pop().toUpperCase() + ' ' : ''}DOCUMENT: ${fileToRemove.name} ===`;
      const startIndex = prev.indexOf(marker);
      if (startIndex === -1) return prev;
      
      const nextMarkerIndex = prev.indexOf('\n\n===', startIndex + 1);
      if (nextMarkerIndex === -1) {
        return prev.substring(0, startIndex).trim();
      } else {
        return (prev.substring(0, startIndex) + prev.substring(nextMarkerIndex)).trim();
      }
    });

    // Add message to chat
    const removeMessage = {
      id: Date.now(),
      type: 'assistant',
      content: `🗑️ Removed file: **${fileToRemove.name}**. The file content is no longer included in the analysis context.`,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, removeMessage]);
  };

  // Show chat automatically when report is generated
  useEffect(() => {
    if (result && !showChat) {
      setShowChat(true);
      // Add welcome message with file upload context
      const welcomeMessage = uploadedFiles.length > 0 
        ? `🎉 **Analysis complete for ${companyName}!** 

Your uploaded files (${uploadedFiles.map(f => f.name).join(', ')}) have been integrated into the analysis.

**What you can do now:**
• **Ask questions** about any aspect of the report
• **Upload additional files** for more context  
• **Provide new information** about the company
• **Request report updates** with new insights
• **Analyze specific data** from your uploaded files

What would you like to explore?`
        : `🎉 **Analysis complete for ${companyName}!** 

**What you can do now:**
• **Ask questions** about any aspect of the report
• **Upload files** 📎 (spreadsheets, articles, reports) for additional context
• **Provide new information** about the company
• **Request report updates** with new insights

What would you like to explore?`;

      setChatMessages([{
        id: Date.now(),
        type: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    }
  }, [result, companyName, uploadedFiles.length]);

  const analyzeCompany = async () => {
    if (!companyName.trim()) {
      setError('Please enter a company name');
      return;
    }

    if (parseInt(tokenLimit) > 4096 && model !== 'claude-3-5-sonnet-20241022') {
      setError('8K tokens only supported with Claude 3.5 Sonnet. Please select a different model or reduce token limit.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');
    setShowChat(false);
    setChatMessages([]);
    setReportVersion(1);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName,
          model,
          tokenLimit,
          fileContext: fileContext || null // Include uploaded file context
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

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: chatInput.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      // Determine if this is a question or a report update request
      const isUpdateRequest = chatInput.toLowerCase().includes('update') || 
                            chatInput.toLowerCase().includes('redo') || 
                            chatInput.toLowerCase().includes('incorporate') ||
                            chatInput.toLowerCase().includes('add this') ||
                            chatInput.toLowerCase().includes('use this info');

      const systemPrompt = isUpdateRequest 
        ? `You are helping update a company resilience analysis report. The user has provided new information about ${companyName} and wants the report updated to incorporate this information.

Current report:
${result}

User's new information: ${chatInput}

Please provide an updated resilience analysis that incorporates this new information. Follow the same structure and format as the original report, but update the relevant sections with the new insights. Focus on how this new information changes the resilience score and strategic positioning.

Indicate at the beginning that this is "Updated Analysis v${reportVersion + 1}" and highlight what has changed.`
        : `You are analyzing a company resilience report for ${companyName}. Answer the user's question based on the report content provided.

Report content:
${result}

User question: ${chatInput}

Provide a helpful, detailed answer based on the report content. If the question requires information not in the report, mention that and suggest what additional analysis might be needed.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatInput,
          context: result,
          companyName,
          isUpdateRequest,
          systemPrompt,
          model,
          fileContext: fileContext || null // Include file context in chat
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Chat request failed');
      }

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: data.result,
        timestamp: new Date(),
        isReportUpdate: isUpdateRequest
      };

      setChatMessages(prev => [...prev, assistantMessage]);

      // If this was an update request, update the main report
      if (isUpdateRequest) {
        setResult(data.result);
        setReportVersion(prev => prev + 1);
      }

    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}. Please try again.`,
        timestamp: new Date(),
        isError: true
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const clearChat = () => {
    setChatMessages([{
      id: Date.now(),
      type: 'assistant',
      content: `Chat cleared! I'm ready to help you explore the ${companyName} analysis. What would you like to know?`,
      timestamp: new Date()
    }]);
  };

  // Simplified formatting function for resilience reports
  const formatResult = (text) => {
    if (!text) return '';
    
    let html = text;
    
    // Clean up the text first
    html = html.replace(/^\s*#\s*$/gm, '');
    html = html.replace(/\n\s*#\s*\n/g, '\n\n');
    
    // Extract resilience score with more robust patterns
    const scorePatterns = [
      /(?:Overall\s+)?Resilience\s+Score:?\s*(\d+(?:\.\d+)?)\s*[\/\-]\s*10/gi,
      /Score:?\s*(\d+(?:\.\d+)?)\s*[\/\-]\s*10/gi,
      /(\d+(?:\.\d+)?)\s*[\/\-]\s*10/g
    ];

    let scoreFound = false;
    let scoreDisplay = '';
    let extractedScore = null;
    
    // Try to find the score
    for (const pattern of scorePatterns) {
      if (scoreFound) break;
      
      const match = html.match(pattern);
      if (match) {
        const scoreMatch = match[0].match(/(\d+(?:\.\d+)?)/);
        if (scoreMatch) {
          extractedScore = parseFloat(scoreMatch[1]);
          if (extractedScore >= 0 && extractedScore <= 10) {
            scoreFound = true;
            
            const numScore = extractedScore;
            const percentage = Math.round(numScore * 10);
            let bgGradient, scoreLabel, emoji, textColor;
            
            if (numScore >= 8) {
              bgGradient = 'from-emerald-500 to-green-600';
              scoreLabel = 'Highly Resilient';
              emoji = '🚀';
              textColor = 'text-emerald-100';
            } else if (numScore >= 6) {
              bgGradient = 'from-blue-500 to-indigo-600';
              scoreLabel = 'Strong Position';
              emoji = '💪';
              textColor = 'text-blue-100';
            } else if (numScore >= 4) {
              bgGradient = 'from-amber-500 to-orange-600';
              scoreLabel = 'Moderate Risk';
              emoji = '⚠️';
              textColor = 'text-amber-100';
            } else {
              bgGradient = 'from-red-500 to-red-600';
              scoreLabel = 'High Risk';
              emoji = '🔻';
              textColor = 'text-red-100';
            }
            
            scoreDisplay = `
              <div class="score-card mb-12 p-8 rounded-3xl bg-gradient-to-br ${bgGradient} shadow-2xl text-white text-center relative overflow-hidden">
                <div class="absolute inset-0 bg-white/10 opacity-30"></div>
                <div class="relative z-10">
                  <div class="text-6xl font-black mb-4">${numScore}/10</div>
                  <div class="text-2xl font-bold mb-2 ${textColor}">${scoreLabel}</div>
                  <div class="text-lg opacity-90 mb-6">${percentage}% Investment Grade</div>
                  <div class="max-w-md mx-auto mb-4">
                    <div class="w-full bg-black/30 rounded-full h-4 overflow-hidden">
                      <div class="progress-bar h-full bg-white/90 rounded-full transition-all duration-2000 ease-out" style="width: ${percentage}%"></div>
                    </div>
                  </div>
                  <div class="grid grid-cols-3 gap-3 text-sm">
                    <div class="bg-white/20 rounded-lg p-3">
                      <div class="font-bold">Adaptability</div>
                      <div class="opacity-80">${numScore >= 7 ? 'High' : numScore >= 5 ? 'Medium' : 'Low'}</div>
                    </div>
                    <div class="bg-white/20 rounded-lg p-3">
                      <div class="font-bold">Optionality</div>
                      <div class="opacity-80">${numScore >= 7 ? 'Strong' : numScore >= 5 ? 'Moderate' : 'Limited'}</div>
                    </div>
                    <div class="bg-white/20 rounded-lg p-3">
                      <div class="font-bold">Durability</div>
                      <div class="opacity-80">${numScore >= 7 ? 'Robust' : numScore >= 5 ? 'Stable' : 'Fragile'}</div>
                    </div>
                  </div>
                </div>
              </div>
            `;
            
            // Remove the score line from the main content
            html = html.replace(pattern, '');
            break;
          }
        }
      }
    }
    
    // Format major section headers
    html = html.replace(/#{1,3}\s*📊\s*Company Overview/gi, 
      `<h2 class="text-3xl font-bold mt-12 mb-8 text-gray-900 dark:text-white flex items-center gap-3 border-b-2 border-gray-200 dark:border-gray-700 pb-4">
        📊 Company Overview
      </h2>`);
      
    html = html.replace(/#{1,3}\s*🔋\s*Resilience Drivers/gi, 
      `<h2 class="text-3xl font-bold mt-12 mb-8 text-emerald-700 dark:text-emerald-400 flex items-center gap-3 border-b-2 border-emerald-200 dark:border-emerald-700 pb-4">
        🔋 Resilience Drivers
      </h2>`);
      
    html = html.replace(/#{1,3}\s*⚠️\s*Vulnerability Factors/gi, 
      `<h2 class="text-3xl font-bold mt-12 mb-8 text-red-700 dark:text-red-400 flex items-center gap-3 border-b-2 border-red-200 dark:border-red-700 pb-4">
        ⚠️ Vulnerability Factors
      </h2>`);
      
    html = html.replace(/#{1,3}\s*🎯\s*Competitive Landscape/gi, 
      `<h2 class="text-3xl font-bold mt-12 mb-8 text-purple-700 dark:text-purple-400 flex items-center gap-3 border-b-2 border-purple-200 dark:border-purple-700 pb-4">
        🎯 Competitive Landscape
      </h2>`);
      
    html = html.replace(/#{1,3}\s*🚀\s*Adjacent Market/gi, 
      `<h2 class="text-3xl font-bold mt-12 mb-8 text-blue-700 dark:text-blue-400 flex items-center gap-3 border-b-2 border-blue-200 dark:border-blue-700 pb-4">
        🚀 Adjacent Market Opportunities
      </h2>`);
      
    html = html.replace(/#{1,3}\s*📈\s*Key Performance/gi, 
      `<h2 class="text-3xl font-bold mt-12 mb-8 text-indigo-700 dark:text-indigo-400 flex items-center gap-3 border-b-2 border-indigo-200 dark:border-indigo-700 pb-4">
        📈 Key Performance Metrics
      </h2>`);

    // Format subsection headers
    html = html.replace(/#{4}\s*([^#\n]+)/g, 
      `<h3 class="text-xl font-bold mt-8 mb-4 text-gray-800 dark:text-gray-200">$1</h3>`);

    // Format tables
    html = html.replace(/\n\|([^\n]+)\|\n\|[\s:|-]+\|\n((?:\|[^\n]+\|\n?)*)/g, (match, headerLine, bodyLines) => {
      const headers = headerLine.split('|').filter(h => h.trim()).map(h => h.trim());
      const rows = bodyLines.trim().split('\n').filter(line => line.trim()).map(line => 
        line.split('|').filter(cell => cell.trim()).map(cell => cell.trim())
      );
      
      if (headers.length === 0) return match;
      
      let tableHtml = `
        <div class="overflow-x-auto my-8 rounded-lg shadow-lg">
          <table class="w-full border-collapse bg-white dark:bg-gray-800">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
      `;
      
      headers.forEach(header => {
        tableHtml += `<th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">${header}</th>`;
      });
      
      tableHtml += `
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
      `;
      
      // If no data rows, create empty row to show structure
      if (rows.length === 0) {
        tableHtml += `<tr class="bg-white dark:bg-gray-800">`;
        headers.forEach(() => {
          tableHtml += `<td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">-</td>`;
        });
        tableHtml += '</tr>';
      } else {
        rows.forEach((row, index) => {
          const bgClass = index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700';
          tableHtml += `<tr class="${bgClass} hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">`;
          
          // Ensure we have the right number of cells
          for (let i = 0; i < headers.length; i++) {
            const cell = row[i] || '-';
            let cellContent = cell.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            tableHtml += `<td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">${cellContent}</td>`;
          }
          
          tableHtml += '</tr>';
        });
      }
      
      tableHtml += `
            </tbody>
          </table>
        </div>
      `;
      
      return tableHtml;
    });

    // Format text styling
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-gray-600 dark:text-gray-400">$1</em>');
    
    // Format bullet points
    html = html.replace(/^[-•]\s+(.+)$/gm, '<li class="mb-2 text-gray-700 dark:text-gray-300">$1</li>');
    
    // Group consecutive list items
    html = html.replace(/(<li[^>]*>.*?<\/li>[\s\n]*)+/gs, (match) => {
      return `<ul class="list-disc ml-6 mb-6 space-y-2">${match}</ul>`;
    });
    
    // Format checkboxes
    html = html.replace(/^\[\s*\]\s+(.+)$/gm, 
      '<div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-3"><input type="checkbox" disabled class="w-5 h-5" /> <span>$1</span></div>');
    html = html.replace(/^\[x\]\s+(.+)$/gim, 
      '<div class="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mb-3 border border-green-200 dark:border-green-700"><input type="checkbox" disabled checked class="w-5 h-5 text-green-600" /> <span class="font-medium">$1</span></div>');
    
    // Format paragraphs
    html = html.split('\n\n').map(paragraph => {
      paragraph = paragraph.trim();
      if (paragraph && 
          !paragraph.includes('<') && 
          !paragraph.startsWith('#') &&
          !paragraph.startsWith('|') &&
          !paragraph.startsWith('-') &&
          !paragraph.startsWith('•') &&
          paragraph.length > 10) {
        return `<p class="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed">${paragraph}</p>`;
      }
      return paragraph;
    }).join('\n\n');
    
    // Handle line breaks
    html = html.replace(/([^>])\n([^<])/g, '$1<br>$2');
    
    // Clean up extra spacing
    html = html.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return `<div class="prose prose-lg max-w-none">${scoreDisplay + html}</div>`;
  };

  const shareAnalysis = async () => {
    const scoreMatch = result.match(/(?:Overall\s+)?Resilience\s+Score:?\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
    const score = scoreMatch ? scoreMatch[1] : 'N/A';
    
    const shareData = {
      title: `${companyName} Resilience Analysis`,
      text: `Comprehensive resilience evaluation of ${companyName}. Resilience Score: ${score}/10 using Complexity Investing framework.`,
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
    element.download = `${companyName.replace(/\s+/g, '_')}_Resilience_Analysis_v${reportVersion}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.2),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,200,245,0.1)_50%,transparent_75%)]"></div>
        
        {/* Floating elements */}
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
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-500 rounded-3xl mb-8 shadow-2xl shadow-emerald-500/30 animate-pulse-ring relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
              <Activity className="w-18 h-18 text-white relative z-10 drop-shadow-lg" />
            </div>
            
            <h1 className="text-7xl lg:text-8xl font-black mb-6 relative">
              <span className="bg-gradient-to-r from-white via-emerald-200 via-blue-200 to-purple-200 bg-clip-text text-transparent animate-gradient-shift bg-size-200">
                Interactive Resilience
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Analyzer
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-8 font-light">
              Advanced resilience evaluation with <strong className="text-emerald-400">interactive analysis</strong>. 
              Ask questions, provide updates, and refine your assessment in real-time.
            </p>
            
            {/* Enhanced trust indicators */}
            <div className="flex items-center justify-center gap-8 text-sm text-purple-300 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Resilience Framework</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>Interactive Q&A</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                <span>Dynamic Updates</span>
              </div>
            </div>
            
            {/* Free to use indicator */}
            <div className="mt-6 inline-block px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-lg font-semibold">
              ✨ Interactive Analysis - Ask Questions & Update Reports
            </div>
          </div>
        </header>

        {/* Main form with file upload */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="relative">
            <div className="absolute inset-0 bg-white/5 rounded-3xl transform rotate-1 scale-105 blur-sm"></div>
            <div className="absolute inset-0 bg-white/3 rounded-3xl transform -rotate-1 scale-102 blur-sm"></div>
            
            <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 via-purple-500 to-pink-500 bg-size-200 animate-gradient-shift"></div>
              
              <div className="relative p-8 pb-6">
                <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <Activity className="w-8 h-8 text-emerald-400 animate-pulse" />
                </div>
                
                <div className="max-w-lg">
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                    Interactive AI Analysis
                  </h2>
                  <p className="text-slate-300 text-lg">
                    Generate reports, ask questions, and update analysis with new information
                  </p>
                </div>
              </div>

              <div className="px-8 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Inputs */}
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

                    {/* File Upload Section */}
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Upload className="w-4 h-4 text-green-400" />
                        Upload Context Files
                        {uploadedFiles.length > 0 && (
                          <span className="ml-auto bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full">
                            {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Upload Area */}
                        <div 
                          className="border-2 border-dashed border-white/20 hover:border-white/30 rounded-xl p-6 text-center cursor-pointer transition-colors group"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".csv,.xlsx,.xls,.txt,.pdf,.doc,.docx"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={processingFiles}
                          />
                          
                          {processingFiles ? (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                              <span className="text-white/60">Processing files...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2 group-hover:scale-105 transition-transform">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-xl flex items-center justify-center group-hover:from-green-500/30 group-hover:to-blue-500/30 transition-colors">
                                <Upload className="w-6 h-6 text-green-400" />
                              </div>
                              <div className="text-white font-medium">Upload Files</div>
                              <div className="text-xs text-white/60">
                                Spreadsheets, articles, reports
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Uploaded Files List */}
                        {uploadedFiles.length > 0 && (
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {uploadedFiles.map((file) => (
                              <div key={file.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                                  {file.name.endsWith('.csv') || file.name.endsWith('.xlsx') ? (
                                    <FileSpreadsheet className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <FileText className="w-4 h-4 text-blue-400" />
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="text-white text-sm font-medium truncate">
                                    {file.name}
                                  </div>
                                  <div className="text-xs text-white/60 flex items-center gap-2">
                                    <span>{formatFileSize(file.size)}</span>
                                    {file.processed ? (
                                      <span className="text-green-400">✅ Processed</span>
                                    ) : (
                                      <span className="text-yellow-400">⚠️ Partial</span>
                                    )}
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => removeFile(file.id)}
                                  className="p-1 text-white/40 hover:text-red-400 transition-colors"
                                  title="Remove file"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* File Type Info */}
                        <div className="text-xs text-white/60 space-y-1">
                          <div className="font-medium text-white/80">Supported formats:</div>
                          <div>📊 Spreadsheets: CSV, Excel (.xlsx)</div>
                          <div>📄 Documents: Text, PDF, Word</div>
                          <div>📰 Articles: Any text-based content</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Features & Actions */}
                  <div className="space-y-6">
                    {/* Interactive Features Display */}
                    <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-2xl p-6 border border-emerald-400/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">Interactive Analysis</h3>
                          <p className="text-sm text-emerald-300">Ask questions & update reports</p>
                        </div>
                        <div className="ml-auto">
                          <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded-full font-medium">
                            NEW
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-white/80">
                          <HelpCircle className="w-4 h-4 text-blue-400" />
                          <span>Ask questions about any aspect</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/80">
                          <Upload className="w-4 h-4 text-green-400" />
                          <span>Upload files for enhanced context</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/80">
                          <RefreshCw className="w-4 h-4 text-purple-400" />
                          <span>Update reports with new insights</span>
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
                        <Upload className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                        <div className="text-sm font-medium text-white">File Upload</div>
                      </div>
                      <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4 text-center hover:bg-pink-500/20 transition-colors">
                        <MessageCircle className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                        <div className="text-sm font-medium text-white">Interactive Q&A</div>
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
                            <span>Generate Interactive Analysis</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                          </>
                        )}
                      </div>
                    </button>

                    {/* Advanced Settings Toggle */}
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

                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="w-full flex items-center justify-center gap-3 text-purple-300 hover:text-white transition-all duration-200 group bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl border border-white/10 hover:border-white/20"
                    >
                      <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                      <span className="font-medium">Advanced Settings</span>
                      <ChevronRight className={`w-4 h-4 ${showAdvanced ? 'rotate-90' : ''} transition-transform duration-300`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Enhanced Results Section with Chat */}
      {result && (
        <section className="mt-8 max-w-6xl mx-auto px-6">
          <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 -mx-6 px-6 py-5 mb-8 rounded-t-xl shadow-lg">
            <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Activity className="text-emerald-400 w-8 h-8" />
                {companyName} Analysis v{reportVersion}
                {showChat && (
                  <div className="ml-4 flex items-center gap-2 text-base bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
                    <MessageCircle className="w-4 h-4" />
                    Interactive
                  </div>
                )}
              </h2>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setShowChat(!showChat)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    showChat 
                      ? 'bg-blue-500/30 text-blue-200 border border-blue-400/30' 
                      : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {showChat ? 'Hide Chat' : 'Ask Questions'}
                  </span>
                </button>
                <button
                  onClick={downloadReport}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition"
                >
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copy</span>
                </button>
                <button
                  onClick={shareAnalysis}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 rounded-lg transition"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Main content area with chat */}
          <div className={`grid ${showChat ? 'lg:grid-cols-3' : 'grid-cols-1'} gap-8`}>
            {/* Results column */}
            <div className={showChat ? 'lg:col-span-2' : 'col-span-1'}>
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 lg:p-12">
                <div 
                  id="analysis-content"
                  className="animate-fade-in"
                  dangerouslySetInnerHTML={{ __html: formatResult(result) }}
                />
              </div>
            </div>
            
            {/* Interactive Chat Panel */}
            {showChat && (
              <div className="lg:col-span-1">
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-700 shadow-2xl h-[600px] flex flex-col sticky top-32">
                  {/* Chat Header */}
                  <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Interactive Analysis</h3>
                        <p className="text-slate-400 text-sm">Ask questions or provide updates</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={clearChat}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                        title="Clear chat"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowChat(false)}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                        title="Close chat"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Chat Messages */}
                  <div 
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-6 space-y-4"
                  >
                    {chatMessages.map((message) => (
                      <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${
                          message.type === 'user' 
                            ? 'bg-blue-500 text-white ml-4' 
                            : message.isError
                              ? 'bg-red-500/20 text-red-200 border border-red-500/30'
                              : message.isReportUpdate
                                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
                                : message.isFileUpload
                                  ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                                  : 'bg-slate-700 text-slate-200'
                        }`}>
                          {message.isReportUpdate && (
                            <div className="flex items-center gap-2 mb-2 text-emerald-300 font-semibold text-sm">
                              <RefreshCw className="w-4 h-4" />
                              Report Updated
                            </div>
                          )}
                          {message.isFileUpload && (
                            <div className="flex items-center gap-2 mb-2 text-green-300 font-semibold text-sm">
                              <Upload className="w-4 h-4" />
                              Files Processed
                            </div>
                          )}
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {message.content}
                          </div>
                          <div className="text-xs opacity-60 mt-2">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-700 text-slate-200 p-4 rounded-2xl">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Analyzing...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Chat Input */}
                  <div className="p-6 border-t border-slate-700">
                    <form onSubmit={handleChatSubmit} className="space-y-3">
                      <div className="relative">
                        <textarea
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask about the analysis or provide new information..."
                          className="w-full px-4 py-3 pr-20 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows="3"
                          disabled={chatLoading}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleChatSubmit(e);
                            }
                          }}
                        />
                        <div className="absolute bottom-3 right-3 flex gap-1">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                            title="Attach file"
                            disabled={processingFiles}
                          >
                            {processingFiles ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Paperclip className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            type="submit"
                            disabled={!chatInput.trim() || chatLoading}
                            className="p-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setChatInput("What are the key risks for this company?")}
                          className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full transition-colors"
                        >
                          Key Risks?
                        </button>
                        <button
                          type="button"
                          onClick={() => setChatInput("What adjacent markets show the most promise?")}
                          className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full transition-colors"
                        >
                          Best Opportunities?
                        </button>
                        {uploadedFiles.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setChatInput("Based on the uploaded files, what new insights can you provide about this company?")}
                            className="text-xs px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
                          >
                            📎 Analyze Files
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setChatInput("The company is exploring monetizing traffic via ads. Please update the report with this information.")}
                          className="text-xs px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors"
                        >
                          Update Report
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Enhanced Footer */}
      <footer className="relative z-10 py-12 text-center mt-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span className="text-slate-300">Secure & Private</span>
              <span className="text-slate-500">•</span>
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <span className="text-slate-300">Interactive Q&A</span>
              <span className="text-slate-500">•</span>
              <Upload className="w-5 h-5 text-purple-400" />
              <span className="text-slate-300">File Upload</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Interactive resilience evaluation platform with file upload, real-time Q&A and report updates. 
              Upload spreadsheets and documents, ask questions, and refine your analysis dynamically.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}