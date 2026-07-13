import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@agrosaf/ui/tokens.css';

export const metadata: Metadata = {
  title: 'Agrosaf Marketing OS',
  description: 'AI Marketing Content Operating System — Agrosaf Group',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
