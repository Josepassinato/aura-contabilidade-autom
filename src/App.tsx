
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
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  
  useEffect(() => {
    try {
      const client = initializeSupabase();
      setSupabaseClient(client);
      
      if (!client) {
        setSupabaseError("Configuração do Supabase incompleta. O aplicativo funcionará com funcionalidade limitada.");
      }
    } catch (error) {
      console.error("Erro ao inicializar Supabase:", error);
      setSupabaseError("Falha ao conectar com Supabase.");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseContext.Provider value={supabaseClient}>
        <TooltipProvider>
          {supabaseError && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 fixed top-0 left-0 right-0 z-50">
              <p className="font-medium">Aviso</p>
              <p>{supabaseError}</p>
              <p className="text-sm">Configure suas credenciais Supabase no arquivo .env para ativar todas as funcionalidades.</p>
            </div>
          )}
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
