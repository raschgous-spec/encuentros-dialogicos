import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import DocenteDashboard from "./pages/DocenteDashboard";
import EstudianteDashboard from "./pages/EstudianteDashboard";
import ObservadorDashboard from "./pages/ObservadorDashboard";
import GenerarGuiaPDF from "./pages/GenerarGuiaPDF";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/estudiante" 
            element={
              <ProtectedRoute allowedRoles={['estudiante', 'observador']}>
                <EstudianteDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/docente" 
            element={
              <ProtectedRoute allowedRoles={['docente', 'admin']}>
                <DocenteDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/observador" 
            element={
              <ProtectedRoute allowedRoles={['observador', 'admin']}>
                <ObservadorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/guia-pdf" element={<GenerarGuiaPDF />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
