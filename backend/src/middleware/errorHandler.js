export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Ensure response hasn't already been sent
  if (res.headersSent) {
    return next(err);
  }

  // Handle specific error types
  if (err.message === 'Unauthorized') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (err.message === 'Not found') {
    return res.status(404).json({ error: 'Resource not found' });
  }

  // Handle database errors
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(503).json({ error: 'Database connection lost' });
  }

  if (err.code === 'ER_CON_COUNT_ERROR') {
    return res.status(503).json({ error: 'Database connection error' });
  }

  if (err.code === 'ER_GET_CONNECTION_TIMEOUT') {
    return res.status(503).json({ error: 'Database connection timeout' });
  }

  // Handle validation errors
  if (err.statusCode === 400) {
    return res.status(400).json({ error: err.message || 'Bad request' });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message || 'An error occurred' });
  }

  // Default error response
  return res.status(500).json({ error: 'Internal server error' });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Route not found' });
};
