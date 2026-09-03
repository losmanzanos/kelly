/**
 * Cloudflare Pages Function — contact form handler.
 * POST /api/contact
 *
 * Environment variables (set in Cloudflare Pages → Settings → Variables):
 *   RESEND_API_KEY   required — Resend API key (secret)
 *   TO_EMAIL         required — where inquiries land
 *   FROM_EMAIL       required — verified Resend sender, e.g.
 *                    "Cool Bird Counseling <website@notify.coolbirdcounseling.com>"
 *   TURNSTILE_SECRET optional — enables Cloudflare Turnstile verification
 */

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
           .replace(/"/g, '&quot;');

const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim());

function template({ name, email, phone, message, when }) {
  const row = (label, value) => value
    ? `<tr>
         <td style="padding:0 0 4px;font:600 11px/1.4 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#617061">${esc(label)}</td>
       </tr>
       <tr>
         <td style="padding:0 0 20px;font:16px/1.6 Georgia,'Times New Roman',serif;color:#383d39;white-space:pre-wrap">${esc(value)}</td>
       </tr>`
    : '';
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f8f7f6">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f6;padding:32px 16px">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid rgba(97,112,97,.35)">
      <tr><td style="background:#2f4038;padding:22px 28px">
        <div style="font:600 12px/1.4 Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#a8c4b8">Cool Bird Counseling</div>
        <div style="font:italic 600 22px/1.3 Georgia,serif;color:#ffffff;margin-top:6px">New website inquiry</div>
      </td></tr>
      <tr><td style="padding:28px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${row('From', name)}
          ${row('Email', email)}
          ${row('Phone', phone)}
          ${row('Message', message)}
        </table>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:8px">
          <tr><td style="background:#617061;padding:12px 26px">
            <a href="mailto:${esc(email)}" style="font:500 15px/1 Arial,sans-serif;color:#ffffff;text-decoration:none">Reply to ${esc(name)}</a>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="border-top:1px solid rgba(97,112,97,.25);padding:16px 28px;font:12px/1.6 Arial,sans-serif;color:#6d726d">
        Sent from coolbirdcounseling.com · ${esc(when)}<br>
        Reply directly to this email and it goes straight back to them.
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export async function onRequestPost({ request, env }) {
  let data;
  try {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      data = await request.json();
    } else {
      data = Object.fromEntries(await request.formData());
    }
  } catch {
    return json({ ok: false, error: 'Could not read that submission.' }, 400);
  }

  // Honeypot: real people never fill this in.
  if (data.company) return json({ ok: true });

  const name = String(data.name || '').trim().slice(0, 120);
  const email = String(data.email || '').trim().slice(0, 200);
  const phone = String(data.phone || '').trim().slice(0, 60);
  const message = String(data.message || '').trim().slice(0, 5000);

  if (!name || !validEmail(email) || !message) {
    return json({ ok: false, error: 'Please add your name, a valid email, and a message.' }, 400);
  }

  // Optional Turnstile check
  if (env.TURNSTILE_SECRET) {
    const token = data['cf-turnstile-response'];
    const ip = request.headers.get('CF-Connecting-IP') || '';
    const body = new FormData();
    body.append('secret', env.TURNSTILE_SECRET);
    body.append('response', token || '');
    if (ip) body.append('remoteip', ip);
    const v = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body,
    }).then((r) => r.json()).catch(() => ({ success: false }));
    if (!v.success) return json({ ok: false, error: 'Spam check failed. Please try again.' }, 400);
  }

  if (!env.RESEND_API_KEY || !env.TO_EMAIL || !env.FROM_EMAIL) {
    return json({ ok: false, error: 'Email is not configured yet.' }, 500);
  }

  const when = new Date().toLocaleString('en-US', {
    timeZone: 'America/Denver', dateStyle: 'full', timeStyle: 'short',
  }) + ' MT';

  // Accept either a bare address or a full "Name <addr>" in FROM_EMAIL, so the
  // env var stays simple enough to paste into a .env import without quoting.
  const from = /</.test(env.FROM_EMAIL)
    ? env.FROM_EMAIL
    : `Cool Bird Counseling <${env.FROM_EMAIL}>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [env.TO_EMAIL],
      reply_to: email,
      subject: `New inquiry from ${name}`,
      html: template({ name, email, phone, message, when }),
      text: `New inquiry from ${name}\n\nEmail: ${email}\nPhone: ${phone || '—'}\n\n${message}\n\nSent ${when}`,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('Resend error', res.status, detail);
    return json({ ok: false, error: 'Message could not be sent. Please email directly.' }, 502);
  }

  return json({ ok: true });
}

export const onRequest = () =>
  json({ ok: false, error: 'Method not allowed.' }, 405);
