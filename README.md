# NOVA-Φ ULTRA v5.0 — Electron App

## Cara Build & Jalankan

### Syarat
- **Node.js** v18+ → https://nodejs.org
- **npm** v9+
- **Git** (opsional)

---

## 🚀 LANGKAH CEPAT (Windows/Mac/Linux)

### 1. Install dependencies
Buka terminal/command prompt di folder ini, lalu:
```bash
npm install
```

### 2. Jalankan (mode development)
```bash
npm start
```
Aplikasi langsung terbuka!

---

## 📦 BUILD INSTALLER

### Windows (.exe installer)
```bash
npm run build:win
```
Output: `dist/NOVA-Φ ULTRA Setup 5.0.0.exe`

### macOS (.dmg)
```bash
npm run build:mac
```
Output: `dist/NOVA-Φ ULTRA-5.0.0.dmg`

### Linux (.AppImage)
```bash
npm run build:linux
```
Output: `dist/NOVA-Φ ULTRA-5.0.0.AppImage`

---

## 📁 Struktur Project

```
nova-ultra-electron/
├── main.js          ← Electron main process (window, menu, security)
├── preload.js       ← Secure bridge ke renderer
├── package.json     ← Config & build settings
├── src/
│   └── index.html   ← Aplikasi utama NOVA-Φ ULTRA
└── assets/
    ├── icon.png     ← Icon app (512x512)
    ├── icon.ico     ← Windows icon (perlu dikonversi, lihat bawah)
    └── icon.icns    ← macOS icon (perlu dikonversi, lihat bawah)
```

---

## 🎨 Ganti Icon

Untuk icon profesional, ganti `assets/icon.png` dengan desain sendiri (min 512×512 px).

**Convert ke .ico (Windows):**
```bash
npm install -g png-to-ico
png-to-ico assets/icon.png > assets/icon.ico
```

**Convert ke .icns (macOS):**
```bash
# Di Mac:
mkdir icon.iconset
sips -z 512 512 assets/icon.png --out icon.iconset/icon_512x512.png
iconutil -c icns icon.iconset -o assets/icon.icns
```

---

## 🔐 Fitur Keamanan Electron

- `contextIsolation: true` — renderer terisolasi dari Node.js
- `nodeIntegration: false` — tidak ada akses Node di UI
- `sandbox: true` — renderer berjalan di sandbox Chromium
- `webSecurity: true` — same-origin policy aktif
- Single instance lock — cegah double launch
- CSP header di HTML

---

## 💰 Distribusi / Jual

Setelah build, file installer bisa langsung didistribusikan via:
- **Gumroad** (penjualan digital)
- **Tokopedia/Shopee** (digital product)
- **Website sendiri** dengan Stripe/Midtrans
- **GitHub Releases** (free/open source)

---

## 📋 Requirements Minimum User

| Platform | Requirement |
|----------|-------------|
| Windows  | Windows 10 64-bit |
| macOS    | macOS 10.15 Catalina+ |
| Linux    | Ubuntu 18.04+ / Debian 10+ |
| RAM      | 256 MB minimum |
| Storage  | 200 MB |
