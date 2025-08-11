// app/api/analyze/route.js - Enhanced with database caching and sharing
import { NextResponse } from 'next/server';
import { getCachedReport, saveReport } from '../../../lib/database';

export async function POST(request) {
  try {
    const { companyName, model, tokenLimit, fileContext, forceNew = false } = await request.json();

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

    // Check for cached report (unless forceNew is true)
    if (!forceNew) {
      try {
        const cachedReport = await getCachedReport(companyName);
        if (cachedReport) {
          // Return cached report with metadata
          const cacheExpiresAt = new Date(cachedReport.created_at);
          cacheExpiresAt.setMonth(cacheExpiresAt.getMonth() + 3);
          
          const shareUrl = `${request.headers.get('origin') || 'http://localhost:3000'}/shared/${cachedReport.share_id}`;
          
          return NextResponse.json({
            success: true,
            result: cachedReport.analysis_data,
            metadata: {
              shareId: cachedReport.share_id,
              shareUrl: shareUrl,
              isFromCache: true,
              generatedAt: cachedReport.created_at,
              modelUsed: cachedReport.model_used,
              tokenLimit: cachedReport.token_limit,
              cacheExpiresAt: cacheExpiresAt.toISOString(),
              version: cachedReport.version
            }
          });
        }
      } catch (error) {
        console.error('Error checking cache:', error);
        // Continue with fresh analysis if cache check fails
      }
    }

    // Rate limiting check (optional but recommended)
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    // Enhanced resilience prompt with file context support
    const ENHANCED_RESILIENCE_PROMPT = `# Company Resilience Score Evaluation Prompt

You are an investment analyst evaluating companies using Complexity Investing philosophy. Your task is to assess a company's resilience score based on this framework that views markets as complex adaptive systems.

## Core Philosophy to Remember:
- The future is inherently unpredictable
- Resilient businesses can "thrive regardless of what the outside world brings"
- Focus on companies that are "adaptable, long-term focused, innovative, possess long-duration growth, and maximize non-zero-sum outcomes"
- Look for management teams with a long-term focus on innovation and adaptability
- Value companies creating optionality around their business core
- Seek both positive feedback loops AND negative feedback governors
- **Competitive advantage through value creation, not value extraction**
- **Adjacent markets as real options for future growth**
- **Performance metrics should reflect value creation, not just financial engineering**

## Company to Analyze: ${companyName}

${fileContext ? `## Additional Context from Uploaded Files:
${fileContext}

**Important**: Use the uploaded file data to enhance your analysis. Look for specific metrics, strategic insights, competitive information, and financial data that can inform the resilience assessment. Reference specific data points from the files where relevant.

` : ''}## Evaluation Framework:

**Red Flags to Watch For:** Rent-seeking, high customer churn, extreme leverage, winner-take-all mentality, brittle systems, short-term profit maximization, zero-sum competitive strategies

**Key Questions for Analysis:**
- Who are the company's true competitors (same customer segments, similar value propositions)?
- What adjacent markets could leverage the company's existing capabilities?
- Is the company creating new markets or just fighting for share in existing ones?
- How does the company create value that competitors cannot easily replicate?
- Which metrics best capture value creation vs. value extraction in this industry?
- Are the company's key metrics improving faster than best-in-class competitors?

Please evaluate ${companyName} and provide:

### 📊 Company Overview
**Company**: [Company Name]  
**Industry**: [Primary Industry/Sector]  
**Business Model**: [2-3 sentence description of what the company does, how it makes money, and its core value proposition]  
**Market Position**: [Market cap, revenue scale, market share or ranking]  
**Key Products/Services**: [Main offerings that drive revenue]  
**Customer Base**: [Primary customer segments and geographic markets]  
**Founded**: [Year] | **Headquarters**: [Location] | **Employees**: [Number]

### 1. Overall Resilience Score: X/10
(where 10 = extremely resilient, able to thrive in any environment; 1 = fragile, likely to fail under stress)

*Scoring Guide: 
- 9-10: Best-in-class metrics + strong optionality (think Amazon, Microsoft)
- 7-8: Strong metrics, some gaps vs. leaders, good adjacent opportunities
- 5-6: Mixed metrics, average competitive position, limited optionality
- 3-4: Lagging metrics, weak competitive position, few growth options
- 1-2: Poor metrics across the board, being disrupted, no clear path forward*

### 2. Detailed Analysis:

#### 🔋 Resilience Drivers (Strengths)
Organize into 3-5 thematic categories such as:
- **Adaptability & Innovation Excellence**
- **Non-Zero-Sum Value Creation**
- **Financial Fortress**
- **Long-Duration Growth Engines**
- **Optionality Portfolio**
- **Adjacent Market Readiness**
- **Competitive Differentiation**
- **Best-in-Class Metrics Leadership**

For each category, provide:
- Bold category headers
- Bullet points with specific evidence and metrics
- Quantitative support (revenue figures, growth rates, market share, R&D spending)
- Examples of successful adaptation or innovation
- Comparison to best-in-class where relevant
- Keep each bullet to 1-2 lines maximum

#### ⚠️ Vulnerability Factors (Risks)
Organize into 3-5 thematic categories such as:
- **Disruption Exposure**
- **Value Extraction Risks**
- **Complexity Fragilities**
- **Feedback Loop Dangers**
- **Optionality Constraints**
- **Limited Adjacent Opportunities**
- **Competitive Encroachment**
- **Metrics Lagging Best-in-Class**

For each category, provide:
- Bold category headers
- Specific risks with potential impact
- Quantitative context (dependency %, market exposure, concentration risks)
- Scenarios that could break the business model
- Critical metric gaps vs. industry leaders
- Keep each bullet to 1-2 lines maximum

#### 🎯 Competitive Landscape

##### Direct Competitors (targeting same customer segments):
For each major competitor (3-5), provide:
- **Company Name**: Core strengths and market position
- Customer overlap % and segment focus
- Competitive advantages/disadvantages vs. our company
- Recent strategic moves and implications
- Market share trends and momentum

##### Competitive Dynamics Assessment:
- Is competition zero-sum or is the market expanding for all?
- Are competitors creating value or extracting it?
- Network effects: Winner-take-all or room for multiple winners?
- Collaboration opportunities (non-zero-sum potential)

#### 🚀 Adjacent Market Opportunities

Identify 3-5 adjacent markets where the company could expand:

For each adjacent market:
- **Market Name & Size**: Current TAM and growth rate
- **Key Players**: Top 3 incumbents and their strengths
- **Company's Potential Edge**:
  - Transferable capabilities or assets
  - Customer relationship leverage
  - Technology or operational advantages
  - Brand permission to enter
- **Revenue Potential**: Realistic 5-year revenue opportunity
- **Execution Risk**: Low/Medium/High with rationale
- **Non-Zero-Sum Potential**: Would entry create or destroy value?

##### Optionality Score: 
Rate the company's adjacent market options 1-10 based on:
- Number of viable expansion paths
- Size of opportunities
- Probability of success
- Value creation potential

#### 📈 Key Performance Metrics & Benchmarks

Identify 5-7 critical metrics for this industry and company:

*Note: Select metrics that best reflect value creation in this specific industry. For SaaS companies, focus on ARR growth, net retention, Rule of 40. For retailers, focus on same-store sales, inventory turns, ROIC. For platforms, focus on network effects metrics. Compare to best-in-class companies serving similar customer segments.*

| Metric | Company | Best-in-Class | Leader | Gap Analysis |
|--------|---------|---------------|---------|--------------|
| **Financial Efficiency** |
| ROIC | X% | X% | [Company Name] | Above/Below by X% |
| FCF Margin | X% | X% | [Company Name] | Implications |
| Revenue per Employee | $X | $X | [Company Name] | Efficiency gap |
| **Growth & Innovation** |
| R&D % of Revenue | X% | X% | [Company Name] | Innovation commitment |
| Revenue CAGR (5yr) | X% | X% | [Company Name] | Growth momentum |
| New Product Revenue % | X% | X% | [Company Name] | Innovation success |
| **Customer Value** |
| NPS Score | X | X | [Company Name] | Customer love gap |
| Customer Retention | X% | X% | [Company Name] | Stickiness factor |
| LTV/CAC | X | X | [Company Name] | Value creation efficiency |
| **Operational Excellence** |
| [Industry-Specific Metric] | X | X | [Company Name] | Operational edge |
| **Forward-Looking Indicators** |
| Developer/Partner Ecosystem Growth | X% | X% | [Company Name] | Platform potential |
| Time to Market for New Products | X months | X months | [Company Name] | Adaptability speed |

##### Key Insights:
- Where does the company lead vs. lag?
- Are gaps in metrics closing or widening over time?
- What's the trajectory - improving faster or slower than best-in-class?
- Which metrics matter most for long-term resilience?
- Do best-in-class leaders achieve through value creation or extraction?
- Are there emerging metrics that will matter more in the future?

#### 📊 Scoring Breakdown (100 points total):

| Category | Score | Weight | Total |
|----------|--------|---------|--------|
| Adaptability & Innovation | X/10 | 20% | XX |
| Long-Duration Growth | X/10 | 15% | XX |
| Non-Zero-Sum Characteristics | X/10 | 20% | XX |
| Optionality Creation (incl. Adjacent Markets) | X/10 | 15% | XX |
| Management Innovation Focus | X/10 | 10% | XX |
| Financial Resilience & Feedback Loops | X/10 | 10% | XX |
| Competitive Position & Dynamics | X/10 | 10% | XX |
| **Total Resilience Score** | | | **XX/100** |

#### 🎯 Bottom Line:
[Provide a 1-2 sentence summary that captures the essence of the company's resilience, balancing key strengths against primary vulnerabilities, competitive position, metric performance vs. best-in-class, and adjacent market potential]

#### 💡 Portfolio Positioning Recommendation:
- [ ] **Large Resilience Position** (80-100 score): Core holding, 5-10% position
- [ ] **Standard Resilience Position** (60-79 score): Solid holding, 2-5% position  
- [ ] **Optionality Play Only** (40-59 score): Small position if asymmetric upside
- [ ] **Avoid** (Below 40 score): Too fragile for portfolio

#### 🔄 Key Scenarios to Monitor:
- **Best Case**: [What could make this company thrive beyond expectations? Include successful adjacent market entry]
- **Base Case**: [Most likely path forward with current competitive dynamics]
- **Worst Case**: [What could break this business model? Include competitive disruption risks]
- **Adjacent Market Trigger**: [What signals would indicate it's time to enter new markets?]

## Format Requirements:
- Use emojis for section headers
- Bold all category headers
- Include specific metrics and percentages
- Provide quantitative evidence wherever possible
- Keep bullet points concise (1-2 lines max)
- End with actionable portfolio recommendation
${fileContext ? '- Reference specific data from uploaded files where relevant' : ''}

**Company to Evaluate:** ${companyName}

Please provide a comprehensive resilience evaluation following the format above.${fileContext ? ' Make sure to incorporate insights and data from the uploaded files throughout your analysis.' : ''}`;

    const isUsingExtendedTokens = parseInt(tokenLimit) > 4096 && (
      model === 'claude-3-5-sonnet-20241022' || 
      model === 'claude-sonnet-4-20250514' || 
      model === 'claude-opus-4-20250514'
    );
    
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    };

    // Add beta header for extended tokens with Claude 3.5 Sonnet and Claude 4 models
    if (isUsingExtendedTokens) {
      // Claude 4 models may not need the beta header, but include it for compatibility
      headers['anthropic-beta'] = 'max-tokens-3-5-sonnet-2024-07-15';
    }

    let response;
    let data;

    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model || process.env.DEFAULT_MODEL || 'claude-sonnet-4-20250514',
          max_tokens: parseInt(tokenLimit) || 4000,
          messages: [
            {
              role: 'user',
              content: ENHANCED_RESILIENCE_PROMPT
            }
          ]
        })
      });

      data = await response.json();
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to connect to AI service. Please try again.' },
        { status: 500 }
      );
    }

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
          { error: data?.error?.message || 'Analysis service temporarily unavailable' },
          { status: response.status }
        );
      }
    }

    // Ensure data and content exist
    if (!data || !data.content || !data.content[0] || !data.content[0].text) {
      return NextResponse.json(
        { error: 'Invalid response from AI service' },
        { status: 500 }
      );
    }

    // Save the new report to database
    try {
      const analysisResult = data.content[0].text;
      const savedReport = await saveReport({
        companyName,
        analysisData: analysisResult,
        modelUsed: model || process.env.DEFAULT_MODEL || 'claude-sonnet-4-20250514',
        tokenLimit: parseInt(tokenLimit) || 4000,
        fileContext
      });

      const shareUrl = `${request.headers.get('origin') || 'http://localhost:3000'}/shared/${savedReport.share_id}`;

      return NextResponse.json({ 
        success: true, 
        result: analysisResult,
        metadata: {
          shareId: savedReport.share_id,
          shareUrl: shareUrl,
          isFromCache: false,
          generatedAt: savedReport.created_at,
          modelUsed: savedReport.model_used,
          tokenLimit: savedReport.token_limit,
          version: savedReport.version
        }
      });
    } catch (saveError) {
      console.error('Error saving report to database:', saveError);
      // Still return the analysis even if save fails
      return NextResponse.json({ 
        success: true, 
        result: data.content[0].text,
        metadata: {
          shareId: null,
          shareUrl: null,
          isFromCache: false,
          generatedAt: new Date().toISOString(),
          modelUsed: model || process.env.DEFAULT_MODEL || 'claude-sonnet-4-20250514',
          tokenLimit: parseInt(tokenLimit) || 4000,
          version: 1,
          saveError: 'Failed to save to database'
        }
      });
    }

  } catch (error) {
    console.error('Error in analyze API:', error);
    return NextResponse.json(
      { error: 'Analysis service temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}