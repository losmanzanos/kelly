/* Static site generator for Cool Bird Counseling.
   Run: node build.js   →   writes index.html, about.html, services.html,
   documents.html, resources.html, contact.html next to /assets. */

const fs = require('fs');
const path = require('path');
const OUT = __dirname;

const BIRD = "M38.58 62.8C38.79 61.92 38.96 61.22 39.14 60.52C40.16 56.44 39.85 51.59 43.81 48.76C45.15 49.29 46.2 49.41 46.2 49.41C46.2 49.41 48.3 46.06 48.46 39.85C48.52 37.37 47.81 35.23 46.93 33.56C45.34 30.06 42.05 27.2 42.8 22.9C43.34 19.77 44.22 16.74 47.31 15.02C49.23 13.96 51.14 12.86 53.11 11.74C52.87 10.87 52.08 10.83 51.38 10.85C48.01 10.9 44.62 11.28 41.26 11.04C37.47 10.77 35.54 12.82 34.46 15.87C33.39 18.87 33.28 22.31 31.8 25.04C29.54 29.2 25.92 32.48 23.23 36.46C20.18 40.97 18.08 45.98 15.44 50.67C13.08 54.85 11.52 59.57 8.81 64.21H0C0 64.48 0 64.75 0 65.03H8.71C6.93 66.01 6.98 66.97 6.8 67.97C7.15 68.11 7.5 68.25 7.95 68.44C8.02 68.84 8.1 69.29 8.22 70C8.64 69.73 9.09 69.61 9.23 69.33C10.48 66.83 12.77 65.43 15.24 65.17C20.72 64.6 26.27 64.43 31.8 64.36C40.55 64.26 37.66 64.24 41.11 64.29C45.96 64.36 50.81 64.71 55.66 64.93C48.73 62.97 46.88 62.66 38.58 62.8H38.58ZM20.69 63.5H16.58C17.69 62.8 18.49 62.3 19.26 61.81C20.06 62.19 20.81 62.43 20.69 63.5ZM35.9 62.73C31.9 62.94 27.63 63.16 23.34 63.38C22.5 57.87 26.96 57.75 30.09 56.7C35.57 54.85 37.1 57.59 35.9 62.73Z";

/* The real wordmark lockups pulled from the original build.
   cbc-logo.svg is the dark version; cbc-logo-rev.svg is the reversed (white) one. */
const mark = (variant) =>
  `<img src="assets/cbc-logo${variant === 'light' ? '-rev' : ''}.svg" width="166" height="70"
        alt="Cool Bird Counseling — a peaceful bird on a branch with a soft green circle behind it">`;

const SITE = 'https://www.coolbirdcounseling.com';

/* Set GA_ID in the Cloudflare Pages build environment to switch analytics on.
   Absent = no script, no cookie banner needed. */
const GA_ID = process.env.GA_ID || '';
const analytics = GA_ID ? `
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA_ID}', { anonymize_ip: true });
</script>` : '';

const NAV = [
  ['index.html',     'Home'],
  ['about.html',     'About'],
  ['services.html',  'Services'],
  ['documents.html', 'Documents'],
  ['resources.html', 'Resources'],
  ['blog.html',      'Blog'],
  ['contact.html',   'Contact'],
];

const FOOTER_EXTRA = [
  ['faq.html',           'FAQ'],
  ['safety-plan.html',   'Safety Plan'],
  ['privacy-policy.html','Privacy Policy'],
  ['terms.html',         'Terms'],
];

/* ---- JSON-LD ---------------------------------------------------------- */
const ORG = {
  '@type': 'MedicalBusiness',
  '@id': SITE + '/#practice',
  name: 'Cool Bird Counseling LLC',
  url: SITE,
  email: 'kelly@coolbirdcounseling.com',
  telephone: '+1-303-351-1068',
  priceRange: '$100-$150',
  areaServed: { '@type': 'State', name: 'Colorado' },
  availableService: ['Addiction counseling', 'Mental health therapy', 'Grief counseling',
                     'Substance use assessment', 'Clinical supervision'],
  founder: { '@id': SITE + '/#kelly' },
};
const PERSON = {
  '@type': 'Person',
  '@id': SITE + '/#kelly',
  name: 'Kelly R. Faus',
  honorificSuffix: 'MA, LPC, LAC',
  jobTitle: 'Licensed Professional Counselor, Licensed Addiction Counselor',
  email: 'kelly@coolbirdcounseling.com',
  telephone: '+1-303-351-1068',
  worksFor: { '@id': SITE + '/#practice' },
  alumniOf: ['Adams State University', 'University of Northern Colorado'],
};
const ld = (extra) => JSON.stringify({ '@context': 'https://schema.org', '@graph': [ORG, PERSON].concat(extra || []) });




const logo = (variant) => `<a class="logo" href="index.html">${mark(variant)}</a>`;

const header = (current) => `<header class="site-header">
  <div class="wrap site-header__inner">
    ${logo('dark')}
    <input class="nav-toggle" type="checkbox" id="nav-toggle" aria-label="Toggle navigation">
    <label class="nav-toggle__btn" for="nav-toggle" aria-label="Toggle navigation">
      <svg width="26" height="18" viewBox="0 0 26 18" fill="none" aria-hidden="true">
        <path d="M0 1h26M0 9h26M0 17h26" stroke="currentColor" stroke-width="1.6"/>
      </svg>
    </label>
    <nav class="nav" aria-label="Main">
      <ul>
        ${NAV.map(([href, label]) =>
          `<li><a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a></li>`
        ).join('\n        ')}
      </ul>
    </nav>
  </div>
</header>`;

const footer = `<div class="photostrip photostrip--valley" role="img" aria-label="A green alpine valley in the Colorado Rockies"></div>
<footer class="site-footer">
  <div class="wrap">
    ${logo('light')}
    <nav aria-label="Footer">
      <ul>
        ${NAV.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('\n        ')}
      </ul>
    </nav>
    <nav aria-label="More">
      <ul style="margin-bottom:1.5rem;font-size:.875rem;opacity:.85">
        ${FOOTER_EXTRA.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join('\n        ')}
      </ul>
    </nav>
    <p class="site-footer__meta">&copy; ${new Date().getFullYear()} Cool Bird Counseling LLC &middot; Telehealth throughout Colorado</p>
    <p class="site-footer__crisis">
      In crisis? Call or text <a href="tel:988">988</a> &mdash; the Suicide &amp; Crisis Lifeline, answered
      24/7 in Colorado. If you are in immediate danger, call <a href="tel:911">911</a>.
      This website is not a crisis service and messages are not monitored around the clock.
    </p>
  </div>
</footer>`;

const bannerHtml = (cls, alt) => cls
  ? `<div class="banner banner--${cls}" role="img" aria-label="${alt || ''}"></div>\n`
  : '';

