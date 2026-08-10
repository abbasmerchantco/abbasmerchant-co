# abbasmerchant.co — remediation brief

**For:** Claude Sonnet 5, fresh chat, working in this repo
**Repo:** `abbasmerchantco/abbasmerchant-co` (local clone at the workspace root)
**Written:** 10 Aug 2026

---

## 0. Read this first

You are working on a live personal website. It is an Eleventy 3 static site, built to
`_site/`, deployed to **Cloudflare Workers static assets** via Wrangler. The CMS is
**Decap CMS** at `/admin`, using the GitHub backend with a Cloudflare Worker as the OAuth
proxy. The site has **recently migrated off Netlify** — Netlify remnants are to be removed,
not preserved.

### Ground rules

1. **Do not touch the visual design.** `src/css/style.css` is deliberate and good. The only
   CSS change permitted in this brief is explicitly called out in Task 12, and it is
   additive. Do not restyle, do not "modernise", do not reformat the file.
2. **Do not rewrite prose.** `src/about.md` and `src/contact.md` contain the owner's own
   words in his own voice. Leave the copy alone unless a task says otherwise.
3. **Commit, do not push.** Make focused commits with clear messages as you complete each
   task group. Do **not** `git push`. The owner reviews the diff and pushes himself.
4. **Verify before you claim done.** Run `npm install && npm run build` and confirm the
   build succeeds and `_site/` contains what you expect. If your environment has no working
   shell, say so explicitly rather than asserting the build passes.
5. **If a task's premise turns out to be wrong** — the file already looks fixed, the bug
   doesn't reproduce, the fix would break something — stop and report it rather than forcing
   the change. Several of these findings were made by reading, not by running.

### Context you need

- **There are currently zero posts** in `src/posts/` (only `posts.json`, which is a
  directory data file, not a post). This is expected: the owner keeps everything in drafts.
  Decap's editorial workflow stores unpublished entries on branches named
  `cms/posts/<slug>`. **Run `git branch -r` early** and report whether `origin/cms/*`
  branches exist. If they don't, the drafts are somewhere else and the owner needs to know.
- Because there are no posts, several bugs below are currently **invisible**. They will
  surface the moment the first post publishes. Fix them anyway.
- The owner wants the editorial workflow **kept on**.

---

## PHASE 1 — Blockers

These prevent publishing. Do these first, commit them as their own commit, and tell the
owner as soon as they're done so he can start writing while you continue.

### Task 1 — Resolve the merge conflict in `src/admin/config.yml`

The file contains literal, committed conflict markers:

```yaml
  auth_endpoint: auth
<<<<<<< HEAD
=======
  squash_merges: true

publish_mode: editorial_workflow
>>>>>>> 00c504c08cdd31fa5ff87911990d7dc9fdf37f19
```

This is invalid YAML. Decap cannot parse it, so `/admin` is broken and the owner cannot
publish. **This is the single most urgent item in this document.**

**Resolve by keeping the incoming side.** The owner wants editorial workflow. The head of
the file should read exactly:

```yaml
backend:
  name: github
  repo: abbasmerchantco/abbasmerchant-co
  branch: main
  base_url: https://abbasmerchant-cms-auth.snowy-mud-4356.workers.dev
  auth_endpoint: auth
  squash_merges: true

publish_mode: editorial_workflow

media_folder: "src/images/uploads"
public_folder: "/images/uploads"
```

Leave the entire `collections:` block below it untouched.

**Then scan the whole repo for other conflict markers** — where there's one, there are often
more. Search for `<<<<<<<`, `=======` at line start, and `>>>>>>>` across all tracked files.
Report anything you find.

### Task 2 — Restore the category label data

`src/_data/categories.js` was deleted, and the two `addGlobalData` calls that exposed it were
dropped from `eleventy.config.js`. But `src/index.njk` (lines 45, 66) and
`src/_includes/layouts/post.njk` (line 5) still reference bare `CAT_LABELS` and `CAT_EMOJI`.

Both are undefined at build time. Consequences once a post exists:

- Category tags render as raw `musings` instead of `✍ Musings`
- Every card without a cover image shows the generic `📝` fallback instead of its category
  icon, and loses its per-category accent colour

The `CAT_LABELS` / `CAT_EMOJI` objects duplicated inside the `<script>` block in `base.njk`
are client-side only. They never touch these elements. They are not a substitute.

**Create `src/_data/categories.js`:**

