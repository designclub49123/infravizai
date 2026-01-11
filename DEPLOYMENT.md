# Production Deployment Guide

## Overview

This guide covers deploying the InfraViz AI application to a production environment with enterprise-grade features, real-time monitoring, and business intelligence capabilities.

## Prerequisites

### Infrastructure Requirements

- **Kubernetes Cluster** (v1.20+)
- **Load Balancer** (AWS ALB, Nginx, or similar)
- **Database** (PostgreSQL 13+ or MongoDB 5.0+)
- **Redis** (v6.0+ for caching and sessions)
- **Object Storage** (AWS S3, Google Cloud Storage, or Azure Blob Storage)
- **Monitoring Stack** (Prometheus, Grafana, AlertManager)
- **Logging Stack** (ELK Stack or similar)

### Software Requirements

- **Node.js** (v18+)
- **Docker** (v20+)
- **kubectl** (v1.20+)
- **Helm** (v3.8+)

## Environment Configuration

### 1. Environment Variables

Create a `.env.production` file with the following variables:

```bash
# API Configuration
REACT_APP_API_BASE_URL=https://api.infraviz.ai
REACT_APP_WS_URL=wss://ws.infraviz.ai
REACT_APP_API_KEY=your-production-api-key

# Feature Flags
REACT_APP_FEATURE_REAL_TIME=true
REACT_APP_FEATURE_PREDICTIVE=true
REACT_APP_FEATURE_COST_OPT=true
REACT_APP_FEATURE_ADVANCED_SEC=true
REACT_APP_FEATURE_TEAM_COLLAB=true
REACT_APP_FEATURE_AUTOMATION=true

# Monitoring & Logging
REACT_APP_LOG_LEVEL=warn
REACT_APP_LOGGING_ENABLED=true
REACT_APP_CONSOLE_LOGGING=false
REACT_APP_REMOTE_LOGGING=true
REACT_APP_LOG_ENDPOINT=https://logs.infraviz.ai
REACT_APP_LOG_API_KEY=your-logging-api-key

# Analytics & Error Reporting
REACT_APP_ANALYTICS_ENABLED=true
REACT_APP_ANALYTICS_ID=your-analytics-id
REACT_APP_ERROR_REPORTING=true
REACT_APP_SENTRY_DSN=your-sentry-dsn

# Security
REACT_APP_GDPR_COMPLIANT=true
REACT_APP_SOC2_COMPLIANT=true
REACT_APP_HIPAA_COMPLIANT=false
REACT_APP_VAPID_PUBLIC_KEY=your-vapid-public-key

# Performance
REACT_APP_CDN_ENABLED=true
REACT_APP_CDN_URL=https://cdn.infraviz.ai
REACT_APP_REDIS_ENABLED=true
REACT_APP_REDIS_URL=redis://redis-cluster:6379

# Business Intelligence
REACT_APP_BI_API_KEY=your-bi-api-key
REACT_APP_COST_TRACKING=true
REACT_APP_COST_BUDGET=10000
REACT_APP_COST_ALERT_THRESHOLD=0.8

# Integrations
REACT_APP_SLACK_ENABLED=true
REACT_APP_SLACK_WEBHOOK_URL=your-slack-webhook
REACT_APP_TEAMS_ENABLED=true
REACT_APP_TEAMS_WEBHOOK_URL=your-teams-webhook
REACT_APP_EMAIL_ENABLED=true
REACT_APP_EMAIL_API_KEY=your-email-api-key

# Deployment
REACT_APP_VERSION=1.0.0
REACT_APP_BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
REACT_APP_COMMIT_SHA=$(git rev-parse HEAD)
REACT_APP_DEPLOYMENT_ENV=production
```

### 2. Kubernetes Secrets

Create Kubernetes secrets for sensitive data:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: infraviz-secrets
type: Opaque
data:
  api-key: <base64-encoded-api-key>
  db-password: <base64-encoded-db-password>
  redis-password: <base64-encoded-redis-password>
  jwt-secret: <base64-encoded-jwt-secret>
  encryption-key: <base64-encoded-encryption-key>
