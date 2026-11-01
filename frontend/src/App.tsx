import { useState } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/auth-context";
import POSPage from "@/POSPage";
import { LandingPage } from "@/public-site/LandingPage";

export default function App() {
  const [view, setView] = useState<'landing' | 'app'>('landing');

  if (view === 'landing') {
    return (
      <LandingPage 
        onEnterApp={() => setView('app')} 
        onRegister={() => console.log('Ir a registro')} 
      />
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <POSPage />
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </AuthProvider>
  );
}
