const pool = require('../config/db');
const calculateCF = require('../utils/cfCalculator');

exports.diagnoseUser = async (req, res) => {
    const {
        nama,
        jenis_kelamin,
        usia,
        alamat,
        selectedSymptoms
    } = req.body;

    if (!nama || !jenis_kelamin || !usia || !alamat || !selectedSymptoms || !Array.isArray(selectedSymptoms) || selectedSymptoms.length === 0) {
        return res.status(400).json({
            message: 'Mohon berikan semua data pengguna dan gejala yang dipilih.'
        });
    }

    for (const symptom of selectedSymptoms) {
        if (symptom.id === undefined || symptom.cf_user === undefined) {
            return res.status(400).json({
                message: 'Setiap gejala yang dipilih harus memiliki "id" dan "cf_user".'
            });
        }
    }

    try {
        const [allGejala] = await pool.execute('SELECT id, gejala, mb FROM tb_gejala');
        const [allSolusi] = await pool.execute('SELECT kategori, solusi FROM tb_solusi');

        const {
            total_cf,
            kategori,
            solusi
        } = calculateCF(selectedSymptoms, allGejala, allSolusi);

        const created_at = new Date();

        const [result] = await pool.execute(
            'INSERT INTO tb_diagnosa (nama, jenis_kelamin, usia, alamat, total_cf, kategori, solusi, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nama, jenis_kelamin, usia, alamat, total_cf, kategori, solusi, created_at]
        );

        const diagnosaId = result.insertId;

        const gejalaTerpilihDenganNama = selectedSymptoms.map(symptom => {
            const fullGejala = allGejala.find(g => g.id === symptom.id);
            return {
                id: symptom.id,
                gejala: fullGejala ? fullGejala.gejala : 'Nama Gejala Tidak Ditemukan',
                cf_user: symptom.cf_user
            };
        });

        res.status(201).json({
            message: 'Diagnosa berhasil disimpan',
            id: diagnosaId,
            user: {
                nama,
                jenis_kelamin,
                usia,
                alamat
            },
            gejala_terpilih: gejalaTerpilihDenganNama,
            total_cf,
            kategori,
            solusi,
            created_at,
        });
    } catch (err) {
        console.error('Error in diagnoseUser:', err.message);
        res.status(500).json({
            message: 'Server Error',
            error: err.message
        });
    }
};

exports.getAllDiagnosa = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM tb_diagnosa ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error('Error in getAllDiagnosa:', err.message);
        res.status(500).json({
            message: 'Server Error'
        });
    }
};

exports.getDiagnosaById = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM tb_diagnosa WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Diagnosis record not found'
            });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error in getDiagnosaById:', err.message);
        res.status(500).json({
            message: 'Server Error'
        });
    }
};

exports.updateDiagnosa = async (req, res) => {
    const {
        nama,
        jenis_kelamin,
        usia,
        alamat,
        total_cf,
        kategori,
        solusi
    } = req.body;
    try {
        const [result] = await pool.execute(
            'UPDATE tb_diagnosa SET nama = ?, jenis_kelamin = ?, usia = ?, alamat = ?, total_cf = ?, kategori = ?, solusi = ? WHERE id = ?',
            [nama, jenis_kelamin, usia, alamat, total_cf, kategori, solusi, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Diagnosis record not found'
            });
        }
        res.json({
            message: 'Diagnosis record updated successfully'
        });
    } catch (err) {
        console.error('Error in updateDiagnosa:', err.message);
        res.status(500).json({
            message: 'Server Error'
        });
    }
};

exports.deleteDiagnosa = async (req, res) => {
    try {
        const [result] = await pool.execute('DELETE FROM tb_diagnosa WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Diagnosis record not found'
            });
        }
        res.json({
            message: 'Diagnosis record deleted successfully'
        });
    } catch (err) {
        console.error('Error in deleteDiagnosa:', err.message);
        res.status(500).json({
            message: 'Server Error'
        });
    }
};