import { useCallback } from "react";

/**
 * Reveal-on-scroll. Returns a React callback ref — attach it to any element
 * marked with `.reveal` and it will toggle `.in` when the element enters
 * the viewport.
 *
 * A callback ref is used (rather than useRef + useEffect) so the IntersectionObserver
 * attaches as soon as the element mounts — even after a loading state that
 * returned early on the first render.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  return useCallback((el: T | null) => {
    if (!el) return;
    if (el.classList.contains("in")) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("in");
            io.disconnect();
            return;
          }
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);
  }, []);
}
