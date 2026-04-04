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

      if (rules.minLength && typeof value === 'string' && value.trim().length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters.`);
      }

      if (rules.maxLength && typeof value === 'string' && value.trim().length > rules.maxLength) {
        errors.push(`${field} must be at most ${rules.maxLength} characters.`);
      }

      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value.trim())) {
        errors.push(rules.patternMessage || `${field} format is invalid.`);
      }

      if (typeof rules.validate === 'function') {
        const result = rules.validate(value, req.body);
        if (typeof result === 'string') {
          errors.push(result);
        }
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