import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";
import ProductsManager from "@/components/admin/ProductsManager";
import OrdersManager from "@/components/admin/OrdersManager";
import UsersManager from "@/components/admin/UsersManager";
import SiteContentManager from "@/components/admin/SiteContentManager";
import MessagesManager from "@/components/admin/MessagesManager";
import HeroSlidesManager from "@/components/admin/HeroSlidesManager";
import ReviewsManager from "@/components/admin/ReviewsManager";

const AdminDashboard: React.FC = () => {
  const { state, logout } = useAuth();
  const { isAdmin, loading } = useIsAdmin();
  const navigate = useNavigate();

  if (state.isLoading || loading) {
    return (
      <Layout>
        <div className="shell py-12 text-center text-steel" role="status">Loading...</div>
      </Layout>
    );
  }

  if (!state.isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <Layout>
      <div className="shell py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="shrink-0 rounded-full bg-primary/10 p-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold">Admin dashboard</h1>
              <p className="break-all text-sm text-steel">Signed in as {state.user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>

        <Tabs defaultValue="products">
          {/* One scrolling row of 44px tabs on phones; the list never wraps or squeezes. */}
          <TabsList className="mb-6 flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl p-1 sm:inline-flex sm:w-auto [&>button]:min-h-[2.75rem] [&>button]:shrink-0 [&>button]:rounded-lg [&>button]:px-4 sm:[&>button]:min-h-[2.25rem]">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="carousel">Carousel</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Site Content</TabsTrigger>
          </TabsList>
          <TabsContent value="products"><ProductsManager /></TabsContent>
          <TabsContent value="orders"><OrdersManager /></TabsContent>
          <TabsContent value="messages"><MessagesManager /></TabsContent>
          <TabsContent value="carousel"><HeroSlidesManager /></TabsContent>
          <TabsContent value="reviews"><ReviewsManager /></TabsContent>
          <TabsContent value="users"><UsersManager /></TabsContent>
          <TabsContent value="content"><SiteContentManager /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
