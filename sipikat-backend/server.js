const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const gejalaRoutes = require('./routes/gejala');
const diagnosaRoutes = require('./routes/diagnosa');
const artikelRoutes = require('./routes/artikel');
const userRoutes = require('./routes/user');
const aktivitasRoutes = require('./routes/aktivitas');
const uploadRoutes = require('./routes/upload');
const solusiRoutes = require('./routes/solusi');
const pageRoutes = require('./routes/page');

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/gejala', gejalaRoutes);
app.use('/api/diagnosa', diagnosaRoutes);
app.use('/api/artikel', artikelRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/aktivitas', aktivitasRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/solusi', solusiRoutes);
app.use('/api/pages', pageRoutes);

app.get('/', (req, res) => {
  res.send('Expert System Backend API is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));