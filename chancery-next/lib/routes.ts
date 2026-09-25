// lib/routes.ts — the Pavilion is the home page, so its hotel home is `/`
// (and /pavilion redirects there, see next.config.ts). Every link, breadcrumb
// and structured-data URL that targets a hotel's home goes through this.
export const hotelHomePath = (slug: string) => (slug === 'pavilion' ? '/' : `/${slug}`)
