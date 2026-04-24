# 🚀 Deployment Guide - Rent Management SaaS

**Free Tier Deployment Strategy**  
Cost: **₹0/month** | Time: **~30 minutes**

---

## 📋 Deployment Architecture

```
User Browser
    ↓
Vercel (Frontend)  ←→  Render (Backend)  ←→  Render PostgreSQL
  (FREE)                  (FREE)               (FREE)
```

---

## 🗂️ Pre-Deployment Checklist

- ✅ GitHub repository pushed
- ✅ Backend in `/backend` folder
- ✅ Frontend in `/frontend` folder
- ✅ Environment variables documented
- ✅ CORS configuration ready

---

## 🎯 STEP 1: Database Setup (PostgreSQL on Render)

### 1.1 Create PostgreSQL Database
1. Go to: https://dashboard.render.com/
2. Click **New** → **PostgreSQL**
3. Fill in:
   - **Name**: `rentapp-db`
   - **Database**: `rent_app`
   - **User**: (auto-generated)
   - **Region**: Pick closest to you
   - **Plan**: **Free**
4. Click **Create Database**

### 1.2 Copy Database Credentials
After creation, copy these from the dashboard:
- **Internal Database URL** (starts with `postgresql://...`)
- **Username**
- **Password**

⚠️ **IMPORTANT**: Use **Internal Database URL** (not External)

---

## 🎯 STEP 2: Backend Deployment (Spring Boot on Render)

### 2.1 Prepare Backend
Your backend is already configured with environment variables! ✅

### 2.2 Deploy to Render
1. Go to: https://dashboard.render.com/
2. Click **New** → **Web Service**
3. Connect your GitHub repository: `SaichaitanyareddyG/rent-management-saas`
4. Fill in settings:

**General:**
- **Name**: `rentapp-backend`
- **Region**: Same as database
- **Branch**: `main`
- **Root Directory**: `backend`

**Build & Deploy:**
- **Runtime**: `Java`
- **Build Command**: `./mvnw clean package -DskipTests`
- **Start Command**: `java -jar target/rentapp-0.0.1-SNAPSHOT.jar`

**Plan:**
- Select **Free**

5. Click **Advanced** → Add Environment Variables:

```bash
DB_URL=<paste Internal Database URL from Step 1>
DB_USERNAME=<paste database username>
DB_PASSWORD=<paste database password>

JWT_SECRET=cff6a59c12384ba6735ad31908887dd7f635646ea3c21945ada79e214deec188

SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=false
```

6. Click **Create Web Service**

### 2.3 Wait for Build
- First build takes ~5-10 minutes
- Watch logs for "Started RentappApplication"
- Copy your backend URL: `https://rentapp-backend.onrender.com`

⚠️ **NOTE**: Free tier sleeps after 15 min of inactivity. First request takes 30 seconds.

---

## 🎯 STEP 3: Frontend Deployment (React on Vercel)

### 3.1 Create .env for Production
Already configured! The app uses `VITE_API_BASE_URL` environment variable.

### 3.2 Deploy to Vercel
1. Go to: https://vercel.com/
2. Sign in with GitHub
3. Click **Add New** → **Project**
4. Import: `SaichaitanyareddyG/rent-management-saas`
5. Configure:

**General:**
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

**Environment Variables:**
- Add: `VITE_API_BASE_URL`
- Value: `https://rentapp-backend.onrender.com` (your backend URL)

6. Click **Deploy**

### 3.3 Wait for Deployment
- Takes ~2 minutes
- Copy your frontend URL: `https://rent-management-saas.vercel.app`

---

## 🎯 STEP 4: Configure CORS (CRITICAL!)

### 4.1 Update Backend CORS Configuration

You need to update the backend to allow your Vercel domain.

**Option A: Quick Fix (Development)**
Set CORS to allow all origins temporarily.

**Option B: Production-Ready (Recommended)**
Add your Vercel URL to allowed origins:

```java
// backend/src/main/java/com/rentapp/rentapp/config/CorsConfig.java
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
        .allowedOrigins(
            "http://localhost:5173",
            "https://rent-management-saas.vercel.app",  // ← Add your Vercel URL
            "https://*.vercel.app"  // ← Allow all Vercel preview URLs
        )
        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
        .allowedHeaders("*")
        .allowCredentials(true);
}
```

Push changes and Render will auto-redeploy.

---

## 🧪 STEP 5: Testing After Deployment

### 5.1 Test Backend API
```bash
# Test health
curl https://rentapp-backend.onrender.com/

# Test public endpoint
curl https://rentapp-backend.onrender.com/public/tenant/phone/9876543210
```

