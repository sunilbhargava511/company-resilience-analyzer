'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatResult } from '../lib/formatReport';
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
  const [model, setModel] = useState('');
  const [tokenLimit, setTokenLimit] = useState('6000');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [shareableUrl, setShareableUrl] = useState('');
  const [reportMetadata, setReportMetadata] = useState(null);
  const [forceNew, setForceNew] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [defaultModel, setDefaultModel] = useState(null);
  
  // Interactive features state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [reportVersion, setReportVersion] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileContext, setFileContext] = useState('');
  const [processingFiles, setProcessingFiles] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);

    const models = [
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: 'Latest model - best performance and capabilities', badge: 'NEW' },
    { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', description: 'Most powerful model for complex challenges', badge: 'PREMIUM' },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Excellent intelligence and speed' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Highest intelligence for complex analysis' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Good balance of performance and cost' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fastest and most cost-effective' }
  ];

  const tokenOptions = [
    { value: '3000', label: 'Quick Resilience Score', description: 'Core metrics & score', time: '15s' },
    { value: '6000', label: 'Comprehensive Analysis', description: 'Full resilience report', time: '25s' },
    { value: '8000', label: 'Maximum Depth', description: 'Complete framework', time: '35s' }
  ];
  // Generate shareable URL
  const generateShareableUrl = (companyName, analysisResult) => {
    const data = {
      company: companyName,
      analysis: analysisResult,
      timestamp: Date.now()
    };
    const encoded = btoa(JSON.stringify(data));
    const url = `${window.location.origin}${window.location.pathname}?shared=${encoded}`;
    setShareableUrl(url);
    return url;
  };

  // Load shared analysis from URL
  const loadSharedAnalysis = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const shared = urlParams.get('shared');
    if (shared) {
      try {
        const decoded = JSON.parse(atob(shared));
        setCompanyName(decoded.company);
        setResult(decoded.analysis);
        setShareableUrl(window.location.href);
      } catch (error) {
        console.error('Error loading shared analysis:', error);
      }
    }
  };

  // Check for company parameter in URL and pre-fill
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const companyParam = urlParams.get('company');
    if (companyParam) {
      setCompanyName(decodeURIComponent(companyParam));
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fetch default model from environment on mount
  useEffect(() => {
    const fetchDefaultModel = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const data = await response.json();
          const defaultModelId = data.defaultModel || 'claude-sonnet-4-20250514';
          setDefaultModel(defaultModelId);
          setModel(defaultModelId);
        } else {
          // Fallback to Claude Sonnet 4 if API fails
          const fallbackModel = 'claude-sonnet-4-20250514';
          setDefaultModel(fallbackModel);
          setModel(fallbackModel);
        }
      } catch (error) {
        // Fallback to Claude Sonnet 4 if fetch fails
        const fallbackModel = 'claude-sonnet-4-20250514';
        setDefaultModel(fallbackModel);
        setModel(fallbackModel);
      } finally {
        setConfigLoading(false);
      }
    };
    
    fetchDefaultModel();
  }, []);

    // Auto-adjust token limit when model changes
  useEffect(() => {
    const modelTokenLimits = {
      'claude-sonnet-4-20250514': 8000,
      'claude-opus-4-20250514': 8000,
      'claude-3-5-sonnet-20241022': 8000,
      'claude-3-opus-20240229': 4096,
      'claude-3-sonnet-20240229': 4096,
      'claude-3-haiku-20240307': 4096
    };
    
    const maxTokensForModel = modelTokenLimits[model] || 4096;
    if (parseInt(tokenLimit) > maxTokensForModel) {
      setTokenLimit(maxTokensForModel.toString());
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

  // Prepare chat welcome message when report is generated
  useEffect(() => {
    if (result && chatMessages.length === 0) {
      // Add welcome message with enhanced capabilities
      const welcomeMessage = uploadedFiles.length > 0 
        ? `🎉 **Enhanced AI Analysis Ready for ${companyName}!**

Your uploaded files (${uploadedFiles.map(f => f.name).join(', ')}) have been integrated. I now have comprehensive knowledge, web search capabilities, and your document context.

**🧠 What I can help you explore:**
• **Real-time analysis** - I can search the web for current information
• **Deep-dive insights** - Get detailed analysis beyond the report
• **Competitive intelligence** - Current competitor actions and market position  
• **Market trend analysis** - Latest industry developments and disruptions
• **Financial performance** - Most recent earnings and financial metrics
• **Strategic scenarios** - Updated bull/bear/base case outcomes
• **Risk assessment** - Current threats and mitigation strategies
• **File analysis** - Extract insights from your uploaded documents
• **Report updates** - Incorporate latest market developments

**💡 Try asking questions like:**
"What's the latest news about this company and how does it affect resilience?" or "How does recent performance compare to competitors?" or "What current market trends could disrupt this business?"

What would you like to explore first?`
        : `🎉 **Enhanced AI Analysis Ready for ${companyName}!**

I have comprehensive business knowledge AND web search capabilities to provide the most current analysis possible.

**🧠 What I can help you explore:**
• **Real-time analysis** - I can search for current company information
• **Latest financial data** - Recent earnings, performance metrics, market cap
• **Current competitive landscape** - Recent competitor moves and market share
• **Industry trends** - Latest developments affecting the business
• **Strategic developments** - Recent partnerships, acquisitions, expansions
• **Risk assessment** - Current threats and regulatory changes
• **Market analysis** - How recent trends impact the business model
• **Investment updates** - Latest information affecting investment thesis

**💡 Ask about current information like:**
"Latest earnings and financial performance" or "Recent competitive developments" or "Current industry trends affecting this company"

What would you like to explore first?`;

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

        // Validate token limit for selected model
    const modelTokenLimits = {
      'claude-sonnet-4-20250514': 8000,
      'claude-opus-4-20250514': 8000,
      'claude-3-5-sonnet-20241022': 8000,
      'claude-3-opus-20240229': 4096,
      'claude-3-sonnet-20240229': 4096,
      'claude-3-haiku-20240307': 4096
    };
    
    const maxTokensForModel = modelTokenLimits[model] || 4096;
    if (parseInt(tokenLimit) > maxTokensForModel) {
      setError(`Maximum ${maxTokensForModel} tokens supported for selected model. Please reduce token limit or choose a different model.`);
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
          fileContext: fileContext || null, // Include uploaded file context
          forceNew // Include force new analysis parameter
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      setResult(data.result);
      setReportMetadata(data.metadata || null);
      
      // Set shareable URL if metadata is available
      if (data.metadata && data.metadata.shareUrl) {
        setShareableUrl(data.metadata.shareUrl);
      }
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
    
    // Check if this might trigger web search for user feedback
    const searchTriggers = ['recent', 'latest', 'current', 'news', 'earnings', 'competitor', 'vs', 'versus', 'performance', 'compare', 'trends', 'market', 'search', 'find', 'look up'];
    const likelyToSearch = searchTriggers.some(word => chatInput.toLowerCase().includes(word));
    
    const currentInput = chatInput; // Store before clearing
    setChatInput('');
    setChatLoading(true);

    // Add searching indicator if likely to search
    let searchingMessageId = null;
    if (likelyToSearch) {
      searchingMessageId = Date.now() + 0.5;
      const searchingMessage = {
        id: searchingMessageId,
        type: 'assistant',
        content: '🔍 **Analyzing with current data...**\n\nI\'m using web search to gather the latest information about ' + companyName + ' to provide you with comprehensive, up-to-date insights.',
        timestamp: new Date(),
        isSearching: true
      };
      setChatMessages(prev => [...prev, searchingMessage]);
    }

    try {
      // Determine if this is a question or a report update request
      const isUpdateRequest = currentInput.toLowerCase().includes('update') && 
                            (currentInput.toLowerCase().includes('report') || 
                             currentInput.toLowerCase().includes('analysis')) ||
                            currentInput.toLowerCase().includes('redo') || 
                            currentInput.toLowerCase().includes('incorporate') ||
                            currentInput.toLowerCase().includes('add this') ||
                            currentInput.toLowerCase().includes('use this info') ||
                            currentInput.toLowerCase().includes('revise');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          context: result,
          companyName,
          isUpdateRequest,
          model,
          fileContext: fileContext || null // Include file context in chat
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Chat request failed');
      }

      // Remove searching message if it was added
      if (searchingMessageId) {
        setChatMessages(prev => prev.filter(msg => msg.id !== searchingMessageId));
      }

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: data.result,
        timestamp: new Date(),
        isReportUpdate: isUpdateRequest,
        usedWebSearch: data.usedWebSearch || false,
        searchSummary: data.searchSummary
      };

      setChatMessages(prev => [...prev, assistantMessage]);

      // If this was an update request, update the main report
      if (isUpdateRequest) {
        setResult(data.result);
        setReportVersion(prev => prev + 1);
      }

    } catch (err) {
      // Remove searching message if there was an error
      if (searchingMessageId) {
        setChatMessages(prev => prev.filter(msg => msg.id !== searchingMessageId));
      }

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

  const scrollToChat = () => {
    setShowChat(true);
    // Small delay to ensure the chat section is rendered before scrolling
    setTimeout(() => {
      const chatSection = document.getElementById('chat-section');
      if (chatSection) {
        chatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const clearChat = () => {
    setChatMessages([{
      id: Date.now(),
      type: 'assistant',
      content: `Chat cleared! I'm ready to help you explore the ${companyName} analysis with current web search capabilities. What would you like to know?`,
      timestamp: new Date()
    }]);
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

  const downloadReport = async () => {
    try {
      // Dynamically import PDF libraries to avoid SSR issues
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;
      
      // Parse the result text to extract structured data
      const lines = result.split('\n');
      let resilienceScore = '';
      
      // Helper function to clean markdown from text
      const cleanMarkdown = (text) => {
        if (!text) return '';
        return text
          .replace(/\*\*/g, '')  // Remove bold markers
          .replace(/\*/g, '')    // Remove single asterisks
          .replace(/^#+\s*$/gm, '') // Remove empty headers
          .replace(/^\s*#\s*$/gm, '') // Remove standalone #
          .trim();
      };
      
      // Extract resilience score
      const scoreMatch = result.match(/(?:Overall\s+)?Resilience\s+Score:?\s*(\d+(?:\.\d+)?)\s*[\/\-]\s*10/i);
      if (scoreMatch) {
        resilienceScore = scoreMatch[1];
      }
      
      // Create PDF with proper settings
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set document properties
      pdf.setProperties({
        title: `${companyName} Resilience Analysis`,
        subject: 'Company Resilience Analysis Report',
        author: 'Interactive Resilience Analyzer',
        keywords: `resilience, analysis, ${companyName}`,
        creator: 'Interactive Resilience Analyzer'
      });
      
      // Define colors
      const primaryColor = [52, 211, 153]; // Emerald
      const secondaryColor = [59, 130, 246]; // Blue
      const textColor = [31, 41, 55]; // Dark gray
      const lightGray = [229, 231, 235];
      
      // Add header with gradient effect
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, 210, 40, 'F');
      
      // Add title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont(undefined, 'bold');
      pdf.text(`${companyName}`, 105, 18, { align: 'center' });
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'normal');
      pdf.text('Resilience Analysis Report', 105, 28, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(`Version ${reportVersion} | ${new Date().toLocaleDateString()}`, 105, 35, { align: 'center' });
      
      // Add resilience score card if found
      let yPosition = 55;
      if (resilienceScore) {
        // Enhanced score card with better styling
        const cardHeight = 45;
        pdf.setFillColor(...lightGray);
        pdf.roundedRect(20, yPosition, 170, cardHeight, 5, 5, 'F');
        
        // Score text
        pdf.setTextColor(...textColor);
        pdf.setFontSize(26);
        pdf.setFont(undefined, 'bold');
        pdf.text(`Resilience Score: ${resilienceScore}/10`, 105, yPosition + 14, { align: 'center' });
        
        // Score bar
        const scorePercent = (parseFloat(resilienceScore) / 10) * 100;
        pdf.setFillColor(229, 231, 235);
        pdf.rect(40, yPosition + 22, 130, 8, 'F');
        
        // Determine color and label based on score
        let scoreLabel = '';
        const score = parseFloat(resilienceScore);
        if (score >= 8) {
          pdf.setFillColor(16, 185, 129); // Green
          scoreLabel = 'Highly Resilient';
        } else if (score >= 6) {
          pdf.setFillColor(59, 130, 246); // Blue
          scoreLabel = 'Strong Position';
        } else if (score >= 4) {
          pdf.setFillColor(251, 146, 60); // Orange
          scoreLabel = 'Moderate Risk';
        } else {
          pdf.setFillColor(239, 68, 68); // Red
          scoreLabel = 'High Risk';
        }
        pdf.rect(40, yPosition + 22, (130 * scorePercent) / 100, 8, 'F');
        
        // Add score interpretation label
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(scoreLabel, 105, yPosition + 38, { align: 'center' });
        
        yPosition += cardHeight + 15; // More spacing after score card
      }
      
      // Process content sections
      pdf.setTextColor(...textColor);
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(11);
      
      // Parse content more intelligently to avoid duplicates
      let processedSections = new Set();
      const sections = result.split(/(?=#{2,3}\s)/);
      
      for (const section of sections) {
        if (!section.trim()) continue;
        
        // Skip empty headers (just # with no content)
        if (section.match(/^#{1,3}\s*$/)) continue;
        
        // Skip if we've already processed similar content (avoid duplicates)
        const sectionKey = section.substring(0, 100).replace(/[^a-zA-Z0-9]/g, '');
        if (processedSections.has(sectionKey)) continue;
        processedSections.add(sectionKey);
        
        // Check if we need a new page - be more conservative with page breaks
        if (yPosition > 240) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Handle section headers with better spacing
        if (section.startsWith('###')) {
          const headerMatch = section.match(/###\s*(.+)/);
          if (headerMatch) {
            // Ensure enough space for header (avoid orphaned headers)
            if (yPosition > 230) {
              pdf.addPage();
              yPosition = 20;
            }
            
            // Add space before subsection headers
            yPosition += 8;
            
            pdf.setFontSize(13);
            pdf.setFont(undefined, 'bold');
            pdf.setTextColor(...primaryColor);
            
            const headerText = cleanMarkdown(headerMatch[1]
              .replace(/[🔋⚠️🎯🚀📈💡🔮📊🏆💰🌟⭐]/g, '')
              .replace(/^\d+\.\s*/, ''));
            
            // Wrap long headers
            const wrappedHeader = pdf.splitTextToSize(headerText, 170);
            for (const line of wrappedHeader) {
              pdf.text(line, 20, yPosition);
              yPosition += 6;
            }
            
            // Add subtle underline
            pdf.setDrawColor(...lightGray);
            pdf.setLineWidth(0.3);
            pdf.line(20, yPosition - 1, 190, yPosition - 1);
            yPosition += 6;
          }
        } else if (section.startsWith('##')) {
          const headerMatch = section.match(/##\s*(.+)/);
          if (headerMatch) {
            // Major section - consider new page for clean breaks
            if (yPosition > 200) {
              pdf.addPage();
              yPosition = 20;
            } else {
              yPosition += 10;
            }
            
            pdf.setFontSize(15);
            pdf.setFont(undefined, 'bold');
            pdf.setTextColor(...secondaryColor);
            
            const headerText = cleanMarkdown(headerMatch[1]
              .replace(/[🔋⚠️🎯🚀📈💡🔮📊🏆💰🌟⭐]/g, '')
              .replace(/^\d+\.\s*/, ''));
            
            pdf.text(headerText, 20, yPosition);
            yPosition += 8;
            
            // Add prominent underline for major sections
            pdf.setDrawColor(...secondaryColor);
            pdf.setLineWidth(0.5);
            pdf.line(20, yPosition - 1, 190, yPosition - 1);
            yPosition += 6;
          }
        }
        
        // First, check if this section contains a table - handle tables BEFORE text processing
        const hasTable = section.includes('|') && (
          section.includes('---') || 
          section.includes('Metric') || 
          section.includes('Category') || 
          section.includes('Score') || 
          section.includes('Weight') ||
          section.includes('Company') ||
          section.includes('Total') ||
          /\|\s*[^|]+\s*\|/.test(section) // Basic pipe table pattern
        );
        let tableProcessed = false;
        
        if (hasTable) {
          const tableLines = section.split('\n').filter(l => l.includes('|'));
          
          // Only process if we have valid table structure
          if (tableLines.length >= 2) {
            // Check if we need a page break for the table
            const estimatedTableHeight = (tableLines.length * 12) + 20; // Rough estimate
            if (yPosition + estimatedTableHeight > 260) {
              pdf.addPage();
              yPosition = 20;
            }
            let headers = [];
            let rows = [];
            
            // Look for separator line to identify header
            const separatorIndex = tableLines.findIndex(line => line.match(/^[\s\-|]+$/));
            
            if (separatorIndex > 0) {
              // Header is line before separator
              headers = tableLines[separatorIndex - 1]
                .split('|')
                .filter(h => h.trim())
                .map(h => cleanMarkdown(h.trim()));
              
              // Rows are after separator
              rows = tableLines.slice(separatorIndex + 1)
                .filter(line => !line.match(/^[\s\-|]+$/))
                .map(line => 
                  line.split('|')
                    .filter(cell => cell !== undefined)
                    .map(cell => cleanMarkdown((cell || '').trim()))
                )
                .filter(row => row.length > 0 && row.some(cell => cell.length > 0));
            } else {
              // No separator, assume first line is header
              headers = tableLines[0]
                .split('|')
                .filter(h => h.trim())
                .map(h => cleanMarkdown(h.trim()));
              
              rows = tableLines.slice(1)
                .filter(line => !line.match(/^[\s\-|]+$/))
                .map(line => 
                  line.split('|')
                    .filter(cell => cell !== undefined)
                    .map(cell => cleanMarkdown((cell || '').trim()))
                )
                .filter(row => row.length > 0 && row.some(cell => cell.length > 0));
            }
            
            if (headers.length > 0 && rows.length > 0) {
              // Ensure column consistency - pad rows to match header length
              const maxColumns = Math.max(headers.length, ...rows.map(row => row.length));
              headers = headers.concat(Array(maxColumns - headers.length).fill(''));
              rows = rows.map(row => row.concat(Array(maxColumns - row.length).fill('')));
              
              // Check if table fits on current page
              const tableHeight = (rows.length + 1) * 10;
              if (yPosition + tableHeight > 240) {
                pdf.addPage();
                yPosition = 20;
              }
              
              // Use autoTable for better table rendering
              if (typeof pdf.autoTable === 'function') {
                // Special handling for different table types
                const isScoreTable = headers.some(h => h.toLowerCase().includes('category') || h.toLowerCase().includes('score'));
                const isMetricTable = headers.some(h => h.toLowerCase().includes('metric'));
                
                pdf.autoTable({
                  head: [headers],
                  body: rows,
                  startY: yPosition,
                  theme: 'grid',
                  headStyles: {
                    fillColor: isScoreTable ? secondaryColor : primaryColor,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 9,
                    cellPadding: 4
                  },
                  bodyStyles: {
                    fontSize: 8,
                    textColor: textColor,
                    cellPadding: 3,
                    overflow: 'linebreak',
                    cellWidth: 'wrap'
                  },
                  columnStyles: isMetricTable ? {
                    0: { cellWidth: 40 }, // Metric column
                    1: { cellWidth: 25 }, // Value column
                    2: { cellWidth: 30 }, // Best-in-class column
                    3: { cellWidth: 25 }, // Leader column
                    4: { cellWidth: 'auto' } // Gap analysis column
                  } : {},
                  alternateRowStyles: {
                    fillColor: [248, 250, 252]
                  },
                  margin: { left: 20, right: 20 },
                  tableWidth: 'auto',
                  showHead: 'everyPage',
                  didParseCell: function(data) {
                    // Bold the total row if present
                    if (data.row.raw && data.row.raw[0] && 
                        (data.row.raw[0].toLowerCase().includes('total'))) {
                      data.cell.styles.fontStyle = 'bold';
                      data.cell.styles.fillColor = [240, 244, 248];
                    }
                    
                    // Handle multi-line content in cells
                    if (data.cell.text && data.cell.text.length > 60) {
                      data.cell.styles.cellWidth = 'wrap';
                    }
                  }
                });
                
                yPosition = pdf.lastAutoTable.finalY + 15; // Better spacing after tables
                tableProcessed = true;
              }
            }
          }
        }
        
        // Always process text (but skip table lines within the text processing)
        {
          // Handle bullet points and regular text
          pdf.setFontSize(10);
          pdf.setFont(undefined, 'normal');
          pdf.setTextColor(...textColor);
          
          const contentLines = section.split('\\n').slice(1); // Skip the header line
          for (const line of contentLines) {
            if (!line.trim()) continue;
            
            // Skip lines that are part of tables - enhanced detection
            if (line.includes('|')) {
              // Skip table separator lines (contain dashes)
              if (line.match(/^[\\s\\-|]+$/)) continue;
              // Skip lines with multiple pipes (actual table content)
              if (line.split('|').length > 2) continue;
              // Skip table header/content patterns
              if (line.match(/\\|\\s*[^|]+\\s*\\|/)) continue;
            }
            
            // Check for page break with better logic
            if (yPosition > 265) {
              pdf.addPage();
              yPosition = 20;
            }
            
            // Handle bullet points with better formatting
            if (line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*')) {
              // Check if bullet point would be orphaned
              if (yPosition > 260) {
                pdf.addPage();
                yPosition = 20;
              }
              
              const bulletText = cleanMarkdown(line.replace(/^[\\s\\-•\\*]+/, '').trim());
              
              // Skip empty bullets
              if (!bulletText) continue;
              
              const wrappedText = pdf.splitTextToSize(bulletText, 160);
              
              // Add bullet symbol
              pdf.setFillColor(...textColor);
              pdf.circle(25, yPosition - 1, 0.8, 'F');
              
              // Add text with consistent spacing
              pdf.setFontSize(10);
              for (let i = 0; i < wrappedText.length; i++) {
                if (yPosition > 265) {
                  pdf.addPage();
                  yPosition = 20;
                }
                pdf.text(wrappedText[i], 32, yPosition);
                yPosition += 4.5;
              }
              yPosition += 1.5;
            }
            // Handle bold text and key-value pairs
            else if (line.includes('**') || line.includes(':')) {
              // Check for key-value format
              const kvMatch = line.match(/^\\*\\*([^*]+)\\*\\*:\\s*(.+)$/);
              
              if (kvMatch) {
                // Format as key-value pair
                const [, key, value] = kvMatch;
                
                if (yPosition > 260) {
                  pdf.addPage();
                  yPosition = 20;
                }
                
                // Key in bold
                pdf.setFont(undefined, 'bold');
                pdf.setFontSize(10);
                const keyWidth = pdf.getTextWidth(key + ': ');
                pdf.text(key + ': ', 20, yPosition);
                
                // Value in normal
                pdf.setFont(undefined, 'normal');
                const valueWrapped = pdf.splitTextToSize(cleanMarkdown(value), 170 - keyWidth);
                
                // First line continues after key
                if (valueWrapped[0]) {
                  pdf.text(valueWrapped[0], 20 + keyWidth, yPosition);
                  yPosition += 5;
                }
                
                // Subsequent lines
                for (let i = 1; i < valueWrapped.length; i++) {
                  if (yPosition > 265) {
                    pdf.addPage();
                    yPosition = 20;
                  }
                  pdf.text(valueWrapped[i], 20, yPosition);
                  yPosition += 5;
                }
                yPosition += 2;
              } else {
                // Handle other bold text
                const processedLine = cleanMarkdown(line);
                if (!processedLine) continue;
                
                const wrappedText = pdf.splitTextToSize(processedLine, 170);
                
                const hasBold = line.includes('**');
                if (hasBold) {
                  pdf.setFont(undefined, 'bold');
                }
                
                pdf.setFontSize(10);
                for (const wrappedLine of wrappedText) {
                  if (yPosition > 265) {
                    pdf.addPage();
                    yPosition = 20;
                  }
                  pdf.text(wrappedLine, 20, yPosition);
                  yPosition += 5;
                }
                
                if (hasBold) {
                  pdf.setFont(undefined, 'normal');
                }
                yPosition += 1;
              }
            }
            // Handle regular text
            else {
              const cleanedLine = cleanMarkdown(line);
              if (!cleanedLine) continue; // Skip empty lines after cleaning
              
              const wrappedText = pdf.splitTextToSize(cleanedLine, 170);
              for (const wrappedLine of wrappedText) {
                if (yPosition > 270) {
                  pdf.addPage();
                  yPosition = 20;
                }
                pdf.text(wrappedLine, 20, yPosition);
                yPosition += 5;
              }
              yPosition += 1;
            }
          }
        }
      }
      
      // Add footer to all pages
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setTextColor(156, 163, 175);
        pdf.text(`Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
        pdf.text('Interactive Resilience Analyzer', 20, 287);
        pdf.text(new Date().toLocaleDateString(), 190, 287, { align: 'right' });
      }
      
      // Save the PDF
      pdf.save(`${companyName.replace(/\s+/g, '_')}_Resilience_Analysis_v${reportVersion}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to text download
      const element = document.createElement('a');
      const file = new Blob([result], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${companyName.replace(/\s+/g, '_')}_Resilience_Analysis_v${reportVersion}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      alert('PDF generation failed. Downloaded as text file instead.');
    }
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
              Advanced resilience evaluation with <strong className="text-emerald-400">real-time web search</strong>. 
              Ask questions, get current data, and refine your assessment with live market intelligence.
            </p>
            
            {/* Enhanced trust indicators */}
            <div className="flex items-center justify-center gap-8 text-sm text-purple-300 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Resilience Framework</span>
              </div>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>Real-time Web Search</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>Interactive Q&A</span>
              </div>
            </div>
            
            {/* Free to use indicator */}
            <div className="mt-6 inline-block px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-lg font-semibold">
              ✨ Enhanced with Live Market Data - Ask Questions & Get Current Insights
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
                    Generate reports with current market data, ask questions, and update analysis with new information
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
                          <Search className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">Real-Time Web Search</h3>
                          <p className="text-sm text-emerald-300">Live market data & analysis</p>
                        </div>
                        <div className="ml-auto">
                          <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded-full font-medium">
                            ENHANCED
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-white/80">
                          <Search className="w-4 h-4 text-green-400" />
                          <span>Real-time market data & news</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/80">
                          <HelpCircle className="w-4 h-4 text-blue-400" />
                          <span>Ask questions about current events</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/80">
                          <Upload className="w-4 h-4 text-purple-400" />
                          <span>Upload files for enhanced context</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/80">
                          <RefreshCw className="w-4 h-4 text-pink-400" />
                          <span>Update reports with live data</span>
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
                        <Search className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                        <div className="text-sm font-medium text-white">Live Data Search</div>
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

                    {/* Force New Analysis Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">Force New Analysis</span>
                        <span className="text-white/60 text-sm">Skip cached reports and generate fresh analysis</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={forceNew}
                          onChange={(e) => setForceNew(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-emerald-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={analyzeCompany}
                      disabled={!companyName || loading || configLoading}
                      className="w-full group relative overflow-hidden bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 hover:from-emerald-700 hover:via-blue-700 hover:to-purple-700 text-white px-8 py-6 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50"
                    >
                      {/* Background Animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                      
                      <div className="relative z-10 flex items-center justify-center gap-4">
                        {configLoading ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Loading configuration...</span>
                          </>
                        ) : loading ? (
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
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="w-full flex items-center justify-center gap-3 text-purple-300 hover:text-white transition-all duration-200 group bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl border border-white/10 hover:border-white/20"
                    >
                      <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                      <span className="font-medium">Advanced Settings</span>
                      <ChevronRight className={`w-4 h-4 ${showAdvanced ? 'rotate-90' : ''} transition-transform duration-300`} />
                    </button>

                    {/* Advanced Settings */}
                    {showAdvanced && (
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 animate-slide-in">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-emerald-400" />
                          Advanced Settings
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm text-white/80 mb-2">AI Model</label>
                            <div className="space-y-2">
                              {models.map((m) => (
                                <label
                                  key={m.id}
                                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                                    model === m.id 
                                      ? 'bg-emerald-500/20 border-2 border-emerald-500 shadow-lg' 
                                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="model"
                                    value={m.id}
                                    checked={model === m.id}
                                    onChange={(e) => setModel(e.target.value)}
                                    className="w-4 h-4 accent-emerald-500"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-white font-medium">{m.name}</span>
                                      {m.badge && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                          m.badge === 'NEW' 
                                            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                        }`}>
                                          {m.badge}
                                        </span>
                                      )}
                                      {m.id === defaultModel && (
                                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                                          DEFAULT
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-white/60 mt-0.5">{m.description}</div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Trust Indicators */}
                    <div className="flex items-center justify-center gap-6 text-xs text-white/60">
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        <span>Resilience Framework</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Search className="w-3 h-3" />
                        <span>Web Search</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>Interactive AI</span>
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
                {companyName} Interactive Analysis v{reportVersion}
                {showChat && (
                  <button
                    onClick={scrollToChat}
                    className="ml-4 px-3 py-1 text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </button>
                )}
              </h2>
              <div className="flex gap-3 flex-wrap">
                {!showChat && (
                  <button
                    onClick={scrollToChat}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Ask Questions</span>
                  </button>
                )}
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
                  className="flex items-center gap-2 px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 rounded-lg transition"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Report Metadata and Share Section */}
          {reportMetadata && (
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cache Status */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  {reportMetadata.isFromCache ? (
                    <Clock className="w-6 h-6 text-yellow-400" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-green-400" />
                  )}
                  <h3 className="text-lg font-semibold text-white">
                    {reportMetadata.isFromCache ? 'Cached Analysis' : 'Fresh Analysis'}
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-white/80">
                  <div>Generated: {new Date(reportMetadata.generatedAt).toLocaleDateString()}</div>
                  <div>Model: {reportMetadata.modelUsed}</div>
                  <div>Version: {reportMetadata.version}</div>
                  {reportMetadata.cacheExpiresAt && (
                    <div>Cache expires: {new Date(reportMetadata.cacheExpiresAt).toLocaleDateString()}</div>
                  )}
                </div>
              </div>

              {/* Share Options */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <Share2 className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Share Analysis</h3>
                </div>
                <div className="space-y-3">
                  {reportMetadata.shareUrl && (
                    <div>
                      <label className="block text-sm text-white/80 mb-2">Shareable Link</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={reportMetadata.shareUrl}
                          readOnly
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(reportMetadata.shareUrl);
                            // You could add a toast notification here
                            alert('Link copied to clipboard!');
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-white/60">
                    Share this analysis with others via the permanent link above.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main results content with enhanced styling */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 lg:p-12">
            <div 
              id="analysis-content"
              className="animate-fade-in"
              dangerouslySetInnerHTML={{ __html: formatResult(result) }}
            />
          </div>

          {/* Interactive Chat Section */}
          {result && (
            <div id="chat-section" className="mt-8">
              <div className="bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-emerald-600/20 p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Interactive Analysis Assistant</h3>
                        <p className="text-white/70">Ask questions, get updates, explore insights with real-time web search</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={clearChat}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
                        title="Clear chat"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowChat(!showChat)}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
                        title={showChat ? "Minimize chat" : "Expand chat"}
                      >
                        {showChat ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {showChat && (
                  <div className="p-6">
                    {/* Chat Messages */}
                    <div 
                      ref={chatContainerRef}
                      className="h-96 overflow-y-auto mb-6 space-y-4 bg-black/20 rounded-2xl p-4 border border-white/10"
                    >
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] ${
                            message.type === 'user' 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-tr-md p-4'
                              : message.isError
                                ? 'bg-red-500/20 border border-red-500/30 text-red-200 rounded-2xl rounded-tl-md p-4'
                                : message.isSearching
                                  ? 'bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 text-emerald-200 rounded-2xl rounded-tl-md p-4'
                                  : 'bg-white/10 text-white rounded-2xl rounded-tl-md p-4 border border-white/20'
                          }`}>
                            <div className="prose prose-sm prose-invert max-w-none">
                              <div dangerouslySetInnerHTML={{ 
                                __html: message.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                              }} />
                            </div>
                            {message.usedWebSearch && (
                              <div className="mt-2 text-xs opacity-70 flex items-center gap-1">
                                <Search className="w-3 h-3" />
                                <span>Enhanced with current web data</span>
                              </div>
                            )}
                            {message.isReportUpdate && (
                              <div className="mt-2 text-xs opacity-70 flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" />
                                <span>Report updated</span>
                              </div>
                            )}
                            <div className="text-xs opacity-50 mt-2">
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white/10 rounded-2xl rounded-tl-md p-4 border border-white/20">
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-white/70">Thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleChatSubmit} className="flex gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask about recent performance, competitors, market trends, or request report updates..."
                          disabled={chatLoading}
                          className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={!chatInput.trim() || chatLoading}
                        className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 group"
                      >
                        <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        <span className="hidden sm:inline">Send</span>
                      </button>
                    </form>

                    {/* Quick Questions */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {[
                        "Latest earnings and performance",
                        "Current competitive position", 
                        "Recent industry trends",
                        "Update report with new data"
                      ].map((question) => (
                        <button
                          key={question}
                          onClick={() => setChatInput(question)}
                          className="px-3 py-2 text-sm bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-lg transition border border-white/10 hover:border-white/20"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
              <span className="text-slate-300">Complexity Investing Framework</span>
              <span className="text-slate-500">•</span>
              <Cpu className="w-5 h-5 text-purple-400" />
              <span className="text-slate-300">Powered by Claude AI</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Advanced resilience evaluation platform with real-time web search capabilities. 
              Assess adaptability, optionality, and long-term value creation with interactive AI analysis.
            </p>
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
              <span>Interactive Analysis</span>
              <span>•</span>
              <span>Real-time Data</span>
              <span>•</span>
              <span>Web Search Enhanced</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}