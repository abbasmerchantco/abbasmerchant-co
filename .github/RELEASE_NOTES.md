# Release Notes

Chronological log of the Cloudflare migration cleanup and CMS repair work, based on
`FIX-BRIEF.md` and the sessions that followed it. Newest first.

---

## 2026-08-10 — Draft sharing safety net

**Added**

- `noindex, nofollow` robots meta tag on any page with `published: false`, so unlisted
  draft URLs shared with friends don't get indexed if a link ever leaks publicly.

**Context:** Eleventy builds a page for every file in `src/posts/`, regardless of the
`published` flag — only the homepage feed, RSS, and sitemap filter it out via the
`publishedPosts` collection. That means draft posts already have working, shareable
URLs (e.g. `/posts/norden-easter/`) without any extra config. This is a safety net on
top of that, not a new sharing mechanism.

---

## 2026-08-10 — CMS list view status indicator

**Added** (`src/admin/config.yml`)

- `summary` template using Decap's `ternary()` filter: each entry in the Posts list now
  reads `📝 Draft — <title>` or `✅ Published — <title>`.
- `view_filters` — one-click "Drafts" / "Published" filter buttons above the entry list.
- `view_groups` — entries grouped by publish status.

No more opening an entry just to check whether it's live.

---

## 2026-08-10 — Recovered 7 stuck drafts, switched to simple workflow

**Root cause found:** the site was live on `abbasmerchant.co/admin`, but the editorial
workflow board showed zero drafts despite 7 real draft branches
(`cms/posts/*`) existing on GitHub with content. Investigation of the PRs (#7, #8, #9,
#17, #18, #24, #27) showed all of them had been silently **closed** — almost certainly
because `config.yml` was unparseable (see Phase 1 below) at the time GitHub evaluated
them. Decap's editorial workflow board only lists entries with an *open* PR, so closed
PRs are invisible even though the branch and commit still exist.

**Decided:** move off editorial workflow (branches + PRs) entirely, since it has this
single point of failure. Switched to Decap's `simple` publish mode instead.

**Changed** (`src/admin/config.yml`)

- `publish_mode: editorial_workflow` → `publish_mode: simple`
- Added a `published` boolean field (default `true`) to the Posts collection — the
  build already supported `post.data.published !== false` filtering in
  `eleventy.config.js`, `feed.xml`, and `sitemap.xml`, so no template changes were
  needed to make this work.

**Recovered** — pulled all 7 stuck posts out of their closed-PR diffs and committed
them as real files in `src/posts/`, each with `published: false`:

- `2026-02-15-frameworks-musing.md`
- `2026-03-08-two-hour-party.md`
- `2026-03-22-winter-light.md`
- `2026-04-05-norden-easter.md`
- `2026-05-18-novelty.md`
- `2026-05-30-arrival.md`
- `2026-06-14-never-split-the-difference.md`

**Flagged for review, not fixed automatically:**

- The Norden post's title had a stray `!! Check this out!` suffix that reads like an
  accidental edit, not the owner's voice.
- 6 of the 7 posts use an `image` frontmatter key instead of `coverImage` — the
  templates only read `coverImage`, so those will show the category emoji fallback
  instead of their (placeholder) cover art.
- Every recovered post still contains the boilerplate line
  `*(Sample post — replace me from the admin panel.)*` in the body — left in
  deliberately rather than silently edited, since it wasn't clear whether these posts
  are the owner's real drafts or auto-generated seed content per category.
- 4 stray duplicate branches (`cms_<timestamp>/posts/...`) with zero open PRs were
  identified as likely leftovers from failed publish attempts while `config.yml` was
  broken. Safe to delete from GitHub's branch UI; not deleted automatically (no
  write access to GitHub from this session).

---

## 2026-08-10 — v5.2: Cloudflare migration remediation

Full pass over `FIX-BRIEF.md`, a remediation brief written after the site moved off
Netlify onto Cloudflare Workers static assets. Shipped as v5.2, deployed, and
confirmed `/admin` working end-to-end (GitHub OAuth via the Cloudflare Worker proxy).

### Phase 1 — Blockers

- **Fixed:** `src/admin/config.yml` had committed, unresolved merge conflict markers,
  which made the file invalid YAML and broke `/admin` entirely. Resolved to the
  editorial-workflow side (later superseded — see above). Scanned the whole repo for
  other conflict markers; found none.
