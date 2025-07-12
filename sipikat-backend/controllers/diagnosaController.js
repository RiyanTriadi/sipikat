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

    // Validasi input
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
        // PERBAIKAN 1: Ambil juga nama gejala dari database
        const [allGejala] = await pool.execute('SELECT id, gejala, mb FROM tb_gejala');

        // Kalkulasi Certainty Factor
        const {
            total_cf,
            kategori,
            solusi
        } = calculateCF(selectedSymptoms, allGejala);

        const created_at = new Date();

        // Simpan hasil diagnosa ke database
        const [result] = await pool.execute(
            'INSERT INTO tb_diagnosa (nama, jenis_kelamin, usia, alamat, total_cf, kategori, solusi, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nama, jenis_kelamin, usia, alamat, total_cf, kategori, solusi, created_at]
        );

        // PERBAIKAN 2: Gabungkan nama gejala ke dalam `selectedSymptoms` untuk dikirim ke frontend
        const gejala_terpilih_dengan_nama = selectedSymptoms.map(symptom => {
            const detailGejala = allGejala.find(g => g.id === symptom.id);
            return {
                ...symptom,
                gejala: detailGejala ? detailGejala.gejala : 'Gejala tidak ditemukan',
            };
        });

        // PERBAIKAN 3: Sertakan objek 'user' dan 'gejala_terpilih' dalam respon JSON
        res.status(201).json({
            message: 'Diagnosis complete!',
            diagnosis_id: result.insertId,
            total_cf,
            kategori,
            solusi,
            user: { // Objek user ditambahkan di sini
                nama,
                jenis_kelamin,
                usia,
                alamat
            },
            gejala_terpilih: gejala_terpilih_dengan_nama // Gejala terpilih ditambahkan di sini
        });

    } catch (err) {
        console.error('Error in diagnoseUser:', err.message);
        res.status(500).json({
            message: 'Server Error'
        });
    }
};


// --- FUNGSI LAINNYA (TETAP SAMA) ---

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