### 5.2 Test Frontend
1. Open: `https://rent-management-saas.vercel.app`
2. Click **Owner Login**
3. Register new account
4. Add property → room → tenant
5. Test tenant payment portal (public page)

### 5.3 Test Payment Flow
1. Go to home page
2. Enter tenant phone number
3. Verify details
4. Click "Pay via UPI"
5. On mobile: UPI app should open
6. On desktop: Show manual UPI ID

---

## 🚨 Common Issues & Solutions

### ❌ Issue: Backend Returns 502 Bad Gateway
**Cause**: Backend is sleeping (free tier)  
**Solution**: Wait 30 seconds for cold start, then refresh

### ❌ Issue: CORS Error in Browser Console
**Cause**: Frontend origin not allowed  
**Solution**: Update CORS config with your Vercel URL (Step 4)

### ❌ Issue: 404 on API Calls
**Cause**: Wrong API base URL  
**Solution**: Check `VITE_API_BASE_URL` in Vercel environment variables

### ❌ Issue: Database Connection Failed
**Cause**: Wrong database URL or credentials  
**Solution**: Verify environment variables in Render dashboard

### ❌ Issue: Frontend Shows Blank Page
**Cause**: Build failed or wrong build command  
**Solution**: Check Vercel build logs

### ❌ Issue: JWT Signature Validation Failed
**Cause**: Different JWT secret between local and production  
**Solution**: Use same JWT_SECRET in Render environment variables

---

## 📊 Cost Breakdown

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| Vercel | Hobby | **FREE** | 100 GB bandwidth/month |
| Render (Backend) | Free | **FREE** | Sleeps after 15 min, 750 hours/month |
| Render (PostgreSQL) | Free | **FREE** | 1 GB storage, expires after 90 days |

**Total Monthly Cost**: **₹0**

⚠️ **Free PostgreSQL expires after 90 days**. Upgrade to paid plan ($7/month) for persistence.

---

## 🎯 Post-Deployment Tasks

### 1. Update README.md
Add live demo links:
```markdown
## 🌐 Live Demo

- **Frontend**: https://rent-management-saas.vercel.app
- **Backend API**: https://rentapp-backend.onrender.com
- **API Documentation**: https://rentapp-backend.onrender.com/swagger-ui.html
```

### 2. Add Screenshots
Take screenshots of:
- Dashboard
- Properties page
- Tenant payment portal
- Payment confirmation

Save in `/screenshots` folder and push to GitHub.

### 3. Record Demo Video (Optional but Impressive)
- Use Loom or Screen Recording
- Show: Login → Add Property → Add Tenant → Tenant Payment Flow
- Add link to README

### 4. Pin Repository on GitHub
Go to your profile and pin this repository.

### 5. Add Topics to GitHub Repository
Add these tags:
```
deployed spring-boot react vercel render postgresql 
saas rental-management production-ready
```

---

## 🔧 Maintenance & Monitoring

### Keep Backend Awake (Optional)
Free tier sleeps after 15 min. To keep it awake:

**Option 1**: Use cron-job.org
- Add: `https://rentapp-backend.onrender.com/health`
- Interval: Every 10 minutes

**Option 2**: Use UptimeRobot (Free)
- Monitor backend URL
- Pings every 5 minutes

⚠️ **Note**: This uses your 750 free hours faster.

### Check Logs
- **Backend**: Render dashboard → Select service → Logs
- **Frontend**: Vercel dashboard → Select project → Logs

---

## 🚀 Upgrade Path (When Needed)

When your project grows:

1. **Database**: Render Starter ($7/month) - Persistent, 10 GB
2. **Backend**: Render Starter ($7/month) - Always on, faster
3. **Frontend**: Vercel stays free for most projects

Total: ~$14/month for production-grade hosting

---

## 📝 Deployment Commands Summary

```bash
# Backend
cd backend
./mvnw clean package -DskipTests
java -jar target/rentapp-0.0.1-SNAPSHOT.jar

# Frontend
cd frontend
npm run build
# Output: dist/ folder
```

---

## ✅ Deployment Complete!

Your app is now live at:
- 🌐 **Frontend**: https://rent-management-saas.vercel.app
- 🔗 **Backend**: https://rentapp-backend.onrender.com

**Next Steps:**
1. Test all features thoroughly
2. Add live demo links to README
3. Share with recruiters! 🎉

---

**Need Help?** Check:
- Render Logs (backend issues)
- Vercel Logs (frontend issues)
- Browser Console (CORS/API errors)

**Good luck with your deployment! 🚀**
