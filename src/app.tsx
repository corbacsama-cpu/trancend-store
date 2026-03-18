import { MetaProvider, Title, Link } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import Navbar from "~/components/Navbar";
import CartDrawer from "~/components/CartDrawer";
import Footer from "~/components/Footer";
import "~/styles/global.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>

          {/* Fonts — Playfair Display (titres) · Inter (texte) · IBM Plex Mono (lab/labels) */}
          <Link
            rel="preconnect"
            href="https://fonts.googleapis.com"
          />
          <Link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossorigin=""
          />
          <Link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,700&family=Inter:wght@300;400;500&family=IBM+Plex+Mono:wght@300;400;500&display=swap"
          />

          <Title>TRÄNCËNÐ — L'amour du dépassement</Title>

          <Navbar />
          <CartDrawer />

          <Suspense>
            {props.children}
          </Suspense>

          <Footer />
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
