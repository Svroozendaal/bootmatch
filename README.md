# BootMatch

BootMatch is a minimal MVP that resolves a renter’s ski boot (brand + model + optional flex/year) to a canonical boot record and returns the top 10 similar-fitting boots.

## What it does
- Resolves boot names with exact + fuzzy matching
- Returns deterministic fit matches (last, volume, flex, shape)
- Shows best available offer when present
- Includes an admin page to seed data and add aliases

## Run locally
```bash
npm install
cp .env.example .env
npx prisma db push
npm run seed
npm run dev
```

Then visit:
- `http://localhost:3000` for the app
- `http://localhost:3000/admin` for the admin tools

## Seed the database
```bash
npm run seed
```

Or via the admin page (POST `/api/seed`).

## Run tests
```bash
npm run test
```

## Push to GitHub
```bash
git init
git add .
git commit -m "Initial BootMatch MVP"
# then add your remote and push
```
