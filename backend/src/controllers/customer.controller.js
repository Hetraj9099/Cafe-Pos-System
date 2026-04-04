const customerModel = require('../models/customer.model');

const listCustomers = async (req, res, next) => {
  try {
    const data = await customerModel.listCustomers();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getCustomerById = async (req, res, next) => {
  try {
    const data = await customerModel.findById(req.params.id);

    if (!data) {
      const error = new Error('Customer not found.');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const data = await customerModel.createCustomer(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const data = await customerModel.updateCustomer(req.params.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const data = await customerModel.deleteCustomer(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};