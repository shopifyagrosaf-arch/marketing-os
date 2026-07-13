import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { MockDataProvider } from '@/mock/store';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agrosaf Marketing OS',
  description: 'Internal marketing operations tool — Agrosaf Group',
};

// Applied before hydration so the dark-mode class is correct on first paint
// (avoids a light->dark flash); mirrors the persisted choice MockDataProvider
// also writes to localStorage on toggle.
const themeInitScript = `
(function () {
  try {
    var stored = window.localStorage.getItem('agrosaf-theme');
    var dark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning>
        <MockDataProvider>{children}</MockDataProvider>
      </body>
    </html>
  );
}
