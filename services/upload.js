const multer = require("multer");
const mimeType = [
    'image/jpg',
    'image/jpeg',
    'image/png',
];

const storageProfile = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/assets/img/uploads/profilePic');
    },
    filename: function (req, file, cb) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + "." + extension);
    }
});

const storageGame = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/assets/img/uploads/gamePic'); // Nouveau dossier pour les images de jeu
    },
    filename: function (req, file, cb) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + "." + extension);
    }
});

// Exporter les deux uploaders
const uploadProfile = multer({
    storage: storageProfile,
    fileFilter: function (req, file, cb) {
        if (!mimeType.includes(file.mimetype)) {
            req.multerError = true;
            return cb(null, false);
        }
        cb(null, true);
    }
});

const uploadGame = multer({
    storage: storageGame,
    fileFilter: function (req, file, cb) {
        if (!mimeType.includes(file.mimetype)) {
            req.multerError = true;
            return cb(null, false);
        }
        cb(null, true);
    }
});

module.exports = { uploadProfile, uploadGame };