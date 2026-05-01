const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const { noStore } = require('../utils/http');

// Setup Folder Tujuan
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'thumbnails');

// Defensive Programming: Buat folder jika belum ada
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Sanitasi: Ganti spasi dengan strip, hapus karakter aneh
        const cleanName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'thumbnail-' + uniqueSuffix + path.extname(cleanName));
    }
});

// Filter File
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format file tidak didukung! Gunakan JPG, PNG, atau WEBP.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
});

// Endpoint POST /api/upload/thumbnail
router.post('/thumbnail', noStore, authenticateToken, upload.single('thumbnail'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Tidak ada file yang diunggah.' });
        }
        
        // Construct Public URL
        const filePath = `/uploads/thumbnails/${req.file.filename}`;

        res.status(201).json({ 
            message: 'Gambar berhasil diunggah.',
            filePath: filePath 
        });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: 'Terjadi kesalahan saat memproses upload.' });
    }
}, (error, req, res, next) => {
    // Error handling khusus Multer
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'Ukuran file maksimal 5MB.' });
        }

        return res.status(400).json({ message: 'Upload file tidak valid.' });
    }

    if (error) {
        return res.status(400).json({ message: 'Format file tidak didukung atau file tidak valid.' });
    } else {
        next();
    }
});

module.exports = router;
