# HP Home Improvements Backend API

Production-ready Node.js/Express backend for HP Home Improvements project management system.

## Features

- ✅ RESTful API with JWT authentication
- ✅ PostgreSQL database with auto-initialization
- ✅ CORS configured for frontend integration
- ✅ Rate limiting and security middleware
- ✅ Customer portal and admin dashboard support
- ✅ Project phase tracking with real-time status
- ✅ Contractor and decision management

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Start development server
npm start

# Backend runs on http://localhost:5001
```

## Environment Variables

```env
NODE_ENV=production
PORT=5001
DATABASE_URL=postgresql://user:password@host:5432/hp_home_improvements
JWT_SECRET=your-secure-secret-key
ALLOWED_ORIGINS=http://localhost:3000,https://frontend-gold-ten-70.vercel.app
```

## API Endpoints

### Public (No Auth Required)
- `GET /health` - Health check
- `GET /status` - Database statistics

### Authenticated (JWT Required)
- `GET /api/projects` - List projects
- `GET /api/customers` - List customers
- `GET /api/contractors` - List contractors
- `GET /api/auth/login` - User login
- ...and more

## Database

Automatically initialized on startup with:
- 13 sample projects
- 6 customers
- 13 contractors
- Full schema with all required tables

## Deployment

### Option 1: Render (Recommended)
1. Go to https://render.com
2. Create Web Service
3. Connect GitHub: `hphomesatl-del/hp-home-improvements-app`
4. Root Directory: `backend`
5. Build: `npm install`
6. Start: `npm start`
7. Add environment variables

### Option 2: Railway
1. Go to https://railway.app
2. Create new project
3. Connect same GitHub repo
4. Uses `railway.toml` config

### Option 3: Local Docker
```bash
docker build -f Dockerfile -t hp-backend:latest .
docker run -p 5001:5001 -e DATABASE_URL=... hp-backend:latest
```

## Testing

```bash
# Test all endpoints
node test-endpoints.js

# Expected output: 5/5 endpoints responding
```

## Architecture

```
backend/
├── routes/          # API endpoint handlers
├── middleware/      # Auth, validation, etc.
├── db/              # Database initialization and schema
├── config/          # Configuration files
├── server.js        # Express app entry point
├── package.json     # Dependencies
└── Dockerfile       # Container configuration
```

## Troubleshooting

**Backend won't start:**
- Check Node.js version (v20+ recommended)
- Verify DATABASE_URL is set
- Check PostgreSQL is running (for local dev)

**Database connection error:**
- Ensure PostgreSQL is accessible
- Verify credentials in DATABASE_URL
- Check database exists: `hp_home_improvements`

**CORS errors:**
- Verify frontend URL is in ALLOWED_ORIGINS
- Check headers are being sent correctly

## Support

See `DEPLOYMENT_STATUS.md` and `DEPLOYMENT_GUIDE.md` in project root for detailed deployment instructions.

---

**Version:** 0.1.0  
**Last Updated:** March 24, 2026  
**Status:** Production Ready ✅