```js
module.exports = {
  CAT_LABELS: {
    musings: '✍ Musings',
    learnings: '💡 Learnings',
    movies: '🎬 Movies',
    books: '📚 Books',
    photos: '📷 Photos',
    travel: '✈ Travel',
    mba: '🎓 MBA',
  },
  CAT_EMOJI: {
    musings: '✍️',
    learnings: '💡',
    movies: '🎬',
    books: '📚',
    photos: '📷',
    travel: '✈️',
    mba: '🎓',
  },
};
```

**And add to the top of the exported function in `eleventy.config.js`:**

```js
const categories = require("./src/_data/categories.js");
// ...inside module.exports = function(eleventyConfig) {
eleventyConfig.addGlobalData("CAT_LABELS", categories.CAT_LABELS);
eleventyConfig.addGlobalData("CAT_EMOJI", categories.CAT_EMOJI);
```

Both are needed: the `_data` file alone would only expose `categories.CAT_LABELS`, and the
templates use the bare name.

The seven category keys must stay exactly in sync across four places — this data file,
`src/admin/config.yml`, the `.cat-*` rules in `style.css` (lines 66–72), and the filter
buttons in `index.njk`. Verify all four agree. Note the labels here use `✍` and `✈` while
`config.yml` uses the emoji-variant `✍️` and `✈️`; that's cosmetic and only affects the CMS
dropdown, so leave both as they are.

**Commit Phase 1 separately** with a message like
`fix: resolve config.yml merge conflict, restore category data`.

---

## PHASE 2 — Remove Netlify

The site is on Cloudflare now. Every Netlify reference is either dead weight or actively
misleading.

### Task 3 — Strip the Netlify Identity widget from `base.njk`

Two removals in `src/_includes/layouts/base.njk`:

**Line 20 — delete entirely:**

```html
<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
```

**Lines 141–146 — delete entirely:**

```js
// Netlify Identity
if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', user => {
    if (!user) window.netlifyIdentity.on('login', () => { document.location.href = '/admin/'; });
  });
}
```

Auth is handled by the Cloudflare Worker OAuth proxy configured in `config.yml`. This widget
is a third-party script loaded on every page view of a privacy-conscious site, doing nothing.

Also fix the stray leading whitespace before `<!DOCTYPE html>` on line 1 of `base.njk` while
you're in the file — a document type declaration should be the first bytes of the response.

### Task 4 — Keep `src/_redirects`, but understand why

Do **not** delete this file. `_redirects` is Netlify syntax originally, but **Cloudflare
Workers static assets supports it too** — it is read from the assets directory at deploy
time. `eleventy.config.js` already passthrough-copies it to `_site/_redirects`.

It currently contains only comments, which is fine. Leave it.

**However:** the previous version of this site had nine posts at dated URLs
(`/posts/2026-06-28-planning-horizons/` etc.). Those are gone. If any were ever shared or
indexed, they now 404. Ask the owner whether he wants 301s added for the old Norden URL in
particular — it was the only real post, and it was `featured`. Don't guess; ask.

### Task 5 — Purge Netlify from the documentation

`README.md` and `UPGRADE.md` are both substantially wrong and will mislead the owner (or a
future agent) months from now.

**`UPGRADE.md` — delete it.** It documents a one-time migration to a v5 design that happened
long ago. Every instruction in it is obsolete. Keeping it around is worse than having no
docs, because it reads as current.

**`README.md` — rewrite it.** The current version describes a distributable zip, references
`src/posts/2026-07-09-sample-post.md` which does not exist, and states that auth is "Same
Identity/Git Gateway login as before". Replace with an accurate operator's README covering:

- **What this is** — personal site for abbasmerchant.co, Eleventy 3 static site
- **Architecture** — Eleventy builds `src/` → `_site/`; Cloudflare Workers serves `_site/`
  via the `assets` binding in `wrangler.jsonc`; Decap CMS at `/admin` writes markdown to
  `src/posts/` through the GitHub backend; the OAuth proxy is a separate Cloudflare Worker at
  `abbasmerchant-cms-auth.snowy-mud-4356.workers.dev`
- **Publishing** — go to `/admin`, write, save as draft (editorial workflow keeps unpublished
  entries on `cms/posts/*` branches), publish when ready; a merge to `main` triggers deploy
- **The `Write ✦` button** — hidden by default; visit `/?write=norden901` once per browser to
  reveal it. Note plainly that this is convenience, not security
- **Local dev** — `npm install`, `npm run dev`, `npm run build`, `npm run deploy`
- **Content model** — the seven categories and the four files that must stay in sync (see
  Task 2), plus the frontmatter fields: `title`, `customSlug`, `category`, `date`, `excerpt`,
  `readTime`, `featured`, `coverImage`, `attachments`
