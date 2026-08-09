import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '5G/6G Cross-Layer Security Framework',
  description: 'Adaptive Cross-Layer Security Framework for 5G/6G Network Slicing using Reinforcement Learning',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-network-dark text-gray-100 min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
