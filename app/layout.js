import './globals.css';

export const metadata = {
  title: 'Investment Analysis Platform',
  description: 'Professional-grade company analysis powered by advanced AI',
  keywords: ['investment analysis', 'company evaluation', 'AI analysis'],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}