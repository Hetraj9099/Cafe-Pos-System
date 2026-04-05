const env = require('../config/env');

const sendBillEmail = async ({ to, order, pdfBuffer }) => {
  if (!env.brevoApiKey) {
    const error = new Error('Bill email service is not configured yet.');
    error.statusCode = 503;
    throw error;
  }

  if (!to) {
    const error = new Error('Customer email address is required to send the bill.');
    error.statusCode = 400;
    throw error;
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': env.brevoApiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: {
        name: env.brevoSenderName,
        email: env.brevoSenderEmail
      },
      to: [{ email: to }],
      subject: `Your Bill - Order #${order.id}`,
      textContent: 'Thanks for your order. Your bill is attached.',
      attachment: [
        {
          name: `bill-${order.id}.pdf`,
          content: pdfBuffer.toString('base64')
        }
      ]
    })
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload.message || 'Unable to send the bill email right now.');
    error.statusCode = response.status || 502;
    throw error;
  }

  return {
    message: `Bill emailed successfully to ${to}.`
  };
};

module.exports = {
  sendBillEmail
};
