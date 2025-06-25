import './globals.css';

export const metadata = {
  title: 'Company Resilience Analyzer',
  description: 'Evaluate companies using NZS Capital\'s complexity investing philosophy',
  keywords: ['investment analysis', 'company evaluation', 'resilience scoring', 'complexity investing'],
  authors: [{ name: 'Company Resilience Analyzer' }],
  viewport: 'width=device-width, initial-scale=1',
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