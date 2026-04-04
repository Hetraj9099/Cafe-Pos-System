const TABLE_STATUS = {
  AVAILABLE: 'Available',
  OCCUPIED: 'Occupied',
  COOKING: 'Cooking',
  READY: 'Ready',
  RESERVED: 'Reserved',
  PAID: 'Paid'
};

module.exports = {
  DEFAULT_API_PREFIX: '/api',
  ORDER_STATUS: ['created', 'sent', 'preparing', 'completed', 'paid'],
  ORDER_SOURCES: ['POS', 'QR', 'RESERVATION'],
  PAYMENT_METHODS: ['cash', 'card', 'upi'],
  PAYMENT_STATUS: ['pending', 'completed'],
  RESERVATION_STATUS: ['reserved', 'completed', 'cancelled'],
  ATTENDANCE_STATUS: ['present', 'absent', 'leave'],
  USER_ROLES: ['admin', 'staff'],
  TABLE_STATUS,
  TABLE_STATUS_VALUES: Object.values(TABLE_STATUS)
};
