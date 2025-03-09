const multer = require('multer');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve('./');

// Define upload paths
const uploadPaths = {
  avatar: path.join(rootDir, 'public', 'images', 'avatars'),
  product: path.join(rootDir, 'public', 'images', 'temp'),
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'avatar') {
      fs.mkdirSync(uploadPaths.avatar, { recursive: true });
      cb(null, uploadPaths.avatar);
    } else if (file.fieldname === 'product') {
      fs.mkdirSync(uploadPaths.product, { recursive: true });
      cb(null, uploadPaths.product);
    }
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
