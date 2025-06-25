import './globals.css';

export const metadata = {
  title: 'Company Resilience Analyzer | NZS Capital Framework',
  description: 'Advanced company resilience evaluation using NZS Capital\'s Complexity Investing framework. Assess adaptability, optionality, and long-term value creation with AI-powered institutional-grade analysis.',
  keywords: ['company resilience', 'complexity investing', 'NZS Capital', 'resilience scoring', 'investment analysis', 'adaptability assessment', 'optionality evaluation', 'adjacent markets', 'strategic analysis'],
  authors: [{ name: 'Company Resilience Analyzer' }],
  openGraph: {
    title: 'Company Resilience Analyzer | NZS Capital Framework',
    description: 'Advanced company resilience evaluation using complexity investing principles',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {children}
      </body>
    </html>
  );
}