import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AccommodationPage } from "@/pages/AccommodationPage";
import { BookRedirect } from "@/pages/BookRedirect";
import { CareersPage } from "@/pages/CareersPage";
import { CateringPage } from "@/pages/CateringPage";
import { ContactPage } from "@/pages/ContactPage";
import { DestinationPage } from "@/pages/DestinationPage";
import { DiningPage } from "@/pages/DiningPage";
import { EventsPage } from "@/pages/EventsPage";
import { FAQPage } from "@/pages/FAQPage";
import { GalleryPage } from "@/pages/GalleryPage";
import { HomePage } from "@/pages/HomePage";
import { HotelHomePage } from "@/pages/HotelHomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { OffersPage } from "@/pages/OffersPage";
import { RoomsPage } from "@/pages/RoomsPage";
import { SimpleContentPage } from "@/pages/SimpleContentPage";
import { SiteMapPage } from "@/pages/SiteMapPage";
import { VenueDetailPage } from "@/pages/VenueDetailPage";
import type { HotelSlug } from "@/lib/types";

function ValidHotel({ children }: { children: React.ReactNode }) {
  const { hotel } = useParams<{ hotel: string }>();
  if (hotel !== "chancery" && hotel !== "pavilion") return <Navigate to="/" replace />;
  return <>{children}</>;
}

/** Re-derives the hotel param into a typed prop so each page stays tidy. */
function HotelParam<P extends { hotel: HotelSlug }>({
  Component,
}: { Component: React.ComponentType<P> }) {
  const { hotel } = useParams<{ hotel: HotelSlug }>();
  return <Component {...({ hotel: hotel as HotelSlug } as P)} />;
}

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="book" element={<BookRedirect />} />
        <Route path="faq" element={<FAQPage />} />
        <Route path="careers" element={<CareersPage />} />
        <Route path="catering" element={<CateringPage />} />
        <Route path="site-map" element={<SiteMapPage />} />
        <Route path="privacy" element={<SimpleContentPage kind="privacy" />} />
        <Route path="terms" element={<SimpleContentPage kind="terms" />} />
        <Route path="accessibility-statement" element={<SimpleContentPage kind="accessibility" />} />

        <Route
          path=":hotel"
          element={
            <ValidHotel>
              <HotelParam Component={HotelHomePage} />
            </ValidHotel>
          }
        />
        <Route
          path=":hotel/accommodation"
          element={
            <ValidHotel>
              <HotelParam Component={AccommodationPage} />
            </ValidHotel>
          }
        />
        <Route
          path=":hotel/dining"
          element={
            <ValidHotel>
              <HotelParam Component={DiningPage} />
            </ValidHotel>
          }
        />
        <Route
          path=":hotel/plan-your-event"
          element={
            <ValidHotel>
              <HotelParam Component={EventsPage} />
            </ValidHotel>
          }
        />
        <Route
          path=":hotel/plan-your-event/:venue"
          element={
            <ValidHotel>
              <HotelParam Component={VenueDetailPage} />
            </ValidHotel>
          }
        />
        <Route
          path=":hotel/special-offers"
          element={
            <ValidHotel>
              <HotelParam Component={OffersPage} />
            </ValidHotel>
          }
        />
        <Route
          path=":hotel/gallery"
          element={
            <ValidHotel>
              <HotelParam Component={GalleryPage} />
            </ValidHotel>
          }
        />
        <Route
          path=":hotel/contact-us"
          element={
            <ValidHotel>
              <HotelParam Component={ContactPage} />
            </ValidHotel>
          }
        />
        <Route
          path=":hotel/destination"
          element={
            <ValidHotel>
              <HotelParam Component={DestinationPage} />
            </ValidHotel>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
