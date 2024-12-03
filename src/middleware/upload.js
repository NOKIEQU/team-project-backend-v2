const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'avatar') {
      cb(null, 'public/images/avatars');
    } else if (file.fieldname === 'product') {
      cb(null, 'public/images/products');
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

module.exports = upload;