```

## Deployment Configuration

### 1. Dockerfile

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM nginx:alpine AS production

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 2. Nginx Configuration

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    server {
        listen 80;
        server_name infraviz.ai www.infraviz.ai;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name infraviz.ai www.infraviz.ai;

        # SSL configuration
        ssl_certificate /etc/ssl/certs/infraviz.crt;
        ssl_certificate_key /etc/ssl/private/infraviz.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Root directory
        root /usr/share/nginx/html;
        index index.html;

        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend-service:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket proxy
        location /ws {
            proxy_pass http://websocket-service:8081;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files with caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # SPA fallback
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### 3. Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: infraviz-frontend
  labels:
    app: infraviz
    component: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: infraviz
      component: frontend
  template:
    metadata:
      labels:
        app: infraviz
        component: frontend
    spec:
      containers:
      - name: infraviz
        image: infraviz/frontend:latest
        ports:
        - containerPort: 80
        env:
        - name: NODE_ENV
          value: "production"
        envFrom:
        - secretRef:
            name: infraviz-secrets
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: infraviz-frontend-service
spec:
  selector:
    app: infraviz
    component: frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: infraviz-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - infraviz.ai
    - www.infraviz.ai
    secretName: infraviz-tls
  rules:
  - host: infraviz.ai
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: infraviz-frontend-service
            port:
              number: 80
  - host: www.infraviz.ai
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: infraviz-frontend-service
            port:
              number: 80
```

## Monitoring & Observability

### 1. Prometheus Configuration

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s

    rule_files:
      - "infraviz_rules.yml"

    scrape_configs:
      - job_name: 'infraviz-frontend'
        static_configs:
          - targets: ['infraviz-frontend-service:80']
        metrics_path: /metrics
        scrape_interval: 30s

      - job_name: 'infraviz-backend'
        static_configs:
          - targets: ['infraviz-backend-service:8080']
        metrics_path: /metrics
        scrape_interval: 15s

      - job_name: 'nginx'
        static_configs:
          - targets: ['nginx-exporter:9113']
        scrape_interval: 30s

    alerting:
      alertmanagers:
        - static_configs:
            - targets:
              - alertmanager:9093
```

### 2. Grafana Dashboard

```json
{
  "dashboard": {
    "title": "InfraViz Production Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m]) * 100"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "singlestat",
        "targets": [
          {
            "expr": "active_users_total"
          }
        ]
      }
    ]
  }
}
```

## Security Configuration

### 1. Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: infraviz-network-policy
spec:
  podSelector:
    matchLabels:
      app: infraviz
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: nginx-ingress
    ports:
    - protocol: TCP
      port: 80
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: infraviz-backend
    ports:
    - protocol: TCP
      port: 8080
  - to: []
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
    - protocol: TCP
      port: 443
```

### 2. Pod Security Policy

```yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: infraviz-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
```

## Scaling Configuration

### 1. Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: infraviz-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: infraviz-frontend
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
```

### 2. Vertical Pod Autoscaler

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: infraviz-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: infraviz-frontend
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: infraviz
      maxAllowed:
        cpu: 500m
        memory: 512Mi
      minAllowed:
        cpu: 100m
        memory: 128Mi
```

## Backup & Disaster Recovery

### 1. Database Backup

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: postgres-backup
            image: postgres:13
            env:
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: infraviz-secrets
                  key: db-password
            command:
            - /bin/bash
            - -c
            - |
              pg_dump -h postgres-service -U postgres -d infraviz_prod | \
              gzip > /backup/infraviz-$(date +%Y%m%d_%H%M%S).sql.gz
              aws s3 cp /backup/infraviz-$(date +%Y%m%d_%H%M%S).sql.gz \
              s3://infraviz-backups/database/
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            emptyDir: {}
          restartPolicy: OnFailure
```

### 2. Application Backup

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: application-backup
spec:
  schedule: "0 3 * * *"  # Daily at 3 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: app-backup
            image: infraviz/backup:latest
            envFrom:
            - secretRef:
                name: infraviz-secrets
            command:
            - /bin/bash
            - -c
            - |
              # Backup application data
              kubectl get configmaps,secrets -o yaml > /backup/configs.yaml
              kubectl get deployments,services -o yaml > /backup/infrastructure.yaml
              
              # Upload to S3
              aws s3 cp /backup/ s3://infraviz-backups/application/$(date +%Y%m%d_%H%M%S)/ --recursive
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            emptyDir: {}
          restartPolicy: OnFailure
```

