const productModel = require('../models/product.model');

const normalizeCuisineName = (value = '') => value.trim();

const listProducts = async (req, res, next) => {
  try {
    const data = await productModel.listProducts({
      activeOnly: req.query.active === 'true'
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const listCuisines = async (req, res, next) => {
  try {
    const data = await productModel.listCuisines();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createCuisine = async (req, res, next) => {
  try {
    const data = await productModel.createCuisine(normalizeCuisineName(req.body.name));
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const data = await productModel.findById(req.params.id);

    if (!data) {
      const error = new Error('Product not found.');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const cuisine = await productModel.findCuisineByName(req.body.category);

    if (!cuisine) {
      const error = new Error('Select an existing cuisine or create a new one first.');
      error.statusCode = 400;
      throw error;
    }

    const data = await productModel.createProduct(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    if (req.body.category) {
      const cuisine = await productModel.findCuisineByName(req.body.category);

      if (!cuisine) {
        const error = new Error('Select an existing cuisine or create a new one first.');
        error.statusCode = 400;
        throw error;
      }
    }

    const data = await productModel.updateProduct(req.params.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const data = await productModel.deleteProduct(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProducts,
  listCuisines,
  createCuisine,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};