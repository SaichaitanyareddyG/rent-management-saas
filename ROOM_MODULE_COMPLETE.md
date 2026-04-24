# 🏠 Room Module - Complete Implementation Guide

## ✅ Module Status: COMPLETE

**Security Level:** ✅✅✅ Multi-tenant safe with strict ownership validation

---

## 🏗️ Architecture Overview

### Data Flow (CRITICAL):
```
Owner → Property → Room
```

**Security Chain:**
- User authenticated via JWT (ownerId extracted)
- Room belongs to Property
- Property belongs to Owner
- **VALIDATION:** Room accessible only if Property belongs to current Owner

---

## 📊 Entity Structure

### Room Entity
**Location:** [src/main/java/com/rentapp/rentapp/entity/Room.java](src/main/java/com/rentapp/rentapp/entity/Room.java)

**Fields:**
```java
- id: Long (Primary Key)
- roomNumber: String (e.g., "101", "A-202")
- capacity: Integer (max occupants)
- occupiedCount: Integer (current occupants, default 0)
- createdAt: LocalDateTime (auto-generated)
- updatedAt: LocalDateTime (auto-updated)
- property: Property (ManyToOne, LAZY)
- tenants: List<Tenant> (OneToMany)
```

**Key Features:**
- ✅ Timestamps auto-managed
- ✅ Bidirectional relationship with Property
- ✅ JSON serialization safe (no recursion)
- ✅ Lazy loading for performance

---

## 🔍 Repository Layer

### RoomRepository
**Location:** [src/main/java/com/rentapp/rentapp/repository/RoomRepository.java](src/main/java/com/rentapp/rentapp/repository/RoomRepository.java)

**Methods:**

| Method | Security Pattern | Purpose |
|--------|------------------|---------|
| `findByPropertyOwnerId(ownerId)` | ✅ Owner-filtered | Get all rooms across owner's properties |
| `findByIdAndPropertyOwnerId(id, ownerId)` | ✅ Double validation | Get single room with ownership check |
| `findByPropertyIdAndPropertyOwnerId(propertyId, ownerId)` | ✅ Property-scoped | Get rooms for specific property |

**🚫 NEVER USE:**
```java
findAll()                    // ❌ Leaks all rooms across all owners
findById(id)                 // ❌ No ownership validation
findByPropertyId(propertyId) // ❌ No owner validation
```

**✅ ALWAYS USE:**
```java
findByPropertyOwnerId(ownerId)                          // ✅ Filtered by owner
findByIdAndPropertyOwnerId(roomId, ownerId)            // ✅ Secure access
findByPropertyIdAndPropertyOwnerId(propertyId, ownerId) // ✅ Property-scoped
```

---

## 📦 DTO Layer

### RoomRequest
**Location:** [src/main/java/com/rentapp/rentapp/dto/RoomRequest.java](src/main/java/com/rentapp/rentapp/dto/RoomRequest.java)

**Fields:**
```java
@NotBlank
private String roomNumber;

@NotNull @Min(1)
private Integer capacity;

@NotNull
private Long propertyId;  // CRITICAL: Validated against owner!

@Min(0)
private Integer occupiedCount = 0;
```

**Validation:**
- ✅ Room number required
- ✅ Capacity minimum 1
- ✅ Property ID required (ownership validated in service)
- ✅ Occupied count non-negative

---

### RoomResponse
**Location:** [src/main/java/com/rentapp/rentapp/dto/RoomResponse.java](src/main/java/com/rentapp/rentapp/dto/RoomResponse.java)

**Fields:**
```java
private Long id;
private String roomNumber;
private Integer capacity;
private Integer occupiedCount;
private Long propertyId;
private String propertyName;      // Denormalized for convenience
private LocalDateTime createdAt;
private LocalDateTime updatedAt;
```

**Security:**
- ✅ Never exposes entity directly
- ✅ Includes property info for context
- ✅ No sensitive data leaked

---

## 🔄 Mapper Layer

### RoomMapper
**Location:** [src/main/java/com/rentapp/rentapp/mapper/RoomMapper.java](src/main/java/com/rentapp/rentapp/mapper/RoomMapper.java)