const page = ({ file, title, description, body, schema, banner, bannerAlt }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="${/^blog-/.test(file) ? 'article' : 'website'}">
<meta property="og:url" content="${SITE}/${file === 'index.html' ? '' : file.replace(/\.html$/, '')}">
<meta property="og:site_name" content="Cool Bird Counseling">
<meta property="og:locale" content="en_US">
<meta property="og:image" content="${SITE}/assets/og-card.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:alt" content="Cool Bird Counseling — addiction and mental health counseling, telehealth throughout Colorado">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${SITE}/assets/og-card.jpg">
<meta name="twitter:image:alt" content="Cool Bird Counseling — telehealth counseling throughout Colorado">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta name="geo.region" content="US-CO">
<meta name="geo.placename" content="Colorado">
<meta name="author" content="Kelly R. Faus, MA, LPC, LAC">
<meta name="theme-color" content="#2f4038">
<link rel="canonical" href="${SITE}/${file === 'index.html' ? '' : file.replace(/\.html$/, '')}">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<script type="application/ld+json">${ld(schema)}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Brygada+1918:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600;1,700&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/styles.css">${analytics}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${header(file)}
<main id="main">
${banner ? body.replace('</section>', '</section>\n\n  ' + bannerHtml(banner, bannerAlt)) : body}
</main>
${footer}
<script>
(function () {
  var f = document.getElementById('contactForm');
  if (!f) return;
  var btn = f.querySelector('button[type=submit]');
  var status = f.querySelector('.form__status');
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form__status';
    status.textContent = '';
    if (!f.name.value.trim() || !f.email.value.trim() || !f.message.value.trim()) {
      status.className = 'form__status is-error';
      status.textContent = 'Please add your name, email, and a short message.';
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Sending…';
    fetch(f.action, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(f)))
    })
      .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
      .then(function (d) {
        if (d && d.ok) {
          f.querySelector('.form__row').style.display = 'none';
          f.phone.style.display = 'none';
          f.message.style.display = 'none';
          f.querySelector('.hp').style.display = 'none';
          btn.style.display = 'none';
          status.className = 'form__status is-ok';
          status.textContent = 'Thank you — your message is on its way. I reply within one business day.';
        } else {
          throw new Error((d && d.error) || 'send failed');
        }
      })
      .catch(function (err) {
        btn.disabled = false;
        btn.textContent = btn.getAttribute('data-label') || 'Send';
        status.className = 'form__status is-error';
        status.textContent = (err && err.message && err.message !== 'send failed')
          ? err.message
          : 'Something went wrong. Please email kelly@coolbirdcounseling.com directly.';
      });
  });
})();
</script>
</body>
</html>
`;

/* ---------- reusable blocks -------------------------------------------- */

const contactForm = (heading, blurb) => `
  <section class="section" id="contact-form">
    <div class="wrap center">
      <h2>${heading}</h2>
      <p class="narrow">${blurb}</p>
      <form class="form" id="contactForm" style="margin-top:2.5rem" method="post" action="/api/contact" novalidate>
        <div class="form__row">
          <label class="sr-only" for="cf-name">Name</label>
          <input id="cf-name" type="text" name="name" placeholder="Name" autocomplete="name" required>
          <label class="sr-only" for="cf-email">Email address</label>
          <input id="cf-email" type="email" name="email" placeholder="Email Address" autocomplete="email" required>
        </div>
        <label class="sr-only" for="cf-phone">Phone number (optional)</label>
        <input id="cf-phone" type="tel" name="phone" placeholder="Phone (optional)" autocomplete="tel">
        <label class="sr-only" for="cf-message">Message</label>
        <textarea id="cf-message" name="message" placeholder="What brings you here? A sentence or two is plenty." required></textarea>
        <div class="hp" aria-hidden="true">
          <label>Company<input type="text" name="company" tabindex="-1" autocomplete="off"></label>
        </div>
        <button class="btn btn--terracotta" type="submit" data-label="Send">Send</button>
        <p class="form__status" role="status" aria-live="polite"></p>
        <p class="form__note">
          Your privacy and safety are my top concerns. Your information will never be shared or sold.
          Please don't include sensitive clinical details in this form &mdash; we'll cover those securely
          once we connect.
        </p>
      </form>
    </div>
  </section>`;

/* ---------- pages -------------------------------------------------------- */

const pages = [];

/* ============================== HOME ==================================== */
pages.push({
  file: 'index.html',
  title: 'Addiction & Mental Health Counseling in Colorado | Cool Bird',
  description: 'Confidential addiction counseling, grief support, and mental health therapy for adults and teens across Colorado. Telehealth with Kelly Faus, MA, LPC, LAC.',
  body: `
  <section class="hero">
    <div class="wrap hero__inner">
      <h1>Let&rsquo;s talk about it.</h1>
      <p>
        Cool Bird Counseling is a quiet retreat to help you overcome adversity and find meaning.
        I offer counseling and assessment for addiction and mental health across Colorado &mdash;
        all by secure video, wherever you are. The first step is the hardest; luckily, help is
        always just a click away whenever you&rsquo;re ready.
      </p>
      <a class="btn btn--solid" href="contact.html">Get Started</a>
    </div>
  </section>


  <section class="section section--tint" style="padding-top:clamp(2rem,4vw,3rem)">
    <div class="wrap center">
      <p class="eyebrow">Same-week openings available</p>
      <div class="grid grid--3" style="margin-top:1.5rem">
        <div><h3>Licensed statewide</h3><p>LPC and LAC in Colorado, seeing clients from Denver to the Western Slope.</p></div>
        <div><h3>Private and secure</h3><p>Sessions run on Zoom for Healthcare. No commute, no waiting room.</p></div>
        <div><h3>Insurance or private pay</h3><p>Straightforward private pay, or reach out and I&rsquo;ll tell you where network participation stands.</p></div>
      </div>
    </div>
  </section>

  <section class="section section--shadow">
    <div class="wrap narrow">
      <div class="framed">
        <p class="eyebrow">Meet your counselor</p>
        <h2>Kelly Faus</h2>
        <p style="font-style:italic;margin-bottom:1.5rem">MA &middot; Licensed Professional Counselor &middot; Licensed Addiction Counselor</p>
        <p>
          I&rsquo;m an addiction and mental health counselor working with adolescents and adults
          across Colorado. Much of my work is with people navigating substance use, grief, depression,
          anxiety, trauma, anger, and codependency &mdash; often several of those at once, because
          that&rsquo;s how life tends to arrive.
        </p>
        <p>
          I trained at Adams State University and the University of Northern Colorado. Alongside this
          practice I serve as Clinical Director at Denver Recovery Solutions and as a supervisor with
          Lost and Found Behavioral Wellness.
        </p>
        <p style="margin-top:1.5rem"><a href="about.html">More about my background and approach &rarr;</a></p>
      </div>
      <div class="portrait">
        <img src="assets/kelly-faus.webp" width="900" height="900" alt="Kelly Faus, MA, LPC, LAC">
      </div>
    </div>
  </section>

  <section class="section section--topo">
    <div class="wrap center">
      <h2>Services</h2>
      <p class="narrow">Currently, all sessions are conducted virtually via Zoom for Healthcare.</p>
      <div class="grid grid--3" style="margin-top:3rem;text-align:left">
        <article class="framed service">
          <h3>Individual Psychotherapy</h3>
          <div class="price">$100</div>
          <p class="meta">45&ndash;60 minute session</p>
          <p class="desc">One-to-one work on substance use, grief, depression, anxiety, trauma, anger, and the patterns underneath them.</p>
          <a class="btn btn--outline" href="service-individual-psychotherapy.html">Learn more</a>
        </article>
        <article class="framed service">
          <h3>Assessment</h3>
          <div class="price">$150</div>
          <p class="meta">60&ndash;90 minute session</p>
          <p class="desc">Substance use and mental health assessment, with written findings and clear recommendations for next steps.</p>
          <a class="btn btn--outline" href="service-assessment.html">Learn more</a>
        </article>
        <article class="framed service">
          <h3>Clinical Supervision</h3>
          <div class="price" style="font-size:clamp(1.5rem,2.6vw,1.875rem);font-style:italic">Rate on request</div>
          <p class="meta">Individual or group</p>
          <p class="desc">Supervision for graduate interns, pre-licensed professionals, and peer recovery coaches, including CAC Core Curriculum credit.</p>
          <a class="btn btn--outline" href="service-clinical-supervision.html">Learn more</a>
        </article>
      </div>
      <p style="margin-top:2.5rem"><a href="services.html">See full service details, rates, and insurance &rarr;</a></p>
    </div>
  </section>


  <section class="section section--photo">
    <div class="wrap center">
      <p class="statement">
        &ldquo;Our emotional states are temporary, and they will pass.&rdquo;
      </p>
      <p style="margin-top:1.75rem;font-family:var(--sans);font-size:.8125rem;letter-spacing:.14em;text-transform:uppercase;opacity:.7">
        Serving all of Colorado by telehealth
      </p>
    </div>
  </section>


  <section class="section section--alpine">
    <div class="wrap narrow">
      <div class="center">
        <p class="eyebrow">Common questions</p>
        <h2>Before you reach out</h2>
      </div>
      <div style="margin-top:2.5rem">
        <details class="qa"><summary>Do you take insurance?</summary>
          <p>Network participation changes from time to time, so the honest answer is: ask me. Many people choose private pay because it allows for flexibility and confidentiality, free from restrictions, diagnoses, or other information on record with an insurance company.</p></details>
        <details class="qa"><summary>Do I have to want to quit to work with you?</summary>
          <p>No. Abstinence is one good goal among several. If harm reduction is where you are, that is where we start. I am not going to hand you a verdict on your use before we have even talked about it.</p></details>
        <details class="qa"><summary>Are sessions in person or online?</summary>
          <p>All sessions are conducted virtually via Zoom for Healthcare &mdash; no commute and no waiting room, anywhere in Colorado from Denver to the Western Slope.</p></details>
        <details class="qa"><summary>What happens in a first session?</summary>
          <p>Mostly history and orientation &mdash; what brought you here, what you have already tried, what you want to be different, and how we will know it is working. You do not need to prepare anything.</p></details>
        <details class="qa"><summary>How much does it cost?</summary>
          <p>Individual psychotherapy is $100 for a 45&ndash;60 minute session. A substance use and mental health assessment is $150 for a 60&ndash;90 minute session. Clinical supervision is quoted on request.</p></details>
      </div>
      <p class="center" style="margin-top:2.5rem"><a href="faq.html">Read all the questions &rarr;</a></p>
    </div>
  </section>

${contactForm('Start your journey today', 'Tell me a little about what you&rsquo;re looking for and I&rsquo;ll reply within one business day.')}
`,
});

/* ============================== ABOUT =================================== */
pages.push({
  file: 'about.html',
  title: 'About Kelly Faus, MA, LPC, LAC | Cool Bird Counseling',
  description: 'Kelly Faus is a Licensed Professional Counselor and Licensed Addiction Counselor in Colorado, trained at Adams State and the University of Northern Colorado.',
  body: `
  <section class="page-head wrap">
    <p class="eyebrow">About</p>
    <h1>A quiet retreat to help overcome adversity and find meaning.</h1>
    <p class="lede">Counseling that starts where you actually are &mdash; not where a treatment manual says you should be.</p>
  </section>

  <div class="photostrip photostrip--basin" role="img" aria-label="A broad Colorado valley opening between ranges"></div>

  <section class="wrap narrow" style="padding-bottom:clamp(1rem,3vw,2rem)">
    <div class="portrait" style="margin-top:clamp(3rem,6vw,5rem)">
      <img src="assets/kelly-faus.webp" width="900" height="900" alt="Kelly Faus, MA, LPC, LAC">
    </div>
  </section>

  <section class="section">
    <div class="wrap narrow stack">
      <h2>Kelly Faus, MA, LPC, LAC</h2>
      <p class="lede">
        I&rsquo;m an addiction and mental health counselor licensed in Colorado as both a
        Licensed Professional Counselor (LPC) and a Licensed Addiction Counselor (LAC). I work with adolescents and adults on substance use, grief, depression,
        anxiety, trauma, anger, and codependency.
      </p>
      <p>
        People usually find me at a hard moment &mdash; a relapse, a loss, a relationship coming apart,
        or the slow realization that the way they&rsquo;ve been coping has stopped working. My job
        isn&rsquo;t to hand you a verdict on that. It&rsquo;s to help you look at it clearly, with
        someone in the room who isn&rsquo;t going to flinch.
      </p>
      <p>
        I hold a master&rsquo;s degree in Clinical Mental Health Counseling and studied at Adams State
        University and the University of Northern Colorado. Alongside Cool Bird Counseling, I serve as
        Clinical Director at Denver Recovery Solutions and as a supervisor with Lost and Found
        Behavioral Wellness.
      </p>

      <h3 style="margin-top:2.5rem">How I work</h3>
      <ul class="ticks">
        <li><strong>Non-judgmental about substance use.</strong> Abstinence is one good goal among several. If harm reduction is where you are, we start there.</li>
        <li><strong>Practical, not just insight-driven.</strong> You should leave sessions with something you can actually use before the next one.</li>
        <li><strong>Whole-picture.</strong> Addiction, grief, and mental health rarely show up separately, so I don&rsquo;t treat them separately.</li>
        <li><strong>Collaborative.</strong> You set the goals. I bring the training, the structure, and the honest feedback.</li>
      </ul>

      <h3 style="margin-top:2.5rem">Who I work with</h3>
      <ul class="ticks">
        <li>Adults and adolescents navigating alcohol or drug use</li>
        <li>People in early recovery, and people who aren&rsquo;t sure recovery is the word yet</li>
        <li>Grief and bereavement, including loss to overdose or suicide</li>
        <li>Depression, anxiety, trauma, anger, and codependency</li>
        <li>Graduate interns and pre-licensed clinicians seeking supervision</li>
      </ul>

      <h3 style="margin-top:2.5rem">Credentials</h3>
      <ul class="ticks">
        <li>MA, Clinical Mental Health Counseling</li>
        <li>Licensed Professional Counselor (LPC), Colorado</li>
        <li>Licensed Addiction Counselor (LAC), Colorado</li>
        <li>Gottman Method training, Levels 1 &amp; 2</li>
      </ul>
      <p class="callout" style="margin-top:2rem">
        <strong>Verify a license.</strong> Colorado license numbers can be looked up through the
        Department of Regulatory Agencies at
        <a href="https://apps.colorado.gov/dora/licensing/Lookup/LicenseLookup.aspx">DORA License Lookup</a>.
      </p>
    </div>
  </section>

