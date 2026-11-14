import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import BotpressInjector from "./components/BotpressInjector";
import SmoothScroll from "./components/SmoothScroll";

// Main shopping pages load with the first bundle; everything else is split
// into its own chunk so the home and shop pages download faster.
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";

const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Checkout = lazy(() => import("./pages/Checkout"));
const PaymentResult = lazy(() => import("./pages/PaymentResult"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DesignTable = lazy(() => import("./pages/DesignTable"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading">
    <div className="h-8 w-8 rounded-full border-2 border-ink/15 border-t-teak-deep animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BotpressInjector />

          <BrowserRouter>
            <SmoothScroll />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/design" element={<DesignTable />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment/success" element={<PaymentResult />} />
                <Route path="/payment/cancel" element={<PaymentResult />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/terms" element={<Navigate to="/terms-and-conditions" replace />} />
                <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
                <Route path="/returns" element={<Navigate to="/return-policy" replace />} />
                <Route path="/refund-policy" element={<Navigate to="/return-policy" replace />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
