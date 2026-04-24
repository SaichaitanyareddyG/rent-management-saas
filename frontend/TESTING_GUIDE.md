# RentApp Frontend - Testing Guide

## 🚀 Quick Start

### Development Server
```bash
cd frontend
npm run dev
```

**Frontend URL:** http://localhost:5175/

---

## 🔐 Demo Credentials

### Admin Login
```
Email: john@example.com
Password: pass123
```

*Note: These are demo credentials. Replace with actual credentials from your backend.*

---

## 🧪 Testing Flows

### 1️⃣ **Admin Flow** (Protected Routes)

#### Step 1: Login
- Navigate to: http://localhost:5175/login
- Enter demo credentials
- Click "Login"
- ✅ Should redirect to `/dashboard`

#### Step 2: Dashboard
- View aggregated metrics:
  - Total Properties, Rooms, Occupancy %
  - Total Tenants (Active/Inactive)
  - Revenue (Total/Monthly/Expected)
  - Payments (Paid/Pending/Verify)
- ✅ All data should load from backend

#### Step 3: Tenants Page
- Click "Tenants" in sidebar
- View paginated tenant list
- See: Name, Property, Room, Rent, Status
- Test pagination (Previous/Next)
- ✅ Should show 10 tenants per page

#### Step 4: Payments Page
- Click "Payments" in sidebar
- View paginated payments list
- See: Tenant, Property, Month, Amount, UTR, Status
- Click "Verify" on pending payments (if any)
- ✅ Should update payment status to PAID

#### Step 5: Logout
- Click "Logout" in header
- ✅ Should redirect to `/login`
- ✅ Should clear localStorage token

---

### 2️⃣ **Tenant Flow** (Public Routes - No Login!)

#### Step 1: Access Payment Link
- Navigate to: http://localhost:5175/pay/1
  - Replace `1` with actual tenant ID
- ✅ Should show tenant details without requiring login

#### Step 2: View Payment Details
- See:
  - Tenant Name
  - Property & Room
  - Rent Amount
  - Current Month
- ✅ All details should be auto-filled

#### Step 3: Pay via UPI
- Click "💳 Pay ₹XXXX via UPI" button
- ✅ Should open UPI app selector (on mobile)
- ✅ Should auto-fill amount and payee details
- Complete payment in UPI app

#### Step 4: Enter UTR
- Return to browser
- Form should appear automatically
- Enter UTR number from UPI transaction
- Add optional notes
- Click "Submit Payment Confirmation"
- ✅ Should redirect to `/payment-success`

#### Alternative: Manual Entry
- Click "Already Paid? Enter UTR"
- Skip UPI link, directly enter UTR
- ✅ Useful if already paid outside the app

---

## 🎨 UI/UX Features

### ✅ Mobile-First Design
- All layouts responsive
- Sidebar drawer on mobile (<768px)
- Touch-optimized buttons (min 44px)
- Proper spacing and font sizes

### ✅ Loading States
- Spinner on data fetch
- Disabled buttons during submission
- Clear loading messages

### ✅ Error Handling
- Network errors → User-friendly messages
- 401 → Auto-logout & redirect to login
- Invalid tenant ID → Error page
- Form validation errors

### ✅ Theme System
- All colors from `theme.ts`
- No hard-coded values
- Consistent spacing/typography
- Easy to customize

---

## 🔧 API Integration

### Admin APIs (JWT Required)
```typescript
// Dashboard
- GET /dashboard/summary
- GET /dashboard/revenue?month=2026-04
- GET /dashboard/payment-stats?month=2026-04

// Tenants
- GET /tenants/paginated?page=0&size=10&sort=id&direction=ASC
- GET /tenants/{id}

// Payments
- GET /payments/paginated?page=0&size=10&sort=createdAt&direction=DESC
- PATCH /payments/{id}/status?status=PAID
```

### Public APIs (No JWT)
```typescript
// Tenant Payment
- GET /tenants/{id}  // Public access for payment
- POST /payments/initiate
- POST /payments/confirm
```

---

## 🐛 Common Issues

### Issue: Login fails with 401
**Solution:** Check if backend is running on http://localhost:8080

### Issue: "Network Error" on API calls
**Solution:** 
1. Verify backend server is running
2. Check CORS configuration in Spring Boot
3. Verify API base URL in `services/api.ts`

### Issue: UPI link doesn't open
**Solution:** 
1. UPI links work on mobile devices with UPI apps installed
2. On desktop, link won't open (expected behavior)
3. Test on Android/iOS with GPay/PhonePe installed

### Issue: Token expires quickly
**Solution:** 
- JWT token expiry is controlled by backend
- Adjust `application.properties` JWT settings

### Issue: Pagination shows wrong data
**Solution:**
- Ensure backend returns proper `PaginatedResponse` format
- Check page numbering (0-indexed)

---

## 📊 Architecture Summary

```
Frontend (React + TypeScript + RTK Query)
├── Admin Flow (Protected with JWT)
│   ├── Login → Dashboard → Tenants → Payments
│   └── Full CRUD operations
│
└── Tenant Flow (Public, No Login)
    ├── Payment Link → UPI Payment → UTR Submission
    └── Read-only access, simple flow
```

---

## ✅ Production Checklist

- [ ] Replace demo credentials with env variables
- [ ] Add proper UPI ID from property data
- [ ] Enable HTTPS for production
- [ ] Add analytics tracking
- [ ] Test on multiple mobile devices
- [ ] Add proper error tracking (Sentry, etc.)
- [ ] Optimize bundle size
- [ ] Add service worker for offline support
- [ ] Configure proper JWT refresh token flow
- [ ] Add rate limiting on payment endpoints

---

## 🚀 Next Steps

1. **Charts & Analytics**
   - Add revenue trend charts
   - Payment collection rate graphs
   - Occupancy timeline

2. **Enhanced Filtering**
   - Filter tenants by status
   - Filter payments by month/status
   - Search functionality

3. **Better UI**
   - Add Tailwind CSS
   - Improve mobile navigation
   - Add animations

4. **Deployment**
   - Configure Vercel/Netlify
   - Setup CI/CD pipeline
   - Environment-based configs

---

## 📝 Notes

- **RTK Query** handles all API calls (no Axios)
- **localStorage** stores JWT token
- **401 responses** auto-trigger logout
- **Theme system** ensures consistency
- **Mobile-first** approach throughout

**Status:** ✅ Basic frontend working and ready for testing!
