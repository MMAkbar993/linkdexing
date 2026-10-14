# Linkdexing

A paid SEO tool that gets backlinks indexed by search engines and checks whether they are. Customers buy credits, submit links, and track results from their dashboard or through a public API. Live at **[linkdexing.com](https://linkdexing.com)**.

- **Customer site:** React (Create React App) (`frontend/`)
- **Admin panel:** React (Create React App) + Bootstrap (`admin/`)
- **API:** Node.js + Express, MongoDB via Mongoose (`backend/`)
- **Services:** PayPal (checkout and webhooks), IndexChecker.link (index status), Brevo/Sendinblue (email), Google reCAPTCHA v3

---

## Features

**For customers**
- Sign up with email verification, login, password reset
- Buy credit packages through PayPal, with coupons and bonus credits on larger packs
- Submit links for indexing, with drip-feed scheduling over 1 to 31 days
- Index checker: submit URLs in batches and see which are indexed
- Links archive and order history
- Developer API: generate API keys, call the API, view usage

**For admins**
- Separate admin login and panel
- View and search users, adjust credits, restrict accounts
- Review submissions by date or drip-feed schedule and mark them processed
- Manage coupons and site settings
- Audit log of admin actions

**Under the hood**
- Prices are looked up server-side from `backend/src/config/creditPackages.js`, never trusted from the request
- API-key authentication with per-request logging
- Background poller that collects index-check results as they finish and refunds credits where needed
- Rate limiting, Helmet, bcrypt password hashing, OTP verification
- Database indexes on hot queries such as submissions by date

---

## Project structure

```
frontend/   customer-facing site and dashboard
admin/      admin panel
backend/    Express API
  src/api/v1/   one folder per area: users, orders, links, payments, indexcheck, coupons, dev (API keys), admin
  src/services/ PayPal, credits, coupons, index checker and poller, audit log, settings
  src/middleware/ API-key auth, request logging, rate limiters
  src/config/   credit packages
```

---

## Running locally

Requires Node 20+ and a MongoDB database (local or Atlas). Run each app in its own terminal.

```bash
# 1. API
cd backend
cp .env.example .env      # fill in MONGODB_URI, JWT_SECRET, JWT_ADMIN_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD at minimum
npm install
npm run dev               # http://localhost:4000 by default

# 2. Customer site
cd frontend
cp .env.example .env      # REACT_APP_BASE_URL=http://localhost:4000
npm install
npm start

# 3. Admin panel
cd admin
cp .env.example .env      # REACT_APP_BASE_URL=http://localhost:4000, and a different PORT from the site
npm install
npm start
```

PayPal webhooks need a public HTTPS URL, so use PayPal's sandbox mode and a tunnel when testing payments locally.

---

## Configuration

Every variable is listed, with comments explaining what it does and where it's used, in:

| File | What it covers |
|---|---|
| `backend/.env.example` | MongoDB, JWT secrets, admin login, CORS, reCAPTCHA secret, Brevo, PayPal, IndexChecker key |
| `frontend/.env.example` | API URL, reCAPTCHA site key, PayPal client ID |
| `admin/.env.example` | API URL |

Only `REACT_APP_` variables reach the browser, so secrets belong in `backend/.env` only. Never commit a filled-in `.env`, and leave `ENABLE_MASTER_PASSWORD` off in production.

---

## Production

| App | URL |
|---|---|
| Customer site | [linkdexing.com](https://linkdexing.com) |
| Admin panel | [admin.linkdexing.com](https://admin.linkdexing.com) |

The frontend, admin panel and API are also kept as separate repos for independent deployment: [linkdexing-f](https://github.com/MMAkbar993/linkdexing-f), [linkdexing-admin](https://github.com/MMAkbar993/linkdexing-admin) and [linkdexing-backend](https://github.com/MMAkbar993/linkdexing-backend).

---

Built by [Muhammad Mujeeb Akbar](https://mmakbar.vercel.app/) · [Case study](https://mmakbar.vercel.app/work/linkdexing.html)
