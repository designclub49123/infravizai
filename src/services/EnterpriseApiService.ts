interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
}

class EnterpriseApiService {
  private config: ApiConfig;
  private rateLimitInfo: RateLimitInfo | null = null;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseUrl: process.env.NODE_ENV === 'production' 
        ? 'https://api.enterprise-infraviz.com'
        : 'http://localhost:3001/api',
      apiKey: process.env.ENTERPRISE_API_KEY || 'dev-api-key',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };
  }

  // Generic API request method with retry logic
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    customConfig?: Partial<ApiConfig>
  ): Promise<ApiResponse<T>> {
    const config = { ...this.config, ...customConfig };
    const url = `${config.baseUrl}${endpoint}`;
    
    const headers = {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'X-Request-ID': this.generateRequestId(),
      'X-Client-Version': '1.0.0',
      ...options.headers
    };

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= config.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);
        
        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Handle rate limiting
        if (response.status === 429) {
          const rateLimitData = await this.handleRateLimit(response);
          if (rateLimitData) {
            await this.waitForRateLimitReset(rateLimitData.resetTime);
            continue;
          }
        }
        
        // Handle successful responses
        if (response.ok) {
          const data = await response.json();
          this.updateRateLimitInfo(response);
          return data;
        }
        
        // Handle error responses
        const errorData = await response.json().catch(() => ({}));
        lastError = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        
        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          break;
        }
        
        // Retry on server errors (5xx)
        if (attempt < config.retryAttempts) {
          await this.delay(config.retryDelay * attempt);
        }
        
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on abort
        if (error instanceof Error && error.name === 'AbortError') {
          break;
        }
        
        // Retry on network errors
        if (attempt < config.retryAttempts) {
          await this.delay(config.retryDelay * attempt);
        }
      }
    }
    
    throw lastError || new Error('Request failed');
  }

  // Infrastructure Management API
  async getInfrastructure(filter?: {
    region?: string;
    environment?: string;
    type?: string;
  }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams(filter as any).toString();
    return this.makeRequest(`/infrastructure${params ? '?' + params : ''}`);
  }

  async createInfrastructure(data: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/infrastructure', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateInfrastructure(id: string, data: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/infrastructure/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteInfrastructure(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest(`/infrastructure/${id}`, {
      method: 'DELETE'
    });
  }

  // Monitoring API
  async getMetrics(filter?: {
    timeRange?: string;
    resourceType?: string;
    region?: string;
  }): Promise<ApiResponse<any>> {
    const params = new URLSearchParams(filter as any).toString();
    return this.makeRequest(`/monitoring/metrics${params ? '?' + params : ''}`);
  }

  async getAlerts(filter?: {
    severity?: string;
    status?: string;
    timeRange?: string;
  }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams(filter as any).toString();
    return this.makeRequest(`/monitoring/alerts${params ? '?' + params : ''}`);
  }

  async acknowledgeAlert(alertId: string, note?: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/monitoring/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ note })
    });
  }

  async escalateAlert(alertId: string, reason: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/monitoring/alerts/${alertId}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  // User Management API
  async getUsers(filter?: {
    role?: string;
    status?: string;
    department?: string;
  }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams(filter as any).toString();
    return this.makeRequest(`/users${params ? '?' + params : ''}`);
  }

  async createUser(data: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateUser(id: string, data: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest(`/users/${id}`, {
      method: 'DELETE'
    });
  }

  // Team Management API
  async getTeams(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/teams');
  }

  async createTeam(data: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/teams', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async addTeamMember(teamId: string, userId: string, role: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, role })
    });
  }

  // Business Intelligence API
  async getBusinessMetrics(timeRange: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/bi/metrics?timeRange=${timeRange}`);
  }

  async getKPIs(category?: string): Promise<ApiResponse<any[]>> {
    const params = category ? `?category=${category}` : '';
    return this.makeRequest(`/bi/kpis${params}`);
  }

  async generateReport(type: string, filters?: any): Promise<ApiResponse<any>> {
    const params = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.makeRequest(`/bi/reports/generate${params}`, {
      method: 'POST',
      body: JSON.stringify({ type })
    });
  }

  // Security API
  async getSecurityAudit(): Promise<ApiResponse<any>> {
    return this.makeRequest('/security/audit');
  }

  async getComplianceStatus(): Promise<ApiResponse<any>> {
    return this.makeRequest('/security/compliance');
  }

  async runSecurityScan(resourceId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/security/scan/${resourceId}`, {
      method: 'POST'
    });
  }

  // Cost Management API
  async getCostAnalysis(timeRange: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/costs/analysis?timeRange=${timeRange}`);
  }

  async getCostOptimization(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/costs/optimization');
  }

  async setBudgetAlert(threshold: number): Promise<ApiResponse<any>> {
    return this.makeRequest('/costs/budget-alert', {
      method: 'POST',
      body: JSON.stringify({ threshold })
    });
  }

  // Automation API
  async getAutomationRules(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/automation/rules');
  }

  async createAutomationRule(data: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/automation/rules', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async executeAutomation(ruleId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/automation/rules/${ruleId}/execute`, {
      method: 'POST'
    });
  }

  // Integration API
  async getIntegrations(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/integrations');
  }

  async configureIntegration(type: string, config: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/integrations/${type}`, {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  async testIntegration(type: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/integrations/${type}/test`, {
      method: 'POST'
    });
  }

  // Utility methods
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async handleRateLimit(response: Response): Promise<RateLimitInfo | null> {
    const limit = response.headers.get('X-RateLimit-Limit');
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const resetTime = response.headers.get('X-RateLimit-Reset');
    
    if (limit && remaining && resetTime) {
      return {
        limit: parseInt(limit),
        remaining: parseInt(remaining),
        resetTime: parseInt(resetTime)
      };
    }
    
    return null;
  }

  private async waitForRateLimitReset(resetTime: number): Promise<void> {
    const now = Date.now();
    const waitTime = Math.max(0, resetTime - now);
    
    if (waitTime > 0) {
      await this.delay(waitTime);
    }
  }

  private updateRateLimitInfo(response: Response): void {
    const limit = response.headers.get('X-RateLimit-Limit');
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const resetTime = response.headers.get('X-RateLimit-Reset');
    
    if (limit && remaining && resetTime) {
      this.rateLimitInfo = {
        limit: parseInt(limit),
        remaining: parseInt(remaining),
        resetTime: parseInt(resetTime)
      };
    }
  }

  // Public utility methods
  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/health');
      return response.success;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const enterpriseApi = new EnterpriseApiService();

// Export types
export type { ApiConfig, ApiResponse, RateLimitInfo };
