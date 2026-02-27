import { MetaProvider, Title } from "@solidjs/meta";
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
