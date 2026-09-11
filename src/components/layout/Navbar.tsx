'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BookOpen, 
  RotateCw, 
  Plus, 
  LogOut, 
  Menu, 
  X,
  LayoutDashboard,
  Map,
  BookMarked,
  BarChart2,
  Settings
} from 'lucide-react';

export const Navbar: React.FC<{ username?: string }> = ({ username = 'Irsyad' }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Jangan tampilkan Navbar di halaman login
  if (pathname === '/login') {
    return null;
  }

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
      setLoggingOut(false);
    }
  };

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/notes', label: 'Catatan', icon: BookOpen },
    { href: '/review', label: 'Flashcard', icon: RotateCw },
    { href: '/roadmap', label: 'Roadmap', icon: Map },
    { href: '/journal', label: 'Jurnal', icon: BookMarked },
    { href: '/stats', label: 'Statistik', icon: BarChart2 },
    { href: '/settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-sm shadow-orange-500/30 group-hover:scale-105 transition-transform">
              <RotateCw className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-1">
                LearnLoop
                <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-semibold">
                  v1
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium active:scale-95 transition-all ${
                    isActive
                      ? 'bg-stone-100 dark:bg-stone-800 text-orange-600 dark:text-orange-400 font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/notes/new"
            prefetch={true}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Catatan Baru</span>
          </Link>

          <div className="h-5 w-px bg-stone-200 dark:bg-stone-800 my-auto" />

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 pl-1">
            <span className="font-medium text-stone-800 dark:text-stone-200">@{username}</span>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Keluar"
              className="p-2 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/notes/new"
            prefetch={true}
            className="p-2 rounded-lg bg-orange-500 text-white shadow-sm active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 py-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-semibold'
                    : 'text-stone-700 dark:text-stone-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
              Masuk sebagai <strong className="text-stone-900 dark:text-stone-100">@{username}</strong>
            </span>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 font-medium py-1 px-2.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
