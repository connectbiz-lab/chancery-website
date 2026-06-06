export function Loading() {
  return (
    <div style={{
      minHeight: "60dvh",
      display: "grid",
      placeContent: "center",
      color: "var(--c-muted)",
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      fontSize: "0.7rem",
    }}>
      Loading…
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
