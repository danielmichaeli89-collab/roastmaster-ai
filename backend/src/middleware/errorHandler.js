export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.message === 'Unauthorized') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (err.message === 'Not found') {
    return res.status(404).json({ error: 'Resource not found' });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  return res.status(500).json({ error: 'Internal server error' });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Route not found' });
};
