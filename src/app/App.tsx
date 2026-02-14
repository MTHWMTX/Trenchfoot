import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './Layout';
import { RulesHome } from '../features/rules/components/RulesHome';
import { RuleCategory } from '../features/rules/components/RuleCategory';
import { RuleDetail } from '../features/rules/components/RuleDetail';
import { FactionList } from '../features/rules/components/FactionList';
import { FactionDetail } from '../features/rules/components/FactionDetail';
import { EquipmentList } from '../features/rules/components/EquipmentList';
import { WarbandList } from '../features/warband/components/WarbandList';
import { WarbandCreate } from '../features/warband/components/WarbandCreate';
import { WarbandRoster } from '../features/warband/components/WarbandRoster';
import { CampaignList } from '../features/campaign/components/CampaignList';
import { CampaignCreate } from '../features/campaign/components/CampaignCreate';
import { CampaignDetail } from '../features/campaign/components/CampaignDetail';
import { PostGameWizard } from '../features/campaign/components/PostGameWizard';
import { seedDatabase } from '../data/seed';

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
          <Route path="/rules/faction" element={<FactionList />} />
          <Route path="/rules/faction/:factionId" element={<FactionDetail />} />
          <Route path="/rules/equipment" element={<EquipmentList />} />
          <Route path="/rules/:category" element={<RuleCategory />} />
          <Route path="/rules/:category/:slug" element={<RuleDetail />} />
          <Route path="/warband" element={<WarbandList />} />
          <Route path="/warband/new" element={<WarbandCreate />} />
          <Route path="/warband/:id" element={<WarbandRoster />} />
          <Route path="/campaign" element={<CampaignList />} />
          <Route path="/campaign/new" element={<CampaignCreate />} />
          <Route path="/campaign/:id" element={<CampaignDetail />} />
          <Route path="/campaign/:id/postgame" element={<PostGameWizard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
