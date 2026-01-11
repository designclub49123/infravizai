// Production Configuration
export const PRODUCTION_CONFIG = {
  // API Configuration
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'https://api.infraviz.ai',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // WebSocket Configuration
  websocket: {
    url: process.env.REACT_APP_WS_URL || 'wss://ws.infraviz.ai',
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000,
  },

  // Monitoring Configuration
  monitoring: {
    enabled: true,
    metricsInterval: 5000,
    alertThresholds: {
      cpu: 80,
      memory: 85,
      disk: 90,
      responseTime: 500,
      errorRate: 5,
    },
    slaTargets: {
      uptime: 99.9,
      responseTime: 200,
      errorRate: 1,
    },
  },

  // Business Intelligence Configuration
  bi: {
    enabled: true,
    refreshInterval: 60000, // 1 minute
    cacheTimeout: 300000, // 5 minutes
    predictions: {
      enabled: true,
      horizon: 30, // days
      confidence: 0.8,
    },
  },

  // Security Configuration
  security: {
    encryption: {
      algorithm: 'AES-256-GCM',
      keySize: 256,
      enabled: true,
    },
    authentication: {
      sessionTimeout: 3600000, // 1 hour
      refreshTokenTimeout: 604800000, // 7 days
    },
    permissions: {
      levels: ['read', 'write', 'admin', 'superadmin'],
      default: 'read',
    },
  },

  // Performance Configuration
  performance: {
    caching: {
      enabled: true,
      ttl: 300000, // 5 minutes
      maxSize: 100, // MB
    },
    pagination: {
      defaultPageSize: 20,
      maxPageSize: 100,
    },
    debouncing: {
      search: 300,
      api: 500,
    },
  },

  // Feature Flags
  features: {
    realTimeMonitoring: process.env.REACT_APP_FEATURE_REAL_TIME === 'true',
    predictiveAnalytics: process.env.REACT_APP_FEATURE_PREDICTIVE === 'true',
    costOptimization: process.env.REACT_APP_FEATURE_COST_OPT === 'true',
    advancedSecurity: process.env.REACT_APP_FEATURE_ADVANCED_SEC === 'true',
    teamCollaboration: process.env.REACT_APP_FEATURE_TEAM_COLLAB === 'true',
    automation: process.env.REACT_APP_FEATURE_AUTOMATION === 'true',
  },

  // Environment Configuration
  environment: {
    name: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test',
  },

  // Logging Configuration
  logging: {
    level: process.env.REACT_APP_LOG_LEVEL || 'info',
    enabled: process.env.REACT_APP_LOGGING_ENABLED !== 'false',
    console: process.env.REACT_APP_CONSOLE_LOGGING !== 'false',
    remote: {
      enabled: process.env.REACT_APP_REMOTE_LOGGING === 'true',
      endpoint: process.env.REACT_APP_LOG_ENDPOINT,
      apiKey: process.env.REACT_APP_LOG_API_KEY,
    },
  },

  // Analytics Configuration
  analytics: {
    enabled: process.env.REACT_APP_ANALYTICS_ENABLED !== 'false',
    trackingId: process.env.REACT_APP_ANALYTICS_ID,
    sampleRate: parseFloat(process.env.REACT_APP_ANALYTICS_SAMPLE_RATE || '1.0'),
  },

  // Error Reporting
  errorReporting: {
    enabled: process.env.REACT_APP_ERROR_REPORTING !== 'false',
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.REACT_APP_VERSION,
  },

  // Support Configuration
  support: {
    chat: {
      enabled: process.env.REACT_APP_SUPPORT_CHAT === 'true',
      apiKey: process.env.REACT_APP_SUPPORT_CHAT_KEY,
    },
    documentation: {
      url: process.env.REACT_APP_DOCS_URL || 'https://docs.infraviz.ai',
    },
    helpCenter: {
      url: process.env.REACT_APP_HELP_CENTER_URL || 'https://help.infraviz.ai',
    },
  },

  // Integration Configuration
  integrations: {
    slack: {
      enabled: process.env.REACT_APP_SLACK_ENABLED === 'true',
      webhookUrl: process.env.REACT_APP_SLACK_WEBHOOK_URL,
    },
    teams: {
      enabled: process.env.REACT_APP_TEAMS_ENABLED === 'true',
      webhookUrl: process.env.REACT_APP_TEAMS_WEBHOOK_URL,
    },
    email: {
      enabled: process.env.REACT_APP_EMAIL_ENABLED !== 'false',
      provider: process.env.REACT_APP_EMAIL_PROVIDER || 'sendgrid',
      apiKey: process.env.REACT_APP_EMAIL_API_KEY,
    },
  },

  // Cost Management
  cost: {
    tracking: {
      enabled: process.env.REACT_APP_COST_TRACKING === 'true',
      budget: parseFloat(process.env.REACT_APP_COST_BUDGET || '10000'),
      alertThreshold: parseFloat(process.env.REACT_APP_COST_ALERT_THRESHOLD || '0.8'),
    },
    optimization: {
      enabled: process.env.REACT_APP_COST_OPTIMIZATION === 'true',
      recommendations: true,
      autoScaling: process.env.REACT_APP_AUTO_SCALING === 'true',
    },
  },

  // Compliance Configuration
  compliance: {
    gdpr: {
      enabled: process.env.REACT_APP_GDPR_COMPLIANT === 'true',
      cookieConsent: true,
      dataRetention: parseInt(process.env.REACT_APP_DATA_RETENTION || '365'),
    },
    soc2: {
      enabled: process.env.REACT_APP_SOC2_COMPLIANT === 'true',
      auditLogging: true,
      accessControl: true,
    },
    hipaa: {
      enabled: process.env.REACT_APP_HIPAA_COMPLIANT === 'true',
      encryption: true,
      auditTrail: true,
    },
  },

  // Backup Configuration
  backup: {
    enabled: process.env.REACT_APP_BACKUP_ENABLED === 'true',
    interval: process.env.REACT_APP_BACKUP_INTERVAL || 'daily',
    retention: parseInt(process.env.REACT_APP_BACKUP_RETENTION || '30'),
    encryption: process.env.REACT_APP_BACKUP_ENCRYPTION === 'true',
  },

  // Maintenance Configuration
  maintenance: {
    mode: process.env.REACT_APP_MAINTENANCE_MODE === 'true',
    message: process.env.REACT_APP_MAINTENANCE_MESSAGE || 'System under maintenance',
    startTime: process.env.REACT_APP_MAINTENANCE_START,
    endTime: process.env.REACT_APP_MAINTENANCE_END,
  },

  // Deployment Configuration
  deployment: {
    version: process.env.REACT_APP_VERSION || '1.0.0',
    buildTime: process.env.REACT_APP_BUILD_TIME,
    commitSha: process.env.REACT_APP_COMMIT_SHA,
    environment: process.env.REACT_APP_DEPLOYMENT_ENV || 'production',
  },

  // Performance Budgets
  performanceBudgets: {
    javascript: 244 * 1024, // 244KB
    css: 50 * 1024, // 50KB
    images: 500 * 1024, // 500KB
    fonts: 100 * 1024, // 100KB
    total: 1024 * 1024, // 1MB
  },

  // CDN Configuration
  cdn: {
    enabled: process.env.REACT_APP_CDN_ENABLED === 'true',
    url: process.env.REACT_APP_CDN_URL,
    cacheControl: process.env.REACT_APP_CDN_CACHE_CONTROL || 'public, max-age=31536000',
  },

  // Database Configuration
  database: {
    connectionPool: {
      min: parseInt(process.env.REACT_APP_DB_POOL_MIN || '5'),
      max: parseInt(process.env.REACT_APP_DB_POOL_MAX || '20'),
    },
    timeout: parseInt(process.env.REACT_APP_DB_TIMEOUT || '30000'),
    retryAttempts: parseInt(process.env.REACT_APP_DB_RETRY_ATTEMPTS || '3'),
  },

  // Cache Configuration
  cache: {
    redis: {
      enabled: process.env.REACT_APP_REDIS_ENABLED === 'true',
      url: process.env.REACT_APP_REDIS_URL,
      ttl: parseInt(process.env.REACT_APP_REDIS_TTL || '3600'),
    },
    memory: {
      maxSize: parseInt(process.env.REACT_APP_MEMORY_CACHE_SIZE || '100'),
      ttl: parseInt(process.env.REACT_APP_MEMORY_CACHE_TTL || '300'),
    },
  },

  // Search Configuration
  search: {
    provider: process.env.REACT_APP_SEARCH_PROVIDER || 'algolia',
    apiKey: process.env.REACT_APP_SEARCH_API_KEY,
    indexName: process.env.REACT_APP_SEARCH_INDEX,
    facets: ['region', 'type', 'status', 'team'],
  },

  // Notification Configuration
  notifications: {
    push: {
      enabled: process.env.REACT_APP_PUSH_NOTIFICATIONS === 'true',
      publicKey: process.env.REACT_APP_VAPID_PUBLIC_KEY,
    },
    email: {
      enabled: process.env.REACT_APP_EMAIL_NOTIFICATIONS !== 'false',
      templates: {
        welcome: 'welcome-template',
        alert: 'alert-template',
        report: 'report-template',
      },
    },
    inApp: {
      enabled: true,
      maxVisible: 5,
      duration: 5000,
    },
  },

  // Theme Configuration
  theme: {
    default: process.env.REACT_APP_DEFAULT_THEME || 'light',
    customColors: process.env.REACT_APP_CUSTOM_COLORS ? JSON.parse(process.env.REACT_APP_CUSTOM_COLORS) : {},
    branding: {
      logo: process.env.REACT_APP_BRAND_LOGO,
      primaryColor: process.env.REACT_APP_PRIMARY_COLOR || '#3b82f6',
      secondaryColor: process.env.REACT_APP_SECONDARY_COLOR || '#64748b',
    },
  },

  // Localization Configuration
  localization: {
    defaultLanguage: process.env.REACT_APP_DEFAULT_LANGUAGE || 'en',
    supportedLanguages: process.env.REACT_APP_SUPPORTED_LANGUAGES ? 
      process.env.REACT_APP_SUPPORTED_LANGUAGES.split(',') : ['en', 'es', 'fr', 'de', 'ja'],
    currency: process.env.REACT_APP_DEFAULT_CURRENCY || 'USD',
    timezone: process.env.REACT_APP_DEFAULT_TIMEZONE || 'UTC',
  },

  // API Rate Limiting
  rateLimiting: {
    requests: parseInt(process.env.REACT_APP_RATE_LIMIT_REQUESTS || '1000'),
    window: parseInt(process.env.REACT_APP_RATE_LIMIT_WINDOW || '3600000'), // 1 hour
    burst: parseInt(process.env.REACT_APP_RATE_LIMIT_BURST || '100'),
  },

  // Webhook Configuration
  webhooks: {
    secret: process.env.REACT_APP_WEBHOOK_SECRET,
    timeout: parseInt(process.env.REACT_APP_WEBHOOK_TIMEOUT || '10000'),
    retryAttempts: parseInt(process.env.REACT_APP_WEBHOOK_RETRY_ATTEMPTS || '3'),
  },

  // File Upload Configuration
  fileUpload: {
    maxFileSize: parseInt(process.env.REACT_APP_MAX_FILE_SIZE || '10485760'), // 10MB
    allowedTypes: process.env.REACT_APP_ALLOWED_FILE_TYPES ? 
      process.env.REACT_APP_ALLOWED_FILE_TYPES.split(',') : 
      ['image/jpeg', 'image/png', 'application/pdf', 'text/csv'],
    storage: process.env.REACT_APP_FILE_STORAGE || 's3',
    bucket: process.env.REACT_APP_S3_BUCKET,
  },

  // Export Configuration
  export: {
    formats: ['csv', 'xlsx', 'json', 'pdf'],
    maxRows: parseInt(process.env.REACT_APP_EXPORT_MAX_ROWS || '10000'),
    timeout: parseInt(process.env.REACT_APP_EXPORT_TIMEOUT || '300000'), // 5 minutes
  },

  // Import Configuration
  import: {
    formats: ['csv', 'xlsx', 'json'],
    maxFileSize: parseInt(process.env.REACT_APP_IMPORT_MAX_FILE_SIZE || '52428800'), // 50MB
    timeout: parseInt(process.env.REACT_APP_IMPORT_TIMEOUT || '600000'), // 10 minutes
  },
};

// Environment-specific overrides
if (PRODUCTION_CONFIG.environment.isProduction) {
  // Production-specific settings
  PRODUCTION_CONFIG.logging.level = 'warn';
  PRODUCTION_CONFIG.analytics.sampleRate = 0.1;
  PRODUCTION_CONFIG.performance.caching.enabled = true;
  PRODUCTION_CONFIG.security.encryption.enabled = true;
} else if (PRODUCTION_CONFIG.environment.isDevelopment) {
  // Development-specific settings
  PRODUCTION_CONFIG.logging.level = 'debug';
  PRODUCTION_CONFIG.analytics.enabled = false;
  PRODUCTION_CONFIG.performance.caching.enabled = false;
  PRODUCTION_CONFIG.features.realTimeMonitoring = true;
  PRODUCTION_CONFIG.features.predictiveAnalytics = true;
}

export default PRODUCTION_CONFIG;
