import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type TriviaStore = {
  hasDiscount: boolean
  setDiscount: (v: boolean) => void
}

export const useTrivia = create<TriviaStore>()(
  persist(
    (set) => ({
      hasDiscount: false,
      setDiscount: (v) => set({ hasDiscount: v }),
    }),
    { name: 'cuatrouno-trivia' }
  )
)
