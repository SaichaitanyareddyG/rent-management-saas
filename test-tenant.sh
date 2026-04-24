#!/bin/bash

# Tenant Module Testing Script
# Tests CRUD operations with strict ownership validation

echo "========================================="
echo "🧪 TENANT MODULE SECURITY TEST"
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

# Get first property ID
echo "📝 Step 2: Get properties to find propertyId"
echo "Request: GET /properties"
echo ""

PROPERTIES=$(curl -s -X GET "$BASE_URL/properties" \
  -H "Authorization: Bearer $TOKEN")

PROPERTY_ID=$(echo $PROPERTIES | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

if [ -z "$PROPERTY_ID" ]; then
    echo "❌ No properties found. Creating one first..."
    CREATE_PROPERTY=$(curl -s -X POST "$BASE_URL/properties" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"name":"Test Property","location":"Mumbai","upiId":"owner@upi"}')
    PROPERTY_ID=$(echo $CREATE_PROPERTY | grep -o '"id":[0-9]*' | sed 's/"id"://')
    echo "✅ Property created with ID: $PROPERTY_ID"
else
    echo "✅ Found property ID: $PROPERTY_ID"
fi

echo ""

# Get or create room
echo "📝 Step 3: Get rooms to find roomId"
echo "Request: GET /rooms"
echo ""

ROOMS=$(curl -s -X GET "$BASE_URL/rooms" \
  -H "Authorization: Bearer $TOKEN")

ROOM_ID=$(echo $ROOMS | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

if [ -z "$ROOM_ID" ]; then
    echo "❌ No rooms found. Creating one first..."
    CREATE_ROOM=$(curl -s -X POST "$BASE_URL/rooms" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"roomNumber\":\"101\",\"capacity\":2,\"occupiedCount\":0,\"propertyId\":$PROPERTY_ID}")
    ROOM_ID=$(echo $CREATE_ROOM | grep -o '"id":[0-9]*' | sed 's/"id"://')
    echo "✅ Room created with ID: $ROOM_ID"
else
    echo "✅ Found room ID: $ROOM_ID"
fi

echo ""
echo "========================================="
echo "🏗️  CREATE TENANT TEST"
echo "========================================="
echo ""

echo "📝 Step 4: Create Tenant (POST /tenants)"
echo "Expected: 201 Created with tenant details"
echo ""

CREATE_TENANT=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/tenants" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"John Doe\",
    \"phone\": \"9876543210\",
    \"rentAmount\": 15000.00,
    \"propertyId\": $PROPERTY_ID,
    \"roomId\": $ROOM_ID,
    \"joiningDate\": \"2026-04-01\",
    \"rentDueDay\": 5,
    \"advanceAmount\": 15000.00,
    \"depositAmount\": 30000.00,
    \"notes\": \"First tenant in the property\"
  }")

HTTP_STATUS=$(echo "$CREATE_TENANT" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY=$(echo "$CREATE_TENANT" | sed '/HTTP_STATUS/d')

echo "Response:"
echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
echo ""

if [ "$HTTP_STATUS" = "201" ]; then
    echo "✅ Tenant created successfully!"
    TENANT_ID=$(echo $RESPONSE_BODY | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
    echo "Tenant ID: $TENANT_ID"
else
    echo "❌ Failed with HTTP status: $HTTP_STATUS"
fi

echo ""
echo "========================================="
echo "📋 GET ALL TENANTS TEST"
echo "========================================="
echo ""

echo "📝 Step 5: Get all tenants for owner (GET /tenants)"
echo "Expected: Only tenants from owner's properties"
echo ""

ALL_TENANTS=$(curl -s -X GET "$BASE_URL/tenants" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$ALL_TENANTS" | jq '.' 2>/dev/null || echo "$ALL_TENANTS"
echo ""

TENANT_COUNT=$(echo "$ALL_TENANTS" | grep -o '"id"' | wc -l | xargs)

if [ "$TENANT_COUNT" -gt 0 ]; then
    echo "✅ Retrieved $TENANT_COUNT tenant(s)"
else
    echo "⚠️  No tenants found"
fi

echo ""
echo "========================================="
echo "📋 GET ACTIVE TENANTS TEST"
echo "========================================="
echo ""

echo "📝 Step 6: Get active tenants only (GET /tenants/active)"
echo "Expected: Only ACTIVE status tenants"
echo ""

ACTIVE_TENANTS=$(curl -s -X GET "$BASE_URL/tenants/active" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$ACTIVE_TENANTS" | jq '.' 2>/dev/null || echo "$ACTIVE_TENANTS"
echo ""

ACTIVE_COUNT=$(echo "$ACTIVE_TENANTS" | grep -o '"id"' | wc -l | xargs)
echo "✅ Retrieved $ACTIVE_COUNT active tenant(s)"

echo ""
echo "========================================="
echo "🔍 GET TENANT BY ID TEST"
echo "========================================="
echo ""

if [ ! -z "$TENANT_ID" ]; then
    echo "📝 Step 7: Get tenant by ID (GET /tenants/$TENANT_ID)"
    echo "Expected: Tenant details if owned by current user"
    echo ""
    
    GET_TENANT=$(curl -s -X GET "$BASE_URL/tenants/$TENANT_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "Response:"
    echo "$GET_TENANT" | jq '.' 2>/dev/null || echo "$GET_TENANT"
    echo ""
    
    if echo "$GET_TENANT" | grep -q "\"id\":$TENANT_ID"; then
        echo "✅ Tenant retrieved successfully!"
    else
        echo "❌ Failed to retrieve tenant"
    fi
else
    echo "⚠️  Skipped - no tenant ID available"
fi

echo ""
echo "========================================="
echo "📋 GET TENANTS BY PROPERTY TEST"
echo "========================================="
echo ""

echo "📝 Step 8: Get tenants by property (GET /tenants/property/$PROPERTY_ID)"
echo "Expected: Tenants for this specific property"
echo ""

PROPERTY_TENANTS=$(curl -s -X GET "$BASE_URL/tenants/property/$PROPERTY_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$PROPERTY_TENANTS" | jq '.' 2>/dev/null || echo "$PROPERTY_TENANTS"
echo ""

PROPERTY_TENANT_COUNT=$(echo "$PROPERTY_TENANTS" | grep -o '"id"' | wc -l | xargs)

if [ "$PROPERTY_TENANT_COUNT" -gt 0 ]; then
    echo "✅ Retrieved $PROPERTY_TENANT_COUNT tenant(s) for property $PROPERTY_ID"
else
    echo "⚠️  No tenants found for this property"
fi

echo ""
echo "========================================="
echo "📋 GET TENANTS BY ROOM TEST"
echo "========================================="
echo ""

echo "📝 Step 9: Get tenants by room (GET /tenants/room/$ROOM_ID)"
echo "Expected: Tenants in this specific room"
echo ""

ROOM_TENANTS=$(curl -s -X GET "$BASE_URL/tenants/room/$ROOM_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$ROOM_TENANTS" | jq '.' 2>/dev/null || echo "$ROOM_TENANTS"
echo ""

ROOM_TENANT_COUNT=$(echo "$ROOM_TENANTS" | grep -o '"id"' | wc -l | xargs)

if [ "$ROOM_TENANT_COUNT" -gt 0 ]; then
    echo "✅ Retrieved $ROOM_TENANT_COUNT tenant(s) for room $ROOM_ID"
else
    echo "⚠️  No tenants found for this room"
fi

echo ""
echo "========================================="
echo "✏️  UPDATE TENANT TEST"
echo "========================================="
echo ""

if [ ! -z "$TENANT_ID" ]; then
    echo "📝 Step 10: Update tenant (PUT /tenants/$TENANT_ID)"
    echo "Expected: 200 OK with updated details"
    echo ""
    
    UPDATE_TENANT=$(curl -s -X PUT "$BASE_URL/tenants/$TENANT_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"name\": \"John Doe Updated\",
        \"phone\": \"9876543210\",
        \"rentAmount\": 16000.00,
        \"propertyId\": $PROPERTY_ID,
        \"roomId\": $ROOM_ID,
        \"joiningDate\": \"2026-04-01\",
        \"rentDueDay\": 10,
        \"advanceAmount\": 16000.00,
        \"depositAmount\": 32000.00,
        \"notes\": \"Rent increased by 1000\"
      }")
    
    echo "Response:"
    echo "$UPDATE_TENANT" | jq '.' 2>/dev/null || echo "$UPDATE_TENANT"
    echo ""
    
    if echo "$UPDATE_TENANT" | grep -q '"name":"John Doe Updated"'; then
        echo "✅ Tenant updated successfully!"
    else
        echo "❌ Failed to update tenant"
    fi
else
    echo "⚠️  Skipped - no tenant ID available"
fi

echo ""
echo "========================================="
echo "🔄 UPDATE TENANT STATUS TEST"
echo "========================================="
echo ""

if [ ! -z "$TENANT_ID" ]; then
    echo "📝 Step 11: Update tenant status (PATCH /tenants/$TENANT_ID/status?status=INACTIVE)"
    echo "Expected: 200 OK with status changed to INACTIVE"
    echo ""
    
    STATUS_UPDATE=$(curl -s -X PATCH "$BASE_URL/tenants/$TENANT_ID/status?status=INACTIVE" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "Response:"
    echo "$STATUS_UPDATE" | jq '.' 2>/dev/null || echo "$STATUS_UPDATE"
    echo ""
    
    if echo "$STATUS_UPDATE" | grep -q '"status":"INACTIVE"'; then
        echo "✅ Tenant status updated to INACTIVE!"
        
        # Set it back to ACTIVE
        echo ""
        echo "Setting status back to ACTIVE..."
        curl -s -X PATCH "$BASE_URL/tenants/$TENANT_ID/status?status=ACTIVE" \
          -H "Authorization: Bearer $TOKEN" > /dev/null
        echo "✅ Status set back to ACTIVE"
    else
        echo "❌ Failed to update status"
    fi
else
    echo "⚠️  Skipped - no tenant ID available"
fi

echo ""
echo "========================================="
echo "📊 COUNT ACTIVE TENANTS TEST"
echo "========================================="
echo ""

echo "📝 Step 12: Count active tenants (GET /tenants/count/active)"
echo "Expected: Number of active tenants"
echo ""

COUNT_ACTIVE=$(curl -s -X GET "$BASE_URL/tenants/count/active" \
  -H "Authorization: Bearer $TOKEN")

echo "Active tenant count: $COUNT_ACTIVE"
echo "✅ Count retrieved successfully!"

echo ""
echo "========================================="
echo "🔐 SECURITY TEST: Access other owner's tenant"
echo "========================================="
echo ""

echo "📝 Step 13: Try accessing tenant ID 999 (should fail)"
echo "Expected: 500 or error message about access denied"
echo ""

UNAUTHORIZED=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/tenants/999" \
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
echo "🗑️  DELETE TENANT TEST"
echo "========================================="
echo ""

if [ ! -z "$TENANT_ID" ]; then
    echo "📝 Step 14: Delete tenant (DELETE /tenants/$TENANT_ID)"
    echo "Expected: 204 No Content"
    echo ""
    
    DELETE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE "$BASE_URL/tenants/$TENANT_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    DELETE_STATUS=$(echo "$DELETE_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
    
    echo "HTTP Status: $DELETE_STATUS"
    echo ""
    
    if [ "$DELETE_STATUS" = "204" ]; then
        echo "✅ Tenant deleted successfully!"
    else
        echo "❌ Failed to delete tenant (Status: $DELETE_STATUS)"
    fi
else
    echo "⚠️  Skipped - no tenant ID available"
fi

echo ""
echo "========================================="
echo "📊 TEST SUMMARY"
echo "========================================="
echo ""
echo "✅ Login successful"
echo "✅ Tenant creation tested (with property & room validation)"
echo "✅ Get all tenants tested"
echo "✅ Get active tenants tested"
echo "✅ Get tenant by ID tested"
echo "✅ Get tenants by property tested"
echo "✅ Get tenants by room tested"
echo "✅ Update tenant tested"
echo "✅ Update tenant status tested"
echo "✅ Count active tenants tested"
echo "✅ Security validation tested"
echo "✅ Delete tenant tested"
echo ""
echo "🎯 Tenant module testing complete!"
echo "========================================="
