# Deployment — Front-end (Vercel)

A static Vite build. Vercel auto-detects the framework; the only project-specific pieces are the SPA
rewrite (already in `vercel.json`) and one environment variable.

## 1. Import
- Push this repository to GitHub.
- In Vercel: **New Project → import the repo**. The framework preset is detected as **Vite**
  (build command `npm run build`, output directory `dist`).

## 2. Environment variable
Set the API base URL (including `/api`) in **Project Settings → Environment Variables**:

```
VITE_API_BASE_URL = https://your-backend.monsterasp.net/api
```

`VITE_*` variables are read at build time, so redeploy after changing it.

## 3. Deploy
Click **Deploy**. `vercel.json` rewrites every path to `index.html`, so client-side routes
(`/library/...`, `/login`, deep links) work on refresh. Hashed assets — including the hero video
(`src/assets/hero.mp4`) — are served with a long immutable cache, so they aren't re-downloaded on
every visit.

## 4. Wire the two sides together
- Copy the Vercel URL (e.g. `https://your-app.vercel.app`).
- Add it to the backend's `Cors__AllowedOrigins` so the browser is allowed to call the API.

## Local production preview
```bash
npm run build
npm run preview   # serves dist/ locally
```
