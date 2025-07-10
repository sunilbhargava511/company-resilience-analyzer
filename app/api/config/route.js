// app/api/config/route.js - Returns configuration from environment variables
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get default model from environment variable
    // Fallback to Claude Sonnet 4 if not set
    const defaultModel = process.env.DEFAULT_MODEL || 'claude-sonnet-4-20250514';
    
    // You can add more configuration options here in the future
    const config = {
      defaultModel,
      // Example of other config options:
      // maxTokenLimit: process.env.MAX_TOKEN_LIMIT || '8000',
      // enabledModels: process.env.ENABLED_MODELS?.split(',') || [],
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error in config API:', error);
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    );
  }
}
