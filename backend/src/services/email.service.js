import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: Number(process.env.BREVO_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

export const sendBillEmail = async ({ to, pdfBuffer, orderId }) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.BREVO_SENDER_NAME}" <${process.env.BREVO_SENDER_EMAIL}>`,
      to,
      subject: `Your Bill - Order #${orderId}`,
      text: "Thanks for your order. Your bill is attached.",
      attachments: [
        {
          filename: `bill-${orderId}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    console.log("✅ Email sent");
  } catch (err) {
    console.error("❌ Email failed:", err);
  }
};