const { query } = require('../config/db');

const toSnakeCase = (value) =>
  value.replace(/[A-Z]/g, (character) => `_${character.toLowerCase()}`);

const buildUpdateClause = (payload = {}, startIndex = 1) => {
  const entries = Object.entries(payload).filter(([, value]) => value !== undefined);
  const values = entries.map(([, value]) => value);
  const setClause = entries
    .map(([key], index) => `${toSnakeCase(key)} = $${index + startIndex}`)
    .join(', ');

  return {
    setClause,
    values
  };
};

module.exports = {
  query,
  buildUpdateClause
};
