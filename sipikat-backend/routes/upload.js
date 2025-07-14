// routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Pastikan direktori uploads ada
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'thumbnails');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi Multer untuk penyimpanan file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Buat nama file unik: timestamp + nama asli file
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter file untuk hanya menerima gambar
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar (JPEG, PNG, GIF) yang diizinkan!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Batas 5MB
    },
    fileFilter: fileFilter
});

// Endpoint untuk upload thumbnail
// Lindungi dengan autentikasi
router.post('/thumbnail', authenticateToken, upload.single('thumbnail'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Tidak ada file yang diunggah.' });
    }
    
    // Kirim kembali path URL yang dapat diakses publik
    // Contoh: /uploads/thumbnails/thumbnail-1678886400000.png
    const filePath = `/uploads/thumbnails/${req.file.filename}`;
    res.status(201).json({ 
        message: 'Gambar berhasil diunggah.',
        filePath: filePath 
    });
}, (error, req, res, next) => {
    // Tangani error dari multer
    res.status(400).json({ message: error.message });
});

module.exports = router;
