# Deployment Guide

This guide covers deploying PTK-Connext to production environments.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Options](#deployment-options)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [Post-Deployment](#post-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)

## Overview

PTK-Connext is a monorepo containing:
- **Backend**: Hono API server (Node.js/Bun)
- **Frontend**: Next.js application
- **Database**: PostgreSQL with Supabase
- **Cache**: Redis

## Prerequisites

### Required Services

- **Database**: PostgreSQL 14+ (Supabase recommended)
- **Cache**: Redis 6+ (Redis Cloud, AWS ElastiCache, or self-hosted)
- **Authentication**: Supabase Auth
- **Hosting**: Any Node.js hosting platform

### Required Tools

- Bun v1.2.5+ (or Node.js 20+)
- PostgreSQL client
- Git

## Environment Setup

### Backend Environment Variables

Create `.env` file in `apps/backend/`:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Redis
REDIS_URL=redis://user:password@host:6379

# Encryption
ENCRYPTION_KEY=your-64-char-hex-string

# Server
PORT=4001
NODE_ENV=production
```

### Frontend Environment Variables

Create `.env.local` file in `apps/frontend/`:

```bash
# API
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Generating Secrets

```bash
# Generate encryption key (64 hex characters = 32 bytes)
openssl rand -hex 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Deployment Options

### Option 1: Docker (Recommended)

**Advantages:**
- Consistent environments
- Easy scaling
- Simplified deployment

**Disadvantages:**
- Requires Docker knowledge
- Additional resource overhead

### Option 2: Platform-as-a-Service (PaaS)

**Recommended Platforms:**
- **Vercel**: Best for Next.js frontend
- **Railway**: Good for full-stack apps
- **Render**: Flexible pricing
- **Fly.io**: Global edge deployment
- **AWS/GCP/Azure**: Enterprise options

### Option 3: VPS/Self-Hosted

**Recommended Providers:**
- DigitalOcean
- Linode
- AWS EC2
- Google Cloud Compute Engine

## Backend Deployment

### Deploy to Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and initialize:**
   ```bash
   railway login
   railway init
   ```

3. **Configure build:**
   ```json
   // railway.json
   {
     "build": {
       "builder": "NIXPACKS",
       "buildCommand": "cd apps/backend && bun install && bun run build"
     },
     "deploy": {
       "startCommand": "cd apps/backend && bun run start",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 3
     }
   }
   ```

4. **Set environment variables:**
   ```bash
   railway variables set DATABASE_URL=postgresql://...
   railway variables set SUPABASE_URL=https://...
   railway variables set SUPABASE_ANON_KEY=...
   railway variables set REDIS_URL=redis://...
   railway variables set ENCRYPTION_KEY=...
   railway variables set NODE_ENV=production
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

### Deploy to Render

1. **Create `render.yaml`:**
   ```yaml
   services:
     - type: web
       name: ptk-connext-backend
       env: node
       region: singapore
       plan: starter
       buildCommand: cd apps/backend && bun install
       startCommand: cd apps/backend && bun run src/index.ts
       envVars:
         - key: DATABASE_URL
           sync: false
         - key: SUPABASE_URL
           sync: false
         - key: SUPABASE_ANON_KEY
           sync: false
         - key: REDIS_URL
           sync: false
         - key: ENCRYPTION_KEY
           sync: false
         - key: NODE_ENV
           value: production
   ```

2. **Connect repository and deploy via Render dashboard**

### Deploy to VPS (Ubuntu/Debian)

1. **Install dependencies:**
   ```bash
   # Install Bun
   curl -fsSL https://bun.sh/install | bash
   
   # Install Node.js (fallback)
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   npm install -g pm2
   ```

2. **Clone and setup:**
   ```bash
   git clone https://github.com/Pathumlnw/PTK-Connext.git
   cd PTK-Connext/apps/backend
   bun install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your values
   ```

4. **Start with PM2:**
   ```bash
   pm2 start bun --name "ptk-backend" -- run src/index.ts
   pm2 save
   pm2 startup  # Configure auto-start
   ```

5. **Setup Nginx reverse proxy:**
   ```nginx
   server {
     listen 80;
     server_name api.yourdomain.com;
     
     location / {
       proxy_pass http://localhost:4001;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
   }
   ```

6. **Enable HTTPS with Certbot:**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

## Frontend Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd apps/frontend
   vercel
   ```

3. **Set environment variables in Vercel dashboard:**
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Configure `vercel.json`:**
   ```json
   {
     "buildCommand": "cd apps/frontend && npm run build",
     "outputDirectory": "apps/frontend/.next",
     "framework": "nextjs",
     "regions": ["sin1"]
   }
   ```

### Deploy to Netlify

1. **Create `netlify.toml`:**
   ```toml
   [build]
     base = "apps/frontend"
     command = "npm run build"
     publish = ".next"
   
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

2. **Deploy via Netlify CLI or dashboard**

### Deploy to VPS

1. **Build the application:**
   ```bash
   cd apps/frontend
   bun install
   bun run build
   ```

2. **Start with PM2:**
   ```bash
   pm2 start npm --name "ptk-frontend" -- start
   pm2 save
   ```

3. **Configure Nginx:**
   ```nginx
   server {
     listen 80;
     server_name yourdomain.com;
     
     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

## Database Setup

### Using Supabase (Recommended)

1. **Create project at [supabase.com](https://supabase.com)**

2. **Run migrations:**
   ```bash
   cd apps/backend
   bun run db:push  # Push schema to database
   ```

3. **Seed initial data:**
   ```bash
   bun run seed
   ```

4. **Enable Row Level Security (RLS):**
   ```sql
   -- Run in Supabase SQL Editor
   ALTER TABLE students ENABLE ROW LEVEL SECURITY;
   ALTER TABLE conduct_scores ENABLE ROW LEVEL SECURITY;
   
   -- Add policies as needed
   CREATE POLICY "Students can view own data"
     ON students FOR SELECT
     USING (auth.uid() = id);
   ```

### Using External PostgreSQL

1. **Create database:**
   ```sql
   CREATE DATABASE ptk_connext;
   ```

2. **Run migrations:**
   ```bash
   cd apps/backend
   export DATABASE_URL="postgresql://user:password@host:5432/ptk_connext"
   bun run db:push
   ```

3. **Configure connection pooling** (recommended for production):
   - Use PgBouncer or similar
   - Configure max connections

## Redis Setup

### Using Redis Cloud

1. **Create database at [redis.com](https://redis.com)**
2. **Copy connection URL**
3. **Set `REDIS_URL` environment variable**

### Using AWS ElastiCache

1. **Create Redis cluster in AWS Console**
2. **Configure security groups**
3. **Use cluster endpoint as `REDIS_URL`**

### Self-Hosted Redis

```bash
# Install Redis
sudo apt-get install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: maxmemory 256mb
# Set: maxmemory-policy allkeys-lru

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

## Post-Deployment

### Health Checks

1. **Backend health endpoint:**
   ```bash
   curl https://api.yourdomain.com/
   ```

2. **Frontend:**
   ```bash
   curl https://yourdomain.com
   ```

3. **Database connection:**
   ```bash
   # In backend directory
   bun run db:studio  # Opens Drizzle Studio
   ```

### Testing

1. **Run smoke tests:**
   ```bash
   # Test authentication
   curl -X POST https://api.yourdomain.com/auth/login \
     -H "Content-Type: application/json" \
     -d '{"studentId":"test","citizenId":"password"}'
   ```

2. **Test all critical paths:**
   - User login
   - Data fetching
   - CRUD operations
   - File uploads (if applicable)

### Security Hardening

1. **Enable HTTPS everywhere**
2. **Set secure headers:**
   ```typescript
   // Already configured in backend
   app.use('*', secureHeaders())
   ```

3. **Configure CORS properly:**
   ```typescript
   app.use('*', cors({
     origin: ['https://yourdomain.com'],  // Only production domain
     credentials: true,
   }))
   ```

4. **Enable rate limiting** (already configured)
5. **Set up firewall rules**
6. **Regular security updates**

## Monitoring & Maintenance

### Logging

**Backend Logging:**
```typescript
// Use structured logging
console.log('[Service] Event:', {
  timestamp: new Date().toISOString(),
  userId: user.id,
  action: 'login'
});
```

**Recommended Services:**
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Datadog**: Full observability
- **Papertrail**: Log aggregation

### Performance Monitoring

**Recommended Tools:**
- **New Relic**: Application performance
- **Vercel Analytics**: Frontend performance
- **Uptime Robot**: Uptime monitoring
- **Google Analytics**: User analytics

### Backups

**Database Backups:**
```bash
# Automated daily backups
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Upload to S3
aws s3 cp backup_$(date +%Y%m%d).sql s3://your-bucket/backups/
```

**Supabase:** Automatic backups included

### Updates

```bash
# Pull latest changes
git pull origin main

# Backend
cd apps/backend
bun install
pm2 restart ptk-backend

# Frontend
cd apps/frontend
bun install
bun run build
pm2 restart ptk-frontend
```

### Rollback Plan

1. **Keep previous release tagged:**
   ```bash
   git tag -a v1.0.1 -m "Release 1.0.1"
   git push origin v1.0.1
   ```

2. **Quick rollback:**
   ```bash
   git checkout v1.0.0  # Previous stable version
   pm2 restart all
   ```

3. **Database rollback:**
   ```bash
   # Restore from backup
   psql $DATABASE_URL < backup_20250116.sql
   ```

## Troubleshooting

### Common Issues

**503 Service Unavailable:**
- Check if backend is running: `pm2 list`
- Check logs: `pm2 logs ptk-backend`
- Verify environment variables

**Database Connection Errors:**
- Check `DATABASE_URL` format
- Verify database is accessible
- Check firewall rules
- Test connection: `psql $DATABASE_URL`

**Redis Connection Errors:**
- Check `REDIS_URL` format
- Verify Redis is running
- Check network connectivity

### Support

For deployment issues:
1. Check application logs
2. Review deployment provider documentation
3. Open an issue on GitHub
4. Contact development team

---

**Deployment Checklist:**

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Initial data seeded
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Security headers set
- [ ] Rate limiting enabled
- [ ] Monitoring configured
- [ ] Backups automated
- [ ] Health checks passing
- [ ] Documentation updated

**Last Updated:** January 17, 2025
