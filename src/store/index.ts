import { create } from 'zustand';
import type { Prescription, Member, InventoryItem } from '@/types';

interface AppState {
  sidebarCollapsed: boolean;
  selectedPrescription: Prescription | null;
  selectedMember: Member | null;
  selectedInventory: InventoryItem | null;
  toggleSidebar: () => void;
  setSelectedPrescription: (p: Prescription | null) => void;
  setSelectedMember: (m: Member | null) => void;
  setSelectedInventory: (i: InventoryItem | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  selectedPrescription: null,
  selectedMember: null,
  selectedInventory: null,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSelectedPrescription: (p) => set({ selectedPrescription: p }),
  setSelectedMember: (m) => set({ selectedMember: m }),
  setSelectedInventory: (i) => set({ selectedInventory: i }),
}));
