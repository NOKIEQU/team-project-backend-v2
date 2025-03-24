const { MulterError } = require('multer');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof MulterError) {
    res.status(400).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = errorHandler;
