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

const AdminDashboard: React.FC = () => {
  const { state, logout } = useAuth();
  const { isAdmin, loading } = useIsAdmin();
  const navigate = useNavigate();

  if (state.isLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">Loading...</div>
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Signed in as {state.user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Site Content</TabsTrigger>
          </TabsList>
          <TabsContent value="products"><ProductsManager /></TabsContent>
          <TabsContent value="orders"><OrdersManager /></TabsContent>
          <TabsContent value="users"><UsersManager /></TabsContent>
          <TabsContent value="content"><SiteContentManager /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
