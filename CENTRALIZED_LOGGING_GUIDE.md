# 📊 Centralized Logging System - Complete Guide

## ✅ System Overview

A comprehensive logging and audit system that tracks:
- **Who** - Which user made the request (email, ownerId)
- **What** - What action was performed
- **When** - Timestamp of the action
- **Where** - IP address, endpoint, HTTP method
- **How** - Request parameters, response status, execution time
- **Result** - Success or error with details

---

## 🏗️ Architecture Components

### 1. **UserContextFilter** ✅
**Location:** `src/main/java/com/rentapp/rentapp/config/UserContextFilter.java`

**Purpose:** Extracts user information from JWT and adds to MDC (Mapped Diagnostic Context)

**What it captures:**
- User email from JWT
- Owner ID from JWT
- Request ID (unique UUID)
- Client IP address
- User Agent

**MDC Keys:**
```java
MDC.put("userId", email);           // User's email
MDC.put("ownerId", ownerId);        // Owner ID
MDC.put("requestId", uuid);         // Unique request ID
MDC.put("clientIp", ipAddress);     // Client IP
MDC.put("userAgent", userAgent);    // Browser/client info
```

---

### 2. **LoggingAspect** ✅
**Location:** `src/main/java/com/rentapp/rentapp/aspect/LoggingAspect.java`

**Purpose:** Logs all API requests using AOP (Aspect-Oriented Programming)

**What it logs:**
- **Before Request:** Method, URI, User, Parameters
- **Around Request:** Execution time, Success/Failure
- **After Success:** Response data
- **After Exception:** Error details with stack trace

**Example Log Output:**
```
2026-04-19 10:30:45.123 INFO [http-nio-8080-exec-1] [ReqId:abc-123] [User:john@example.com] [OwnerId:1] LoggingAspect - === REQUEST START === Method: POST | URI: /properties | User: john@example.com | OwnerId: 1 | Class: PropertyController | Method: createProperty
2026-04-19 10:30:45.234 DEBUG [http-nio-8080-exec-1] [ReqId:abc-123] [User:john@example.com] [OwnerId:1] LoggingAspect - Request Param [0]: {"name":"Sunset Apartments","location":"Mumbai","upiId":"owner@upi"}
2026-04-19 10:30:45.456 INFO [http-nio-8080-exec-1] [ReqId:abc-123] [User:john@example.com] [OwnerId:1] LoggingAspect - === REQUEST SUCCESS === RequestId: abc-123 | Execution Time: 333ms
```

---

### 3. **AuditAspect** ✅
**Location:** `src/main/java/com/rentapp/rentapp/aspect/AuditAspect.java`

**Purpose:** Saves detailed audit logs to database for compliance and analysis

**What it saves:**
- Request ID
- User email and owner ID
- Action performed
- HTTP method and endpoint
- Request parameters (masked sensitive data)
- IP address and User Agent
- Response status code
- Execution time
- Error message (if any)
- Timestamp

