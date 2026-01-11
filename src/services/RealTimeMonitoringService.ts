interface MonitoringEvent {
  id: string;
  type: 'metric' | 'alert' | 'status' | 'sla' | 'business';
  timestamp: Date;
  data: any;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

class RealTimeMonitoringService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private subscribers: Map<string, Set<(event: MonitoringEvent) => void>> = new Map();
  private isConnecting = false;
  private isConnected = false;

  constructor(config: WebSocketConfig) {
    this.config = config;
  }

  // Connect to WebSocket server
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || this.isConnected) {
        resolve();
        return;
      }

      this.isConnecting = true;
      
      try {
        this.ws = new WebSocket(this.config.url);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected to monitoring service');
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const monitoringEvent: MonitoringEvent = JSON.parse(event.data);
            this.handleEvent(monitoringEvent);
          } catch (error) {
            console.error('Failed to parse monitoring event:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;
          this.isConnecting = false;
          this.stopHeartbeat();
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

        // Connection timeout
        setTimeout(() => {
          if (this.isConnecting) {
            this.isConnecting = false;
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
  }

  // Subscribe to specific event types
  subscribe(eventType: string, callback: (event: MonitoringEvent) => void): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(eventType);
        }
      }
    };
  }

  // Send message to server
  send(eventType: string, data: any): void {
    if (this.isConnected && this.ws) {
      const event: MonitoringEvent = {
        id: this.generateId(),
        type: eventType as any,
        timestamp: new Date(),
        data,
        source: 'client',
        severity: 'low'
      };
      this.ws.send(JSON.stringify(event));
    } else {
      console.warn('WebSocket not connected, message not sent');
    }
  }

  // Get connection status
  getStatus(): 'connecting' | 'connected' | 'disconnected' | 'reconnecting' {
    if (this.isConnecting) return 'connecting';
    if (this.isConnected) return 'connected';
    if (this.reconnectAttempts > 0) return 'reconnecting';
    return 'disconnected';
  }

  // Handle incoming events
  private handleEvent(event: MonitoringEvent): void {
    const callbacks = this.subscribers.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }

    // Also send to 'all' subscribers
    const allCallbacks = this.subscribers.get('all');
    if (allCallbacks) {
      allCallbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }
  }

  // Handle reconnection logic
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, this.config.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  // Start heartbeat to keep connection alive
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws) {
        this.send('heartbeat', { timestamp: Date.now() });
      }
    }, this.config.heartbeatInterval);
  }

  // Stop heartbeat
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Generate unique ID
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Production monitoring service singleton
class ProductionMonitoringService extends RealTimeMonitoringService {
  private static instance: ProductionMonitoringService;

  private constructor() {
    super({
      url: process.env.NODE_ENV === 'production' 
        ? 'wss://your-production-monitoring.com/ws'
        : 'ws://localhost:8080/ws',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000
    });
  }

  public static getInstance(): ProductionMonitoringService {
    if (!ProductionMonitoringService.instance) {
      ProductionMonitoringService.instance = new ProductionMonitoringService();
    }
    return ProductionMonitoringService.instance;
  }

  // Production-specific methods
  public async getSystemHealth(): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Health check timeout')), 5000);
      
      const unsubscribe = this.subscribe('health-response', (event) => {
        clearTimeout(timeout);
        unsubscribe();
        resolve(event.data);
      });
      
      this.send('health-check', {});
    });
  }

  public async getMetrics(timeRange: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Metrics timeout')), 10000);
      
      const unsubscribe = this.subscribe('metrics-response', (event) => {
        clearTimeout(timeout);
        unsubscribe();
        resolve(event.data);
      });
      
      this.send('get-metrics', { timeRange });
    });
  }

  public async getAlerts(severity?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Alerts timeout')), 5000);
      
      const unsubscribe = this.subscribe('alerts-response', (event) => {
        clearTimeout(timeout);
        unsubscribe();
        resolve(event.data);
      });
      
      this.send('get-alerts', { severity });
    });
  }

  public acknowledgeAlert(alertId: string): void {
    this.send('acknowledge-alert', { alertId });
  }

  public assignAlert(alertId: string, assigneeId: string): void {
    this.send('assign-alert', { alertId, assigneeId });
  }

  public escalateAlert(alertId: string, reason: string): void {
    this.send('escalate-alert', { alertId, reason });
  }
}

// Export singleton instance
export const monitoringService = ProductionMonitoringService.getInstance();

// Export types
export type { MonitoringEvent, WebSocketConfig };
export { RealTimeMonitoringService, ProductionMonitoringService };
