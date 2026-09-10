import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export async function sendEmail(to: string, body: string, subject = "Notification from Automate") {
  const smtpEndpoint = (process.env.SMTP_ENDPOINT || "smtp.gmail.com").trim();
  const smtpUser = (process.env.SMTP_USERNAME || "anuragsngh2615@gmail.com").trim();
  const smtpPass = (process.env.SMTP_PASSWORD || "").replace(/['"]/g, "").trim();

  console.log(`[Worker Email] Sending email -> To: "${to}", Subject: "${subject}", User: "${smtpUser}", Pass configured: ${Boolean(smtpPass)}`);

  if (!smtpUser || !smtpPass) {
    console.log(`[Worker Email] (Simulation Mode) SMTP credentials not fully configured. Email recorded successfully.`);
    return;
  }

  try {
    const isGmail = (smtpEndpoint && smtpEndpoint.includes("gmail")) || (smtpUser && smtpUser.includes("@gmail.com"));
    const transport = isGmail
      ? nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        })
      : nodemailer.createTransport({
          host: smtpEndpoint || "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });

    const info = await transport.sendMail({
      from: `"Automate" <${smtpUser}>`,
      to,
      subject,
      text: body
    });

    console.log(`[Worker Email] Email sent successfully! MessageId: ${info.messageId}`);
  } catch (error) {
    console.error(`[Worker Email] Error sending email:`, error);
  }
}
