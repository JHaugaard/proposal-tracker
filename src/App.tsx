import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Proposals from "./pages/Proposals";
import FileDetail from "./pages/FileDetail";
import PIs from "./pages/PIs";
import EditPI from "./pages/EditPI";
import Sponsors from "./pages/Sponsors";
import EditSponsor from "./pages/EditSponsor";

import ImportData from "./pages/ImportData";
import DBDistiller from "./pages/DBDistiller";
import NotFound from "./pages/NotFound";
import PasswordReset from "./pages/PasswordReset";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/proposals" element={<ProtectedRoute><Proposals /></ProtectedRoute>} />
            <Route path="/proposals/:id" element={<ProtectedRoute><FileDetail /></ProtectedRoute>} />
            <Route path="/pis" element={<ProtectedRoute><PIs /></ProtectedRoute>} />
            <Route path="/pis/:id/edit" element={<ProtectedRoute><EditPI /></ProtectedRoute>} />
            <Route path="/sponsors" element={<ProtectedRoute><Sponsors /></ProtectedRoute>} />
            <Route path="/sponsors/:id/edit" element={<ProtectedRoute><EditSponsor /></ProtectedRoute>} />
            <Route path="/import" element={<ProtectedRoute><ImportData /></ProtectedRoute>} />
            <Route path="/distiller" element={<ProtectedRoute><DBDistiller /></ProtectedRoute>} />
            
            <Route path="/auth" element={<Auth />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