**Methods:**
- `toEntity(RoomRequest)` - Convert DTO to entity
- `toResponse(Room)` - Convert entity to DTO
- `updateEntity(Room, RoomRequest)` - Update existing entity

---

## 🛡️ Service Layer (CRITICAL SECURITY)

### RoomService
**Location:** [src/main/java/com/rentapp/rentapp/service/RoomService.java](src/main/java/com/rentapp/rentapp/service/RoomService.java)

**Security Pattern Applied:**

#### ✅ CREATE ROOM (Most Critical)

```java
@Transactional
public RoomResponse createRoom(RoomRequest request) {
    // STEP 1: Get ownerId from JWT (enforced by SecurityContext)
    Long ownerId = securityContextUtil.getCurrentOwnerId();
    
    // STEP 2: CRITICAL - Validate property ownership BEFORE creating room
    // This prevents creating rooms under other owners' properties!
    Property property = propertyService.getPropertyEntity(request.getPropertyId(), ownerId);
    
    // STEP 3: Create room only after ownership validation
    Room room = roomMapper.toEntity(request);
    room.setProperty(property);
    
    return roomMapper.toResponse(roomRepository.save(room));
}
```

**Why This Works:**
1. User can't fake `ownerId` (from JWT, server-side)
2. `propertyService.getPropertyEntity()` throws exception if property doesn't belong to owner
3. Room creation only proceeds after validation

---

#### ✅ GET ALL ROOMS

```java
@Transactional(readOnly = true)
public List<RoomResponse> getAllRooms() {
    Long ownerId = securityContextUtil.getCurrentOwnerId();
    
    // Query automatically filters through property.owner.id
    return roomRepository.findByPropertyOwnerId(ownerId).stream()
            .map(roomMapper::toResponse)
            .collect(Collectors.toList());
}
```

**Returns:**
- All rooms from ALL properties owned by current user
- Automatically filtered by ownership chain

---

#### ✅ GET ROOMS BY PROPERTY

```java
@Transactional(readOnly = true)
public List<RoomResponse> getRoomsByProperty(Long propertyId) {
    Long ownerId = securityContextUtil.getCurrentOwnerId();
    
    // Validate property ownership first
    propertyService.getPropertyEntity(propertyId, ownerId);
    
    // Then get rooms for that property
    return roomRepository.findByPropertyIdAndPropertyOwnerId(propertyId, ownerId).stream()
            .map(roomMapper::toResponse)
            .collect(Collectors.toList());
}
```

**Security:**
- Can't access rooms of other owners' properties
- Property ownership validated before room query

---

#### ✅ UPDATE ROOM

```java
@Transactional
public RoomResponse updateRoom(Long roomId, RoomRequest request) {
    Long ownerId = securityContextUtil.getCurrentOwnerId();
    
    // Find room with ownership validation
    Room room = roomRepository.findByIdAndPropertyOwnerId(roomId, ownerId)
            .orElseThrow(() -> new RuntimeException("Room not found or access denied"));
    
    // If changing property, validate new property ownership
    if (!room.getProperty().getId().equals(request.getPropertyId())) {
        Property newProperty = propertyService.getPropertyEntity(request.getPropertyId(), ownerId);
        room.setProperty(newProperty);
    }
    
    roomMapper.updateEntity(room, request);
    return roomMapper.toResponse(roomRepository.save(room));
}
```

**Security:**
- Can only update owned rooms
- If moving room to different property, validates new property ownership

---

## 🎯 Controller Layer

### RoomController
**Location:** [src/main/java/com/rentapp/rentapp/controller/RoomController.java](src/main/java/com/rentapp/rentapp/controller/RoomController.java)

**Endpoints:**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/rooms` | ✅ JWT | Create room under property |
| GET | `/rooms` | ✅ JWT | Get all owner's rooms |
| GET | `/rooms/property/{propertyId}` | ✅ JWT | Get rooms by property |
| GET | `/rooms/{id}` | ✅ JWT | Get single room |
| PUT | `/rooms/{id}` | ✅ JWT | Update room |
| DELETE | `/rooms/{id}` | ✅ JWT | Delete room |

---

### API Examples

#### 1️⃣ Create Room

**Request:**
```bash
curl -X POST http://localhost:8080/rooms \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "roomNumber": "101",
    "capacity": 2,
    "occupiedCount": 0,
    "propertyId": 1
  }'
