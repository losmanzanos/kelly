# Cool Bird Counseling — static site

Hand-coded static build. No framework, no build step required to deploy —
`node build.js` regenerates every page from one template.

## Pages (17)

Home · About · Services · Documents · Resources · Blog · Contact
Service detail: Individual Psychotherapy · Assessment · Clinical Supervision
Also: FAQ · Safety Plan generator · Privacy Policy · Terms · 404 · 2 blog posts

## Generated on every build

| File | Purpose |
|---|---|
| `sitemap.xml` | All 17 URLs, priority-weighted |
| `robots.txt` | Explicitly allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended |
| `llms.txt` | Structured practice summary for AI search |
| `_redirects` | Cloudflare Pages 301s from every old Google Sites URL + `/*` → 404 |
| `404.html` | Branded, links to every section |

## Blog / TinaCMS

Posts are markdown in `content/posts/` with frontmatter. `tina/config.js` is
configured against that collection. To enable editing:

```
npm install
npx tinacms build        # reads .env, writes tina-lock.json + admin/
git add tina-lock.json && git commit -m "Tina lock" && git push
```

`.env` (gitignored) holds `TINA_CLIENT_ID` and `TINA_TOKEN`. `tina-lock.json`
**must** be committed — TinaCloud reads it from the repo to index content.
`admin/` is gitignored because the deploy regenerates it.

Kelly edits at `/admin`, Tina commits markdown, `build.js` regenerates the blog
index and post pages.

**Publish / unpublish.** Each post carries a `published` boolean, exposed in
Tina as a toggle. Turning it off drops the post from the blog index and the
sitemap *and deletes the generated `blog-<slug>.html`* — without that last part
the stale page stays deployed as a live orphan URL. Posts with no `published`
field are treated as published. `/admin` is `noindex` in both `robots.txt` and
`_headers`.

## SEO / schema

Every page carries a unique title (all ≤65 chars), unique meta description,
canonical URL, OpenGraph tags, and JSON-LD. The graph always includes
`MedicalBusiness` + `Person`; pages add `Service`, `FAQPage`, `Blog`, or
`BlogPosting` as appropriate.

## Design tokens

Original five: cream `#f8f7f6` · ink `#383d39` · body `#4a4f4a` ·
sage `#617061` · mint `#87b6a5` · terracotta `#b25d2d`.

Colorado extension: spruce `#2f4038` · sandstone `#c08b62` ·
aspen `#d2a03f` · sky `#cfdde0` · alpine `#a8c4b8`.

Brygada 1918 + Outfit. Radius 0.

Photography (Pexels license, free for commercial use, no attribution required):

| File | Where |
|---|---|
| `co-peaks.webp` | Home statement band (86% spruce overlay) + Assessment banner |
| `co-valley.webp` | Slim strip above the footer, sitewide |
| `co-basin.webp` | Strip under the About page header |
| `co-trail.webp` | Supervision banner + "First session" post header |
| `co-aspen.webp` | "Harm reduction" post header |
| `co-pines.webp` | Individual Psychotherapy banner |

All 2000×1125 WebP, ~300-400KB each. Every use is heavily overlaid or
short-height so type stays dominant. Blog post headers come from a `hero` field
in the markdown frontmatter, so Kelly can change a post's image by editing one
line in Tina. Service banners are set via `banner:` on the page config.
`.photostrip + section` / `.banner + section` guarantee breathing room after any
photo band. Service cards take a coloured top rule
(sandstone / alpine / aspen / sage). Homepage FAQ uses native `<details>` — no
JavaScript.

Hero background is `#d5d8d2`, sampled from the couch photo's wall so the join is
invisible; the couch starts 32.6% down the image, hence `padding-bottom: 27vw`.
Under 820px the hero claims `calc(100svh - 5rem - 1px)` (the header's exact
height) and scales the couch to `140% auto` so it anchors the fold flush to the
bottom with no gap.

## Contact form

`functions/api/contact.js` is a Cloudflare Pages Function posting to Resend.
Env vars (Pages → Settings → Variables):

| Var | Value |
|---|---|
| `RESEND_API_KEY` | secret |
| `FROM_EMAIL` | `website@notify.coolbirdcounseling.com` |
| `TO_EMAIL` | `kelly@coolbirdcounseling.com` |
| `TURNSTILE_SECRET` | optional; enables spam check when present |

Sending domain is `notify.coolbirdcounseling.com` — a subdomain so its DKIM/SPF
records can never collide with the Google Workspace records on the apex.
Verified in Resend. Pages Functions bind env vars **per deployment**, so a
variable change needs a redeploy to take effect.

## Icons / social

`favicon.ico` (16/32/48), `assets/favicon.svg`, `assets/apple-touch-icon.png`
(180), `assets/icon-192.png`, `assets/icon-512.png`, `site.webmanifest`.
Bird mark reversed out of spruce `#2f4038` — solid rather than the translucent
mint circle, which turns to mush at 16px. `assets/og-card.jpg` is the 1200×630
share card referenced by `og:image` and `twitter:image` on every page.

## Open items

- **Tina `/admin`** — needs `TINA_CLIENT_ID` + `TINA_TOKEN` in Pages, the build
  command switched to `npm run build:cms`, and `tina-lock.json` committed.
  See "Blog / TinaCMS" above.
- **Supervision rate** — "Rate on request" until Kelly sets a number.
- **Analytics / Search Console** — set `GA_ID` as a build variable to switch
  analytics on. Verify Search Console with the HTML-file method, not DNS, so it
  needs nothing from Kelly.

## QA

Verified at 1280px and 390px across all 17 pages: every internal link resolves,
one H1 per page, valid JSON-LD, no horizontal overflow, no JS errors.
Safety Plan prints to a single clean page.
