const customerModel = require('../models/customer.model');
const preorderModel = require('../models/preorder.model');
const productModel = require('../models/product.model');
const reservationModel = require('../models/reservation.model');
const tableModel = require('../models/table.model');

const listReservations = async () => {
  return reservationModel.listReservations();
};

const getAvailability = async (reservationTime) => {
  const time = reservationTime ? new Date(reservationTime) : new Date();
  const from = new Date(time.getTime() - 60 * 60 * 1000).toISOString();
  const to = new Date(time.getTime() + 60 * 60 * 1000).toISOString();

  const [tables, reservations] = await Promise.all([
    tableModel.listTables(),
    tableModel.getActiveReservations(from, to)
  ]);

  const reservedTableIds = new Set(reservations.map((reservation) => reservation.table_id));

  return tables.map((table) => ({
    ...table,
    is_available: !reservedTableIds.has(table.id)
  }));
};

const createReservation = async (payload) => {
  let customerId = payload.customerId || null;

  if (!customerId && payload.customer) {
    const existingCustomer = await customerModel.findByPhone(payload.customer.phone);
    customerId = existingCustomer
      ? existingCustomer.id
      : (await customerModel.createCustomer(payload.customer)).id;
  }

  if (!customerId) {
    const error = new Error('Customer details are required for a reservation.');
    error.statusCode = 400;
    throw error;
  }

  const table = await tableModel.findById(payload.tableId);

  if (!table) {
    const error = new Error('Table not found.');
    error.statusCode = 404;
    throw error;
  }

  const conflicts = await reservationModel.findConflicts({
    tableId: payload.tableId,
    reservationTime: payload.reservationTime
  });

  if (conflicts.length > 0) {
    const error = new Error('This table is already reserved for the selected time.');
    error.statusCode = 409;
    throw error;
  }

  const reservation = await reservationModel.createReservation({
    customerId,
    tableId: payload.tableId,
    reservationTime: payload.reservationTime
  });

  let preorder = null;

  if (Array.isArray(payload.preorderItems) && payload.preorderItems.length > 0) {
    let totalAmount = 0;

    for (const item of payload.preorderItems) {
      const product = await productModel.findById(item.productId);

      if (!product) {
        const error = new Error('One or more preorder products do not exist.');
        error.statusCode = 400;
        throw error;
      }

      totalAmount += Number(product.price) * Number(item.quantity || 1);
    }

    preorder = await preorderModel.createPreorder({
      reservationId: reservation.id,
      totalAmount,
      paymentStatus: payload.prepaid ? 'completed' : 'pending'
    });

    for (const item of payload.preorderItems) {
      await preorderModel.addPreorderItem({
        preorderId: preorder.id,
        productId: item.productId,
        quantity: Number(item.quantity || 1)
      });
    }
  }

  return {
    reservation,
    preorder,
    availability: await getAvailability(payload.reservationTime)
  };
};

module.exports = {
  listReservations,
  getAvailability,
  createReservation
};
