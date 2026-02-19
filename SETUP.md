# HP Home Improvements App - Setup Guide

## Prerequisites

- Node.js v16+ ([download](https://nodejs.org/))
- PostgreSQL 12+ ([download](https://www.postgresql.org/download/))
- Git

## Quick Start (5 minutes)

### 1. Database Setup

```bash
# Create database
createdb hp_home_improvements

# Load schema
psql hp_home_improvements < backend/db/schema.sql

# Verify (should see table list)
psql hp_home_improvements -c "\dt"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy .env file
cp .env.example .env

# Edit .env with your database credentials
# (default: user=postgres, password=postgres, host=localhost)

# Start backend
npm run dev
```

✅ Backend running on `http://localhost:5000`

### 3. Frontend Setup (in new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Start React dev server
npm start
```

✅ Frontend running on `http://localhost:3000`

## App URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/health

## What's Ready

### Backend API Endpoints

**Projects:**
- `GET /api/projects` — List all projects
- `POST /api/projects` — Create project
- `GET /api/projects/:id` — Get project + phases + decisions
- `PUT /api/projects/:id` — Update project
- `DELETE /api/projects/:id` — Delete project

**Phases (Tasks):**
- `GET /api/phases/project/:projectId` — List project phases
- `POST /api/phases` — Create phase
- `PUT /api/phases/:id` — Update phase status/timeline
- `DELETE /api/phases/:id` — Delete phase

**Customer Decisions:**
- `GET /api/decisions/project/:projectId` — List decisions
- `POST /api/decisions` — Create decision
- `PUT /api/decisions/:id` — Update decision
- `PUT /api/decisions/:id/approve` — Approve decision

**Contractors:**
- `GET /api/contractors` — List all contractors
- `POST /api/contractors` — Add contractor
- `PUT /api/contractors/:id` — Update contractor

**Authentication:**
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Frontend Pages

- **Dashboard** (`/`) — View all projects
- **Project Detail** (`/projects/:id`) — View project phases & decisions
- **New Project** (`/projects/new`) — Create new project
- **Contractors** (`/contractors`) — List all contractors

## Loading Sample Data

### Option 1: Load Contractors via API

```bash
curl -X POST http://localhost:5000/api/contractors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fidel Espinal",
    "trade": "Carpentry",
    "phone": "404-246-7062",
    "company": "Espinal Carpentry Crew",
    "crew": "Carlos, Cruz, Francisco"
  }'
```

### Option 2: Load from JSON File

See `/data/contractors.json` and `/data/phases.json` for pre-built sample data. You can:

1. Create a loading script
2. Use `psql COPY` command
3. Manually enter via the frontend (coming soon)

## Next Steps

### Essential Features to Build

- [ ] **User Authentication** (login/register UI)
- [ ] **Load 21-phase template** into projects
- [ ] **Phase photo uploads** (Cloudinary integration)
- [ ] **Customer decision UI** (checklist with selections)
- [ ] **Gantt chart timeline** (visual schedule)
- [ ] **Admin dashboard** (budget tracking, analytics)
- [ ] **Contractor SMS/Email** integration
- [ ] **Mobile responsive** design

### Dev Tips

**Restart Backend:**
```bash
# Kill the dev server (Ctrl+C) and restart
npm run dev
```

**Reset Database:**
```bash
# Drop and recreate
dropdb hp_home_improvements
createdb hp_home_improvements
psql hp_home_improvements < backend/db/schema.sql
```

**Check Database:**
```bash
psql hp_home_improvements
\dt  # List tables
SELECT * FROM projects;
```

**Debug API Requests:**
- Use Postman or VS Code REST Client to test endpoints
- Check backend console for errors
- Browser dev tools (Network tab) to see API calls

### Deployment Checklist

- [ ] Use environment variables for all secrets
- [ ] Set `NODE_ENV=production` in backend
- [ ] Use PostgreSQL on AWS RDS (not local)
- [ ] Host backend on Railway/Heroku/AWS
- [ ] Host frontend on Vercel/Netlify
- [ ] Set up CI/CD with GitHub Actions
- [ ] Enable HTTPS on production

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Database connection error:**
```bash
# Check PostgreSQL is running
psql postgres -c "SELECT version();"

# Check connection string in .env
# Default: postgresql://postgres:postgres@localhost:5432/hp_home_improvements
```

**React won't start:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

## Need Help?

1. Check `/backend/server.js` and `/frontend/src/App.js`
2. Review API documentation in `/docs/ARCHITECTURE.md`
3. Check browser console for frontend errors
4. Check terminal for backend errors

---

**You're all set!** 🎉 Start building.