- **The `coverImage` gotcha** — templates read `coverImage`. Some older posts used `image`.
  If a cover doesn't render, check the key name
- **Analytics** — GoatCounter at `abbasmerchant.goatcounter.com`, no cookies, no banner needed
- **Costs** — domain only

Keep it tight and factual. No marketing tone. This is a maintenance document.

**Commit Phase 2** as `chore: remove Netlify remnants, rewrite docs for Cloudflare`.

---

## PHASE 3 — Make comments actually work

The owner wants comments fixed properly, not removed. As currently wired they would accept
submissions and **never display them**. There are three independent bugs; all three must be
fixed or comments still won't work.

### Task 6 — Bug A: Eleventy cannot read Staticman's YAML

`staticman.yml` sets `format: yaml`. **Eleventy does not parse YAML data files out of the
box** — its default data extensions are `.json`, `.js`, `.cjs`, `.mjs`. Every comment
Staticman commits would be invisible to the build.

Two ways out. **Take the first** — it avoids a dependency:

**In `staticman.yml`, change `format: yaml` to `format: json`.**

(The alternative is adding `js-yaml` and calling `eleventyConfig.addDataExtension("yml,yaml", ...)`.
Don't, unless the owner already has YAML comments committed that you'd be orphaning — check
`src/_data/comments/` for existing `.yml` files first. It currently holds only `.gitkeep`, so
JSON should be safe.)

### Task 7 — Bug B: Staticman isn't generating a date

`comment-display.njk` renders `{{ comment.date | readableDate }}`, but nothing guarantees a
`date` field exists. Staticman only generates fields you declare. Without this, every comment
timestamp renders as `Invalid Date`.

**Add to `staticman.yml`, inside the `comments:` block:**

```yaml
  generatedFields:
    date:
      type: date
      options:
        format: "iso8601"
```

ISO 8601 is what `readableDate` and `isoDate` both expect — they each do
`new Date(value)`.

### Task 8 — Bug C: the display template reads the wrong shape

`src/_includes/comment-display.njk` currently opens with:

```njk
{% if comments and comments.length %}
```

Staticman writes to `src/_data/comments/{slug}/comment-{timestamp}.json`. Eleventy walks
`_data` subdirectories and exposes that as a **nested object**:

```
comments = { "norden": { "comment-1754800000": {...}, ... }, "arrival": {...} }
```

An object has no `.length`, so the condition is always false. Worse: an *empty* object is
truthy in Nunjucks, so naive fixes like `{% if comments %}` will render an empty comments
section on every post. Handle this carefully.

**Add a filter to `eleventy.config.js`:**

```js
eleventyConfig.addFilter("commentsFor", (commentsData, slug) => {
  if (!commentsData || !slug) return [];
  const bucket = commentsData[slug];
  if (!bucket) return [];
  return Object.values(bucket)
    .filter(c => c && c.name && c.comment)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
});
```

**Rewrite `src/_includes/comment-display.njk`:**

```njk
{% set postComments = comments | commentsFor(postSlug) %}
{% if postComments.length %}
<div class="comments-section">
  <h3>Comments ({{ postComments.length }})</h3>
  <div class="comments-list">
    {% for comment in postComments %}
    <div class="comment">
      <div class="comment-header">
        <strong class="comment-name">{{ comment.name }}</strong>
        <time class="comment-date" datetime="{{ comment.date | isoDate }}">{{ comment.date | readableDate }}</time>
      </div>
      <div class="comment-body">
        {{ comment.comment }}
      </div>
    </div>
    {% endfor %}
  </div>
</div>
{% endif %}
```

Two notes:

- The old template did `{% for comment in comments | reverse %}`. The new filter sorts
  ascending by date, oldest first, which is the conventional reading order for a comment
  thread. Don't reverse it.
- `postSlug` is set in `post.njk` (line 32) before the include. Nunjucks `{% include %}`
  inherits the calling context, so this works — no change needed there. Verify it, don't
  assume it.
- `{{ comment.comment }}` is auto-escaped by Nunjucks. **Keep it that way.** Do not add
  `| safe`. This is untrusted reader input.

### Task 9 — Verify the Staticman prerequisites (report, don't fix)

Two things the owner must confirm outside the codebase. Check what you can, flag the rest:

1. **The Staticman GitHub app must be installed on the repo** with write access, or the API
   returns an error on every submission. This cannot be verified from the filesystem.
