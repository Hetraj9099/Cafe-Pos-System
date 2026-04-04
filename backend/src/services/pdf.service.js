const PDFDocument = require('pdfkit');

const currency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const generateBillPdfBuffer = ({ order, payments }) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    doc.fontSize(20).text('POS Cafe Bill', { align: 'center' });
    doc.moveDown();
    doc.fontSize(11).text(`Order ID: ${order.id}`);
    doc.text(`Source: ${order.source}`);
    doc.text(`Status: ${order.status}`);
    doc.text(`Customer: ${order.customer_name || 'Walk-in'}`);
    doc.text(`Table: ${order.table_number || '-'}`);
    doc.text(`Created At: ${new Date(order.created_at).toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(14).text('Items');
    doc.moveDown(0.5);

    order.items.forEach((item) => {
      doc
        .fontSize(11)
        .text(
          `${item.product_name} x ${item.quantity}  |  ${currency(item.unit_price)}  |  ${currency(
            item.total_price
          )}`
        );
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total: ${currency(order.total_amount)}`);
    doc.moveDown();
    doc.fontSize(12).text('Payments');

    payments.forEach((payment) => {
      doc
        .fontSize(11)
        .text(
          `${payment.payment_method.toUpperCase()} - ${currency(payment.amount)} on ${new Date(
            payment.paid_at
          ).toLocaleString()}`
        );
    });

    doc.end();
  });
};

module.exports = {
  generateBillPdfBuffer
};
