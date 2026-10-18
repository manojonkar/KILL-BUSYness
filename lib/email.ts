export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
}

export interface EmailResult {
  success: boolean;
  provider?: "brevo" | "resend";
  error?: string;
  id?: string;
}

/**
 * Universal Portal Email Dispatcher:
 * Rule 1: Always attempts Brevo first (REST API v3).
 * Rule 2: Only after Brevo fails or quota is exhausted, fall back to Resend.
 */
export async function sendPortalEmail(options: EmailOptions): Promise<EmailResult> {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;

  const defaultFrom = "Team KILL BUSYness <admin@killbusyness.com>";
  const fromStr = options.from || defaultFrom;
  const replyTo = options.replyTo || "admin@managementinnovations.co.in";

  // Parse sender name and email
  let senderName = "Team KILL BUSYness";
  let senderEmail = "admin@killbusyness.com";
  const match = fromStr.match(/^(.*?)\s*<([^>]+)>$/);
  if (match) {
    senderName = match[1].trim();
    senderEmail = match[2].trim();
  }

  const toList = Array.isArray(options.to) ? options.to : [options.to];
  
  // Rule: Killbusynessteam@gmail.com is ALWAYS CC'd on every portal email,
  // unless the email is sent directly to the team inbox itself.
  const requiredCc = "Killbusynessteam@gmail.com";
  const userCc = options.cc 
    ? (Array.isArray(options.cc) ? options.cc : [options.cc]) 
    : [];
  const combinedCc = Array.from(new Set([...userCc, requiredCc]))
    .filter(email => !toList.some(to => to.toLowerCase() === email.toLowerCase()));
  const ccList = combinedCc;

  // --- ATTEMPT 1: BREVO (FIRST PRIORITY) ---
  if (brevoApiKey) {
    try {
      // In Brevo, the verified sender address is admin@managementinnovations.co.in
      const brevoSenderEmail = "admin@managementinnovations.co.in";
      const payload: any = {
        sender: { name: senderName, email: brevoSenderEmail },
        to: toList.map(email => ({ email })),
        subject: options.subject,
        htmlContent: options.html,
        replyTo: { email: replyTo }
      };

      if (options.text) {
        payload.textContent = options.text;
      }
      if (ccList.length > 0) {
        payload.cc = ccList.map(email => ({ email }));
      }

      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        console.log("[EmailService] Successfully sent via Brevo to:", toList, "ID:", data?.messageId);
        return { success: true, provider: "brevo", id: data?.messageId };
      }

      const errText = await res.text().catch(() => "");
      console.warn(`[EmailService] Brevo returned status ${res.status}. Error: ${errText}. Falling back to Resend...`);
    } catch (err: any) {
      console.warn(`[EmailService] Brevo network exception: ${err.message}. Falling back to Resend...`);
    }
  }

  // --- ATTEMPT 2: RESEND (FALLBACK ONLY AFTER BREVO) ---
  if (!resendApiKey) {
    console.error("[EmailService] RESEND_API_KEY is not configured and Brevo failed.");
    return { success: false, error: "Neither Brevo nor Resend could send the email." };
  }

  try {
    const resendSender = `${senderName} <admin@killbusyness.com>`;
    const resendPayload: any = {
      from: resendSender,
      to: toList,
      subject: options.subject,
      html: options.html,
      reply_to: replyTo
    };

    if (options.text) {
      resendPayload.text = options.text;
    }
    if (ccList.length > 0) {
      resendPayload.cc = ccList;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(resendPayload)
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      console.log("[EmailService] Successfully sent via Resend fallback to:", toList, "ID:", data?.id);
      return { success: true, provider: "resend", id: data?.id };
    }

    const errDetail = await res.text().catch(() => "");
    console.error(`[EmailService] Resend also failed with status ${res.status}: ${errDetail}`);
    return { success: false, error: `Resend failed (${res.status}): ${errDetail}` };
  } catch (err: any) {
    console.error(`[EmailService] Resend exception: ${err.message}`);
    return { success: false, error: err.message };
  }
}
