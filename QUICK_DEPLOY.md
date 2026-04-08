# 🚀 Quick Deploy Guide

Panduan cepat untuk deploy aplikasi Deepfake AI Checker dalam 15 menit.

---

## 📦 Opsi Tercepat: Vercel + Railway (FREE)

### **Step 1: Persiapan (5 menit)**

1. **Push ke GitHub:**
```bash
cd "Deepfake AI Checker"
git init
git add .
git commit -m "Initial commit - Ready for deployment"
git branch -M main
git remote add origin https://github.com/username/deepfake-detector.git
git push -u origin main
```

2. **Sign Up Accounts:**
- Vercel: https://vercel.com (Login with GitHub)
- Railway: https://railway.app (Login with GitHub)

---

### **Step 2: Deploy Backend ke Railway (5 menit)**

1. **Buka Railway Dashboard:**
   - Go to https://railway.app/dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Pilih repository `deepfake-detector`

2. **Configure Environment Variables:**
   - Click "Variables" tab
   - Add variables:
     ```
     SECRET_KEY = generate-random-32-char-string-here
     CORS_ORIGINS = https://your-app.vercel.app
     PYTHONPATH = /app
     ```

3. **Deploy:**
   - Railway akan auto-detect Python app
   - Build akan start otomatis
   - Tunggu ~3-5 menit
   - Copy deployment URL: `https://your-app.railway.app`

4. **Test Backend:**
```bash
curl https://your-app.railway.app/health
# Should return: {"status": "healthy"}
```

---

### **Step 3: Deploy Frontend ke Vercel (5 menit)**

1. **Buka Vercel Dashboard:**
   - Go to https://vercel.com/dashboard
   - Click "Add New..." → "Project"
   - Import GitHub repository

2. **Configure Project:**
   - Framework Preset: **Vite**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Add Environment Variable:**
   - Click "Environment Variables"
   - Add:
     ```
     Name: VITE_API_BASE_URL
     Value: https://your-app.railway.app
     ```

4. **Deploy:**
   - Click "Deploy"
   - Tunggu ~2-3 menit
   - Your app will be live at: `https://your-app.vercel.app`

---

### **Step 4: Update CORS di Railway**

1. **Kembali ke Railway Dashboard**
2. **Update CORS_ORIGINS variable:**
   ```
   CORS_ORIGINS = https://your-app.vercel.app
   ```
3. **Railway akan auto-redeploy**

---

### **Step 5: Test Production! 🎉**

1. **Buka:** `https://your-app.vercel.app`
2. **Register** akun baru
3. **Login**
4. **Upload** test image
5. **Check** detection result
6. **View** history
7. **Browse** articles

---

## ✅ Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS updated with frontend URL
- [ ] All features tested in production
- [ ] Custom domain added (optional)

---

## 🔧 Troubleshooting

### **Backend tidak bisa diakses:**
```bash
# Check Railway logs
railway logs

# Common issues:
# 1. Model file terlalu besar (>500MB) - Consider model optimization
# 2. Memory limit exceeded - Upgrade Railway plan
# 3. Build timeout - Check requirements.txt
```

### **Frontend CORS error:**
```
# Update Railway CORS_ORIGINS:
CORS_ORIGINS = https://your-app.vercel.app,https://your-app-git-main.vercel.app
```

### **Environment variables tidak work:**
```bash
# Vercel: Redeploy after adding env vars
vercel --prod

# Railway: Auto-redeploys when vars change
```

---

## 💰 Cost

**Free Tier:**
- Vercel: Unlimited (Free forever)
- Railway: 500 hours/month free, then $5/month
- **Total: $0-5/month**

---

## 🎯 Next Steps

1. **Custom Domain:**
   - Vercel: Settings → Domains → Add
   - Railway: Settings → Domains → Generate

2. **Monitoring:**
   - Vercel Analytics (free)
   - Railway Metrics (included)

3. **Optimization:**
   - Enable Vercel Image Optimization
   - Add caching headers
   - Optimize model loading

---

## 📞 Need Help?

- **Vercel Support:** https://vercel.com/support
- **Railway Support:** https://railway.app/help
- **Documentation:** See `DEPLOYMENT_GUIDE.md`

---

**Deployment time: ~15 minutes**
**Difficulty: Easy** ⭐⭐☆☆☆

Good luck! 🚀
