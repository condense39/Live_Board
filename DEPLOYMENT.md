# 🚀 Live Board - Vercel Deployment Guide

This guide will help you deploy your Live Board application on Vercel.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas Account**: Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)
3. **GitHub Account**: For code hosting

## 🗄️ Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://mongodb.com/atlas)
2. Create a free cluster (M0 tier is sufficient)
3. Choose your preferred cloud provider and region
4. Create a database user with read/write permissions
5. Get your connection string

### 1.2 Configure Network Access
1. In Atlas dashboard, go to "Network Access"
2. Add IP address `0.0.0.0/0` to allow connections from anywhere
3. Copy your MongoDB connection string

## 🔧 Step 2: Deploy Backend to Vercel

### 2.1 Prepare Backend Repository
1. Create a new GitHub repository for your backend
2. Push your `backend/` folder to this repository
3. Make sure `server.js` is in the root of the backend repository

### 2.2 Deploy Backend
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your backend GitHub repository
4. Configure the following settings:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (or leave empty)
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

### 2.3 Set Environment Variables
In your Vercel project settings, add these environment variables:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whiteboard?retryWrites=true&w=majority
NODE_ENV=production
```
*Note: We will set the `FRONTEND_URL` variable after deploying the frontend.*

**Replace the MongoDB URI with your actual connection string from Atlas**

### 2.4 Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Copy your backend URL (e.g., `https://your-backend.vercel.app`)

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Prepare Frontend Repository
1. Create a new GitHub repository for your frontend
2. Push your `frontend/` folder to this repository
3. Make sure all Next.js files are in the root of the frontend repository

### 3.2 Deploy Frontend
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your frontend GitHub repository
4. Configure the following settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (or leave empty)
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

### 3.3 Set Environment Variables
In your Vercel project settings, add:
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend.vercel.app
```
**Replace the URL with your actual backend URL from Step 2.4**

### 3.4 Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Your app will be available at the provided URL. **This is your actual frontend URL**. Copy it.

## 🔄 Step 4: Connect Frontend and Backend

After both deployments are complete:

1. Go to your **backend** project on Vercel.
2. Navigate to **Settings > Environment Variables**.
3. Add the `FRONTEND_URL` variable with your actual frontend URL from Step 3.4 as the value.
4. Go to the **Deployments** tab for your backend project.
5. Find the latest deployment, click the menu (three dots), and select **"Redeploy"**.

## 🧪 Step 5: Test Your Deployment

1. Visit your frontend URL
2. Create a new whiteboard room
3. Share the room link with others
4. Test real-time collaboration features

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your backend `FRONTEND_URL` environment variable is set correctly
2. **Socket.IO Connection Issues**: Verify the `NEXT_PUBLIC_BACKEND_URL` is correct
3. **MongoDB Connection**: Check your MongoDB Atlas network access settings
4. **Build Errors**: Ensure all dependencies are properly listed in `package.json`

### Environment Variables Checklist:

**Backend:**
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `NODE_ENV` - Set to "production"

**Frontend:**
- `NEXT_PUBLIC_BACKEND_URL` - Your backend Vercel URL

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Test MongoDB connection locally first
4. Check browser console for frontend errors

## 🎉 Success!

Once deployed, you'll have:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.vercel.app`
- **Real-time collaboration** working across the internet
- **MongoDB persistence** for your whiteboard data

Share your frontend URL with others to start collaborating!

# Install dependencies
npm run install:all

# Run locally
npm run dev

# Setup for deployment
npm run setup:deploy 