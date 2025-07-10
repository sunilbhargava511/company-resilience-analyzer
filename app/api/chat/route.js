// app/api/chat/route.js - Enhanced chat with Claude's built-in web search capabilities
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message, context, companyName, isUpdateRequest, model, fileContext } = await request.json();

    if (!message || !companyName) {
      return NextResponse.json(
        { error: 'Message and company name are required' },
        { status: 400 }
      );
    }

    // Use server-side environment variable for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // Rate limiting check (optional but recommended)
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Enhanced system prompt that instructs Claude to use web search when appropriate
    let fullPrompt;
    
    if (isUpdateRequest) {
      // This is a request to update the report with new information
      fullPrompt = `You are helping update a company resilience analysis report with the most current information available.

IMPORTANT: You must provide a COMPLETE, FULLY UPDATED report that follows the exact same structure and format as the original report. Do not provide a summary or partial update - generate the full report with all sections.

**CRITICAL INSTRUCTION: You have access to web search tools. Please search for the latest information about ${companyName} before updating the report. Search for:**
- Recent financial performance and earnings (last 6 months)
- Latest strategic developments and news
- Current competitive landscape changes  
- Recent market trends affecting the company
- Any major announcements or events in the past 6 months
- Recent analyst reports or market sentiment changes

Original report:
${context}

User's new information: ${message}

${fileContext ? `Additional file context: ${fileContext}` : ''}

**PROCESS:**
1. FIRST: Use web search to gather current information about ${companyName}
2. THEN: Analyze how this new information changes the resilience assessment
3. FINALLY: Provide a complete updated report incorporating all findings

Key requirements:
1. Start with "# Updated Analysis v[X]" where X is the next version number
2. Include a brief note at the top highlighting what new information was found through web search
3. Update the resilience score if warranted by the new information
4. Update all relevant sections (strengths, risks, competitive landscape, adjacent markets, etc.)
5. Maintain the exact same formatting and structure as the original
6. Provide the complete report, not just the changes
7. Include citations or references to new information sources when possible

Focus on how this new information changes the overall resilience assessment, competitive position, and strategic outlook.`;
    } else {
      // This is a deep-dive analysis question
      fullPrompt = `You are an expert investment analyst and strategic advisor with deep knowledge of business, finance, markets, and the Complexity Investing framework. You're helping analyze a company resilience report and can provide comprehensive insights that go far beyond what's in the report.

## CONTEXT:
**Company**: ${companyName}
**Current Report**: 
${context || 'No report available yet.'}

${fileContext ? `**Additional File Context**:
${fileContext}` : ''}

## YOUR ENHANCED CAPABILITIES:
You have comprehensive business knowledge AND web search access. When users ask questions that would benefit from current data, please search for:

1. **Recent Financial Performance** - Latest earnings, revenue trends, financial metrics, stock performance
2. **Current Market Developments** - Recent news, strategic moves, market position changes
3. **Competitive Intelligence** - Recent competitor actions, market share changes, industry dynamics
4. **Industry Trends** - Current trends affecting the company's sector or business model
5. **Regulatory/Policy Changes** - Recent regulatory developments affecting the company
6. **Strategic Developments** - Recent partnerships, acquisitions, product launches, expansions
7. **Market Sentiment** - Recent analyst reports, upgrades/downgrades, investor sentiment
8. **Economic Factors** - Current economic conditions affecting the business

## WHEN TO USE WEB SEARCH:
Please search when the user asks about:
- "Recent", "latest", "current", "today", "this year", or time-specific queries
- Financial performance, earnings, stock price, market cap, valuation
- Competitive comparisons ("vs", "compared to", "better than", "versus")
- Industry trends or market developments
- News, announcements, or recent events
- Performance metrics or business updates
- "Search for", "look up", "find out", "what's happening"

## USER QUESTION: ${message}

## ANALYSIS APPROACH:
1. **Assess if web search is needed** - Does this question require current information?
2. **If yes, search strategically** - Use web search to gather relevant current data about ${companyName}
3. **Synthesize information** - Combine search results with existing knowledge and report data
4. **Provide comprehensive analysis** - Give detailed, expert-level insights

**ANALYSIS CAPABILITIES:**
When you have current information, provide comprehensive analysis including:
- **Expand on report sections** with current context and implications
- **Compare with industry peers** using latest data and competitive intelligence
- **Analyze market trends** that could affect the company's resilience
- **Explore strategic scenarios** with current market conditions
- **Assess management decisions** and their recent strategic implications  
- **Evaluate competitive positioning** with latest market data
- **Examine financial metrics** and their recent trends and sustainability
- **Consider adjacent opportunities** and recent market expansion possibilities
- **Address specific risks** and recent mitigation strategies or new threats
- **Provide investment recommendations** based on current complexity investing principles

**IMPORTANT**: 
- If you use web search, clearly indicate what current information you found and how it impacts your analysis
- Provide specific examples and data from your search results
- Be comprehensive but focused - don't just reference the report, add substantial new analysis
- Use current data to enhance and update insights
- Think systemically about how recent developments interconnect
- Focus on resilience implications of current developments

Provide thorough, expert-level analysis that leverages your full knowledge while incorporating current market information. Be specific, actionable, and insightful. Keep your response focused and conversational, as this is an interactive chat session.`;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || process.env.DEFAULT_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: isUpdateRequest ? 8000 : 7000, // More tokens for comprehensive answers
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'API authentication failed. Please contact support.' },
          { status: 500 }
        );
      } else if (response.status === 429) {
        return NextResponse.json(
          { error: 'Service temporarily busy. Please try again in a moment.' },
          { status: 429 }
        );
      } else {
        return NextResponse.json(
          { error: data.error?.message || 'Chat service temporarily unavailable' },
          { status: response.status }
        );
      }
    }

    // Extract the response and check for web search usage
    let finalResponse = '';
    let usedWebSearch = false;
    let searchSummary = '';

    if (data.content && data.content.length > 0) {
      finalResponse = data.content[0].text || '';
      
      // Check if the response indicates web search was used
      const searchIndicators = [
        'I searched for', 'I found through web search', 'According to recent search results',
        'Based on current web search', 'Recent search results show', 'I looked up',
        'Current information shows', 'Latest search results indicate', 'web search reveals',
        'I found current information', 'searching for recent', 'latest data shows',
        'current data indicates', 'recent information shows', 'I discovered through search'
      ];
      
      usedWebSearch = searchIndicators.some(indicator => 
        finalResponse.toLowerCase().includes(indicator.toLowerCase())
      );
      
      if (usedWebSearch) {
        searchSummary = `Searched for current information about ${companyName}`;
      }
    }

    return NextResponse.json({ 
      success: true, 
      result: finalResponse || 'Analysis completed successfully.',
      isUpdateRequest,
      usedWebSearch,
      searchSummary: usedWebSearch ? searchSummary : null
    });

  } catch (error) {
    console.error('Error in enhanced chat API:', error);
    return NextResponse.json(
      { error: 'Chat service temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}