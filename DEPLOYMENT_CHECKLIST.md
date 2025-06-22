# ✅ Live Board - Deployment Checklist

## Pre-Deployment
- [ ] MongoDB Atlas account created
- [ ] MongoDB cluster set up (M0 tier)
- [ ] Database user created with read/write permissions
- [ ] Network access configured (0.0.0.0/0)
- [ ] MongoDB connection string copied
- [ ] Vercel account created
- [ ] GitHub account ready

## Backend Deployment
- [ ] Create GitHub repository for backend
- [ ] Push `backend/` folder to backend repository
- [ ] Deploy backend to Vercel
- [ ] Set environment variables:
  - [ ] `MONGODB_URI` (your Atlas connection string)
  - [ ] `FRONTEND_URL` (will update after frontend deployment)
  - [ ] `NODE_ENV=production`
- [ ] Test backend health endpoint
- [ ] Copy backend URL

## Frontend Deployment
- [ ] Create GitHub repository for frontend
- [ ] Push `frontend/` folder to frontend repository
- [ ] Update `NEXT_PUBLIC_BACKEND_URL` in environment
- [ ] Deploy frontend to Vercel
- [ ] Set environment variables:
  - [ ] `NEXT_PUBLIC_BACKEND_URL` (your backend URL)
- [ ] Copy frontend URL

## Post-Deployment
- [ ] Update backend `FRONTEND_URL` environment variable
- [ ] Redeploy backend
- [ ] Test frontend-backend connection
- [ ] Create a test whiteboard room
- [ ] Test real-time collaboration
- [ ] Share your frontend URL with others

## Environment Variables Summary

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whiteboard?retryWrites=true&w=majority
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

### Frontend (.env.local)
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend.vercel.app
```

## URLs to Save
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.vercel.app`
- **MongoDB Atlas**: `https://cloud.mongodb.com`

## Testing Checklist
- [ ] Frontend loads without errors
- [ ] Can create new whiteboard room
- [ ] Can join existing room
- [ ] Real-time drawing works
- [ ] Chat functionality works
- [ ] User list shows active users
- [ ] Export features work (PNG/PDF)
- [ ] Mobile responsiveness

## Troubleshooting
- [ ] Check Vercel deployment logs
- [ ] Verify environment variables
- [ ] Test MongoDB connection
- [ ] Check browser console for errors
- [ ] Verify CORS settings

## Vercel Framework Presets
- **Backend**: Use "Other" framework preset
- **Frontend**: Use "Next.js" framework preset

🎉 **Deployment Complete!** Share your frontend URL to start collaborating! 