const paymentService = require('../services/payment.service');

const listPayments = async (req, res, next) => {
  try {
    const data = await paymentService.listPayments();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const processPayment = async (req, res, next) => {
  try {
    const data = await paymentService.processPayment(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const downloadBill = async (req, res, next) => {
  try {
    const buffer = await paymentService.buildBillBuffer(req.params.orderId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="bill-${req.params.orderId}.pdf"`);
    res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};

const emailBill = async (req, res, next) => {
  try {
    const data = await paymentService.emailBill({
      orderId: req.params.orderId,
      email: req.body.email
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listPayments,
  processPayment,
  downloadBill,
  emailBill
};

import { generateBillPdf } from "../services/pdf.service.js";
import { sendBillEmail } from "../services/email.service.js";

const pdfBuffer = await generateBillPdf(order);

if (customer.email) {
  sendBillEmail({
    to: customer.email,
    pdfBuffer,
    orderId: order.id,
  });
}
