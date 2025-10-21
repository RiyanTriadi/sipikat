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
    const { id, gejala, mb } = req.body;
    
    // Validasi input
    if (!id || !gejala || mb === undefined) {
        return res.status(400).json({
            message: 'Mohon masukkan semua field (id, gejala, mb)'
        });
    }

    // Validasi format ID (harus dimulai dengan G dan diikuti angka)
    const idPattern = /^G\d+$/;
    if (!idPattern.test(id)) {
        return res.status(400).json({
            message: 'Format ID tidak valid. ID harus dimulai dengan huruf G diikuti angka (contoh: G1, G10)'
        });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Cek apakah ID sudah digunakan
        const [existingGejala] = await connection.execute(
            'SELECT id FROM tb_gejala WHERE id = ?',
            [id]
        );

        if (existingGejala.length > 0) {
            await connection.rollback();
            return res.status(409).json({
                message: `ID ${id} sudah digunakan. Silakan gunakan ID lain.`
            });
        }

        await connection.execute(
            'INSERT INTO tb_gejala (id, gejala, mb) VALUES (?, ?, ?)',
            [id, gejala, mb]
        );

        await connection.commit();

        res.status(201).json({
            message: 'Gejala berhasil ditambahkan',
            id: id
        });
    } catch (err) {
        await connection.rollback();
        console.error(err.message);
        
        // Handle duplicate entry error
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: `ID ${id} sudah digunakan. Silakan gunakan ID lain.`
            });
        }
        
        res.status(500).json({
            message: 'Server Error'
        });
    } finally {
        connection.release();
    }
};

exports.updateGejala = async (req, res) => {
    const oldId = req.params.id;
    const { id: newId, gejala, mb } = req.body;
    
    if (!newId || gejala === undefined || mb === undefined) {
        return res.status(400).json({
            message: 'Mohon berikan field id, gejala dan mb untuk diupdate.'
        });
    }

    // Validasi format ID
    const idPattern = /^G\d+$/;
    if (!idPattern.test(newId)) {
        return res.status(400).json({
            message: 'Format ID tidak valid. ID harus dimulai dengan huruf G diikuti angka (contoh: G1, G10)'
        });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Cek apakah gejala dengan oldId ada
        const [existingGejala] = await connection.execute(
            'SELECT id FROM tb_gejala WHERE id = ?',
            [oldId]
        );

        if (existingGejala.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                message: 'Gejala not found'
            });
        }

        // Jika ID berubah, cek apakah ID baru sudah digunakan
        if (oldId !== newId) {
            const [duplicateCheck] = await connection.execute(
                'SELECT id FROM tb_gejala WHERE id = ?',
                [newId]
            );

            if (duplicateCheck.length > 0) {
                await connection.rollback();
                return res.status(409).json({
                    message: `ID ${newId} sudah digunakan. Silakan gunakan ID lain.`
                });
            }

            // Update dengan ID baru
            await connection.execute(
                'UPDATE tb_gejala SET id = ?, gejala = ?, mb = ? WHERE id = ?',
                [newId, gejala, mb, oldId]
            );
        } else {
            // Update tanpa mengubah ID
            await connection.execute(
                'UPDATE tb_gejala SET gejala = ?, mb = ? WHERE id = ?',
                [gejala, mb, oldId]
            );
        }

        await connection.commit();

        res.json({
            message: 'Gejala berhasil diupdate',
            id: newId
        });
    } catch (err) {
        await connection.rollback();
        console.error(err.message);
        
        // Handle duplicate entry error
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: `ID ${newId} sudah digunakan. Silakan gunakan ID lain.`
            });
        }
        
        res.status(500).json({
            message: 'Server Error'
        });
    } finally {
        connection.release();
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