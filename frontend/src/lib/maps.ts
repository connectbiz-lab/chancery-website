/** Google Maps search link for a property — shared by the contact page and
 *  footer so the "View on map" links are always identical. */
export function mapsUrl(name: string, address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${name}, ${address}`,
  )}`;
}
