const productModel = require('../models/product.model');

const listProducts = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Product listing controller placeholder',
      resource: productModel.tableName
    }
  });
};

const getProductById = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Product details controller placeholder',
      id: req.params.id
    }
  });
};

const createProduct = async (req, res) => {
  res.status(201).json({
    success: true,
    data: {
      message: 'Product creation controller placeholder'
    }
  });
};

const updateProduct = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Product update controller placeholder',
      id: req.params.id
    }
  });
};

const deleteProduct = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Product deletion controller placeholder',
      id: req.params.id
    }
  });
};

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
