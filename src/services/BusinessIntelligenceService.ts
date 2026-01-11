interface BusinessMetrics {
  revenue: {
    current: number;
    previous: number;
    growth: number;
    forecast: number;
  };
  users: {
    active: number;
    new: number;
    churned: number;
    retention: number;
  };
  transactions: {
    total: number;
    successful: number;
    failed: number;
    averageValue: number;
  };
  performance: {
    responseTime: number;
    uptime: number;
    errorRate: number;
    throughput: number;
  };
  costs: {
    infrastructure: number;
    operations: number;
    support: number;
    total: number;
  };
  satisfaction: {
    score: number;
    tickets: number;
    resolutionTime: number;
    nps: number;
  };
}

interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  category: 'revenue' | 'performance' | 'customer' | 'operational';
  trend: 'up' | 'down' | 'stable';
  status: 'on-track' | 'at-risk' | 'off-track';
  lastUpdated: Date;
}

interface BusinessReport {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  generatedAt: Date;
  metrics: BusinessMetrics;
  kpis: KPI[];
  insights: string[];
  recommendations: string[];
}

class BusinessIntelligenceService {
  private apiBaseUrl: string;
  private apiKey: string;

  constructor() {
    this.apiBaseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.your-business-intelligence.com'
      : 'http://localhost:3001/api';
    this.apiKey = process.env.BI_API_KEY || 'dev-api-key';
  }

