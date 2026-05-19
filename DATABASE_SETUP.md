# 🗄️ Database Setup Guide

## 📊 **Database Architecture**

Aplikasi menggunakan **SQLite** untuk menyimpan:
- User accounts (email, password, nama)
- Detection history
- Password reset tokens

---

## 🔍 **Local vs Production Database**

| Aspect | Local | Production |
|--------|-------|------------|
| **Location** | `users.db` di folder project | `/app/data/users.db` di Railway |
| **Data** | Test data | Real user data |
| **Persistence** | Permanent | **Hilang saat redeploy** (tanpa volume) |
| **Sync** | ❌ Tidak sync | ❌ Tidak sync |

**⚠️ PENTING:** Database local dan production **TERPISAH**!
- User yang daftar di local tidak ada di production
- History di local tidak muncul di production

---

## ✅ **Setup Production Database (Railway)**

### **Step 1: Create Persistent Volume**

Tanpa volume, database akan **hilang setiap redeploy**!

1. **Buka Railway Dashboard**
2. **Pilih project backend**
3. **Settings** → **Volumes**
4. **Add Volume**:
   ```
   Mount Path: /app/data
   ```
5. **Save**

### **Step 2: Set Environment Variable**

```bash
# Railway Dashboard → Variables
DATABASE_PATH=/app/data/users.db
```

### **Step 3: Redeploy**

```bash
git push origin main
# Railway auto-redeploy
```

---

## 🔄 **Database Migration (Local → Production)**

Jika Anda ingin copy data dari local ke production:

### **Option 1: Manual Export/Import (Recommended)**

```bash
# 1. Export data dari local
sqlite3 users.db .dump > backup.sql

# 2. Upload ke Railway
railway login
railway link  # Link to your project
railway run sqlite3 /app/data/users.db < backup.sql
```

### **Option 2: Copy Database File**

```bash
# 1. Download current production DB (backup)
railway run cat /app/data/users.db > production_backup.db

# 2. Upload local DB to production
railway run "cat > /app/data/users.db" < users.db
```

---

## 📋 **Database Schema**

### **Users Table:**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Detection History Table:**
```sql
CREATE TABLE detection_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    image_name TEXT NOT NULL,
    result_label TEXT NOT NULL,
    prob_fake REAL NOT NULL,
    model_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### **Password Reset Tokens Table:**
```sql
CREATE TABLE password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

---

## 🛠️ **Troubleshooting**

### **Database hilang setelah redeploy:**
```bash
# Pastikan volume sudah di-set
# Railway Dashboard → Settings → Volumes
# Mount Path: /app/data

# Set environment variable
DATABASE_PATH=/app/data/users.db
```

### **User tidak bisa login di production:**
```bash
# User harus daftar ulang di production
# Database local ≠ Database production
```

### **History tidak muncul:**
```bash
# Cek apakah user sudah login
# Cek Railway logs untuk error
railway logs
```

### **Backup database production:**
```bash
# Download database
railway run cat /app/data/users.db > backup_$(date +%Y%m%d).db

# Restore dari backup
railway run "cat > /app/data/users.db" < backup_20260519.db
```

---

## 📊 **Database Management Tools**

### **View Database di Local:**
```bash
# SQLite CLI
sqlite3 users.db
.tables
.schema users
SELECT * FROM users;
.quit

# DB Browser for SQLite (GUI)
# Download: https://sqlitebrowser.org/
```

### **View Database di Production:**
```bash
# Railway CLI
railway run sqlite3 /app/data/users.db
.tables
SELECT COUNT(*) FROM users;
.quit
```

---

## 🔐 **Security Best Practices**

1. ✅ **Backup regularly** - Database bisa hilang!
2. ✅ **Use strong SECRET_KEY** - Set di Railway env vars
3. ✅ **Never commit users.db** - Already in `.gitignore`
4. ✅ **Use persistent volume** - Prevent data loss
5. ✅ **Monitor database size** - SQLite has limits

---

## 📝 **Summary**

- ✅ Database local dan production **TERPISAH**
- ✅ Gunakan **Railway Volume** untuk persistence
- ✅ Set `DATABASE_PATH=/app/data/users.db` di Railway
- ✅ Backup database secara berkala
- ✅ User harus daftar ulang di production

---

**Need help?** Contact: factit.support@gmail.com