## Performance Optimization

### 1. Resource Optimization

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: infraviz-limits
spec:
  limits:
  - default:
      cpu: 200m
      memory: 256Mi
    defaultRequest:
      cpu: 100m
      memory: 128Mi
  - type: Container
    max:
      cpu: 500m
      memory: 512Mi
    min:
      cpu: 50m
      memory: 64Mi
```

### 2. Pod Disruption Budget

```yaml
apiVersion: policy/v1beta1
kind: PodDisruptionBudget
metadata:
  name: infraviz-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: infraviz
      component: frontend
```

## Testing & Validation

### 1. Health Checks

```bash
# Application health check
curl -f https://infraviz.ai/health

# API health check
curl -f https://api.infraviz.ai/health

# WebSocket connection test
wscat -c wss://ws.infraviz.ai/health
```

### 2. Load Testing

```bash
# Install k6
curl https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz | tar xz && sudo mv k6 /usr/local/bin/

# Load test script
cat > load-test.js << EOF
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  let response = http.get('https://infraviz.ai/');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
EOF

# Run load test
k6 run load-test.js
```

## Troubleshooting

### 1. Common Issues

#### High Memory Usage
```bash
# Check pod resource usage
kubectl top pods -l app=infraviz

# Describe pod for details
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name> --previous
```

#### WebSocket Connection Issues
```bash
# Check WebSocket service
kubectl get svc websocket-service

# Check WebSocket pod logs
kubectl logs -l component=websocket

# Test WebSocket connection
wscat -c wss://ws.infraviz.ai
```

#### Performance Issues
```bash
# Check resource requests/limits
kubectl describe deployment infraviz-frontend

# Check HPA status
kubectl get hpa infraviz-hpa

# Check node resources
kubectl top nodes
```

### 2. Debug Commands

```bash
# Port-forward for local debugging
kubectl port-forward svc/infraviz-frontend-service 8080:80

# Exec into pod
kubectl exec -it <pod-name> -- /bin/sh

# Get events
kubectl get events --sort-by='.lastTimestamp' | grep infraviz

# Check network connectivity
kubectl exec -it <pod-name> -- nslookup api.infraviz.ai
```

## Maintenance

### 1. Rolling Updates

```bash
# Update deployment
kubectl set image deployment/infraviz-frontend infraviz=infraviz/frontend:v2.0.0

# Check rollout status
kubectl rollout status deployment/infraviz-frontend

# Rollback if needed
kubectl rollout undo deployment/infraviz-frontend
```

### 2. Certificate Renewal

```bash
# Check certificate expiry
kubectl get certificate infraviz-tls -o yaml

# Force certificate renewal
kubectl delete certificate infraviz-tls
```

## Support & Monitoring

### 1. Alerting Rules

```yaml
groups:
- name: infraviz.rules
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100 > 5
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value }}% for the last 5 minutes"

  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 500
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
      description: "95th percentile response time is {{ $value }}ms"

  - alert: PodCrashLooping
    expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Pod is crash looping"
      description: "Pod {{ $labels.pod }} is restarting frequently"
```

### 2. Runbook

#### High CPU Usage
1. Check HPA status: `kubectl get hpa`
2. Scale up manually: `kubectl scale deployment infraviz-frontend --replicas=10`
3. Investigate root cause: `kubectl top pods`
4. Check for memory leaks: `kubectl logs <pod-name>`

#### Database Connection Issues
1. Check database pod: `kubectl get pods -l app=postgres`
2. Check database logs: `kubectl logs -l app=postgres`
3. Test connection: `kubectl exec -it <postgres-pod> -- psql -U postgres`
4. Check connection pool: `kubectl get configmap postgres-config -o yaml`

## Conclusion

This deployment guide provides a comprehensive approach to deploying InfraViz AI in a production environment with enterprise-grade features, monitoring, and security. Regular maintenance and monitoring are essential for ensuring optimal performance and reliability.

For additional support or questions, please refer to the [documentation](https://docs.infraviz.ai) or contact the support team.
