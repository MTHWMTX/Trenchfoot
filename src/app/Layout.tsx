import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { KeywordSheet } from '../components/keyword/KeywordSheet';

const navItems = [
  { to: '/rules', label: 'Rules', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { to: '/search', label: 'Search', icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z' },
  { to: '/warband', label: 'Warband', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z' },
  { to: '/campaign', label: 'Campaign', icon: 'M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5' },
];

function NavIcon({ path, className }: { path: string; className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-dvh flex flex-col bg-bg-primary">
      {/* Header */}
      <header className="safe-top bg-bg-secondary/80 backdrop-blur-lg border-b border-border-default px-4 py-3.5 flex items-center sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-gold/10 flex items-center justify-center">
            <span className="text-accent-gold font-bold text-xs">TF</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-text-primary tracking-tight leading-none">
              Trenchfoot
            </h1>
            <span className="text-text-muted text-[10px] leading-none">Trench Crusade Companion</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20" key={location.pathname}>
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Bottom navigation */}
      <nav className="safe-bottom fixed bottom-0 left-0 right-0 bg-bg-secondary/90 backdrop-blur-lg border-t border-border-default z-30">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-xl no-underline transition-all duration-200 ${
                  isActive
                    ? 'text-accent-gold bg-accent-gold/8'
                    : 'text-text-muted hover:text-text-secondary'
                }`
              }
            >
              <NavIcon path={item.icon} />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Global keyword bottom sheet */}
      <KeywordSheet />
    </div>
  );
}
