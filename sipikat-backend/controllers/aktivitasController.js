// controllers/aktivitasController.js
const pool = require('../config/db');

exports.getRecentActivities = async (req, res) => {
    try {
        const query = `
            (SELECT id, nama, NULL as judul, created_at, 'diagnosa' as type FROM tb_diagnosa)
            UNION ALL
            (SELECT id, NULL as nama, judul, created_at, 'artikel' as type FROM tb_artikel)
            UNION ALL
            (SELECT id, name as nama, NULL as judul, created_at, 'user' as type FROM tb_user)
            ORDER BY created_at DESC
            LIMIT 5;
        `;
        
        const [activities] = await pool.execute(query);
        
        res.json(activities);

    } catch (err) {
        console.error('Error fetching recent activities:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};