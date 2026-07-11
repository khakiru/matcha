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
- Local browser storage for products and orders

## Run

Open `index.html` in a browser.

All data is stored in the browser with `localStorage`, so each browser profile keeps its own shop data.

## Deploy

This is a static app and can be deployed on Vercel with no build command. Import the GitHub repository in Vercel and keep the output directory empty/default.
