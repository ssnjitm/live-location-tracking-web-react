import { create } from 'zustand';

interface UIStore {
  mapCenter: [number, number];
  mapZoom: number;
  setMapViewport: (center: [number, number], zoom: number) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  mapCenter: [27.7237358, 85.3308061], // Defaulting center to your active logs coordinates
  mapZoom: 13,
  setMapViewport: (center, zoom) => set({ mapCenter: center, mapZoom: zoom }),
}));