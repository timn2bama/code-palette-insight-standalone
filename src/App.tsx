import { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";
import { useRealUserMonitoring } from "@/hooks/useRealUserMonitoring";
import { useErrorLogger } from "@/hooks/useErrorLogger";
import { useOfflineFirst } from "@/hooks/useOfflineFirst";
import { queryClient } from "@/lib/queryClient";
import { routes } from "@/routes";

const AppContent = () => {
  usePerformanceMonitoring();
  useRealUserMonitoring();
  useErrorLogger();
  useOfflineFirst();
  
  return (
    <Suspense fallback={
      <div className="min-h-screen grid place-items-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
      <PerformanceMonitor />
    </Suspense>
  );
};

const App = () => (
  <HelmetProvider>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </HelmetProvider>
);

export default App;
