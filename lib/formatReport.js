// lib/formatReport.js - Shared formatting utility for resilience reports
// Extracted from main app to ensure consistent formatting across all displays

export const formatResult = (text) => {
  if (!text) return '';
  
  let html = text;
  
  // Clean up the text first
  html = html.replace(/^\s*#\s*$/gm, '');
  html = html.replace(/\n\s*#\s*\n/g, '\n\n');
  
  // Remove standalone emojis that aren't part of headers
  html = html.replace(/^\s*[📊📈🔋⚠️🎯🚀💡🔮]\s*$/gm, '');
  
  // Clean up any remaining unformatted single-word lines that might cause styling issues
  html = html.replace(/^\s*([A-Z][a-z]+)\s*$/gm, (match, word) => {
    // Only clean up if it's a standalone word that looks like it should be part of content
    if (word.length > 3 && !['Summary', 'Analysis', 'Overview', 'Report', 'Conclusion'].includes(word)) {
      return `<p class="mb-2 text-gray-700 dark:text-gray-300">${word}</p>`;
    }
    return match;
  });
  
  // Extract resilience score and optionality metrics
  const scorePatterns = [
    /(?:Overall\s+)?Resilience\s+Score:?\s*(\d+(?:\.\d+)?)\s*[\/\-]\s*10/gi,
    /Score:?\s*(\d+(?:\.\d+)?)\s*[\/\-]\s*10/gi,
    /(\d+(?:\.\d+)?)\s*[\/\-]\s*10/g
  ];

  // Extract Optionality Score
  const optionalityPatterns = [
    /Optionality\s+Score:?\s*(\d+(?:\.\d+)?)\s*[\/\-]\s*10/gi,
    /(?:Adjacent\s+Market\s+)?Optionality:?\s*(\d+(?:\.\d+)?)\s*[\/\-]\s*10/gi
  ];

  let scoreFound = false;
  let scoreDisplay = '';
  let extractedScore = null;
  let extractedOptionality = null;
  
  // Try to find the main resilience score
  for (const pattern of scorePatterns) {
    if (scoreFound) break;
    
    const match = html.match(pattern);
    if (match) {
      const scoreMatch = match[0].match(/(\d+(?:\.\d+)?)/);
      if (scoreMatch) {
        extractedScore = parseFloat(scoreMatch[1]);
        if (extractedScore >= 0 && extractedScore <= 10) {
          scoreFound = true;
          // Remove the score line from the main content
          html = html.replace(pattern, '');
          break;
        }
      }
    }
  }

  // Try to find optionality score
  for (const pattern of optionalityPatterns) {
    const match = html.match(pattern);
    if (match) {
      const optionalityMatch = match[0].match(/(\d+(?:\.\d+)?)/);
      if (optionalityMatch) {
        extractedOptionality = parseFloat(optionalityMatch[1]);
        if (extractedOptionality >= 0 && extractedOptionality <= 10) {
          // Remove the optionality score line from the main content
          html = html.replace(pattern, '');
          break;
        }
      }
    }
  }

  // Create enhanced score display with all three metrics
  if (scoreFound) {
    const resilienceScore = extractedScore;
    const optionalityScore = extractedOptionality || (resilienceScore * 0.85); // Estimate if not found
    const totalScore = resilienceScore + optionalityScore;
    
    const percentage = Math.round(resilienceScore * 10);
    let bgGradient, scoreLabel, emoji, textColor;
    
    if (resilienceScore >= 8) {
      bgGradient = 'from-emerald-500 to-green-600';
      scoreLabel = 'Highly Resilient';
      emoji = '🚀';
      textColor = 'text-emerald-100';
    } else if (resilienceScore >= 6) {
      bgGradient = 'from-blue-500 to-indigo-600';
      scoreLabel = 'Strong Position';
      emoji = '💪';
      textColor = 'text-blue-100';
    } else if (resilienceScore >= 4) {
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
      <div class="score-card mb-6 p-8 rounded-3xl bg-gradient-to-br ${bgGradient} shadow-2xl text-white text-center relative overflow-hidden">
        <div class="absolute inset-0 bg-white/10 opacity-30"></div>
        <div class="relative z-10">
          <!-- Main Score Display -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <!-- Resilience Score -->
            <div class="text-center">
              <div class="text-4xl font-black mb-2">${resilienceScore.toFixed(1)}/10</div>
              <div class="text-sm font-semibold ${textColor} opacity-90">RESILIENCE</div>
              <div class="text-xs opacity-75">Core Stability</div>
            </div>
            
            <!-- Optionality Score -->
            <div class="text-center">
              <div class="text-4xl font-black mb-2">${optionalityScore.toFixed(1)}/10</div>
              <div class="text-sm font-semibold ${textColor} opacity-90">OPTIONALITY</div>
              <div class="text-xs opacity-75">Growth Options</div>
            </div>
            
            <!-- Total Score -->
            <div class="text-center border-l border-white/30 md:pl-4">
              <div class="text-5xl font-black mb-2">${totalScore.toFixed(1)}/20</div>
              <div class="text-sm font-semibold ${textColor} opacity-90">TOTAL SCORE</div>
              <div class="text-xs opacity-75">Combined Rating</div>
            </div>
          </div>
          
          <!-- Overall Assessment -->
          <div class="border-t border-white/30 pt-6">
            <div class="text-2xl font-bold mb-2 ${textColor}">${scoreLabel}</div>
            <div class="text-lg opacity-90 mb-6">${percentage}% Investment Grade</div>
            
            <!-- Progress Bar -->
            <div class="max-w-md mx-auto mb-4">
              <div class="w-full bg-black/30 rounded-full h-4 overflow-hidden">
                <div class="progress-bar h-full bg-white/90 rounded-full transition-all duration-2000 ease-out" style="width: ${percentage}%"></div>
              </div>
            </div>
            
            <!-- Key Attributes -->
            <div class="flex flex-wrap justify-center gap-8 text-sm">
              <div class="flex items-center gap-2">
                <div class="font-bold">Adaptability:</div>
                <div class="opacity-80">${resilienceScore >= 7 ? 'High' : resilienceScore >= 5 ? 'Medium' : 'Low'}</div>
              </div>
              <div class="flex items-center gap-2">
                <div class="font-bold">Growth Options:</div>
                <div class="opacity-80">${optionalityScore >= 7 ? 'Strong' : optionalityScore >= 5 ? 'Moderate' : 'Limited'}</div>
              </div>
              <div class="flex items-center gap-2">
                <div class="font-bold">Durability:</div>
                <div class="opacity-80">${resilienceScore >= 7 ? 'Robust' : resilienceScore >= 5 ? 'Stable' : 'Fragile'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  // Consistent Company Overview section handling
  html = html.replace(/(#{1,3}\s*📊\s*Company Overview[\s\S]*?)(?=#{1,3}\s*[🔋⚠️🎯🚀📈💡🔮]|$)/gi, (match) => {
    let sectionContent = match;
    
    // Extract company data from multiple formats
    const companyData = {};
    
    // Pattern 1: **Key**: Value format (handle longer values)
    const kvPattern1 = /\*\*([^*:]+)\*\*:\s*([^\n*]+(?:\n(?!\*\*)[^\n*]+)*)/g;
    let match1;
    while ((match1 = kvPattern1.exec(sectionContent)) !== null) {
      const key = match1[1].trim();
      const value = match1[2].trim().replace(/\n/g, ' ');
      if (key && value && !value.includes('|') && value.length > 0) {
        companyData[key] = value;
      }
    }
    
    // Pattern 2: Key: Value format (without asterisks, handle multi-line)
    const kvPattern2 = /^([A-Za-z][A-Za-z\s\/&]+):\s*([^\n]+(?:\n(?![A-Za-z][A-Za-z\s\/&]+:)[^\n]+)*)/gm;
    let match2;
    while ((match2 = kvPattern2.exec(sectionContent)) !== null) {
      const key = match2[1].trim();
      const value = match2[2].trim().replace(/\n/g, ' ');
      if (key && value && key.length < 50 && !value.includes('|') && !key.includes('#') && value.length > 0) {
        companyData[key] = value;
      }
    }
    
    // If we found company data, create a very compact two-column layout
    if (Object.keys(companyData).length > 0) {
      // Get all available fields and balance them across columns
      const allFields = Object.keys(companyData);
      const midpoint = Math.ceil(allFields.length / 2);
      const leftFields = allFields.slice(0, midpoint);
      const rightFields = allFields.slice(midpoint);
      
      let overviewHTML = `
        <div class="my-6 p-6 bg-white rounded-lg shadow-lg border-2 border-slate-300">
          <h2 class="text-xl font-bold mb-4" style="color: #1e293b;">
            Company Overview
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div class="space-y-3">
      `;
      
      // Left column
      leftFields.forEach(key => {
        if (companyData[key]) {
          overviewHTML += `
            <div class="flex flex-col">
              <span class="font-semibold mb-1" style="color: #374151;">${key}:</span>
              <span class="leading-relaxed" style="color: #4b5563;">${companyData[key]}</span>
            </div>
          `;
        }
      });
      
      overviewHTML += `
            </div>
            <div class="space-y-3">
      `;
      
      // Right column
      rightFields.forEach(key => {
        if (companyData[key]) {
          overviewHTML += `
            <div class="flex flex-col">
              <span class="font-semibold mb-1" style="color: #374151;">${key}:</span>
              <span class="leading-relaxed" style="color: #4b5563;">${companyData[key]}</span>
            </div>
          `;
        }
      });
      
      overviewHTML += `
            </div>
          </div>
        </div>
      `;
      return overviewHTML;
    }
    
    // Final fallback
    return sectionContent;
  });

  // Format remaining section headers
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

  html = html.replace(/#{1,3}\s*🎯\s*Bottom Line/gi, 
    `<h2 class="text-3xl font-bold mt-12 mb-8 text-yellow-700 dark:text-yellow-400 flex items-center gap-3 border-b-2 border-yellow-200 dark:border-yellow-700 pb-4">
      🎯 Bottom Line
    </h2>`);
    
  html = html.replace(/#{1,3}\s*💡\s*Portfolio Positioning/gi, 
    `<h2 class="text-3xl font-bold mt-12 mb-8 text-cyan-700 dark:text-cyan-400 flex items-center gap-3 border-b-2 border-cyan-200 dark:border-cyan-700 pb-4">
      💡 Portfolio Positioning Recommendation
    </h2>`);

  // Format any remaining h2 headers without emojis (catch-all for missed headers)
  html = html.replace(/#{2}\s*([^#\n🔋⚠️🎯🚀📈💡📊💰💪]+)/g, 
    `<h2 class="text-2xl font-bold mt-10 mb-6 text-gray-800 dark:text-gray-200">$1</h2>`);

  // Format subsection headers (h3 and h4)
  html = html.replace(/#{3}\s*([^#\n]+)/g, 
    `<h3 class="text-xl font-bold mt-8 mb-4 text-gray-800 dark:text-gray-200">$1</h3>`);
  html = html.replace(/#{4}\s*([^#\n]+)/g, 
    `<h4 class="text-lg font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">$1</h4>`);

  // Format tables with improved empty table handling
  html = html.replace(/\n\|([^\n]+)\|\n\|[\s:|-]+\|\n((?:\|[^\n]*\|\n?)*)/g, (match, headerLine, bodyLines) => {
    const headers = headerLine.split('|').filter(h => h.trim()).map(h => h.trim());
    const rawRows = bodyLines.trim().split('\n').filter(line => line.trim());
    const rows = rawRows.map(line => 
      line.split('|').filter(cell => cell.trim()).map(cell => cell.trim())
    );
    
    if (headers.length === 0) return match;
    
    let tableHtml = `
      <div class="overflow-x-auto my-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <table class="w-full border-collapse bg-white dark:bg-gray-800">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
    `;
    
    headers.forEach(header => {
      tableHtml += `<th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600 last:border-r-0">${header}</th>`;
    });
    
    tableHtml += `
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
    `;
    
    // If no data rows, create informational message
    if (rows.length === 0 || rows.every(row => row.length === 0)) {
      tableHtml += `<tr class="bg-white dark:bg-gray-800">`;
      tableHtml += `<td colspan="${headers.length}" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
        <div class="flex flex-col items-center gap-3">
          <span class="text-4xl">📊</span>
          <p class="text-lg font-medium">Data is being analyzed</p>
          <p class="text-sm">Information will be displayed here once available.</p>
        </div>
      </td>`;
      tableHtml += '</tr>';
    } else {
      rows.forEach((row, index) => {
        const bgClass = index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700';
        tableHtml += `<tr class="${bgClass} hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">`;
        
        // Ensure we have the right number of cells
        for (let i = 0; i < headers.length; i++) {
          const cell = row[i] || '-';
          let cellContent = cell.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          tableHtml += `<td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 last:border-r-0">${cellContent}</td>`;
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
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-gray-600 dark:text-gray-400">$1</em>');
  
  // Format bullet points
  html = html.replace(/^[-•]\s+(.+)$/gm, '<li class="mb-2 text-gray-700 dark:text-gray-300">$1</li>');
  
  // Group consecutive list items (remove list-disc to avoid double bullets)
  html = html.replace(/(<li[^>]*>.*?<\/li>[\s\n]*)+/gs, (match) => {
    return `<ul class="ml-6 mb-6 space-y-2">${match}</ul>`;
  });
  
  // Format checkboxes
  html = html.replace(/^\[\s*\]\s+(.+)$/gm, 
    '<div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-3"><input type="checkbox" disabled class="w-5 h-5" /> <span>$1</span></div>');
  html = html.replace(/^\[x\]\s+(.+)$/gim, 
    '<div class="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mb-3 border border-green-200 dark:border-green-700"><input type="checkbox" disabled checked class="w-5 h-5 text-green-600" /> <span class="font-medium">$1</span></div>');
  
  // Format paragraphs and catch any remaining unformatted text
  html = html.split('\n\n').map(paragraph => {
    paragraph = paragraph.trim();
    if (paragraph && 
        !paragraph.includes('<') && 
        !paragraph.startsWith('#') &&
        !paragraph.startsWith('|') &&
        !paragraph.startsWith('-') &&
        !paragraph.startsWith('•') &&
        paragraph.length > 3) {
      
      // Check if this looks like a section header (contains words like "Strengths", "Risks", etc.)
      if (/^(Strengths?|Risks?|Opportunities|Metrics?\s*[&]?\s*Benchmarks?|Scoring\s+Breakdown)[\s:]*$/i.test(paragraph)) {
        return `<h3 class="text-xl font-bold mt-8 mb-4 text-gray-800 dark:text-gray-200">${paragraph}</h3>`;
      }
      
      // Handle standalone "Bottom Line" text that might not have emoji
      if (/^Bottom\s+Line[\s:]*$/i.test(paragraph)) {
        return `<h3 class="text-xl font-bold mt-8 mb-4 text-gray-800 dark:text-gray-200">${paragraph}</h3>`;
      }
      
      return `<p class="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed">${paragraph}</p>`;
    }
    return paragraph;
  }).join('\n\n');
  
  // Handle line breaks
  html = html.replace(/([^>])\n([^<])/g, '$1<br>$2');
  
  // Clean up extra spacing
  html = html.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return `<div class="prose prose-base max-w-none text-gray-900 dark:text-gray-100">${scoreDisplay + html}</div>`;
};