const dashboardService = require('../services/dashboard.service');

const getOverview = async (req, res, next) => {
  try {
    const data = await dashboardService.getOverview();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview
};
