# Payment Verification System - Implementation TODO

## ✅ Phase 1: Core Infrastructure (COMPLETED)
- [x] PaymentIntent entity with unique amounts
- [x] PaymentAttempt entity for tracking
- [x] Repositories for both entities
- [x] PaymentIntentService (unique amount generator)
- [x] PaymentVerificationService (multi-signal scoring)
- [x] UTR pattern validation
- [x] Time window scoring (0-2 min: 25pts, 2-5: 15pts, 5-10: 5pts)
- [x] Behavior analysis
- [x] Confidence explainability

## 🚧 Phase 2: Backend Integration (IN PROGRESS)

### 2.1 Update PublicPaymentService ❌
**File:** `backend/src/main/java/com/rentapp/rentapp/service/PublicPaymentService.java`

**Changes needed:**
```java
// Add @Autowired fields:
private final PaymentIntentService paymentIntentService;
private final PaymentVerificationService verificationService;
private final PaymentAttemptRepository attemptRepository;

// Update getTenantDetailsForPayment():
// - Create payment intent
// - Return intentToken + uniqueAmount

// Update confirmPayment():
// - Validate intent token
// - Run verification scoring
// - Save PaymentAttempt
// - Auto-approve if score >= 80
// - Mark for verification if score < 80
```

### 2.2 Create DTOs ❌
**Files to create:**
- `dto/PaymentIntentResponse.java` - Return intent details to frontend
- `dto/PaymentConfirmRequest.java` - Update to include intentToken
- `dto/VerificationScoreResponse.java` - For admin confidence display

**PaymentIntentResponse structure:**
```java
{
  "intentToken": "uuid",
  "baseAmount": 5000.0,
  "uniqueAmount": 5003.0,
  "expiresAt": "2026-04-24T15:30:00",
  "validityMinutes": 10
}
```

### 2.3 Update PaymentController ❌
**File:** `backend/src/main/java/com/rentapp/rentapp/controller/PaymentController.java`

**New endpoint:**
```java
@PostMapping("/public/payment-intent")
public ResponseEntity<PaymentIntentResponse> createPaymentIntent(@RequestParam Long tenantId) {
    // Create intent
    // Return response
}
```

**Update existing endpoint:**
```java
@PostMapping("/public/confirm")
public ResponseEntity<?> confirmPayment(@RequestBody PaymentConfirmRequest request) {
    // Now includes intentToken validation
}
```

### 2.4 Database Migration ❌
**File:** `src/main/resources/db/migration/V5__add_payment_verification.sql` (or use JPA auto-create)

**Tables:**
- payment_intents
- payment_attempts

**Test on local PostgreSQL first!**

### 2.5 Enable @Scheduled Tasks ❌
**File:** `RentappApplication.java`

Add annotation:
```java
@EnableScheduling
```

## 🚧 Phase 3: Frontend Integration

### 3.1 Update publicApi.ts ❌
**File:** `frontend/src/services/publicApi.ts`

**New endpoints:**
```typescript
createPaymentIntent: builder.query<PaymentIntentResponse, number>({
  query: (tenantId) => `/public/payment-intent?tenantId=${tenantId}`,
}),

confirmPaymentWithIntent: builder.mutation<void, PaymentConfirmWithIntentRequest>({
  query: (data) => ({
    url: '/public/confirm',
    method: 'POST',
    body: data,
  }),
}),
```

### 3.2 Update TenantPaymentPage.tsx ❌
**File:** `frontend/src/pages/public/TenantPaymentPage.tsx`

**Flow changes:**
1. On page load → call `createPaymentIntent()`
2. Display unique amount: `₹5,003` (with notice)
3. Show 10-minute countdown timer
4. On UTR submit → include `intentToken`
5. Display confidence score if returned

**UI additions:**
```tsx
<Alert severity="info">
  Pay exactly ₹{uniqueAmount} (includes ₹{offset} verification fee)
  Valid for: {countdown}
</Alert>

{confidenceScore && (
  <Card>
    <Typography>Verification Confidence: {confidenceScore}%</Typography>
    <LinearProgress variant="determinate" value={confidenceScore} />
  </Card>
)}
```

