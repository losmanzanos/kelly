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

const NAV = [
  ['index.html',     'Home'],
  ['about.html',     'About'],
  ['services.html',  'Services'],
  ['documents.html', 'Documents'],
  ['safety-plan.html', 'Safety Plan'],
  ['resources.html', 'Resources'],
  ['contact.html',   'Contact'],
];

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

const footer = `<footer class="site-footer">
  <div class="wrap">
    ${logo('light')}
    <nav aria-label="Footer">
      <ul>
        ${NAV.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('\n        ')}
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

const page = ({ file, title, description, body }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Brygada+1918:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600;1,700&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/styles.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${header(file)}
<main id="main">
${body}
</main>
${footer}
</body>
</html>
`;

/* ---------- reusable blocks -------------------------------------------- */

const contactForm = (heading, blurb) => `
  <section class="section" id="contact-form">
    <div class="wrap center">
      <h2>${heading}</h2>
      <p class="narrow">${blurb}</p>
      <form class="form" style="margin-top:2.5rem" method="post" action="#" novalidate>
        <div class="form__row">
          <input type="text" name="name" placeholder="Name" aria-label="Name" required>
          <input type="email" name="email" placeholder="Email Address" aria-label="Email address" required>
        </div>
        <input type="tel" name="phone" placeholder="Phone (optional)" aria-label="Phone number">
        <textarea name="message" placeholder="What brings you here? A sentence or two is plenty." aria-label="Message" required></textarea>
        <button class="btn btn--terracotta" type="submit">Send</button>
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
  title: 'Cool Bird Counseling | Addiction & Mental Health Therapy in Colorado',
  description: 'Confidential addiction counseling, grief support, and mental health therapy for adults and adolescents across Colorado. Telehealth sessions with Kelly Faus, MA, LPC, LAC.',
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

  <section class="section section--tint">
    <div class="wrap center">
      <p class="eyebrow">Same-week openings available</p>
      <div class="grid grid--3" style="margin-top:1.5rem">
        <div><h3>Licensed statewide</h3><p>LPC and LAC in Colorado, seeing clients from Denver to the Western Slope.</p></div>
        <div><h3>Private and secure</h3><p>Sessions run on Zoom for Healthcare. No commute, no waiting room.</p></div>
        <div><h3>Insurance or private pay</h3><p>Medicaid through Colorado Access, straightforward self-pay, or ask about current network participation.</p></div>
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
          <a class="btn btn--outline" href="contact.html">Schedule Appointment</a>
        </article>
        <article class="framed service">
          <h3>Assessment</h3>
          <div class="price">$150</div>
          <p class="meta">60&ndash;90 minute session</p>
          <p class="desc">Substance use and mental health assessment, with written findings and clear recommendations for next steps.</p>
          <a class="btn btn--outline" href="contact.html">Schedule Appointment</a>
        </article>
        <article class="framed service">
          <h3>Clinical Supervision</h3>
          <div class="price" style="font-size:clamp(1.5rem,2.6vw,1.875rem);font-style:italic">Rate on request</div>
          <p class="meta">Individual or group</p>
          <p class="desc">Supervision for graduate interns, pre-licensed professionals, and peer recovery coaches, including CAC Core Curriculum credit.</p>
          <a class="btn btn--outline" href="contact.html">Inquire</a>
        </article>
      </div>
      <p style="margin-top:2.5rem"><a href="services.html">See full service details, rates, and insurance &rarr;</a></p>
    </div>
  </section>

${contactForm('Start your journey today', 'Tell me a little about what you&rsquo;re looking for and I&rsquo;ll reply within one business day.')}
`,
});

/* ============================== ABOUT =================================== */
pages.push({
  file: 'about.html',
  title: 'About Kelly Faus, MA, LPC, LAC | Cool Bird Counseling',
  description: 'Kelly Faus is a Licensed Professional Counselor and Licensed Addiction Counselor in Colorado, trained at Adams State University and the University of Northern Colorado.',
  body: `
  <section class="page-head wrap">
    <p class="eyebrow">About</p>
    <h1>A quiet retreat to help overcome adversity and find meaning.</h1>
    <p class="lede">Counseling that starts where you actually are &mdash; not where a treatment manual says you should be.</p>
  </section>

  <section class="wrap narrow">
    <div class="portrait" style="margin-top:0">
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
          <a class="btn btn--outline" href="contact.html">Schedule Appointment</a>
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
          <a class="btn btn--outline" href="contact.html">Schedule Appointment</a>
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
          <a class="btn btn--outline" href="contact.html">Inquire</a>
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
      <p>
        <strong>Medicaid.</strong> Health First Colorado members are accepted through Colorado Access.
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
  title: 'Colorado Mental Health & Recovery Resources | Cool Bird Counseling',
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
          <strong>Colorado Access</strong>
          <span>Behavioral health coverage for Health First Colorado (Medicaid) members.</span>
        </li>
        <li>
          <strong>Health First Colorado</strong>
          <span>Eligibility and enrollment at <a href="https://www.healthfirstcolorado.com/">healthfirstcolorado.com</a>.</span>
        </li>
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
            <li>Let me know whether you&rsquo;re using insurance, Medicaid, or private pay.</li>
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
            <button type="button" class="btn btn--solid" onclick="buildPlan()">Create my plan</button>
            <button type="button" class="btn btn--outline" onclick="buildPlan(); window.print();">Print / Save as PDF</button>
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
    .sp__actions { display:flex; flex-wrap:wrap; gap:.75rem; }
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
    function buildPlan() {
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
      if (!html) { html = '<p class="v">Fill in a section above, then select &ldquo;Create my plan&rdquo; again.</p>'; }
      document.getElementById('planBody').innerHTML = html;
      var plan = document.getElementById('plan');
      plan.hidden = false;
      plan.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

/* ---------- write -------------------------------------------------------- */

for (const p of pages) {
  fs.writeFileSync(path.join(OUT, p.file), page(p));
  console.log('wrote', p.file);
}