- **Fixed:** `src/_data/categories.js` had been deleted along with the
  `addGlobalData` calls that exposed `CAT_LABELS`/`CAT_EMOJI` to templates, so category
  tags and accent colors were silently broken. Recreated the data file and wired it
  back into `eleventy.config.js`. Verified all four places that must agree on the 7
  category keys (data file, `config.yml`, `style.css`, `index.njk`) were in sync.

### Phase 2 — Netlify removal

- Removed the Netlify Identity widget script and its dead JS handler from `base.njk`
  (auth is handled entirely by the Cloudflare Worker OAuth proxy now).
- Fixed stray whitespace before `<!DOCTYPE html>`.
- Confirmed `src/_redirects` should be kept — Cloudflare Workers static assets reads
  the same `_redirects` syntax Netlify used.
- Deleted `UPGRADE.md` (documented an obsolete one-time migration).
- Rewrote `README.md` from scratch as an accurate operator's doc: architecture,
  publishing flow, the hidden `Write ✦` button, local dev commands, the content model
  and its 4-places-must-agree category rule, the `coverImage` vs `image` frontmatter
  gotcha, analytics, and costs.

### Phase 3 — Staticman comments

Three independent bugs were preventing submitted comments from ever displaying:

- **Bug A:** `staticman.yml` was set to `format: yaml`, but Eleventy doesn't parse YAML
  data files by default. Switched to `format: json`.
- **Bug B:** Staticman wasn't configured to generate a `date` field, so every comment
  timestamp rendered as `Invalid Date`. Added `generatedFields.date` with `iso8601`
  format.
- **Bug C:** `comment-display.njk` checked `comments.length`, but Eleventy exposes
  `_data/comments/` as a nested object (`{ slug: { commentId: {...} } }`), which has no
  `.length` — the comments section never rendered. Added a `commentsFor` Eleventy
  filter that safely extracts, filters, and sorts a single post's comments, and
  rewrote the template around it.
- Verified `postSlug` is correctly set in `post.njk` before the comment includes.

### Phase 4 — Cheap wins

- `wrangler.jsonc`: added `not_found_handling: "404-page"` so Cloudflare serves the
  site's real 404 page instead of a bare Workers error page.
- Added `src/feed.njk` — a full-content RSS feed (not just excerpts), with correctly
  declared `content:encoded` namespace and a `safeCdata` filter guarding against stray
  `]]>` sequences breaking the CDATA block.
- Added `src/robots.njk` (Eleventy doesn't passthrough bare `.txt` files, so this uses
  an explicit `permalink`).
- Fixed `og:type`: previously every page (including the homepage) declared itself an
  `article` because the check was `{% if layout %}`, which is true everywhere. Now
  checks `page.url.startsWith('/posts/')`. Also added `og:url` and a conditional
  `twitter:card`.
- Added `.gitignore` (`node_modules/`, `_site/`, `.wrangler/`, `.dev.vars`, etc.) —
  none of this had ever been ignored.
- Diffed `src/seo-checker.js` against the actually-loaded `src/admin/seo-checker.js`.
  The root copy had more logic (read-time check, title/excerpt overlap check,
  date/cover-image preview), but `src/admin/seo-checker.js` carries an explicit
  warning that a more elaborate version previously broke the CMS preview silently —
  and the brief marks its checking logic as out of scope. Deleted the unused root
  duplicate without porting the extra logic across.
- Added the missing `"dev": "eleventy --serve"` script to `package.json`.

### Verification note

This session's sandbox shell was unavailable (`HYPERVISOR_VIRT_DISABLED`) for most of
this work, so `npm install`, `npm run build`, XML/YAML validation, and all git commits
were done by the owner directly rather than by the agent. All file-level changes were
made directly against the working tree via file read/write tools.

### Open items handed back to the owner

- **301 redirects for old dated post URLs** (e.g. the original Norden post URL) — owner
  approved adding these, but the exact old slugs couldn't be determined without
  `git log` access. A TODO placeholder was left in `src/_redirects`.
- **`nodejs_compat` compatibility flag** in `wrangler.jsonc` — flagged as doing nothing
  (no Worker script, only static assets) but left in place per owner's choice.
- **4 stray duplicate CMS branches** — see the entry above.
