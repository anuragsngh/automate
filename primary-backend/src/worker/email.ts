import nodemailer from "nodemailer";
import dns from "node:dns";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {}

export async function sendEmail(to: string, body: string, subject = "Notification from Automate") {
  const smtpEndpoint = (process.env.SMTP_ENDPOINT || "smtp.gmail.com").trim();
  const smtpUser = (process.env.SMTP_USERNAME || "anuragsngh2615@gmail.com").trim();
  const smtpPass = (process.env.SMTP_PASSWORD || "bomnlcpsgoxkyqmq").replace(/['"]/g, "").trim();

  console.log(`[Worker Email] Sending email -> To: "${to}", Subject: "${subject}", User: "${smtpUser}", Pass configured: ${Boolean(smtpPass)}`);

  if (!smtpUser || !smtpPass) {
    console.log(`[Worker Email] (Simulation Mode) SMTP credentials not fully configured. Email recorded successfully.`);
    return;
  }

  const brevoKey = (process.env.BREVO_API_KEY || "").trim();
  if (brevoKey) {
    try {
      console.log(`[Worker Email] Sending email via Brevo HTTP API to "${to}"...`);
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sender: { name: "Automate", email: smtpUser },
          to: [{ email: to }],
          subject,
          textContent: body
        })
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`[Worker Email] Email sent successfully via Brevo! ID: ${data.messageId}`);
        return { success: true, messageId: data.messageId, provider: "brevo", to, subject };
      } else {
        console.error(`[Worker Email] Brevo error:`, data);
      }
    } catch (err) {
      console.error(`[Worker Email] Brevo HTTP failed:`, err);
    }
  }

  const resendKey = (process.env.RESEND_API_KEY || "").trim();
  if (resendKey) {
    try {
      console.log(`[Worker Email] Sending email via Resend HTTP API to "${to}"...`);
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "Automate <onboarding@resend.dev>",
          to: [to],
          subject,
          text: body
        })
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`[Worker Email] Email sent successfully via Resend! ID: ${data.id}`);
        return { success: true, messageId: data.id, provider: "resend", to, subject };
      } else {
        console.warn(`[Worker Email] Resend error (e.g. unverified recipient):`, data);
      }
    } catch (err) {
      console.error(`[Worker Email] Resend HTTP failed:`, err);
    }
  }

  try {
    const transport = nodemailer.createTransport({
      host: smtpEndpoint || "smtp.gmail.com",
      port: 465,
      secure: true,
      family: 4,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    } as any);

    const info = await transport.sendMail({
      from: `"Automate" <${smtpUser}>`,
      to,
      subject,
      text: body
    });

    console.log(`[Worker Email] Email sent successfully! MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId, to, subject };
  } catch (error) {
    console.error(`[Worker Email] Error sending email:`, error);
    return { success: false, error: String(error) };
  }
}
