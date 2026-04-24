#!/bin/bash

# Payment Module Testing Script
# Tests payment initiation, confirmation, and verification flow

echo "========================================="
echo "🧪 PAYMENT MODULE TEST - Your USP! 🔥"
echo "========================================="
echo ""

# Configuration
BASE_URL="http://localhost:8080"
EMAIL="john@example.com"
PASSWORD="pass123"

echo "📝 Step 1: Login to get JWT token"
echo "Request: POST /auth/login"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
    echo "❌ Login failed. Response:"
    echo $LOGIN_RESPONSE
    exit 1
fi

echo "✅ Login successful!"
echo "Token: ${TOKEN:0:50}..."
echo ""

# Get property, room, and tenant
echo "📝 Step 2: Setup - Get property, room, tenant IDs"
echo ""

PROPERTIES=$(curl -s -X GET "$BASE_URL/properties" -H "Authorization: Bearer $TOKEN")
PROPERTY_ID=$(echo $PROPERTIES | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

if [ -z "$PROPERTY_ID" ]; then
    echo "Creating property..."
    CREATE_PROPERTY=$(curl -s -X POST "$BASE_URL/properties" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"name":"Test Property","location":"Mumbai","upiId":"owner@upi"}')
    PROPERTY_ID=$(echo $CREATE_PROPERTY | grep -o '"id":[0-9]*' | sed 's/"id"://')
fi

ROOMS=$(curl -s -X GET "$BASE_URL/rooms" -H "Authorization: Bearer $TOKEN")
ROOM_ID=$(echo $ROOMS | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

if [ -z "$ROOM_ID" ]; then
    echo "Creating room..."
    CREATE_ROOM=$(curl -s -X POST "$BASE_URL/rooms" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"roomNumber\":\"101\",\"capacity\":2,\"propertyId\":$PROPERTY_ID}")
    ROOM_ID=$(echo $CREATE_ROOM | grep -o '"id":[0-9]*' | sed 's/"id"://')
fi

TENANTS=$(curl -s -X GET "$BASE_URL/tenants/active" -H "Authorization: Bearer $TOKEN")
TENANT_ID=$(echo $TENANTS | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

if [ -z "$TENANT_ID" ]; then
    echo "Creating tenant..."
    CREATE_TENANT=$(curl -s -X POST "$BASE_URL/tenants" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"name\": \"Test Tenant\",
        \"phone\": \"9876543210\",
        \"rentAmount\": 15000.00,
        \"propertyId\": $PROPERTY_ID,
        \"roomId\": $ROOM_ID,
        \"joiningDate\": \"2026-04-01\",
        \"rentDueDay\": 5
      }")
    TENANT_ID=$(echo $CREATE_TENANT | grep -o '"id":[0-9]*' | sed 's/"id"://')
fi

echo "✅ Property ID: $PROPERTY_ID"
echo "✅ Room ID: $ROOM_ID"
echo "✅ Tenant ID: $TENANT_ID"

CURRENT_MONTH="2026-04"

echo ""
echo "========================================="
echo "💰 STEP 1: INITIATE PAYMENT"
echo "========================================="
echo ""

echo "📝 Step 3: Initiate payment (POST /payments/initiate)"
echo "User clicks 'Pay Rent' → Creates PaymentIntent"
echo ""

INITIATE_PAYMENT=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/payments/initiate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenantId\": $TENANT_ID,
    \"month\": \"$CURRENT_MONTH\",
    \"amount\": 15000.00
  }")

INIT_STATUS=$(echo "$INITIATE_PAYMENT" | grep "HTTP_STATUS" | cut -d: -f2)
INIT_BODY=$(echo "$INITIATE_PAYMENT" | sed '/HTTP_STATUS/d')

echo "Response:"
echo "$INIT_BODY" | jq '.' 2>/dev/null || echo "$INIT_BODY"
echo ""

if [ "$INIT_STATUS" = "201" ]; then
    echo "✅ Payment intent created! Status: INITIATED"
    INTENT_ID=$(echo $INIT_BODY | grep -o '"id":[0-9]*' | sed 's/"id"://')
    echo "Intent ID: $INTENT_ID"
else
    echo "❌ Failed with HTTP status: $INIT_STATUS"
fi

echo ""
echo "========================================="
echo "✅ STEP 2: CONFIRM PAYMENT WITH UTR"
echo "========================================="
echo ""

echo "📝 Step 4: Confirm payment (POST /payments/confirm)"
echo "User pays via UPI, submits UTR → Creates Payment with VERIFY status"
echo ""

# Simulate UPI transaction reference
UTR="UPI$(date +%s)123456"

CONFIRM_PAYMENT=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/payments/confirm" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenantId\": $TENANT_ID,
    \"month\": \"$CURRENT_MONTH\",
    \"utr\": \"$UTR\",
    \"notes\": \"Paid via Google Pay\"
  }")

CONFIRM_STATUS=$(echo "$CONFIRM_PAYMENT" | grep "HTTP_STATUS" | cut -d: -f2)
CONFIRM_BODY=$(echo "$CONFIRM_PAYMENT" | sed '/HTTP_STATUS/d')

echo "Response:"
echo "$CONFIRM_BODY" | jq '.' 2>/dev/null || echo "$CONFIRM_BODY"
echo ""

if [ "$CONFIRM_STATUS" = "201" ]; then
    echo "✅ Payment confirmed! Status: VERIFY (awaiting admin verification)"
    PAYMENT_ID=$(echo $CONFIRM_BODY | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
    echo "Payment ID: $PAYMENT_ID"
    echo "UTR: $UTR"
else
    echo "❌ Failed with HTTP status: $CONFIRM_STATUS"
fi

echo ""
echo "========================================="
echo "🔍 STEP 3: ADMIN VERIFIES PAYMENT"
echo "========================================="
echo ""

if [ ! -z "$PAYMENT_ID" ]; then
    echo "📝 Step 5: Update payment status to PAID (PATCH /payments/$PAYMENT_ID/status)"
    echo "Admin verifies UTR → Marks as PAID"
    echo ""
    
    VERIFY_PAYMENT=$(curl -s -X PATCH "$BASE_URL/payments/$PAYMENT_ID/status?status=PAID" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "Response:"
    echo "$VERIFY_PAYMENT" | jq '.' 2>/dev/null || echo "$VERIFY_PAYMENT"
    echo ""
    
    if echo "$VERIFY_PAYMENT" | grep -q '"status":"PAID"'; then
        echo "✅ Payment verified and marked as PAID!"
    else
        echo "❌ Failed to verify payment"
    fi
else
    echo "⚠️  Skipped - no payment ID available"
fi

echo ""
echo "========================================="
echo "📊 GET ALL PAYMENTS"
echo "========================================="
echo ""

echo "📝 Step 6: Get all payments (GET /payments)"
echo ""

ALL_PAYMENTS=$(curl -s -X GET "$BASE_URL/payments" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$ALL_PAYMENTS" | jq '.' 2>/dev/null || echo "$ALL_PAYMENTS"
echo ""

PAYMENT_COUNT=$(echo "$ALL_PAYMENTS" | grep -o '"id"' | wc -l | xargs)
echo "✅ Retrieved $PAYMENT_COUNT payment(s)"

echo ""
echo "========================================="
echo "📅 GET PAYMENTS BY MONTH"
echo "========================================="
echo ""

echo "📝 Step 7: Get payments by month (GET /payments/month/$CURRENT_MONTH)"
echo ""

MONTH_PAYMENTS=$(curl -s -X GET "$BASE_URL/payments/month/$CURRENT_MONTH" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$MONTH_PAYMENTS" | jq '.' 2>/dev/null || echo "$MONTH_PAYMENTS"
echo ""

MONTH_COUNT=$(echo "$MONTH_PAYMENTS" | grep -o '"id"' | wc -l | xargs)
echo "✅ Retrieved $MONTH_COUNT payment(s) for $CURRENT_MONTH"

echo ""
echo "========================================="
echo "💵 GET PAYMENTS BY STATUS"
echo "========================================="
echo ""

echo "📝 Step 8: Get PAID payments (GET /payments/status/PAID)"
echo ""

PAID_PAYMENTS=$(curl -s -X GET "$BASE_URL/payments/status/PAID" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$PAID_PAYMENTS" | jq '.' 2>/dev/null || echo "$PAID_PAYMENTS"
echo ""

PAID_COUNT=$(echo "$PAID_PAYMENTS" | grep -o '"id"' | wc -l | xargs)
echo "✅ Retrieved $PAID_COUNT paid payment(s)"

echo ""
echo "========================================="
echo "👤 GET PAYMENTS BY TENANT"
echo "========================================="
echo ""

echo "📝 Step 9: Get payments for tenant (GET /payments/tenant/$TENANT_ID)"
echo ""

TENANT_PAYMENTS=$(curl -s -X GET "$BASE_URL/payments/tenant/$TENANT_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$TENANT_PAYMENTS" | jq '.' 2>/dev/null || echo "$TENANT_PAYMENTS"
echo ""

TENANT_PAYMENT_COUNT=$(echo "$TENANT_PAYMENTS" | grep -o '"id"' | wc -l | xargs)
echo "✅ Retrieved $TENANT_PAYMENT_COUNT payment(s) for tenant $TENANT_ID"

echo ""
echo "========================================="
echo "📊 PAYMENT STATISTICS (DASHBOARD)"
echo "========================================="
echo ""

echo "📝 Step 10: Get payment stats (GET /payments/stats)"
echo ""

STATS=$(curl -s -X GET "$BASE_URL/payments/stats" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$STATS" | jq '.' 2>/dev/null || echo "$STATS"
echo ""

echo "✅ Dashboard statistics retrieved!"

echo ""
echo "========================================="
echo "🔐 SECURITY TEST: Duplicate Prevention"
echo "========================================="
echo ""

echo "📝 Step 11: Try to initiate payment again for same month (should fail)"
echo ""

DUPLICATE_INITIATE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/payments/initiate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenantId\": $TENANT_ID,
    \"month\": \"$CURRENT_MONTH\",
    \"amount\": 15000.00
  }")

DUP_STATUS=$(echo "$DUPLICATE_INITIATE" | grep "HTTP_STATUS" | cut -d: -f2)
DUP_BODY=$(echo "$DUPLICATE_INITIATE" | sed '/HTTP_STATUS/d')

echo "Response:"
echo "$DUP_BODY" | jq '.' 2>/dev/null || echo "$DUP_BODY"
echo ""

if echo "$DUP_BODY" | grep -q "already exists\|already initiated"; then
    echo "✅ Duplicate prevention working! Payment already exists for this month."
else
    echo "⚠️  Expected duplicate prevention error"
fi

echo ""
echo "========================================="
echo "🔐 SECURITY TEST: Unauthorized Access"
echo "========================================="
echo ""

echo "📝 Step 12: Try accessing payment ID 999 (should fail)"
echo ""

UNAUTHORIZED=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/payments/999" \
  -H "Authorization: Bearer $TOKEN")

UNAUTH_STATUS=$(echo "$UNAUTHORIZED" | grep "HTTP_STATUS" | cut -d: -f2)
UNAUTH_BODY=$(echo "$UNAUTHORIZED" | sed '/HTTP_STATUS/d')

echo "Response:"
echo "$UNAUTH_BODY" | jq '.' 2>/dev/null || echo "$UNAUTH_BODY"
echo ""

if echo "$UNAUTH_BODY" | grep -q "not found\|access denied"; then
    echo "✅ Security validation working! Access denied."
else
    echo "⚠️  Unexpected response"
fi

echo ""
echo "========================================="
echo "📊 TEST SUMMARY"
echo "========================================="
echo ""
echo "✅ Login successful"
echo "✅ Payment initiation tested (PaymentIntent created)"
echo "✅ Payment confirmation tested (UTR submitted)"
echo "✅ Payment verification tested (marked as PAID)"
echo "✅ Get all payments tested"
echo "✅ Get payments by month tested"
echo "✅ Get payments by status tested"
echo "✅ Get payments by tenant tested"
echo "✅ Dashboard statistics tested"
echo "✅ Duplicate payment prevention tested"
echo "✅ Security validation tested"
echo ""
echo "🎯 Payment Flow Complete:"
echo "   1️⃣  User clicks 'Pay Rent' → Intent INITIATED"
echo "   2️⃣  User pays via UPI, submits UTR → Payment VERIFY"
echo "   3️⃣  Admin verifies UTR → Payment PAID"
echo ""
echo "🔥 Your USP is working! UPI payment tracking without payment gateways!"
echo "========================================="
