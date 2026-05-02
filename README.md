# SiteTrack – Contractor Inventory PWA

QR-powered inventory management for contractors. Installable on any phone, works offline.

---

## Deploy to Vercel in 3 steps

### Option A – Vercel CLI (fastest)
```bash
npm install
npm install -g vercel
vercel
```
Follow the prompts. Your app will be live at `https://sitetrack-xxxx.vercel.app`.

### Option B – GitHub + Vercel Dashboard
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import the repo
3. Vercel auto-detects Vite — just click **Deploy**

---

## Local development
```bash
npm install
npm run dev
```
Open http://localhost:5173

## Production build
```bash
npm run build
npm run preview
```

---

## Install on phones (PWA)

Once deployed to HTTPS, users will see an **Install** prompt in the app.

- **Android**: Tap "Install SiteTrack" banner → Add to Home Screen
- **iPhone**: Safari → Share → Add to Home Screen
- Works fully **offline** after first load (service worker caches everything)

---

## QR Code Labels

For each inventory item, note its **QR Code ID** (e.g. `DRILL-001`).

Generate printable QR labels at:
- https://www.qr-code-generator.com
- https://qrcode.tec-it.com

**Tip**: Use weatherproof label stock (Brady or Avery) for job site durability.

---

## Data storage

All inventory data is stored in the browser's `localStorage` on each device.
For multi-device sync, replace the `db` object in `src/App.jsx` with a backend
(Supabase, Firebase, etc.).
