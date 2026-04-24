# JWT Authentication Implementation Guide

## 🔐 Overview

This guide explains the complete JWT authentication implementation with owner-based data filtering.

---

## 📋 Architecture

### Components:

1. **JwtUtil** - Token generation and validation
2. **SecurityContextUtil** - Extract current authenticated owner
3. **JwtAuthenticationFilter** - Intercept requests and validate tokens
4. **SecurityConfig** - Configure security rules
5. **Services** - Business logic with owner filtering

---

## 🔑 JWT Token Structure

### Token Contains:
- **Subject**: Owner's email
- **Custom Claim**: ownerId
- **Issued At**: Token creation time
- **Expiration**: Token expiry time (24 hours default)

### Example Token Payload:
```json
{
  "sub": "john@example.com",
  "ownerId": 1,
  "iat": 1713493200,
  "exp": 1713579600
}
```

---

## 🚀 Authentication Flow

### 1. Registration
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890"
}
```

### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwib3duZXJJZCI6MSwiaWF0IjoxNzEzNDkzMjAwLCJleHAiOjE3MTM1Nzk2MDB9.xxx",
  "type": "Bearer",
  "owner": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  }
}
```

### 3. Making Authenticated Requests
```http
GET /properties/my
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🛡️ Security Context Utility

### SecurityContextUtil Methods:

```java
// Get current owner's email
String email = securityContextUtil.getCurrentUserEmail();

// Get current owner entity
Owner owner = securityContextUtil.getCurrentOwner();

// Get current owner's ID
Long ownerId = securityContextUtil.getCurrentOwnerId();

// Check if user is authenticated
boolean isAuth = securityContextUtil.isAuthenticated();
```

---

## 🏗️ Owner-Based Data Filtering

### Implementation Pattern:

```java
@Service
@RequiredArgsConstructor
public class PropertyService {
    
    private final PropertyRepository propertyRepository;
    private final SecurityContextUtil securityContextUtil;
    
    // Automatically filter by current owner
    public List<Property> getMyProperties() {
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        return propertyRepository.findByOwnerId(ownerId);
    }
    
    // Ensure property belongs to current owner
    public Property getMyPropertyById(Long propertyId) {
        Long ownerId = securityContextUtil.getCurrentOwnerId();
        return propertyRepository.findByIdAndOwnerId(propertyId, ownerId)
                .orElseThrow(() -> new RuntimeException("Property not found or access denied"));
    }
    
