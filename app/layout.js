import './globals.css';

export const metadata = {
  title: 'Investment Analysis Platform',
  description: 'Professional-grade company analysis powered by advanced AI. Generate comprehensive investment insights, competitive intelligence, and strategic assessments.',
  keywords: ['investment analysis', 'company evaluation', 'AI analysis', 'resilience scoring', 'market intelligence'],
  authors: [{ name: 'Investment Analysis Platform' }],
  openGraph: {
    title: 'Investment Analysis Platform',
    description: 'Professional-grade company analysis powered by advanced AI',
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