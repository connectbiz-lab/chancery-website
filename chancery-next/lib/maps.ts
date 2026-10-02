/** Google Maps search link for a property — shared by the contact page and
 *  footer so the "View on map" links are always identical. */
export function mapsUrl(name: string, address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${name}, ${address}`,
  )}`;
}

/** Google Maps directions from a property to a place — distances and travel
 *  times come from Google at click time, so the site never quotes its own. */
export function directionsUrl(name: string, address: string, destination: string): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    `${name}, ${address}`,
  )}&destination=${encodeURIComponent(destination)}`;
}
