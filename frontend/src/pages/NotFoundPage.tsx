import { Link } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import "./pages.css";

export function NotFoundPage() {
  return (
    <>
      <PageMeta title="Page not found" noindex />
      <section className="section" style={{ minHeight: "70dvh", display: "grid", placeItems: "center" }}>
        <div className="container narrow text-center">
          <p className="eyebrow center">404</p>
          <h1 className="display">Page not found</h1>
          <p className="lede" style={{ margin: "0 auto 2rem" }}>
            The page you're looking for has moved or doesn't exist. Try the home page,
            or explore one of our two hotels.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/" className="btn">Home</Link>
            <Link to="/chancery" className="btn ghost">The Chancery Hotel</Link>
            <Link to="/pavilion" className="btn ghost">Chancery Pavilion</Link>
          </div>
        </div>
      </section>
    </>
  );
}
