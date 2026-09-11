import nodemailer from "nodemailer";

export async function sendEmail(to: string, body: string, subject = "Notification from Automate") {
  const smtpEndpoint = (process.env.SMTP_ENDPOINT || "smtp.gmail.com").trim();
  const smtpUser = (process.env.SMTP_USERNAME || "anuragsngh2615@gmail.com").trim();
  const smtpPass = (process.env.SMTP_PASSWORD || "bomnlcpsgoxkyqmq").replace(/['"]/g, "").trim();

  console.log(`[Worker Email] Sending email -> To: "${to}", Subject: "${subject}", User: "${smtpUser}", Pass configured: ${Boolean(smtpPass)}`);

  if (!smtpUser || !smtpPass) {
    console.log(`[Worker Email] (Simulation Mode) SMTP credentials not fully configured. Email recorded successfully.`);
    return;
  }

  try {
    const transport = nodemailer.createTransport({
      host: smtpEndpoint || "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      family: 4,
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
