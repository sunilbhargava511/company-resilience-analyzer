// app/api/analyze/route.js - Enhanced with file context support
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { companyName, model, tokenLimit, fileContext } = await request.json();

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
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

    // Validate token limit based on model
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
      return NextResponse.json(
        { error: `Maximum ${maxTokensForModel} tokens supported for ${model}. Please reduce token limit.` },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      result: data.content[0].text 
    });

  } catch (error) {
    console.error('Error in analyze API:', error);
    return NextResponse.json(
      { error: 'Analysis service temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}