const validationMiddleware = (schema = {}) => {
  return (req, res, next) => {
    const errors = [];

    Object.entries(schema).forEach(([field, rules]) => {
      const value = req.body[field];
      const isMissing =
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '');

      if (rules.required && isMissing) {
        errors.push(`${field} is required.`);
        return;
      }

      if (isMissing) {
        return;
      }

      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string.`);
      }

      if (rules.type === 'number' && typeof value !== 'number') {
        errors.push(`${field} must be a number.`);
      }

      if (rules.type === 'array' && !Array.isArray(value)) {
        errors.push(`${field} must be an array.`);
      }

      if (rules.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${field} must be a boolean.`);
      }

      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}.`);
      }
    });

    if (errors.length > 0) {
      const error = new Error('Validation failed.');
      error.statusCode = 400;
      error.details = errors;
      return next(error);
    }

    next();
  };
};

module.exports = validationMiddleware;