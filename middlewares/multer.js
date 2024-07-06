
const multer = require('multer');
const path = require('path');

const maxSize = 1 * 1000 * 1000; // 1MB in bytes

// Set storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize upload
module.exports.upload = multer({
    storage: storage,
    limits: { fileSize: maxSize }, // 1MB limit
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).single('profileImg');

module.exports.uploadFiles = multer({
    storage: storage,
    limits: { fileSize: maxSize }, // 1MB limit
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).array('files');

// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    console.log("extension: ", path.extname(file.originalname).toLowerCase());
    console.log("mimetype: ", file.mimetype)

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Invalid file type.. should be in jpg/jpeg/png format');
    }
}

// module.exports.checkFileSizeMiddleware = (req, res, next) => {
//     const fileSize = parseInt(req.headers['content-length']);
//     console.log(fileSize)
//     if (fileSize > maxSize) {
//         return res.status(400).json({
//             success: false,
//             message: 'Error uploading image',
//             error: 'Error: File size must be less than 1MB (1000000KB)'
//         });
//     }
//     next();
// };
