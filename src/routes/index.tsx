import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';

// Eager-loaded landing page for optimal First Contentful Paint (LCP)
import Index from '@/pages/Index';

// Lazy-loaded pages
const Auth = lazy(() => import('@/pages/Auth'));
const Wardrobe = lazy(() => import('@/pages/Wardrobe'));
const Outfits = lazy(() => import('@/pages/Outfits'));
const Explore = lazy(() => import('@/pages/Explore'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Marketplace = lazy(() => import('@/pages/Marketplace'));
const AIStylist = lazy(() => import('@/pages/AIStylist'));
const Sustainability = lazy(() => import('@/pages/Sustainability'));
const Security = lazy(() => import('@/pages/Security'));
const Integrations = lazy(() => import('@/pages/Integrations'));
const Weather = lazy(() => import('@/pages/Weather'));
const Services = lazy(() => import('@/pages/Services'));
const Subscription = lazy(() => import('@/pages/Subscription'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const Help = lazy(() => import('@/pages/Help'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const MobileAccessibility = lazy(() => import('@/pages/MobileAccessibility'));
const AIAnalysisPanel = lazy(() => import('@/components/AIAnalysisPanel'));

export const routes: RouteObject[] = [
  // Public routes
  { path: '/', element: <Index /> },
  { path: '/auth', element: <Auth /> },
  { path: '/privacy', element: <PrivacyPolicy /> },
  { path: '/terms', element: <TermsOfService /> },
  { path: '/about', element: <About /> },
  { path: '/contact', element: <Contact /> },
  { path: '/help', element: <Help /> },
  { path: '/faq', element: <FAQ /> },
  
  // Protected routes
  { 
    path: '/wardrobe', 
    element: <ProtectedRoute><Wardrobe /></ProtectedRoute> 
  },
  { 
    path: '/outfits', 
    element: <ProtectedRoute><Outfits /></ProtectedRoute> 
  },
  { 
    path: '/explore', 
    element: <ProtectedRoute><Explore /></ProtectedRoute> 
  },
  { 
    path: '/analytics', 
    element: <ProtectedRoute><Analytics /></ProtectedRoute> 
  },
  { 
    path: '/marketplace', 
    element: <ProtectedRoute><Marketplace /></ProtectedRoute> 
  },
  { 
    path: '/ai-stylist', 
    element: <ProtectedRoute><AIStylist /></ProtectedRoute> 
  },
  { 
    path: '/sustainability', 
    element: <ProtectedRoute><Sustainability /></ProtectedRoute> 
  },
  { 
    path: '/security', 
    element: <ProtectedRoute><Security /></ProtectedRoute> 
  },
  { 
    path: '/integrations', 
    element: <ProtectedRoute><Integrations /></ProtectedRoute> 
  },
  { 
    path: '/weather', 
    element: <ProtectedRoute><Weather /></ProtectedRoute> 
  },
  { 
    path: '/services', 
    element: <ProtectedRoute><Services /></ProtectedRoute> 
  },
  { 
    path: '/subscription', 
    element: <ProtectedRoute><Subscription /></ProtectedRoute> 
  },
  { 
    path: '/mobile', 
    element: <ProtectedRoute><MobileAccessibility /></ProtectedRoute> 
  },
  { 
    path: '/ai-analysis', 
    element: <ProtectedRoute><AIAnalysisPanel /></ProtectedRoute> 
  },
  
  // Catch-all 404 route (must be last)
  { path: '*', element: <NotFound /> }
];