    // Automatically assign to current owner
    public Property createProperty(Property property) {
        Owner currentOwner = securityContextUtil.getCurrentOwner();
        property.setOwner(currentOwner);
        return propertyRepository.save(property);
    }
}
```

---

## 📡 API Endpoints

### Public Endpoints (No Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new owner |
| POST | /auth/login | Login and get JWT token |

### Protected Endpoints (Require JWT Token)

#### Owner Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /owners | Get all owners |
| POST | /owners | Create owner |

#### Property Endpoints (Owner-Filtered)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /properties | Create property (auto-assigned to current owner) |
| GET | /properties/my | Get all my properties |
| GET | /properties/my/{id} | Get specific property (only if I own it) |
| PUT | /properties/my/{id} | Update my property |
| DELETE | /properties/my/{id} | Delete my property |

---

## 🔒 Security Configuration

### Public Routes:
- `/auth/**` - Registration and login

### Protected Routes:
- Everything else requires JWT token

### Session Management:
- **Stateless** - No session cookies
- JWT token required for each request

---

## 💻 Usage Examples

### 1. Register Owner
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "1234567890"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Save the token from response!**

### 3. Create Property
```bash
curl -X POST http://localhost:8080/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Sunset Apartments",
    "location": "123 Main St, City",
    "upiId": "john@upi"
  }'
```

### 4. Get My Properties
```bash
curl -X GET http://localhost:8080/properties/my \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Get Specific Property
```bash
curl -X GET http://localhost:8080/properties/my/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Update Property
```bash
curl -X PUT http://localhost:8080/properties/my/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Sunset Apartments Updated",
    "location": "123 Main St, City",
    "upiId": "john@upi"
  }'
```

### 7. Delete Property
```bash
curl -X DELETE http://localhost:8080/properties/my/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## ⚡ Key Features

### 1. Automatic Owner Assignment
When creating resources, the current authenticated owner is automatically assigned:
```java
property.setOwner(securityContextUtil.getCurrentOwner());
```

### 2. Owner-Based Access Control
Only owners can access their own data:
```java
propertyRepository.findByIdAndOwnerId(propertyId, ownerId);
```

### 3. Security by Default
All endpoints except `/auth/**` require authentication.

### 4. Clean Separation
- **JwtUtil**: Token operations
- **SecurityContextUtil**: Current user access
- **Services**: Business logic with filtering
- **Controllers**: HTTP layer

---

## 🛠️ Extending the Pattern

### For Other Entities (Room, Tenant, Payment):

```java
@Service
@RequiredArgsConstructor
public class RoomService {
    
    private final RoomRepository roomRepository;
    private final PropertyService propertyService;
    private final SecurityContextUtil securityContextUtil;
    
    public List<Room> getMyRooms(Long propertyId) {
        // Verify property belongs to current owner
        propertyService.getMyPropertyById(propertyId);
        
        // Then get rooms
        return roomRepository.findByPropertyId(propertyId);
    }
    
    public Room createRoom(Long propertyId, Room room) {
        // Verify property ownership
        Property property = propertyService.getMyPropertyById(propertyId);
        
        room.setProperty(property);
        return roomRepository.save(room);
    }
}
```

---

## 🔍 Error Handling

### Global Exception Handler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials() {
        // Returns 401 Unauthorized
    }
    
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException() {
        // Returns 400 Bad Request with error message
    }
}
```

### Common Errors:

**401 Unauthorized** - Invalid credentials or missing token
```json
{
  "timestamp": "2026-04-19T01:00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid email or password"
}
```

**400 Bad Request** - Property not found or access denied
```json
{
  "timestamp": "2026-04-19T01:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Property not found or access denied"
}
```

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. POST /auth/login (email, password)
       ▼
┌─────────────────┐
│ AuthController  │
└──────┬──────────┘
       │ 2. Authenticate
       ▼
┌─────────────────┐
│  AuthService    │
└──────┬──────────┘
       │ 3. Validate credentials
       ▼
┌─────────────────┐
│   JwtUtil       │ 4. Generate token with ownerId
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  JWT Token      │ { sub: email, ownerId: 1 }
└──────┬──────────┘
       │ 5. Return to client
       ▼
┌─────────────────┐
│    Client       │ Stores token
└──────┬──────────┘
       │ 6. GET /properties/my
       │    Authorization: Bearer <token>
       ▼
┌─────────────────────────┐
│ JwtAuthenticationFilter │ 7. Extract & validate token
└──────┬──────────────────┘
       │ 8. Set authentication context
       ▼
┌─────────────────────────┐
│  PropertyController     │
└──────┬──────────────────┘
       │ 9. Call service
       ▼
┌─────────────────────────┐
│  PropertyService        │
└──────┬──────────────────┘
       │ 10. Get current owner ID
       ▼
┌─────────────────────────┐
│  SecurityContextUtil    │ 11. Extract from context
└──────┬──────────────────┘
       │ 12. ownerId = 1
       ▼
┌─────────────────────────┐
│  PropertyRepository     │ 13. findByOwnerId(1)
└──────┬──────────────────┘
       │ 14. Return filtered data
       ▼
┌─────────────────────────┐
│      Client             │ Receives only owned properties
└─────────────────────────┘
```

---

## ✅ Best Practices Implemented

1. **JWT in Claims**: Store ownerId in token claims
2. **Security Context**: Use Spring Security context for current user
3. **Service Layer Filtering**: Filter data by owner in service layer
4. **Repository Methods**: Custom queries with owner filtering
5. **Automatic Assignment**: Auto-assign resources to current owner
6. **Access Control**: Verify ownership before operations
7. **Clean Architecture**: Separation of concerns
8. **Error Handling**: Comprehensive exception handling
9. **Stateless Sessions**: No server-side session storage
10. **Password Encryption**: BCrypt for password hashing

---

## 🎯 Summary

This implementation provides:
- ✅ Secure JWT-based authentication
- ✅ OwnerId embedded in token
- ✅ Easy access to current owner in services
- ✅ Automatic data filtering by owner
- ✅ Protection against unauthorized access
- ✅ Clean, maintainable code structure
- ✅ Ready for production use

Each owner can only see and manage their own data, ensuring complete data isolation and security!
