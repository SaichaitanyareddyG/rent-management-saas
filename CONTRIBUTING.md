# Contributing to Rent Management SaaS

Thank you for your interest in contributing to this project! 🎉

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone git@github.com:YOUR_USERNAME/rent-management-saas.git
   cd rent-management-saas
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🛠️ Development Setup

### Prerequisites
- Java 17 or 21
- Node.js 20+
- PostgreSQL 14+
- Maven 3.9+

### Backend Setup
```bash
cd backend
# Configure database in src/main/resources/application.properties
./mvnw spring-boot:run
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📝 Code Guidelines

### Backend (Java/Spring Boot)
- Follow standard Java naming conventions
- Use Lombok annotations to reduce boilerplate
- Add JavaDoc comments for public methods
- Keep controllers thin, logic in services
- Write unit tests for services
- Use owner-scoped queries for multi-tenant isolation

### Frontend (React/TypeScript)
- Use TypeScript strict mode
- Follow React functional component patterns
- Use RTK Query for API calls
- Material-UI components for consistency
- Responsive design (mobile-first)
- Handle loading and error states

## 🧪 Testing

### Backend
cd backend
```bash
./mvnw test
```

### Frontend
```bash
cd frontend
npm test
```

## 📦 Commit Guidelines

Use conventional commit messages:
- `feat: Add tenant phone-based authentication`
- `fix: Resolve payment duplicate check issue`
- `docs: Update API endpoint documentation`
- `refactor: Simplify payment service logic`
- `test: Add unit tests for tenant service`

## 🔄 Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass**
4. **Update README.md** if adding features
5. **Create pull request** with clear description
6. **Link related issues** if applicable

## 🐛 Reporting Bugs

Create an issue with:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, Java/Node version)

## 💡 Suggesting Features

Create an issue with:
- Clear feature description
- Use case / problem it solves
- Proposed implementation (optional)
- Mockups if applicable

## ❓ Questions?

Feel free to:
- Open an issue for discussion
- Reach out to maintainers

## 📜 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

---

**Thank you for contributing!** 🙏
