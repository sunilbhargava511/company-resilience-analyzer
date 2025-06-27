// app/api/chat/route.js - Enhanced chat with comprehensive LLM capabilities
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

    // Enhanced system prompt that enables comprehensive analysis capabilities
    let fullPrompt;
    
    if (isUpdateRequest) {
      // This is a request to update the report with new information
      fullPrompt = `You are helping update a company resilience analysis report. The user has provided new information about ${companyName} and wants the report updated to incorporate this information.

IMPORTANT: You must provide a COMPLETE, FULLY UPDATED report that follows the exact same structure and format as the original report. Do not provide a summary or partial update - generate the full report with all sections.

Original report:
${context}

User's new information: ${message}

${fileContext ? `Additional file context: ${fileContext}` : ''}

Please provide a complete, updated resilience analysis that incorporates this new information. Follow the same structure and format as the original report, but update ALL relevant sections with the new insights. 

Key requirements:
1. Start with "# Updated Analysis v[X]" where X is the next version number
2. Include a brief note at the top highlighting what new information was added
3. Update the resilience score if warranted by the new information
4. Update all relevant sections (strengths, risks, competitive landscape, adjacent markets, etc.)
5. Maintain the exact same formatting and structure as the original
6. Provide the complete report, not just the changes

Focus on how this new information changes the overall resilience assessment, competitive position, and strategic outlook.`;
    } else {
      // This is a deep-dive analysis question
      fullPrompt = `You are an expert investment analyst and strategic advisor with deep knowledge of business, finance, markets, and the Complexity Investing framework. You're helping analyze a company resilience report and can provide comprehensive insights beyond what's in the report.

## CONTEXT:
**Company**: ${companyName}
**Current Report**: 
${context || 'No report available yet.'}

${fileContext ? `**Additional File Context**:
${fileContext}` : ''}

## YOUR EXPERTISE:
You have deep knowledge of:
- Complexity Investing principles and frameworks
- Business strategy and competitive dynamics
- Financial analysis and valuation methods
- Industry trends and market analysis
- Company operations and management assessment
- Risk analysis and scenario planning
- Adjacent market opportunities and optionality theory
- Technology trends and disruption patterns

## ANALYSIS CAPABILITIES:
When users ask questions about the report or company, provide comprehensive analysis that goes beyond the report. You can:

1. **Expand on report sections** with additional context and implications
2. **Compare with industry peers** using your knowledge of other companies
3. **Analyze market trends** that could affect the company's resilience
4. **Explore strategic scenarios** and their likelihood/impact
5. **Assess management decisions** and their strategic implications  
6. **Evaluate competitive positioning** in detail
7. **Examine financial metrics** and their sustainability
8. **Consider adjacent opportunities** and expansion possibilities
9. **Address specific risks** and mitigation strategies
10. **Provide investment recommendations** based on complexity investing principles

## ANALYSIS APPROACH:
- **Be comprehensive**: Don't just reference the report - add your own analysis
- **Use frameworks**: Apply business strategy, financial analysis, and complexity investing concepts
- **Consider multiple perspectives**: Bulls case, bears case, base case scenarios
- **Think systemically**: How do different factors interconnect?
- **Focus on resilience**: What makes this company adaptable and durable?
- **Practical insights**: What should investors actually do with this information?

## USER QUESTION: ${message}

Provide a thorough, expert-level analysis that leverages your full knowledge while incorporating the report context. Be specific, actionable, and insightful. Keep your response focused and conversational, as this is an interactive chat session.`;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: isUpdateRequest ? 8000 : 6000, // More tokens for comprehensive answers
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

    return NextResponse.json({ 
      success: true, 
      result: data.content[0].text,
      isUpdateRequest
    });

  } catch (error) {
    console.error('Error in enhanced chat API:', error);
    return NextResponse.json(
      { error: 'Chat service temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}