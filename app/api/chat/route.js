// app/api/chat/route.js - Interactive chat endpoint for Q&A and report updates
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message, context, companyName, isUpdateRequest, systemPrompt, model } = await request.json();

    if (!message || !context || !companyName) {
      return NextResponse.json(
        { error: 'Message, context, and company name are required' },
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

    // Construct the appropriate prompt based on request type
    let fullPrompt;
    
    if (isUpdateRequest) {
      // This is a request to update the report with new information
      fullPrompt = `You are helping update a company resilience analysis report. The user has provided new information about ${companyName} and wants the report updated to incorporate this information.

IMPORTANT: You must provide a COMPLETE, FULLY UPDATED report that follows the exact same structure and format as the original report. Do not provide a summary or partial update - generate the full report with all sections.

Original report:
${context}

User's new information: ${message}

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
      // This is a question about the existing report
      fullPrompt = `You are analyzing a company resilience report for ${companyName}. Answer the user's question based on the report content provided.

Report content:
${context}

User question: ${message}

Provide a helpful, detailed answer based on the report content. Be specific and reference exact details from the report. If the question requires information not clearly stated in the report, mention that and suggest what additional analysis might be helpful.

Keep your response focused and conversational, as this is an interactive chat session.`;
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
        max_tokens: isUpdateRequest ? 8000 : 4000, // More tokens for full report updates
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
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Chat service temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}