2. **The public `api.staticman.net` instance is unreliable.** It is community-run, heavily
   rate-limited, and has had extended outages. `moderation: true` means each comment opens a
   pull request rather than committing directly, which is the right setting — but it also
   means the owner merges a PR per comment.

Also note `reCaptcha.enabled: false`. With moderation on, spam reaches a PR queue rather than
the site, so this is defensible. Mention it; don't change it.

**Commit Phase 3** as `fix: repair Staticman comment pipeline (json format, generated date, data shape)`.

---

## PHASE 4 — Cheap wins

Small, high-leverage, none of them touch the design.

### Task 10 — Fix Cloudflare 404 handling

`src/404.md` builds to `_site/404.html`, but `wrangler.jsonc` never tells Workers to use it.
Unmatched paths currently return a bare Workers error page instead of the site's own 404.

**In `wrangler.jsonc`, extend the assets block:**

```jsonc
"assets": {
  "directory": "_site",
  "not_found_handling": "404-page"
}
```

Also consider dropping `"compatibility_flags": ["nodejs_compat"]` — there is no Worker script
here, only static assets, so the flag does nothing. Low confidence that it's harmless to
remove in all cases; flag it to the owner rather than removing it unilaterally.

### Task 11 — Add an RSS feed

There is no feed. For a site whose whole strategy is compounding readership, this is the
single highest-value missing piece: it's how the small number of people who will care most
about this site actually follow it.

**Add an `rfc822` filter to `eleventy.config.js`** (RSS requires RFC-822 dates, not ISO):

```js
eleventyConfig.addFilter("rfc822", (date) => new Date(date).toUTCString());
```

**Create `src/feed.njk`:**

```njk
---
permalink: /feed.xml
eleventyExcludeFromCollections: true
---
<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Abbas Merchant</title>
    <link>https://abbasmerchant.co/</link>
    <atom:link href="https://abbasmerchant.co/feed.xml" rel="self" type="application/rss+xml" />
    <description>A public record of everything I read, watch, think about, and experience.</description>
    <language>en-au</language>
{%- for post in collections.publishedPosts %}
    <item>
      <title>{{ post.data.title }}</title>
      <link>https://abbasmerchant.co{{ post.url }}</link>
      <guid isPermaLink="true">https://abbasmerchant.co{{ post.url }}</guid>
      <pubDate>{{ post.data.date | rfc822 }}</pubDate>
      {%- if post.data.excerpt %}
      <description>{{ post.data.excerpt }}</description>
      {%- endif %}
      <content:encoded><![CDATA[{{ post.templateContent | safe }}]]></content:encoded>
    </item>
{%- endfor %}
  </channel>
</rss>
```

**Important:** if you use `<content:encoded>` you must declare the namespace on the `<rss>`
element — add `xmlns:content="http://purl.org/rss/1.0/modules/content/"`. Do that, or drop
`content:encoded` and ship a description-only feed. Do not ship an undeclared namespace; it
produces an invalid feed that some readers reject outright.

Serve the **full post content**, not just the excerpt. Truncated feeds designed to force
clicks are a reader-hostile pattern and don't fit this site.

**Then add the discovery link to `<head>` in `base.njk`:**

```html
<link rel="alternate" type="application/rss+xml" title="Abbas Merchant" href="/feed.xml" />
```

**Validate the output.** Build, then check `_site/feed.xml` is well-formed XML. Post
`templateContent` containing raw `]]>` would break the CDATA block — unlikely, but if you can,
guard or at least note it.

### Task 12 — Add `robots.txt`

Eleventy won't copy a bare `.txt` from `src/`. Use a template with an explicit permalink.

**Create `src/robots.njk`:**

```njk
---
permalink: /robots.txt
eleventyExcludeFromCollections: true
---
User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://abbasmerchant.co/sitemap.xml
```

`src/admin/index.html` already carries `<meta name="robots" content="noindex">`, so this is
belt and braces. Both are worth having.

### Task 13 — Fix the `og:type` bug

`base.njk` line 12 reads:

```njk
<meta property="og:type" content="{% if layout %}article{% else %}website{% endif %}" />
```

Every page has a layout, including the homepage — so the homepage, About, and Contact all
declare themselves as articles to every social platform and crawler.

**Replace with:**

```njk
<meta property="og:type" content="{% if page.url.startsWith('/posts/') %}article{% else %}website{% endif %}" />
```

