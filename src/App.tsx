import { useEffect } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GrainOverlay from "./components/GrainOverlay";
import Home from "./pages/Home";
import Services from "./pages/Services";
import { usePrefersReducedMotion } from "./lib/hooks";

/**
 * ScrollManager — resets scroll on route change, then honors any
 * cross-page deep link carried in router state (e.g. the sticky
 * "Plan Your Display" CTA → home page intake form).
 */
function ScrollManager() {
  const location = useLocation();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!target) {
      window.scrollTo(0, 0);
      return;
    }
    const t = window.setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    }, 140);
    return () => window.clearTimeout(t);
  }, [location, reduced]);

  return null;
}

export default function App() {
  return (
    <HashRouter>
      {/* "user" lets framer-motion honor prefers-reduced-motion globally */}
      <MotionConfig reducedMotion="user">
        <ScrollManager />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
        {/* Cinematic film grain + vignette, above all content */}
        <GrainOverlay />
      </MotionConfig>
    </HashRouter>
  );
}
