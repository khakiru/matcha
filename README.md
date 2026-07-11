# Matcha POS

A simple browser-based point-of-sale system for a matcha shop. It runs as a static app and can connect to Supabase for shared data across devices.

## Features

- Product catalog with categories and search
- Product management for adding, editing, removing, and uploading product photos
- Drink customization for size, milk, sweetness, and toppings
- Cart quantities, discounts, tax, and payment method selection
- Checkout receipts and completed order history
- Daily, weekly, and monthly report filters
- Daily sales summary, average ticket, and popular items
- Cambodia time (GMT+7) for order times, daily reports, and the register clock
- Supabase database support for shared products, photos, orders, and reports

## Run

Open `index.html` in a browser.

Without Supabase config, data is stored in the browser with `localStorage`. With Supabase configured, products and orders sync across devices.

## Supabase Setup

1. Create a Supabase project.
2. Open the SQL editor and run `supabase-schema.sql`.
3. For local testing, copy `config.sample.js` to `config.js` and add your Supabase URL and anon key.
   - Use the project URL only, for example `https://abc123.supabase.co`.
   - Do not include `/rest/v1` at the end.
4. For Vercel, add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

Product photos upload to the public `product-photos` storage bucket created by the SQL file.

## Database Status Help

The sidebar shows the current database connection:

- `Database: Supabase (local config, REST)` means local `config.js` is working.
- `Database: Supabase (Vercel env, REST)` means Vercel environment variables are working.
- `Database: missing config` means the app cannot find Supabase keys.

If Vercel shows `Database: missing config`, open the Vercel project named `matcha`, go to **Settings > Environment Variables**, and add:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

After adding or changing environment variables, redeploy the Vercel project. Local `config.js` is ignored by Git, so it is not uploaded to Vercel.

The app talks to Supabase through REST and Storage APIs, so it does not require the external Supabase browser library to load.

## Supabase Migrations

This repo includes a Supabase migration in `supabase/migrations`.

Run these commands when you want to push the schema to the `matcha` Supabase project:

```bash
supabase link --project-ref hxhntsxrqxwrydwttupx
supabase db push
```

## Migration

If you used the POS before Supabase was connected, open the app after configuring Supabase and click **Migrate Local Data** in the sidebar. This copies local products and orders into Supabase and skips orders that already exist in the cloud.

## Deploy

This app can be deployed on Vercel. Import the GitHub repository, keep the build command empty/default, and add the Supabase environment variables above.
