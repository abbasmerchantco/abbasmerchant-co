# abbasmerchant.co — v5.1

Full source for the v5 design (warm cream/charcoal, auto-fill card grid, 8 categories)
plus the v5.1 additions: automatic short URLs, optional custom URL slugs, and
file attachments (GPX, PDF, etc.) on posts.

## What's in this folder

Everything — this is the complete site, not a diff. Extract it and drag the
whole contents into GitHub (or replace your existing repo's contents with it).

- `eleventy.config.js`, `netlify.toml`, `package.json` — build config
- `src/posts/` — your posts folder, includes one sample post to delete
- `src/posts/posts.json` — powers automatic short URLs + the customSlug override
- `src/admin/` — the CMS (config.yml has the new "Short URL" and "Attachments" fields)
- `src/_includes/layouts/` — base + post templates (post.njk renders attachments)
- `src/css/style.css` — v5 design + new attachments styling
- `src/_redirects` — empty template; add 301 lines here if you have old dated URLs to preserve

## Before you upload

1. **Delete the sample post** — `src/posts/2026-07-09-sample-post.md` — or edit it into
   your first real post. It exists only so the build has something to render.
2. **If you have existing posts from your live site**, copy their `.md` files into
   `src/posts/` here before uploading, so you don't lose them.
3. **If you have existing uploaded images**, copy them into `src/images/uploads/`.

## Deploy

```
git add .
git commit -m "v5.1: short URLs, custom slugs, attachments"
git push origin main
```

Netlify rebuilds automatically. Same Identity/Git Gateway login as before — nothing
about auth changes in this version.

## Local dev (optional)

```
npm install
npm run dev     # localhost:8080
npm run build   # outputs to _site/
```
