import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { apiKey, companyName, model, tokenLimit } = await request.json();

    if (!apiKey || !companyName) {
      return NextResponse.json(
        { error: 'API key and company name are required' },
        { status: 400 }
      );
    }

    const ENHANCED_RESILIENCE_PROMPT = `# Company Analysis & Resilience Evaluation

You are a senior investment analyst conducting a comprehensive analysis of companies using modern complexity investing principles. Your task is to provide a thorough, research-backed evaluation that assesses both current performance and long-term resilience.

## Analysis Framework:
- **Current Performance**: Financial metrics, market position, competitive advantages
- **Resilience Factors**: Adaptability, innovation capacity, long-term value creation
- **Future Optionality**: Adjacent markets, growth vectors, strategic positioning
- **Risk Assessment**: Vulnerabilities, competitive threats, disruption potential

## Company to Analyze: ${companyName}

Please provide a comprehensive analysis following this structure:

### 📊 **Company Overview**
**Company**: [Company Name]  
**Industry**: [Primary Industry/Sector]  
**Business Model**: [2-3 sentence description of how the company creates and captures value]  
**Market Position**: [Market cap, revenue scale, competitive ranking]  
**Key Revenue Drivers**: [Primary products/services generating revenue]  
**Geographic Footprint**: [Key markets and international presence]  
**Founded**: [Year] | **Headquarters**: [Location] | **Employees**: [Approximate count]

### 🏆 **Overall Resilience Score: X/10**

*Brief justification for the score in 2-3 sentences*

### 📈 **Financial Performance & Market Position**

#### **Recent Financial Highlights**
- Revenue trends and growth trajectory
- Profitability metrics and improvements
- Key performance indicators and record achievements
- Market share evolution and competitive position
- Financial resilience indicators (cash flow, debt levels, etc.)

#### **Market Dominance & Competitive Advantages**
- Market share data and positioning vs competitors
- Unique value propositions and competitive moats
- Customer loyalty and retention metrics
- Pricing power and brand strength
- Geographic or segment leadership positions

### 🚀 **Strategic Initiatives & Growth Drivers**

#### **Recent Strategic Moves**
- Major acquisitions, partnerships, or expansions
- New product launches or market entries
- Technology investments and innovation initiatives
- International expansion efforts
- Strategic repositioning or business model evolution

#### **Innovation & Technology Focus**
- R&D investments and innovation pipeline
- Technology advantages and capabilities
- Digital transformation initiatives
- Operational excellence improvements
- Intellectual property and patents

### ⚔️ **Competitive Landscape & Market Dynamics**

#### **Direct Competitors**
For each major competitor (3-5 companies):
- **[Competitor Name]**: Market position, strengths/weaknesses vs analyzed company
- Competitive dynamics and market share trends
- Differentiation factors and unique positioning
- Recent strategic moves affecting competition

#### **Competitive Threats & Opportunities**
- Emerging competitors or disruptive technologies
- Market consolidation trends
- Regulatory changes affecting competition
- New market entrants or business model innovations
- Collaborative opportunities vs zero-sum competition

### 🎯 **Adjacent Markets & Growth Optionality**

#### **Expansion Opportunities**
Identify 3-5 adjacent markets or growth vectors:

**[Market/Opportunity Name]**
- **Market Size**: Current TAM and growth projections
- **Strategic Rationale**: Why this makes sense for the company
- **Competitive Landscape**: Key players and entry barriers
- **Company Advantages**: Transferable assets, capabilities, or relationships
- **Revenue Potential**: Realistic timeline and scale
- **Execution Risk**: Assessment of implementation challenges

#### **Future Optionality Score: X/10**
*Brief assessment of the company's expansion options and strategic flexibility*

### ⚠️ **Risk Factors & Vulnerabilities**

#### **Key Risk Categories**
- **Market/Competitive Risks**: Share loss, pricing pressure, new entrants
- **Operational Risks**: Supply chain, regulatory, execution challenges
- **Financial Risks**: Debt levels, cash flow volatility, capital requirements
- **Technology/Disruption Risks**: Obsolescence threats, innovation gaps
- **Management/Governance Risks**: Leadership changes, strategic missteps

#### **Scenario Analysis**
- **Worst Case**: Key threats that could significantly impact the business
- **Most Likely**: Expected trajectory based on current trends
- **Best Case**: Upside scenarios from successful execution or market expansion

### 📊 **Key Performance Benchmarks**

| Metric Category | ${companyName} | Industry Best | Gap Analysis |
|-----------------|---------------|---------------|--------------|
| **Financial Efficiency** |
| Revenue Growth (5yr CAGR) | X% | X% | [Assessment] |
| Profit Margins | X% | X% | [Assessment] |
| Return on Capital | X% | X% | [Assessment] |
| **Market Position** |
| Market Share | X% | X% | [Assessment] |
| Customer Satisfaction | X | X | [Assessment] |
| Brand Value/Recognition | [Rating] | [Rating] | [Assessment] |
| **Innovation & Growth** |
| R&D as % of Revenue | X% | X% | [Assessment] |
| New Product Revenue % | X% | X% | [Assessment] |
| Time to Market | X months | X months | [Assessment] |

### 💡 **Investment Thesis & Recommendation**

#### **Key Strengths Summary**
- Primary competitive advantages and market position
- Financial performance and operational excellence
- Strategic positioning for future growth
- Management quality and execution track record

#### **Primary Concerns**
- Key vulnerabilities and risk factors
- Competitive pressures and market challenges
- Execution risks for growth initiatives
- Valuation concerns or market headwinds

#### **Bottom Line Assessment**
[Provide a comprehensive 2-3 sentence summary that captures the investment thesis, balancing growth potential against key risks, competitive position, and long-term resilience factors]

#### **Portfolio Positioning Recommendation**
- [ ] **Large Position** (8-10 resilience score): Core holding for growth/stability
- [ ] **Standard Position** (6-7 resilience score): Solid addition with some limitations  
- [ ] **Small Position** (4-5 resilience score): Speculative play with upside potential
- [ ] **Avoid** (Below 4): Too many risks or structural challenges

### 🔮 **Key Catalysts & Monitoring Points**

**Positive Catalysts to Watch:**
- Market expansion opportunities or regulatory changes
- Product launches or technology breakthroughs
- Strategic partnerships or acquisition targets
- Operational improvements or cost optimization

**Warning Signs to Monitor:**
- Market share loss or competitive pressure
- Execution failures or missed guidance
- Regulatory headwinds or legal challenges
- Management changes or strategic pivots

---

## Formatting Guidelines:
- Use clear section headers with emojis
- Include specific metrics, percentages, and quantitative data
- Provide concrete examples and recent developments
- Keep analysis balanced between bullish and bearish factors
- Focus on actionable insights for investment decisions
- Compare to industry leaders and best practices
- Include forward-looking perspective on trends and opportunities

**Target Company**: ${companyName}

Please conduct a thorough analysis following this framework, providing specific data and insights that would inform an investment decision.`;

    const isUsingExtendedTokens = parseInt(tokenLimit) > 4096 && model === 'claude-3-5-sonnet-20241022';
    
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    };

    // Add beta header for extended tokens with Claude 3.5 Sonnet
    if (isUsingExtendedTokens) {
      headers['anthropic-beta'] = 'max-tokens-3-5-sonnet-2024-07-15';
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: parseInt(tokenLimit) || 4000,
        messages: [
          {
            role: 'user',
            content: ENHANCED_RESILIENCE_PROMPT
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your Anthropic API key.' },
          { status: 401 }
        );
      } else if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      } else {
        return NextResponse.json(
          { error: data.error?.message || 'Failed to analyze company' },
          { status: response.status }
        );
      }
    }

    return NextResponse.json({ 
      success: true, 
      result: data.content[0].text 
    });

  } catch (error) {
    console.error('Error in analyze API:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}