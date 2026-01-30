// src/app/layout.tsx
'use client';

import './globals.css';
import { Inter, Lora } from 'next/font/google';
import Sidebar from './components/Sidebar';
import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { ThemeProvider } from './providers';
import { usePathname } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import UserDropdown from './components/UserDropdown';
import ThemeToggle from './components/ThemeToggle';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lora = Lora({ subsets: ['latin'], variable: '--font-lora' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const supabase = createClient();

  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    setMounted(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (!mounted) {
    return (
      <html lang="de">
        <body></body>
      </html>
    );
  }

  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex h-screen overflow-hidden transition-colors duration-500`}>
        <ThemeProvider>
          {/* Animated Background Blobs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 dark:bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 dark:bg-indigo-600/5 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
          </div>

          {!isAuthPage && user ? (
            <>
              <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

              <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="h-20 glass border-b border-white/10 flex items-center px-6 sm:px-12 justify-between shrink-0 z-20">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="lg:hidden p-3 -ml-2 text-gray-500 hover:bg-white/10 rounded-2xl transition-all"
                    >
                      <Menu size={24} />
                    </button>
                    <h2 className={`${lora.className} text-xl font-bold text-gray-900 dark:text-white tracking-tight italic`}>
                      {pathname === '/' ? 'Dashboard' :
                        pathname === '/applications' ? 'Bewerbungen' :
                          pathname === '/calendar' ? 'Kalender' :
                            pathname === '/settings' ? 'Einstellungen' :
                              pathname === '/add' ? 'Job hinzufügen' :
                                pathname.slice(1).charAt(0).toUpperCase() + pathname.slice(2)}
                    </h2>
                  </div>

                  <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <UserDropdown user={user} />
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-12">
                  {children}
                </div>
              </main>
            </>
          ) : (
            <div className="w-full h-full overflow-y-auto relative">
              {children}
            </div>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}