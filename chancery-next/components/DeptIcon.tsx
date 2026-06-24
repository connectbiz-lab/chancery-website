import type { ComponentType } from 'react'
import {
  ContactIcon,
  DiningIcon,
  EventsIcon,
  HotelsIcon,
  OffersIcon,
  StayIcon,
} from './NavIcons'

// Flat line-icon per department so the right team is easy to spot at a glance.
// Ported from the legacy ContactPage DEPT_ICON map (keyed on the department key).
const DEPT_ICON: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  reservations: StayIcon,
  dining: DiningIcon,
  sales: OffersIcon,
  events: EventsIcon,
  catering: DiningIcon,
  careers: HotelsIcon,
  general: ContactIcon,
}

export function DeptIcon({ department, size = 20 }: { department: string; size?: number }) {
  const Icon = DEPT_ICON[department] ?? ContactIcon
  return <Icon size={size} />
}
