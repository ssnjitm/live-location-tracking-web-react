import { create } from 'zustand';

interface LocationStore {
  selectedUserId: string | null;
  setSelectedUserId: (userId: string | null) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
  selectedUserId: null,
  setSelectedUserId: (userId) => set({ selectedUserId: userId }),
  refreshTrigger: 0,
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));