import { MetaProvider, Title, Link, Meta } from "@solidjs/meta";
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

          {/* Viewport — empêche le zoom automatique sur mobile */}
          <Meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />

          {/* Fonts */}
          <Link rel="preconnect" href="https://fonts.googleapis.com" />
          <Link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
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
