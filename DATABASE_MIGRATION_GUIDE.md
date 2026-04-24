# Database Migration Guide: Render → Neon

## 📋 Overview

This guide explains how to migrate all your data from Render PostgreSQL to Neon PostgreSQL.

**Time Required**: ~10-15 minutes  
**Downtime**: ~5 minutes (optional - can be done with no downtime)  
**Difficulty**: Easy 🟢

---

## 🗄️ Current Database Details

### **Render PostgreSQL** (Source)
```
Host: dpg-d7lpgd9o3t8c73ep4e7g-a.ohio-postgres.render.com
Port: 5432
Database: rent_app_ksez
Username: rent_app_ksez_user
Password: rDgBSV9HXRpbl6f8QD9DWQcnGX0TJChj
```

### **Neon PostgreSQL** (Destination)
```
Host: ep-rapid-cell-ao939rb1-pooler.c-2.ap-southeast-1.aws.neon.tech
Port: 5432
Database: neondb
Username: neondb_owner
Password: npg_m36lRZCxHhGT
```

---

## 🚀 Migration Methods

### **Method 1: pg_dump (Recommended)** ⭐

This is the standard PostgreSQL backup/restore method.

#### **Step 1: Export from Render**
```bash
# Set source database URL
export SOURCE_DB="postgresql://rent_app_ksez_user:rDgBSV9HXRpbl6f8QD9DWQcnGX0TJChj@dpg-d7lpgd9o3t8c73ep4e7g-a.ohio-postgres.render.com:5432/rent_app_ksez"

# Export all data
pg_dump "$SOURCE_DB" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  > render_backup.sql

# Backup created! Check size
ls -lh render_backup.sql
```

#### **Step 2: Import to Neon**
```bash
# Set destination database URL
export NEON_DB="postgresql://neondb_owner:npg_m36lRZCxHhGT@ep-rapid-cell-ao939rb1-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Import data to Neon
psql "$NEON_DB" < render_backup.sql

# Done! Data migrated ✅
```

#### **Step 3: Verify Data**
```bash
# Check if tables exist
psql "$NEON_DB" -c "\dt"

# Check owner count
psql "$NEON_DB" -c "SELECT COUNT(*) FROM owners;"

# Check tenants count
psql "$NEON_DB" -c "SELECT COUNT(*) FROM tenants;"
```

---

### **Method 2: Direct Migration (Faster)**

Use `pg_dump` with pipe (no intermediate file):

```bash
pg_dump "$SOURCE_DB" --no-owner --no-acl --clean --if-exists | psql "$NEON_DB"
```

---

## 🔄 Update Application to Use Neon

### **Option A: Update Render Environment Variables**

1. Go to Render Dashboard → Your Backend Service
2. Click **Environment** tab
3. Update these variables:

```
DB_URL=jdbc:postgresql://ep-rapid-cell-ao939rb1-pooler.c-2.ap-southeast-1.aws.neon.tech:5432/neondb?sslmode=require
DB_USERNAME=neondb_owner
DB_PASSWORD=npg_m36lRZCxHhGT
```

4. Click **Save Changes**
5. Render will auto-redeploy (~5 minutes)
6. ✅ **Done! Now using Neon!**

### **Option B: Test Locally First**

```bash
# Update your local backend/src/main/resources/application.properties
cd /Users/sai/Downloads/rentapp/backend

# Or set environment variables
export DB_URL="jdbc:postgresql://ep-rapid-cell-ao939rb1-pooler.c-2.ap-southeast-1.aws.neon.tech:5432/neondb?sslmode=require"
export DB_USERNAME="neondb_owner"
export DB_PASSWORD="npg_m36lRZCxHhGT"

# Test locally
./mvnw spring-boot:run

# If works, deploy to Render!
```

---

## 🧪 Pre-Migration Checklist

Before migrating, verify:

- [ ] **PostgreSQL client installed** (`brew install postgresql`)
- [ ] **Render database is accessible** (test with `psql`)
- [ ] **Neon database is accessible** (test with `psql`)
- [ ] **Recent data exists** (login to app, check data)
- [ ] **Backup downloaded** (keep `render_backup.sql` safe!)

