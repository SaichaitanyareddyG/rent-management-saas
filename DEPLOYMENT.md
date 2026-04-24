# 🚀 Deployment Guide

## Quick Deploy Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render/Railway
- [ ] PostgreSQL database provisioned
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] JWT secret changed
- [ ] Demo credentials ready
- [ ] Screenshots captured
- [ ] README updated with live URLs

---

## 1️⃣ Deploy Frontend (Vercel) - FREE

### Prerequisites
- GitHub account
- Vercel account (free tier)

### Steps

#### A. Prepare Repository
```bash
cd frontend
# Ensure build works locally
npm run build
```

#### B. Deploy to Vercel
```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Or use Vercel Dashboard:**
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repo
4. Set **Root Directory**: `frontend`
5. Click "Deploy"

#### C. Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
```bash
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

#### D. Update CORS in Backend
```java
// SecurityConfig.java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:5173",
        "https://rentapp.vercel.app"  // ADD YOUR VERCEL URL
    ));
    // ...
}
```

---

## 2️⃣ Deploy Backend (Render.com) - FREE

### Prerequisites
- Render account (free tier)
- GitHub account

### Steps

#### A. Create PostgreSQL Database
1. Go to [render.com](https://render.com)
2. New → PostgreSQL
3. Name: `rentapp-db`
4. Plan: Free
5. Click "Create Database"
6. **Copy Internal Database URL** (starts with `postgres://...`)

#### B. Deploy Spring Boot App
1. New → Web Service
2. Connect GitHub repo
3. Configure:
   ```
   Name: rentapp-backend
   Environment: Docker (or Java)
   Build Command: ./mvnw clean install
   Start Command: java -jar target/rentapp-0.0.1-SNAPSHOT.jar
   ```

#### C. Add Environment Variables
```bash
SPRING_DATASOURCE_URL=<your-postgres-internal-url>
SPRING_DATASOURCE_USERNAME=<from-database-page>
SPRING_DATASOURCE_PASSWORD=<from-database-page>
JWT_SECRET=your_super_secret_key_min_256_bits_change_this_in_production
JWT_EXPIRATION=86400000
SPRING_JPA_HIBERNATE_DDL_AUTO=update
```

#### D. Deploy
Click "Create Web Service" - Render will build and deploy automatically.

**Your backend will be at:** `https://rentapp-backend.onrender.com`

---

## 3️⃣ Alternative: Railway.app

### Why Railway?
- Simpler than Render
- Automatic GitHub deploys
- Built-in PostgreSQL

### Steps
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repo
4. Add PostgreSQL service
5. Link database to backend service
6. Set environment variables (auto-detected from `application.properties`)
7. Deploy!

---

## 4️⃣ Update Frontend API URL

After backend is deployed, update frontend:

```bash
# frontend/.env.production
VITE_API_BASE_URL=https://rentapp-backend.onrender.com
```

Or in Vercel dashboard → Environment Variables.

---

## 5️⃣ Database Initialization

### Option 1: Use Spring Boot Auto-Create
Set in environment variables:
```bash
SPRING_JPA_HIBERNATE_DDL_AUTO=create
```
⚠️ **Warning:** This will drop existing tables! Use `update` for production.

### Option 2: Manual SQL Script
```sql
-- Create tables (Spring Boot will auto-create if ddl-auto=update)
-- Or use a migration tool like Flyway

-- Seed demo data
INSERT INTO property_owner (name, email, password, phone, upi_id)
VALUES ('John Doe', 'john@example.com', 
        '$2a$10$...', -- BCrypt hash of 'pass123'
        '9876543210', 'john@upi');

INSERT INTO property (name, location, upi_id, owner_id)
VALUES ('Sunrise Apartments', 'Mumbai', 'owner@upi', 1);

-- Add more seed data...
```

---

## 6️⃣ Testing Deployed App

### Frontend (Vercel)
```
URL: https://rentapp.vercel.app
Test: 
- Login page loads
- Login with demo credentials
- Dashboard shows data
```

### Backend (Render)
```
URL: https://rentapp-backend.onrender.com
Test:
curl https://rentapp-backend.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'
```

### Public Payment Link
```
URL: https://rentapp.vercel.app/pay/1
Test:
- Page loads without login
- Shows tenant details
- UPI link generates
```

---

## 7️⃣ Common Deployment Issues

### Issue: CORS Error
**Symptom:** `Access-Control-Allow-Origin` error in browser console

**Fix:**
```java
// backend/src/main/java/com/rentapp/config/SecurityConfig.java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:5173",
    "https://rentapp.vercel.app",  // ← Add your Vercel URL
    "https://your-custom-domain.com"
));
```

### Issue: JWT Token Not Persisting
**Symptom:** Auto-logout after refresh

**Fix:**
```typescript
// frontend/src/services/authApi.ts
transformResponse: (response: LoginResponse) => {
  localStorage.setItem('token', response.token);  // ← Verify this exists
  localStorage.setItem('user', JSON.stringify({...}));
  return response;
}
```

### Issue: Database Connection Failed
**Symptom:** `Unable to acquire JDBC Connection`

**Fix:**
- Verify `SPRING_DATASOURCE_URL` is correct
- Check database is running
- Ensure IP whitelist includes Render's IPs (or set to `0.0.0.0/0` for testing)

### Issue: Build Failed on Render
**Symptom:** `mvn command not found`

**Fix:**
1. Add `mvnw` wrapper to your repo:
   ```bash
   ./mvnw wrapper:wrapper
   git add mvnw mvnw.cmd .mvn
   git commit -m "Add Maven wrapper"
   ```
2. Or change Build Command to:
   ```
   mvn clean install -DskipTests
   ```

### Issue: Vercel Build Failed
**Symptom:** `Module not found` error

**Fix:**
```bash
# Ensure all dependencies are in package.json, not devDependencies
npm install --save react react-dom react-router-dom
```

---

## 8️⃣ Custom Domain (Optional)

### Vercel
1. Domains → Add Domain
2. Enter your domain (e.g., `rentapp.com`)
3. Follow DNS instructions (add CNAME record)

### Render
1. Settings → Custom Domain
2. Enter your domain
3. Add CNAME record: `your-domain.com` → `rentapp-backend.onrender.com`

---

## 9️⃣ SSL Certificate (Automatic)

Both Vercel and Render provide **automatic SSL** (HTTPS) via Let's Encrypt.

No configuration needed! 🎉

---

## 🔟 Monitoring & Logs

### Vercel
- Dashboard → Your Project → Deployments → View Logs
- Real-time function logs
- Automatic error tracking

### Render
- Dashboard → Your Service → Logs tab
- Live tail: `tail -f` equivalent
- Historical logs searchable

---

## 📊 Performance Optimization

### Frontend
```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer

# Optimize images
# Use WebP format
# Lazy load images
```

### Backend
```properties
# application.properties (production)
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false
logging.level.root=WARN
logging.level.com.rentapp=INFO
```

---

## 🔐 Security Checklist (Production)

- [ ] Change `jwt.secret` to a strong random key (256+ bits)
- [ ] Set `jwt.expiration` appropriately (default: 24 hours)
- [ ] Enable HTTPS only (Vercel/Render handle this)
- [ ] Restrict CORS to your domain only
- [ ] Remove demo credentials from code
- [ ] Set `spring.jpa.hibernate.ddl-auto=validate` (not `create`)
- [ ] Add rate limiting on auth endpoints
- [ ] Enable database backups (Render Pro plan)
- [ ] Use environment variables for all secrets
- [ ] Add CSRF protection for state-changing operations

---

## 📈 Post-Deployment Checklist

- [ ] Test all user flows (login, dashboard, tenant payment)
- [ ] Verify mobile responsiveness
- [ ] Check browser console for errors
- [ ] Test payment link sharing (WhatsApp, email)
- [ ] Confirm charts load correctly
- [ ] Test search functionality
- [ ] Verify toast notifications appear
- [ ] Check pagination works
- [ ] Test logout and re-login

---

## 🎯 Update README with Live URLs

```markdown
## 🌐 Live Demo

- **Frontend:** https://rentapp.vercel.app
- **Backend API:** https://rentapp-backend.onrender.com
- **Test Payment Link:** https://rentapp.vercel.app/pay/1

### Demo Credentials
- Email: demo@example.com
- Password: demo123
```

---

## 🚨 Emergency Rollback

### Vercel
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → Promote to Production

### Render
1. Go to your service
2. Manual Deploy → Select specific commit
3. Click "Deploy"

---

## 💰 Cost Estimate

### Free Tier (Perfect for Portfolio)
- **Vercel:** Free (100GB bandwidth/month)
- **Render:** Free (750 hours/month)
- **PostgreSQL:** Free (1GB storage on Render)

**Total: $0/month** 🎉

### If You Need More
- **Vercel Pro:** $20/month (better performance)
- **Render Starter:** $7/month (dedicated instance)
- **Railway:** $5/month (pay-as-you-go)

---

## 📞 Support

If deployment fails:
1. Check logs in Vercel/Render dashboard
2. Review error messages
3. Compare with working local setup
4. Ask on Stack Overflow or Reddit r/webdev
5. Check official docs: [Vercel Docs](https://vercel.com/docs) | [Render Docs](https://render.com/docs)

---

**Your app is now LIVE and ready to showcase!** 🚀
