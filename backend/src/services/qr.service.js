const QRCode = require('qrcode');
const env = require('../config/env');

const generateQrPayload = async ({ token }) => {
  const baseUrl = env.clientBaseUrl.replace(/\/$/, '');
  const url = `${baseUrl}/?qr=${encodeURIComponent(token)}`;
  const legacyUrl = `${baseUrl}/order/${token}`;
  const dataUrl = await QRCode.toDataURL(url, {
    margin: 1,
    width: 280
  });

  return {
    token,
    url,
    legacyUrl,
    dataUrl
  };
};

module.exports = {
  generateQrPayload
};
