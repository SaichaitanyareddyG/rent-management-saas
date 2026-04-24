#!/bin/bash

# JWT Authentication Test Script
# This script demonstrates the complete authentication flow

BASE_URL="http://localhost:8080"

echo "=================================="
echo "JWT Authentication Test Script"
echo "=================================="
echo ""

# 1. Register a new owner
echo "1. Registering new owner..."
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Owner",
    "email": "test@example.com",
    "password": "password123",
    "phone": "9876543210"
  }')

echo "Registration Response:"
echo "$REGISTER_RESPONSE" | jq '.'
echo ""

# 2. Login to get JWT token
echo "2. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq '.'
echo ""

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
echo "Extracted Token: ${TOKEN:0:50}..."
echo ""

# 3. Create a property (requires authentication)
echo "3. Creating property with authentication..."
PROPERTY_RESPONSE=$(curl -s -X POST "${BASE_URL}/properties" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Sunset Apartments",
    "location": "123 Main Street, Mumbai",
    "upiId": "test@upi"
  }')

echo "Property Creation Response:"
echo "$PROPERTY_RESPONSE" | jq '.'
echo ""

# 4. Get my properties
echo "4. Getting my properties..."
MY_PROPERTIES=$(curl -s -X GET "${BASE_URL}/properties/my" \
  -H "Authorization: Bearer $TOKEN")

echo "My Properties:"
echo "$MY_PROPERTIES" | jq '.'
echo ""

# 5. Try to access without token (should fail)
echo "5. Trying to access without token (should fail)..."
NO_AUTH_RESPONSE=$(curl -s -w "\nHTTP Status: %{http_code}" \
  -X GET "${BASE_URL}/properties/my")

echo "Response without authentication:"
echo "$NO_AUTH_RESPONSE"
echo ""

echo "=================================="
echo "Test Complete!"
echo "=================================="
