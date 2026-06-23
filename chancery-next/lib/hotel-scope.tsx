'use client'
import { createContext, useContext } from 'react'
export type HotelSlug = 'chancery' | 'pavilion'
const Ctx = createContext<{ active: HotelSlug | null }>({ active: null })
export function HotelScope({ active, children }: { active: HotelSlug | null; children: React.ReactNode }) {
  return <Ctx.Provider value={{ active }}>{children}</Ctx.Provider>
}
export const useHotelScope = () => useContext(Ctx)
