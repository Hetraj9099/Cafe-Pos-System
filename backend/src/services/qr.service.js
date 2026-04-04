const QRCode = require('qrcode');
const env = require('../config/env');

const generateQrPayload = async ({ token }) => {
  const url = `${env.clientBaseUrl.replace(/\/$/, '')}/order/${token}`;
  const dataUrl = await QRCode.toDataURL(url, {
    margin: 1,
    width: 280
  });

  return {
    token,
    url,
    dataUrl
  };
};

module.exports = {
  generateQrPayload
};
