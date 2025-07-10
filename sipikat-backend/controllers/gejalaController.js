// controllers/gejalaController.js
const pool = require('../config/db');

exports.getAllGejalaForAdmin = async (req, res) => {
   try {
     const [rows] = await pool.execute('SELECT id, gejala, mb FROM tb_gejala');
     res.json(rows);
   } catch (err) {
     console.error(err.message);
     res.status(500).json({ message: 'Server Error' });
   }
};


exports.getAllGejala = async (req, res) => {
   try {
     const [rows] = await pool.execute('SELECT id, gejala FROM tb_gejala');
     res.json(rows);
   } catch (err) {
     console.error(err.message);
     res.status(500).json({ message: 'Server Error' });
   }
};

exports.getGejalaById = async (req, res) => {
   try {
     const [rows] = await pool.execute('SELECT id, gejala, mb FROM tb_gejala WHERE id = ?', [req.params.id]);
     if (rows.length === 0) {
       return res.status(404).json({ message: 'Gejala not found' });
     }
     res.json(rows[0]);
   } catch (err) {
     console.error(err.message);
     res.status(500).json({ message: 'Server Error' });
   }
};

exports.addGejala = async (req, res) => {  
  const { gejala, mb } = req.body;
  if (!gejala || mb === undefined) { 
    return res.status(400).json({ message: 'Mohon masukkan semua field (gejala, mb)' });  
  }  
  try {  
    const [result] = await pool.execute(  
      'INSERT INTO tb_gejala (gejala, mb) VALUES (?, ?)',  
      [gejala, mb]  
    );  
    res.status(201).json({ message: 'Gejala berhasil ditambahkan', id: result.insertId });  
  } catch (err) {  
    console.error(err.message);  
    res.status(500).json({ message: 'Server Error' });  
  }  
};  

exports.updateGejala = async (req, res) => {  
  const { gejala, mb } = req.body; 
  if (gejala === undefined || mb === undefined) {  
    return res.status(400).json({ message: 'Mohon berikan field gejala dan mb untuk diupdate.' });  
  }  
  try {  
    const [result] = await pool.execute(  
      'UPDATE tb_gejala SET gejala = ?, mb = ? WHERE id = ?',  
      [gejala, mb, req.params.id]  
    );  
    if (result.affectedRows === 0) {  
      return res.status(404).json({ message: 'Gejala not found' });  
    }  
    res.json({ message: 'Gejala berhasil diupdate' });  
  } catch (err) {  
    console.error(err.message);  
    res.status(500).json({ message: 'Server Error' });  
  }  
};  

exports.deleteGejala = async (req, res) => {  
  try {  
    const [result] = await pool.execute('DELETE FROM tb_gejala WHERE id = ?', [req.params.id]);  
    if (result.affectedRows === 0) {  
      return res.status(404).json({ message: 'Gejala not found' });  
    }  
    res.json({ message: 'Gejala berhasil dihapus' });  
  } catch (err) {  
    console.error(err.message);  
    res.status(500).json({ message: 'Server Error' });  
  }  
};

