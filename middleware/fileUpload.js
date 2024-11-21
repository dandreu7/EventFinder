const multer = require('multer'); // Multer for file uploads

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images'); // Destination folder for uploaded images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Naming the file with a timestamp
    }
});
//const upload = multer({ storage: storage });

// File Filter may need to be added in future
exports.upload = multer({storage,
                        limits:{fileSize: 4*1024*1024}
});