Test connectivity:
```bash
# Test Render connection
psql "postgresql://rent_app_ksez_user:rDgBSV9HXRpbl6f8QD9DWQcnGX0TJChj@dpg-d7lpgd9o3t8c73ep4e7g-a.ohio-postgres.render.com:5432/rent_app_ksez" -c "SELECT version();"

# Test Neon connection
psql "postgresql://neondb_owner:npg_m36lRZCxHhGT@ep-rapid-cell-ao939rb1-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" -c "SELECT version();"
```

---

## ⚠️ Important Notes

### **Schema Compatibility**
Both databases are PostgreSQL 17+ with the same schema (created by Hibernate), so migration is seamless.

### **Downtime Strategy**

**Zero-downtime migration** (advanced):
1. Set up database replication (Render → Neon)
2. Switch app to read from Neon
3. Cut over writes to Neon

**Simple migration** (5 min downtime):
1. Export from Render
2. Import to Neon
3. Update Render env vars
4. Redeploy

**Recommended**: Simple migration (it's a portfolio app, 5 min downtime is fine!)

---

## 📊 What Gets Migrated

All tables and data:
- ✅ `owners` (your admin accounts)
- ✅ `properties` (rental properties)
- ✅ `rooms` (rooms in properties)
- ✅ `tenants` (tenant information)
- ✅ `payments` (payment records)
- ✅ Sequences (auto-increment IDs)
- ✅ Constraints (foreign keys, unique, etc.)
- ✅ Indexes (for performance)

---

## 🔄 Rollback Plan

If something goes wrong:

**Render is still active!** Just revert the environment variables:

```
DB_URL=jdbc:postgresql://dpg-d7lpgd9o3t8c73ep4e7g-a:5432/rent_app_ksez
DB_USERNAME=rent_app_ksez_user
DB_PASSWORD=rDgBSV9HXRpbl6f8QD9DWQcnGX0TJChj
```

Click **Save** → Render redeploys → Back to original database!

---

## 📅 When to Migrate

**Recommended Timeline**:
- **Now**: Test Neon connection locally
- **This Week**: Do test migration with sample data
- **Before May 20, 2026**: Full migration (4 days before Render expires)

**Don't wait until May 24!** Migrate a few days early to avoid stress.

---

## 🆘 Troubleshooting

### **Issue**: `pg_dump: command not found`
**Fix**: 
```bash
brew install postgresql
```

### **Issue**: Connection timeout
**Fix**: Check internet connection, database is online

### **Issue**: Permission denied
**Fix**: Double-check username/password (copy-paste from this file!)

### **Issue**: Tables already exist in Neon
**Fix**: Use `--clean --if-exists` flags in pg_dump (already included above)

---

## ✅ Post-Migration Checklist

After migration, verify:

- [ ] App loads at https://rent-management-saas.vercel.app
- [ ] Login works with existing accounts
- [ ] Can create new properties/rooms/tenants
- [ ] Dashboard shows correct data
- [ ] Payments work
- [ ] No errors in Render logs

---

## 💡 Pro Tips

1. **Keep the backup file** (`render_backup.sql`) as insurance
2. **Test locally first** before updating Render env vars
3. **Migrate during low-traffic time** (late night/weekend)
4. **Keep Render DB active** for a few days after migration (rollback insurance)
5. **Document the migration date** (you'll forget when you did it!)

---

## 📞 Need Help?

If you need help during migration, you have:
- ✅ This guide
- ✅ Backup file (can restore anytime)
- ✅ Render DB still active (can roll back)
- ✅ Test environment (localhost)

**You can't break anything!** Worst case: revert Render env vars and you're back to normal.

---

## 🎯 Quick Reference

**Export Render DB**:
```bash
pg_dump "postgresql://rent_app_ksez_user:rDgBSV9HXRpbl6f8QD9DWQcnGX0TJChj@dpg-d7lpgd9o3t8c73ep4e7g-a.ohio-postgres.render.com:5432/rent_app_ksez" --no-owner --no-acl > backup.sql
```

**Import to Neon**:
```bash
psql "postgresql://neondb_owner:npg_m36lRZCxHhGT@ep-rapid-cell-ao939rb1-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" < backup.sql
```

**Update Render**:
```
DB_URL=jdbc:postgresql://ep-rapid-cell-ao939rb1-pooler.c-2.ap-southeast-1.aws.neon.tech:5432/neondb?sslmode=require
DB_USERNAME=neondb_owner
DB_PASSWORD=npg_m36lRZCxHhGT
```

**Done!** ✅
