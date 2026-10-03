// lib/amenities.ts — general hotel amenities shown (with icons) on the hotel home
// page. Lists come from the hotel teams' "Website Content" sheet (Oct 2026);
// The Chancery's list comes from the team's FAQ answer on general amenities (Oct 2026).
import type { ComponentType } from 'react'
import {
  BarIcon, BusinessIcon, FitnessIcon, LaundryIcon, PoolIcon, RestaurantIcon,
  RoomServiceIcon, SpaIcon, TurndownIcon, ValetIcon, WakeUpIcon, WifiIcon,
} from '@/components/NavIcons'

export type Amenity = {
  Icon: ComponentType<{ size?: number; className?: string }>
  label: string
  /** Hotel sub-page this amenity links to (e.g. 'dining'). */
  to?: string
}

export const HOTEL_AMENITIES: Record<string, Amenity[]> = {
  pavilion: [
    { Icon: RestaurantIcon, label: 'Restaurant', to: 'dining' },
    { Icon: BarIcon, label: 'Bar', to: 'dining' },
    { Icon: FitnessIcon, label: 'Fitness Center' },
    { Icon: PoolIcon, label: 'Swimming Pool' },
    { Icon: RoomServiceIcon, label: '24/7 In Room Dining' },
    { Icon: TurndownIcon, label: 'Daily Turndown Service' },
    { Icon: BusinessIcon, label: 'Business Center' },
    { Icon: ValetIcon, label: 'Valet Parking' },
    { Icon: LaundryIcon, label: 'On-Site Laundry' },
    { Icon: WakeUpIcon, label: 'Wake-Up Calls' },
    { Icon: WifiIcon, label: 'Complimentary Wi-Fi' },
  ],
  chancery: [
    { Icon: RestaurantIcon, label: 'Restaurants', to: 'dining' },
    { Icon: SpaIcon, label: 'Sara Spa' },
    { Icon: FitnessIcon, label: 'Fitness Center' },
    { Icon: RoomServiceIcon, label: '24/7 In Room Dining' },
    { Icon: TurndownIcon, label: 'Daily Turndown Service' },
    { Icon: BusinessIcon, label: 'Business Center' },
    { Icon: ValetIcon, label: 'Valet Parking' },
    { Icon: WakeUpIcon, label: 'Wake-Up Calls' },
    { Icon: WifiIcon, label: 'Wi-Fi & LAN' },
  ],
}
