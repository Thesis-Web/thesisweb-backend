// src/email/welcome.ts
export function buildWelcomeEmail(opts: { productName?: string; supportUrl?: string }) {
  const product = opts.productName ?? "ThesisWeb";
  const supportUrl = opts.supportUrl ?? "https://thesisweb.com";

  const subject = `Welcome to ${product}`;

  const text =
`You’re in.

You’ll get periodic updates as we ship.

We don’t sell or share emails.

If you want to support the build, you can do that here:
${supportUrl}

— ThesisWeb`;

  // Keep HTML minimal to avoid deliverability weirdness.
  const html =
`<p>You’re in.</p>
<p>You’ll get periodic updates as we ship.</p>
<p><strong>We don’t sell or share emails.</strong></p>
<p>If you want to support the build, you can do that here:<br/>
<a href="${escapeAttr(supportUrl)}">${escapeHtml(supportUrl)}</a></p>
<p>— ThesisWeb</p>`;

  return { subject, text, html };
}

function escapeHtml(s: string) {
  return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}
function escapeAttr(s: string) {
  return escapeHtml(s).replaceAll('"',"&quot;");
}
