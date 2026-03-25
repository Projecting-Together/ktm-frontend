import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import PropertyDetails from "./pages/PropertyDetails";
import MapSearch from "./pages/MapSearch";
import MapSearchBackend from "./pages/MapSearchBackend";
import { useState, useEffect } from "react";
import { Property } from "@/../../shared/types";
import { initializeAuth } from "./lib/api-backend";

/**
 * Zillow Kathmandu Clone - Main App
 * Design: Modern Minimalist with Himalayan Warmth
 * Color Palette: Deep Slate, Warm Terracotta, Sage Green, Gold
 * Typography: Poppins (headings) + Inter (body)
 */

function Router() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  if (selectedProperty) {
    return (
      <PropertyDetails
        property={selectedProperty}
        onBack={() => setSelectedProperty(null)}
      />
    );
  }

  return (
    <Switch>
      <Route
        path={"/"}
        component={() => (
          <Home onSelectProperty={setSelectedProperty} />
        )}
      />
      <Route
        path={"/map-search"}
        component={() => (
          <MapSearchBackend />
        )}
      />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Initialize authentication on app load
    initializeAuth();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
