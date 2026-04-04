const tableModel = require('../models/table.model');
const generateToken = require('../utils/generateToken');
const { TABLE_STATUS } = require('../utils/constants');
const qrService = require('../services/qr.service');

const mapTableStatus = (orderStatus, hasReservation) => {
  if (hasReservation && !orderStatus) {
    return TABLE_STATUS.RESERVED;
  }

  switch (orderStatus) {
    case 'created':
      return TABLE_STATUS.OCCUPIED;
    case 'sent':
    case 'preparing':
      return TABLE_STATUS.COOKING;
    case 'completed':
      return TABLE_STATUS.READY;
    case 'paid':
      return TABLE_STATUS.PAID;
    default:
      return TABLE_STATUS.AVAILABLE;
  }
};

const buildTableStatuses = async () => {
  const [tables, latestOrders, reservations] = await Promise.all([
    tableModel.listTables(),
    tableModel.getLatestOrdersByTable(),
    tableModel.getActiveReservations(new Date().toISOString(), new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString())
  ]);

  const orderByTable = new Map(latestOrders.map((order) => [order.table_id, order]));
  const reservedTables = new Set(reservations.map((reservation) => reservation.table_id));

  return tables.map((table) => {
    const latestOrder = orderByTable.get(table.id);
    return {
      ...table,
      status: mapTableStatus(latestOrder?.status, reservedTables.has(table.id)),
      latest_order: latestOrder || null
    };
  });
};

const listTables = async (req, res, next) => {
  try {
    const data = await buildTableStatuses();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getTableById = async (req, res, next) => {
  try {
    const statuses = await buildTableStatuses();
    const data = statuses.find((table) => table.id === req.params.id);

    if (!data) {
      const error = new Error('Table not found.');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createTable = async (req, res, next) => {
  try {
    const table = await tableModel.createTable({
      tableNumber: req.body.tableNumber,
      qrToken: generateToken('table'),
      seats: req.body.seats
    });

    const qr = await qrService.generateQrPayload({ token: table.qr_token });
    res.status(201).json({ success: true, data: { ...table, qr } });
  } catch (error) {
    next(error);
  }
};

const updateTable = async (req, res, next) => {
  try {
    const data = await tableModel.updateTable(req.params.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getTableStatus = async (req, res, next) => {
  try {
    const statuses = await buildTableStatuses();
    const data = statuses.find((table) => table.id === req.params.id);

    if (!data) {
      const error = new Error('Table not found.');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: { id: data.id, status: data.status } });
  } catch (error) {
    next(error);
  }
};

const getTableByToken = async (req, res, next) => {
  try {
    const table = await tableModel.findByToken(req.params.token);

    if (!table) {
      const error = new Error('Table not found for this QR code.');
      error.statusCode = 404;
      throw error;
    }

    const qr = await qrService.generateQrPayload({ token: table.qr_token });
    res.status(200).json({ success: true, data: { ...table, qr } });
  } catch (error) {
    next(error);
  }
};

const getTableQr = async (req, res, next) => {
  try {
    const table = await tableModel.findById(req.params.id);

    if (!table) {
      const error = new Error('Table not found.');
      error.statusCode = 404;
      throw error;
    }

    const data = await qrService.generateQrPayload({ token: table.qr_token });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listTables,
  getTableById,
  createTable,
  updateTable,
  getTableStatus,
  getTableByToken,
  getTableQr
};