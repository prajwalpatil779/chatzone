# ChatZone Pro - Render Deployment Blueprint

## 📋 Deployment Checklist

### ✅ Phase 1: Pre-Deployment Setup

- [ ] Git repository is initialized and all code is committed
- [ ] Environment variables are properly configured
- [ ] `render.yaml` file is in the root directory
- [ ] Backend and Frontend have proper `package.json` files
- [ ] All dependencies are listed in `package.json`

### ✅ Phase 2: Infrastructure Setup on Render

#### Backend (Node.js Service)
- [ ] Create Render account at https://render.com
- [ ] Create new Web Service for Backend
  - Repository: Your GitHub repo
  - Branch: main (or your production branch)
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Environment: Node.js
  - Plan: Free tier (initially)

#### Frontend (Static Site)
- [ ] Create new Static Site for Frontend
  - Repository: Your GitHub repo
  - Branch: main
  - Root Directory: `frontend`
  - Build Command: `npm install && npm run build`
  - Publish Directory: `build`

#### Database (Optional - Only if not using MongoDB Atlas)
- [ ] Create PostgreSQL or MongoDB database instance
- [ ] Store connection string for backend

### ✅ Phase 3: Environment Variables Configuration

#### Backend Environment Variables
Set these in Render Dashboard → Backend Service → Environment:

```
NODE_ENV=production
PORT=5000
CLIENT_URL=https://chatzone-frontend.onrender.com

# Database
MONGODB_URI=<your-mongodb-atlas-uri>

# Authentication
JWT_SECRET=<generate-a-strong-secret>
SESSION_SECRET=<generate-a-strong-secret>

# Cloudinary (File Upload)
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=chatzone-9fc80
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@chatzone-9fc80.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=<your-firebase-private-key>
```

#### Frontend Environment Variables
Set these in Render Dashboard → Frontend Service → Environment:

```
REACT_APP_API_URL=https://chatzone-backend.onrender.com/api
REACT_APP_SOCKET_URL=https://chatzone-backend.onrender.com
REACT_APP_FIREBASE_API_KEY=AIzaSyBL_d3cIRu0G6f0vmp13MlnHs4wXeKMiLc
REACT_APP_FIREBASE_PROJECT_ID=chatzone-9fc80
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=224193483949
REACT_APP_FIREBASE_AUTH_DOMAIN=chatzone-9fc80.firebaseapp.com
REACT_APP_FIREBASE_STORAGE_BUCKET=chatzone-9fc80.firebasestorage.app
REACT_APP_FIREBASE_APP_ID=<your-app-id>
REACT_APP_FIREBASE_MEASUREMENT_ID=<your-measurement-id>
```

### ✅ Phase 4: Deploy Directory Structure

Your GitHub repository should have this structure:

```
chatzone-pro/
├── render.yaml                 # ← Render deployment config
├── backend/
│   ├── package.json           # Must have "start" script
│   ├── server.js              # Entry point
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── socket/
│   └── utils/
├── frontend/
│   ├── package.json           # Must have build script
│   ├── public/
│   ├── src/
│   └── .env                   # Local dev only
├── docker-compose.yml         # Optional: for local dev
├── README.md
└── .gitignore                 # Exclude .env, node_modules
```

### ✅ Phase 5: Deployment Steps (via render.yaml)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Connect GitHub to Render**
   - Go to https://dashboard.render.com
   - Click "New" → "Blueprint"
   - Select your GitHub repository
   - Render will automatically detect `render.yaml`

3. **Configure services from Blueprint**
   - Review auto-detected services
   - Add missing environment variables
   - Click "Apply"

4. **Monitor Deployment**
   - Backend service logs: Check for "Server running on port 5000"
   - Frontend service logs: Check for successful build
   - Health checks: Render will ping endpoints

### ✅ Phase 6: Post-Deployment Verification

- [ ] Backend API responds: `https://chatzone-backend.onrender.com/api/health` (if endpoint exists)
- [ ] Frontend loads: `https://chatzone-frontend.onrender.com`
- [ ] WebSocket connection works: Check browser console for connection
- [ ] Database connection works: Check backend logs
- [ ] File uploads work: Test profile picture upload
- [ ] Push notifications work: Test Firebase integration
- [ ] Authentication works: Test login/signup

### ✅ Phase 7: Troubleshooting

**Backend won't start:**
- Check `npm start` script in `package.json`
- Verify all dependencies are in `package.json` (not just `package-lock.json`)
- Check logs in Render dashboard for specific errors

**Frontend not building:**
- Ensure `npm run build` works locally
- Check for environment variables needed at build time
- Verify all imports are correct (no missing dependencies)

**Cold starts slow:**
- Render free tier services spin down after 15 min of inactivity
- Consider upgrading to Paid plan for production

**WebSocket connection fails:**
- Ensure backend is using `https://` in production
- Check CORS/Socket.io configuration in backend
- Verify frontend env vars point to correct backend URL

**Database connection issues:**
- Test MongoDB URI locally first
- Ensure MongoDB Atlas IP whitelist includes Render
- Check network constraints

### ✅ Phase 8: Production Optimization

**Optional Upgrades:**
- [ ] Upgrade from Free to Starter plan ($7/month) to avoid spin-down
- [ ] Enable auto-scaling for backend
- [ ] Set up monitoring and alerts
- [ ] Add custom domain (Render supports CNAME)
- [ ] Enable HTTP/2 and modern TLS

**Security:**
- [ ] Never commit `.env` files to GitHub
- [ ] Use strong, unique secrets for production
- [ ] Regularly rotate API keys
- [ ] Enable two-factor authentication on GitHub and Render
- [ ] Use environment variables for all sensitive data

### 📞 Support & Resources

- **Render Docs**: https://render.com/docs
- **Blueprint Reference**: https://render.com/docs/blueprint-spec
- **Health Checks**: https://render.com/docs/health-checks
- **Environment Variables**: https://render.com/docs/environment-variables

---

## 🚀 Quick Reference Commands

### Local Testing Before Deploy
```bash
# Test backend
cd backend
npm install
npm start

# Test frontend (in another terminal)
cd frontend
npm install
npm start
```

### Git Commands for Deployment
```bash
# Stage all changes
git add .

# Commit with message
git commit -m "Deploy to Render"

# Push to main branch
git push origin main
```

### View Deployment URLs
- **Backend**: https://chatzone-backend.onrender.com
- **Frontend**: https://chatzone-frontend.onrender.com

---

**Last Updated**: February 23, 2026  
**Status**: Ready for Render Deployment ✅
