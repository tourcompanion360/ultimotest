import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import { AgencyProvider } from "@/contexts/AgencyContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ClientPortal from "./pages/ClientPortal";
import AdminDashboard from "./pages/AdminDashboard";
import TestClientPortal from "./pages/TestClientPortalView";
import TestClientPortalView from "./pages/TestClientPortalView";
import ClientDashboard from "./pages/ClientDashboardNew";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

// Enhanced error boundary using our robust ErrorBoundary component

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <AgencyProvider>
            <NotificationProvider>
              <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
        {/* Unified client portal - shows all projects for a client */}
        <Route
          path="/client/:clientId"
          element={<ClientDashboard />}
        />
        {/* Test route for client portal - bypasses magic link requirement */}
        <Route
          path="/test-client/:projectId"
          element={<TestClientPortalView />}
        />
        <Route
          path="/test-portal"
          element={
            <ProtectedRoute>
              <TestClientPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </NotificationProvider>
          </AgencyProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
