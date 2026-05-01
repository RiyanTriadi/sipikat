const pool = require('../config/db');
const calculateCF = require('../utils/cfCalculator');
const { sendErrorResponse, applyNoStore } = require('../utils/http');

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

        // === NORMALIZATION: Ensure ID format is 'G1', 'G2', etc. ===
        const normalizedSymptoms = selectedSymptoms.map(symptom => {
            let normalizedId = symptom.id;
            
            // If ID is numeric (1, 2, 3), convert to 'G1', 'G2', 'G3'
            if (typeof symptom.id === 'number') {
                normalizedId = 'G' + symptom.id;
            } 
            // If ID is string but lowercase ('g1', 'g2'), convert to uppercase
            else if (typeof symptom.id === 'string') {
                normalizedId = symptom.id.toUpperCase();
                // If doesn't start with 'G', add it
                if (!normalizedId.startsWith('G')) {
                    normalizedId = 'G' + normalizedId;
                }
            }
            
            return {
                ...symptom,
                id: normalizedId
            };
        });

        const {
            total_cf,
            kategori,
            solusi
        } = calculateCF(normalizedSymptoms, allGejala, allSolusi);

        const created_at = new Date();

        // Enrich selected symptoms with full gejala data
        const gejalaTerpilihDenganNama = normalizedSymptoms.map(symptom => {
            const fullGejala = allGejala.find(g => g.id === symptom.id);
            return {
                id: symptom.id,
                gejala: fullGejala ? fullGejala.gejala : 'Nama Gejala Tidak Ditemukan',
                cf_user: symptom.cf_user
            };
        });

        // Convert to JSON string for storage
        const gejalaJSON = JSON.stringify(gejalaTerpilihDenganNama);

        const [result] = await pool.execute(
            'INSERT INTO tb_diagnosa (nama, jenis_kelamin, usia, alamat, gejala_terpilih, total_cf, kategori, solusi, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nama, jenis_kelamin, usia, alamat, gejalaJSON, total_cf, kategori, solusi, created_at]
        );

        const diagnosaId = result.insertId;
        applyNoStore(res);

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
        sendErrorResponse(res, err, { publicMessage: 'Server Error' });
    }
};

exports.getAllDiagnosa = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM tb_diagnosa ORDER BY created_at DESC');
        
        // Parse gejala_terpilih JSON string back to object
        const parsedRows = rows.map(row => ({
            ...row,
            gejala_terpilih: row.gejala_terpilih ? JSON.parse(row.gejala_terpilih) : []
        }));
        
        res.json(parsedRows);
    } catch (err) {
        console.error('Error in getAllDiagnosa:', err.message);
        sendErrorResponse(res, err, { publicMessage: 'Server Error' });
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
        
        // Parse gejala_terpilih JSON string back to object
        const diagnosa = {
            ...rows[0],
            gejala_terpilih: rows[0].gejala_terpilih ? JSON.parse(rows[0].gejala_terpilih) : []
        };
        
        res.json(diagnosa);
    } catch (err) {
        console.error('Error in getDiagnosaById:', err.message);
        sendErrorResponse(res, err, { publicMessage: 'Server Error' });
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
        sendErrorResponse(res, err, { publicMessage: 'Server Error' });
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
        sendErrorResponse(res, err, { publicMessage: 'Server Error' });
    }
};
