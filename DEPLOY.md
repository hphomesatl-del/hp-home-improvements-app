# HP Home Improvements - Production Deployment

## Live URLs

- **Frontend (Vercel):** https://frontend-gold-ten-70.vercel.app
- **Backend API (Railway):** https://hp-backend-production-4719.up.railway.app
- **Health Check:** https://hp-backend-production-4719.up.railway.app/health

## Architecture

- **Frontend:** React app deployed on Vercel (auto-deploys from GitHub `main` branch)
- **Backend:** Express.js API deployed on Railway
- **Database:** PostgreSQL on Railway (internal networking)

## Admin Accounts

| Name | Email | Password |
|------|-------|----------|
| Greg Hutzell | greg@hphome.com | admin2421 |
| Greg Hutzell | hphomesatl@gmail.com | admin2421 |
| Zachary Hutzell | zachary@hphome.com | admin2421 |
| Drake Hutzell | drake@hphome.com | admin2421 |

⚠️ **Change passwords in production!**

## Customer Accounts

| Customer | Login | Password |
|----------|-------|----------|
| Carla Rogg | 1620LazyRiver | Rogg123 |
| Matt & Meghan Rachford | 2361Ewing | Rachford |
| Kelly Davis | 4680Winding | Davis123 |
| Darinda & Micheal Goethals | 1057Monticello | Goethals |
| Freddy & Ashleigh El Sakr | 6170Daffodil | Sakr123 |
| Ron & Judy Martin | 6115Buckeye | Martin |

## Environment Variables

### Backend (Railway)
- `DATABASE_URL` - PostgreSQL connection (auto-injected by Railway)
- `JWT_SECRET` - JWT signing key (auto-generated)
- `NODE_ENV` - production
- `CORS_ORIGIN` - * (allows all origins)

### Frontend (Vercel)
- `REACT_APP_API_URL` - https://hp-backend-production-4719.up.railway.app

## Dashboards
- **Railway:** https://railway.com/project/9de314e6-42ed-4f45-98af-6e9fe10500d9
- **Vercel:** https://vercel.com/hphomesatl-dels-projects/frontend

## Redeployment

### Backend
```bash
cd backend && railway up --detach
```

### Frontend
```bash
cd frontend && vercel --prod
```

Or just push to `main` branch — both auto-deploy.
