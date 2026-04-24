# Neon Database (Forever Free) - Ready for Migration

## 🗄️ Connection Details

**Database**: Neon PostgreSQL  
**Region**: AWS Asia Pacific (Singapore)  
**Status**: Active, Forever Free ✅  
**Created**: April 24, 2026

---

## 🔑 Credentials

```
Username: neondb_owner
Password: npg_m36lRZCxHhGT
Host: ep-rapid-cell-ao939rb1-pooler.c-2.ap-southeast-1.aws.neon.tech
Database: neondb
Port: 5432
SSL: required
```

---

## 🔗 Connection Strings

### For psql:
```bash
psql 'postgresql://neondb_owner:npg_m36lRZCxHhGT@ep-rapid-cell-ao939rb1-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
```

### For Spring Boot (JDBC):
```
jdbc:postgresql://ep-rapid-cell-ao939rb1-pooler.c-2.ap-southeast-1.aws.neon.tech:5432/neondb?sslmode=require
```

### Environment Variables (for deployment):
```bash
DB_URL=jdbc:postgresql://ep-rapid-cell-ao939rb1-pooler.c-2.ap-southeast-1.aws.neon.tech:5432/neondb?sslmode=require
DB_USERNAME=neondb_owner
DB_PASSWORD=npg_m36lRZCxHhGT
```

---

## ⏰ When to Migrate

**Current Setup**: Render PostgreSQL (expires May 24, 2026)  
**Migrate Before**: May 20, 2026 (a few days buffer)

---

## 🚀 Migration Steps (When Ready)

1. **Export Render Data**:
   ```bash
   pg_dump $RENDER_DB_URL > backup.sql
   ```

2. **Import to Neon**:
   ```bash
   psql 'postgresql://neondb_owner:npg...' < backup.sql
   ```

3. **Update Render Environment Variables**:
   - Go to Render Dashboard → Backend Service → Environment
   - Update `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` with Neon values above
   - Redeploy

4. **Done!** App now uses Neon (forever free)

---

## 📊 Free Tier Limits

- **Storage**: 0.5 GB (more than enough)
- **Compute Hours**: 100 hours/month (~3.3 hours/day)
- **Branches**: 10 (for dev/test)
- **Projects**: 1
- **Expiry**: ✅ **NEVER!**

---

## 🔗 Neon Dashboard

https://console.neon.tech

Login with your GitHub account (sai29chaitu@gmail.com)
