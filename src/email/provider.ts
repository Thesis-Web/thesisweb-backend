// src/email/provider.ts
export type EmailProvider = "resend" | "postmark" | "none";

export type EmailConfig = {
  provider: EmailProvider;
  from: string;
  resendApiKey?: string;
  postmarkServerToken?: string;
};

export type SendEmailArgs = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export function loadEmailConfig(env: NodeJS.ProcessEnv): EmailConfig {
  const provider = (env.EMAIL_PROVIDER ?? "none") as EmailProvider;
  const from = env.EMAIL_FROM ?? "";

  return {
    provider,
    from,
    resendApiKey: env.RESEND_API_KEY,
    postmarkServerToken: env.POSTMARK_SERVER_TOKEN,
  };
}

export async function sendEmail(cfg: EmailConfig, args: SendEmailArgs): Promise<void> {
  if (cfg.provider === "none") return;

  if (!cfg.from) throw new Error("EMAIL_FROM is required when EMAIL_PROVIDER != none");

  if (cfg.provider === "resend") {
    if (!cfg.resendApiKey) throw new Error("RESEND_API_KEY is required for Resend");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cfg.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: cfg.from,
        to: [args.to],
        subject: args.subject,
        text: args.text,
        html: args.html,
      }),
    });

    if (!res.ok) {
      const body = await safeText(res);
      throw new Error(`Resend send failed: ${res.status} ${res.statusText} :: ${body}`);
    }
    return;
  }

  if (cfg.provider === "postmark") {
    if (!cfg.postmarkServerToken) throw new Error("POSTMARK_SERVER_TOKEN is required for Postmark");

    const res = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "X-Postmark-Server-Token": cfg.postmarkServerToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        From: cfg.from,
        To: args.to,
        Subject: args.subject,
        TextBody: args.text,
        HtmlBody: args.html,
      }),
    });

    if (!res.ok) {
      const body = await safeText(res);
      throw new Error(`Postmark send failed: ${res.status} ${res.statusText} :: ${body}`);
    }
    return;
  }

  // exhaustive guard
  const _exhaustive: never = cfg.provider;
  return _exhaustive;
}

async function safeText(res: Response): Promise<string> {
  try { return await res.text(); } catch { return "<no-body>"; }
}
