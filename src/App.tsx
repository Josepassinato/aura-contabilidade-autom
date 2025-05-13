
import React from "react";
import routes from "./routes";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/auth";
import { RouterProvider } from "react-router-dom";

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={routes} />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
