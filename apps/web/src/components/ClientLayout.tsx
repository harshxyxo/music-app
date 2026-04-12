'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import BottomPlayer from './BottomPlayer';
import PageTransition from './PageTransition';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const isAuthPage = pathname === '/auth';

  useEffect(() => {
    setMounted(true);
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated && !isAuthPage) {
      router.push('/auth');
    }
  }, [pathname, isAuthPage, router]);

  if (!mounted) return null;

  if (isAuthPage) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0c]">
        {children}
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] h-[calc(100vh-60px)] md:glass-pane md:rounded-[40px] flex overflow-hidden relative border-none md:border md:border-white/10 md:shadow-2xl">
      <Sidebar />
      <main id="MAIN_CONTENT_AREA" className="flex-1 w-full max-w-full overflow-x-hidden overflow-y-auto relative bg-[#0a0a0c] md:bg-black/20">
        <PageTransition>{children}</PageTransition>
      </main>
      <RightSidebar />
      <BottomPlayer />
    </div>
  );
}
