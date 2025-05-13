
import React from "react";
import { AppRoutes } from "./routes";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/auth";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
