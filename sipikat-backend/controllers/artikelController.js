const pool = require('../config/db');
const slugify = require('slugify');

exports.getAllArticles = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, judul, slug, gambar, created_at FROM tb_artikel ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error in getAllArticles:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getArticleBySlug = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM tb_artikel WHERE slug = ?', [req.params.slug]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error in getArticleBySlug:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.addArticle = async (req, res) => {
  const { judul, konten, gambar } = req.body;
  if (!judul || !konten) {
    return res.status(400).json({ message: 'Please enter title and content' });
  }
  const slug = slugify(judul, { lower: true, strict: true });
  const created_at = new Date();

  try {
    const [result] = await pool.execute(
      'INSERT INTO tb_artikel (judul, konten, slug, gambar, created_at) VALUES (?, ?, ?, ?, ?)',
      [judul, konten, slug, gambar, created_at]
    );
    res.status(201).json({ message: 'Article added successfully', id: result.insertId, slug });
  } catch (err) {
    console.error('Error in addArticle:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateArticle = async (req, res) => {
  const { judul, konten, gambar } = req.body;
  const { id } = req.params;
  let slug;
  if (judul) {
    slug = slugify(judul, { lower: true, strict: true });
  }

  try {
    let query = 'UPDATE tb_artikel SET';
    const params = [];
    if (judul) {
      query += ' judul = ?, slug = ?,';
      params.push(judul, slug);
    }
    if (konten) {
      query += ' konten = ?,';
      params.push(konten);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'gambar')) {
      query += ' gambar = ?,';
      params.push(gambar);
    }
    query = query.slice(0, -1); 
    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json({ message: 'Article updated successfully' });
  } catch (err) {
    console.error('Error in updateArticle:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM tb_artikel WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json({ message: 'Article deleted successfully' });
  } catch (err) {
    console.error('Error in deleteArticle:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};