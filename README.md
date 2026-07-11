# Matcha POS

A simple browser-based point-of-sale system for a matcha shop. It runs as a static app, so there is no install step or build command.

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
4. For Vercel, add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

Product photos upload to the public `product-photos` storage bucket created by the SQL file.

## Deploy

This app can be deployed on Vercel. Import the GitHub repository, keep the build command empty/default, and add the Supabase environment variables above.
