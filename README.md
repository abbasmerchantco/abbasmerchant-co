# abbasmerchant.co

A personal blog and public journal. Static site (Eleventy) + Decap CMS admin panel at `/admin`. No frameworks, no database server, no maintenance. Free to host.

## How it works

- Posts are markdown files in `src/posts/`. Eleventy builds them into a fast static site.
- The `/admin` panel (Decap CMS) is your writing interface: rich text editor, image uploads, category selector, publish button. When you hit publish, it commits the post to your GitHub repo, Netlify rebuilds automatically, and the site is live in ~30–60 seconds.
- You never touch Git or code to publish. The repo is just the storage layer.

## One-time setup (~15 minutes)

### 1. Put the code on GitHub (5 min)
1. Create a free GitHub account if you don't have one, then create a new **private or public repo** (either works) called e.g. `abbasmerchant-co`.
2. On the repo page choose **"uploading an existing file"** and drag in the contents of this folder (everything except `node_modules` and `_site` — they're rebuilt automatically). Commit to the `main` branch.
   - Or, if comfortable with Git: `git init && git add . && git commit -m "init" && git push`.

### 2. Connect Netlify (5 min)
1. Sign up at netlify.com (free tier) with your GitHub account.
2. **Add new site → Import an existing project → GitHub** → pick your repo.
3. Netlify reads `netlify.toml` automatically (build command `npm run build`, publish dir `_site`). Click **Deploy**.
4. Your site is live at a `something.netlify.app` URL within a minute.

### 3. Turn on the admin panel login (3 min)
Decap CMS needs a way to log you in and write to the repo:
1. In Netlify: **Site configuration → Identity → Enable Identity**.
2. Still in Identity settings: **Registration → Invite only** (so only you can sign up).
3. **Services → Git Gateway → Enable Git Gateway.**
4. **Identity → Invite users** → invite your own email. Accept the invite from your inbox and set a password.
5. Go to `https://your-site.netlify.app/admin` and log in. You're in the writing interface.

> Note: Netlify Identity + Git Gateway is the simplest zero-config login and works fine for a single-author site. If Netlify ever retires it, Decap's GitHub-backend login is the drop-in replacement (one line change in `src/admin/config.yml`).

### 4. Point your Spaceship domain (2 min + DNS wait)
1. In Netlify: **Domain management → Add a domain → abbasmerchant.co**.
2. Netlify shows you the DNS records. In Spaceship's DNS panel for abbasmerchant.co:
   - `A` record for `@` → `75.2.60.5` (Netlify's load balancer)
   - `CNAME` record for `www` → `your-site.netlify.app`
3. Back in Netlify, verify the domain and enable **HTTPS** (automatic Let's Encrypt cert).
4. DNS can take minutes to a few hours to propagate.

## Day-to-day publishing

1. Go to `abbasmerchant.co/admin` (bookmark it — works on your phone too).
2. **New Posts** → write, pick a category, add a cover image, set the excerpt.
3. Toggle **"Feature this post on the homepage"** if it should be the big top card.
4. **Publish.** Live in about a minute.

Drafts: the CMS has an editorial workflow (Drafts → In review → Ready) — save drafts without publishing.

## Editing the sample posts

The 8 posts in `src/posts/` are placeholders written to demo the design. Edit or delete them straight from the admin panel (they appear in the Posts list like anything else).

## Local development (optional)

```
npm install
npm start        # live-reloading dev server at localhost:8080
npm run build    # production build into _site/
```

## Changing the design

- All styling is one file: `src/css/style.css`. Colors and fonts are CSS variables at the top.
- Category names/blurbs: `src/_data/site.json` (and mirror any changes in `src/admin/config.yml` + `.eleventy.js` if you add/remove a category).
- Homepage layout: `src/index.njk`. Post layout: `src/_includes/layouts/post.njk`.

## Costs

- Netlify free tier: 100GB bandwidth/month, 300 build minutes/month — a personal blog uses a tiny fraction of both.
- GitHub: free.
- Only real cost: the domain you already own.

## Added in v1.1

- **Dark mode** — toggle in the header (◐). Follows system preference by default; a manual choice is remembered per device.
- **Search** — at `/search/`, powered by Pagefind. The index rebuilds automatically on every publish; posts and the About page are indexed, site chrome is not.
- **Attachments** — every post has an "Attachments (GPX, PDF, etc.)" field in the CMS. Add a label + file; they render as download buttons at the end of the post.
- **Pages** — a Pages section in the CMS, starting with About (served at `/about/`, linked in the nav and hero).
- **Identity redirect** — invite/recovery emails now land on `/admin` automatically.
