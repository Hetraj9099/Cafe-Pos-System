const tableModel = require('../models/table.model');
const generateToken = require('../utils/generateToken');
const { TABLE_STATUS, TABLE_STATUS_VALUES } = require('../utils/constants');
const qrService = require('../services/qr.service');

const mapTableStatus = (orderStatus, hasReservation) => {
  if (hasReservation && (!orderStatus || orderStatus === 'created')) {
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
      return TABLE_STATUS.AVAILABLE;
    default:
      return TABLE_STATUS.AVAILABLE;
  }
};

const buildTableStatuses = async () => {
  const reservationWindowStart = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const reservationWindowEnd = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
  const [tables, latestOrders, reservations] = await Promise.all([
    tableModel.listTables(),
    tableModel.getLatestOrdersByTable(),
    tableModel.getActiveReservations(reservationWindowStart, reservationWindowEnd)
  ]);

  const orderByTable = new Map(latestOrders.map((order) => [order.table_id, order]));
  const reservationByTable = new Map(
    reservations
      .sort(
        (left, right) =>
          new Date(left.reservation_time).getTime() - new Date(right.reservation_time).getTime()
      )
      .map((reservation) => [reservation.table_id, reservation])
  );

  return tables.map((table) => {
    const latestOrder = orderByTable.get(table.id);
    const activeReservation = reservationByTable.get(table.id) || null;
    const reservationServed =
      Boolean(activeReservation) &&
      latestOrder?.status === 'paid' &&
      new Date(latestOrder.created_at).getTime() >= new Date(activeReservation.created_at).getTime();
    const effectiveReservation = reservationServed ? null : activeReservation;
    const derivedStatus = mapTableStatus(latestOrder?.status, Boolean(effectiveReservation));
    const manualStatus = TABLE_STATUS_VALUES.includes(table.manual_status)
      ? table.manual_status
      : null;

    return {
      ...table,
      status: manualStatus || derivedStatus,
      derived_status: derivedStatus,
      manual_status: manualStatus,
      latest_order: latestOrder || null,
      active_reservation: effectiveReservation
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
    const updatedTable = await tableModel.updateTable(req.params.id, req.body);

    if (!updatedTable) {
      const error = new Error('Table not found.');
      error.statusCode = 404;
      throw error;
    }

    const statuses = await buildTableStatuses();
    const data = statuses.find((table) => table.id === req.params.id);

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