While in that block, also add `<meta property="og:url" content="https://abbasmerchant.co{{ page.url }}" />`
and `<meta name="twitter:card" content="{% if coverImage %}summary_large_image{% else %}summary{% endif %}" />`.
Both are one-liners and materially improve how shared links render.

### Task 14 — Add a `.gitignore`

There isn't one. `node_modules/` and `_site/` are one careless `git add -A` away from being
committed.

**Create `.gitignore`:**

```
node_modules/
_site/
.wrangler/
.DS_Store
*.log
.env
.dev.vars
```

`.dev.vars` matters — that's where Wrangler keeps local secrets.

### Task 15 — Delete the duplicate SEO checker

`src/seo-checker.js` and `src/admin/seo-checker.js` are near-identical. Only the `admin/` copy
is loaded (by `src/admin/index.html`). The root copy isn't processed or copied by Eleventy, so
it does nothing — but it's a trap for whoever next edits "the SEO checker" and wonders why
nothing changed.

**Diff the two first.** If the root copy has content the admin one lacks, port it across, then
delete `src/seo-checker.js`. If they match, just delete it.

### Task 16 — Add the missing `dev` script

`package.json` has `build` and `deploy` but no `dev`, despite the README referencing
`npm run dev`.

```json
"scripts": {
  "build": "eleventy",
  "dev": "eleventy --serve",
  "deploy": "eleventy && wrangler deploy"
}
```

**Commit Phase 4** as `feat: RSS feed, robots.txt, 404 handling, OG metadata, gitignore`.

---

## PHASE 5 — Verify

Do not skip this, and do not report success without doing it.

1. **`npm install && npm run build`.** The build must complete with no errors. Note any
   warnings.
2. **Inspect `_site/`.** Confirm these exist and are well-formed: `index.html`, `about/index.html`,
   `contact/index.html`, `404.html`, `sitemap.xml`, `feed.xml`, `robots.txt`, `css/style.css`,
   `admin/index.html`, `_redirects`.
3. **Validate the XML.** `sitemap.xml` and `feed.xml` must parse. Actually parse them —
   `python3 -c "import xml.dom.minidom,sys; xml.dom.minidom.parse(sys.argv[1])" _site/feed.xml`
   or equivalent.
4. **Validate the YAML.** `src/admin/config.yml` and `staticman.yml` must both parse cleanly.
   This is the whole point of Task 1 — prove it.
5. **Grep for regressions.** No remaining matches for `netlify` (case-insensitive) anywhere in
   `src/`, and no conflict markers anywhere in the repo.
6. **Smoke-test with real content.** Create a throwaway post at
   `src/posts/_verify-delete-me.md` with a category, an excerpt, a `customSlug`, and no cover
   image. Rebuild. Confirm: it appears on the homepage feed; its card shows the correct
   category label *with emoji* and the correct accent colour; the fallback icon is the
   category emoji not `📝`; it resolves at `/posts/<customSlug>/`; it appears in `sitemap.xml`
   and `feed.xml`; its page renders no empty comments section. **Then delete the file and
   rebuild.** Do not commit it.
7. **`npm run dev`** and load `http://localhost:8080` if your environment allows it. Check the
   console for errors — particularly that removing the Netlify widget didn't break the theme
   toggle or the search filter, which live in the same `<script>` block.

---

## Deliverable

When finished, report back with:

- **A commit-by-commit summary** — what changed and why, one or two lines each
- **The `git branch -r` result** — do `origin/cms/*` draft branches exist?
- **Anything you could not verify** — especially if you had no working shell. Say so plainly;
  do not paper over it
- **Anything you found that isn't in this brief.** This document was written from reading the
  code, not running it. Assume it has gaps
- **The two open questions for the owner:** whether to add 301s for the old dated post URLs
  (Task 4), and whether to drop `nodejs_compat` from `wrangler.jsonc` (Task 10)

**Do not push.** Leave the commits local for review.

---

## Explicitly out of scope

Don't do these, even if tempting:

- Category archive pages (`/movies/`, `/books/`, …). Worth doing, discussed separately, not now
- Any redesign, restyle, or CSS reorganisation
- Rewriting About or Contact copy
- Changing `readableDate`'s format (it currently includes the weekday — "Mon, 10 Aug 2026" —
  which is arguably noisy on cards, but that's an editorial call the owner hasn't made)
- Adding a newsletter, analytics beyond GoatCounter, or any third-party script
- Touching `src/admin/seo-checker.js`'s checking logic — it carries a comment warning that a
  previous rewrite silently broke the whole CMS preview. Leave it alone
- Restoring the eight deleted sample posts. They were placeholders and they're gone on purpose