${contactForm('Ready when you are', 'Reach out for a confidential consultation &mdash; no cost, no pressure, no obligation to book.')}
`,
});

/* ============================= SERVICES ================================= */
pages.push({
  file: 'services.html',
  title: 'Services & Rates | Cool Bird Counseling, Colorado',
  description: 'Individual psychotherapy, substance use and mental health assessment, and clinical supervision. Telehealth across Colorado. Insurance and private pay options.',
  body: `
  <section class="page-head wrap">
    <p class="eyebrow">Services</p>
    <h1>Care that fits the shape of your week.</h1>
    <p class="lede">All sessions are conducted virtually via Zoom for Healthcare, so you can meet from home, from the office, or from a parked car between obligations.</p>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap">
      <div class="grid grid--3">

        <article class="framed service">
          <h3>Individual Psychotherapy</h3>
          <div class="price">$100</div>
          <p class="meta">45&ndash;60 minute session</p>
          <p class="desc">
            Ongoing one-to-one counseling for substance use, grief, depression, anxiety, trauma,
            anger, and codependency. Most people start weekly and taper as things steady out.
            Sessions are conversational, structured enough to make progress, and paced to what
            you can carry.
          </p>
          <a class="btn btn--outline" href="service-individual-psychotherapy.html">Learn more</a>
        </article>

        <article class="framed service">
          <h3>Substance Use &amp; Mental Health Assessment</h3>
          <div class="price">$150</div>
          <p class="meta">60&ndash;90 minute session</p>
          <p class="desc">
            A thorough evaluation of substance use and mental health, resulting in written findings
            and clear level-of-care recommendations. Commonly requested by courts, employers,
            probation, treatment programs, and licensing boards &mdash; and just as often by people
            who simply want a straight answer about where they stand.
          </p>
          <a class="btn btn--outline" href="service-assessment.html">Learn more</a>
        </article>


        <article class="framed service">
          <h3>Clinical Supervision</h3>
          <div class="price" style="font-size:clamp(1.5rem,2.6vw,1.875rem);font-style:italic">Rate on request</div>
          <p class="meta">Individual or group</p>
          <p class="desc">
            Supervision for graduate interns, pre-licensed professionals, and peer recovery coaches.
            If you&rsquo;re pursuing addiction counselor certification in Colorado, ask about
            CAC Core Curriculum credit &mdash; I can often cover required hours as part of supervision.
          </p>
          <a class="btn btn--outline" href="service-clinical-supervision.html">Learn more</a>
        </article>

      </div>
    </div>
  </section>

  <section class="section section--tint">
    <div class="wrap narrow stack">
      <h2>Insurance &amp; payment</h2>
      <p>
        <strong>Private pay.</strong> Paying directly allows for flexibility and confidentiality, free
        from restrictions, diagnoses, or other information on record with an insurance company. Nothing
        about your care is reported to a third party.
      </p>
      <p>
        <strong>Commercial insurance.</strong> Network participation changes from time to time &mdash;
        reach out and I&rsquo;ll tell you exactly where things stand and what your cost would be before
        we book anything.
      </p>
      <p class="callout">
        <strong>Good Faith Estimate.</strong> Under the No Surprises Act, clients who are uninsured or
        not using insurance have the right to a written estimate of expected costs before care begins.
        Ask and one will be provided.
      </p>
    </div>
  </section>

  <section class="section">
    <div class="wrap narrow stack">
      <h2>What to expect</h2>
      <ul class="ticks">
        <li><strong>Reach out.</strong> Use the contact form, email, or call. I reply within one business day.</li>
        <li><strong>Free consultation.</strong> A short call to hear what&rsquo;s going on and decide together whether I&rsquo;m the right fit. If I&rsquo;m not, I&rsquo;ll point you somewhere better.</li>
        <li><strong>Paperwork.</strong> Intake forms and consents arrive by secure link before session one.</li>
        <li><strong>First session.</strong> Mostly history and orientation &mdash; what brought you here, what you want to be different, and how we&rsquo;ll know it&rsquo;s working.</li>
        <li><strong>Ongoing.</strong> Weekly to start for most people, adjusted as you go.</li>
      </ul>
      <p style="margin-top:2rem">
        <strong>Cancellations.</strong> Please give 24 hours&rsquo; notice for changes; late cancellations
        and no-shows may be billed at the full session rate.
      </p>
    </div>
  </section>

${contactForm('Book a consultation', 'Same-week openings are available. Tell me what you&rsquo;re looking for and we&rsquo;ll find a time.')}
`,
});

/* ============================ DOCUMENTS ================================= */
pages.push({
  file: 'documents.html',
  title: 'Client Documents & Forms | Cool Bird Counseling',
  description: 'HIPAA Notice of Privacy Practices, release of information form, and Good Faith Estimate information for Cool Bird Counseling clients in Colorado.',
  body: `
  <section class="page-head wrap">
    <p class="eyebrow">Documents</p>
    <h1>Paperwork, handled before we meet.</h1>
    <p class="lede">A few documents you can read on your own time. The rest of your paperwork comes to you directly, so nothing sensitive sits on a public page.</p>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap narrow">
      <div class="framed">
        <h2 style="font-size:1.375rem">Client documents</h2>        <p style="font-size:.9375rem;margin-bottom:2rem">
          These are the documents available to download directly. Everything else in your client
          paperwork is delivered to you privately rather than posted publicly.
        </p>

        <div class="doc-row">
          <div class="doc-row__text">
            <strong>Notice of Privacy Practices (HIPAA)</strong>
            <span>How your protected health information is used, stored, and safeguarded, and your rights regarding it.</span>
          </div>
          <a class="tag" href="assets/cool-bird-hipaa-notice.pdf" target="_blank" rel="noopener">Download PDF</a>
        </div>

        <div class="doc-row">
          <div class="doc-row__text">
            <strong>Authorization to Release Information</strong>
            <span>Use this to authorize communication with a physician, attorney, treatment program, or family member.</span>
          </div>
          <a class="tag" href="assets/cool-bird-roi.pdf" target="_blank" rel="noopener">Download PDF</a>
        </div>

        <div class="doc-row" style="border-bottom:0">
          <div class="doc-row__text">
            <strong>Safety Plan</strong>
            <span>An interactive tool for building a personal safety plan you can print or save.</span>
          </div>
          <a class="tag" href="safety-plan.html">Open generator</a>
        </div>

      </div>

      <p class="callout" style="margin-top:2.5rem">
        <strong>Good Faith Estimate.</strong> Under the No Surprises Act, clients who are uninsured or
        not using insurance have the right to a written estimate of expected costs before care begins.
        A Good Faith Estimate is provided to qualifying clients, and to anyone else on request &mdash;
        just ask.
      </p>
      <p class="callout" style="margin-top:1.25rem">
        <strong>Intake paperwork.</strong> Your intake forms, informed consent, telehealth consent, and
        practice policies are sent to you directly before the first session rather than hosted here.
      </p>
    </div>
  </section>

${contactForm('Questions about the paperwork?', 'Ask before you sign &mdash; that&rsquo;s what it&rsquo;s there for.')}
`,
});

/* ============================ RESOURCES ================================= */
pages.push({
  file: 'resources.html',
  title: 'Colorado Crisis & Recovery Resources | Cool Bird',
  description: 'Crisis lines, recovery support meetings, insurance help, and family resources for Coloradans navigating addiction, grief, and mental health.',
  body: `
  <section class="page-head wrap">
    <p class="eyebrow">Resources</p>
    <h1>Help that doesn&rsquo;t wait for an appointment.</h1>
    <p class="lede">A short, vetted list &mdash; crisis support, recovery meetings, and the practical things people ask me about most.</p>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap narrow">
      <div class="callout" style="margin-bottom:3rem">
        <strong>If you are in danger right now, call 911.</strong> For urgent emotional support any hour
        of the day, call or text <a href="tel:988">988</a> &mdash; the Suicide &amp; Crisis Lifeline,
        answered in Colorado, in English and Spanish.
      </div>

      <h2>Crisis support</h2>
      <ul class="resource-list">
        <li>
          <strong>988 Suicide &amp; Crisis Lifeline &mdash; call or text 988</strong>
          <span>24/7 support for suicidal thoughts, substance use crises, and emotional distress. Chat at <a href="https://988lifeline.org/chat/">988lifeline.org/chat</a>.</span>
        </li>
        <li>
          <strong>Colorado walk-in crisis centers</strong>
          <span>In-person crisis care across the state, no appointment needed. Locations at <a href="https://www.988colorado.com/walk-in-centers">988colorado.com/walk-in-centers</a>.</span>
        </li>
        <li>
          <strong>SAMHSA National Helpline &mdash; 1-800-662-4357</strong>
          <span>Free, confidential, 24/7 treatment referral and information for substance use and mental health.</span>
        </li>
        <li>
          <strong>Colorado Crisis Text Line &mdash; text TALK to 38255</strong>
          <span>Text-based support with a trained crisis counselor.</span>
        </li>
      </ul>

      <h2 style="margin-top:3.5rem">Recovery &amp; peer support</h2>
      <ul class="resource-list">
        <li>
          <strong>Alcoholics Anonymous &mdash; Colorado</strong>
          <span>Meeting finder and local intergroups at <a href="https://www.aa.org/find-aa">aa.org/find-aa</a>.</span>
        </li>
        <li>
          <strong>Narcotics Anonymous &mdash; Colorado Region</strong>
          <span>Meeting schedules statewide at <a href="https://www.na.org/meetingsearch/">na.org</a>.</span>
        </li>
        <li>
          <strong>SMART Recovery</strong>
          <span>Secular, science-based mutual aid meetings, in person and online, at <a href="https://smartrecovery.org/">smartrecovery.org</a>.</span>
        </li>
        <li>
          <strong>Al-Anon &amp; Nar-Anon</strong>
          <span>Support for family members and friends of people with substance use disorders.</span>
        </li>
      </ul>

      <h2 style="margin-top:3.5rem">Coverage &amp; access</h2>
      <ul class="resource-list">
        <li>
          <strong>DORA License Lookup</strong>
          <span>Verify any Colorado counselor&rsquo;s license at <a href="https://apps.colorado.gov/dora/licensing/Lookup/LicenseLookup.aspx">apps.colorado.gov</a>.</span>
        </li>
      </ul>

      <h2 style="margin-top:3.5rem">Learning more</h2>
      <ul class="resource-list">
        <li>
          <strong>NAMI Colorado</strong>
          <span>Free education, support groups, and advocacy for individuals and families at <a href="https://namicolorado.org/">namicolorado.org</a>.</span>
        </li>
        <li>
          <strong>Judi&rsquo;s House</strong>
          <span>Grief support for Colorado children and families, particularly after sudden loss.</span>
        </li>
      </ul>

      <p class="form__note" style="margin-top:3rem">
        These organizations are independent of Cool Bird Counseling. Listing them isn&rsquo;t an
        endorsement of any particular course of treatment &mdash; it&rsquo;s a starting point.
      </p>
    </div>
  </section>

