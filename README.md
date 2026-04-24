# 🏠 Rent Management SaaS

A full-stack, multi-tenant rental property management system with **phone-based tenant authentication** and **UPI payment tracking**. Built for property owners to efficiently manage properties, rooms, tenants, and rent payments.

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.13-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2.4-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14.18-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 Key Features

### 🔐 **Authentication & Security**
- ✅ **JWT-based authentication** with BCrypt password hashing
- ✅ **Stateless sessions** (24-hour token expiry)
- ✅ **Password reset** via email verification
- ✅ **Multi-tenant data isolation** (owner-scoped queries)
- ✅ **CORS-enabled** REST API

### 🏢 **Property Management**
- ✅ **CRUD operations** for properties and rooms
- ✅ **Room capacity tracking** with overbooking prevention
- ✅ **CSV export** for properties, rooms, tenants, and payments
- ✅ **Search & filters** (by name, phone, status)

### 👥 **Tenant Management**
- ✅ **Phone-based authentication** for payment portal (no login required)
- ✅ **Tenant status tracking** (Active, Inactive, Vacated)
- ✅ **Unique constraint validation** (Aadhaar, phone, email)
- ✅ **Room occupancy management**

### 💳 **Payment Tracking**
- ✅ **UPI payment links** with deep links for mobile apps (Google Pay, PhonePe, Paytm)
- ✅ **UTR-based verification** (10-20 alphanumeric validation)
- ✅ **Duplicate payment prevention**
- ✅ **Payment status workflow** (Pending → Verify → Paid/Overdue)
- ✅ **Bulk payment generation** (for all tenants)
- ✅ **Month-wise tracking** (format: YYYY-MM)

### 📊 **Dashboard & Analytics**
- ✅ **Revenue charts** (bar chart for trends, pie chart for distribution)
- ✅ **Real-time metrics** (total properties, active tenants, monthly revenue)
- ✅ **Payment distribution** by status
- ✅ **Mobile-responsive** design with Material-UI

### 🌐 **Public Payment Portal** (Unique USP)
- ✅ **No login required** - tenants pay via phone number lookup
- ✅ **UPI deep links** automatically open UPI apps on mobile
- ✅ **Manual UPI entry** option with visible UPI ID
- ✅ **Verification step** before payment (confirm tenant details)

---

## 🛠️ Tech Stack

### **Backend**
| Technology | Version | Purpose |
|------------|---------|---------|
| Spring Boot | 3.5.13 | REST API framework |
| Java | 17/21 | Programming language |
| PostgreSQL | 14.18 | Relational database |
| Spring Data JPA | 6.6.45 | ORM & repository layer |
| Spring Security | 6.5.11 | JWT authentication |
| Lombok | 1.18.38 | Boilerplate reduction |
| Maven | 3.9.9 | Build automation |

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.4 | UI library |
| TypeScript | 6.0.2 | Type safety |
| Vite | 8.0.4 | Build tool |
| Redux Toolkit | 2.11.2 | State management |
| RTK Query | - | API caching & data fetching |
| Material-UI | 9.0.0 | Component library |
| Recharts | 3.8.1 | Data visualization |
| Tailwind CSS | 4.2.2 | Utility-first styling |
| React Router | 7.7.1 | Client-side routing |

---

## 🏗️ Architecture

### **Backend Architecture**
```
backend/src/main/java/com/rentapp/
├── config/          # SecurityConfig, CORS, JWT Filter
├── controller/      # REST endpoints (Owner, Property, Room, Tenant, Payment, Public)
├── service/         # Business logic layer
├── repository/      # JPA repositories (owner-scoped queries)
├── entity/          # JPA entities (Owner, Property, Room, Tenant, Payment)
├── dto/             # Data Transfer Objects
├── exception/       # Custom exceptions & GlobalExceptionHandler
├── security/        # JWT utilities & UserDetails implementation
└── enums/           # TenantStatus, PaymentStatus
```

