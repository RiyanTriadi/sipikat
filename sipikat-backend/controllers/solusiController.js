const pool = require('../config/db');

exports.getAllSolusi = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM tb_solusi ORDER BY created_at ASC');
        res.json(rows);
    } catch (err) {
        console.error('Error in getAllSolusi:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createSolusi = async (req, res) => {
    const { kategori, solusi } = req.body;
    if (!kategori || !solusi) {
        return res.status(400).json({ message: 'Kategori dan Solusi tidak boleh kosong.' });
    }
    try {
        const [result] = await pool.execute(
            'INSERT INTO tb_solusi (kategori, solusi, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
            [kategori, solusi]
        );
        res.status(201).json({ message: 'Solusi berhasil ditambahkan', solusiId: result.insertId });
    } catch (err) {
        console.error('Error in createSolusi:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateSolusi = async (req, res) => {
    const { id } = req.params;
    const { kategori, solusi } = req.body;
    if (!kategori || !solusi) {
        return res.status(400).json({ message: 'Kategori dan Solusi tidak boleh kosong.' });
    }
    try {
        const [result] = await pool.execute(
            'UPDATE tb_solusi SET kategori = ?, solusi = ?, updated_at = NOW() WHERE id = ?',
            [kategori, solusi, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Solusi tidak ditemukan' });
        }
        res.json({ message: 'Solusi berhasil diperbarui' });
    } catch (err) {
        console.error('Error in updateSolusi:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteSolusi = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.execute('DELETE FROM tb_solusi WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Solusi tidak ditemukan' });
        }
        res.json({ message: 'Solusi berhasil dihapus' });
    } catch (err) {
        console.error('Error in deleteSolusi:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};