${contactForm('Want help sorting through the options?', 'Sometimes the hardest part is knowing which door to knock on. Ask and I&rsquo;ll point you in a direction.')}
`,
});

/* ============================= CONTACT ================================== */
pages.push({
  file: 'contact.html',
  title: 'Contact | Cool Bird Counseling, Colorado',
  description: 'Request a confidential consultation with Kelly Faus, MA, LPC, LAC. Telehealth counseling across Colorado. Same-week openings available.',
  body: `
  <section class="page-head wrap">
    <p class="eyebrow">Contact</p>
    <h1>The first step is the hardest.</h1>
    <p class="lede">Send a note and I&rsquo;ll reply within one business day. Consultations are free, confidential, and carry no obligation to book.</p>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap">
      <div class="grid grid--3">
        <div class="framed stack">
          <h3>Reach me directly</h3>
          <p>
            <strong>Email</strong><br>
            <a href="mailto:kelly@coolbirdcounseling.com">kelly@coolbirdcounseling.com</a>
          </p>
          <p>
            <strong>Phone</strong><br>
            <a href="tel:+13033511068">(303) 351-1068</a>
          </p>
          <p>
            <strong>Sessions</strong><br>
            Virtual, statewide in Colorado, via Zoom for Healthcare
          </p>
          <p>
            <strong>Response time</strong><br>
            Within one business day, Monday through Friday
          </p>
        </div>

        <div class="framed stack">
          <h3>Before you write</h3>
          <ul class="ticks">
            <li>A sentence or two about what&rsquo;s going on is plenty &mdash; no need to explain everything up front.</li>
            <li>Let me know whether you&rsquo;re planning to use insurance or private pay.</li>
            <li>Mention a few windows that work for you and I&rsquo;ll send times that match.</li>
            <li>Please leave detailed clinical or legal information out of email &mdash; we&rsquo;ll move to a secure channel once we connect.</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

${contactForm('Start your journey today', 'Your privacy and safety are my top concerns. Your information will never be shared or sold.')}

  <section class="section section--tint">
    <div class="wrap narrow">
      <div class="callout">
        <strong>This form is not monitored around the clock.</strong> If you are in crisis, call or text
        <a href="tel:988">988</a> to reach the Suicide &amp; Crisis Lifeline, or call
        <a href="tel:911">911</a> if you are in immediate danger.
      </div>
    </div>
  </section>
