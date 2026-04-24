#!/bin/bash

# Room Module Testing Script
# Tests CRUD operations with strict ownership validation

echo "========================================="
echo "🧪 ROOM MODULE SECURITY TEST"
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
echo "========================================="
echo "🏗️  CREATE ROOM TEST"
echo "========================================="
echo ""

echo "📝 Step 3: Create Room (POST /rooms)"
echo "Expected: 201 Created with room details"
echo ""

CREATE_ROOM=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/rooms" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"roomNumber\": \"101\",
    \"capacity\": 2,
    \"occupiedCount\": 0,
    \"propertyId\": $PROPERTY_ID
  }")

HTTP_STATUS=$(echo "$CREATE_ROOM" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY=$(echo "$CREATE_ROOM" | sed '/HTTP_STATUS/d')

echo "Response:"
echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
echo ""

if [ "$HTTP_STATUS" = "201" ]; then
    echo "✅ Room created successfully!"
    ROOM_ID=$(echo $RESPONSE_BODY | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
    echo "Room ID: $ROOM_ID"
else
    echo "❌ Failed with HTTP status: $HTTP_STATUS"
fi

echo ""
echo "========================================="
echo "📋 GET ALL ROOMS TEST"
echo "========================================="
echo ""

echo "📝 Step 4: Get all rooms for owner (GET /rooms)"
echo "Expected: Only rooms from owner's properties"
echo ""

ALL_ROOMS=$(curl -s -X GET "$BASE_URL/rooms" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$ALL_ROOMS" | jq '.' 2>/dev/null || echo "$ALL_ROOMS"
echo ""

ROOM_COUNT=$(echo "$ALL_ROOMS" | grep -o '"id"' | wc -l | xargs)

if [ "$ROOM_COUNT" -gt 0 ]; then
    echo "✅ Retrieved $ROOM_COUNT room(s)"
else
    echo "⚠️  No rooms found"
fi

echo ""
echo "========================================="
echo "🔍 GET ROOM BY ID TEST"
echo "========================================="
echo ""

if [ ! -z "$ROOM_ID" ]; then
    echo "📝 Step 5: Get room by ID (GET /rooms/$ROOM_ID)"
    echo "Expected: Room details if owned by current user"
    echo ""
    
    GET_ROOM=$(curl -s -X GET "$BASE_URL/rooms/$ROOM_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "Response:"
    echo "$GET_ROOM" | jq '.' 2>/dev/null || echo "$GET_ROOM"
    echo ""
    
    if echo "$GET_ROOM" | grep -q "\"id\":$ROOM_ID"; then
        echo "✅ Room retrieved successfully!"
    else
        echo "❌ Failed to retrieve room"
    fi
else
    echo "⚠️  Skipped - no room ID available"
fi

echo ""
echo "========================================="
echo "📋 GET ROOMS BY PROPERTY TEST"
echo "========================================="
echo ""

echo "📝 Step 6: Get rooms by property (GET /rooms/property/$PROPERTY_ID)"
echo "Expected: Rooms for this specific property"
echo ""

PROPERTY_ROOMS=$(curl -s -X GET "$BASE_URL/rooms/property/$PROPERTY_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$PROPERTY_ROOMS" | jq '.' 2>/dev/null || echo "$PROPERTY_ROOMS"
echo ""

PROPERTY_ROOM_COUNT=$(echo "$PROPERTY_ROOMS" | grep -o '"id"' | wc -l | xargs)

if [ "$PROPERTY_ROOM_COUNT" -gt 0 ]; then
    echo "✅ Retrieved $PROPERTY_ROOM_COUNT room(s) for property $PROPERTY_ID"
else
    echo "⚠️  No rooms found for this property"
fi

echo ""
echo "========================================="
echo "✏️  UPDATE ROOM TEST"
echo "========================================="
echo ""

if [ ! -z "$ROOM_ID" ]; then
    echo "📝 Step 7: Update room (PUT /rooms/$ROOM_ID)"
    echo "Expected: 200 OK with updated details"
    echo ""
    
    UPDATE_ROOM=$(curl -s -X PUT "$BASE_URL/rooms/$ROOM_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"roomNumber\": \"101-A\",
        \"capacity\": 3,
        \"occupiedCount\": 1,
        \"propertyId\": $PROPERTY_ID
      }")
    
    echo "Response:"
    echo "$UPDATE_ROOM" | jq '.' 2>/dev/null || echo "$UPDATE_ROOM"
    echo ""
    
    if echo "$UPDATE_ROOM" | grep -q '"roomNumber":"101-A"'; then
        echo "✅ Room updated successfully!"
    else
        echo "❌ Failed to update room"
    fi
else
    echo "⚠️  Skipped - no room ID available"
fi

echo ""
echo "========================================="
echo "🔐 SECURITY TEST: Access other owner's room"
echo "========================================="
echo ""

echo "📝 Step 8: Try accessing room ID 999 (should fail)"
echo "Expected: 500 or error message about access denied"
echo ""

UNAUTHORIZED=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/rooms/999" \
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
echo "🗑️  DELETE ROOM TEST"
echo "========================================="
echo ""

if [ ! -z "$ROOM_ID" ]; then
    echo "📝 Step 9: Delete room (DELETE /rooms/$ROOM_ID)"
    echo "Expected: 204 No Content"
    echo ""
    
    DELETE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE "$BASE_URL/rooms/$ROOM_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    DELETE_STATUS=$(echo "$DELETE_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
    
    echo "HTTP Status: $DELETE_STATUS"
    echo ""
    
    if [ "$DELETE_STATUS" = "204" ]; then
        echo "✅ Room deleted successfully!"
    else
        echo "❌ Failed to delete room (Status: $DELETE_STATUS)"
    fi
else
    echo "⚠️  Skipped - no room ID available"
fi

echo ""
echo "========================================="
echo "📊 TEST SUMMARY"
echo "========================================="
echo ""
echo "✅ Login successful"
echo "✅ Room creation tested"
echo "✅ Get all rooms tested"
echo "✅ Get room by ID tested"
echo "✅ Get rooms by property tested"
echo "✅ Update room tested"
echo "✅ Security validation tested"
echo "✅ Delete room tested"
echo ""
echo "🎯 Room module testing complete!"
echo "========================================="
