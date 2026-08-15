# Receipt Book

Receipt Book is a simple, single-user receipt tracker built for quick use on a phone. Photograph or upload a receipt, let Tesseract.js read it locally in the browser, review every field, and save the transaction. The app includes receipt history, card matching, remembered merchant categories, monthly reports, and yearly summaries.

## Stack

- Next.js, TypeScript, and Tailwind CSS
- Neon PostgreSQL with Drizzle ORM
- Cloudflare R2 for compressed receipt images
- Tesseract.js for free, in-browser OCR
- Recharts for the yearly spending chart
- A lightweight password-protected session for one user

## Install

Use Node.js 22 or newer.

```bash
npm install
cp .env.example .env.local
```

Fill in every value in `.env.local`. Generate long random values for `AUTH_SECRET` and `AUTH_PASSWORD`. Never commit this file.

## Create the Neon database

1. Create a free project at [Neon](https://neon.tech/).
2. Copy its pooled PostgreSQL connection string into `DATABASE_URL`.
3. Run the included migration from Neon's SQL Editor by pasting `drizzle/0000_receipt_book.sql`, or run:

```bash
npx drizzle-kit migrate
```

When the schema changes later, generate another migration with:

```bash
npm run db:generate
```

## Create the Cloudflare R2 bucket

1. In Cloudflare, open **R2 Object Storage** and create a private bucket.
2. Create an R2 API token with Object Read & Write access for that bucket.
3. Add the account ID, access key ID, secret access key, and bucket name to `.env.local`.
4. `R2_PUBLIC_URL` is included for optional future use, but this app retrieves images through a protected server route; the bucket should stay private.

Receipt photos are resized in the browser to a maximum side of 1800px and compressed toward 500 KB before they are uploaded.

## Environment variables

```env
DATABASE_URL=postgresql://...
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
AUTH_SECRET=
AUTH_PASSWORD=
```

No database, storage, or authentication secret is sent to the browser.

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with `AUTH_PASSWORD`.

For a production check:

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Import it into Vercel as a Next.js project.
3. Add all variables from `.env.example` in **Project Settings → Environment Variables**.
4. Deploy. No special build configuration is needed.

Use a long private password because this is intentionally a lightweight single-user login, not a multi-user identity system. Cloudflare R2 may need a CORS rule only if you later switch to direct browser uploads; the current protected server upload does not require one.