```

**Response (201 Created):**
```json
{
  "id": 1,
  "roomNumber": "101",
  "capacity": 2,
  "occupiedCount": 0,
  "propertyId": 1,
  "propertyName": "Sunset Apartments",
  "createdAt": "2026-04-19T10:30:00",
  "updatedAt": "2026-04-19T10:30:00"
}
```

**Security:**
- `propertyId: 1` validated to belong to current owner
- If property doesn't belong to owner → **500 error**

---

#### 2️⃣ Get All Rooms

**Request:**
```bash
curl -X GET http://localhost:8080/rooms \
  -H "Authorization: Bearer <jwt-token>"
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "roomNumber": "101",
    "capacity": 2,
    "occupiedCount": 1,
    "propertyId": 1,
    "propertyName": "Sunset Apartments",
    "createdAt": "2026-04-19T10:30:00",
    "updatedAt": "2026-04-19T11:00:00"
  },
  {
    "id": 2,
    "roomNumber": "102",
    "capacity": 3,
    "occupiedCount": 0,
    "propertyId": 1,
    "propertyName": "Sunset Apartments",
    "createdAt": "2026-04-19T10:35:00",
    "updatedAt": "2026-04-19T10:35:00"
  },
  {
    "id": 3,
    "roomNumber": "201",
    "capacity": 2,
    "occupiedCount": 2,
    "propertyId": 2,
    "propertyName": "Ocean View Villa",
    "createdAt": "2026-04-19T10:40:00",
    "updatedAt": "2026-04-19T10:40:00"
  }
]
```

**Security:**
- Only shows rooms from properties owned by current user
- Rooms from other owners never appear

---

#### 3️⃣ Get Rooms by Property

**Request:**
```bash
curl -X GET http://localhost:8080/rooms/property/1 \
  -H "Authorization: Bearer <jwt-token>"
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "roomNumber": "101",
    "capacity": 2,
    "occupiedCount": 1,
    "propertyId": 1,
    "propertyName": "Sunset Apartments",
    "createdAt": "2026-04-19T10:30:00",
    "updatedAt": "2026-04-19T11:00:00"
  },
  {
    "id": 2,
    "roomNumber": "102",
    "capacity": 3,
    "occupiedCount": 0,
    "propertyId": 1,
    "propertyName": "Sunset Apartments",
    "createdAt": "2026-04-19T10:35:00",
    "updatedAt": "2026-04-19T10:35:00"
  }
]
```

**Security:**
- First validates property ID 1 belongs to current owner
- If property doesn't belong to owner → **500 error**

---

#### 4️⃣ Update Room

**Request:**
```bash
curl -X PUT http://localhost:8080/rooms/1 \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "roomNumber": "101-A",
    "capacity": 3,
    "occupiedCount": 2,
    "propertyId": 1
  }'
```

**Response (200 OK):**
```json
{
  "id": 1,
  "roomNumber": "101-A",
  "capacity": 3,
  "occupiedCount": 2,
  "propertyId": 1,
  "propertyName": "Sunset Apartments",
  "createdAt": "2026-04-19T10:30:00",
  "updatedAt": "2026-04-19T12:15:00"
}
```

---

#### 5️⃣ Delete Room

**Request:**
```bash
curl -X DELETE http://localhost:8080/rooms/1 \
  -H "Authorization: Bearer <jwt-token>"
