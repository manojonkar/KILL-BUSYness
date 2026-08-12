# KILL BUSYness Portal

Next.js 14 (App Router) + Supabase + Vercel. Live at https://www.killbusyness.com

## Setup
    npm install
    npm run dev

## Environment variables (set in Vercel)
- `RESEND_API_KEY` — transactional email (required for invites, orders, contact)
- `NEXT_PUBLIC_SITE_URL` — defaults to https://www.killbusyness.com
- Supabase URL and anon key have safe in-code fallbacks (anon key is RLS-protected)

## Notes
- Stylesheet is served from the database at `/css` (gzipped in `brand_assets`)
- Brand images served from `/img/[name]`, also from `brand_assets`
- Chapter prose lives in `chapter_texts`; reward amounts in `reward_rules`; store in `store_items`
- Payment/UPI details and the Amazon link live in `site_settings` — editable without a deploy

## Deploying via GitHub
Connect this repo in Vercel → Project → Settings → Git. Pushes to `main` then deploy automatically.
