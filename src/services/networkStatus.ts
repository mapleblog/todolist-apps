export type NetworkStatus = 'online' | 'offline' | 'unknown';

export interface NetworkStatusListener {
  (status: NetworkStatus): void;
}

export class NetworkStatusService {
  private static instance: NetworkStatusService;
  private listeners: Set<NetworkStatusListener> = new Set();
  private currentStatus: NetworkStatus = 'unknown';
  private isInitialized = false;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): NetworkStatusService {
    if (!NetworkStatusService.instance) {
      NetworkStatusService.instance = new NetworkStatusService();
    }
    return NetworkStatusService.instance;
  }

  private initialize(): void {
    if (this.isInitialized) return;

    // Initial status check
    this.updateStatus();

    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Additional connection check using fetch with timeout
    this.startPeriodicCheck();

    this.isInitialized = true;
  }

  private handleOnline(): void {
    this.setStatus('online');
  }

  private handleOffline(): void {
    this.setStatus('offline');
  }

  private updateStatus(): void {
    if (navigator.onLine) {
      // Even if navigator.onLine is true, we should verify actual connectivity
      this.verifyConnectivity();
    } else {
      this.setStatus('offline');
    }
  }

  private async verifyConnectivity(): Promise<void> {
    try {
      // Try to fetch a small resource with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status === 404) {
        // 404 is fine, it means we can reach the server
        this.setStatus('online');
      } else {
        this.setStatus('offline');
      }
    } catch (error) {
      // Network error or timeout
      this.setStatus('offline');
    }
  }

  private setStatus(status: NetworkStatus): void {
    if (this.currentStatus !== status) {
      const previousStatus = this.currentStatus;
      this.currentStatus = status;
      
      console.log(`Network status changed: ${previousStatus} -> ${status}`);
      
      // Notify all listeners
      this.listeners.forEach(listener => {
        try {
          listener(status);
        } catch (error) {
          console.error('Error in network status listener:', error);
        }
      });
    }
  }

  private startPeriodicCheck(): void {
    // Check connectivity every 30 seconds when online
    // Check every 10 seconds when offline (to detect when back online)
    const checkInterval = () => {
      const interval = this.currentStatus === 'offline' ? 10000 : 30000;
      setTimeout(() => {
        this.updateStatus();
        checkInterval();
      }, interval);
    };

    checkInterval();
  }

  // Public methods
  public getStatus(): NetworkStatus {
    return this.currentStatus;
  }

  public isOnline(): boolean {
    return this.currentStatus === 'online';
  }

  public isOffline(): boolean {
    return this.currentStatus === 'offline';
  }

  public addListener(listener: NetworkStatusListener): void {
    this.listeners.add(listener);
  }

  public removeListener(listener: NetworkStatusListener): void {
    this.listeners.delete(listener);
  }

  public removeAllListeners(): void {
    this.listeners.clear();
  }

  // Force a connectivity check
  public async checkConnectivity(): Promise<NetworkStatus> {
    await this.verifyConnectivity();
    return this.currentStatus;
  }

  // Get connection quality estimate (simple implementation)
  public async getConnectionQuality(): Promise<'fast' | 'slow' | 'offline'> {
    if (this.currentStatus === 'offline') {
      return 'offline';
    }

    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;

      // Simple heuristic: < 1000ms = fast, >= 1000ms = slow
      return duration < 1000 ? 'fast' : 'slow';
    } catch (error) {
      return 'offline';
    }
  }

  // Cleanup method
  public destroy(): void {
    if (this.isInitialized) {
      window.removeEventListener('online', this.handleOnline.bind(this));
      window.removeEventListener('offline', this.handleOffline.bind(this));
      this.removeAllListeners();
      this.isInitialized = false;
    }
  }
}

// Export singleton instance
export default NetworkStatusService.getInstance();

// React hook for using network status in components
export function useNetworkStatus() {
  const [status, setStatus] = React.useState<NetworkStatus>(
    NetworkStatusService.getInstance().getStatus()
  );

  React.useEffect(() => {
    const networkService = NetworkStatusService.getInstance();
    const listener: NetworkStatusListener = (newStatus) => {
      setStatus(newStatus);
    };

    networkService.addListener(listener);

    // Get initial status
    setStatus(networkService.getStatus());

    return () => {
      networkService.removeListener(listener);
    };
  }, []);

  return {
    status,
    isOnline: status === 'online',
    isOffline: status === 'offline',
    isUnknown: status === 'unknown'
  };
}

// Import React for the hook
import React from 'react';