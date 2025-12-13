const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');

// Setup Folder Tujuan
// Mundur satu level dari 'routes' ke root project, lalu masuk ke public/uploads/thumbnails
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
router.post('/thumbnail', authenticateToken, upload.single('thumbnail'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Tidak ada file yang diunggah.' });
        }
        
        // Construct Public URL
        // Karena di server.js kita serve '/uploads', maka path dimulai dari /uploads
        // Hati-hati: Jangan gunakan path.join di sini untuk URL karena Windows pakai backslash (\)
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
    if (error) {
        res.status(400).json({ message: error.message });
    } else {
        next();
    }
});

module.exports = router;