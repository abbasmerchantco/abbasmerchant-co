# abbasmerchant.co

Personal site for abbasmerchant.co. Eleventy 3 static site.

## Architecture

- **Build:** Eleventy compiles `src/` → `_site/`.
- **Hosting:** Cloudflare Workers static assets serves `_site/` via the `assets`
  binding in `wrangler.jsonc`.
- **CMS:** Decap CMS at `/admin` writes markdown to `src/posts/` through the
  GitHub backend (`src/admin/config.yml`).
- **Auth:** a separate Cloudflare Worker OAuth proxy at
  `abbasmerchant-cms-auth.snowy-mud-4356.workers.dev` handles GitHub login for
  the CMS. There is no other authentication on the static site itself.

## Publishing

1. Go to `/admin`.
2. Write, save as a draft. Editorial workflow keeps unpublished entries on
   `cms/posts/<slug>` branches until they're ready.
3. Publish from the CMS when ready. Merging to `main` triggers a deploy.

### The `Write ✦` button

Hidden by default. Visit `/?write=norden901` once per browser to reveal it
permanently on that device. This is a convenience shortcut, not security — the
static site has no auth of its own.

## Local dev

```
npm install
npm run dev      # localhost:8080
npm run build    # outputs to _site/
npm run deploy   # build + wrangler deploy
```

## Content model

Seven categories: `musings`, `learnings`, `movies`, `books`, `photos`,
`travel`, `mba`. These keys must stay in sync across four places:

- `src/_data/categories.js` (`CAT_LABELS`, `CAT_EMOJI`)
- `src/admin/config.yml` (the category select field)
- `src/css/style.css` (the `.cat-*` rules)
- `src/index.njk` (the filter buttons)

Post frontmatter fields: `title`, `customSlug`, `category`, `date`, `excerpt`,
`readTime`, `featured`, `coverImage`, `attachments`.

**`coverImage` gotcha:** templates read `coverImage`. Some older posts used
`image` instead — if a cover doesn't render, check the key name.

## Analytics

[GoatCounter](https://www.goatcounter.com/) at `abbasmerchant.goatcounter.com`.
No cookies, no consent banner needed.

## Costs

Domain registration only.