**Features:**
- Asynchronous saving (doesn't slow down requests)
- Masks passwords and tokens
- Limits request data size to 2000 characters
- Saves logs even on errors

---

### 4. **AuditLog Entity** ✅
**Location:** `src/main/java/com/rentapp/rentapp/entity/AuditLog.java`

**Database Table:** `audit_logs`

**Schema:**
```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    request_id VARCHAR(255) NOT NULL,
    owner_id BIGINT,
    user_email VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    request_data VARCHAR(2000),
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    response_status INTEGER,
    execution_time_ms BIGINT,
    error_message VARCHAR(1000),
    timestamp TIMESTAMP NOT NULL
);

CREATE INDEX idx_audit_owner ON audit_logs(owner_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
```

---

### 5. **AuditLogService** ✅
**Location:** `src/main/java/com/rentapp/rentapp/service/AuditLogService.java`

**Methods:**
- `saveAuditLog(auditLog)` - Async save to database
- `getOwnerAuditLogs(ownerId)` - Get all logs for an owner
- `getAuditLogsByDateRange(ownerId, start, end)` - Filter by date
- `getRecentLogs()` - Get last 100 logs
- `getFailedRequests()` - Get all failed requests

---

### 6. **Logback Configuration** ✅
**Location:** `src/main/resources/logback-spring.xml`

**Log Files Created:**

| File | Purpose | Retention | Max Size |
|------|---------|-----------|----------|
| `logs/rentapp.log` | All logs | 30 days | 10MB per file |
| `logs/audit.log` | Audit trail only | 90 days | N/A |
| `logs/error.log` | Errors only | 60 days | N/A |

**Log Format:**
```
2026-04-19 10:30:45.123 INFO [thread-name] [ReqId:uuid] [User:email] [OwnerId:id] [IP:address] ClassName - Message
```

---

## 🔍 What Gets Logged

### Every Request Logs:

1. **Request Information:**
   - HTTP Method (GET, POST, PUT, DELETE)
   - Endpoint URL
   - Request ID (unique)
   - Timestamp

2. **User Information:**
   - User email (from JWT)
   - Owner ID (from JWT)
   - IP address
   - User Agent (browser/app)

3. **Action Details:**
   - Controller method name
   - Request parameters (masked sensitive data)
   - Execution time (milliseconds)

4. **Response:**
   - HTTP status code (200, 201, 400, 500, etc.)
   - Response data (truncated if large)
   - Error message (if failed)

---

## 📝 Example Logs

### Successful Property Creation:

**Console Log:**
```
2026-04-19 10:30:45.123 INFO [http-nio-8080-exec-1] [ReqId:abc-123-def] [User:john@example.com] [OwnerId:1] LoggingAspect - === REQUEST START === Method: POST | URI: /properties | User: john@example.com | OwnerId: 1 | Class: PropertyController | Method: createProperty

2026-04-19 10:30:45.234 DEBUG [http-nio-8080-exec-1] [ReqId:abc-123-def] [User:john@example.com] [OwnerId:1] LoggingAspect - Request Param [0]: {"name":"Sunset Apartments","location":"Mumbai","upiId":"owner@upi"}

2026-04-19 10:30:45.456 INFO [http-nio-8080-exec-1] [ReqId:abc-123-def] [User:john@example.com] [OwnerId:1] LoggingAspect - === REQUEST SUCCESS === RequestId: abc-123-def | Execution Time: 333ms
```

**Database Record:**
```json
{
  "id": 1,
  "requestId": "abc-123-def",
  "ownerId": 1,
  "userEmail": "john@example.com",
  "action": "createProperty",
  "httpMethod": "POST",
  "endpoint": "/properties",
  "requestData": "{\"name\":\"Sunset Apartments\",\"location\":\"Mumbai\",\"upiId\":\"owner@upi\"}",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "responseStatus": 201,
  "executionTimeMs": 333,
  "errorMessage": null,
  "timestamp": "2026-04-19T10:30:45.123"
}
```

---

### Failed Request (Unauthorized):

**Console Log:**
```
2026-04-19 10:35:00.123 ERROR [http-nio-8080-exec-2] [ReqId:xyz-456-abc] [User:null] [OwnerId:null] LoggingAspect - === EXCEPTION === RequestId: xyz-456-abc | User: null | Method: getPropertyById | Exception: RuntimeException | Message: Property not found or access denied
```

**Database Record:**
```json
{
  "id": 2,
  "requestId": "xyz-456-abc",
  "ownerId": null,
  "userEmail": null,
  "action": "getPropertyById",
  "httpMethod": "GET",
  "endpoint": "/properties/999",
  "requestData": null,
  "ipAddress": "192.168.1.100",
  "userAgent": "curl/7.64.1",
  "responseStatus": 500,
  "executionTimeMs": 45,
  "errorMessage": "Property not found or access denied",
  "timestamp": "2026-04-19T10:35:00.123"
}
```

---

## 🔐 Security Features

### 1. **Sensitive Data Masking**

Passwords and tokens are automatically masked in logs:

**Before:**
```json
{"email":"user@example.com","password":"secret123","token":"jwt-token-here"}
```

**After:**
```json
{"email":"user@example.com","password":"***MASKED***","token":"***MASKED***"}
```

### 2. **Data Size Limits**

- Request data limited to 2000 characters
- Response data truncated after 1000 characters in debug logs
- Prevents log file explosion

### 3. **Thread-Safe Logging**

- Uses MDC (Mapped Diagnostic Context) for thread safety
- Each request has isolated logging context
- Automatic cleanup after request completion

---

## 📊 Query Audit Logs

### Get All Logs for an Owner:

```java
List<AuditLog> logs = auditLogService.getOwnerAuditLogs(ownerId);
```

### Get Logs by Date Range:

```java
LocalDateTime start = LocalDateTime.now().minusDays(7);
LocalDateTime end = LocalDateTime.now();
List<AuditLog> logs = auditLogService.getAuditLogsByDateRange(ownerId, start, end);
```

### Get Recent Logs:

```java
List<AuditLog> recentLogs = auditLogService.getRecentLogs();
```

### Get Failed Requests:

```java
List<AuditLog> failures = auditLogService.getFailedRequests();
```

---

## 📈 Use Cases

### 1. **Security Audit**
Track all user actions for security compliance:
- Who accessed what data?
- When did they access it?
- From which IP address?

### 2. **Debugging**
Trace request flow for troubleshooting:
- Request ID links all logs for a single request
- See exact parameters sent
- Check execution time

### 3. **Performance Monitoring**
Identify slow endpoints:
```sql
SELECT endpoint, AVG(execution_time_ms) as avg_time
FROM audit_logs
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY endpoint
ORDER BY avg_time DESC;
```

### 4. **User Activity Tracking**
See what users are doing:
```sql
SELECT user_email, action, COUNT(*) as count
FROM audit_logs
WHERE owner_id = 1
GROUP BY user_email, action
ORDER BY count DESC;
```

### 5. **Error Analysis**
Find problematic requests:
```sql
SELECT endpoint, error_message, COUNT(*) as error_count
FROM audit_logs
WHERE error_message IS NOT NULL
GROUP BY endpoint, error_message
ORDER BY error_count DESC;
```

---

## 🎯 Log Levels

| Level | Purpose | Example |
|-------|---------|---------|
| **ERROR** | Errors and exceptions | Failed requests, database errors |
| **WARN** | Warnings | Deprecated methods, performance issues |
| **INFO** | Important events | Request start/end, user actions |
| **DEBUG** | Detailed information | Request/response data |
| **TRACE** | Very detailed | SQL queries, parameter values |

---

## 📂 Log File Locations

```
rentapp/
├── logs/
│   ├── rentapp.log          # All application logs
│   ├── rentapp.2026-04-19.1.log  # Rolled over logs
│   ├── audit.log            # Audit trail only
│   ├── audit.2026-04-19.log # Audit history
│   ├── error.log            # Errors only
│   └── error.2026-04-19.log # Error history
```

---

## 🔧 Configuration

### Enable/Disable SQL Logging:

Edit `logback-spring.xml`:
```xml
<!-- Show SQL queries -->
<logger name="org.hibernate.SQL" level="DEBUG"/>

<!-- Show SQL parameters -->
<logger name="org.hibernate.type.descriptor.sql.BasicBinder" level="TRACE"/>
```

### Change Log Level for Specific Package:

```xml
<logger name="com.rentapp.rentapp.service" level="DEBUG"/>
```

### Increase Log Retention:

```xml
<maxHistory>90</maxHistory> <!-- Keep logs for 90 days -->
```

---

## ✅ Benefits

1. **Full Audit Trail** - Know who did what and when
2. **Security Compliance** - Meet regulatory requirements
3. **Easy Debugging** - Trace issues with request ID
4. **Performance Monitoring** - Identify bottlenecks
5. **User Activity Tracking** - Understand user behavior
6. **Error Analysis** - Find and fix problems quickly
7. **Multi-Tenant Safe** - Logs include owner ID for isolation

---

## 🚀 Example Scenarios

### Scenario 1: User Creates Property

**Request:**
```bash
curl -X POST http://localhost:8080/properties \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Property","location":"Mumbai","upiId":"owner@upi"}'
```

**Logs Generated:**
1. Console shows: Request start, parameters, execution time
2. `rentapp.log` stores: Full request details
3. `audit.log` stores: User action summary
4. Database stores: Complete audit record

---

### Scenario 2: Unauthorized Access Attempt

**Request:**
```bash
curl -X GET http://localhost:8080/properties/999 \
  -H "Authorization: Bearer <invalid-token>"
```

**Logs Generated:**
1. Console shows: Exception with "access denied"
2. `error.log` stores: Full error with stack trace
3. Database stores: Failed attempt with null user

---

## 📊 Monitoring Dashboard Ideas

Using audit logs, you can build dashboards showing:

1. **Real-time Activity Feed**
   - Latest user actions
   - Active users
   - Current operations

2. **Performance Metrics**
   - Average response time per endpoint
   - Slowest operations
   - Request volume over time

3. **Error Dashboard**
   - Error rate by endpoint
   - Most common errors
   - Users experiencing issues

4. **Security Dashboard**
   - Failed login attempts
   - Unauthorized access attempts
   - Suspicious activity patterns

---

## ✅ Summary

**Implemented:**
- ✅ User context tracking (email, ownerId from JWT)
- ✅ Request/response logging
- ✅ Execution time tracking
- ✅ IP address and User Agent capture
- ✅ Database audit trail
- ✅ Sensitive data masking
- ✅ Multiple log files (app, audit, error)
- ✅ Log rotation and retention
- ✅ Thread-safe logging with MDC
- ✅ Async audit saving
- ✅ Query methods for analysis

**Every request now logs:**
1. Who made the request (user email, owner ID)
2. What they did (action, endpoint)
3. When they did it (timestamp)
4. From where (IP address, user agent)
5. What data was sent (request parameters)
6. How long it took (execution time)
7. What happened (success/error)

**Your application is now production-ready with enterprise-grade logging! 🎉**
