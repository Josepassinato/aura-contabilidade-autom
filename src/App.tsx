
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { SupabaseContext, initializeSupabase } from "./lib/supabase";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import ClientAccess from "./pages/ClientAccess";
import ClientPortal from "./pages/ClientPortal";

const queryClient = new QueryClient();

const App = () => {
  const [supabaseClient, setSupabaseClient] = useState(null);
  
  useEffect(() => {
    const client = initializeSupabase();
    setSupabaseClient(client);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseContext.Provider value={supabaseClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/client-access" element={<ClientAccess />} />
              <Route path="/client-portal" element={<ClientPortal />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SupabaseContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
