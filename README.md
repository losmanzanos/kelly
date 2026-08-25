# Cool Bird Counseling — static site build

Built from the template at `419626.us20.myftpupload.com`, with design tokens lifted
directly from that build and copy updated against the live `coolbirdcounseling.com`.

## Files

```
index.html        Home
about.html        Kelly's bio, approach, credentials
services.html     Four services, rates, insurance, what to expect
documents.html    Client paperwork index (placeholder links)
resources.html    Crisis lines, recovery support, coverage, learning
contact.html      Contact details + form
assets/styles.css Single shared stylesheet
build.js          Optional generator — regenerates all six pages from one template
```

No build step is required to deploy. `build.js` exists so the header, footer, nav,
and contact form only live in one place; run `node build.js` after editing it to
regenerate the HTML.

## Design tokens (pulled from the original build)

| Token | Value | Used for |
|---|---|---|
| `--cream` | `#f8f7f6` | page ground |
| `--ink` | `#383d39` | headings, nav |
| `--body` | `#4a4f4a` | body copy, footer ground |
| `--sage` | `#617061` | primary button, prices |
| `--mint` | `#87b6a5` | logo circle, hairlines |
| `--terracotta` | `#b25d2d` | form submit |

Type: **Brygada 1918** (serif — display and body) and **Outfit** (sans — nav, buttons,
eyebrows). Both are free Google Fonts, loaded from the CDN. Corner radius is 0
throughout, matching the original.

## Assets

All six are the real files, pulled from the original build — no placeholders, no
substitutes.

| File | Size | Where it's used |
|---|---|---|
| `cbc-logo.svg` | 166×70 | Header lockup |
| `cbc-logo-rev.svg` | 166×70 | Footer lockup (reversed/white) |
| `hero-couch.webp` | 1920×699 | Home hero, flush to the bottom edge |
| `kelly-faus.webp` | 900×900 | Circular portrait on Home and About |
| `shadow-bg.webp` | 1920×1104 | Leaf-shadow texture behind the bio section |
| `topographic-map.webp` | 1921×800 | Contour texture behind the services grid |

The hero's background colour is `#d5d8d2`, sampled from the photo's own wall, so the
join above the image is invisible. The couch begins 32.6% down the photo, which is why
the hero carries `padding-bottom: 27vw` — copy never lands on the cushions at any width.

WebP is used as-is from the original. If you need broader legacy support, generate JPEG
siblings and add them as `image-set()` fallbacks.

## Still to confirm with Kelly

- **Couples counseling — $150.** The old template said $75; the live site doesn't list
  couples at all. Scaled from the individual-rate change ($50 → $100). Verify.
- **Clinical supervision rate.** Left as "Rate on request" rather than invented.
- **Documents page.** All seven items are placeholders tagged "Coming soon." Real PDFs
  need to come from Kelly, or from whatever EHR/portal he uses.
- **Contact form.** `action="#"` — needs wiring to Formspree, Netlify Forms, or the host's
  handler. Note that a plain form is not HIPAA-safe; the copy already tells clients not to
  put clinical detail in it, but worth a conversation about a secure intake link instead.
- **Scheduling buttons.** All point at `contact.html`. If he uses SonderMind or another
  booking link, swap the hrefs.
- **Pronouns.** Everything uses he/him, consistent with the original bio.
- **Asset licensing.** The couch and texture images came from the template build — worth
  confirming with Kelly's sister that they're licensed for the live site, not comps.

## Accessibility / QA notes

Verified at 1280px and 390px: no horizontal overflow on any page, every internal link
resolves, mobile nav expands, skip link present, all form inputs labelled, focus states
on nav and inputs, every image loads. Colour pairings meet WCAG AA for body text.

`preview-home.html` is a standalone copy of the home page with the CSS and all six images
inlined as data URIs — open it anywhere, no folder required.