### **Frontend Architecture**
```
frontend/src/
├── app/             # Redux store configuration
├── features/        # Feature-based slices (auth, property, room, tenant, payment, dashboard)
│   └── */
│       ├── *Slice.ts       # Redux state slice
│       └── *Api.ts         # RTK Query endpoints
├── pages/           # Page components
│   ├── admin/       # Protected routes (dashboard, properties, rooms, tenants, payments)
│   └── public/      # Public routes (home, payment portal)
├── components/      # Reusable components
├── layouts/         # Layout wrappers (AdminLayout, PublicLayout)
├── services/        # API configuration
├── types/           # TypeScript interfaces
└── utils/           # Helper functions (logger)
```

### **Database Schema**
```sql
Owner (1) ──┬──< Property (N)
             │      │
             │      ├──< Room (N)
             │      │
             │      └──< Tenant (N)
             │              │
             └──────────────┴──< Payment (N)
```

**Key Relationships:**
- **Owner → Property** (1:N) - Owner can have multiple properties
- **Property → Room** (1:N) - Property can have multiple rooms
- **Property → Tenant** (1:N) - Property can have multiple tenants
- **Room → Tenant** (1:N) - Room can have multiple tenants (configurable capacity)
- **Tenant → Payment** (1:N) - Tenant can have multiple monthly payments

---

## 🚀 Getting Started

### **Prerequisites**
- Java 17 or 21
- Node.js 20+ & npm
- PostgreSQL 14+
- Maven 3.9+

### **1. Clone Repository**
```bash
git clone git@github.com:SaichaitanyareddyG/rent-management-saas.git
cd rent-management-saas
```

### **2. Database Setup**
```sql
CREATE DATABASE rent_app;
CREATE USER postgres WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE rent_app TO postgres;
```

### **3. Backend Setup**
```bash
cd backend

# Update database credentials in src/main/resources/application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/rent_app
spring.datasource.username=postgres
spring.datasource.password=your_password

# JWT Secret (generate a secure 256-bit key)
jwt.secret=your-256-bit-secret-key-here

# Run backend
./mvnw spring-boot:run
```

Backend will start on: `http://localhost:8080`

### **4. Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

Frontend will start on: `http://localhost:5173` (or next available port)

### **5. Test Endpoints**

**Authentication:**
```bash
# Register owner
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","phone":"9876543210"}'

# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Public Payment (No Auth):**
```bash
# Lookup tenant by phone
curl http://localhost:8080/public/tenant/phone/9876543210
```

---

## 📸 Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)
*Real-time metrics, revenue charts, and payment distribution*

### Properties Management
![Properties](./screenshots/properties.png)
*Property CRUD with search and CSV export*

### Tenant Payment Portal (Public)
![Payment Portal](./screenshots/payment-portal.png)
*Phone-based lookup → Verify details → Pay via UPI*

### Payment Tracking
![Payments](./screenshots/payments.png)
*UTR-based verification with status workflow*

---

## 🔧 Configuration

### **Environment Variables**

**Backend** (`application.properties`):
```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/rent_app
spring.datasource.username=postgres
spring.datasource.password=your_password

# JWT
jwt.secret=your-256-bit-secret-key
jwt.expiration=86400000  # 24 hours

# Email (for password reset)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

**Frontend** (`.env`):
```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## 🎯 API Endpoints

### **Authentication** (`/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new owner |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |

### **Owner** (`/owners`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/owners/profile` | Get owner profile | ✅ |
| PUT | `/owners/profile` | Update owner profile | ✅ |

### **Properties** (`/properties`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/properties` | List all properties | ✅ |
| POST | `/properties` | Create property | ✅ |
| PUT | `/properties/{id}` | Update property | ✅ |
| DELETE | `/properties/{id}` | Delete property | ✅ |
| GET | `/properties/export/csv` | Export to CSV | ✅ |

### **Rooms** (`/rooms`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/rooms` | List all rooms | ✅ |
| POST | `/rooms` | Create room | ✅ |
| PUT | `/rooms/{id}` | Update room | ✅ |
| DELETE | `/rooms/{id}` | Delete room | ✅ |
| GET | `/rooms/export/csv` | Export to CSV | ✅ |

