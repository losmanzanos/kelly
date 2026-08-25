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
        <div><h3>Insurance or private pay</h3><p>In-network through SonderMind, Medicaid through Colorado Access, or straightforward self-pay.</p></div>
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
          I trained at Adams State University and the University of Northern Colorado, and I&rsquo;m
          trained in the Gottman method for couples work. Alongside this practice I serve as a therapist
          with Ascent Clinical Services, Hazelbrook Sober Living, and Compassionate Care Counseling LLC.
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
          <h3>Couples Counseling</h3>
          <div class="price">$150</div>
          <p class="meta">60 minute session</p>
          <p class="desc">Gottman-method work for partners rebuilding trust, communication, and connection &mdash; including couples in recovery.</p>
          <a class="btn btn--outline" href="contact.html">Schedule Appointment</a>
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
        I&rsquo;m an addiction and mental health counselor licensed in Colorado, and a Certified
        Addiction Specialist. I work with adolescents and adults on substance use, grief, depression,
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
        University and the University of Northern Colorado. I&rsquo;m trained in the Gottman method for
        couples therapy. Alongside Cool Bird Counseling, I work as a therapist with Ascent Clinical
        Services, Hazelbrook Sober Living, and Compassionate Care Counseling LLC.
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
        <li>Couples rebuilding communication and trust</li>
        <li>Graduate interns and pre-licensed clinicians seeking supervision</li>
      </ul>

      <h3 style="margin-top:2.5rem">Credentials</h3>
      <ul class="ticks">
        <li>MA, Clinical Mental Health Counseling</li>
        <li>Licensed Professional Counselor (LPC), Colorado</li>
        <li>Licensed Addiction Counselor (LAC), Colorado</li>
        <li>Gottman method training, couples therapy</li>
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
  description: 'Individual psychotherapy, substance use and mental health assessment, couples counseling, and clinical supervision. Telehealth across Colorado. Insurance and private pay options.',
  body: `
  <section class="page-head wrap">
    <p class="eyebrow">Services</p>
    <h1>Care that fits the shape of your week.</h1>
    <p class="lede">All sessions are conducted virtually via Zoom for Healthcare, so you can meet from home, from the office, or from a parked car between obligations.</p>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap">
      <div class="grid grid--2">

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
          <h3>Couples Counseling</h3>
          <div class="price">$150</div>
          <p class="meta">60 minute session</p>
          <p class="desc">
            Gottman-method couples work for partners rebuilding communication, trust, and connection.
            Especially useful for couples where one or both partners are in recovery, where a betrayal
            needs repair, or where the same argument keeps arriving in different costumes.
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
        <strong>Commercial insurance.</strong> I&rsquo;m in network through SonderMind, which contracts
        with most major Colorado plans. SonderMind verifies your benefits before the first session so you
        know your cost up front.
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
  description: 'Intake paperwork, informed consent, telehealth consent, privacy practices, and release of information forms for Cool Bird Counseling clients in Colorado.',
  body: `
  <section class="page-head wrap">
    <p class="eyebrow">Documents</p>
    <h1>Paperwork, handled before we meet.</h1>
    <p class="lede">Everything you&rsquo;ll be asked to sign is here, so you can read it on your own time rather than skimming it five minutes before a session.</p>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap narrow">
      <div class="framed">
        <h2 style="font-size:1.375rem">New client packet</h2>
        <p style="font-size:.9375rem;margin-bottom:2rem">
          After our consultation you&rsquo;ll receive a secure link to complete these electronically.
          Copies are posted here for reference.
        </p>

        <div class="doc-row">
          <div class="doc-row__text">
            <strong>Client Intake Form</strong>
            <span>Contact details, history, current concerns, and goals for counseling.</span>
          </div>
          <span class="tag">Coming soon</span>
        </div>

        <div class="doc-row">
          <div class="doc-row__text">
            <strong>Informed Consent for Treatment</strong>
            <span>What counseling involves, your rights as a client, and the limits of confidentiality.</span>
          </div>
          <span class="tag">Coming soon</span>
        </div>

        <div class="doc-row">
          <div class="doc-row__text">
            <strong>Telehealth Consent</strong>
            <span>How virtual sessions work, technology requirements, and safety planning.</span>
          </div>
          <span class="tag">Coming soon</span>
        </div>

        <div class="doc-row">
          <div class="doc-row__text">
            <strong>Notice of Privacy Practices (HIPAA)</strong>
            <span>How your protected health information is used, stored, and safeguarded.</span>
          </div>
          <span class="tag">Coming soon</span>
        </div>

        <div class="doc-row">
          <div class="doc-row__text">
            <strong>Practice Policies &amp; Fee Agreement</strong>
            <span>Scheduling, cancellations, payment, communication, and after-hours contact.</span>
          </div>
          <span class="tag">Coming soon</span>
        </div>

        <div class="doc-row">
          <div class="doc-row__text">
            <strong>Authorization to Release Information</strong>
            <span>Use this to authorize communication with a physician, attorney, or treatment program.</span>
          </div>
          <span class="tag">Coming soon</span>
        </div>

        <div class="doc-row" style="border-bottom:0">
          <div class="doc-row__text">
            <strong>Good Faith Estimate</strong>
            <span>Written cost estimate for clients not using insurance, per the No Surprises Act.</span>
          </div>
          <span class="tag">On request</span>
        </div>
      </div>

      <p class="callout" style="margin-top:2.5rem">
        <strong>Please don&rsquo;t email completed forms.</strong> Standard email isn&rsquo;t a secure
        channel for health information. Use the secure link you&rsquo;re sent, or bring questions to
        your consultation.
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
          <strong>SonderMind</strong>
          <span>Benefit verification and in-network scheduling for most major Colorado commercial plans.</span>
        </li>
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
          <strong>The Gottman Institute</strong>
          <span>Research-backed articles and self-guided tools for couples at <a href="https://www.gottman.com/">gottman.com</a>.</span>
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
      <div class="grid grid--2">
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

/* ---------- write -------------------------------------------------------- */

for (const p of pages) {
  fs.writeFileSync(path.join(OUT, p.file), page(p));
  console.log('wrote', p.file);
}
