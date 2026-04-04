const customerModel = require('../models/customer.model');

const listCustomers = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Customer listing controller placeholder',
      resource: customerModel.tableName
    }
  });
};

const getCustomerById = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Customer details controller placeholder',
      id: req.params.id
    }
  });
};

const createCustomer = async (req, res) => {
  res.status(201).json({
    success: true,
    data: {
      message: 'Customer creation controller placeholder'
    }
  });
};

const updateCustomer = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Customer update controller placeholder',
      id: req.params.id
    }
  });
};

const deleteCustomer = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Customer deletion controller placeholder',
      id: req.params.id
    }
  });
};

module.exports = {
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
