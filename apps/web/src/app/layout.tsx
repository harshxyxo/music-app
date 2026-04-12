import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import GlobalKeyboardListener from '@/components/GlobalKeyboardListener';
import MainFocusListener from '@/components/MainFocusListener';
import ClientLayout from '@/components/ClientLayout';
import AuthListener from '@/components/AuthListener';

export const metadata: Metadata = {
  title: 'Groovra | Premium Audio',
  description: 'Next generation music streaming',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden flex items-center justify-center p-5 bg-[#0a0a0c]">
        <Providers>
          <AuthListener />
          <GlobalKeyboardListener />
          <MainFocusListener />
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
