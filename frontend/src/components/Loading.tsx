/**
 * Page skeleton shown on first load (before the API data arrives). Mirrors the
 * universal page shape — full-bleed hero band, a centered title, and a row of
 * cards — so the layout appears instantly and shimmers in place instead of
 * flashing a "Loading…" line. Navbar/Footer live in the Layout, outside this.
 */
export function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="skeleton sk-hero" />
      <div className="container" style={{ padding: "4.5rem 0" }}>
        <div className="skeleton sk-bar" style={{ width: "26%", margin: "0 auto 1.5rem" }} />
        <div
          className="skeleton sk-bar"
          style={{ width: "55%", height: "2rem", margin: "0 auto 3rem" }}
        />
        <div className="sk-grid">
          <div className="skeleton sk-card" />
          <div className="skeleton sk-card" />
          <div className="skeleton sk-card" />
        </div>
      </div>
    </div>
  );
}

export function ErrorBlock({ message }: { message?: string }) {
  return (
    <div style={{
      minHeight: "40dvh",
      display: "grid",
      placeContent: "center",
      color: "var(--c-muted)",
      textAlign: "center",
      padding: "2rem",
    }}>
      <div>
        <p className="eyebrow center" style={{ color: "var(--c-gold-deep)" }}>
          Something went wrong
        </p>
        <p style={{ maxWidth: "40ch" }}>{message ?? "Please refresh the page."}</p>
      </div>
    </div>
  );
}
