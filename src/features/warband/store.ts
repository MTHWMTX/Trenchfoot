import { create } from 'zustand';

interface WarbandBuilderState {
  activeWarbandId: string | null;
  editingModelId: string | null;
  addingModel: boolean;
  setActiveWarband: (id: string | null) => void;
  setEditingModel: (id: string | null) => void;
  setAddingModel: (open: boolean) => void;
}

export const useWarbandStore = create<WarbandBuilderState>((set) => ({
  activeWarbandId: null,
  editingModelId: null,
  addingModel: false,
  setActiveWarband: (id) => set({ activeWarbandId: id }),
  setEditingModel: (id) => set({ editingModelId: id }),
  setAddingModel: (open) => set({ addingModel: open }),
}));
