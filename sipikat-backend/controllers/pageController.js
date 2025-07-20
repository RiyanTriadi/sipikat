const pool = require('../config/db');

exports.getPageBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const [rows] = await pool.execute('SELECT title, content, updated_at FROM tb_pages WHERE slug = ?', [slug]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Halaman tidak ditemukan' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error("Error in getPageBySlug:", err.message);
        res.status(500).send('Server Error');
    }
};
