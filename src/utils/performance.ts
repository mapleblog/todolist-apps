/**
 * Performance monitoring utilities
 * Provides tools for tracking and optimizing application performance
 */

// Performance metrics interface
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  bundleSize?: number;
  memoryUsage?: number;
  timestamp: number;
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

// Web Vitals tracking
export const trackWebVitals = (onPerfEntry?: (metric: any) => void): void => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    }).catch((error) => {
      console.warn('Web Vitals not available:', error);
    });
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
export const initializePerformanceTracking = (): void => {
  // Track web vitals
  trackWebVitals((metric) => {
    console.log('Web Vital:', metric);
  });

  // Log initial memory usage
  trackMemoryUsage();

  // Set up periodic memory tracking in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(trackMemoryUsage, 30000); // Every 30 seconds
  }
};