```

**Response (204 No Content):**
```
(empty response)
```

---

## 🔐 Security Validation

### ✅ What's Protected:

1. **Create Room:**
   - ✅ Can't create room under other owner's property
   - ✅ PropertyId validated before room creation
   - ✅ OwnerId from JWT (can't be faked)

2. **Read Rooms:**
   - ✅ Only returns rooms from owned properties
   - ✅ Filtered through property.owner.id relationship
   - ✅ Other owners' rooms invisible

3. **Update Room:**
   - ✅ Can only update owned rooms
   - ✅ Can't move room to other owner's property
   - ✅ Double validation on room ID and property ID

4. **Delete Room:**
   - ✅ Can only delete owned rooms
   - ✅ Ownership validated before deletion

---

## 🚨 Attack Scenarios (All Blocked)

### Scenario 1: Try to create room under other's property

**Attack:**
```json
POST /rooms
{
  "roomNumber": "999",
  "capacity": 10,
  "propertyId": 999  // Property owned by another user
}
```

**Result:**
```
❌ 500 Internal Server Error
"Property not found or access denied"
```

**Why Blocked:**
- `propertyService.getPropertyEntity(999, ownerId)` throws exception
- Room creation never proceeds

---

### Scenario 2: Try to access other owner's room

**Attack:**
```
GET /rooms/999  // Room ID from another owner
```

**Result:**
```
❌ 500 Internal Server Error
"Room not found or access denied"
```

**Why Blocked:**
- `findByIdAndPropertyOwnerId(999, ownerId)` returns empty
- Exception thrown

---

### Scenario 3: Try to update other owner's room

**Attack:**
```json
PUT /rooms/999
{
  "roomNumber": "Hacked",
  "capacity": 1,
  "propertyId": 1
}
```

**Result:**
```
❌ 500 Internal Server Error
"Room not found or access denied"
```

**Why Blocked:**
- Room 999 doesn't belong to current owner
- Update never proceeds

---

## 📊 Database Schema

### Table: rooms

```sql
CREATE TABLE rooms (
    id BIGSERIAL PRIMARY KEY,
    room_number VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL,
    occupied_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    property_id BIGINT NOT NULL,
    FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- Index for performance
CREATE INDEX idx_rooms_property ON rooms(property_id);
```

---

## 🧪 Testing

### Test Script
**Location:** [test-room.sh](test-room.sh)

**Run:**
```bash
./test-room.sh
```

**Tests Performed:**
1. ✅ Login and JWT token retrieval
2. ✅ Create room under owned property
3. ✅ Get all rooms (owner-filtered)
4. ✅ Get room by ID (ownership validated)
5. ✅ Get rooms by property (ownership validated)
6. ✅ Update room (ownership validated)
7. ✅ Security test (access denied for other's room)
8. ✅ Delete room (ownership validated)

---

## ✅ Security Checklist

Before considering Room module complete, verify:

- [x] No `findAll()` without owner filtering
- [x] All repository methods filter by `property.owner.id`
- [x] Service always extracts `ownerId` from JWT
- [x] Property ownership validated before room creation
- [x] Never trust `propertyId` from request without validation
- [x] Controller uses DTOs (never exposes entities)
- [x] Update validates both room and property ownership
- [x] Delete validates ownership before deletion
- [x] Exception thrown for unauthorized access
- [x] `@Transactional` boundaries set correctly

---

## 🎯 Next Steps

After Room module completion:

**Next:** 👉 **Tenant Module**

Data Flow:
```
Owner → Property → Room → Tenant
```

Complexity increases:
- Tenant links to both Property AND Room
- Payment tracking
- Status management (ACTIVE, INACTIVE)
- Rent amount tracking

---

## 📝 Summary

### What We Built:

1. **Room Entity** - with timestamps, capacity, occupiedCount
2. **RoomRepository** - owner-scoped queries through property
3. **RoomRequest/Response DTOs** - validated input/output
4. **RoomMapper** - entity ↔ DTO conversion
5. **RoomService** - strict ownership validation
6. **RoomController** - secure REST endpoints
7. **Test Script** - comprehensive security testing

### Security Guarantees:

✅ **No data leakage** - Users see only their rooms
✅ **No unauthorized creation** - Can't create rooms under other's properties
✅ **No unauthorized access** - Can't read/update/delete other's rooms
✅ **Owner-scoped filtering** - All queries filter through property.owner.id
✅ **JWT enforcement** - OwnerId extracted server-side from token

---

## 🚀 Room Module Status: ✅ COMPLETE

**Build:** ✅ SUCCESS  
**Security:** ✅ Multi-tenant safe  
**Testing:** ✅ Script ready  
**Documentation:** ✅ Complete  

**Ready for:** 👉 **Tenant Module**
