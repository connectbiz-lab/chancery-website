# QA Report — chancery-website-v2

**Date:** 2026-06-10
**Target:** http://localhost:5173 (Vite dev server, Django backend at 127.0.0.1:8000)
**Branch:** main
**Mode:** Report-only — no fixes applied
**Health score:** 91 / 100

## Summary

| Category | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 1 |
| Low | 3 |

## Coverage

| Device | Viewport | Pages tested |
|---|---|---|
| Desktop | 1440 × 900 | `/`, `/pavilion`, `/chancery`, `/pavilion/dining`, `/pavilion/contact-us` |
| Tablet | 768 × 1024 | `/`, `/pavilion`, `/pavilion/dining` |
| Mobile | 375 × 812 | `/`, `/pavilion`, `/pavilion/dining`, `/pavilion/contact-us` |
| Routes (HTTP only) | — | `/faq`, `/careers`, `/catering`, `/site-map`, `/privacy`, `/terms`, `/accessibility-statement`, `/pavilion/special-offers`, `/chancery/gallery`, `/pavilion/destination`, `/pavilion/experience` |

Plus one end-to-end submission of the Pavilion contact form.

Total screenshots captured: 12 (in `/private/tmp/chancery-qa/`).

## Top 3 things to fix

1. **Contact form has no success feedback** (ISSUE-001, Medium). Submission works server-side but the UI just resets to empty — users will assume it failed.
2. **Hero label text washes out on cream facade images** (ISSUE-002, High). The stacked eyebrow (`The Chancery Pavilion / Dining` etc.) ivory text against the bright Pavilion building is borderline-legible despite the three-layer text-shadow.
3. **Reveal-on-scroll animation has no `prefers-reduced-motion` fallback** (ISSUE-003, Low). Sections set `opacity: 0` and only become visible via `IntersectionObserver`. Disabled JS or aggressive motion-reduce settings leave the page partially blank.

## Issues

### ISSUE-001 — Contact form submission shows no success state
- **Severity:** Medium
- **Category:** UX / functional
- **Where:** `/pavilion/contact-us` (and presumably `/chancery/contact-us`)
- **Repro:** Fill all fields, click "Send enquiry". Form fields blank out; no toast, banner, or message appears.
- **Evidence:** `05-contact-filled.png` (before), `05-contact-submitted.png` (after — note empty form, no confirmation)
- **Verified server-side:** Lead row created in Django DB with all fields intact (`Lead.objects.filter(email='qa-test@example.com').count() == 1`). Issue is purely the missing UI acknowledgment.

### ISSUE-002 — Hero label readability on cream-facade pages
- **Severity:** High (legibility)
- **Category:** Visual / content
- **Where:** `/pavilion/dining`, `/pavilion/plan-your-event`, `/pavilion/special-offers`, `/pavilion/gallery`, `/pavilion/contact-us`, `/pavilion/accommodation` — anywhere `.hero-eyebrow-stack` overlays the bright cream Pavilion facade.
- **Repro:** Navigate to any sub-page on `/pavilion/*`. The "Dining" / "Events" / etc. secondary label is barely legible against the building wall, even after the navy text-shadow.
- **Evidence:** `03-pavilion-dining-top.png`, `04-pavilion-contact-top.png`
- **Note:** Chancery sub-pages are fine — the Lavelle Road photograph has darker tones that contrast well.

### ISSUE-003 — `.reveal` has no motion-reduce fallback
- **Severity:** Low (most users unaffected)
- **Category:** Accessibility
- **Where:** Every page using `useReveal`.
- **Repro:** In DevTools emulate `prefers-reduced-motion: reduce` (or block JS). Sections never become visible.
- **Where to fix:** `frontend/src/styles/globals.css` `.reveal { opacity: 0 }` — add `@media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; } }`.
- **Evidence:** static full-page screenshots show large white blocks below the fold (`01-home-desktop.png`, `m1-home-mobile.png`) — same failure pattern users with motion-reduce will see.

### ISSUE-004 — Hero text vertical positioning on `/pavilion` cuts the C logo
- **Severity:** Low
- **Category:** Visual
- **Where:** `/pavilion` at 1440 width.
- **Repro:** Load `/pavilion`. The big `C` logo embedded in the building facade falls behind the eyebrow stack on most desktops.
- **Evidence:** `02-pavilion-top.png` — the logo on the building is partly obscured by the centered hero text block.

### ISSUE-005 — Hero icon strip can wrap awkwardly on small mobile
- **Severity:** Low
- **Category:** Visual
- **Where:** All hero pages at 375 width.
- **Repro:** Mobile viewport — five icons in the strip wrap to 3+2 rows. Functional, but the wrap point is uneven and the bottom row looks orphaned.
- **Evidence:** `m1-dining-mobile.png` — top 3 icons / bottom 2 icons.

## Strengths

- **Zero console errors** across every page visited.
- **Every tested route returns 200** — no broken paths.
- **Form submission works end-to-end** (just lacks UI feedback).
- **52 internal links** mapped from the brand home, all wired to real routes.
- **Mobile layout adapts cleanly** — stats wrap, card grids stack vertically, footer reflows.
- **Hero icon strip ↔ inline navbar handoff** works exactly as designed: icons fade out, inline nav fades in once `scrollY > 24px`.
- **Solid ivory pills** for icon glyphs and hotel switcher are consistent across pages.
- **Contact form backend** correctly maps `interest` → `stay`, `property` → `pavilion`, saves to the right model.

## Health score breakdown

| Category | Weight | Score | Reason |
|---|---|---|---|
| Console errors | 15% | 100 | None observed |
| Broken links | 10% | 100 | Sampled 11 routes + map-derived links, all 200 |
| Visual | 10% | 85 | ISSUE-002 (high), ISSUE-004 + 005 (low) |
| Functional | 20% | 95 | Form save works; missing UX confirmation (ISSUE-001) |
| UX | 15% | 85 | Form silent-success + reveal-blocked sections |
| Performance | 10% | 95 | Vite dev mode acceptable; production untested |
| Content | 5% | 100 | No typos or placeholder text found in tested pages |
| Accessibility | 15% | 80 | ISSUE-003 + low contrast on hero text (ISSUE-002) |

`score = Σ(category × weight) = 91`

## What I did NOT test

- Production build (`npm run build` + preview).
- Lighthouse / Core Web Vitals.
- Cross-browser (Chromium only — no Firefox / Safari).
- Booking redirect flow (`/book?…` → SynXis).
- Keyboard-only navigation / screen reader.
- HotelHomePage scroll-into-view for `#hotels` anchor.
- Admin (Django) side.

## Recommendations (for `/qa` mode, not applied here)

1. Add an inline success state to the contact form — render `Thanks, we'll be in touch` above the form for ~5s after a 2xx response. Tie to local component state.
2. Re-evaluate hero text on `/pavilion/*`: either swap the photo for the night version (`pavilion-hero-night.jpg` if available), add a stronger vignette overlay below the navbar, or shift the eyebrow text to the gold tone used on Chancery pages.
3. Add `prefers-reduced-motion` fallback to `.reveal` (one CSS media query, ~3 lines).
4. Consider reducing icon strip to 4 items on mobile so it stays single-row, or stack labels next to icons in a horizontal scroll.

---

*Report generated by `/qa-only` skill. Source screenshots at `/private/tmp/chancery-qa/`.*