### **Tenants** (`/tenants`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/tenants` | List all tenants (paginated) | ✅ |
| POST | `/tenants` | Create tenant | ✅ |
| PUT | `/tenants/{id}` | Update tenant | ✅ |
| DELETE | `/tenants/{id}` | Delete tenant | ✅ |
| GET | `/tenants/export/csv` | Export to CSV | ✅ |

### **Payments** (`/payments`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/payments` | List all payments (paginated) | ✅ |
| POST | `/payments` | Create payment | ✅ |
| POST | `/payments/bulk` | Generate bulk payments | ✅ |
| PUT | `/payments/{id}` | Update payment | ✅ |
| DELETE | `/payments/{id}` | Delete payment | ✅ |
| GET | `/payments/export/csv` | Export to CSV | ✅ |

### **Dashboard** (`/dashboard`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/dashboard/stats` | Get dashboard metrics | ✅ |

### **Public** (`/public`) - No Auth Required
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/public/tenant/{id}` | Get tenant by ID | ❌ |
| GET | `/public/tenant/phone/{phone}` | Get tenant by phone | ❌ |
| POST | `/public/payments/confirm` | Confirm payment with UTR | ❌ |

---

## 🧪 Testing

### **Backend Tests**
```bash
./mvnw test
```

### **Frontend Tests**
```bash
cd frontend
npm test
```

---

## 🔒 Security Features

1. **JWT Authentication**: Stateless authentication with 24-hour token expiry
2. **BCrypt Password Hashing**: Industry-standard password encryption
3. **Multi-tenant Isolation**: All queries filtered by owner ID
4. **CORS Configuration**: Restricted origins for API access
5. **Input Validation**: Bean validation on all DTOs
6. **Exception Handling**: Global exception handler with custom error responses
7. **Public Endpoint Security**: Rate limiting (recommended for production)

---

## 🚀 Deployment

### **Backend Deployment** (Heroku/AWS/Railway)
```bash
cd backend

# Build JAR
./mvnw clean package

# Run JAR
java -jar target/rentapp-0.0.1-SNAPSHOT.jar
```

### **Frontend Deployment** (Vercel/Netlify)
```bash
cd frontend
npm run build
# Upload 'dist' folder to hosting platform
```

### **Environment Setup**
- Set `spring.profiles.active=prod` for production
- Use environment-specific `application-prod.properties`
- Configure PostgreSQL connection pooling
- Enable HTTPS for production APIs

---

## 🎨 Design Decisions

### **Why Phone-Based Authentication?**
- Tenants don't remember tenant IDs
- Phone numbers are unique and memorable
- Verification step prevents unauthorized payments
- UX: Enter phone → Verify details → Pay

### **Why RTK Query?**
- Built-in caching reduces API calls
- Automatic loading/error states
- Optimistic updates for better UX
- Type-safe with TypeScript

### **Why Multi-Tenant Architecture?**
- Data isolation at database level
- Each owner sees only their data
- Scalable for SaaS model
- Owner-scoped queries prevent data leakage

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Chaitanya Reddy**  
- GitHub: [@SaichaitanyareddyG](https://github.com/SaichaitanyareddyG)
- Email: chaitanya.reddy@healthyr.com

---

## 🙏 Acknowledgments

- Spring Boot documentation
- React documentation
- Material-UI design system
- RTK Query for efficient data fetching
- UPI deep linking for seamless payments

---

## 🚧 Roadmap

- [ ] Email notifications for payment confirmation
- [ ] SMS notifications via Twilio
- [ ] WhatsApp payment reminders
- [ ] PDF invoice generation
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Mobile app (React Native)
- [ ] Recurring payment reminders
- [ ] Analytics dashboard with more metrics
- [ ] Rent escalation tracking

---

**⭐ If you find this project useful, please consider giving it a star!**