### 3.3 Update Admin Payment List ❌
**File:** `frontend/src/pages/admin/PaymentsPage.tsx`

**Show confidence score column:**
```tsx
<TableCell>
  <Chip 
    label={`${payment.confidenceScore}%`}
    color={payment.confidenceScore >= 80 ? 'success' : 'warning'}
  />
</TableCell>
```

**Add explainability modal:**
```tsx
<Dialog>
  <DialogTitle>Verification Details</DialogTitle>
  <List>
    {factors.map(factor => (
      <ListItem>
        <ListItemText primary={factor.name} secondary={factor.value} />
      </ListItem>
    ))}
  </List>
</Dialog>
```

## 🧪 Phase 4: Testing

### 4.1 Backend Tests ❌
- [ ] Test unique amount generation (no collisions)
- [ ] Test intent expiry (10 minutes)
- [ ] Test scoring with different scenarios:
  - Perfect match (amount + time) → 90-100
  - Wrong amount → <50
  - Reused UTR → low score
  - Too many attempts → suspicious

### 4.2 Frontend Tests ❌
- [ ] Test countdown timer
- [ ] Test expired intent handling
- [ ] Test confidence score display

### 4.3 Integration Tests ❌
- [ ] End-to-end payment flow
- [ ] Test with 3 tenants paying ₹5000 simultaneously
- [ ] Test fraud scenarios

## 🚀 Phase 5: Deployment

### 5.1 Database Schema ❌
**On Render PostgreSQL:**
```bash
# SSH to Render or use psql
CREATE TABLE payment_intents (...);
CREATE TABLE payment_attempts (...);
```

OR rely on `spring.jpa.hibernate.ddl-auto=update`

### 5.2 Environment Variables ❌
**Render backend:**
- No new env vars needed

### 5.3 Testing in Production ❌
- [ ] Create payment intent
- [ ] Complete payment with unique amount
- [ ] Verify confidence score shows in admin
- [ ] Test expiry

## 📊 Phase 6: Monitoring & Alerts

### 6.1 Logging ❌
- [ ] Log all verification scores < 50
- [ ] Alert admin on suspicious patterns
- [ ] Track UTR reuse attempts

### 6.2 Admin Dashboard ❌
- [ ] Add "Suspicious Payments" widget
- [ ] Show fraud detection stats
- [ ] Export verification reports

## 🎯 Priority Order

**IMMEDIATE (Deploy-blocking):**
1. Update PublicPaymentService (2.1)
2. Create DTOs (2.2)
3. Update controller (2.3)
4. Database migration (2.4)
5. Update frontend API (3.1)
6. Update TenantPaymentPage (3.2)

**NICE TO HAVE:**
- Admin confidence UI (3.3)
- Detailed testing (4.1-4.3)
- Monitoring dashboard (6.1-6.2)

## 🔥 Quick Deploy Option

**Minimum changes to make it work:**
1. Just update `confirmPayment()` in PublicPaymentService
2. Add intent creation on page load
3. Pass intentToken in confirm request
4. Skip UI enhancements initially

**Estimated time:** 30-45 minutes

---

## 📝 Notes

- **Database:** Spring Boot will auto-create tables with `ddl-auto=update`
- **Backward Compatibility:** Old payments without intents will still work
- **Scoring Threshold:** 80+ = auto-approve, 50-79 = verify, <50 = reject
- **Amount Offset:** 1-10 rupees added to base rent
- **Intent Validity:** 10 minutes (configurable)
- **Cleanup:** Scheduled task runs every hour

---

## 🐛 Known Issues / Edge Cases

1. **Multiple tenants, same rent:** Handled by unique offsets
2. **Intent expires mid-payment:** User must refresh and get new intent
3. **Network delays:** 10-minute window accounts for this
4. **Wrong tenant uses link:** Intent is tenant-bound, will fail validation
5. **UTR reuse:** Detected and scored low

---

**Status:** Phase 1 Complete ✅ | Phase 2-6 Pending ⏳
**Next Step:** Integrate backend services (Update PublicPaymentService)