  // Get comprehensive business metrics
  async getBusinessMetrics(timeRange: string = '24h'): Promise<BusinessMetrics> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/metrics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch business metrics:', error);
      // Return mock data for development
      return this.getMockBusinessMetrics();
    }
  }

  // Get KPIs
  async getKPIs(category?: string): Promise<KPI[]> {
    try {
      const url = category 
        ? `${this.apiBaseUrl}/kpis?category=${category}`
        : `${this.apiBaseUrl}/kpis`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch KPIs:', error);
      return this.getMockKPIs();
    }
  }

  // Generate business report
  async generateReport(type: 'daily' | 'weekly' | 'monthly' | 'quarterly'): Promise<BusinessReport> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/reports/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to generate report:', error);
      return this.getMockReport(type);
    }
  }

  // Get revenue analytics
  async getRevenueAnalytics(timeRange: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/analytics/revenue?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch revenue analytics:', error);
      return this.getMockRevenueAnalytics();
    }
  }

  // Get customer analytics
  async getCustomerAnalytics(timeRange: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/analytics/customers?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch customer analytics:', error);
      return this.getMockCustomerAnalytics();
    }
  }

  // Get cost analysis
  async getCostAnalysis(timeRange: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/analytics/costs?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch cost analysis:', error);
      return this.getMockCostAnalysis();
    }
  }

  // Predictive analytics
  async getPredictions(metric: string, horizon: number): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/predictions/${metric}?horizon=${horizon}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
      return this.getMockPredictions(metric, horizon);
    }
  }

  // Mock data methods for development
  private getMockBusinessMetrics(): BusinessMetrics {
    return {
      revenue: {
        current: 125000,
        previous: 110000,
        growth: 13.6,
        forecast: 135000
      },
      users: {
        active: 12500,
        new: 850,
        churned: 120,
        retention: 94.2
      },
      transactions: {
        total: 75000,
        successful: 74250,
        failed: 750,
        averageValue: 1.67
      },
      performance: {
        responseTime: 145,
        uptime: 99.92,
        errorRate: 0.8,
        throughput: 1250
      },
      costs: {
        infrastructure: 15000,
        operations: 8000,
        support: 5000,
        total: 28000
      },
      satisfaction: {
        score: 4.3,
        tickets: 145,
        resolutionTime: 2.5,
        nps: 42
      }
    };
  }

  private getMockKPIs(): KPI[] {
    return [
      {
        id: '1',
        name: 'Monthly Recurring Revenue',
        value: 125000,
        target: 130000,
        unit: '$',
        category: 'revenue',
        trend: 'up',
        status: 'on-track',
        lastUpdated: new Date()
      },
      {
        id: '2',
        name: 'Customer Acquisition Cost',
        value: 85,
        target: 100,
        unit: '$',
        category: 'customer',
        trend: 'down',
        status: 'on-track',
        lastUpdated: new Date()
      },
      {
        id: '3',
        name: 'System Uptime',
        value: 99.92,
        target: 99.9,
        unit: '%',
        category: 'performance',
        trend: 'stable',
        status: 'on-track',
        lastUpdated: new Date()
      },
      {
        id: '4',
        name: 'Net Promoter Score',
        value: 42,
        target: 45,
        unit: '',
        category: 'customer',
        trend: 'up',
        status: 'at-risk',
        lastUpdated: new Date()
      }
    ];
  }

  private getMockReport(type: string): BusinessReport {
    return {
      id: Date.now().toString(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Business Report`,
      type: type as any,
      generatedAt: new Date(),
      metrics: this.getMockBusinessMetrics(),
      kpis: this.getMockKPIs(),
      insights: [
        'Revenue growth is strong at 13.6% month-over-month',
        'Customer retention has improved by 2.1%',
        'System performance is meeting SLA requirements',
        'Cost per acquisition is below target'
      ],
      recommendations: [
        'Focus on expanding high-value customer segments',
        'Invest in customer success programs to improve NPS',
        'Optimize infrastructure costs during off-peak hours',
        'Implement predictive maintenance for critical systems'
      ]
    };
  }

  private getMockRevenueAnalytics(): any {
    return {
      daily: [
        { date: '2024-01-01', revenue: 4200 },
        { date: '2024-01-02', revenue: 4800 },
        { date: '2024-01-03', revenue: 5100 },
        { date: '2024-01-04', revenue: 4900 },
        { date: '2024-01-05', revenue: 5300 }
      ],
      bySegment: [
        { segment: 'Enterprise', revenue: 75000, percentage: 60 },
        { segment: 'SMB', revenue: 37500, percentage: 30 },
        { segment: 'Startup', revenue: 12500, percentage: 10 }
      ],
      byRegion: [
        { region: 'North America', revenue: 62500, percentage: 50 },
        { region: 'Europe', revenue: 37500, percentage: 30 },
        { region: 'Asia Pacific', revenue: 25000, percentage: 20 }
      ]
    };
  }

  private getMockCustomerAnalytics(): any {
    return {
      acquisition: {
        channels: [
          { channel: 'Organic', users: 350, percentage: 41 },
          { channel: 'Paid Ads', users: 280, percentage: 33 },
          { channel: 'Referral', users: 170, percentage: 20 },
          { channel: 'Direct', users: 50, percentage: 6 }
        ],
        cost: [
          { channel: 'Organic', cost: 0, cac: 0 },
          { channel: 'Paid Ads', cost: 14000, cac: 50 },
          { channel: 'Referral', cost: 3400, cac: 20 },
          { channel: 'Direct', cost: 2500, cac: 50 }
        ]
      },
      retention: {
        cohorts: [
          { cohort: '2024-01', size: 850, retained: 820, rate: 96.5 },
          { cohort: '2023-12', size: 920, retained: 880, rate: 95.7 },
          { cohort: '2023-11', size: 980, retained: 920, rate: 93.9 }
        ]
      },
      behavior: {
        avgSessionDuration: 8.5,
        pagesPerSession: 12.3,
        bounceRate: 32.1,
        conversionRate: 3.2
      }
    };
  }

  private getMockCostAnalysis(): any {
    return {
      breakdown: [
        { category: 'Infrastructure', cost: 15000, percentage: 53.6 },
        { category: 'Personnel', cost: 8000, percentage: 28.6 },
        { category: 'Marketing', cost: 3000, percentage: 10.7 },
        { category: 'Operations', cost: 2000, percentage: 7.1 }
      ],
      trends: [
        { month: '2023-09', cost: 25000 },
        { month: '2023-10', cost: 26000 },
        { month: '2023-11', cost: 27000 },
        { month: '2023-12', cost: 27500 },
        { month: '2024-01', cost: 28000 }
      ],
      efficiency: {
        costPerUser: 2.24,
        costPerTransaction: 0.37,
        costPerRevenue: 0.224
      }
    };
  }

  private getMockPredictions(metric: string, horizon: number): any {
    const baseValue = metric === 'revenue' ? 125000 : metric === 'users' ? 12500 : 75000;
    const growthRate = metric === 'revenue' ? 0.02 : metric === 'users' ? 0.03 : 0.015;
    
    const predictions = [];
    for (let i = 1; i <= horizon; i++) {
      const predictedValue = baseValue * Math.pow(1 + growthRate, i);
      const confidence = Math.max(0.7, 0.95 - (i * 0.05));
      
      predictions.push({
        period: `+${i} ${horizon <= 30 ? 'days' : horizon <= 90 ? 'weeks' : 'months'}`,
        value: predictedValue,
        confidence,
        upperBound: predictedValue * (1 + (1 - confidence)),
        lowerBound: predictedValue * (1 - (1 - confidence))
      });
    }
    
    return {
      metric,
      horizon,
      predictions,
      accuracy: 0.87,
      model: 'ensemble'
    };
  }
}

// Export singleton instance
export const biService = new BusinessIntelligenceService();

// Export types
export type { BusinessMetrics, KPI, BusinessReport };
