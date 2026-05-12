import { create } from "zustand"

export interface UserProfile {
  name: string
  email: string
}

interface AppState {
  user: UserProfile | null
  setUser: (user: UserProfile | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))