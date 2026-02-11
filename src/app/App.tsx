import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './Layout';
import { RulesHome } from '../features/rules/components/RulesHome';
import { RuleCategory } from '../features/rules/components/RuleCategory';
import { RuleDetail } from '../features/rules/components/RuleDetail';
import { RuleSearch } from '../features/rules/components/RuleSearch';
import { WarbandList } from '../features/warband/components/WarbandList';
import { WarbandCreate } from '../features/warband/components/WarbandCreate';
import { WarbandRoster } from '../features/warband/components/WarbandRoster';
import { seedDatabase } from '../data/seed';

function Placeholder({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">{title}</h1>
      <div className="text-center py-16 bg-bg-secondary border border-border-default rounded-xl">
        <svg className="mx-auto mb-3 text-text-muted/30" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={icon} />
        </svg>
        <div className="text-text-muted text-sm">Coming soon</div>
        <div className="text-text-muted/50 text-[11px] mt-1">This feature is in development</div>
      </div>
    </div>
  );
}

export function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedDatabase().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-bg-primary gap-3">
        <div className="w-12 h-12 rounded-2xl bg-accent-gold/10 flex items-center justify-center">
          <span className="text-accent-gold font-bold text-lg">TF</span>
        </div>
        <div className="text-text-muted text-xs">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/rules" replace />} />
          <Route path="/rules" element={<RulesHome />} />
          <Route path="/rules/:category" element={<RuleCategory />} />
          <Route path="/rules/:category/:slug" element={<RuleDetail />} />
          <Route path="/search" element={<RuleSearch />} />
          <Route path="/warband" element={<WarbandList />} />
          <Route path="/warband/new" element={<WarbandCreate />} />
          <Route path="/warband/:id" element={<WarbandRoster />} />
          <Route path="/campaign" element={<Placeholder title="Campaign" icon="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
