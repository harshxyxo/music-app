'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from './Toast';

export default function Providers({ children }: { children: any }) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </SessionProvider>
  );
}
