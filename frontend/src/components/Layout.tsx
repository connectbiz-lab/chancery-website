import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { ScrollToTop } from "./ScrollToTop";

export function Layout() {
  const { pathname } = useLocation();

  // Reset scroll on navigation.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <>
      <Navbar />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
