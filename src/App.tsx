import { useEffect } from "react";
import {
  HashRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { StoreProvider } from "./lib/store";
import { UserRoute, AdminRoute } from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Toaster from "./components/Toaster";
import { Button, Page } from "./components/ui";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import AdminLogin from "./pages/auth/AdminLogin";
import Orders from "./pages/account/Orders";
import Profile from "./pages/account/Profile";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ProductForm from "./pages/admin/ProductForm";
import ManageProducts from "./pages/admin/ManageProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import { About, Contact, Privacy, Terms, Refund } from "./pages/Static";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <Page className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-serif text-8xl font-bold text-gradient-gold">404</p>
      <h1 className="mt-4 font-serif text-3xl text-white">Page not found</h1>
      <p className="mt-2 text-zinc-400">The page you're looking for has drifted off-screen.</p>
      <Button to="/" className="mt-8">Back to Home</Button>
    </Page>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:category" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/orders" element={<UserRoute><Orders /></UserRoute>} />
        <Route path="/profile" element={<UserRoute><Profile /></UserRoute>} />

        <Route
          path="/admin"
          element={<AdminRoute><AdminLayout /></AdminRoute>}
        >
          <Route index element={<Dashboard />} />
          <Route path="add" element={<ProductForm />} />
          <Route path="edit/:id" element={<ProductForm />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col bg-[#0a0a0c]">
          <Navbar />
          <div className="flex-1">
            <AnimatedRoutes />
          </div>
          <Footer />
        </div>
        <Toaster />
      </HashRouter>
    </StoreProvider>
  );
}
