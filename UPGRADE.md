# Eleventy v5 — Setup Guide

This is the new v5 design built on Eleventy. Your posts and images are safe — nothing gets deleted, and the site now auto-generates from your markdown files.

## What's changed

**New files to add to `/src/`:**
- `css/style.css` — new v5 design (replaces old one)
- `index.njk` — new home feed template
- `_includes/layouts/base.njk` — new base layout
- `_includes/layouts/post.njk` — new post template
- `about.md` — new about page
- `404.md` — custom 404 page
- `admin/config.yml` — updated CMS config (8 categories + attachments field)
- `_data/categories.js` — category labels and emoji

**Root-level files:**
- `eleventy.config.js` — already updated
- `netlify.toml` — updated

**Do NOT delete:**
- `/src/posts/` — all your posts stay
- `/src/images/uploads/` — all your media stays
- `package.json` / `package-lock.json` — keep as-is
- `/src/admin/index.html` — keep as-is

## How to upgrade

### Step 1 — Back up your repo
Just in case. Clone it locally or take a snapshot.

### Step 2 — Replace files in `/src/`
Copy these new files into your repo, keeping the folder structure:

```
src/
  ├── css/
  │   └── style.css          ← NEW
  ├── _includes/
  │   └── layouts/
  │       ├── base.njk       ← NEW
  │       └── post.njk       ← NEW
  ├── _data/
  │   └── categories.js      ← NEW
  ├── admin/
  │   └── config.yml         ← REPLACE OLD ONE
  ├── posts/                 ← KEEP AS-IS (your posts)
  ├── images/uploads/        ← KEEP AS-IS (your media)
  ├── index.njk              ← NEW (replaces old index.njk)
  ├── about.md               ← NEW (replaces old about.md)
  └── 404.md                 ← NEW
```

### Step 3 — Delete old files
Remove these from `/src/`:
- Old `_includes/` layouts (except keep the new ones)
- Old `css/` files (except the new style.css)
- Old `index.njk` (replaced by new one)
- Old `search.njk` (search is now in base.njk)
- Old `category.njk` (category filtering is now in base.njk)

### Step 4 — Root-level changes
- Replace `eleventy.config.js` with the new one
- Replace `netlify.toml` with the new one

### Step 5 — Deploy
```bash
git add .
git commit -m "Upgrade to Eleventy v5: new design, auto-feed generation"
git push origin main
```

Netlify builds and deploys automatically. Check yoursite.com in ~2 min.

## What works now

✅ Write a post through `/admin/`
✅ Post saves as markdown in `/src/posts/`
✅ Eleventy automatically reads it
✅ It appears on the home feed instantly
✅ No manual array maintenance
✅ Warm cream light mode + charcoal dark mode
✅ Optional cover images (emoji fallback)
✅ All 8 categories (including MBA)
✅ Search + filtering on home feed

## If something breaks

Check the Netlify build log:
- Netlify → Site settings → Build & deploy → Build log

Most common issues:
- **Template syntax error** — check Eleventy template syntax (`.njk` files)
- **CSS not loading** — make sure `/src/css/style.css` is in the right place
- **Posts not appearing** — run `npm run build` locally and check console
- **Images broken** — check that `/src/images/uploads/` still exists with all your media

## Local development

```bash
npm run dev     # Runs Eleventy in watch mode, serves at localhost:8080
npm run build   # Builds the site to _site/ (what Netlify deploys)
```

## Adding a new category

Three files to update:

**1. `/src/_data/categories.js`**
```js
CAT_LABELS: {
  // ... add this:
  motorcycling: '🏍 Motorcycling',
},
CAT_EMOJI: {
  // ... add this:
  motorcycling: '🏍',
},
```

**2. `/src/admin/config.yml`** (in the options list)
```yaml
- { label: "🏍 Motorcycling", value: "motorcycling" }
```

**3. `/src/css/style.css`** (copy a `.cat-` block and change the colour)
```css
.cat-motorcycling .cat-tag  { color: #8A3A1A; }
.cat-motorcycling .accent   { background: #8A3A1A; }
.cat-motorcycling .card-fallback { color: #8A3A1A; }
html.dark .cat-motorcycling .cat-tag  { color: #E8905A; }
html.dark .cat-motorcycling .accent   { background: #E8905A; }
html.dark .cat-motorcycling .card-fallback { color: #E8905A; }
```

Then add a filter button to `/src/index.njk`:
```html
<button class="f-btn" onclick="setFilter('motorcycling', this)">🏍 Motorcycling</button>
```

Done. Next post you write, you can pick that category.

## Questions?

All your posts and media are completely safe. The only things changing are the templates (how the site is built) and the design. Your content stays exactly as it is.
