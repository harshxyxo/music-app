'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
// @ts-ignore
import { Home, Search, Library, User } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Albums', href: '/albums', icon: Library },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-md border-t border-white/10 flex justify-around items-center p-3 z-50 md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 w-16 transition-colors ${isActive ? 'text-white' : 'text-white/40 hover:text-white'}`}
          >
            {/* @ts-ignore */}
            <Icon className={`w-6 h-6 ${isActive ? 'text-[#ba9eff]' : ''}`} />
            <span className="text-[10px] font-bold tracking-widest">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
