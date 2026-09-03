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
npx @tinacms/cli@latest init      # adds TINA_CLIENT_ID / TINA_TOKEN
npx tinacms dev -c "node build.js"
```

Kelly edits at `/admin`, Tina commits markdown, `build.js` regenerates the blog
index and post pages. Adding a `.md` file is all it takes to publish a post.

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

## Open items

- **Contact form** — `action="#"`. Needs Formspree, Cloudflare, or EmailJS.
- **Documents** — HIPAA notice and ROI are live. Safety Plan generator is built
  in-page; swap in Kelly's own HTML if he prefers it.
- **Supervision rate** — "Rate on request" until Kelly sets a number.
- **Analytics / Search Console** — IDs to be added at launch.
- **DNS** — point A/CNAME at the host, leave MX untouched.

## QA

Verified at 1280px and 390px across all 17 pages: every internal link resolves,
one H1 per page, valid JSON-LD, no horizontal overflow, no JS errors.
Safety Plan prints to a single clean page.
