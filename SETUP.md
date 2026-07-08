# Abbas Merchant — Setup Guide

## Deploy in 15 minutes

### Step 1 — GitHub
1. github.com → New repository → name it `abbas-blog` → Public → Create
2. Drag and drop all these files into the repo (preserving folder structure)

### Step 2 — Netlify
1. netlify.com → Sign up with GitHub
2. "Add new site" → "Import existing project" → select `abbas-blog`
3. Leave build settings blank (no build command, publish directory is `.`)
4. Deploy — live in ~60 seconds

### Step 3 — Your Spaceship domain
1. Netlify → Site settings → Domain management → Add custom domain
2. Enter your domain → Netlify gives you DNS records
3. Add those records in Spaceship's DNS settings
4. Wait 5–30 min → Netlify auto-provisions HTTPS

### Step 4 — CMS setup
1. Netlify → Identity tab → Enable Identity
2. Identity settings → Registration → Invite only
3. Enable Git Gateway
4. Invite users → invite your own email
5. Accept invite email → set password
6. Go to yoursite.com/admin → log in → write

---

## Adding your photo
Replace the "AM" initials in the avatar circles with your actual photo:

In `index.html` and `about.html`, find the `.avatar` div and replace with:
```html
<div class="avatar">
  <img src="images/uploads/abbas.jpg" alt="Abbas Merchant" />
</div>
```
Upload `abbas.jpg` through the CMS media library or directly to `images/uploads/`.

---

## Publishing a post

### Through the CMS (recommended)
1. Go to yoursite.com/admin
2. Click Posts → New Post
3. Fill in: Title, Category, Date, Excerpt, Read time
4. Toggle Featured on if you want it to span 2 columns
5. Upload a cover image (optional — falls back to emoji if blank)
6. Write your post in the editor
7. Publish → site rebuilds in ~30 seconds

### Also add to the JS array
**Important:** Until the automatic build step is set up, you also need to add each post manually to the `POSTS` array in `index.html`. Copy the shape of an existing entry:

```js
{
  slug: 'your-post-slug',     // must match the filename the CMS creates
  cat: 'musings',             // musings | learnings | movies | books | photos | travel | mba
  date: '2025-01-15',         // YYYY-MM-DD
  title: 'Your post title',
  excerpt: 'Short description shown on the card.',
  read: '5 min',
  featured: false,            // true = spans 2 columns
  img: 'images/uploads/x.jpg' // optional — omit for emoji fallback
},
```

---

## Adding a new category
Three files to update:

**admin/config.yml** — add to the options list:
```yaml
- { label: "🏍 Motorcycling", value: "motorcycling" }
```

**index.html** — add to CAT_LABELS and CAT_EMOJI objects, and add a filter button:
```html
<button class="f-btn" onclick="setFilter('motorcycling', this)">🏍 Motorcycling</button>
```

**style.css** — add colour rules (copy a cat-* block and change the colour):
```css
.cat-motorcycling .cat-tag  { color: #8A3A1A; }
.cat-motorcycling .accent   { background: #8A3A1A; }
.cat-motorcycling .card-fallback { color: #8A3A1A; }
html.dark .cat-motorcycling .cat-tag  { color: #E8905A; }
html.dark .cat-motorcycling .accent   { background: #E8905A; }
html.dark .cat-motorcycling .card-fallback { color: #E8905A; }
```

---

## Known limitation — the build step
Right now the home feed reads from a hardcoded JS array in `index.html`.
Posts written through the CMS save as markdown files in `/posts/` but won't
automatically appear on the home feed until you also add them to the array.

The permanent fix is switching to a static site generator (Eleventy) which
reads the markdown files and builds the home feed automatically on every deploy.
Ask Claude to "migrate the site to Eleventy" when you're ready for that upgrade.

---

## Recommended next steps
- Add Google Analytics or Plausible for traffic stats
- Add an RSS feed (`feed.xml`)
- Add Netlify Image CDN for automatic image resizing (free on Netlify)
- Migrate to Eleventy to fix the manual post array problem
- Add Giscus for comments (GitHub-based, free)
