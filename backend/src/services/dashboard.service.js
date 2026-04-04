const staffModel = require('../models/staff.model');
const attendanceModel = require('../models/attendance.model');

const getOverview = async () => ({
  message: 'Dashboard overview service placeholder',
  resources: [staffModel.tableName, attendanceModel.tableName]
});

module.exports = {
  getOverview
};
