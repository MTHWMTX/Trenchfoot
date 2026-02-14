import { create } from 'zustand';

interface CampaignUIState {
  editingCampaign: boolean;
  setEditingCampaign: (open: boolean) => void;
}

export const useCampaignStore = create<CampaignUIState>((set) => ({
  editingCampaign: false,
  setEditingCampaign: (open) => set({ editingCampaign: open }),
}));
