import React from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface UserAction {
  action: string;
  component: string;
  timestamp: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private userActions: UserAction[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.setupPerformanceObserver();
    this.trackPageLoad();
  }

  // Track custom metrics
  trackMetric(name: string, value: number, metadata?: Record<string, any>) {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);
    this.sendMetricIfNeeded(metric);
  }

  // Track user actions
  trackUserAction(action: string, component: string, metadata?: Record<string, any>) {
    if (!this.isEnabled) return;

    const userAction: UserAction = {
      action,
      component,
      timestamp: Date.now(),
      metadata
    };

    this.userActions.push(userAction);
  }

  // Track API call performance
  trackAPICall(endpoint: string, method: string, duration: number, status: number) {
    this.trackMetric('api_call', duration, {
      endpoint,
      method,
      status,
      type: 'api_performance'
    });
  }

  // Track component render time
  trackComponentRender(componentName: string, renderTime: number) {
    this.trackMetric('component_render', renderTime, {
      component: componentName,
      type: 'render_performance'
    });
  }

  // Track deck processing time
  trackDeckProcessing(deckId: string, processingTime: number, cardCount: number) {
    this.trackMetric('deck_processing', processingTime, {
      deckId,
      cardCount,
      type: 'deck_performance'
    });
  }

  // Track card generation time
  trackCardGeneration(cardId: string, generationTime: number, type: 'initial' | 'reroll') {
    this.trackMetric('card_generation', generationTime, {
      cardId,
      type: `card_${type}`,
      category: 'generation_performance'
    });
  }

  // Setup Performance Observer for Web Vitals
  private setupPerformanceObserver() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.trackMetric('lcp', lastEntry.startTime, { type: 'web_vital' });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.trackMetric('fid', entry.processingStart - entry.startTime, { type: 'web_vital' });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.trackMetric('cls', clsValue, { type: 'web_vital' });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  // Track page load performance
  private trackPageLoad() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          this.trackMetric('page_load', navigation.loadEventEnd - navigation.fetchStart, {
            type: 'page_performance',
            dns: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcp: navigation.connectEnd - navigation.connectStart,
            request: navigation.responseStart - navigation.requestStart,
            response: navigation.responseEnd - navigation.responseStart,
            dom: navigation.domContentLoadedEventEnd - navigation.responseEnd
          });
        }
      }, 0);
    });
  }

  // Get performance summary
  getPerformanceSummary() {
    const summary = {
      totalMetrics: this.metrics.length,
      totalUserActions: this.userActions.length,
      averageAPITime: this.getAverageMetric('api_call'),
      averageRenderTime: this.getAverageMetric('component_render'),
      webVitals: {
        lcp: this.getLatestMetric('lcp'),
        fid: this.getLatestMetric('fid'),
        cls: this.getLatestMetric('cls')
      },
      recentActions: this.userActions.slice(-10)
    };

    return summary;
  }

  // Helper methods
  private getAverageMetric(name: string): number {
    const relevantMetrics = this.metrics.filter(m => m.name === name);
    if (relevantMetrics.length === 0) return 0;
    
    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / relevantMetrics.length;
  }

  private getLatestMetric(name: string): number | null {
    const relevantMetrics = this.metrics.filter(m => m.name === name);
    if (relevantMetrics.length === 0) return null;
    
    return relevantMetrics[relevantMetrics.length - 1].value;
  }

  // Send metrics to analytics service (placeholder)
  private sendMetricIfNeeded(metric: PerformanceMetric) {
    // In a real implementation, you might send to analytics services like:
    // - Google Analytics
    // - DataDog
    // - New Relic
    // - Custom analytics endpoint
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metric:', metric);
    }

    // Example: Send to custom analytics endpoint
    // this.sendToAnalytics(metric);
  }

  // Placeholder for sending to analytics service
  private async sendToAnalytics(metric: PerformanceMetric) {
    try {
      // await fetch('/api/analytics/metrics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(metric)
      // });
    } catch (error) {
      console.warn('Failed to send metric to analytics:', error);
    }
  }

  // Enable/disable monitoring
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // Clear stored metrics (useful for memory management)
  clearMetrics() {
    this.metrics = [];
    this.userActions = [];
  }

  // Export data for debugging
  exportData() {
    return {
      metrics: this.metrics,
      userActions: this.userActions,
      summary: this.getPerformanceSummary()
    };
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React Hook for easy component integration
export const usePerformanceTracking = (componentName: string) => {
  const trackAction = (action: string, metadata?: Record<string, any>) => {
    performanceMonitor.trackUserAction(action, componentName, metadata);
  };

  const trackRender = (renderTime: number) => {
    performanceMonitor.trackComponentRender(componentName, renderTime);
  };

  return { trackAction, trackRender };
};

// Higher-order component for automatic performance tracking
export const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return (props: P) => {
    const startTime = performance.now();
    
    React.useEffect(() => {
      const endTime = performance.now();
      performanceMonitor.trackComponentRender(componentName, endTime - startTime);
    });

    return React.createElement(WrappedComponent, props);
  };
};

export default performanceMonitor;