import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import PropertyDetails from "./pages/PropertyDetails";
import { useState } from "react";
import { Property } from "@/../../shared/types";

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
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
