import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRealUserMonitoring } from '@/hooks/useRealUserMonitoring';
import { Activity, Zap, Clock, Eye } from 'lucide-react';

interface PerformanceMetrics {
  cls: number;
  fid: number;
  fcp: number;
  lcp: number;
  ttfb: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [isVisible, setIsVisible] = useState(false);
  const { trackPageView } = useRealUserMonitoring();

  useEffect(() => {
    // Track page view
    trackPageView(window.location.pathname);

    // Simulate metrics collection (in real app, these would come from web-vitals)
    const timer = setTimeout(() => {
      setMetrics({
        cls: 0.1,
        fid: 50,
        fcp: 1200,
        lcp: 2100,
        ttfb: 300
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [trackPageView]);

  const getRating = (metric: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const thresholds = {
      cls: [0.1, 0.25],
      fid: [100, 300],
      fcp: [1800, 3000],
      lcp: [2500, 4000],
      ttfb: [800, 1800]
    };

    const [good, poor] = thresholds[metric as keyof typeof thresholds] || [0, 0];
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  };

  const getBadgeVariant = (rating: string) => {
    switch (rating) {
      case 'good': return 'default';
      case 'needs-improvement': return 'secondary';
      case 'poor': return 'destructive';
      default: return 'outline';
    }
  };

  const getProgressValue = (metric: string, value: number): number => {
    const maxValues = {
      cls: 0.5,
      fid: 500,
      fcp: 4000,
      lcp: 5000,
      ttfb: 2000
    };

    const max = maxValues[metric as keyof typeof maxValues] || 100;
    return Math.min((value / max) * 100, 100);
  };

  // Toggle visibility for development
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible]);

  if (!isVisible && import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 bg-background/95 backdrop-blur-sm border shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4" />
            Performance Monitor
          </CardTitle>
          <CardDescription className="text-xs">
            Real-time web vitals and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(metrics).map(([key, value]) => {
            const rating = getRating(key, value);
            const progress = getProgressValue(key, value);
            
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {key === 'cls' && <Zap className="h-3 w-3" />}
                    {key === 'fid' && <Clock className="h-3 w-3" />}
                    {key === 'fcp' && <Eye className="h-3 w-3" />}
                    {key === 'lcp' && <Activity className="h-3 w-3" />}
                    {key === 'ttfb' && <Clock className="h-3 w-3" />}
                    <span className="text-xs font-medium uppercase">{key}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">
                      {key === 'cls' ? value.toFixed(3) : `${Math.round(value)}ms`}
                    </span>
                    <Badge variant={getBadgeVariant(rating)} className="text-xs px-1">
                      {rating === 'good' ? '✓' : rating === 'needs-improvement' ? '⚠' : '✗'}
                    </Badge>
                  </div>
                </div>
                <Progress value={progress} className="h-1" />
              </div>
            );
          })}
          
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Press Ctrl+Shift+P to toggle • Session: {sessionStorage.getItem('session_id')?.slice(-8)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}