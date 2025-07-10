# Company Resilience Analyzer

An advanced AI-powered platform for evaluating company resilience using the Complexity Investing framework. Analyze adaptability, optionality, and long-term value creation with institutional-grade insights.

## Features

- 🧠 **AI-Powered Analysis**: Leverages Claude AI models for comprehensive resilience evaluation
- 🔍 **Real-Time Web Search**: Get current market data and live updates
- 💬 **Interactive Q&A**: Ask questions and refine analysis with follow-up queries
- 📊 **Comprehensive Reports**: Detailed resilience scoring with actionable insights
- 📎 **File Upload Support**: Upload spreadsheets and documents for enhanced context
- 🔄 **Dynamic Updates**: Update reports with new information and market developments

## Model Selection

The app supports multiple Claude AI models with different capabilities:

- **Claude Sonnet 4** (Default) - Latest model with best performance
- **Claude Opus 4** - Most powerful model for complex analysis
- **Claude 3.5 Sonnet** - Excellent balance of intelligence and speed
- **Claude 3 Opus** - High intelligence for detailed analysis
- **Claude 3 Sonnet** - Good performance/cost balance
- **Claude 3 Haiku** - Fastest and most cost-effective

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd company-resilience-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
npm run setup
# or manually: cp .env.example .env.local
```

4. Edit `.env.local` and add your Anthropic API key:
```env
# Required
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional - Set default model (defaults to Claude Sonnet 4)
DEFAULT_MODEL=claude-sonnet-4-20250514
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | - | Yes |
| `DEFAULT_MODEL` | Default AI model to use | `claude-sonnet-4-20250514` | No |

### Available Model IDs

- `claude-sonnet-4-20250514` - Claude Sonnet 4 (Latest)
- `claude-opus-4-20250514` - Claude Opus 4 (Premium)
- `claude-3-5-sonnet-20241022` - Claude 3.5 Sonnet
- `claude-3-opus-20240229` - Claude 3 Opus
- `claude-3-sonnet-20240229` - Claude 3 Sonnet
- `claude-3-haiku-20240307` - Claude 3 Haiku

## Usage

1. **Enter Company Name**: Type the company you want to analyze
2. **Select Analysis Depth**: Choose between Quick, Comprehensive, or Maximum depth analysis
3. **Upload Files** (Optional): Add spreadsheets or documents for additional context
4. **Choose AI Model** (Optional): Select from available Claude models in Advanced Settings
5. **Generate Analysis**: Click to create the resilience report
6. **Ask Questions**: Use the interactive chat to explore insights and get updates

## Complexity Investing Framework

The analysis evaluates companies based on:

- **Adaptability & Innovation** (20%)
- **Non-Zero-Sum Characteristics** (20%)
- **Long-Duration Growth** (15%)
- **Optionality Creation** (15%)
- **Management Innovation Focus** (10%)
- **Financial Resilience** (10%)
- **Competitive Position** (10%)

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **AI**: Claude AI API (multiple models)
- **Features**: Real-time web search, file processing, interactive chat
- **Styling**: Modern glassmorphism design with animations

## Deployment

The app is configured for deployment on Vercel:

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## License

[Your License Here]

## Support

For issues or questions, please open a GitHub issue or contact support.
