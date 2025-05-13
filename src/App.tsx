
import React from "react";
import routes from "./routes";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/auth";
import { RouterProvider } from "react-router-dom";
import { QueryProvider } from "./hooks/useSupabaseQuery";

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <RouterProvider router={routes} />
        <Toaster />
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
