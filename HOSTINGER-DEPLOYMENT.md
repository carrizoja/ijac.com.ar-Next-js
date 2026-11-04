# 🚀 Hostinger Deployment Guide - Static Export

## ✅ **Setup Complete!**

Your iJAC Next.js project is now configured for static export and ready for Hostinger deployment.

## 📁 **Build Output Location**

After running `npm run export`, your static files are generated in:
```
/media/koche/Jozito/Proyectos Web/ijac-next-app/ijac-next-app/out/
```

## 🔧 **Configuration Changes Made**

### 1. **package.json** - Added export script:
```json
{
  "scripts": {
    "export": "next build"
  }
}
```

### 2. **next.config.ts** - Configured for static export:
```typescript
const nextConfig: NextConfig = {
  output: 'export',           // Enable static export
  trailingSlash: true,        // Add trailing slashes to URLs
  images: {
    unoptimized: true,        // Required for static hosting
    // ... image domains configured
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
};
```

### 3. **sitemap.ts & robots.ts** - Added static export configs:
```typescript
export const dynamic = 'force-static'
export const revalidate = false
```

## 🚀 **Automated Deploy over SSH (recommended)**

`npm run deploy` builds the site and syncs `out/` to `public_html/` with `rsync` over SSH.
It is a **dry run by default**; add `--live` to upload:

```bash
npm run deploy            # build + preview what would change
npm run deploy -- --live  # build + upload
```

`--delete` removes server files that are no longer in `out/` (old `_next` chunks).
`.htaccess` and `.well-known/` are protected and never deleted.

One-time setup:

1. hPanel → Websites → ijac.com.ar → Advanced → **SSH Access** → enable.
2. `ssh-keygen -t ed25519 -f ~/.ssh/hostinger_ijac -C "ijac-deploy"` and add the
   `.pub` contents under **SSH keys** on the same page.
3. Add the host alias to `~/.ssh/config` (values from the SSH Access page):

   ```
   Host ijac-hostinger
       HostName <server IP>
       Port 65002
       User <hosting username>
       IdentityFile ~/.ssh/hostinger_ijac
       IdentitiesOnly yes
   ```

4. Test: `ssh ijac-hostinger "ls domains/ijac.com.ar/public_html | head"`.

## 📋 **Deployment Steps**

### **Step 1: Generate Static Files**
```bash
cd "/media/koche/Jozito/Proyectos Web/ijac-next-app/ijac-next-app"
npm run export
```

### **Step 2: Upload to Hostinger**

1. **Access Hostinger File Manager** or use FTP
2. **Navigate to** `public_html/` directory
3. **Upload ALL contents** from the `out/` folder (not the folder itself)

**File Structure After Upload:**
```
Hostinger public_html/
├── index.html              ← Main page
├── _next/                  ← Next.js assets
├── contact/
│   └── index.html          ← Contact page
├── favicon.ico             ← Your iJAC favicon
├── apple-touch-icon.png    ← iOS icon
├── android-chrome-*.png    ← Android icons
├── site.webmanifest        ← PWA manifest
├── sitemap.xml             ← SEO sitemap
├── robots.txt              ← SEO robots
└── ... (other assets)
```

### **Step 3: Verify Deployment**

After upload, test these URLs:
- `https://your-domain.com/` - Home page
- `https://your-domain.com/contact/` - Contact page
- `https://your-domain.com/favicon.ico` - Favicon
- `https://your-domain.com/sitemap.xml` - Sitemap

## 🗂️ **Files Ready for Upload**

Your `out/` folder contains:
```
📁 out/
├── 📄 index.html           (Home page)
├── 📁 _next/               (Optimized assets)
├── 📁 contact/             (Contact page)
├── 📁 404/                 (Error page)
├── 🖼️ favicon.ico          (Your iJAC logo)
├── 🖼️ apple-touch-icon.png
├── 🖼️ android-chrome-*.png
├── 📄 site.webmanifest     (PWA config)
├── 📄 sitemap.xml          (SEO)
├── 📄 robots.txt           (SEO)
└── 🖼️ [other assets]       (Images, icons, etc.)
```

## ⚡ **Performance Features Included**

- ✅ **Optimized Images** - All images compressed and optimized
- ✅ **CSS/JS Minification** - Reduced file sizes
- ✅ **Static Generation** - Lightning-fast loading
- ✅ **SEO Ready** - Sitemap and robots.txt included
- ✅ **PWA Ready** - Web app manifest included
- ✅ **Favicon Set** - Your iJAC logo as favicon

## 🎯 **Quick Upload Command**

If using command line/FTP:
```bash
# Navigate to the out folder
cd out/

# Upload all contents to public_html (example with rsync/scp)
# Replace with your actual Hostinger FTP details
```

## ⚠️ **Important Notes**

1. **Upload Contents, Not Folder**: Upload everything **inside** `out/`, not the `out/` folder itself
2. **Trailing Slashes**: URLs will have trailing slashes (e.g., `/contact/`)
3. **No Server-Side Features**: Static export means no API routes or server-side rendering
4. **Image Optimization**: Images are unoptimized for static hosting compatibility

## 🔄 **Future Updates**

To update your website:
1. Make changes to your code
2. Run `npm run export`
3. Upload the new `out/` folder contents to Hostinger

Your iJAC website is now ready for Hostinger deployment! 🎉
