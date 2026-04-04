const env = require('../config/env');

const sendBillEmail = async ({ to, order, pdfBuffer }) => {
  if (!to) {
    const error = new Error('Customer email is required to send the bill.');
    error.statusCode = 400;
    throw error;
  }

  if (!env.brevoApiKey) {
    return {
      delivered: false,
      skipped: true,
      message: 'BREVO_API_KEY is not configured.',
      to
    };
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': env.brevoApiKey
    },
    body: JSON.stringify({
      sender: {
        name: env.brevoSenderName,
        email: env.brevoSenderEmail
      },
      to: [{ email: to }],
      subject: `Your bill for order ${order.id}`,
      htmlContent: `
        <p>Thank you for dining with us.</p>
        <p>Your order total was <strong>Rs. ${Number(order.total_amount).toFixed(2)}</strong>.</p>
        <p>Please find the bill attached.</p>
      `,
      attachment: [
        {
          name: `bill-${order.id}.pdf`,
          content: pdfBuffer.toString('base64')
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`Brevo email request failed: ${errorText}`);
    error.statusCode = 502;
    throw error;
  }

  return {
    delivered: true,
    to
  };
};

module.exports = {
  sendBillEmail
};
