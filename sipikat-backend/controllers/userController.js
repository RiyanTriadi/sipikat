// controllers/userController.js (for admin user management)
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, name, email FROM tb_user');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, name, email FROM tb_user WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.addUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields (name, email, password)' });
  }
  try {
    let [rows] = await pool.execute('SELECT id FROM tb_user WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const created_at = new Date();

    const [result] = await pool.execute(
      'INSERT INTO tb_user (name, email, password, created_at) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, created_at]
    );
    res.status(201).json({ message: 'User added successfully', id: result.insertId });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.updateUser = async (req, res) => {
  const { name, email, password } = req.body;
  const { id } = req.params;
  let hashedPassword;

  try {
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    let query = 'UPDATE tb_user SET';
    const params = [];
    if (name) {
      query += ' name = ?,';
      params.push(name);
    }
    if (email) {
      query += ' email = ?,';
      params.push(email);
    }
    if (hashedPassword) {
      query += ' password = ?,';
      params.push(hashedPassword);
    }
    query = query.slice(0, -1);
    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM tb_user WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};