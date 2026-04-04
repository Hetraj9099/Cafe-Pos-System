const estimateTime = ({ maxPrepTime = 0, activeOrders = 0 }) => {
  const minutes = Number(maxPrepTime || 0) + Number(activeOrders || 0) * 2;

  return {
    minutes,
    label: `${minutes} min`
  };
};

module.exports = estimateTime;
