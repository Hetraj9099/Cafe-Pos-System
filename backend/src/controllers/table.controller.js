const tableModel = require('../models/table.model');

const listTables = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Table listing controller placeholder',
      resource: tableModel.tableName
    }
  });
};

const getTableById = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Table details controller placeholder',
      id: req.params.id
    }
  });
};

const createTable = async (req, res) => {
  res.status(201).json({
    success: true,
    data: {
      message: 'Table creation controller placeholder'
    }
  });
};

const updateTable = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Table update controller placeholder',
      id: req.params.id
    }
  });
};

const deleteTable = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Table deletion controller placeholder',
      id: req.params.id
    }
  });
};

module.exports = {
  listTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable
};
