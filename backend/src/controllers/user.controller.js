const userModel = require('../models/user.model');

const listUsers = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'User listing controller placeholder',
      resource: userModel.tableName
    }
  });
};

const getUserById = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'User details controller placeholder',
      id: req.params.id
    }
  });
};

const createUser = async (req, res) => {
  res.status(201).json({
    success: true,
    data: {
      message: 'User creation controller placeholder'
    }
  });
};

const updateUser = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'User update controller placeholder',
      id: req.params.id
    }
  });
};

const deleteUser = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'User deletion controller placeholder',
      id: req.params.id
    }
  });
};

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