`,
});


/* ============================ SAFETY PLAN =============================== */
pages.push({
  file: 'safety-plan.html',
  title: 'Safety Plan Generator | Cool Bird Counseling',
  description: 'Learn what a safety plan is and build your own printable crisis safety plan — warning signs, coping strategies, social supports, and crisis contacts.',
  body: `
  <section class="page-head wrap">
    <p class="eyebrow">Safety Plan</p>
    <h1>A plan made calm, for a moment that isn&rsquo;t.</h1>
    <p class="lede">Read through the guide below, then build your own printable safety plan at the bottom of the page.</p>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap narrow stack">
      <h2>What is a safety plan?</h2>
      <p>
        A safety plan is a list of warning signs, coping strategies, trusted people, and other
        resources that can be helpful to you when you are in a state of crisis. Experiencing a state
        of crisis &mdash; suicidal ideation, homicidal ideation, desire to self-harm, or other
        stressful situations &mdash; can distort your ability to think clearly. Creating a safety plan
        during a time when you are calm and collected gives you a quick reference for times when you
        are feeling distressed. Feel free to create a safety plan yourself, or find a mental health
        professional for help.
      </p>

      <h3 style="margin-top:2.5rem">Warning signs</h3>
      <p>
        Warning signs are thoughts, feelings, or behaviors that indicate you may be in or heading
        toward a crisis. It is important to know your warning signs, so you can recognize when it is
        time to use coping skills or other resources from your safety plan.
      </p>
      <p>
        Some common warning signs might include: isolation or social withdrawal, suicidal thoughts,
        homicidal thoughts, rage, using or desiring to use substances, self-harm or desiring to
        self-harm, sadness, betrayal, dissociation, anxiety or panic, thinking &ldquo;I am a
        burden,&rdquo; feelings of hopelessness, thinking &ldquo;I am better off dead,&rdquo; feelings
        of hate, pacing, lack of sleep, too much sleep, changes in appetite, talking more or less,
        shouting or swearing, feeling suspicious or paranoid, and more.
      </p>
      <p><em>Which of these might pertain to you in particular? Can you think of any others that weren&rsquo;t listed?</em></p>

      <h3 style="margin-top:2.5rem">Coping strategies</h3>
      <p>
        Coping skills are techniques you can use all by yourself to regulate your emotions or distract
        yourself from whatever is distressing you.
      </p>
      <p>
        Some examples include: grounding strategies, taking a walk, exercising, watching TV or a
        movie, listening to music, meditating, yoga, petting an animal, taking a nap, taking a bath or
        shower, lighting candles or incense or using scented oils, making a meal, reading, or engaging
        in a hobby.
      </p>
      <p><em>What is a coping skill that is useful to you that isn&rsquo;t listed?</em></p>

      <h3 style="margin-top:2.5rem">Social support</h3>
      <p>
        Trusted people whom you can call for support are important to list on a safety plan. Asking
        for help can feel uncomfortable for some, but it is a helpful way to navigate a challenging
        time. Trusted social supports could be friends, family members, members of a religious
        community, coaches, or other close relationships.
      </p>
      <p><em>Who are some people in your life in whom you would be willing to confide if you needed support?</em> Include their names and contact information on your plan.</p>

      <h3 style="margin-top:2.5rem">Future focus</h3>
      <p>
        It can be helpful to list something you are looking forward to, or something that makes life
        worth living. These reminders can be reassuring during a crisis state.
      </p>
      <p>
        It is also helpful to brainstorm ways you can keep yourself safe until the crisis passes. Do
        you have any weapons at home that could be stored elsewhere temporarily? What about
        medications or chemicals? Planning for how to keep your environment safe during a crisis is
        crucial.
      </p>
      <p><strong>Remember, our emotional states are temporary, and they will pass.</strong></p>

      <h3 style="margin-top:2.5rem">Crisis services</h3>
      <p>
        There are many professional resources available to help navigate a crisis. Make sure you have
        information for contacting your mental health professional on your safety plan. In Colorado,
        you can call or text <a href="tel:988">988</a> to reach the Colorado Mental Health Line, and
        there are several in-person, walk-in crisis centers across the state, as well as your local
        emergency room. Names, addresses, and phone numbers for each of these resources, including
        in-person resources nearest you, are important to include on your safety plan.
      </p>
    </div>
  </section>

  <section class="section section--topo" id="generator">
    <div class="wrap narrow">
      <div class="framed">
        <p class="eyebrow">Safety Plan Generator</p>
        <h2 style="margin-bottom:.4em">Build your plan</h2>
        <p style="font-size:.9375rem">
          Fill in whatever fits. When you&rsquo;re done, print it &mdash; choose &ldquo;Save as
          PDF&rdquo; in the print dialog to keep a copy, or print it on paper and put it somewhere you
          will actually see it.
        </p>
        <p class="callout" style="margin:1.5rem 0 2rem">
          <strong>Nothing you type here is saved or sent anywhere.</strong> It stays in your browser
          for as long as this page is open, and disappears when you close it. Print your plan before
          you leave the page.
        </p>

        <form id="sp" class="sp">
          <label>Warning signs &mdash; thoughts, feelings, or behaviors that tell me a crisis may be coming
            <textarea name="warning" rows="4" placeholder="e.g. pulling away from friends, not sleeping, thinking I'm a burden"></textarea></label>

          <label>Coping strategies I can use on my own
            <textarea name="coping" rows="4" placeholder="e.g. walk the dog, call my sister, shower, 5-4-3-2-1 grounding"></textarea></label>

          <label>People I can reach out to &mdash; names and phone numbers
            <textarea name="support" rows="4" placeholder="e.g. Sam — (303) 555-0143"></textarea></label>

          <label>Reasons for living, and things I&rsquo;m looking forward to
            <textarea name="future" rows="3" placeholder="e.g. my daughter's graduation in May"></textarea></label>

          <label>Making my environment safer &mdash; what I&rsquo;ll move, store, or ask someone to hold
            <textarea name="environment" rows="3" placeholder="e.g. ask Dad to hold the firearm; give medications to my roommate"></textarea></label>

          <label>My mental health professional
            <input type="text" name="clinician" placeholder="Name and phone number"></label>

          <label>Other crisis contacts near me
            <textarea name="crisis" rows="3" placeholder="Local walk-in center, nearest emergency room, anyone else"></textarea></label>

          <div class="sp__actions">
            <button type="button" class="btn btn--solid" onclick="buildPlan(true)">Create my plan</button>
            <button type="button" class="btn btn--outline" id="printBtn" disabled
                    onclick="window.print();">Print / Save as PDF</button>
          </div>
        </form>
      </div>

      <div id="plan" class="framed plan" hidden>
        <h2 class="plan__title">My Safety Plan</h2>
        <div id="planBody"></div>
        <p class="plan__crisis">
          <strong>In Colorado, call or text 988</strong> to reach the Suicide &amp; Crisis Lifeline,
          any hour of the day. If you are in immediate danger, call 911.
        </p>
        <p class="plan__foot">Cool Bird Counseling LLC &middot; kelly@coolbirdcounseling.com &middot; (303) 351-1068</p>
      </div>
    </div>
  </section>

  <style>
    .sp label { display:block; font-family:var(--sans); font-size:.875rem; font-weight:500;
                color:var(--ink); margin-bottom:1.5rem; }
    .sp textarea, .sp input { display:block; width:100%; margin-top:.5rem; background:var(--cream);
                border:1px solid var(--rule); border-radius:0; padding:.75rem .9rem;
                font-family:var(--serif); font-size:1rem; color:var(--ink); resize:vertical; }
    .sp textarea:focus, .sp input:focus { outline:none; border-color:var(--sage); background:#fff; }
    .plan { margin-top:2rem; }
    .plan__title { font-style:italic; text-align:center; }
    .plan h3 { font-family:var(--sans); font-size:.75rem; letter-spacing:.16em; text-transform:uppercase;
               color:var(--sage); margin:1.75rem 0 .4rem; }
    .plan p.v { white-space:pre-wrap; margin:0; }
    .plan__crisis { margin-top:2rem; padding-top:1.25rem; border-top:1px solid var(--rule); font-size:.9375rem; }
    .plan__foot { font-size:.8125rem; color:#6d726d; text-align:center; margin-top:1rem; }
    @media print {
      @page { margin: 0.75in; }
      /* #plan is relocated to a direct child of <body> before printing, so
         everything else can be display:none and the flow collapses to one page. */
      body > *:not(#plan) { display: none !important; }
      html, body { height: auto !important; background: #fff !important; }
      #plan { display: block !important; margin: 0 !important; padding: 0 !important;
              border: 0 !important; background: #fff !important; }
      #plan::before { display: none !important; }
      #plan h3 { break-after: avoid; }
      #plan p.v { break-inside: avoid; }
    }
  </style>

  <script>
    function buildPlan(scroll) {
      var f = document.getElementById('sp');
      var map = [
        ['warning', 'Warning signs'],
        ['coping', 'Coping strategies'],
        ['support', 'People I can reach out to'],
        ['future', 'Reasons for living'],
        ['environment', 'Making my environment safer'],
        ['clinician', 'My mental health professional'],
        ['crisis', 'Other crisis contacts']
      ];
      var html = '';
      map.forEach(function (pair) {
        var v = (f.elements[pair[0]].value || '').trim();
        if (!v) return;
        var esc = v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        html += '<h3>' + pair[1] + '</h3><p class="v">' + esc + '</p>';
      });
      var hasContent = !!html;
      if (!hasContent) { html = '<p class="v">Fill in a section above, then select &ldquo;Create my plan&rdquo; again.</p>'; }
      document.getElementById('planBody').innerHTML = html;
      var plan = document.getElementById('plan');
      plan.hidden = false;
      // Nothing to print until at least one section has been filled in.
      document.getElementById('printBtn').disabled = !hasContent;
      // Only the explicit button press scrolls; live rebuilds while typing
      // must not yank the page around under the cursor.
      if (scroll) { plan.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      return hasContent;
    }

    // Editing a field after building invalidates what is on screen, so rebuild
    // quietly — this also re-gates the print button if everything is cleared.
    document.addEventListener('DOMContentLoaded', function () {
      var f = document.getElementById('sp');
      f.addEventListener('input', function () {
        if (!document.getElementById('plan').hidden) { buildPlan(); }
      });
    });
    var planHome = null;
    window.addEventListener('beforeprint', function () {
      var plan = document.getElementById('plan');
      if (plan.hidden) { buildPlan(); }
      if (!planHome) { planHome = plan.parentNode; document.body.appendChild(plan); }
    });
    window.addEventListener('afterprint', function () {
      var plan = document.getElementById('plan');
      if (planHome) { planHome.appendChild(plan); planHome = null; }
    });
  </script>
`,
});

/* ===================== INDIVIDUAL SERVICE PAGES ===================== */

pages.push({
  file: 'service-individual-psychotherapy.html',
  banner: 'pines', bannerAlt: 'A quiet stand of Colorado pines',
  title: 'Individual Psychotherapy in Colorado | Cool Bird',
  description: 'Individual therapy for substance use, grief, depression, anxiety, trauma, anger, and codependency. $100 per 45-60 minute telehealth session, statewide in Colorado.',
  schema: [{
    '@type': 'Service', name: 'Individual Psychotherapy',
    provider: { '@id': SITE + '/#practice' },
    areaServed: { '@type': 'State', name: 'Colorado' },
    serviceType: 'Individual Psychotherapy',
    url: SITE + '/service-individual-psychotherapy.html'
  }],
  body: `
  <section class="page-head wrap">
    <p class="eyebrow"><a href="services.html" style="color:inherit;text-decoration:none">Services</a></p>
    <h1>Individual Psychotherapy</h1>
    <p class="lede">Ongoing one-to-one counseling for adults and adolescents across Colorado, by secure video.</p>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap narrow">
      <div class="framed service" style="text-align:center;margin-bottom:3rem">
        <div class="price">$100</div>
        <p class="meta">45&ndash;60 minute session</p>
        <a class="btn btn--solid" href="contact.html">Book a consultation</a>
      </div>
      <p>Most people arrive at therapy at a specific moment &mdash; a relapse, a loss, a relationship coming apart, or the slow recognition that the way they have been coping has stopped working. Individual psychotherapy is the space to look at that clearly, with someone in the room who is not going to flinch.</p>
      <p>I work with substance use, grief, depression, anxiety, trauma, anger, and codependency. In practice these rarely show up one at a time, so I do not treat them one at a time. We work with the whole picture: what happened, what it cost, what you are doing to manage it now, and what you would like to be different.</p>
      <p>Sessions are conversational but structured enough to make progress. You should leave with something you can actually use before the next one, not just a feeling of having talked.</p>

      <h2 style="margin-top:2.5rem">Who this is for</h2>
      <ul class="ticks">
        <li>Adults and adolescents navigating alcohol or drug use</li>
        <li>People in early recovery, and people not sure recovery is the right word yet</li>
        <li>Grief and bereavement, including loss to overdose or suicide</li>
        <li>Depression, anxiety, trauma, anger, and codependency</li>
        <li>Anyone who has tried therapy before and found it did not go anywhere</li>
      </ul>

      <h2 style="margin-top:2.5rem">What to expect</h2>
      <ul class="ticks">
        <li>A free consultation call before you commit to anything</li>
        <li>Weekly sessions to start for most people, tapering as things steady out</li>
        <li>Secure video through Zoom for Healthcare &mdash; no commute, no waiting room</li>
        <li>Direct feedback, and goals you set rather than goals I assign</li>
      </ul>

      <p class="callout" style="margin-top:2.5rem">
        All sessions are conducted virtually via Zoom for Healthcare, anywhere in Colorado.
        <a href="services.html">See all services and payment options &rarr;</a>
      </p>
    </div>
  </section>

${contactForm('Book a consultation', 'Free, confidential, and no obligation to schedule.')}
`,
});

pages.push({
  file: 'service-assessment.html',
  banner: 'peaks', bannerAlt: 'Snow on the Colorado Front Range',
  title: 'Substance Use Assessment in Colorado | Cool Bird',
  description: 'Court, employer, probation, and self-referred substance use and mental health assessments in Colorado. $150 for a 60-90 minute session with written findings.',
  schema: [{
    '@type': 'Service', name: 'Substance Use and Mental Health Assessment',
    provider: { '@id': SITE + '/#practice' },
    areaServed: { '@type': 'State', name: 'Colorado' },
    serviceType: 'Substance Use and Mental Health Assessment',
    url: SITE + '/service-assessment.html'
  }],
  body: `
  <section class="page-head wrap">
    <p class="eyebrow"><a href="services.html" style="color:inherit;text-decoration:none">Services</a></p>
    <h1>Substance Use &amp; Mental Health Assessment</h1>
    <p class="lede">A thorough evaluation with written findings and clear level-of-care recommendations.</p>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap narrow">
      <div class="framed service" style="text-align:center;margin-bottom:3rem">
        <div class="price">$150</div>
        <p class="meta">60&ndash;90 minute session</p>
        <a class="btn btn--solid" href="contact.html">Book a consultation</a>
      </div>
      <p>An assessment is a structured conversation about your substance use and mental health history, current functioning, and risk factors, resulting in a written report with recommendations for level of care.</p>
      <p>These are commonly requested by courts, employers, probation officers, treatment programs, and licensing boards. Just as often, people request one for themselves because they want a straight answer about where they actually stand rather than continuing to guess.</p>
      <p>I conduct assessments the same way I conduct therapy: without judgment, and without a predetermined conclusion. The report reflects what the evaluation actually found.</p>

      <h2 style="margin-top:2.5rem">Who this is for</h2>
      <ul class="ticks">
        <li>Court-ordered or probation-referred evaluations</li>
        <li>Employer, licensing board, or professional health program referrals</li>
        <li>Treatment programs needing a level-of-care recommendation</li>
        <li>Individuals who want an honest, professional read on their own use</li>
      </ul>

      <h2 style="margin-top:2.5rem">What to expect</h2>
      <ul class="ticks">
        <li>One 60&ndash;90 minute telehealth session</li>
        <li>Written findings and level-of-care recommendations</li>
        <li>Turnaround discussed up front so you can meet any deadline</li>
        <li>A copy released only where you authorize it in writing</li>
      </ul>

      <p class="callout" style="margin-top:2.5rem">
        All sessions are conducted virtually via Zoom for Healthcare, anywhere in Colorado.
        <a href="services.html">See all services and payment options &rarr;</a>
      </p>
    </div>
  </section>

${contactForm('Book a consultation', 'Free, confidential, and no obligation to schedule.')}
`,
});

pages.push({
  file: 'service-clinical-supervision.html',
  banner: 'trail', bannerAlt: 'A trail winding through the Colorado high country',
  title: 'Clinical Supervision & CAC Credit in Colorado | Cool Bird',
  description: 'Clinical supervision for graduate interns, pre-licensed professionals, and peer recovery coaches in Colorado. CAC Core Curriculum credit available.',
  schema: [{
    '@type': 'Service', name: 'Clinical Supervision',
    provider: { '@id': SITE + '/#practice' },
    areaServed: { '@type': 'State', name: 'Colorado' },
    serviceType: 'Clinical Supervision',
    url: SITE + '/service-clinical-supervision.html'
  }],
  body: `
  <section class="page-head wrap">
    <p class="eyebrow"><a href="services.html" style="color:inherit;text-decoration:none">Services</a></p>
    <h1>Clinical Supervision</h1>
    <p class="lede">Supervision for graduate interns, pre-licensed clinicians, and peer recovery coaches.</p>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap narrow">
      <div class="framed service" style="text-align:center;margin-bottom:3rem">
        <div class="price">Rate on request</div>
        <p class="meta">Individual or group</p>
        <a class="btn btn--solid" href="contact.html">Book a consultation</a>
      </div>
      <p>Supervision should do more than sign off on hours. Good supervision gives you somewhere to bring the case that is keeping you up, the client you are quietly dreading, and the question you are embarrassed to ask.</p>
      <p>I supervise graduate interns, pre-licensed professionals working toward LPC or LAC, and peer recovery coaches. If you are pursuing addiction counselor certification in Colorado, ask about CAC Core Curriculum credit &mdash; required coursework hours can often be covered as part of supervision.</p>
      <p>As Clinical Director at Denver Recovery Solutions and a supervisor with Lost and Found Behavioral Wellness, I spend a lot of my week on the development side of this field. It is genuinely the part of the work I enjoy most.</p>

      <h2 style="margin-top:2.5rem">Who this is for</h2>
      <ul class="ticks">
        <li>Graduate interns completing practicum or internship hours</li>
        <li>Pre-licensed clinicians working toward LPC or LAC</li>
        <li>Peer recovery coaches seeking structured supervision</li>
        <li>Candidates pursuing CAC certification in Colorado</li>
      </ul>

      <h2 style="margin-top:2.5rem">What to expect</h2>
      <ul class="ticks">
        <li>Individual or group formats</li>
        <li>CAC Core Curriculum credit where applicable</li>
        <li>Documentation of hours in the form your board requires</li>
        <li>Case consultation, ethics, and honest developmental feedback</li>
      </ul>

      <p class="callout" style="margin-top:2.5rem">
        All sessions are conducted virtually via Zoom for Healthcare, anywhere in Colorado.
        <a href="services.html">See all services and payment options &rarr;</a>
      </p>
    </div>
  </section>

${contactForm('Book a consultation', 'Free, confidential, and no obligation to schedule.')}
`,
});


/* ================================ FAQ ================================== */
pages.push({
  file: 'faq.html',
  title: 'Counseling FAQ | Cool Bird Counseling, Colorado',
  description: 'Costs, insurance, telehealth, first sessions, assessments, supervision, and crisis resources — straight answers about counseling with Kelly Faus, MA, LPC, LAC.',
  schema: [{"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "Do you take insurance?", "acceptedAnswer": {"@type": "Answer", "text": "Network participation changes from time to time, so the honest answer is: ask me. Many people choose private pay because it allows for flexibility and confidentiality, free from restrictions, diagnoses, or other information on record with an insurance company."}}, {"@type": "Question", "name": "How much does a session cost?", "acceptedAnswer": {"@type": "Answer", "text": "Individual psychotherapy is $100 for a 45&ndash;60 minute session. A substance use and mental health assessment is $150 for a 60&ndash;90 minute session. Clinical supervision is quoted on request."}}, {"@type": "Question", "name": "Are sessions in person or online?", "acceptedAnswer": {"@type": "Answer", "text": "All sessions are conducted virtually via Zoom for Healthcare. That means no commute and no waiting room, and it means I can see clients anywhere in Colorado \u2014 from Denver to the Western Slope."}}, {"@type": "Question", "name": "Do I have to want to quit drinking or using to work with you?", "acceptedAnswer": {"@type": "Answer", "text": "No. Abstinence is one good goal among several. If harm reduction is where you are, that is where we start. I am not going to hand you a verdict on your use before we have even talked about it."}}, {"@type": "Question", "name": "What happens in a first session?", "acceptedAnswer": {"@type": "Answer", "text": "Mostly history and orientation \u2014 what brought you here, what you have already tried, what you want to be different, and how we will know it is working. You do not need to prepare anything or explain everything up front."}}, {"@type": "Question", "name": "How long will I be in therapy?", "acceptedAnswer": {"@type": "Answer", "text": "Most people start weekly and taper as things steady out. Some people come for a few months around a specific crisis; others stay longer. You set the goals, and we revisit whether it is still working."}}, {"@type": "Question", "name": "Do you work with teenagers?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. I work with both adolescents and adults on substance use, grief, and mental health concerns."}}, {"@type": "Question", "name": "Can you provide a court-ordered assessment?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. Substance use and mental health assessments are frequently requested by courts, probation, employers, and licensing boards. You receive written findings with level-of-care recommendations, released only where you authorize it in writing."}}, {"@type": "Question", "name": "Do you offer supervision for CAC certification?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. I supervise graduate interns, pre-licensed professionals, and peer recovery coaches, and CAC Core Curriculum credit is available where applicable."}}, {"@type": "Question", "name": "What if I am in crisis right now?", "acceptedAnswer": {"@type": "Answer", "text": "Call or text 988 to reach the Suicide & Crisis Lifeline, answered in Colorado 24 hours a day. If you are in immediate danger, call 911. This website is not a crisis service and messages here are not monitored around the clock."}}, {"@type": "Question", "name": "What is a Good Faith Estimate?", "acceptedAnswer": {"@type": "Answer", "text": "Under the No Surprises Act, clients who are uninsured or not using insurance have the right to a written estimate of expected costs before care begins. One is provided to qualifying clients and to anyone else on request."}}, {"@type": "Question", "name": "How do I get started?", "acceptedAnswer": {"@type": "Answer", "text": "Send a note through the contact page, email kelly@coolbirdcounseling.com, or call (303) 351-1068. I reply within one business day, and the consultation is free with no obligation to book."}}]}],
  body: `
  <section class="page-head wrap">
    <p class="eyebrow">FAQ</p>
    <h1>Questions people actually ask.</h1>
    <p class="lede">If yours isn&rsquo;t here, just ask &mdash; I reply within one business day.</p>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap narrow">
      <div class="framed">
        <div class="doc-row" style="display:block">
          <h3 style="font-size:1.125rem;margin-bottom:.35em">Do you take insurance?</h3>
          <p style="font-size:.9375rem;margin:0">Network participation changes from time to time, so the honest answer is: ask me. Many people choose private pay because it allows for flexibility and confidentiality, free from restrictions, diagnoses, or other information on record with an insurance company.</p>
        </div>
        <div class="doc-row" style="display:block">
          <h3 style="font-size:1.125rem;margin-bottom:.35em">How much does a session cost?</h3>
          <p style="font-size:.9375rem;margin:0">Individual psychotherapy is $100 for a 45&ndash;60 minute session. A substance use and mental health assessment is $150 for a 60&ndash;90 minute session. Clinical supervision is quoted on request.</p>
        </div>
        <div class="doc-row" style="display:block">
          <h3 style="font-size:1.125rem;margin-bottom:.35em">Are sessions in person or online?</h3>
          <p style="font-size:.9375rem;margin:0">All sessions are conducted virtually via Zoom for Healthcare. That means no commute and no waiting room, and it means I can see clients anywhere in Colorado &mdash; from Denver to the Western Slope.</p>
        </div>
        <div class="doc-row" style="display:block">
          <h3 style="font-size:1.125rem;margin-bottom:.35em">Do I have to want to quit drinking or using to work with you?</h3>
          <p style="font-size:.9375rem;margin:0">No. Abstinence is one good goal among several. If harm reduction is where you are, that is where we start. I am not going to hand you a verdict on your use before we have even talked about it.</p>
        </div>
        <div class="doc-row" style="display:block">
          <h3 style="font-size:1.125rem;margin-bottom:.35em">What happens in a first session?</h3>
          <p style="font-size:.9375rem;margin:0">Mostly history and orientation &mdash; what brought you here, what you have already tried, what you want to be different, and how we will know it is working. You do not need to prepare anything or explain everything up front.</p>
        </div>
        <div class="doc-row" style="display:block">
          <h3 style="font-size:1.125rem;margin-bottom:.35em">How long will I be in therapy?</h3>
          <p style="font-size:.9375rem;margin:0">Most people start weekly and taper as things steady out. Some people come for a few months around a specific crisis; others stay longer. You set the goals, and we revisit whether it is still working.</p>
        </div>
        <div class="doc-row" style="display:block">
          <h3 style="font-size:1.125rem;margin-bottom:.35em">Do you work with teenagers?</h3>
          <p style="font-size:.9375rem;margin:0">Yes. I work with both adolescents and adults on substance use, grief, and mental health concerns.</p>
        </div>
        <div class="doc-row" style="display:block">
          <h3 style="font-size:1.125rem;margin-bottom:.35em">Can you provide a court-ordered assessment?</h3>
          <p style="font-size:.9375rem;margin:0">Yes. Substance use and mental health assessments are frequently requested by courts, probation, employers, and licensing boards. You receive written findings with level-of-care recommendations, released only where you authorize it in writing.</p>
        </div>
        <div class="doc-row" style="display:block">
          <h3 style="font-size:1.125rem;margin-bottom:.35em">Do you offer supervision for CAC certification?</h3>
          <p style="font-size:.9375rem;margin:0">Yes. I supervise graduate interns, pre-licensed professionals, and peer recovery coaches, and CAC Core Curriculum credit is available where applicable.</p>
        </div>
        <div class="doc-row" style="display:block">
          <h3 style="font-size:1.125rem;margin-bottom:.35em">What if I am in crisis right now?</h3>
          <p style="font-size:.9375rem;margin:0">Call or text 988 to reach the Suicide &amp; Crisis Lifeline, answered in Colorado 24 hours a day. If you are in immediate danger, call 911. This website is not a crisis service and messages here are not monitored around the clock.</p>
        </div>
        <div class="doc-row" style="display:block">
          <h3 style="font-size:1.125rem;margin-bottom:.35em">What is a Good Faith Estimate?</h3>
          <p style="font-size:.9375rem;margin:0">Under the No Surprises Act, clients who are uninsured or not using insurance have the right to a written estimate of expected costs before care begins. One is provided to qualifying clients and to anyone else on request.</p>
        </div>
        <div class="doc-row" style="display:block">
          <h3 style="font-size:1.125rem;margin-bottom:.35em">How do I get started?</h3>
          <p style="font-size:.9375rem;margin:0">Send a note through the contact page, email kelly@coolbirdcounseling.com, or call (303) 351-1068. I reply within one business day, and the consultation is free with no obligation to book.</p>
        </div>
      </div>
    </div>
  </section>

${contactForm('Still have a question?', 'Ask directly. No obligation, no sales pitch.')}
`,
});


/* ================================ BLOG ================================= */
/* Posts live as markdown in content/posts/ so TinaCMS can edit them.
   Re-run `node build.js` (Tina does this automatically) to regenerate. */
function parsePosts() {
  const dir = path.join(OUT, 'content', 'posts');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.md')).map(f => {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    const fm = {}, meta = m ? m[1] : '', body = m ? m[2] : raw;
    /* Frontmatter is written by two different hands: by us, and by TinaCMS
       when Kelly saves. Tina emits YAML block lists and full ISO datetimes,
       so both shapes have to parse or her edits silently drop fields. */
    const unquote = t => t.trim().replace(/^['"](.*)['"]$/, '$1');
    const lines = meta.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const kv = lines[i].match(/^(\w+):\s*(.*)$/);
      if (!kv) continue;
      const key = kv[1];
      let v = kv[2].trim();
      if (v === '') {
        // YAML block list:  tags:\n  - recovery\n  - grief
        const items = [];
        while (i + 1 < lines.length && /^\s*-\s+/.test(lines[i + 1])) {
          items.push(unquote(lines[++i].replace(/^\s*-\s+/, '')));
        }
        fm[key] = items.length ? items : '';
      } else if (v.startsWith('[')) {
        fm[key] = v.slice(1, -1).split(',').map(unquote).filter(Boolean);
      } else {
        fm[key] = unquote(v);
      }
    }
    fm.slug = fm.slug || f.replace(/\.md$/, '');
    fm.file = 'blog-' + fm.slug + '.html';
    fm.md = body.trim();
    // Tina's datetime field stores a full ISO string; our date helpers and the
    // BlogPosting schema both want a plain YYYY-MM-DD.
    fm.date = String(fm.date || '').slice(0, 10);
    // Tina writes `published: true|false`. Anything without the field is
    // treated as published so existing posts keep working.
    fm.published = String(fm.published === undefined ? 'true' : fm.published) === 'true';
    return fm;
  })
  .filter(pg => {
    if (!pg.published) console.log('skipping unpublished post: ' + pg.slug);
    return pg.published;
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/* minimal markdown → HTML: headings, bold, italic, links, paragraphs */
function mdToHtml(md) {
  const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = t => esc(t)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+?)\*/g, '$1<em>$2</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/ — /g, ' &mdash; ');
  return md.split(/\n{2,}/).map(block => {
    const b = block.trim();
    if (!b) return '';
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(b)) return '<hr>';
    if (b.startsWith('### ')) return `<h3 style="margin-top:2rem">${inline(b.slice(4))}</h3>`;
    if (b.startsWith('## ')) return `<h2 style="margin-top:2.5rem">${inline(b.slice(3))}</h2>`;
    if (b.startsWith('# ')) return `<h2>${inline(b.slice(2))}</h2>`;
    if (/^>\s?/.test(b)) {
      return `<blockquote>${inline(b.split('\n').map(l => l.replace(/^>\s?/, '')).join(' '))}</blockquote>`;
    }
    /* Tina's rich-text editor produces real markdown lists. Without these two
       branches a bulleted list renders as one paragraph full of hyphens. */
    if (/^[-*+]\s+/.test(b)) {
      const items = b.split('\n').filter(l => /^\s*[-*+]\s+/.test(l))
        .map(l => `<li>${inline(l.replace(/^\s*[-*+]\s+/, ''))}</li>`).join('');
      return `<ul>${items}</ul>`;
    }
    if (/^\d+[.)]\s+/.test(b)) {
      const items = b.split('\n').filter(l => /^\s*\d+[.)]\s+/.test(l))
        .map(l => `<li>${inline(l.replace(/^\s*\d+[.)]\s+/, ''))}</li>`).join('');
      return `<ol>${items}</ol>`;
    }
    return `<p>${inline(b).replace(/\n/g, ' ')}</p>`;
  }).filter(Boolean).join('\n      ');
}

const POSTS = parsePosts();
const prettyDate = d => new Date(d + 'T12:00:00').toLocaleDateString('en-US',
  { year: 'numeric', month: 'long', day: 'numeric' });

POSTS.forEach(post => {
  pages.push({
    file: post.file,
    banner: post.hero, bannerAlt: post.heroAlt,
    title: post.title,
    description: post.description,
    schema: [{
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      author: { '@id': SITE + '/#kelly' },
      publisher: { '@id': SITE + '/#practice' },
      mainEntityOfPage: SITE + '/' + post.file,
      keywords: [].concat(post.tags || []).join(', '),
    }],
    body: `
  <section class="page-head wrap">
    <p class="eyebrow"><a href="blog.html" style="color:inherit;text-decoration:none">Blog</a></p>
    <h1>${post.title}</h1>
    <p class="lede">${prettyDate(post.date)}${(post.tags || []).length ? ' &middot; ' + [].concat(post.tags).join(', ') : ''}</p>
  </section>

  <article class="section" style="padding-top:0">
    <div class="wrap narrow">
      ${mdToHtml(post.md)}
      <p class="callout" style="margin-top:3rem">
        Kelly Faus, MA, LPC, LAC is an addiction and mental health counselor serving clients
        throughout Colorado by telehealth. <a href="contact.html">Book a free consultation &rarr;</a>
      </p>
    </div>
  </article>

${contactForm('Start your journey today', 'A short conversation costs nothing and commits you to nothing.')}
`,
  });
});

pages.push({
  file: 'blog.html',
  title: 'Blog | Cool Bird Counseling, Colorado',
  description: 'Plain-language writing on addiction, recovery, grief, and mental health from Kelly Faus, MA, LPC, LAC, a counselor serving clients throughout Colorado.',
  schema: [{ '@type': 'Blog', name: 'Cool Bird Counseling Blog', url: SITE + '/blog.html',
             author: { '@id': SITE + '/#kelly' } }],
  body: `
  <section class="page-head wrap">
    <p class="eyebrow">Blog</p>
    <h1>Notes from the practice.</h1>
    <p class="lede">Plain writing on addiction, recovery, grief, and getting started &mdash; the things people ask about before they ever pick up the phone.</p>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap narrow">
      ${POSTS.map(post => `
      <article class="framed" style="margin-bottom:1.5rem">
        <p class="eyebrow" style="margin-bottom:.5rem">${prettyDate(post.date)}</p>
        <h2 style="font-size:clamp(1.375rem,2.6vw,1.75rem)"><a href="${post.file}" style="color:var(--ink);text-decoration:none">${post.title}</a></h2>
        <p style="font-size:.9375rem">${post.description}</p>
        <p style="margin-top:1.25rem"><a href="${post.file}">Read it &rarr;</a></p>
      </article>`).join('\n')}
    </div>
  </section>

${contactForm('Rather just talk?', 'Reading only gets you so far. The consultation is free.')}
`,
});


/* ============================ LEGAL PAGES ============================== */
const legalWrap = (eyebrow, h1, lede, body) => `
  <section class="page-head wrap">
    <p class="eyebrow">${eyebrow}</p>
    <h1>${h1}</h1>
    <p class="lede">${lede}</p>
  </section>
  <section class="section" style="padding-top:0">
    <div class="wrap narrow stack">${body}</div>
  </section>`;

pages.push({
  file: 'privacy-policy.html',
  title: 'Privacy Policy | Cool Bird Counseling',
  description: 'How Cool Bird Counseling LLC handles information collected through this website, and how that differs from protected health information covered by HIPAA.',
  body: legalWrap('Privacy Policy', 'Privacy Policy',
    `Last updated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`, `
      <p class="callout">
        <strong>This policy covers the website only.</strong> Protected health information created
        in the course of treatment is governed separately by the
        <a href="assets/cool-bird-hipaa-notice.pdf">Notice of Privacy Practices</a>, which you
        receive before your first session.
      </p>

      <h2>What this site collects</h2>
      <p>
        If you use the contact form, I receive the name, email address, phone number, and message
        you submit. That information is used to respond to you and to schedule care. It is not sold,
        rented, or shared for marketing, ever.
      </p>
      <p>
        The site uses privacy-respecting analytics to understand which pages people find useful.
        This records aggregate information such as page views, approximate region, and referring
        site. It does not identify you personally, and it is not tied to any clinical record.
      </p>

      <h2>What this site does not collect</h2>
      <ul class="ticks">
        <li>No advertising trackers, retargeting pixels, or third-party ad networks</li>
        <li>No sale or sharing of any information with data brokers</li>
        <li>Nothing entered into the Safety Plan generator &mdash; that stays in your browser and is never transmitted</li>
      </ul>

      <h2>Email and the contact form</h2>
      <p>
        Standard email and web forms are not secure channels for health information. Please keep
        clinical detail out of them; we will move to a secure channel once we connect. A message
        sent through this site does not establish a therapeutic relationship.
      </p>

      <h2>Retention</h2>
      <p>
        Contact-form messages are kept only as long as needed to respond and, where care begins, to
        meet the record-keeping requirements that apply to licensed counselors in Colorado.
        Analytics data is aggregate and retained on a rolling basis.
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask what information is held about you, ask for it to be corrected, or ask for it to
        be deleted where no legal or clinical retention requirement applies. Write to
        <a href="mailto:kelly@coolbirdcounseling.com">kelly@coolbirdcounseling.com</a>.
      </p>

      <h2>Children</h2>
      <p>
        This site is not directed at children under 13 and does not knowingly collect their
        information. Adolescent clients are seen with the consents Colorado law requires.
      </p>

      <h2>Changes</h2>
      <p>Material changes will be posted here with a revised date.</p>

      <h2>Contact</h2>
      <p>
        Cool Bird Counseling LLC &middot;
        <a href="mailto:kelly@coolbirdcounseling.com">kelly@coolbirdcounseling.com</a> &middot;
        <a href="tel:+13033511068">(303) 351-1068</a>
      </p>`),
});

pages.push({
  file: 'terms.html',
  title: 'Terms & Conditions | Cool Bird Counseling',
  description: 'Terms of use for the Cool Bird Counseling website, including the limits of information provided here and what does not constitute clinical advice.',
  body: legalWrap('Terms', 'Terms &amp; Conditions',
    `Last updated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`, `
      <p class="callout">
        <strong>This website is not a crisis service.</strong> If you are in crisis, call or text
        <a href="tel:988">988</a>. If you are in immediate danger, call <a href="tel:911">911</a>.
        Messages sent through this site are not monitored around the clock.
      </p>

      <h2>Informational only</h2>
      <p>
        Everything on this site is general information about counseling and mental health. It is not
        clinical advice, diagnosis, or treatment, and reading it does not create a counselor&ndash;client
        relationship. That relationship begins only when you and I have agreed to work together and
        the required consents are signed.
      </p>

      <h2>Licensure and scope</h2>
      <p>
        Kelly R. Faus is a Licensed Professional Counselor and Licensed Addiction Counselor in the
        State of Colorado. Services are available only to people physically located in Colorado at
        the time of a session. Colorado licenses can be verified through the Department of
        Regulatory Agencies.
      </p>

      <h2>Appointments, fees, and cancellations</h2>
      <ul class="ticks">
        <li>Current rates are listed on the <a href="services.html">Services</a> page and may change with notice</li>
        <li>Please give 24 hours&rsquo; notice to change or cancel; late cancellations and no-shows may be billed at the full rate</li>
        <li>Payment is due at the time of service unless other arrangements are made in writing</li>
        <li>A Good Faith Estimate is available to qualifying clients and on request</li>
      </ul>

      <h2>Telehealth</h2>
      <p>
        Sessions are conducted over Zoom for Healthcare. You are responsible for a private location
        and a working connection. Telehealth carries limitations, including the possibility of
        technical interruption; these are covered in the telehealth consent you sign before starting.
      </p>

      <h2>Third-party links and documents</h2>
      <p>
        Resources listed on this site belong to independent organizations. Listing them is a starting
        point, not an endorsement of any particular course of treatment, and I am not responsible for
        their content or practices.
      </p>

      <h2>The Safety Plan generator</h2>
      <p>
        The <a href="safety-plan.html">Safety Plan generator</a> is an educational tool. It does not
        store or transmit what you enter, and it is not a substitute for a safety plan developed with
        a clinician. Print or save your plan before leaving the page.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        This site is provided as is. To the fullest extent permitted by Colorado law, Cool Bird
        Counseling LLC is not liable for damages arising from use of, or reliance on, information
        presented here. These terms are governed by the laws of the State of Colorado.
      </p>

      <h2>Contact</h2>
      <p>
        Cool Bird Counseling LLC &middot;
        <a href="mailto:kelly@coolbirdcounseling.com">kelly@coolbirdcounseling.com</a> &middot;
        <a href="tel:+13033511068">(303) 351-1068</a>
      </p>`),
});

/* ---------- write -------------------------------------------------------- */

/* Cloudflare Pages serves clean URLs natively (/about, not /about.html) and
   308-redirects the .html form. Emitting clean hrefs avoids a redirect hop on
   every click and keeps canonicals matching the real URL. */
const cleanLinks = (html) => html
  .replace(/href="index\.html"/g, 'href="/"')
  .replace(/href="([a-z0-9-]+)\.html(#[^"]*)?"/g, (m, n, hash) => `href="/${n}${hash || ''}"`);

for (const p of pages) {
  fs.writeFileSync(path.join(OUT, p.file), cleanLinks(page(p)));
  console.log('wrote', p.file);
}

/* ================= sitemap / robots / llms / redirects ================== */
const today = new Date().toISOString().slice(0, 10);
const clean = f => (f === 'index.html' ? '' : f.replace(/\.html$/, ''));
const urlOf = f => SITE + '/' + clean(f);
const priority = f => f === 'index.html' ? '1.0'
  : /^(services|contact|about)\.html$/.test(f) ? '0.9'
  : /^service-/.test(f) ? '0.8'
  : /^(blog|faq|resources|documents|safety-plan)\.html$/.test(f) ? '0.7'
  : /^blog-/.test(f) ? '0.6' : '0.3';

fs.writeFileSync(path.join(OUT, 'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(pg => `  <url>
    <loc>${urlOf(pg.file)}</loc>
    <lastmod>${today}</lastmod>
    <priority>${priority(pg.file)}</priority>
  </url>`).join('\n')}
</urlset>
`);

fs.writeFileSync(path.join(OUT, 'robots.txt'),
`User-agent: *
Allow: /
Disallow: /admin/

# AI crawlers are welcome — see /llms.txt for a structured summary
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: ${SITE}/sitemap.xml
`);

fs.writeFileSync(path.join(OUT, 'llms.txt'),
`# Cool Bird Counseling LLC

> Addiction, grief, and mental health counseling for adolescents and adults throughout
> Colorado, delivered by telehealth. Solo practice of Kelly R. Faus, MA, LPC, LAC.

## Practitioner
Kelly R. Faus, MA, LPC, LAC — Licensed Professional Counselor and Licensed Addiction
Counselor in Colorado. Trained at Adams State University and the University of Northern
Colorado. Gottman Method training, Levels 1 & 2. Also serves as Clinical Director at Denver
Recovery Solutions and as a supervisor with Lost and Found Behavioral Wellness.

## Services and rates
- Individual Psychotherapy — $100, 45–60 minutes: ${SITE}/service-individual-psychotherapy.html
- Substance Use & Mental Health Assessment — $150, 60–90 minutes: ${SITE}/service-assessment.html
- Clinical Supervision (CAC Core Curriculum credit available), rate on request: ${SITE}/service-clinical-supervision.html

## Key facts
- All sessions are virtual, via Zoom for Healthcare, anywhere in Colorado
- Private pay available; ask about current network participation
- Works with substance use, grief, depression, anxiety, trauma, anger, and codependency
- Adolescents and adults
- Good Faith Estimate provided to qualifying clients and on request

## Pages
${pages.map(pg => `- ${pg.title.split('|')[0].trim()}: ${urlOf(pg.file)}`).join('\n')}

## Contact
Email: kelly@coolbirdcounseling.com
Phone: (303) 351-1068
Crisis: call or text 988 (Suicide & Crisis Lifeline). Emergencies: 911.
This site is not a crisis service.
`);

/* Cloudflare Pages redirects — every URL from the old Google Sites build.
   Switch on at cutover; no existing link 404s. */
fs.writeFileSync(path.join(OUT, '_redirects'),
`# Old Google Sites URL -> new home. Everything else is already a clean URL on
# Cloudflare Pages (/about serves about.html automatically), and 404.html at the
# root is picked up natively — declaring either here causes a redirect loop.
/home    /    301
`);

fs.writeFileSync(path.join(OUT, '404.html'), cleanLinks(page({
  file: '404.html',
  title: 'Page not found | Cool Bird Counseling',
  description: 'That page has moved or no longer exists. Here is where to find what you were looking for.',
  body: `
  <section class="page-head wrap">
    <p class="eyebrow">404</p>
    <h1>That page flew off somewhere.</h1>
    <p class="lede">The link may be old, or the page may have moved. Everything is one click away below.</p>
  </section>
  <section class="section" style="padding-top:0">
    <div class="wrap narrow">
      <div class="framed">
        <ul class="ticks">
          <li><a href="index.html">Home</a> &mdash; start here</li>
          <li><a href="services.html">Services and rates</a></li>
          <li><a href="about.html">About Kelly Faus</a></li>
          <li><a href="documents.html">Documents</a> and the <a href="safety-plan.html">Safety Plan generator</a></li>
          <li><a href="resources.html">Crisis and recovery resources</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
        <p class="callout" style="margin-top:2rem">
          In crisis? Call or text <a href="tel:988">988</a>, any hour of the day.
        </p>
      </div>
    </div>
  </section>`,
})));
fs.writeFileSync(path.join(OUT, '_headers'),
`/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=(), interest-cohort=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/sitemap.xml
  Cache-Control: public, max-age=3600
/robots.txt
  Cache-Control: public, max-age=3600
/llms.txt
  Cache-Control: public, max-age=3600

/favicon.ico
  Cache-Control: public, max-age=604800
/site.webmanifest
  Cache-Control: public, max-age=604800
  Content-Type: application/manifest+json

# The CMS is Kelly's, not the public's — keep it out of search results.
/admin/*
  X-Robots-Tag: noindex, nofollow
`);

/* Unpublishing must actually remove the page. Without this the previous
   build's blog-<slug>.html stays on disk, gets deployed, and remains a live
   orphan URL that search engines keep serving. */
const livePostFiles = new Set(POSTS.map(pg => pg.file));
fs.readdirSync(OUT)
  .filter(f => /^blog-.+\.html$/.test(f) && !livePostFiles.has(f))
  .forEach(f => { fs.unlinkSync(path.join(OUT, f)); console.log('removed unpublished page: ' + f); });

fs.writeFileSync(path.join(OUT, 'site.webmanifest'), JSON.stringify({
  name: 'Cool Bird Counseling',
  short_name: 'Cool Bird',
  description: 'Addiction, grief, and mental health counseling by telehealth throughout Colorado.',
  start_url: '/',
  scope: '/',
  display: 'browser',
  background_color: '#f8f7f6',
  theme_color: '#2f4038',
  icons: [
    { src: '/assets/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
    { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    { src: '/assets/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
  ],
}, null, 2) + '\n');

console.log('wrote sitemap.xml, robots.txt, llms.txt, site.webmanifest, _redirects, _headers, 404.html');
