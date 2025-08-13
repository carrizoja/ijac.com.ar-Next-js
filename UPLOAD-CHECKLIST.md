# 📋 Hostinger Upload Checklist

## 📊 **Export Summary**
- **Total Files:** 53 files
- **Total Size:** 1.7MB
- **Ready for Upload:** ✅

## 🎯 **Step-by-Step Upload Process**

### **1. Access Hostinger**
- [ ] Log into your Hostinger account
- [ ] Go to File Manager or set up FTP access
- [ ] Navigate to `public_html/` directory

### **2. Backup (Optional but Recommended)**
- [ ] Backup current website files (if any)
- [ ] Clear `public_html/` directory (or backup and remove old files)

### **3. Upload Files**
- [ ] Navigate to: `/media/koche/Jozito/Proyectos Web/ijac-next-app/ijac-next-app/out/`
- [ ] Select **ALL contents** inside the `out/` folder
- [ ] Upload to Hostinger's `public_html/` directory
- [ ] **Important:** Upload the *contents* of `out/`, not the `out/` folder itself

### **4. Verify Critical Files**
After upload, check these exist in `public_html/`:
- [ ] `index.html` (main page)
- [ ] `_next/` folder (assets)
- [ ] `contact/index.html` (contact page)
- [ ] `favicon.ico` (your logo)
- [ ] `sitemap.xml` (SEO)
- [ ] `robots.txt` (SEO)

### **5. Test Website**
- [ ] Visit your domain: `https://your-domain.com`
- [ ] Test navigation: Click through all menu items
- [ ] Check contact page: `https://your-domain.com/contact/`
- [ ] Verify favicon appears in browser tab
- [ ] Test mobile responsiveness

### **6. SEO Verification**
- [ ] Check sitemap: `https://your-domain.com/sitemap.xml`
- [ ] Check robots: `https://your-domain.com/robots.txt`
- [ ] Verify meta tags in page source

## 🗂️ **What You're Uploading**

```
📁 Contents of out/ folder (53 files, 1.7MB):
├── 📄 index.html           ← Home page
├── 📁 _next/               ← Optimized JS/CSS
├── 📁 contact/             ← Contact page
├── 📁 404/                 ← Error page  
├── 🖼️ favicon.ico          ← iJAC logo
├── 🖼️ apple-touch-icon.png ← iOS icon
├── 🖼️ android-chrome-*.png ← Android icons
├── 📄 site.webmanifest     ← PWA config
├── 📄 sitemap.xml          ← SEO sitemap
├── 📄 robots.txt           ← SEO robots
└── 🖼️ [other images]       ← Various assets
```

## ⚡ **Quick Commands**

```bash
# Navigate to export folder
cd "/media/koche/Jozito/Proyectos Web/ijac-next-app/ijac-next-app/out"

# List all files (to verify before upload)
ls -la

# Check file count and size
find . -type f | wc -l && du -sh .
```

## 🎉 **Post-Upload**

Once uploaded successfully:
1. Your iJAC website will be live at your domain
2. All pages will load as static HTML (super fast!)
3. Your logo will appear as the favicon
4. SEO is optimized with sitemap and robots.txt
5. The site is PWA-ready

**Your static export is ready for Hostinger! 🚀**
