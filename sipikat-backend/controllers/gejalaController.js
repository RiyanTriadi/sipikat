const pool = require('../config/db');

exports.getAllGejalaForAdmin = async (req, res) => {
    try {
        const [rows] = await pool.execute("SELECT id, gejala, mb FROM tb_gejala ORDER BY CAST(SUBSTRING(id, 2) AS UNSIGNED) ASC");
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Server Error'
        });
    }
};

exports.getAllGejala = async (req, res) => {
    try {
        const [rows] = await pool.execute("SELECT id, gejala FROM tb_gejala ORDER BY CAST(SUBSTRING(id, 2) AS UNSIGNED) ASC");
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Server Error'
        });
    }
};

exports.getGejalaById = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, gejala, mb FROM tb_gejala WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Gejala not found'
            });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Server Error'
        });
    }
};

exports.addGejala = async (req, res) => {
    const {
        gejala,
        mb
    } = req.body;
    if (!gejala || mb === undefined) {
        return res.status(400).json({
            message: 'Mohon masukkan semua field (gejala, mb)'
        });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [lastGejala] = await connection.execute("SELECT id FROM tb_gejala ORDER BY CAST(SUBSTRING(id, 2) AS UNSIGNED) DESC LIMIT 1 FOR UPDATE");
        
        let newId;
        if (lastGejala.length > 0) {
            const lastIdNum = parseInt(lastGejala[0].id.substring(1), 10);
            // --- PERBAIKAN ---
            // Memastikan huruf 'G' kapital digunakan saat membuat ID baru.
            newId = 'G' + (lastIdNum + 1);
        } else {
            // Memastikan huruf 'G' kapital digunakan untuk gejala pertama.
            newId = 'G1';
        }

        await connection.execute(
            'INSERT INTO tb_gejala (id, gejala, mb) VALUES (?, ?, ?)',
            [newId, gejala, mb]
        );

        await connection.commit();

        res.status(201).json({
            message: 'Gejala berhasil ditambahkan',
            id: newId
        });
    } catch (err) {
        await connection.rollback();
        console.error(err.message);
        res.status(500).json({
            message: 'Server Error'
        });
    } finally {
        connection.release();
    }
};

exports.updateGejala = async (req, res) => {
    const {
        gejala,
        mb
    } = req.body;
    if (gejala === undefined || mb === undefined) {
        return res.status(400).json({
            message: 'Mohon berikan field gejala dan mb untuk diupdate.'
        });
    }
    try {
        const [result] = await pool.execute(
            'UPDATE tb_gejala SET gejala = ?, mb = ? WHERE id = ?',
            [gejala, mb, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Gejala not found'
            });
        }
        res.json({
            message: 'Gejala berhasil diupdate'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Server Error'
        });
    }
};

exports.deleteGejala = async (req, res) => {
    try {
        const [result] = await pool.execute('DELETE FROM tb_gejala WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Gejala not found'
            });
        }
        res.json({
            message: 'Gejala berhasil dihapus'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Server Error'
        });
    }
};

