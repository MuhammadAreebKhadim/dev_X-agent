# VoiceDev X Deployment Guide

## 🚀 Quick Deployment Options

### Prerequisites
- Node.js 20+ installed
- PostgreSQL database (Neon, Supabase, or local)
- Environment variables configured

## Option 1: Vercel (Recommended)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Build the Project
```bash
npm run build:client
npm run build:server
```

### Step 3: Configure Environment Variables
In Vercel dashboard, add:
- `DATABASE_URL` - Your PostgreSQL connection string
- `GROQ_API_KEY` - Optional, for AI code generation

### Step 4: Deploy
```bash
vercel --prod
```

## Option 2: Netlify

### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Step 2: Build
```bash
npm run build
```

### Step 3: Deploy
```bash
netlify deploy --prod --dir=client/dist
```

## Option 3: Railway

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login and Deploy
```bash
railway login
railway link
railway up
```

## Option 4: DigitalOcean App Platform

### Step 1: Create App Spec
Create `.do/app.yaml`:
```yaml
name: voicedev-x
services:
- name: web
  source_dir: /
  github:
    repo: your-username/voicedev-x
    branch: main
  run_command: npm start
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: DATABASE_URL
    value: your-database-url
```

## Option 5: Docker Deployment

### Local Docker
```bash
docker build -t voicedev-x .
docker run -p 5000:5000 -e DATABASE_URL="your-db-url" voicedev-x
```

### Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=your-database-url
      - NODE_ENV=production
```

Run: `docker-compose up -d`

## Option 6: Heroku

### Step 1: Install Heroku CLI
```bash
# Install from heroku.com/cli
```

### Step 2: Create Heroku App
```bash
heroku create voicedev-x-app
```

### Step 3: Add Database
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

### Step 4: Deploy
```bash
git add .
git commit -m "Deploy VoiceDev X"
git push heroku main
```

## Environment Variables Required

### Essential
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Set to "production"

### Optional
- `GROQ_API_KEY` - For AI code generation
- `PORT` - Server port (default: 5000)

## Database Setup

### Neon (Recommended)
1. Create account at neon.tech
2. Create new database
3. Copy connection string
4. Run: `npm run db:push`

### Supabase
1. Create project at supabase.com
2. Go to Settings > Database
3. Copy connection string
4. Run: `npm run db:push`

## Build Commands

### Frontend Only
```bash
cd client && npm run build
```

### Backend Only
```bash
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
```

### Full Build
```bash
npm run build
```

## Performance Optimization

### 1. Enable Compression
Already configured in Express server

### 2. Database Optimization
- Use connection pooling (already configured)
- Add database indexes for frequently queried fields

### 3. Frontend Optimization
- Static asset caching (configured in Vite)
- Code splitting (automatic with React lazy loading)

## Monitoring & Logs

### Vercel
- Built-in monitoring dashboard
- Real-time logs in Vercel dashboard

### Railway
- Built-in metrics and logs
- Custom monitoring with Railway CLI

### Docker
```bash
docker logs voicedev-x
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify DATABASE_URL format
   - Check firewall settings
   - Run `npm run db:push`

2. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version: `node --version` (need 20+)

3. **Voice Recognition Not Working**
   - Ensure HTTPS deployment (required for Web Speech API)
   - Check browser compatibility

### Production Checklist
- [ ] Database configured and accessible
- [ ] Environment variables set
- [ ] HTTPS enabled
- [ ] Database schema pushed
- [ ] Build successful
- [ ] All dependencies installed

## Cost Estimation

### Free Tier Options
- **Vercel**: 100GB bandwidth, 100 serverless functions
- **Netlify**: 100GB bandwidth, 125k serverless requests
- **Railway**: $5/month after trial
- **Heroku**: Limited free tier

### Database
- **Neon**: 512MB free tier
- **Supabase**: 500MB free tier
- **Railway**: PostgreSQL included in plan

Your VoiceDev X application is ready for production deployment!