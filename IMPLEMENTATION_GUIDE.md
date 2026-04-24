# Rent App - Complete Implementation Guide

## 📋 Table of Contents
1. [Entity Relationships](#entity-relationships)
2. [PaymentIntent Explanation](#paymentintent-explanation)
3. [DTO Pattern](#dto-pattern)
4. [JWT Authentication](#jwt-authentication)
5. [API Endpoints](#api-endpoints)

---

## 🗂️ Entity Relationships

### Owner → Property → Room → Tenant → Payment

```
Owner (1) ────→ (N) Property
                     ↓
                   (1) Property ────→ (N) Room
                     ↓                  ↓
                   (1)                (1)
                     ↓                  ↓
                Tenant (N)         Tenant (N)
                     ↓
                   (1)
                     ↓
                Payment (N)
```

### Entity Details:

**Owner**
- id, name, email, password, phone
- Has many Properties

**Property**
- id, name, location, upiId
- Belongs to Owner
- Has many Rooms
- Has many Tenants

**Room**
- id, roomNumber, capacity
- Belongs to Property
- Has many Tenants

**Tenant**
- id, name, phone, rentAmount, status (ACTIVE/INACTIVE)
- Belongs to Property
- Belongs to Room
- Has many Payments

**Payment**
- id, amount, month, status (PAID/PENDING/VERIFY), utr
- Belongs to Tenant

**PaymentIntent**
- id, tenantId, amount, status (INITIATED/COMPLETED), createdAt

---

## 💡 PaymentIntent Explanation

### Why PaymentIntent is Useful?

**PaymentIntent** acts as a temporary record for payment initiation before the actual payment is completed.

### Use Cases:

1. **UPI Payment Flow**
   - User initiates payment → Create PaymentIntent with INITIATED status
   - User completes payment in UPI app → Update PaymentIntent to COMPLETED
   - After verification → Create Payment record
   - This prevents double payments and tracks abandoned payments

2. **Payment Verification**
   - Track payment attempts
   - Verify UTR before marking payment as PAID
   - Audit trail for all payment attempts

3. **Reconciliation**
   - Compare PaymentIntent records with bank statements
   - Identify failed/pending payments
   - Track payment conversion rate

### Example Flow:
```
1. Tenant clicks "Pay Rent" → PaymentIntent created (INITIATED)
2. UPI app opens → Payment processing
3. Payment successful → PaymentIntent updated (COMPLETED)
4. Admin verifies UTR → Payment created (VERIFY)
5. Admin confirms → Payment updated (PAID)
```

---

## 📦 DTO Pattern in Spring Boot

### What is DTO?

**DTO (Data Transfer Object)** is a pattern used to transfer data between application layers, separating the internal entity structure from external API representation.

### Why Use DTOs?

1. **Security** - Hide sensitive fields (e.g., password)
2. **Decoupling** - API independent of database structure
3. **Validation** - Add input validation annotations
4. **Flexibility** - Different representations for different use cases
5. **Performance** - Send only required data

### DTO Implementation:

#### Request DTO (Input)
```java
@Data
public class OwnerRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    @Email(message = "Email should be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    private String phone;
}
```

#### Response DTO (Output)
```java
@Data
public class OwnerResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    // Password excluded for security
}
```

#### Mapper (Conversion)
```java
@Component
public class OwnerMapper {
    public Owner toEntity(OwnerRequest request) {
        Owner owner = new Owner();
        owner.setName(request.getName());
        owner.setEmail(request.getEmail());
        owner.setPassword(request.getPassword());
        owner.setPhone(request.getPhone());
        return owner;
    }
    
    public OwnerResponse toResponse(Owner owner) {
        return new OwnerResponse(
            owner.getId(),
            owner.getName(),
            owner.getEmail(),
            owner.getPhone()
        );
    }
}
```

### Usage in Controller:
```java
@PostMapping
public ResponseEntity<OwnerResponse> create(@Valid @RequestBody OwnerRequest request) {
    OwnerResponse response = ownerService.createOwner(request);
    return ResponseEntity.ok(response);
}
```

**Benefits:**
- Client sends `OwnerRequest` (with password for registration)
- Server returns `OwnerResponse` (without password for security)
- Entity structure can change without breaking API

---

## 🔐 JWT Authentication

### How JWT Works:

1. **User Registration** → Password hashed and stored
2. **User Login** → Credentials validated
3. **Token Generation** → JWT token created with user info
4. **Token Storage** → Client stores token (localStorage/sessionStorage)
5. **API Requests** → Token sent in Authorization header
6. **Token Validation** → Filter validates token before processing request

### Components:

#### 1. JwtUtil (Token Management)
- `generateToken(email)` - Creates JWT token
- `validateToken(token, email)` - Validates token
- `extractEmail(token)` - Extracts user email from token

#### 2. JwtAuthenticationFilter
- Intercepts all requests
- Extracts token from Authorization header
- Validates token and sets authentication context

#### 3. SecurityConfig
- Configures security rules
- Public endpoints: `/auth/**`
- Protected endpoints: Everything else
- Stateless session (no cookies)

#### 4. CustomUserDetailsService
- Loads user by email
- Used by Spring Security for authentication

### Authentication Flow:

```
Registration:
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}

Response:
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890"
}
```

```
Login:
POST /auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "owner": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  }
}
```

```
Protected Request:
GET /owners
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📡 API Endpoints

### Public Endpoints (No Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new owner |
| POST | /auth/login | Login and get JWT token |

### Protected Endpoints (Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /owners | Get all owners |
| POST | /owners | Create owner |

### Request Headers:
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

---

## 🚀 Testing with cURL

### Register:
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

### Login:
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get All Owners (with token):
```bash
curl -X GET http://localhost:8080/owners \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## 📝 Configuration

Add to `application.properties`:
```properties
# JWT Configuration
jwt.secret=mySecretKeyForJWTTokenGenerationThatIsAtLeast256BitsLong
jwt.expiration=86400000
```

---

## 🏗️ Project Structure

```
src/main/java/com/rentapp/rentapp/
├── config/
│   └── SecurityConfig.java
├── controller/
│   ├── AuthController.java
│   └── OwnerController.java
├── dto/
│   ├── LoginRequest.java
│   ├── LoginResponse.java
│   ├── OwnerRequest.java
│   └── OwnerResponse.java
├── entity/
│   ├── Owner.java
│   ├── Property.java
│   ├── Room.java
│   ├── Tenant.java
│   ├── Payment.java
│   └── PaymentIntent.java
├── enums/
│   ├── TenantStatus.java
│   ├── PaymentStatus.java
│   └── PaymentIntentStatus.java
├── mapper/
│   └── OwnerMapper.java
├── repository/
│   └── OwnerRepository.java
├── security/
│   ├── JwtUtil.java
│   ├── JwtAuthenticationFilter.java
│   └── CustomUserDetailsService.java
└── service/
    ├── AuthService.java
    └── OwnerService.java
```

---

## ✅ Summary

1. **Entities Created**: Owner, Property, Room, Tenant, Payment, PaymentIntent
2. **Relationships**: Properly configured with JPA annotations
3. **DTOs**: Request/Response pattern implemented
4. **JWT Auth**: Complete authentication system with registration and login
5. **Security**: Password encryption, token-based auth, protected routes
6. **Best Practices**: Constructor injection, clean code, validation

The application is now ready with a complete authentication system and entity structure!
