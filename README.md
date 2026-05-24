# Bulldog Planner PWA

Persoonlijke agenda PWA voor bulldogbaasjes van Stichting Bulldog Steunfonds Nederland.

## Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database/Auth**: Supabase (zelfde project als website)
- **Hosting**: Vercel
- **PWA**: Service Worker + Web Push (VAPID)
- **OAuth**: Google + Facebook via Supabase Auth

## Setup

### 1. Clone & install
```bash
git clone https://github.com/jouw-org/bulldog-planner.git
cd bulldog-planner
npm install
```

### 2. Supabase SQL uitvoeren
Voer `supabase-planner.sql` uit in je bestaande Supabase project (SQL Editor).

### 3. OAuth activeren in Supabase
Ga naar **Authentication → Providers**:
- **Google**: voeg Client ID + Secret toe van Google Cloud Console
- **Facebook**: voeg App ID + Secret toe van Facebook Developers
- **Redirect URL**: `https://bulldog-planner.vercel.app/auth/callback`

### 4. VAPID keys genereren
```bash
npx web-push generate-vapid-keys
```
Kopieer de keys naar `.env.local`.

### 5. Environment variables
```bash
cp .env.local.example .env.local
# Vul alle waarden in
```

### 6. Lokaal draaien
```bash
npm run dev
```

### 7. Deployen naar Vercel
1. Push naar GitHub
2. Vercel → New Project → selecteer `bulldog-planner`
3. Voeg environment variables toe
4. Deploy!

## Pagina's

| Route | Beschrijving |
|-------|-------------|
| `/login` | Inloggen via Google of Facebook |
| `/agenda` | Persoonlijke kalender |
| `/evenementen` | Stichting evenementen |
| `/notificaties` | Push notificaties beheren |
| `/profiel` | Gebruikersprofiel + bulldog info |

## PWA installeren
- **Android**: "Toevoegen aan startscherm" via Chrome menu
- **iOS**: Safari → Delen → "Zet op beginscherm"
- **Desktop**: Installeer knop in adresbalk

## Push notificaties
Push notificaties werken via VAPID. De service worker ontvangt berichten
en toont ze zelfs als de app gesloten is.
