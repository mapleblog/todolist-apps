/**
 * Performance monitoring utilities
 * Provides tools for tracking and optimizing application performance
 */

// Performance metrics interface
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  bundleSize?: number;
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  timestamp: number;
  domContentLoaded?: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  performanceScore?: number;
  webVitals?: {
    CLS?: number;
    FID?: number;
    LCP?: number;
    FCP?: number;
    TTFB?: number;
  };
}

// Performance observer for tracking metrics
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private observer: PerformanceObserver | null = null;

  private constructor() {
    this.initializeObserver();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObserver(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        this.observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.processEntry(entry);
          });
        });

        this.observer.observe({ entryTypes: ['navigation', 'paint', 'measure'] });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  private processEntry(entry: PerformanceEntry): void {
    const metric: PerformanceMetrics = {
      loadTime: entry.duration,
      renderTime: entry.startTime,
      timestamp: Date.now(),
    };

    // Add memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metric.memoryUsage = memory.usedJSHeapSize;
    }

    this.metrics.push(metric);

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  public recordWebVital(name: string, value: number): void {
    const metric: PerformanceMetrics = {
      loadTime: 0,
      renderTime: 0,
      timestamp: Date.now(),
      [name]: value
    };
    this.metrics.push(metric);
  }

  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  public getAverageLoadTime(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, metric) => sum + metric.loadTime, 0);
    return total / this.metrics.length;
  }

  public clearMetrics(): void {
    this.metrics = [];
  }

  public disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Web Vitals integration
export const trackWebVitals = async (): Promise<void> => {
  try {
    const webVitals = await import('web-vitals');
    
    if (webVitals.getCLS) {
       webVitals.getCLS((metric) => {
         performanceMonitor.recordWebVital('CLS', metric.value);
       });
     }
     
     if (webVitals.getFID) {
       webVitals.getFID((metric) => {
         performanceMonitor.recordWebVital('FID', metric.value);
       });
     }
     
     if (webVitals.getFCP) {
       webVitals.getFCP((metric) => {
         performanceMonitor.recordWebVital('FCP', metric.value);
       });
     }
     
     if (webVitals.getLCP) {
       webVitals.getLCP((metric) => {
         performanceMonitor.recordWebVital('LCP', metric.value);
       });
     }
     
     if (webVitals.getTTFB) {
       webVitals.getTTFB((metric) => {
         performanceMonitor.recordWebVital('TTFB', metric.value);
       });
     }
  } catch (error) {
    console.warn('Web Vitals not available:', error);
  }
};

// Bundle analyzer helper
export const analyzeBundleSize = (): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle analysis is available in production build');
    console.log('Run: npm run build && npm run analyze');
  }
};

// Memory usage tracker
export const trackMemoryUsage = (): void => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log('Memory Usage:', {
      used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`,
    });
  } else {
    console.log('Memory API not supported in this browser');
  }
};

// Performance timing helper
export const measurePerformance = (name: string, fn: () => void | Promise<void>): void => {
  const start = performance.now();
  
  const finish = () => {
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
  };

  try {
    const result = fn();
    if (result instanceof Promise) {
      result.finally(finish);
    } else {
      finish();
    }
  } catch (error) {
    finish();
    throw error;
  }
};

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Initialize performance tracking
export const initializePerformanceTracking = async (): Promise<void> => {
  // Track web vitals
  await trackWebVitals();

  // Log initial memory usage
  trackMemoryUsage();

  // Set up periodic memory tracking in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(trackMemoryUsage, 30000); // Every 30 seconds
  }
};