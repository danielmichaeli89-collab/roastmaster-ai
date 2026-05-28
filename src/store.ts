import { create } from 'zustand';

export type TourPointId =
  | 'entrance'
  | 'bar'
  | 'modbar'
  | 'grinders'
  | 'speaker'
  | 'dining'
  | 'booth';

interface TourState {
  isLoaded: boolean;
  hasStarted: boolean;
  currentPoint: TourPointId;
  isTransitioning: boolean;
  showInfo: boolean;
  setLoaded: (v: boolean) => void;
  start: () => void;
  goTo: (id: TourPointId) => void;
  setTransitioning: (v: boolean) => void;
  toggleInfo: () => void;
}

export const useTour = create<TourState>((set) => ({
  isLoaded: false,
  hasStarted: false,
  currentPoint: 'entrance',
  isTransitioning: false,
  showInfo: true,
  setLoaded: (v) => set({ isLoaded: v }),
  start: () => set({ hasStarted: true }),
  goTo: (id) =>
    set((s) =>
      s.currentPoint === id ? s : { currentPoint: id, isTransitioning: true }
    ),
  setTransitioning: (v) => set({ isTransitioning: v }),
  toggleInfo: () => set((s) => ({ showInfo: !s.showInfo })),
}));
